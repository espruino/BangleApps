# Rest bar and power management (tenkyu v0.068)

## Reuse other apps' HRM readings (v0.080)

The boot-owned rest service installs one shared `Bangle.on("HRM", ...)`
listener while non-wear detection is enabled. A **live**, positive BPM
with confidence **strictly above** the configured threshold is used as
current-bin evidence of wearing, even when tenkyu did not request HRM power.
For trustworthy events, sensor data must be accompanied by recent XYZ
samples. Readings saved in Health or in other historical stores are not
used as live skin-contact evidence.

The fifth-minute optical check is skipped if a reliable shared pulse
has already been received. If a check is needed while
`Bangle.isHRMOn()` says another application is keeping the sensor
powered, tenkyu observes the stream for the check window without
calling `setHRMPower(1, "orbitrest")`. When the sensor is off, tenkyu
requests it under its own ID and only releases its own request.
A streamed HRM signal may therefore prevent any tenkyu-owned HRM
power cycles; it does NOT turn off power requested by other apps.

`Rest graph → Last check → Shared HRM` counts accepted usable HRM
readings processed while tenkyu did not own the sensor. The number
resets if the boot-owned recorder is reconfigured/restarted and is
intended as a debugging indicator, not a measure of total HRM energy.

The previous confirmed worn/unworn hold, white failure arcs,
1-minute then 15-minute failure retries, and 270-second XYZ coverage
rule are preserved. A reliable shared pulse can replace an
earlier provisional failure or non-wear result in a later bin.
If HRM is on but no valid events arrive during an observation window,
the existing failure/backoff rule still applies.

**日本語：** 他のアプリが心拍計を動かしている場合、tenkyuはその
リアルタイム心拍イベントを使用し、不要な独自の電源要求を省きます。
自分が起動していない心拍計は停止しません。設定のLast checkで
「Shared HRM」に再利用した計測イベントの回数を表示します。

## White HRM-failure arcs and backoff (v0.079)

A five-minute interval with >=270 s of valid XYZ coverage and
motionless 3D acceleration now draws a **white orbit arc** for a failed
HRM measurement (new persistent code FD / 253), distinct from the
**red orbit arc** for no accepted pulse after at least one valid HRM
sample was actually returned (FE / 254). Missing accelerometer
coverage remains unpainted (FF / 255). Worn stages still use green
and yellow radial bars.

Failure means the HRM cannot be started, the API is unavailable,
or the complete optical measurement window produced zero well-formed
HRM events. A successful sensor event with 0 BPM or insufficient
confidence is evidence of no accepted pulse, not a sensor I/O failure.
One minute after the first failure, the watch retries. If that also fails,
it retries every 15 minutes, timed from the failure. Until the accelerometer
changes, consecutive eligible bins retain a white indication.
A valid pulse or a completed no-pulse observation holds the resulting
worn/unworn state until motion. Significant movement resets the retry
backoff; invalid/missing accelerometer data clears the retained state.
No data with under 270 s coverage is displayed as white or red.

**日本語：** 心拍計が起動できないか、有効な出力が全くない
測定失敗では、静止している区間を白線で表示します。
最初の失敗は1分後、それ以降は15分間隔で再測定します。
計測値を取得したものの有効な脈拍がない場合は赤線、
加速度データ不足では何も描きません。

## Non-wear/quiet-worn state retention (v0.077)

With **Rest graph → Non-wear → Keep until move** enabled (default), a
completed five-minute bin with at least 270 s valid XYZ coverage, stable
three-axis orientation, and a successful optical test latches the optical
result across future stationary bins. A high-confidence pulse latches
quiet worn (stage 5); a completed HRM probe with no acceptable pulse latches
unworn (red arc). Further five-minute HRM probes are suppressed while still.
A failed HRM start or pending/unknown result does **not** establish a hold.

