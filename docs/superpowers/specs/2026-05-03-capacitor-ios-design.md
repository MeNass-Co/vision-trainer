# Vision Trainer — Capacitor iOS Packaging

**Date:** 2026-05-03
**Status:** Approved
**Goal:** Wrap the existing React/Vite PWA in Capacitor to produce a testable iOS app. Validate WebGL2, Framer Motion, and IndexedDB in WKWebView.

## Architecture

Capacitor runs alongside Tauri. Each owns its own directory:

- `ios/` — Capacitor Xcode project (new)
- `src-tauri/` — Tauri Mac build (existing, untouched)
- `dist/` — Vite build output, shared by both

No modifications to the React application code.

## Dependencies

- `@capacitor/core` — runtime bridge
- `@capacitor/cli` — project tooling
- `@capacitor/ios` — iOS platform
- `@capacitor/status-bar` — dark status bar styling
- `@capacitor/splash-screen` — launch screen

## Configuration

### capacitor.config.ts

- `appId`: `com.visiontrainer.app`
- `appName`: `Vision Trainer`
- `webDir`: `dist`
- `server.androidScheme`: not applicable
- `ios.minVersion`: `16.0`
- `plugins.SplashScreen`: auto-hide after app load
- `plugins.StatusBar`: dark content style

### Orientation

Portrait only. Set in Xcode project `Info.plist`:
- `UISupportedInterfaceOrientations` = `UIInterfaceOrientationPortrait`

### Service Worker

Disable in Capacitor context. Capacitor serves files from the local filesystem via `capacitor://` scheme — service workers are unnecessary and can cause caching conflicts.

Detection: check `window.Capacitor` at runtime. If present, skip SW registration.

### Safe Areas

Add CSS for iOS notch / Dynamic Island:

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

Verify the existing tab bar and session flow respect these insets.

### App Icon

Generate from the logo in `~/Library/Mobile Documents/com~apple~CloudDocs/temp/vision-trainer/`. Capacitor requires a 1024x1024 source icon; `@capacitor/assets` generates all required sizes.

### Splash Screen

Solid dark warm charcoal (#1C1916) matching the Baudelaire dark theme. Centered app icon. Auto-hide on app ready.

## Out of Scope

- Native plugins (haptics, notifications, HealthKit)
- Landscape orientation
- TestFlight / App Store distribution
- CI/CD pipeline
- Modifications to React/WebGL code

## Success Criteria

1. `npx cap open ios` opens valid Xcode project
2. App builds and runs on iOS 16+ Simulator
3. HomeScreen renders with GradientOrb animation
4. Gabor WebGL2 renderer produces visible stimuli
5. Session flow completes without crash
6. IndexedDB persistence works across app restarts
7. Status bar is dark, safe areas respected
8. Portrait lock enforced
