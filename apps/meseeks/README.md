# Mr Meeseeks Clock

A Rick and Morty inspired watch face featuring Mr Meeseeks with multiple expressions and battery-dependent aging effects!

## Features

### Dynamic Mr Meeseeks Faces
- **12 Different Expressions**: Various Mr Meeseeks faces to cycle through
- **Tap to Cycle**: Tap anywhere on the face to cycle through expressions
- **Swipe/BTN1 Fallback**: Alternative controls for devices with touch issues

### Battery-Dependent Aging
- **Aging Spots**: Blue spots appear on screen as battery decreases
- **Progressive Aging**:
  - 100% battery: No spots
  - 80% battery: Few spots
  - 50% battery: Moderate spots
  - 20% battery: Many spots
- **Transparent Overlay**: Spots are drawn over background but under the face

### Information Display
- **Time**: Large digital time display
- **Date**: Current date
- **Battery**: Battery percentage with charging indicator
- **Heart Rate**: Current BPM
- **Steps**: Daily step count
- **Temperature**: Current watch temperature in Fahrenheit

### Visual Elements
- **Transparent Sprites**: Proper transparency handling for clean appearance
- **Stippled Spots**: Light stipple pattern for semi-transparent aging effect
- **Charging State**: Different behavior when charging (no aging spots, no face cycling)

## Controls

- **Tap Face**: Cycle through Mr Meeseeks expressions
- **Swipe**: Alternative face cycling (if tap doesn't work)
- **BTN1**: Physical button fallback for face cycling
- **Swipe Down**: Show widgets

## Technical Details

- Uses raw Image Object format for optimal transparency
- 4-bit color depth with custom palettes
- Cached spot generation to prevent flicker
- Multiple input methods for maximum compatibility
- Optimized for Bangle.js 2

## Attribution

**Character Inspiration**: Mr Meeseeks from Rick and Morty (Adult Swim)

**Code Base**: Based on the Advanced Casio Clock by [dotgreg](https://github.com/dotgreg/advCasioBangleClock)
- Original template: [Advanced Casio Clock](https://github.com/dotgreg/advCasioBangleClock)
- Creator: [dotgreg](https://github.com/dotgreg)

## Installation

Upload via Bangle.js App Loader or manually install the files in the `meseeks` folder.
