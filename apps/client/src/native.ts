// Capacitor native lifecycle glue.
//
// This module is imported eagerly on startup. All plugin calls are guarded by
// `Capacitor.isNativePlatform()` so the browser dev build has zero side effects.
// We intentionally keep this small — no persistent listeners kept alive past
// initialization, no runtime cost on the hot path.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

export const isNative = Capacitor.isNativePlatform();

/** Broadcast Android hardware-back-button presses to whoever is listening.
 *  Modals subscribe via `onBackButton`; the first handler that returns `true`
 *  wins (i.e. "consumed"). If nobody consumes, we fall through to native
 *  history back / exit. */
type BackHandler = () => boolean | void | Promise<boolean | void>;
const backHandlers: BackHandler[] = [];

export function onBackButton(handler: BackHandler): () => void {
  backHandlers.unshift(handler); // LIFO — newest modal handles first
  return () => {
    const i = backHandlers.indexOf(handler);
    if (i >= 0) backHandlers.splice(i, 1);
  };
}

async function runBackButton(canGoBack: boolean) {
  // Fire subscribers from newest to oldest. First one that says "consumed"
  // wins — mimics how a stack of modals should behave.
  for (const h of [...backHandlers]) {
    try {
      const consumed = await h();
      if (consumed === true) return;
    } catch {
      /* swallow — one broken handler shouldn't crash back navigation */
    }
  }
  if (canGoBack && window.history.length > 1) {
    window.history.back();
  } else {
    App.exitApp().catch(() => {/* no-op if plugin unavailable */});
  }
}

/** Initialize Capacitor plugins & class markers. Call once from main.tsx. */
export async function initCapacitor() {
  if (!isNative) return;

  // Tag the <html> so CSS can target native builds specifically (mobile CSS
  // overrides in index.css look for `.capacitor-native`).
  document.documentElement.classList.add('capacitor-native');
  document.documentElement.classList.add(`capacitor-${Capacitor.getPlatform()}`);

  // StatusBar — match the app's dark background so there's no color mismatch
  // when the WebView starts.
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#13111C' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch { /* plugin may be missing on older platforms */ }

  // Keyboard — when the on-screen keyboard shows on Android, we want the
  // WebView to resize instead of covering the input. `native` mode lets
  // Android handle the WindowInsets which is smoother than JS-driven resize.
  try {
    Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {});
  } catch { /* iOS-only, ignore on Android */ }

  // Wire Android hardware back button. `canGoBack` from Capacitor tells us
  // whether the WebView has web history to pop; we combine that with our own
  // modal handler stack.
  App.addListener('backButton', (event) => {
    runBackButton(event.canGoBack);
  });
}
