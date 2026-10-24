<!-- English -->

# tenkyu

**tenkyu 0.067**

A clock app for Bangle.js 2 that lets you read the time, the phases of the Moon and related information from the relative positions of the Sun, Earth and Moon.

## 1. Purpose of tenkyu

tenkyu is an approximate clock that lets you look not only at the current time, but also at **how the Sun, Earth and Moon are positioned relative to one another right now** on the small screen of a wristwatch.

The clock face shows the Sun, Earth, Moon, the day and night sides of the Earth, the selected location, sunrise and sunset directions, the phase of the Moon, date and time, native Bangle.js status widgets, and the selected country and place name. The Earth is drawn as a simplified map. Its astronomical orientation is calculated from the absolute UTC time and the selected longitude, independently of the civil time-zone or daylight-saving-time setting used for the text clock.

The Moon is shown around the Earth using a simplified model based on the mean synodic month. You can enjoy watching, like a small celestial model, how the Moon moves as the date advances and how its position relates to the Sun around full moon and new moon.

Because the display also shows the angle from Earth at which the sunlit portion of the Moon is visible, you can read the Moon's phase from it as well.

The interval from the Moon's upper transit to high tide is also roughly constant for each locality. In Tokyo, for example, high tide is roughly 5 hours 20 minutes after the Moon's upper transit, so the approximate timing can be read from the display. This is not precise, but can be useful for activities such as fishing.

The Earth display can also be used to make a rough reading of the current time for acquaintances in other countries, not only at your own location.

Using the built-in five-week calendar, you can select another date and display the clock for that date. This allows you to view daylight and darkness, and the Moon's phase, not only now but also several days or weeks ahead.

> tenkyu is a simplified model intended for educational, display and hobby use. Do not use it for astronomical observation, navigation, surveying or any other purpose requiring high-precision ephemerides or position calculations.

## 2. How to use

### tenkyu screen

- **Single tap**: Open the five-week calendar.
- **Double tap**: Open tenkyu settings.
- **BTN**: Open the Bangle.js launcher.

The location display at the bottom-right changes according to the selected location method.

- **Place name**: Shows the country on the upper line and the municipality or city on the lower line.
- **Manual**: Shows latitude and longitude.
- **GPS**: Shows a satellite symbol together with latitude and longitude.

### Five-week calendar

- Displays 35 days, Monday to Sunday, across five weeks.
- Saturdays are blue, Sundays and public holidays are red, and today is green.
- **Double-tap** a date to select it; the selected date blinks yellow.
- **Single-tap** the calendar to return to the clock display while retaining the selected date blinking yellow.
- **Double-tap** outside the date cells to clear the selected date.
- **Swipe up or down** to move backwards or forwards by five weeks.

### Location settings

There are three ways to set the location.

**Place 
- Select country → capital. Representative cities are also included for some large countries that use several civil time zones → push "Use place >".

**Manual**
- Enter latitude and longitude directly.

**GPS**
- GPS is used only when **Get GPS fix** is selected in the settings screen.
- GPS is switched off after a valid fix, after cancelling, or when leaving the settings screen.
- GPS is not used during normal clock display. A saved GPS fix is used only as stored latitude and longitude.

### Time display source

The date and time drawn by tenkyu can be selected independently from the astronomical calculation.

- **Bangle** (default): Uses the same local date and time currently shown by Bangle.js.
- **Place**: When a named place is selected, tenkyu converts the watch's absolute UTC time using the standard UTC offset and daylight-saving-time (DST) rule stored for that place.

Changing **Time source** never changes the Sun / Earth / Moon geometry. The astronomical display always uses UTC.

Place time is available only for **Place name** locations. Manual and GPS locations do not contain enough information to determine a legal civil time zone reliably, so they fall back to Bangle time.

tenkyu does not change the Bangle.js system time zone or DST setting when Place time is used. The conversion is performed only inside orbit.

### Roman hour scale

Roman numerals sit just outside the lunar orbit. A revolution represents 24 hours, so I–XII occur twice. The labels follow **Time source** (Bangle / Place) and align with the observer's zenith direction; XII is not necessarily on the Earth–Sun line because civil noon differs from apparent solar noon.

- Open **Dial** in the settings root menu for the Roman hour scale options.
- **Enabled**: Show or hide the Roman numerals (default on). Hiding them preserves the size and interval settings.
- **Hour size**: 6–12 pixels (default 8).
- **Hour step**: Show every 1, 2, 3 or 6 hours (default 1).
- The Moon and status/date/time overlays take priority where they overlap the scale. Large orbit/font settings can hide some labels at the screen or widget boundary.

