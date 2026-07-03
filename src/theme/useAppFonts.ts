// The app now runs entirely on the iOS system font (SF Pro) — RN picks it up
// automatically from `fontWeight` alone, with no custom font files to load.
// This hook keeps its original contract ([loaded, error] tuple consumed by
// `_layout.tsx`'s `ready = (loaded || error) && hydrated` gate) so the splash
// screen still hides at the right time, but there is nothing left to await.
export function useAppFonts(): [boolean, Error | null] {
  return [true, null];
}
