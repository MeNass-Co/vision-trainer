#!/usr/bin/env bash
# Native iOS-simulator screenshot rig for the reference-match UI pipeline.
# Renders the REAL app on the booted simulator (no web — web lies about material)
# and captures at native resolution (iPhone 16e = 393×852 pt @3x → 1179×2556 px).
#
# Usage:
#   scripts/shoot-sim.sh <out.png> [deeplink] [cropWxH+X+Y]
# Examples:
#   scripts/shoot-sim.sh design/captures/tabbar-today.png "visiontrainer://today"
#   scripts/shoot-sim.sh design/captures/paywall.png "visiontrainer://paywall" 1179x360+0+2196
#
# The crop arg is optional (ImageMagick-style WxH+X+Y in PIXELS). Without it you get
# the full screen — the agent MUST open the PNG and visually inspect it against the
# reference; a green diff table alone is not acceptance.
set -euo pipefail

OUT="${1:?output png path required}"
DEEPLINK="${2:-}"
CROP="${3:-}"
BUNDLE="co.menass.visiontrainer"

mkdir -p "$(dirname "$OUT")"

# Fail loudly if nothing is booted — the whole rig depends on a live sim.
if ! xcrun simctl list devices booted | grep -q "Booted"; then
  echo "ERROR: no simulator booted. Boot one (e.g. Xcode > open a Simulator) first." >&2
  exit 1
fi

# Make sure the app is actually installed (built via: npx expo run:ios).
if ! xcrun simctl get_app_container booted "$BUNDLE" >/dev/null 2>&1; then
  echo "ERROR: $BUNDLE not installed on the booted sim. Run 'npx expo run:ios' first." >&2
  exit 1
fi

if [ -n "$DEEPLINK" ]; then
  xcrun simctl launch booted "$BUNDLE" >/dev/null 2>&1 || true
  xcrun simctl openurl booted "$DEEPLINK"
  sleep 2   # let the route settle + any entry animation finish
fi

xcrun simctl io booted screenshot "$OUT" >/dev/null

if [ -n "$CROP" ]; then
  # sips can't do offset crops cleanly; use macOS `magick` if present, else skip with a note.
  if command -v magick >/dev/null 2>&1; then
    magick "$OUT" -crop "$CROP" +repage "$OUT"
  else
    echo "note: crop requested but ImageMagick not found — saved full screen instead." >&2
  fi
fi

echo "captured: $OUT ($(sips -g pixelWidth -g pixelHeight "$OUT" 2>/dev/null | awk '/pixel/{print $2}' | paste -sd'x' -))"