The display name is `tenkyu` and the internal app ID and storage filenames use `orbit`. This release uses the refined tenkyu implementation. No settings are imported from the standalone tenkyu app. Select tenkyu in the watch's system settings to use it as the default clock.

### Display refresh

The time area updates once per minute. The rest of the clock face redraws at five-minute boundaries. A single minute timer schedules both, and stops while the LCD is off or another screen is open. Opening the clock or waking the LCD redraws immediately. Widget redraws restore header text as needed. These reduce application drawing work; battery-life improvement has not been measured.

### Settings menu

Default settings: Roman hour numerals are hidden, the date is below the Sun, the time is in the header, and the location is Japan / Tokyo / Chiyoda-ku (35.6940 N, 139.7536 E). Existing saved settings are retained when updating.

The root menu contains six categories: **Location**, **Date/time**, **Bodies**, **Dial**, **Digital clock**, and **Calendar**. Location contains place names, manual coordinates and GPS; Date/time contains the time source; Bodies contains view direction, body sizes and lunar orbit radius; Dial contains the Roman numeral toggle, size and interval; Digital clock contains date/time positions and font sizes; Calendar contains holiday region, auto-return, events and cache management. Events and cache menus return to Calendar.

### Other settings

- **Date pos / Time pos**: Header / Top left / Below Sun can be selected independently.
- **Date size / Time size**: Font sizes for on-face date/time text. The date keeps its existing theme; the time is steady black text on a white background.
- **View side**: North / South
- Display sizes of the Sun, Earth and Moon
- Lunar tenkyu radius
- Public holiday region: Japan / England & Wales / Scotland / Northern Ireland
- Calendar auto-return time
- Anniversaries and exceptional holidays
- Deletion of holiday cache

When the normal Bangle.js wrist-view gesture wakes the watch, tenkyu restores the LCD/backlight for the configured system LCD timeout. This does not affect the astronomical calculation.

## 3. Sources, licences and related information

### Solar position

The approximate solar-position formulae are based on NOAA's **General Solar Position Calculations**.

- NOAA Global Monitoring Laboratory, *General Solar Position Calculations*  
  https://gml.noaa.gov/grad/solcalc/solareqns.PDF

`solarPosition()` calculates the fractional year, equation of time, solar declination, true solar time, hour angle, and solar elevation / azimuth.

### 24-hour rest graph

Every five minutes, a **five-stage rest bar** extends **outward from the lunar orbit**. There are 288 positions per 24 hours. Bars are **green by day and yellow by night**. The rest bars intentionally overwrite the Moon (foreground); the red observer point stays above them.

The accelerometer's screen-normal **Z axis** is high-pass filtered to remove gravity and slow orientation changes. Both directions of motion are counted as peaks in the **absolute value** of the filtered signal. Each interval first records the **percentage of detected peaks at or below the configured threshold**, then displays a five-stage height: 0–19% → 1, 20–39% → 2, 40–59% → 3, 60–79% → 4, 80–100% → 5. The goal is approximately **walking/high motion=1, desk work=3, sleep-like stillness=5**, but actual values depend on watch movement and peak threshold and must be validated on-device; this is not a sleep classifier. An otherwise valid and worn interval with no peaks is 100%. An incomplete interval (under 270 s coverage) has no bar. Non-wear, inferred from absent pulse plus low **3-axis acceleration-vector drift**, also has **no bar (stage 0)**. The 3-axis non-wear test is orientation-independent: it averages X/Y/Z readings in one-second windows and compares each averaged vector with the initial one using a single Euclidean-distance threshold in g. This detects both tilt and magnitude changes; the seven 0.001–0.729 g settings now appear under **Non-wear → 3D drift**. The separate five-stage rest activity calculation still uses Z-axis peaks. Stage 1 remains visible even at 0% quiet peaks.

**Rest graph** settings: **Enabled**, **Max bar height** (stage 5: 1–14 pixels, default 10), **Peak threshold** (seven choices from 0.001 to 0.729 g), and **Non-wear** options. Recording continues with the LCD off and in other apps. History survives restarts. Percentage data from v2 are read, and new v3 history distinctly stores missing and non-wear as separate codes; the incompatible v1 levels are not reused. A different date selected in the calendar hides the live graph. On a valid pulse, the HRM LED is switched off early; otherwise it runs up to the configured maximum. The 288 day/night bar colors are cached by five-minute slot, not recalculated for each redraw.

