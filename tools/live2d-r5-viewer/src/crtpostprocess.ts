/**
 * The Live2D end of the tape model.
 *
 * The model itself lives in lib/ntsc at the repository root and is shared with
 * the site — same GLSL, same parameter set, so the portrait and anything the
 * site puts through a tape stay in step. All that is left here is the shape
 * LAppSubdelegate expects and the one thing that is Cubism's: the offscreen
 * target it draws into needs a depth buffer, because Cubism renders with
 * DEPTH_TEST on.
 *
 * The model is drawn on transparency, so noise can only exist where she is; a
 * real tape puts it across the whole frame. That is why the site's opaque
 * sources use NTSC_FULL_FRAME rather than this preset.
 */

import { NtscPipeline } from '../../../lib/ntsc/pipeline';
import { NTSC_SPRITE } from '../../../lib/ntsc/params';

export class CrtPostProcess {
  public initialize(
    gl: WebGL2RenderingContext,
    width: number,
    height: number
  ): boolean {
    this._pipeline = new NtscPipeline(NTSC_SPRITE, {
      sceneTarget: true,
      depth: true
    });
    return this._pipeline.initialize(gl, width, height);
  }

  public resize(width: number, height: number): void {
    this._pipeline?.resize(width, height);
  }

  public getFramebuffer(): WebGLFramebuffer {
    return this._pipeline?.getFramebuffer();
  }

  /** Point rendering at the offscreen target. */
  public bind(): void {
    this._pipeline?.bind();
  }

  /** Resolve the offscreen target to the canvas as a tape playback. */
  public render(): void {
    this._pipeline?.render();
  }

  public release(): void {
    this._pipeline?.release();
    this._pipeline = null;
  }

  private _pipeline: NtscPipeline = null;
}