All accelerometer samples continue to be processed. The held reference
XYZ mean is compared against later one-second means (two consecutive
seconds above the user's 3D drift threshold or one >3×), and short
high-pass acceleration transients can also end a hold. Any invalid sample
or gap over 2.5 seconds revokes the hold. The cache is intentionally
volatile (not stored on flash); reboot/reload requires fresh verification.
Coverage, the 300-second activity normalization, and the non-wear bar/arc
logic remain unchanged. Disable Keep until move to restore five-minute
heart rate probing.

**Caveats:** brief removal and reattachment can escape sampling; a false
negative pulse measurement can remain latched until movement; vibrations
can cancel the hold even when unworn. This is a low-power heuristic rather
than a continuously measured skin-contact indication.

**日本語：** 安静／非装着の確定後、加速度変化が現れるまで状態を保持し、
定期的な光学心拍測定を省きます。加速度監視は継続し、計測欠落や
再起動時には判定をリセットします。心拍センサーの起動失敗は
保持しません。「Keep until move」で従来方式に戻せます。

## Five-minute coverage normalization (v0.076)

For each completed five-minute bin with at least 270 seconds of valid
X/Y/Z coverage, convert the measured gated XYZ high-pass peak sum to
a 300-second equivalent before applying the existing stage thresholds:

`A300 = Araw * 300 / Tvalid` (Tvalid in seconds).

The normalization uses full precision for classification; rounded 3-decimal
values are retained in diagnostics as `activity300` alongside the original
`activity` and coverage seconds. There is no extrapolation for less than
270 seconds of valid coverage: those intervals remain unknown. The independent
motion/non-wear decision and HRM timing are unchanged. Stillness with
accepted pulse remains stage 5, while insufficient coverage remains unknown.
Previously recorded five-minute levels are not recalculated.

**日本語：** 5分区間で有効な3軸加速度計測が270秒以上の場合のみ、
ピーク積算値に `300 / 有効計測秒数` を乗じ、従来の5段階閾値で
判定します。270秒未満は補正せず判定不能とし、心拍・非装着判定
および保存済みの過去の安静グラフは変更しません。

## Three-axis high-pass peak integral

For each XYZ accelerometer sample, independent first-order low-pass filters
maintain gravity/slow-motion baselines. With `tau=1600 ms` and the measured
sample interval `dt`, their smoothing coefficient is `dt/(tau+dt)`, about
a 0.1Hz high-pass response. The vector of high-pass residuals is used only
through its squared norm `q=X'²+Y'²+Z'²`. The comparison `q >= gate²`
runs **before** the local-maximum test; a peak is accepted when the preceding
q is no smaller than the current q and greater than the previous-previous q.
Only a gated accepted local peak requires `sqrt(q_peak)`, with the excess
`sqrt(q_peak)-gate` added to a five-minute sum A (units g per collection of
peaks; NOT integrated acceleration over physical time). Each 5-minute bin
has at most a fixed set of filter/peak-state variables, not a sample array.

Peak gate: seven configurable values [0.001, 0.003, 0.009, 0.027,
0.081, 0.243, 0.729] g, default 0.027g.
Rest levels are selected by four ascending editable sum boundaries,
initially [0.5, 2, 6, 18] g: A<0.5 -> level 5, A<2 -> level 4,
A<6 -> level 3, A<18 -> level 2, otherwise level 1.
In watch settings: **Rest graph → Peak gate** and
**Rest graph → Stage boundaries**. The initial boundary values are
experimental and must be calibrated using actual wearing data.

Separate non-wear rule: require at least 270 seconds of valid three-axis
accelerometer coverage in a five-minute window. If 3D drift exceeds the
chosen **Non-wear → 3D drift** threshold, a rest bar is shown whether
or not HRM detects a pulse. If sufficiently still, positive pulse means
level 5 and absent/pending/failed pulse means level 0 (unworn). Missing
XYZ coverage => unknown (no bar), stored separately from non-wear.

Bars remain green by day, yellow at night, drawn above the Moon and behind
the observer marker. The 288 slots cover the preceding 24 hours.
Their v3 history codes 0..100 retain the same **display** semantics;
new stage levels are coded 0/20/40/60/100, old percentage-based bins
continue to display at their previous stage. Historical bins cannot
be reclassified after changing stage boundaries. The saved active record
includes `metric:2`, gate and cutoffs, preventing reuse of an incompatible
old peak-ratio accumulator or an accumulator from different settings.

## Retained history

Save v3 with 288 hexadecimal bytes: 00–64 (0–100%) for observed data,
FE for non-wear, FF for absent/insufficient data. Load v2 percentages for
backward compatibility but reinterpret v2 zero (which could mean either zero
activity or absent data) conservatively as missing. The previous v1
duration-based levels remain incompatible.

## Power

* After the LCD/backlight timeout, turn off backlight and lock touch input;
  leave the memory-in-pixel LCD displaying the clock. If system timeout=0,
  use a 10-second fallback. Face-up/twist still unlock and light the watch.
* For the 5-minute HRM wear probe, power down the LED immediately after the
  first reliable pulse, otherwise continue up to the selected probe limit
  (default 30s).
* Preserve all existing accelerometer events for peak fidelity but avoid
  unnecessary loops and array allocations in the typical sample path.
* Evaluate eclipse approximately every five minutes when inactive; use the
  existing 30-second precision path when active. The normal time display
  remains updated each minute.
* Cache 288 day/night results with per-slot stamps rather than recomputing
  the full astronomical solar position for every bar on every redraw.
* Real Bangle.js 2 power and wake behavior require a physical test.


## Orientation-independent non-wear (v0.064)

The current rest *level* uses gated XYZ high-pass peak heights (v0.068); the Z-axis description below is historical.
Only the **non-wear** motion gate now uses all three axes. Each accelerometer
sample contributes to a one-second mean vector (X,Y,Z) in g. For a complete
five-minute window, let a0 denote its first one-second mean, and let ai be
subsequent one-second means. Define maximum drift D=max_i ||ai-a0||_2.
A single user-selected threshold (0.001..0.729 g) applies to D, without
axis-specific or orientation-dependent limits. The metric detects both
rotation/tilt of the gravitational acceleration vector and translational
acceleration; there is no expensive atan2/acos/normalization for each sample.
The 1-second averaging suppresses brief outlier spikes (at the cost of
ignoring brief excursions). For typical magnitude near 1g, a pure tilt
of theta radians produces D approximately theta g; 0.009g is roughly 0.52°.

Current policy instead shows an activity bar whenever 3D drift indicates
motion (regardless of HRM). For sufficiently still records, pulse evidence
means stage 5 and missing pulse evidence means non-wear stage 0.
Late HRM results can finalize the most recently closed slot.
The existing persisted `restWearThreshold` config key is retained to avoid
resetting user preferences; its menu label changes from Z range to 3D drift.

## Non-wear finalization and diagnostics (v0.065)

The old algorithm silently treated `noPulse=false` as proof of wearing.
That caused stage 5 on a perfectly motionless unworn watch whenever the HRM
probe was skipped, failed, or completed a little late. It also required a
sample within 2.5 seconds of the beginning/end of each 5-minute slot, even
when well over 270 seconds of data were available.

The HRM status states are 0=pending/unknown, 1=pulse detected,
2=no pulse detected in a completed probe, 3=probe unavailable/failed.
From v0.066 the **motion-first** rule supersedes the v0.065 policy:
- Insufficient valid 3-axis coverage (<270 s in 5 min): unknown, no bar (FF).
- 3D drift *above* the chosen 3D drift threshold: render Z-peak-based rest
  1–5 regardless of heartbeat presence, absence, failure or pending status.
- 3D drift *at or below* the threshold + confirmed pulse: stage 5 (100% / 64).
- 3D drift *at or below* the threshold + no pulse, failed, unavailable or
  uncompleted HRM probe: stage 0, no bar (FE).
- Non-wear Enabled=Off remains an explicit override: normal Z-peak rest bar
  without 3-axis/HRM non-wear filtering.

This intentional policy prioritizes observed motion and may incorrectly mark
a worn, completely motionless user as unworn if optical pulse detection fails.
3D drift threshold is configurable; it is not a medical determination.

One late callback may finalize the immediately preceding five-minute bin.
A detected pulse cancels the remainder of the optical test and schedules
the *next* five-minute bin, not another probe in the current one.
The old strict start/end 2.5s alignment gate is removed; sufficiently
covered intervals are evaluated.

The last 12 completed bins contain a bounded `diag` log in
`orbit.rest.json`, with `bucket`, `coverageSec`, `driftG`, `pulse`,
`result` and `reason`. On-watch: Settings → Rest graph → Last check.
These records are generated at existing five-minute save points. They are
diagnostic estimates, not medically reliable wear or sleep detection.
History from previous releases remains on the graph until it ages out
after 24 hours, including any incorrectly classified stage-5 bars.

## Motion-first classification (v0.066)

Since v0.066, 3D motion no longer depends on HRM for worn recognition.
Since v0.068, the five-stage length instead uses the new 3D gated peak
excess integral, not the original Z-axis peak-count percentage. If the watch remains still, the optical pulse
is the only positive wearing evidence: confirmed pulse => 5; otherwise
non-wear => 0. Unknown/insufficient accel coverage remains distinct (FF).
Diagnostics use `motion`, `pulse_detected_still`, `nonwear`,
`nonwear_hrm_failed`, or `nonwear_hrm_unknown` where applicable.

## Red orbit overlays for non-wear (v0.071)

`visit(now, onWorn, onNonWear)` now optionally calls `onNonWear(bucket)` for the existing code 254 (FE). The original two-argument `visit` contract stays intact and still iterates only worn bars 0..100. Code 255 (FF), including missing data migrated from v2, is never drawn red. Each non-wear bin draws one one-pixel-width red RGB565 `0xF800` line between the start and end angles on the existing radius `MOONORBIT`. The angular span is `2π/288` radians per five-minute interval. Each segment's start point matches the previous segment's end point exactly when bin ranges are contiguous. Both endpoints are calculated with only two per-bin trigonometric calls plus precomputed angle-step sin/cos. Overlay is drawn after the Moon/orbit base, like rest bars, before the topmost observer point, preserving existing layering. No additional sensors, timers or Storage writes are introduced. Historical FE entries are displayed without migration.

## v0.072 confidence and low-power motion-first non-wear

The `Rest graph` activity sum calculation is unchanged. The separate non-wear detector requires >=270 s cumulative valid XYZ coverage within a five-minute bin. It no longer marks the complete slot missing merely because one sample was lost or a timestamp gap exceeded 2.5s; such gaps are excluded from coverage. To suppress spurious worn decisions when a stationary watch exhibits accelerometer jitter, motion is registered only after **two consecutive seconds** of mean-vector displacement above the adjustable 3D threshold, or a displacement above three times that threshold in one second. The qualifying XYZ drift is independent of optical HRM.

An accepted HRM event requires `Number.isFinite(bpm)` and `bpm>0`, and finite confidence **> Pulse confidence**; there is no minimum or maximum BPM cutoff. `confidence` describes confidence in BPM only, not probability of wrist contact; false positives/negatives remain possible. When already moving, do not switch on the optical sensor. When movement starts during a probe, release the `orbitrest` HRM power request immediately. All normal and error stop paths release `orbitrest` when a probe has requested power. Confidence of the best valid BPM event is kept with bounded diagnostics even when below threshold. No new periodic sensor timer is introduced beyond the preexisting HRM window. The settings title displays the exact release version, read-only.