Previous behavior (v0.065) required pulse evidence for all rest bars.

**Motion-first non-wear policy (v0.066):** first require 270 seconds of valid three-axis accelerometer coverage in the five-minute bin. If 3D vector drift is **above the selected threshold**, always draw the existing Z-peak-based **stage 1–5 bar regardless of heart-rate results**. If the drift is **at or below the threshold** (motionless), a valid detected heartbeat produces **stage 5**; an absent, failed, pending, or unavailable heartbeat produces **stage 0 (no bar)**. An insufficient accelerometer record is still unknown (no bar). This is the user-selected prioritization, not proof that the watch is truly off-wrist; e.g., an immobile sleeping wearer whose optical sensor cannot register a pulse will be shown as unworn. Probe results may update the last completed interval. In **Rest graph → Last check**, see the recent result, reason, HRM status, 3D drift and covered seconds. Historic recorded bars are not reclassified; they age out after 24 hours.

### Moon phase

Moon-phase display uses the mean synodic month.

- Fred Espenak, NASA/GSFC, *Six Millennium Catalog of Phases of the Moon*  
  https://eclipse.gsfc.nasa.gov/phase/phasecat.html
- New Moon at 18:14 UTC on 6 January 2000  
  https://eclipse.gsfc.nasa.gov/phase/phases1901.html

NASA/GSFC material gives the mean synodic month around the year 2000 as approximately 29.530588 days. tenkyu uses a simplified periodic model based on this value and does not reproduce the variation between individual synodic months.

### Public holidays

Japan:
- Cabinet Office, Government of Japan, “National Holidays”  
  https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html

United Kingdom:
- GOV.UK, “UK bank holidays”  
  https://www.gov.uk/bank-holidays

### Representative locations for Japanese municipalities — `japan-municipalities.dat`

**Main sources**

- Ministry of Land, Infrastructure, Transport and Tourism (MLIT), National Land Numerical Information, **Municipal Offices and Public Meeting Facilities Data (P05), 2022 edition**  
  https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-P05-2022.html
- Licence: **CC BY 4.0**  
  https://creativecommons.org/licenses/by/4.0/

Locations classified by P05 as `P05_002=1` (main offices: city, ward, town and village offices) are used as representative locations for municipalities.

For the tenkyu 0.04 data update, the municipality-code mapping and representative-location table from the open-source **jp-address-search** project, created from P05-22, were used to recreate the coordinates while preserving orbit's existing municipality display names and prefecture order.

- uiuifree / jp-address-search  
  https://github.com/uiuifree/rust-jp-address-search
- Project licence: **MIT License**  
  https://github.com/uiuifree/rust-jp-address-search/blob/main/LICENSE
- Process used to create representative-location data from P05  
  https://github.com/uiuifree/rust-jp-address-search/blob/main/src/bin/update_city_location.rs

For three locations where the conversion process cannot use the P05 main-office record as-is (Katagami, Namie and Iitate), the representative point for the municipal-office address is corrected using the Geospatial Information Authority of Japan (GSI) address search. Unless otherwise stated, GSI web content may be used under the Public Data License 1.0 (PDL1.0).

- GSI content terms of use  
  https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html

**Processing carried out for orbit**
- Matching municipality codes to the existing tenkyu display names
- Retaining city-level entries for designated cities, preserving the municipality granularity previously used by tenkyu
- Rounding latitude and longitude to four decimal places
- Recreating the per-prefecture random-access offset table `jpidx`

The romanised place names used for display are the existing tenkyu spellings and are not spellings supplied by MLIT.

**Attribution**  
Based on “National Land Numerical Information (Municipal Offices and Public Meeting Facilities Data)” (MLIT, 2022 edition, CC BY 4.0), processed and restructured for tenkyu with reference to the public conversion process in jp-address-search.

### Countries and capitals worldwide

The country names and capital coordinates are a static place table created during development with reference to the legacy open-source version of REST Countries. The legacy open-source repository is distributed under MPL 2.0.

- REST Countries legacy open-source repository  
  https://github.com/restcountries/restcountries
- Mozilla Public License 2.0  
  https://www.mozilla.org/MPL/2.0/

tenkyu does not call the currently hosted REST Countries API at run time. Representative cities later added for some countries with multiple civil time zones were added manually for orbit.

### Time zones and daylight saving time

The compact Place-time table was prepared with reference to the IANA Time Zone Database (tzdb) and the open-source **countries-and-timezones** project.

