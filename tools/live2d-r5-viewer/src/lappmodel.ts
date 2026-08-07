/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismDefaultParameterId } from '@framework/cubismdefaultparameterid';
import { CubismModelSettingJson } from '@framework/cubismmodelsettingjson';
import { CubismBreath } from '@framework/effect/cubismbreath';
import { CubismLook } from '@framework/effect/cubismlook';
import { CubismEyeBlink } from '@framework/effect/cubismeyeblink';
import { ICubismModelSetting } from '@framework/icubismmodelsetting';
import { CubismIdHandle } from '@framework/id/cubismid';
import { CubismFramework } from '@framework/live2dcubismframework';
import { CubismMatrix44 } from '@framework/math/cubismmatrix44';
import { CubismUserModel } from '@framework/model/cubismusermodel';
import {
  ACubismMotion,
  BeganMotionCallback,
  FinishedMotionCallback
} from '@framework/motion/acubismmotion';
import { CubismMotion } from '@framework/motion/cubismmotion';
import {
  CubismMotionQueueEntryHandle,
  InvalidMotionQueueEntryHandleValue
} from '@framework/motion/cubismmotionqueuemanager';
import { CubismUpdateScheduler } from '@framework/motion/cubismupdatescheduler';
import { CubismEyeBlinkUpdater } from '@framework/motion/cubismeyeblinkupdater';
import { CubismExpressionUpdater } from '@framework/motion/cubismexpressionupdater';
import { CubismPhysicsUpdater } from '@framework/motion/cubismphysicsupdater';
import { CubismPoseUpdater } from '@framework/motion/cubismposeupdater';
import { CubismLipSyncUpdater } from '@framework/motion/cubismlipsyncupdater';
import { csmRect } from '@framework/type/csmrectf';
import {
  CSM_ASSERT,
  CubismLogError,
  CubismLogInfo
} from '@framework/utils/cubismdebug';

import * as LAppDefine from './lappdefine';
import { LAppPal } from './lapppal';
import { TextureInfo } from './lapptexturemanager';
import { LAppWavFileHandler } from './lappwavfilehandler';
import { CubismMoc } from '@framework/model/cubismmoc';
import { LAppDelegate } from './lappdelegate';
import { LAppSubdelegate } from './lappsubdelegate';

enum LoadStep {
  LoadAssets,
  LoadModel,
  WaitLoadModel,
  LoadExpression,
  WaitLoadExpression,
  LoadPhysics,
  WaitLoadPhysics,
  LoadPose,
  WaitLoadPose,
  SetupEyeBlink,
  SetupBreath,
  LoadUserData,
  WaitLoadUserData,
  SetupEyeBlinkIds,
  SetupLipSyncIds,
  SetupLook,
  SetupLayout,
  LoadMotion,
  WaitLoadMotion,
  CompleteInitialize,
  CompleteSetupModel,
  LoadTexture,
  WaitLoadTexture,
  CompleteSetup
}

/** One mouth pose from the terminal's utterance timeline. */
type MouthKey = { at: number; open: number; form: number };

/** Brow / head / gaze / breath, driven by the punctuation of the line. */
type GestureKey = {
  at: number;
  brow: number;
  tilt: number;
  nod: number;
  gaze: number;
  breath: number;
};

const GESTURE_REST: GestureKey = { at: 0, brow: 0, tilt: 0, nod: 0, gaze: 0, breath: 0 };

/**
 * Linear sample of a time-ordered keyframe track. `cursor` is carried between
 * frames so this stays O(1) in the common case and still catches up in one go
 * after the tab has been throttled.
 */
const sampleTrack = <T extends { at: number }>(
  track: T[],
  elapsed: number,
  cursor: number
): { from: T; to: T; t: number; cursor: number } => {
  let index = cursor;
  while (index < track.length - 1 && track[index + 1].at <= elapsed) index += 1;
  const from = track[index];
  const to = track[Math.min(index + 1, track.length - 1)];
  const span = to.at - from.at;
  const t = span > 0 ? Math.min(1.0, Math.max(0.0, (elapsed - from.at) / span)) : 1.0;
  return { from, to, t, cursor: index };
};

/**
 * ユーザーが実際に使用するモデルの実装クラス<br>
 * モデル生成、機能コンポーネント生成、更新処理とレンダリングの呼び出しを行う。
 */
