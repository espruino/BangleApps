BMO Face (Cartoon Face)

A playful Bangle.js watchface inspired by BMO. Shows time at the top center, temperature (upper-left), heart rate (above steps), and steps (bottom-right). When the watch locks, the face goes to sleep with a light gray background and a -_- expression.

Features
- Time centered at top using `7x11Numeric7Seg`
- Temperature upper-left
- Steps bottom-right, heart rate just above
- Locked mode: LCD-like gray with `-_-` sleeping face
- Widgets hidden by default; swipe to reveal

Testing lock state
Use in emulator console:
```javascript
Bangle.setLocked(true);
Bangle.setLocked(false);
```

Attribution
Character inspiration: BMO from Adventure Time