- IANA Time Zone Database / tz repository  
  https://github.com/eggert/tz
- tz code and data are, unless otherwise specified in that repository, public domain.
- manuelmhtr / countries-and-timezones  
  https://github.com/manuelmhtr/countries-and-timezones
- Licence: **MIT License**  
  https://github.com/manuelmhtr/countries-and-timezones/blob/master/LICENSE

tenkyu does not include or execute the full tzdb. It stores the standard UTC offset and a compact shared DST-rule id for the named places included in orbit, and calculates the displayed Place time locally.

Civil time-zone and DST rules are set by governments and can change. Therefore the Place-time table is a static approximation that may require updating when rules change. It must not be used where legally authoritative or safety-critical local time is required.

### Bangle.js / Espruino

- Bangle.js App Loader / BangleApps  
  https://github.com/espruino/BangleApps
- Espruino Bangle.js documentation  
  https://www.espruino.com/Bangle.js
- Espruino Reference  
  https://www.espruino.com/Reference

### tenkyu software licence

tenkyu follows the BangleApps repository licensing policy and is provided under the **MIT License**. See the repository-root `LICENSE` file for details.

Third-party data remains subject to the respective terms and licences listed above.

### Creator

onisY

---

<!-- 日本語 -->

# tenkyu

**tenkyu 0.067**

Bangle.js 2 用の、太陽・地球・月の位置関係から時刻、月の満ち欠け等を読み取る時計アプリです。

## 1. tenkyuの目的

tenkyu は、現在時刻だけでなく、**「今、太陽・地球・月がどのような関係にあるか」**を腕時計の小さな画面で眺める、大まかな時計です。

時計画面には、太陽、地球、月、地球の昼側・夜側、設定地点、日の出・日の入り方向、月の満ち欠け、日付・時刻、Bangle.js標準の状態ウィジェット、設定した国名・地名などを表示します。地球は簡略化した地図として描かれます。天体配置と地球の回転角は絶対時刻（UTC）と設定経度から算出し、文字として表示する現地時刻のタイムゾーンやサマータイム（DST）からは独立しています。

月は平均朔望月を使った簡略モデルで地球の周囲に表示します。満月・新月のころの太陽との位置関係や、日付を進めたときの月の動きを、天体模型のように楽しめます。

また、月の太陽に照らされた部分が地球から見える角度がわかるので、月の満ち欠け（月相）も読み取ることが出来ます。

そして、月の南中から満潮までの時間は地域毎に概ね一定（東京なら月の南中の5時間20分後くらいに満潮）なので、画面からだいたい読み取れます。これは正確ではないですが、釣りなどに役立ちます。

また、自分の場所だけでなく、地球の図から、他の国々にいる知人の現在時刻もだいたい読み取れます。

内蔵の5週間カレンダーで別の日を選ぶと、その日を基準に 時計画面を表示できます。現在だけでなく、数日後・数週間後の昼夜や月相を眺めることができます。

> tenkyu は教育・表示・趣味用途を目的とした簡略モデルです。天文観測、航法、測量など、高精度な天体暦や位置計算を必要とする用途には使用しないでください。

## 2. 使い方

### tenkyu 画面

- **1回タップ**: 5週間カレンダーを開きます。
- **2回タップ**: tenkyu の設定画面を開きます。
- **BTN**: Bangle.js のランチャーを開きます。

画面右下の位置表示は設定方法によって変わります。

- **Place name**: 上段に国名、下段に市区町村名または都市名を表示します。文字は可能な範囲で大きくし、月が近い場合は重なりを避けるように移動します。
- **Manual**: 緯度・経度を表示します。
- **GPS**: 衛星マークと緯度・経度を表示します。

### 5週間カレンダー

- 月曜日から日曜日まで、5週間分の35日を表示します。
- 土曜日は青、日曜日・祝日は赤、今日は緑で表示します。
- 日付を**2回タップ**すると、その日を選択し、黄色で点滅します。
- カレンダーを**1回タップ**すると、選択した日を保持したまま 時計表示へ戻ります。
- 日付欄以外を**2回タップ**すると、選択日を解除します。
- **上下スワイプ**で5週間単位に前後へ移動します。

### Location 設定

位置設定は3方式です。

**Place name**
- 原則として国 → 首都を選択します。複数の標準時を持つ広い国の一部には代表都市も収録しています。は


**Manual**
- 緯度・経度を直接設定します。

