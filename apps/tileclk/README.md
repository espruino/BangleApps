# Tile Clock

A tile-based digital clock with animated transitions, customizable borders, and clock info integration.

## How to Use

### Basic Display
- The clock shows the current time using animated tiles
- Tiles animate smoothly when digits change
- In 12-hour mode, leading zeros are hidden (e.g., "2:30" instead of "02:30")

### Seconds Display
- **Static mode**: Seconds always shown/hidden based on settings
- **Dynamic mode**: Seconds appear when unlocked, hide when locked

### Clock Info Integration
- Tap the seconds area (bottom of screen) to show clock info
- Clock info displays weather, notifications, or other system information
- Tap clock info area to focus it
- When focused and tapped, clock info can perform actions if supported
- Tap main time area to unfocus the clock info
- Tap main time area again to dismiss the clock info

### Touch Controls
- **Tap seconds area**: Switch to clock info
- **Tap clock info area**: Focus the info panel
- **Tap main time once**: Unfocus the clock info
- **Tap main time again**: Dismiss clock info and return to seconds

### Settings
Access via Settings app to configure:
- Seconds display mode (show/hide/dynamic)
- Border visibility and color
- Widget display options
- Haptic feedback

## Features
- Smooth tile animations with color interpolation
- Customizable borders with theme color support
- Persistent user preferences
- Performance optimized for smooth operation
- Integration with Bangle.js clock info system