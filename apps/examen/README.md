# Examen

A guided five-step Ignatian Examen for Bangle.js 2, with a built-in settings
screen and an optional daily evening reminder.

## What it does

Swipe through five short prompts for evening prayer/reflection:

1. Be still — become aware of God's presence
2. Gratitude — what am I grateful for today?
3. Light — ask for grace to see today clearly
4. Review — walk through today, hour by hour
5. Sorrow — where did I fall short? Ask forgiveness
6. Resolve — what is one grace for tomorrow?
7. Amen — closes and returns to the launcher

**Controls:**
- Swipe left / right (or press the side button) — move forward / back through the steps
- Swipe up or down from any screen — open Settings
- Swipe from the left edge — exit to the launcher at any time

**Settings (swipe up to open):**
- **Reminder** — On/Off
- **Hour** — 0–23
- **Minute** — 0–59

When the reminder is on, the watch buzzes twice and opens Examen automatically
at the chosen time — precisely scheduled (not polled), so it costs essentially
nothing in battery when idle, and nothing at all when the reminder is off.

## Files

| File | Purpose |
|---|---|
| `examen.app.js` | The whole app — prayer flow + settings screen. Installed as `examen.app.js`. |
| `exmane.boot.js` | Runs automatically at every startup; schedules the one-time reminder alarm. Installed as `examen.boot.js`. |
| `app-icon.js` | Source for the launcher icon. Evaluated once to produce `examen.img` — see "Changing the icon" below. |
| `metadata.json` | Tells the App Loader's "Install App from Files" tool how to install everything above, including converting the icon. |

Settings are stored on the watch in `examen.json`, created automatically the
first time you open Settings.

## Notes on the reminder / battery

`exmane.boot.js` doesn't poll the clock, it calculates the exact time until the
next reminder and sets a single timer for that gap, so the watch can sleep
fully in between. Changing the time or toggling the reminder in Settings
reschedules that timer immediately (via a small function `exmane.boot.js` exposes
globally), rather than waiting on any interval to notice. With the reminder
off, nothing is scheduled at all.

One trade-off: this reminder is private to the app and won't appear in the
watch's own "Alarms & Timers" list, since it doesn't use the system `sched`
scheduler (that would require the Alarm app as a dependency and would show
a generic alarm screen rather than opening Examen directly).