**GPS**
- 設定画面で **Get GPS fix** を実行したときだけ GPS を使用します。
- 有効な測位結果を得た後、キャンセルしたとき、または設定画面を離れたときには GPS をOFFにします。
- 通常の時計表示中に GPS は使用しません。保存済みの測位結果は単なる緯度・経度として使うため、通常表示時のGPS電力消費はありません。

### 時刻表示の基準

tenkyuが文字として表示する日付・時刻は、天体配置の計算とは独立して選択できます。

- **Bangle**（初期設定）: Bangle.js本体が現在表示している現地日時をそのまま使用します。
- **Place**: Place nameで地名を選択した場合、その地点に保存された標準UTC差とDSTルールを使い、Bangle本体の絶対時刻（UTC）から現地日時をtenkyu内部で算出します。

**Time sourceを変更しても、太陽・地球・月の配置は変化しません。** 天体配置は常にUTCから計算します。

Place timeを利用できるのは **Place name** で地点を選択した場合です。Manual/GPSの緯度・経度だけから法的なタイムゾーン境界を正確に特定することはできないため、Manual/GPSではBangle timeへフォールバックします。

Place timeを使用しても、Bangle.js本体のタイムゾーン設定やDST設定は変更しません。現地時刻への変換はtenkyuの内部だけで行います。

### ローマ数字の時刻目盛り

月の軌道の少し外側にローマ数字を表示します。一周が24時間に対応するため、Ⅰ〜Ⅻを午前・午後の2回配置します。数字の位置は **Time source**（Bangle / Place）に従い、設定地点の天頂線に対応します。標準時と真太陽時には差があるため、Ⅻが太陽方向と一致するとは限りません。

- 設定のルート階層にある **Dial（文字盤）** に、ローマ数字の設定をまとめています。
- **Enabled**：ローマ数字の表示をオン・オフ（初期値オン）。オフにしても文字サイズと間引きの設定を保持します。
- **Hour size**：文字サイズ6〜12ピクセル（初期値8）。
- **Hour step**：1・2・3・6時間おきに表示（初期値1）。
- 月・地名・日付・時刻を優先して描画します。軌道や文字を大きくすると、一部の数字が画面端やウィジェットに隠れる場合があります。

内部IDと保存ファイル名も `tenkyu` です。独立した新しいアプリとしてインストールしてください。設定・地名・イベントはtenkyuの初期設定から始まり、旧Orbitやtenkyugiのデータは取り込みません。標準時計にする場合は、本体の設定でtenkyuを選択してください。

### 画面の更新

時刻の領域だけを毎分更新し、時計画面のその他の部分は5分区切りで更新します。タイマーは1本にまとめ、LCD消灯時や別画面への切り替え時には停止します。時計画面を開いた時やLCD復帰時は即座に描画します。ウィジェット更新時には必要なヘッダー文字を復元します。描画処理を減らす設計であり、実際の電池持ちの改善量は未測定です。

### 設定メニューの構成

トップは **Location（地域）・Date/time（日時）・Bodies（天体配置）・Dial（文字盤）・Digital clock（デジタル時計）・Calendar（カレンダー）** の6分類です。

- **地域**：地名選択、緯度・経度の手動設定、GPS、現在の座標。
- **日時**：時刻の基準（Bangle / Place）、時計画面へ戻る。
- **天体配置**：北・南の表示方向、太陽・地球・月の大きさ、月の公転半径。
- **文字盤**：ローマ数字のオン・オフ、文字サイズ、間引き。
- **デジタル時計**：日付・時刻の表示位置と文字サイズ。
- **カレンダー**：祝日地域、自動復帰時間、記念日・独自休日、祝日キャッシュ。記念日・キャッシュ画面から戻るとカレンダー設定へ戻ります。

### その他の設定

- Date pos / Time pos で Header / Top left / Below Sun を個別に選択できます。
- Date size / Time size で、描画面に表示する場合の文字サイズを選択できます。日付の配色は従来どおりで、時刻は白背景に黒文字で点滅せず表示します。
- **View side**: North / South
- 太陽・地球・月の表示サイズ
- 月の公転半径
- 祝日地域: Japan / England & Wales / Scotland / Northern Ireland
- カレンダーの自動復帰時間
- 記念日・独自休日
- 祝日キャッシュの削除

## 3. 出典、ライセンスなど

### 太陽位置

太陽位置の概算式は NOAA の **General Solar Position Calculations** を参考にしています。

- NOAA Global Monitoring Laboratory, *General Solar Position Calculations*  
  https://gml.noaa.gov/grad/solcalc/solareqns.PDF