export class LAppModel extends CubismUserModel {
  /**
   * model3.jsonが置かれたディレクトリとファイルパスからモデルを生成する
   * @param dir
   * @param fileName
   */
  public loadAssets(dir: string, fileName: string): void {
    this._modelHomeDir = dir;

    fetch(`${this._modelHomeDir}${fileName}`)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        const setting: ICubismModelSetting = new CubismModelSettingJson(
          arrayBuffer,
          arrayBuffer.byteLength
        );

        // ステートを更新
        this._state = LoadStep.LoadModel;

        // 結果を保存
        this.setupModel(setting);
      })
      .catch(error => {
        // model3.json読み込みでエラーが発生した時点で描画は不可能なので、setupせずエラーをcatchして何もしない
        CubismLogError(`Failed to load file ${this._modelHomeDir}${fileName}`);
      });
  }

  /**
   * model3.jsonからモデルを生成する。
   * model3.jsonの記述に従ってモデル生成、モーション、物理演算などのコンポーネント生成を行う。
   *
   * @param setting ICubismModelSettingのインスタンス
   */
  private setupModel(setting: ICubismModelSetting): void {
    this._updating = true;
    this._initialized = false;

    this._modelSetting = setting;

    // CubismModel
    if (this._modelSetting.getModelFileName() != '') {
      const modelFileName = this._modelSetting.getModelFileName();

      fetch(`${this._modelHomeDir}${modelFileName}`)
        .then(response => {
          if (response.ok) {
            return response.arrayBuffer();
          } else if (response.status >= 400) {
            CubismLogError(
              `Failed to load file ${this._modelHomeDir}${modelFileName}`
            );
            return new ArrayBuffer(0);
          }
        })
        .then(arrayBuffer => {
          this.loadModel(arrayBuffer, this._mocConsistency);
          this._state = LoadStep.LoadExpression;

          // callback
          loadCubismExpression();
        });

      this._state = LoadStep.WaitLoadModel;
    } else {
      LAppPal.printMessage('Model data does not exist.');
    }

    // Expression
    const loadCubismExpression = (): void => {
      if (this._modelSetting.getExpressionCount() > 0) {
        const count: number = this._modelSetting.getExpressionCount();

        for (let i = 0; i < count; i++) {
          const expressionName = this._modelSetting.getExpressionName(i);
          const expressionFileName =
            this._modelSetting.getExpressionFileName(i);

          fetch(`${this._modelHomeDir}${expressionFileName}`)
            .then(response => {
              if (response.ok) {
                return response.arrayBuffer();
              } else if (response.status >= 400) {
                CubismLogError(
                  `Failed to load file ${this._modelHomeDir}${expressionFileName}`
                );
                // ファイルが存在しなくてもresponseはnullを返却しないため、空のArrayBufferで対応する
                return new ArrayBuffer(0);
              }
            })
            .then(arrayBuffer => {
              const motion: ACubismMotion = this.loadExpression(
                arrayBuffer,
                arrayBuffer.byteLength,
                expressionName
              );

              if (this._expressions.get(expressionName) != null) {
                ACubismMotion.delete(this._expressions.get(expressionName));
                this._expressions.set(expressionName, null);
              }

              this._expressions.set(expressionName, motion);

              this._expressionCount++;

              if (this._expressionCount >= count) {
                // Expression Updaterの追加
                if (this._expressionManager != null) {
                  const expressionUpdater = new CubismExpressionUpdater(
                    this._expressionManager
                  );
                  this._updateScheduler.addUpdatableList(expressionUpdater);
                }

                this._state = LoadStep.LoadPhysics;

                // callback
                loadCubismPhysics();
              }
            });
        }
        this._state = LoadStep.WaitLoadExpression;
      } else {
        this._state = LoadStep.LoadPhysics;

        // callback
        loadCubismPhysics();
      }
    };

    // Physics
    const loadCubismPhysics = (): void => {
      if (this._modelSetting.getPhysicsFileName() != '') {
        const physicsFileName = this._modelSetting.getPhysicsFileName();

        fetch(`${this._modelHomeDir}${physicsFileName}`)
          .then(response => {
            if (response.ok) {
              return response.arrayBuffer();
            } else if (response.status >= 400) {
              CubismLogError(
                `Failed to load file ${this._modelHomeDir}${physicsFileName}`
              );
              return new ArrayBuffer(0);
            }
          })
          .then(arrayBuffer => {
            this.loadPhysics(arrayBuffer, arrayBuffer.byteLength);

            // Physics Updaterの追加
            if (this._physics) {
              const physicsUpdater = new CubismPhysicsUpdater(this._physics);
              this._updateScheduler.addUpdatableList(physicsUpdater);
            }

            this._state = LoadStep.LoadPose;

            // callback
            loadCubismPose();
          });
        this._state = LoadStep.WaitLoadPhysics;
      } else {
        this._state = LoadStep.LoadPose;

        // callback
        loadCubismPose();
      }
    };

    // Pose
    const loadCubismPose = (): void => {
      if (this._modelSetting.getPoseFileName() != '') {
        const poseFileName = this._modelSetting.getPoseFileName();

        fetch(`${this._modelHomeDir}${poseFileName}`)
          .then(response => {
            if (response.ok) {
              return response.arrayBuffer();
            } else if (response.status >= 400) {
              CubismLogError(
                `Failed to load file ${this._modelHomeDir}${poseFileName}`
              );
              return new ArrayBuffer(0);
            }
          })
          .then(arrayBuffer => {
            this.loadPose(arrayBuffer, arrayBuffer.byteLength);

            // Pose Updaterの追加
            if (this._pose) {
              const poseUpdater = new CubismPoseUpdater(this._pose);
              this._updateScheduler.addUpdatableList(poseUpdater);
            }

            this._state = LoadStep.SetupEyeBlink;

            // callback
            setupEyeBlink();
          });
        this._state = LoadStep.WaitLoadPose;
      } else {
        this._state = LoadStep.SetupEyeBlink;

        // callback
        setupEyeBlink();
      }
    };

    // EyeBlink
    const setupEyeBlink = (): void => {
      if (this._modelSetting.getEyeBlinkParameterCount() > 0) {
        this._eyeBlink = CubismEyeBlink.create(this._modelSetting);
        const eyeBlinkUpdater = new CubismEyeBlinkUpdater(
          () => this._motionUpdated,
          this._eyeBlink
        );
        this._updateScheduler.addUpdatableList(eyeBlinkUpdater);
      }

      this._state = LoadStep.SetupBreath;

      // callback
      setupBreath();
    };

    // Breath
    const setupBreath = (): void => {
      // The terminal authors its own breathing on these same parameters in
      // update(). Registering CubismBreath as well would add a second ±15°
      // ANGLE_X / ±10° ANGLE_Z sway that the authored pose immediately
      // overwrites — but only after the physics rig has already reacted to it,
      // so the hair would swing to a head motion the portrait never performs.
      this._breath = null;

      this._state = LoadStep.LoadUserData;

      // callback
      loadUserData();
    };

    // UserData
    const loadUserData = (): void => {
      if (this._modelSetting.getUserDataFile() != '') {
        const userDataFile = this._modelSetting.getUserDataFile();

        fetch(`${this._modelHomeDir}${userDataFile}`)
          .then(response => {
            if (response.ok) {
              return response.arrayBuffer();
            } else if (response.status >= 400) {
              CubismLogError(
                `Failed to load file ${this._modelHomeDir}${userDataFile}`
              );
              return new ArrayBuffer(0);
            }
          })
          .then(arrayBuffer => {
            this.loadUserData(arrayBuffer, arrayBuffer.byteLength);

            this._state = LoadStep.SetupEyeBlinkIds;

            // callback
            setupEyeBlinkIds();
          });

        this._state = LoadStep.WaitLoadUserData;
      } else {
        this._state = LoadStep.SetupEyeBlinkIds;

        // callback
        setupEyeBlinkIds();
      }
    };

    // EyeBlinkIds
    const setupEyeBlinkIds = (): void => {
      const eyeBlinkIdCount: number =
        this._modelSetting.getEyeBlinkParameterCount();

      this._eyeBlinkIds.length = eyeBlinkIdCount;
      for (let i = 0; i < eyeBlinkIdCount; ++i) {
        this._eyeBlinkIds[i] = this._modelSetting.getEyeBlinkParameterId(i);
      }

      this._state = LoadStep.SetupLipSyncIds;

      // callback
      setupLipSyncIds();
    };

    // LipSyncIds
    const setupLipSyncIds = (): void => {
      const lipSyncIdCount = this._modelSetting.getLipSyncParameterCount();

      this._lipSyncIds.length = lipSyncIdCount;
      for (let i = 0; i < lipSyncIdCount; ++i) {
        this._lipSyncIds[i] = this._modelSetting.getLipSyncParameterId(i);
      }

      // LipSync Updaterの追加
      if (this._lipSyncIds.length > 0) {
        const lipSyncUpdater = new CubismLipSyncUpdater(
          this._lipSyncIds,
          this._wavFileHandler
        );
        this._updateScheduler.addUpdatableList(lipSyncUpdater);
      }

      this._state = LoadStep.SetupLook;

      // callback
      setupLook();
    };

    // Look
    const setupLook = (): void => {
      // Superseded by the terminal's own gaze inertia in update(). The sample
      // binds pointermove unguarded, so CubismLook would drive ±30° of head
      // angle from the raw drag vector on every mouse move — again reaching
      // the physics rig and then being overwritten before it is drawn.
      this._look = null;

      // callback
      finalizeUpdaters();
    };

    // UpdateScheduler最終化処理
    const finalizeUpdaters = (): void => {
      // 全てのUpdaterが追加されたのでUpdateSchedulerを最終ソート
      this._updateScheduler.sortUpdatableList();

      this._state = LoadStep.SetupLayout;

      // callback
      setupLayout();
    };

    // Layout
    const setupLayout = (): void => {
      const layout: Map<string, number> = new Map<string, number>();

      if (this._modelSetting == null || this._modelMatrix == null) {
        CubismLogError('Failed to setupLayout().');
        return;
      }

      this._modelSetting.getLayoutMap(layout);
      this._modelMatrix.setupFromLayout(layout);
      this._state = LoadStep.LoadMotion;

      // callback
      loadCubismMotion();
    };

    // Motion
    const loadCubismMotion = (): void => {
      this._state = LoadStep.WaitLoadMotion;
      this._model.saveParameters();
      this._allMotionCount = 0;
      this._motionCount = 0;
      const group: string[] = [];

      const motionGroupCount: number = this._modelSetting.getMotionGroupCount();

      // モーションの総数を求める
      for (let i = 0; i < motionGroupCount; i++) {
        group[i] = this._modelSetting.getMotionGroupName(i);
        this._allMotionCount += this._modelSetting.getMotionCount(group[i]);
      }

      // モーションの読み込み
      for (let i = 0; i < motionGroupCount; i++) {
        this.preLoadMotionGroup(group[i]);
      }

      // モーションがない場合
      if (motionGroupCount == 0) {
        this._state = LoadStep.LoadTexture;

        // 全てのモーションを停止する
        this._motionManager.stopAllMotions();

        this._updating = false;
        this._initialized = true;

        this.createRenderer(
          this._subdelegate.getCanvas().width,
          this._subdelegate.getCanvas().height
        );
        this.setupTextures();
        this.getRenderer().startUp(this._subdelegate.getGlManager().getGl());
        this.getRenderer().loadShaders(LAppDefine.ShaderPath);
      }
    };
  }

  /**
   * テクスチャユニットにテクスチャをロードする
   */
  private setupTextures(): void {
    // iPhoneでのアルファ品質向上のためTypescriptではpremultipliedAlphaを採用
    const usePremultiply = true;

    if (this._state == LoadStep.LoadTexture) {
      // テクスチャ読み込み用
      const textureCount: number = this._modelSetting.getTextureCount();

      for (
        let modelTextureNumber = 0;
        modelTextureNumber < textureCount;
        modelTextureNumber++
      ) {
        // テクスチャ名が空文字だった場合はロード・バインド処理をスキップ
        if (this._modelSetting.getTextureFileName(modelTextureNumber) == '') {
          console.log('getTextureFileName null');
          continue;
        }

        // WebGLのテクスチャユニットにテクスチャをロードする
        let texturePath =
          this._modelSetting.getTextureFileName(modelTextureNumber);
        texturePath = this._modelHomeDir + texturePath;

        // ロード完了時に呼び出すコールバック関数
        const onLoad = (textureInfo: TextureInfo): void => {
          this.getRenderer().bindTexture(modelTextureNumber, textureInfo.id);

          this._textureCount++;

          if (this._textureCount >= textureCount) {
            // ロード完了
            this._state = LoadStep.CompleteSetup;
          }
        };

        // 読み込み
        this._subdelegate
          .getTextureManager()
          .createTextureFromPngFile(texturePath, usePremultiply, onLoad);
        this.getRenderer().setIsPremultipliedAlpha(usePremultiply);
      }

      this._state = LoadStep.WaitLoadTexture;
    }
  }

  /**
   * レンダラを再構築する
   */
  public reloadRenderer(): void {
    this.deleteRenderer();
    this.createRenderer(
      this._subdelegate.getCanvas().width,
      this._subdelegate.getCanvas().height
    );
    this.setupTextures();
  }

  /**
   * 更新
   */
  public update(): void {
    if (this._state != LoadStep.CompleteSetup) return;

    const deltaTimeSeconds: number = LAppPal.getDeltaTime();
    this._userTimeSeconds += deltaTimeSeconds;

    //--------------------------------------------------------------------------
    this._model.loadParameters(); // 前回セーブされた状態をロード

    // Reset motion updated flag each frame
    this._motionUpdated = false;

    if (this._motionManager.isFinished()) {
      // This export ships no motion files, so guard it: unguarded, the sample
      // asks for a random idle every single frame and is refused every time.
      if (this._modelSetting.getMotionCount(LAppDefine.MotionGroupIdle) > 0) {
        this.startRandomMotion(
          LAppDefine.MotionGroupIdle,
          LAppDefine.PriorityIdle
        );
      }
    } else {
      this._motionUpdated = this._motionManager.updateMotion(
        this._model,
        deltaTimeSeconds
      ); // モーションを更新
    }
    this._model.saveParameters(); // 状態を保存
    //--------------------------------------------------------------------------

    // The terminal portrait has no idle motion files, so everything below is
    // authored here. It all has to be written *before* the scheduler runs:
    // the rig's 20 physics settings take PARAM_ANGLE_X/Y/Z, PARAM_BODY_ANGLE_X/Z
    // and PARAM_EYE_*_OPEN as their inputs, and drive the hair, ears, hands and
    // ribbon chains from them. Writing the pose afterwards left physics reacting
    // to whatever the effect updaters happened to leave behind instead.
    // "尾巴會自己動，所以心情其實藏不住" — so it has to actually follow the mood.
    const mood = (window as Window & {
      __chiakiTerminalTail?: { amp: number; rate: number };
    }).__chiakiTerminalTail;
    const tail = this._terminalTail;
    const ease = 1.0 - Math.exp(-2.5 * deltaTimeSeconds);
    tail.amp += ((mood?.amp ?? 1.0) - tail.amp) * ease;
    tail.rate += ((mood?.rate ?? 1.0) - tail.rate) * ease;
    tail.phase += deltaTimeSeconds * tail.rate;
    const tailSway =
      (Math.sin(tail.phase / 1.48) * 14.0 + Math.sin(tail.phase / 3.98) * 3.2) *
      tail.amp;
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_TAIL_SWAY'),
      tailSway
    );

    const terminalWindow = window as Window & {
      __chiakiTerminalParams?: Record<string, number>;
      __chiakiTerminalEmotionSpeed?: number;
    };
    const terminalParams = terminalWindow.__chiakiTerminalParams;
    if (terminalParams) {
      // Every emotion used to arrive at the same rate. Surprise has to land in
      // a couple of frames and sadness has to settle, so the page sends the
      // attack speed with the pose.
      const speed = terminalWindow.__chiakiTerminalEmotionSpeed ?? 7.0;
      const blend = 1.0 - Math.exp(-speed * deltaTimeSeconds);
      for (const id in terminalParams) {
        const parameterId = CubismFramework.getIdManager().getId(id);
        const target = terminalParams[id];
        const current =
          this._terminalParamValues.get(id) ??
          this._model.getParameterValueById(parameterId);
        const value = current + (target - current) * blend;
        this._terminalParamValues.set(id, value);
        this._model.setParameterValueById(parameterId, value);
      }
    }

    // Sample the mouth timeline on the render clock rather than taking discrete
    // targets from the page, so every syllable's closure and peak land where the
    // utterance says they do regardless of frame rate or timer throttling.
    const speech = (window as Window & {
      __chiakiTerminalSpeech?: {
        keys: MouthKey[];
        gestures?: GestureKey[];
        startedAt: number;
      };
    }).__chiakiTerminalSpeech;
    let mouthOpen = 0.0;
    let mouthForm = 0.0;
    let speaking = false;
    let gesture = GESTURE_REST;
    if (speech && speech.keys.length > 0) {
      if (speech.startedAt !== this._speechStartedAt) {
        this._speechStartedAt = speech.startedAt;
        this._speechCursor = 0;
        this._gestureCursor = 0;
      }
      const elapsed = performance.now() - speech.startedAt;
      const keys = speech.keys;
      speaking = elapsed < keys[keys.length - 1].at;

      const mouth = sampleTrack(keys, elapsed, this._speechCursor);
      this._speechCursor = mouth.cursor;
      // Opening is a fast release, closing eases — a mouth snaps open off a
      // consonant and relaxes shut.
      const eased =
        mouth.to.open > mouth.from.open
          ? 1.0 - (1.0 - mouth.t) * (1.0 - mouth.t)
          : mouth.t * mouth.t * (3.0 - 2.0 * mouth.t);
      mouthOpen = mouth.from.open + (mouth.to.open - mouth.from.open) * eased;
      mouthForm = mouth.from.form + (mouth.to.form - mouth.from.form) * eased;

      const track = speech.gestures;
      if (track && track.length > 0) {
        const g = sampleTrack(track, elapsed, this._gestureCursor);
        this._gestureCursor = g.cursor;
        const s = g.t * g.t * (3.0 - 2.0 * g.t);
        const mix = (a: number, b: number) => a + (b - a) * s;
        gesture = {
          at: 0,
          brow: mix(g.from.brow, g.to.brow),
          tilt: mix(g.from.tilt, g.to.tilt),
          nod: mix(g.from.nod, g.to.nod),
          gaze: mix(g.from.gaze, g.to.gaze),
          breath: mix(g.from.breath, g.to.breath),
        };
      }
    }
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_MOUTH_OPEN_Y'),
      mouthOpen
    );
    // Added to the emotion's mouth shape instead of replacing it, so she does
    // not stop smiling the moment she starts talking.
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_MOUTH_FORM'),
      (this._terminalParamValues.get('PARAM_MOUTH_FORM') ?? 0.0) + mouthForm
    );

    const terminalTap = (window as Window & {
      __chiakiTerminalTap?: { area: 'head' | 'chest'; at: number };
    }).__chiakiTerminalTap;
    if (terminalTap && terminalTap.at > this._terminalLastTapAt) {
      this._terminalLastTapAt = terminalTap.at;
      this._terminalReaction = {
        area: terminalTap.area,
        startedAt: this._userTimeSeconds,
        endsAt: this._userTimeSeconds + (terminalTap.area === 'head' ? 2.4 : 2.8),
      };
    }

    // The exported model has no eye-blink / lip-sync groups. Give its
    // otherwise static portrait restrained, continuous life here instead of
    // relying on motion files that do not exist in this model export.
    // Chest, head and torso used to share one sine, which made the whole
    // portrait rise and fall as a single rigid piece. Mutually prime periods
    // and separate phases keep them from ever lining up; the torso lag is what
    // reads as weight.
    const wave = (period: number, phase: number) =>
      Math.sin(this._userTimeSeconds * (Math.PI * 2 / period) + phase);
    const breath = wave(4.8, 0);
    const chestLag = wave(4.8, -0.35);
    const headBob = wave(6.7, 0.9);
    const lean = wave(9.1, 2.1);
    const pointer = (window as Window & {
      __chiakiTerminalPointer?: { targetX: number; targetY: number; movedAt: number };
    }).__chiakiTerminalPointer;
    const pointerIsInteresting =
      pointer != null && performance.now() - pointer.movedAt < 1350;
    const idle = this._terminalIdle;
    if (!pointerIsInteresting) {
      if (idle.endsAt > 0 && this._userTimeSeconds >= idle.endsAt) {
        idle.targetX = 0;
        idle.targetY = 0;
        idle.endsAt = 0;
        idle.nextAt = this._userTimeSeconds + 4.6 + Math.random() * 4.2;
      } else if (this._userTimeSeconds >= idle.nextAt) {
        idle.targetX = -0.24 + Math.random() * 0.48;
        idle.targetY = -0.1 + Math.random() * 0.2;
        idle.endsAt = this._userTimeSeconds + 1.8 + Math.random() * 1.5;
      }
    }
    const desiredX = pointerIsInteresting ? pointer.targetX : idle.targetX;
    const desiredY = pointerIsInteresting ? pointer.targetY : idle.targetY;
    const look = this._terminalLook;
    const damp = (current: number, target: number, seconds: number) =>
      current + (target - current) * (1.0 - Math.exp(-deltaTimeSeconds / seconds));
    look.eyeX = damp(look.eyeX, desiredX, 0.19);
    look.eyeY = damp(look.eyeY, desiredY, 0.19);
    look.headX = damp(look.headX, desiredX, 0.82);
    look.headY = damp(look.headY, desiredY, 0.88);
    look.bodyX = damp(look.bodyX, desiredX, 1.65);
    look.bodyY = damp(look.bodyY, desiredY, 1.8);
    const speakingNod =
      Math.sin(this._userTimeSeconds * (Math.PI * 2 / 0.72)) * mouthOpen * 0.55;
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_BREATH'),
      0.5 + breath * 0.42 + gesture.breath
    );
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_BODY_ANGLE_X'),
      lean * 0.55 + look.bodyX * 5.0
    );
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_ANGLE_Y'),
      headBob * 0.85 - look.headY * 12.0 + speakingNod + gesture.nod
    );
    const glance = Math.sin(this._userTimeSeconds * (Math.PI * 2 / 9.2));
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_ANGLE_X'),
      glance * 1.15 + look.headX * 13.0
    );
    // Eyes jump, they do not glide. The damped look above is smooth pursuit;
    // this is the micro-saccade on top of it, applied without damping so it
    // lands in a single frame the way a real fixation shift does.
    const saccade = this._terminalSaccade;
    if (this._userTimeSeconds >= saccade.nextAt) {
      saccade.x = (Math.random() - 0.5) * 0.16;
      saccade.y = (Math.random() - 0.5) * 0.1;
      saccade.nextAt = this._userTimeSeconds + 0.5 + Math.random() * 1.7;
    }
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_EYE_BALL_X'),
      glance * 0.24 + look.eyeX + saccade.x + gesture.gaze
    );
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_EYE_BALL_Y'),
      -look.eyeY + saccade.y
    );
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_BODY_ANGLE_Y'),
      -look.bodyY * 3.0 + chestLag * 1.45 + speakingNod * 0.42
    );
    // Head tilt is what swings the hair: PARAM_ANGLE_Z and PARAM_BODY_ANGLE_Z
    // are the inputs to the front/back hair and ribbon chains. Leaving them at
    // rest left two thirds of the physics rig with nothing to react to. People
    // also tilt slightly into a turn, so couple part of it to the head yaw.
    // Added on top of the emotion tilt the terminal params already smoothed in.
    const sway = Math.sin(this._userTimeSeconds * (Math.PI * 2 / 11.3));
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_ANGLE_Z'),
      (this._terminalParamValues.get('PARAM_ANGLE_Z') ?? 0.0) +
        sway * 1.6 -
        look.headX * 4.5 +
        gesture.tilt
    );
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_BODY_ANGLE_Z'),
      (this._terminalParamValues.get('PARAM_BODY_ANGLE_Z') ?? 0.0) +
        sway * 0.7 -
        look.bodyX * 1.8
    );

    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_BROW_L_Y'),
      (this._terminalParamValues.get('PARAM_BROW_L_Y') ?? 0.0) + gesture.brow
    );
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_BROW_R_Y'),
      (this._terminalParamValues.get('PARAM_BROW_R_Y') ?? 0.0) + gesture.brow
    );

    // A fixed 4.6s cycle reads as a metronome, and the ear and eyelid physics
    // chains take PARAM_EYE_*_OPEN as input, so it put those on a metronome too.
    // Randomised intervals, occasional double blinks, and a faster rate while
    // she is talking.
    const CLOSING = 0.06;
    const OPENING = 0.09;
    const eyes = this._terminalBlink;
    if (eyes.elapsed < 0 && this._userTimeSeconds >= eyes.nextAt) eyes.elapsed = 0;
    let blink = 1.0;
    if (eyes.elapsed >= 0) {
      eyes.elapsed += deltaTimeSeconds;
      if (eyes.elapsed < CLOSING) blink = 1.0 - eyes.elapsed / CLOSING;
      else if (eyes.elapsed < CLOSING + OPENING)
        blink = (eyes.elapsed - CLOSING) / OPENING;
      else {
        eyes.elapsed = -1;
        if (eyes.pending > 0) {
          eyes.pending -= 1;
          eyes.nextAt = this._userTimeSeconds + 0.1;
        } else {
          eyes.nextAt =
            this._userTimeSeconds +
            (speaking ? 1.6 + Math.random() * 2.4 : 2.6 + Math.random() * 4.4);
          eyes.pending = Math.random() < 0.18 ? 1 : 0;
        }
      }
    }
    // Scaled by the emotion's eye aperture rather than replacing it, which is
    // what made shy's half-lidded look impossible to see.
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_EYE_L_OPEN'),
      blink * (this._terminalParamValues.get('PARAM_EYE_L_OPEN') ?? 1.0)
    );
    this._model.setParameterValueById(
      CubismFramework.getIdManager().getId('PARAM_EYE_R_OPEN'),
      blink * (this._terminalParamValues.get('PARAM_EYE_R_OPEN') ?? 1.0)
    );

    const reaction = this._terminalReaction;
    if (reaction && this._userTimeSeconds < reaction.endsAt) {
      const blend = Math.min(
        1.0,
        (this._userTimeSeconds - reaction.startedAt) / 0.28,
        (reaction.endsAt - this._userTimeSeconds) / 0.48
      );
      // Layered on top of the pose and the viseme rather than replacing them,
      // so patting her mid-sentence does not freeze her mouth.
      if (reaction.area === 'head') {
        this._model.addParameterValueById(
          CubismFramework.getIdManager().getId('PARAM_MOUTH_FORM'),
          0.22 * blend
        );
        this._model.addParameterValueById(
          CubismFramework.getIdManager().getId('PARAM_EYE_L_SMILE'),
          0.12 * blend
        );
        this._model.addParameterValueById(
          CubismFramework.getIdManager().getId('PARAM_EYE_R_SMILE'),
          0.12 * blend
        );
        this._model.addParameterValueById(
          CubismFramework.getIdManager().getId('PARAM_ANGLE_Z'),
          -1.2 * blend
        );
      } else {
        this._model.addParameterValueById(
          CubismFramework.getIdManager().getId('PARAM_MOUTH_FORM'),
          -0.05 * blend
        );
        this._model.addParameterValueById(
          CubismFramework.getIdManager().getId('PARAM_BROW_L_Y'),
          -0.13 * blend
        );
        this._model.addParameterValueById(
          CubismFramework.getIdManager().getId('PARAM_BROW_R_Y'),
          -0.13 * blend
        );
        this._model.addParameterValueById(
          CubismFramework.getIdManager().getId('PARAM_ANGLE_Z'),
          2.2 * blend
        );
        this._model.addParameterValueById(
          CubismFramework.getIdManager().getId('PARAM_BODY_ANGLE_Z'),
          1.1 * blend
        );
      }
    }

    // UpdateSchedulerによる一括エフェクト更新
    this._updateScheduler.onLateUpdate(this._model, deltaTimeSeconds);

    this._model.update();
  }

  /**
   * 引数で指定したモーションの再生を開始する
   * @param group モーショングループ名
   * @param no グループ内の番号
   * @param priority 優先度
   * @param onFinishedMotionHandler モーション再生終了時に呼び出されるコールバック関数
   * @return 開始したモーションの識別番号を返す。個別のモーションが終了したか否かを判定するisFinished()の引数で使用する。開始できない時は[-1]
   */
  public startMotion(
    group: string,
    no: number,
    priority: number,
    onFinishedMotionHandler?: FinishedMotionCallback,
    onBeganMotionHandler?: BeganMotionCallback
  ): CubismMotionQueueEntryHandle {
    if (priority == LAppDefine.PriorityForce) {
      this._motionManager.setReservePriority(priority);
    } else if (!this._motionManager.reserveMotion(priority)) {
      if (this._debugMode) {
        LAppPal.printMessage("[APP]can't start motion.");
      }
      return InvalidMotionQueueEntryHandleValue;
    }

    const motionFileName = this._modelSetting.getMotionFileName(group, no);

    // ex) idle_0
    const name = `${group}_${no}`;
    let motion: CubismMotion = this._motions.get(name) as CubismMotion;
    let autoDelete = false;

    if (motion == null) {
      fetch(`${this._modelHomeDir}${motionFileName}`)
        .then(response => {
          if (response.ok) {
            return response.arrayBuffer();
          } else if (response.status >= 400) {
            CubismLogError(
              `Failed to load file ${this._modelHomeDir}${motionFileName}`
            );
            return new ArrayBuffer(0);
          }
        })
        .then(arrayBuffer => {
          motion = this.loadMotion(
            arrayBuffer,
            arrayBuffer.byteLength,
            null,
            onFinishedMotionHandler,
            onBeganMotionHandler,
            this._modelSetting,
            group,
            no,
            this._motionConsistency
          );
        });

      if (motion) {
        motion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds);
        autoDelete = true; // 終了時にメモリから削除
      } else {
        CubismLogError("Can't start motion {0} .", motionFileName);
        // ロードできなかったモーションのReservePriorityをリセットする
        this._motionManager.setReservePriority(LAppDefine.PriorityNone);
        return InvalidMotionQueueEntryHandleValue;
      }
    } else {
      motion.setBeganMotionHandler(onBeganMotionHandler);
      motion.setFinishedMotionHandler(onFinishedMotionHandler);
    }

    //voice
    const voice = this._modelSetting.getMotionSoundFileName(group, no);
    if (voice.localeCompare('') != 0) {
      let path = voice;
      path = this._modelHomeDir + path;
      this._wavFileHandler.start(path);
    }

    if (this._debugMode) {
      LAppPal.printMessage(`[APP]start motion: [${group}_${no}]`);
    }
    return this._motionManager.startMotionPriority(
      motion,
      autoDelete,
      priority
    );
  }

  /**
   * ランダムに選ばれたモーションの再生を開始する。
   * @param group モーショングループ名
   * @param priority 優先度
   * @param onFinishedMotionHandler モーション再生終了時に呼び出されるコールバック関数
   * @return 開始したモーションの識別番号を返す。個別のモーションが終了したか否かを判定するisFinished()の引数で使用する。開始できない時は[-1]
   */
  public startRandomMotion(
    group: string,
    priority: number,
    onFinishedMotionHandler?: FinishedMotionCallback,
    onBeganMotionHandler?: BeganMotionCallback
  ): CubismMotionQueueEntryHandle {
    if (this._modelSetting.getMotionCount(group) == 0) {
      return InvalidMotionQueueEntryHandleValue;
    }

    const no: number = Math.floor(
      Math.random() * this._modelSetting.getMotionCount(group)
    );

    return this.startMotion(
      group,
      no,
      priority,
      onFinishedMotionHandler,
      onBeganMotionHandler
    );
  }

  /**
   * 引数で指定した表情モーションをセットする
   *
   * @param expressionId 表情モーションのID
   */
  public setExpression(expressionId: string): void {
    const motion: ACubismMotion = this._expressions.get(expressionId);

    if (this._debugMode) {
      LAppPal.printMessage(`[APP]expression: [${expressionId}]`);
    }

    if (motion != null) {
      this._expressionManager.startMotion(motion, false);
    } else {
      if (this._debugMode) {
        LAppPal.printMessage(`[APP]expression[${expressionId}] is null`);
      }
    }
  }

  /**
   * ランダムに選ばれた表情モーションをセットする
   */
  public setRandomExpression(): void {
    if (this._expressions.size == 0) {
      return;
    }

    const no: number = Math.floor(Math.random() * this._expressions.size);

    for (let i = 0; i < this._expressions.size; i++) {
      if (i == no) {
        // const name: string = this._expressions._keyValues[i].first;
        const expressionsArray = [...this._expressions.entries()];
        const name: string = expressionsArray[i][0];
        this.setExpression(name);
        return;
      }
    }
  }

  /**
   * イベントの発火を受け取る
   */
  public motionEventFired(eventValue: string): void {
    CubismLogInfo('{0} is fired on LAppModel!!', eventValue);
  }

  /**
   * 当たり判定テスト
   * 指定ＩＤの頂点リストから矩形を計算し、座標をが矩形範囲内か判定する。
   *
   * @param hitArenaName  当たり判定をテストする対象のID
   * @param x             判定を行うX座標
   * @param y             判定を行うY座標
   */
  public hitTest(hitArenaName: string, x: number, y: number): boolean {
    // 透明時は当たり判定無し。
    if (this._opacity < 1) {
      return false;
    }

    const count: number = this._modelSetting.getHitAreasCount();

    for (let i = 0; i < count; i++) {
      if (this._modelSetting.getHitAreaName(i) == hitArenaName) {
        const drawId: CubismIdHandle = this._modelSetting.getHitAreaId(i);
        return this.isHit(drawId, x, y);
      }
    }

    return false;
  }

  /**
   * モーションデータをグループ名から一括でロードする。
   * モーションデータの名前は内部でModelSettingから取得する。
   *
   * @param group モーションデータのグループ名
   */
  public preLoadMotionGroup(group: string): void {
    for (let i = 0; i < this._modelSetting.getMotionCount(group); i++) {
      const motionFileName = this._modelSetting.getMotionFileName(group, i);

      // ex) idle_0
      const name = `${group}_${i}`;
      if (this._debugMode) {
        LAppPal.printMessage(
          `[APP]load motion: ${motionFileName} => [${name}]`
        );
      }

      fetch(`${this._modelHomeDir}${motionFileName}`)
        .then(response => {
          if (response.ok) {
            return response.arrayBuffer();
          } else if (response.status >= 400) {
            CubismLogError(
              `Failed to load file ${this._modelHomeDir}${motionFileName}`
            );
            return new ArrayBuffer(0);
          }
        })
        .then(arrayBuffer => {
          const tmpMotion: CubismMotion = this.loadMotion(
            arrayBuffer,
            arrayBuffer.byteLength,
            name,
            null,
            null,
            this._modelSetting,
            group,
            i,
            this._motionConsistency
          );

          if (tmpMotion != null) {
            tmpMotion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds);

            if (this._motions.get(name) != null) {
              ACubismMotion.delete(this._motions.get(name));
            }

            this._motions.set(name, tmpMotion);

            this._motionCount++;
          } else {
            // loadMotionできなかった場合はモーションの総数がずれるので1つ減らす
            this._allMotionCount--;
          }

          if (this._motionCount >= this._allMotionCount) {
            this._state = LoadStep.LoadTexture;

            // 全てのモーションを停止する
            this._motionManager.stopAllMotions();

            this._updating = false;
            this._initialized = true;

            this.createRenderer(
              this._subdelegate.getCanvas().width,
              this._subdelegate.getCanvas().height
            );
            this.setupTextures();
            this.getRenderer().startUp(
              this._subdelegate.getGlManager().getGl()
            );
            this.getRenderer().loadShaders(LAppDefine.ShaderPath);
          }
        });
    }
  }

  /**
   * すべてのモーションデータを解放する。
   */
  public releaseMotions(): void {
    this._motions.clear();
  }

  /**
   * 全ての表情データを解放する。
   */
  public releaseExpressions(): void {
    this._expressions.clear();
  }

  /**
   * モデルを描画する処理。モデルを描画する空間のView-Projection行列を渡す。
   */
  public doDraw(): void {
    if (this._model == null) return;

    // キャンバスサイズを渡す
    const canvas = this._subdelegate.getCanvas();
    const viewport: number[] = [0, 0, canvas.width, canvas.height];

    this.getRenderer().setRenderState(
      this._subdelegate.getFrameBuffer(),
      viewport
    );
    this.getRenderer().drawModel(LAppDefine.ShaderPath);
  }

  /**
   * モデルを描画する処理。モデルを描画する空間のView-Projection行列を渡す。
   */
  public draw(matrix: CubismMatrix44): void {
    if (this._model == null) {
      return;
    }

    // 各読み込み終了後
    if (this._state == LoadStep.CompleteSetup) {
      matrix.multiplyByMatrix(this._modelMatrix);

      this.getRenderer().setMvpMatrix(matrix);

      this.doDraw();
    }
  }

  public async hasMocConsistencyFromFile() {
    CSM_ASSERT(this._modelSetting.getModelFileName().localeCompare(``));

    // CubismModel
    if (this._modelSetting.getModelFileName() != '') {
      const modelFileName = this._modelSetting.getModelFileName();

      const response = await fetch(`${this._modelHomeDir}${modelFileName}`);
      const arrayBuffer = await response.arrayBuffer();

      this._consistency = CubismMoc.hasMocConsistency(arrayBuffer);

      if (!this._consistency) {
        CubismLogInfo('Inconsistent MOC3.');
      } else {
        CubismLogInfo('Consistent MOC3.');
      }

      return this._consistency;
    } else {
      LAppPal.printMessage('Model data does not exist.');
    }
  }

  public setSubdelegate(subdelegate: LAppSubdelegate): void {
    this._subdelegate = subdelegate;
  }

  /**
   * デストラクタに相当する処理のオーバーライド
   */
  public release(): void {
    if (this._look) {
      CubismLook.delete(this._look);
      this._look = null;
    }
    if (this._updateScheduler) {
      this._updateScheduler.release();
    }
    super.release();
  }

  /**
   * コンストラクタ
   */
  public constructor() {
    super();

    this._modelSetting = null;
    this._modelHomeDir = null;
    this._userTimeSeconds = 0.0;

    this._eyeBlinkIds = new Array<CubismIdHandle>();
    this._lipSyncIds = new Array<CubismIdHandle>();

    this._motions = new Map<string, ACubismMotion>();
    this._expressions = new Map<string, ACubismMotion>();

    this._hitArea = new Array<csmRect>();
    this._userArea = new Array<csmRect>();

    this._idParamAngleX = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamAngleX
    );
    this._idParamAngleY = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamAngleY
    );
    this._idParamAngleZ = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamAngleZ
    );
    this._idParamBodyAngleX = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamBodyAngleX
    );

    if (LAppDefine.MOCConsistencyValidationEnable) {
      this._mocConsistency = true;
    }

    if (LAppDefine.MotionConsistencyValidationEnable) {
      this._motionConsistency = true;
    }

    this._state = LoadStep.LoadAssets;
    this._expressionCount = 0;
    this._textureCount = 0;
    this._motionCount = 0;
    this._allMotionCount = 0;
    this._wavFileHandler = new LAppWavFileHandler();
    this._consistency = false;
    this._look = null;
    this._updateScheduler = new CubismUpdateScheduler();
    this._motionUpdated = false;
  }

  private _updateScheduler: CubismUpdateScheduler; // アップデートスケジューラー
  private _motionUpdated: boolean; // モーション更新フラグ
  private _subdelegate: LAppSubdelegate; // サブデリゲート

  _modelSetting: ICubismModelSetting; // モデルセッティング情報
  _modelHomeDir: string; // モデルセッティングが置かれたディレクトリ
  _userTimeSeconds: number; // デルタ時間の積算値[秒]

  _eyeBlinkIds: Array<CubismIdHandle>; // モデルに設定された瞬き機能用パラメータID
  _lipSyncIds: Array<CubismIdHandle>; // モデルに設定されたリップシンク機能用パラメータID
  private _terminalParamValues: Map<string, number> = new Map();
  private _speechStartedAt: number = -Infinity;
  private _speechCursor: number = 0;
  private _gestureCursor: number = 0;
  private _terminalTail = { amp: 1.0, rate: 1.0, phase: 0 };
  /** elapsed < 0 means the eyes are open and waiting for nextAt. */
  private _terminalBlink = { elapsed: -1, nextAt: 2.0, pending: 0 };
  private _terminalSaccade = { x: 0, y: 0, nextAt: 1.0 };
  private _terminalLook = { eyeX: 0, eyeY: 0, headX: 0, headY: 0, bodyX: 0, bodyY: 0 };
  private _terminalIdle = { targetX: 0, targetY: 0, endsAt: 0, nextAt: 5.5 };
  private _terminalLastTapAt: number = -Infinity;
  private _terminalReaction: {
    area: 'head' | 'chest';
    startedAt: number;
    endsAt: number;
  } | null = null;

  _motions: Map<string, ACubismMotion>; // 読み込まれているモーションのリスト
  _expressions: Map<string, ACubismMotion>; // 読み込まれている表情のリスト

  _hitArea: Array<csmRect>;
  _userArea: Array<csmRect>;

  _idParamAngleX: CubismIdHandle; // パラメータID: ParamAngleX
  _idParamAngleY: CubismIdHandle; // パラメータID: ParamAngleY
  _idParamAngleZ: CubismIdHandle; // パラメータID: ParamAngleZ
  _idParamBodyAngleX: CubismIdHandle; // パラメータID: ParamBodyAngleX

  _look: CubismLook; // ドラッグ追従

  _state: LoadStep; // 現在のステータス管理用
  _expressionCount: number; // 表情データカウント
  _textureCount: number; // テクスチャカウント
  _motionCount: number; // モーションデータカウント
  _allMotionCount: number; // モーション総数
  _wavFileHandler: LAppWavFileHandler; //wavファイルハンドラ
  _consistency: boolean; // MOC3整合性チェック管理用
}
