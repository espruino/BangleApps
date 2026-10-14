# Rokid Controller

Simulates the Rokid Glasses touchpad over BLE HID, so you can drive or test a Rokid
Glasses app directly from your Bangle.js 2.

## Gestures

| Bangle input | Sent as | Rokid touchpad equivalent |
|---|---|---|
| Tap | `KEYCODE_ENTER` | Tap (select/confirm) |
| Double-tap | HID consumer `AC Back` → `KEYCODE_BACK` | Double-tap (back) |
| Vertical drag | `KEYCODE_DPAD_DOWN` / `KEYCODE_DPAD_UP` | Swipe forward/backward |
| Horizontal drag | `KEYCODE_DPAD_RIGHT` / `KEYCODE_DPAD_LEFT` | Swipe forward/backward |
| Hold BTN1 (400ms+) | `KEYCODE_ENTER` + BLE UART `"2TAP"` | Two-finger tap |

The swipe direction is decided by the dominant axis of the actual drag, so all four
directions work at all times (horizontal swipes send `Left`/`Right`, vertical swipes
send `Down`/`Up`).

## Pairing

1. Install this app via the Bangle.js App Loader.
2. Pair the Bangle from your phone/PC's Bluetooth settings as a keyboard.
3. Open your Rokid Glasses app (or its phone/emulator fallback) - gestures on the
   Bangle now arrive as real Android key events.

## Notes

- Runs safely in the Espruino browser emulator: HID calls are feature-detected and
  fall back to console-only simulation (a red "SIM MODE" banner appears on screen).
- Two-finger tap sends the same `KEYCODE_ENTER` a real two-finger tap produces at the
  Android KeyEvent layer. If your target app reads raw multi-touch `MotionEvent`s
  instead, use the `"2TAP"` BLE UART message with a companion Accessibility Service
  that injects a genuine two-pointer gesture.
- HID failures are visible on the watch: the status line reads `HID OFF` when the HID
  service was never registered (Espruino cannot enable HID while a connection is
  active, so a connection at app load leaves it off), and a rejected report is shown
  in the footer instead of being swallowed.