`solarPosition()` では fractional year、equation of time、solar declination、true solar time、hour angle、solar elevation / azimuth を求めています。

### 24時間の安静度グラフ

月の軌道から**外側に伸びる5段階の棒**で5分ごとの安静度を表します（24時間、288本）。**棒は月より手前に描画**し、赤い観測点はさらに前面に保持します。色は日の出～日の入りが緑、夜間が黄色です。

画面と垂直なZ軸の加速度を重力成分から分離し、その絶対値ピークのうち閾値以下の割合を記録します。棒の長さへの換算は **0〜19%=段階1、20〜39%=2、40〜59%=3、60〜79%=4、80〜100%=5** です。目安として**歩行=1、デスクワーク=3、睡眠時の無動=5**を目標にしますが、実際の動きや閾値に依存し、睡眠・活動状態を確定する分類器ではありません。完全に静止してピークがない装着区間は5、非装着と観測不足は棒なし（非装着の段階0）です。非装着判定はZ軸だけではなく、**X/Y/Zの3軸加速度ベクトル**を1秒ごとに平均し、区間冒頭の平均ベクトルからの距離で判定します。時計の置き方によらず同じ閾値（g単位）を使用し、姿勢方向の変化と加速度の大きさの変化を両方検出します。設定は **Non-wear → 3D drift** で、従来の7段階を引き継ぎます。安静度の5段階は従来どおりZ軸ピークで計算します。

設定 **Rest graph** の **Enabled**、**Max bar height**（段階5の高さ：1〜14画素、初期値10画素）、**Peak threshold**（0.001〜0.729g、7段階）、**Non-wear**を調整できます。画面消灯中や他アプリでも加速度を記録します。5分ごとの心拍試験は有効な脈を検出した時点でLEDを消灯し、未検出なら最大設定秒数まで継続します。v0.063の記録形式（v3）では非装着と欠損を区別し、v2の割合データも引き継ぎます。v1の古い5段階データとは混在させません。描画時の288区間の昼夜判定はキャッシュして不要な再計算を抑えます。

以前のv0.065は、動いていても心拍を検出できなければ棒を非表示としていました。

**v0.066の判定優先順位：**5分間に270秒以上の有効な3軸加速度記録があれば、まず**3軸加速度ベクトルの変動**を設定閾値と比較します。**変動が閾値を超えたら、心拍検出の有無・失敗に関係なくZ軸ピークから安静度1～5を描画**します。**変動が閾値以下なら、心拍検出が確認された場合だけ安静度5**、心拍が未検出・計測失敗・未実施・未確定なら**非装着0（棒なし）**です。有効な加速度記録が270秒未満のときだけ判定不能（棒なし）にします。静止して眠っている装着者で心拍センサーが脈を検知できなかった場合にも0になる可能性があります。診断画面 **Rest graph → Last check** には判定結果と理由、心拍状態、3D変動量、有効データ時間を表示します。過去の棒は再判定しないため、24時間以内に順次入れ替わります。

### 月相

月相表示では平均朔望月を用いています。

- Fred Espenak, NASA/GSFC, *Six Millennium Catalog of Phases of the Moon*  
  https://eclipse.gsfc.nasa.gov/phase/phasecat.html
- 2000年1月6日 18:14 UTC の新月表  
  https://eclipse.gsfc.nasa.gov/phase/phases1901.html

NASA/GSFC の資料では2000年の平均朔望月を約29.530588日としています。tenkyu はこれを基礎にした簡略周期モデルであり、個々の朔望月の変動は再現しません。

### 祝日

日本:
- 内閣府「国民の祝日について」  
  https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html

英国:
- GOV.UK “UK bank holidays”  
  https://www.gov.uk/bank-holidays

### 日本の市区町村代表地点 — `japan-municipalities.dat`

**主な出典**

- 国土交通省「国土数値情報（市町村役場等及び公的集会施設データ）P05、2022年（令和4年）版」  
  https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-P05-2022.html
- ライセンス: **CC BY 4.0**  
  https://creativecommons.org/licenses/by/4.0/

P05の施設分類 `P05_002=1`（本庁: 市役所・区役所・町役場・村役場）の位置を、市区町村の代表地点として利用しています。

tenkyu 0.04 のデータ更新では、P05-22から作成されたオープンソースの変換表 **jp-address-search** の市区町村コード対応と代表地点表を用いて、tenkyu の既存の市区町村表示名・都道府県順を維持したまま座標を再作成しました。

- uiuifree / jp-address-search  
  https://github.com/uiuifree/rust-jp-address-search
