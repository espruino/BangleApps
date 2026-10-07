# CoreTemp

Display body/skin temperature, Heat Strain Index, and battery from a
[CORE](https://corebodytemp.com/) or [calera](https://info.greenteg.com/calera-research)
sensor on Bangle.js. Includes a connection widget, Recorder integration, and
ANT+ heart-rate monitor management through CORE.

## Setup and power

1. Install CoreTemp and open **Settings > Apps > CoreTemp**.
2. Choose **Scan for CORE** and pair your sensor.
3. Leave **Enable** on for app/Recorder access. Turn on **Always On** only for a
   continuous background connection.

Fresh installs enable app access and the widget, with Always On off. Opening
CoreTemp or starting Recorder requests the sensor; releasing the last power
owner disconnects it. Always On keeps its own owner. Turning Enable off stops
normal connections; Settings can still connect temporarily for management.

The widget is **green** for on-demand connections, **blue** for Always On, and
**grey** when disconnected. **Forget <device>** removes CORE identity/cache and
turns Always On off without erasing global BLE bonds or saved ANT+ selections.

## ANT+ HRMs

Open **HRM (ANT+) > Scan ANT+**, select an ID, and choose **Pair**. The scan
window is 5 seconds by default, configurable to 5–30 seconds in the App Loader.
**Status** reads CORE's pairing; **Recent HRMs** and **Preset HRM** (when saved)
let you reuse a selection. The watch has no manual ID entry.

CoreTemp manages one HRM at a time. Replacing or explicitly re-pairing one asks
for confirmation, clears it, waits 2 seconds, then pairs and verifies the result.
If multiple HRMs are paired, use **Clear Paired HRM** first. Failed operations
preserve saved selections. Disconnects abort ongoing operations; reconnecting
never automatically pairs an HRM or replays pair/clear commands.

## BLE compatibility and recovery

CoreTemp 0.12 requires CORE's custom temperature service. Health Thermometer-only
devices are unsupported. Battery and Control Point are optional for temperature
readings; ANT+ management requires Control Point.

Cached handles are tried first. Fresh discovery directly requests CORE service
`00002100-5b1e-4347-b07c-97b514dae121`, avoiding unresolved vendor UUIDs from
unfiltered discovery. BLE operations share one lifecycle queue; obsolete
transports cannot deliver readings or save pairing/cache. HeatSuite pause
owners nest, with reconnection allowed only after the final resume.

BUSY errors receive bounded retries without discarding the cache. Other failures
back off for 5, 10, 20, then 30 seconds while power and connection intent permit.
An explicit disconnect suppresses recovery. Control Point write failures/timeouts
cancel active and queued commands before BLE recovery; protocol errors reject
only their request.

Upgrading to settings version 2 clears the characteristic cache once and removes
`customprofileonly`, preserving CORE identity, explicit power preferences, HRM
selections, and unrelated settings. Legacy ANT+ migration remains retryable and
does not restore an explicitly cleared selection. See [ChangeLog](ChangeLog).

## Troubleshooting

Use **Debug > Partial log** for connection/control traffic or **Full log** to
include measurements; output is saved in `coretemp.log`. **Debug > Status**
shows runtime state, and **Rebuild cache** forces fresh discovery.

A missing `00002101-5b1e-4347-b07c-97b514dae121` means custom temperature discovery
failed. Check the explicit service lookup in the log and rebuild the cache if
failures persist. This does not establish that ANT+ pairing was lost: after BLE
recovers, check **HRM > Status**, including after switching the HRM off/on.

## App integration

With Enable on, subscribe and hold a power owner while readings are needed:

```js
require("CORESensor").enable();
function onCore(data) { print(data.core, data.unit); }
Bangle.on("CORESensor", onCore);
Bangle.setCORESensorPower(1, "myapp");

// Call when the consumer stops.
function stopCore() {
  Bangle.removeListener("CORESensor", onCore);
  Bangle.setCORESensorPower(0, "myapp");
}
```

Measurements include `core`, `skin`, `unit`, `hr`, `hrState`, `heatflux`, `hsi`,
`hsiValid`, `battery`, `dataQuality`, and `flags`; see [protocol.js](protocol.js)
for parsing and unavailable values. [runtime.js](runtime.js) lists the `Bangle`
connection, status, pause/resume, Control Point, HRM, and logging APIs and aliases.
`CORESensorStatus` emits connection status changes.

Recorder's **Core** integration holds its own power owner and writes **Core,
Skin, Unit, HeartRate, HeatFlux, HeatStrainIndex, Battery, Quality**. Settings and
BLE cache live in `coretemp.json`; selected/recent HRMs in `coretemp.hrm.json`.

## Development and hardware checks

From the repository root:

```sh
git submodule update --init core webtools
node apps/coretemp/tests/run.js
npx eslint --max-warnings 0 apps/coretemp/*.js apps/coretemp/tests
git diff --check
```

Tests simulate BLE and include migration and installer packaging. Optional
on-watch checks can record firmware versions and partial logs:

- Cold discovery: upgrade/rebuild, verify readings and HRM Status; retain saved IDs.
- Cached reconnect: reuse handles and receive one event per notification.
- HRM off/on: recover heart-rate data without automatic pairing; interrupt scan/replacement safely.
- CORE out of range: back off and recover; explicit disconnect prevents retries.
- HeatSuite pause/resume: reconnect after the final pause owner releases.
- App switching during discovery: no stale readings/cache writes or shutdown retries;
  verify Recorder and Always On ownership across app exit.

## Contributors

Ivor Hewitt, [Nicholas Ravanelli](https://github.com/nravanelli), and
[Zheng Yifei](https://github.com/zyf0717).
