/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LAppDelegate } from './lappdelegate';
import * as LAppDefine from './lappdefine';

type TerminalWindow = Window & {
  __chiakiTerminalParams?: Record<string, number>;
  __chiakiTerminalPointer?: { targetX: number; targetY: number; movedAt: number };
  __chiakiTerminalTap?: { area: 'head' | 'chest'; at: number };
};

const terminalWindow = window as TerminalWindow;
terminalWindow.__chiakiTerminalParams = {};
terminalWindow.__chiakiTerminalPointer = { targetX: 0, targetY: 0, movedAt: -Infinity };
window.addEventListener('message', event => {
  const data = event.data;
  if (data?.type === 'chiaki-terminal-params' && typeof data.params === 'object') {
    terminalWindow.__chiakiTerminalParams = data.params;
    return;
  }
  if (data?.type === 'chiaki-terminal-pointer') {
    terminalWindow.__chiakiTerminalPointer = {
      targetX: Number(data.targetX) || 0,
      targetY: Number(data.targetY) || 0,
      movedAt: performance.now(),
    };
  }
});

// Pointer events inside the iframe do not bubble to the terminal page. Track
// them locally as well so crossing into the portrait never breaks her gaze.
document.addEventListener(
  'pointermove',
  event => {
    terminalWindow.__chiakiTerminalPointer = {
      targetX: Math.min(0.68, Math.max(-0.68, (event.clientX / window.innerWidth - 0.5) * 1.35)),
      targetY: Math.min(0.5, Math.max(-0.5, (event.clientY / window.innerHeight - 0.5) * 1.1)),
      movedAt: performance.now(),
    };
  },
  { passive: true }
);

document.addEventListener(
  'pointerup',
  event => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    const inEllipse = (centerX: number, centerY: number, radiusX: number, radiusY: number) =>
      Math.pow((x - centerX) / radiusX, 2) + Math.pow((y - centerY) / radiusY, 2) < 1;
    const area = inEllipse(0.5, 0.37, 0.18, 0.22)
      ? 'head'
      : inEllipse(0.5, 0.67, 0.27, 0.3)
        ? 'chest'
        : null;
    if (area) terminalWindow.__chiakiTerminalTap = { area, at: performance.now() };
  },
  { passive: true }
);

/**
 * ブラウザロード後の処理
 */
window.addEventListener(
  'load',
  (): void => {
    // Initialize WebGL and create the application instance
    if (!LAppDelegate.getInstance().initialize()) {
      return;
    }

    LAppDelegate.getInstance().run();
  },
  { passive: true }
);

/**
 * 終了時の処理
 */
window.addEventListener(
  'beforeunload',
  (): void => LAppDelegate.releaseInstance(),
  { passive: true }
);