- 同プロジェクトのライセンス: **MIT License**  
  https://github.com/uiuifree/rust-jp-address-search/blob/main/LICENSE
- P05から代表地点データを作成する処理  
  https://github.com/uiuifree/rust-jp-address-search/blob/main/src/bin/update_city_location.rs

同変換処理でP05の本庁記録をそのまま利用できない3地点（潟上市、浪江町、飯舘村）は、国土地理院の住所検索による役場所在地代表点で補正されています。国土地理院ウェブコンテンツは、特段の記載がない限り公共データ利用規約（PDL1.0）に基づき利用できます。

- 国土地理院コンテンツ利用規約  
  https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html

**tenkyu側で行った加工**
- 市区町村コードと既存のorbit表示名を対応付け
- 政令指定都市は市レベルを採用し、tenkyuが従来扱っていた市区町村の粒度を維持
- 緯度・経度を小数点以下4桁に丸める
- 都道府県ごとのランダムアクセス用オフセット表 `jpidx` を再作成

表示用のローマ字地名は既存tenkyuの表記を保持しており、国土交通省が作成した表記ではありません。

**出典表示**  
「国土数値情報（市町村役場等及び公的集会施設データ）」（国土交通省、2022年版、CC BY 4.0）をもとに、jp-address-search の公開変換処理を参考として tenkyu 用に加工・再構成。

### 世界の国・首都

世界の国名・首都座標は、開発時に REST Countries の旧オープンソース版を参考に作成した静的な地点表です。旧オープンソース版は MPL 2.0 で公開されています。

- REST Countries legacy open-source repository  
  https://github.com/restcountries/restcountries
- Mozilla Public License 2.0  
  https://www.mozilla.org/MPL/2.0/

現在の hosted REST Countries API を tenkyu が実行時に呼び出すことはありません。複数標準時を持つ一部の国について後から追加した代表都市は、orbit専用に手動で追加したものです。

### Bangle.js / Espruino

- Bangle.js App Loader / BangleApps  
  https://github.com/espruino/BangleApps
- Espruino Bangle.js documentation  
  https://www.espruino.com/Bangle.js
- Espruino Reference  
  https://www.espruino.com/Reference

### tenkyu のソフトウェアライセンス

tenkyu は BangleApps リポジトリのライセンス方針に従い、**MIT License** で扱います。詳細はリポジトリ直下の `LICENSE` を参照してください。

第三者データには上記それぞれの利用条件・ライセンスが適用されます。
### タイムゾーン・サマータイム

Place time用のコンパクトな時刻データは、IANA Time Zone Database（tzdb）およびオープンソースの **countries-and-timezones** を参考に作成しています。

- IANA Time Zone Database / tz repository  
  https://github.com/eggert/tz
- 同リポジトリのtz code/dataは、特記があるファイルを除き public domain
- manuelmhtr / countries-and-timezones  
  https://github.com/manuelmhtr/countries-and-timezones
- ライセンス: **MIT License**  
  https://github.com/manuelmhtr/countries-and-timezones/blob/master/LICENSE

tenkyuは完全なtzdbを収録・実行するのではなく、orbitに収録した地名について、標準UTC差と共通DSTルールIDを小さな表として保持し、Place time表示時にtenkyu内部で現地日時を計算します。

タイムゾーンやDST制度は各国・地域の政策によって変更されることがあります。そのため、このPlace timeデータは静的な近似データであり、制度変更時には更新が必要になる場合があります。法的に厳密な時刻や安全上重要な用途には使用しないでください。

### 作者

onishi

## Day/night observer line (0.02)

The line extending from the red observer dot is green when the solar center is at or above the geometric horizon, and yellow when below it. This matches the existing geometric sunrise/sunset definition, without atmospheric refraction. Color transitions are checked each minute, including polar day/night.

### 位置の赤点から伸びる線の昼夜色（0.02）

太陽中心が幾何学的な地平線以上なら緑、下なら黄色です。従来の日の出・日の入り線と同じ基準で、大気差は含みません。白夜・極夜を含め毎分色の切り替えを確認します。


## Power management (0.063)

The backlight and touchscreen lock after the configured display timeout; if the system
timeout is 0 or unavailable, tenkyu uses a 10-second fallback. The low-power memory-in-pixel
LCD remains on. Twist and face-up still wake and unlock the watch. Eclipse calculations
are checked about every five minutes outside eclipses, but every 30 seconds when an
eclipse is active, while the clock continues its minute updates. This saves CPU and
touch-controller power without raising the accelerometer polling rate. Power draw and
wrist-gesture behavior still need real-device measurements.

