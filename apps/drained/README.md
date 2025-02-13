# Drained

With this app installed, your Bangle will automatically switch into low power mode when the battery reaches 5% battery (or a preconfigured percentage), displaying a simple clock. When the battery is then charged above 20% (also configurable), normal operation is restored.

Low power mode can also be exited manually, by tapping the primary watch button (an initial tap may be required to unlock the watch).

# Features

## Persistence
- [x] Restore normal operation with sufficient charge
- [x] Reactivate on watch startup

## Time
- [x] Show simple date/time
- [ ] Disable alarms - with a setting?
- [ ] Smarter/backoff interval for checking battery percentage

## No backlight (#2502)
- [x] LCD brightness
- [ ] LCD timeout?

## Peripherals
- [x] Disable auto heart rate measurement in health app (#2502)
- [x] Overwrite setGPSPower() function (#2502)
- [x] Turn off already-running GPS / HRM

## Features
- [x] Wake on twist -> off (#2502)
- [x] Emit `"drained"` event

# Creator

- [bobrippling](https://github.com/bobrippling/)
