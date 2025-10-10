BMO Face

A playful Bangle.js watchface inspired by BMO from Adventure Time. Features three selectable characters (BMO, Finn, Jake) with dynamic expressions based on watch state.

Features
- **Three Characters**: BMO (green), Finn (blue), Jake (yellow)
- **Dynamic Expressions**: 
  - Normal face when unlocked
  - Sleeping face (`-_-`) when locked
  - Lightning bolt eyes when charging
- **Information Display**:
  - Time (top-center) using `7x11Numeric7Seg` font
  - Temperature (upper-left) with C/F toggle
  - Steps (bottom-right)
  - Heart rate (above steps)
- **Settings Menu**:
  - Character selection (BMO, Finn, Jake)
  - Temperature unit toggle (Celsius/Fahrenheit)
  - Character randomizer (Off, 5min, 10min, 30min, On Wake)
- **Lock Screen**: Light gray background with character-specific sleeping expressions
- **Charging Indicator**: Lightning bolt eyes for all characters

Character Details
- **BMO**: Green background, black circular eyes, complex layered mouth, dark teal borders
- **Finn**: Light blue background, flesh-colored face, white hood with ears, simple curved smile
- **Jake**: Yellow background, white eyes with black outlines, horizontal pointed jowls, oval nose

Testing Commands
Use in emulator console:
```javascript
// Test lock state
Bangle.setLocked(true);
Bangle.setLocked(false);

// Test charging state
Bangle.setCharging(true);
Bangle.setCharging(false);

// Test character randomizer
Bangle.emit("lock"); // Triggers "On Wake" randomizer
```

Installation
Upload via Bangle.js App Loader or manually install the files in the `bmoface` folder.

Attribution
Character inspiration: BMO, Finn, and Jake from Adventure Time (Cartoon Network)