### 省電力動作（0.063）

設定された消灯時間後にバックライトを消し、タッチパネルもロックします。
システムの時間設定が0または未指定なら、10秒を安全側の初期値とします。
LCD自体は表示を保持し、TwistやFace Upで解除します。日食でない通常時は
約5分ごとに日食判定し、発生中だけ30秒ごとに計算します。
時計の時刻は従来どおり毎分更新し、加速度の取得周期も変更しません。
実機での消費電流やジェスチャー動作の確認は未実施です。

## Solar eclipse shading (0.03)

Settings → **Solar eclipse → Enabled** turns calculation and shading on or off (default On).
At the displayed absolute date/time, the Moon's umbra is black. The surrounding penumbra
reduces average surface brightness using black ordered dithering proportional to the
fraction of the Sun covered. This is a geometric illustration, not a simulation of
atmospheric illumination. The red observer dot and its green/yellow line are drawn above
the shadow. Annular eclipses darken the center without treating it as a total shadow.

Eclipse state and shading update every **30 seconds** during an eclipse. Ordinary dates
use cheap screening and retain the existing five-minute base redraw. The option Off
avoids loading eclipse code/data. No GPS, Bluetooth or Internet requests are added.
A subpixel total shadow has a one-pixel black center marker. Only the hemisphere selected
in Bodies → View side is shown. **During any globally detected eclipse, the Moon's outer
rim is red**, even when its shadow is on the hemisphere not currently displayed.
This does not change the Moon phase shading, and the rim returns to its normal
appearance when the eclipse ends (or Solar eclipse is disabled). The existing
30-second eclipse refresh handles the transitions without an extra timer.
Actual watch runtime and battery use remain unmeasured.

### 日食の影（0.03）

設定の **Solar eclipse → Enabled** で計算・表示をオン／オフにできます（初期値オン）。
表示対象の絶対日時における本影を黒で、半影を太陽の隠れる割合に応じた黒い点描で重ねます。
大気による散乱光を含む実際の地表照明の再現ではなく、幾何学的な表示です。
赤い位置点と緑／黄色の線分は、月影より上に描きます。金環日食の中心は部分的に暗くなります。

日食の計算・影の表示は **30秒間隔**です。日食のない日時は軽い判定で詳細計算を省き、
従来の5分間隔の地球再描画を維持します。オフ時は日食コード・係数を読み込みません。
GPS・Bluetooth・通信は追加しません。1画素より小さい皆既の影には中心の黒い1画素を表示します。
Bodies → View sideで選んだ半球だけが表示対象です。ただし、**地球上のどこかで
日食を検出している間は月の外周を赤色**にします。現在の表示半球に影が見えない場合も
赤くなり、満ち欠けの塗り分けは従来どおりです。日食終了時（または日食表示オフ時）は
通常の外観に戻ります。従来の30秒更新を利用し、追加タイマーは使いません。
実機での計算時間・電池消費は未測定です。

### Visible screen-transition feedback (v0.067)

The first tap is acknowledged with a small yellow dot while the 400 ms single/double-tap interval is resolved. Once navigation is determined, tenkyu immediately displays a low-cost **Calendar...**, **Settings...**, **Orbit...** or **Launcher...** transition frame, explicitly flushes it to the memory-in-pixel display, then schedules the expensive new-screen drawing for the next event-loop turn. Calendar swipes similarly display **Calendar...** before updating the 35 date cells, holiday flags and event layers; multiple rapid swipes are combined into a single final repaint. Leaving Settings also displays **Orbit...** before reloading the clock. Screen-wake transitions preserve the existing backlight/lock timeout. This change does not alter tap semantics: one tap opens Calendar; double tap opens Settings.

### 画面遷移の入力応答（v0.067）

最初のタップ時に黄色の小さな点を即時表示し、400msのシングル／ダブルタップ判定中でも入力を受け付けたことが分かるようにしました。画面遷移が決まったら **Calendar... / Settings... / Orbit... / Launcher...** をまず描画・反映し、次のイベントループで詳細な画面を作成します。カレンダーの上下スワイプでも、最初に **Calendar...** を表示してから日付・祝日・予定を更新します。連続するスワイプは最後のページまでまとめて再描画します。設定から時計に戻る際も同じ方式です。時計の消灯・タッチロックの省電力動作、および「1タップ＝カレンダー／2タップ＝設定」の操作仕様は維持します。
