<!-- English -->

# orbit

**orbit 0.04 stable**

A clock app for Bangle.js 2 that lets you read the time, the phases of the Moon and related information from the relative positions of the Sun, Earth and Moon.

## 1. Purpose of orbit

orbit is an approximate clock that lets you look not only at the current time, but also at **how the Sun, Earth and Moon are positioned relative to one another right now** on the small screen of a wristwatch.

The clock face shows the Sun, Earth, Moon, the day and night sides of the Earth, the selected location, sunrise and sunset directions, the phase of the Moon, date and time, battery level, and the selected country and place name. The Earth is drawn as a simplified map and rotates according to the time and selected location.

The Moon is shown around the Earth using a simplified model based on the mean synodic month. You can enjoy watching, like a small celestial model, how the Moon moves as the date advances and how its position relates to the Sun around full moon and new moon.

Because the display also shows the angle from Earth at which the sunlit portion of the Moon is visible, you can read the Moon's phase from it as well.

The interval from the Moon's upper transit to high tide is also roughly constant for each locality. In Tokyo, for example, high tide is roughly 5 hours 20 minutes after the Moon's upper transit, so the approximate timing can be read from the display. This is not precise, but can be useful for activities such as fishing.

The Earth display can also be used to make a rough reading of the current time for acquaintances in other countries, not only at your own location.

Using the built-in five-week calendar, you can select another date and display the clock for that date. This allows you to view daylight and darkness, and the Moon's phase, not only now but also several days or weeks ahead.

> orbit is a simplified model intended for educational, display and hobby use. Do not use it for astronomical observation, navigation, surveying or any other purpose requiring high-precision ephemerides or position calculations.

## 2. How to use

### orbit screen

- **Single tap**: Open the five-week calendar.
- **Double tap**: Open orbit settings.
- **BTN**: Open the Bangle.js launcher.

The location display at the bottom-right changes according to the selected location method.

- **Place name**: Shows the country on the upper line and the municipality or city on the lower line. Text is made as large as practical and moves where necessary to avoid overlapping the Moon.
- **Manual**: Shows latitude and longitude.
- **GPS**: Shows a satellite symbol together with latitude and longitude.

### Five-week calendar

- Displays 35 days, Monday to Sunday, across five weeks.
- Saturdays are blue, Sundays and public holidays are red, and today is green.
- **Double-tap** a date to select it; the selected date blinks yellow.
- **Single-tap** the calendar to return to the clock display while retaining the selected date.
- **Double-tap** outside the date cells to clear the selected date.
- **Swipe up or down** to move backwards or forwards by five weeks.

### Location settings

There are three ways to set the location.

**Place name**
- Outside Japan: normally select country → capital. Representative cities are also included for some large countries that use several civil time zones.
- Japan: select prefecture → municipality.

**Manual**
- Enter latitude and longitude directly.

**GPS**
- GPS is used only when **Get GPS fix** is selected in the settings screen.
- GPS is switched off after a valid fix, after cancelling, or when leaving the settings screen.
- GPS is not used during normal clock display. A saved GPS fix is used only as stored latitude and longitude, so there is no GPS power consumption during normal display.

### Other settings

- **View side**: North / South
- Display sizes of the Sun, Earth and Moon
- Lunar orbit radius
- Public holiday region: Japan / England & Wales / Scotland / Northern Ireland
- Calendar auto-return time
- Anniversaries and exceptional holidays
- Deletion of holiday cache

## 3. Program structure

### `app.js`

The main clock program. Its principal responsibilities are:

- Date, time and battery display
- Approximate solar-position calculation
- Drawing the Earth, day/night boundary and simplified map
- Observer location and sunrise/sunset directions
- Moon position and phase display
- Country/place name or coordinate display
- Tap detection
- Switching between the clock and calendar
- State handling when the LCD turns OFF/ON

On Bangle.js it is stored as `orbit.app.js`.

### `calendar.js`

The built-in five-week calendar.

- Creation of 35 days of calendar data
- Weekday, today and weekend display
- Public-holiday calculation for Japan and the three UK regions
- Anniversaries and exceptional holidays
- Date selection and blinking
- Page movement in five-week steps
- Small yearly holiday caches

On Bangle.js it is stored as `orbit.cal.js`.

### `settings.js`

The settings screen.

- Place name / Manual / GPS
- On-demand GPS fixing and reliable GPS power-off
- North / South
- Celestial-body sizes and lunar-orbit size
- Calendar region
- Anniversaries and exceptional holidays
- Holiday-cache management

On Bangle.js it is stored as `orbit.settings.js`.

### `locations.js`

Contains the country, capital and selected representative-city data, together with the Japanese prefecture index. Because the full list of Japanese municipalities is relatively large, it is kept in a separate file. The `[offset, length]` pair for each prefecture is stored in `exports.jpidx`.

### `japan-municipalities.dat`

Contains the orbit display name and representative latitude/longitude for municipalities throughout Japan, stored as concatenated JSON arrays by prefecture.

The whole data set is not expanded into RAM during normal operation. When a prefecture is selected in Place name settings, only the corresponding section is read with `Storage.read()` using `jpidx` from `locations.js`.

### User data

- `orbit.json`: Location, view direction, celestial-body sizes, etc.
- `orbit.cal.json`: Calendar region, auto-return time, etc.
- `orbit.events.json`: Anniversaries and exceptional holidays

The location coordinates `manualLat` / `manualLon` are used as the common reference values. Place name, Manual and GPS all ultimately update these coordinates.

### Optimisation for Bangle.js 2

- Simplified coastlines on the map
- Precalculation of fixed Sun and map geometry
- Reuse of drawing arrays to reduce garbage-collection load
- Caching of Moon geometry for a fixed period
- Loading place-name tables only when required
- Loading Japanese municipalities one prefecture at a time
- Compact yearly bit-table caching for public holidays
- GPS used only while setting a location

When modifying the app, it is generally more stable on Bangle.js 2 to favour **load-on-demand, caching and partial drawing** rather than increasing permanently loaded data or adding heavy calculations every second.

## 4. Sources, licences and related information

### Solar position

The approximate solar-position formulae are based on NOAA's **General Solar Position Calculations**.

- NOAA Global Monitoring Laboratory, *General Solar Position Calculations*  
  https://gml.noaa.gov/grad/solcalc/solareqns.PDF

`solarPosition()` calculates the fractional year, equation of time, solar declination, true solar time, hour angle, and solar elevation / azimuth.

### Moon phase

Moon-phase display uses the mean synodic month.

- Fred Espenak, NASA/GSFC, *Six Millennium Catalog of Phases of the Moon*  
  https://eclipse.gsfc.nasa.gov/phase/phasecat.html
- New Moon at 18:14 UTC on 6 January 2000  
  https://eclipse.gsfc.nasa.gov/phase/phases1901.html

NASA/GSFC material gives the mean synodic month around the year 2000 as approximately 29.530588 days. orbit uses a simplified periodic model based on this value and does not reproduce the variation between individual synodic months.

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

For the orbit 0.04 data update, the municipality-code mapping and representative-location table from the open-source **jp-address-search** project, created from P05-22, were used to recreate the coordinates while preserving orbit's existing municipality display names and prefecture order.

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
- Matching municipality codes to the existing orbit display names
- Retaining city-level entries for designated cities, preserving the municipality granularity previously used by orbit
- Rounding latitude and longitude to four decimal places
- Recreating the per-prefecture random-access offset table `jpidx`

The romanised place names used for display are the existing orbit spellings and are not spellings supplied by MLIT.

**Attribution**  
Based on “National Land Numerical Information (Municipal Offices and Public Meeting Facilities Data)” (MLIT, 2022 edition, CC BY 4.0), processed and restructured for orbit with reference to the public conversion process in jp-address-search.

### Countries and capitals worldwide

The country names and capital coordinates are a static place table created during development with reference to the legacy open-source version of REST Countries. The legacy open-source repository is distributed under MPL 2.0.

- REST Countries legacy open-source repository  
  https://github.com/restcountries/restcountries
- Mozilla Public License 2.0  
  https://www.mozilla.org/MPL/2.0/

orbit does not call the currently hosted REST Countries API at run time. Representative cities later added for some countries with multiple civil time zones were added manually for orbit.

### Bangle.js / Espruino

- Bangle.js App Loader / BangleApps  
  https://github.com/espruino/BangleApps
- Espruino Bangle.js documentation  
  https://www.espruino.com/Bangle.js
- Espruino Reference  
  https://www.espruino.com/Reference

### orbit software licence

orbit follows the BangleApps repository licensing policy and is provided under the **MIT License**. See the repository-root `LICENSE` file for details.

Third-party data remains subject to the respective terms and licences listed above.

### creater

onisY

---

<!-- 日本語 -->

# orbit

**orbit 0.04 stable**

Bangle.js 2 用の、太陽・地球・月の位置関係から時刻、月の満ち欠け等を読み取る時計アプリです。

## 1. orbitの目的

orbit は、現在時刻だけでなく、**「今、太陽・地球・月がどのような関係にあるか」**を腕時計の小さな画面で眺める、大まかな時計です。

時計画面には、太陽、地球、月、地球の昼側・夜側、設定地点、日の出・日の入り方向、月の満ち欠け、日付・時刻、バッテリー残量、設定した国名・地名などを表示します。地球は簡略化した地図として描かれ、時刻と設定地点に応じて回転します。

月は平均朔望月を使った簡略モデルで地球の周囲に表示します。満月・新月のころの太陽との位置関係や、日付を進めたときの月の動きを、天体模型のように楽しめます。

また、月の太陽に照らされた部分が地球から見える角度がわかるので、月の満ち欠け（月相）も読み取ることが出来ます。

そして、月の南中から満潮までの時間は地域毎に概ね一定（東京なら月の南中の5時間20分後くらいに満潮）なので、画面からだいたい読み取れます。これは正確ではないですが、釣りなどに役立ちます。

また、自分の場所だけでなく、地球の図から、他の国々にいる知人の現在時刻もだいたい読み取れます。

内蔵の5週間カレンダーで別の日を選ぶと、その日を基準に 時計画面を表示できます。現在だけでなく、数日後・数週間後の昼夜や月相を眺めることができます。

> orbit は教育・表示・趣味用途を目的とした簡略モデルです。天文観測、航法、測量など、高精度な天体暦や位置計算を必要とする用途には使用しないでください。

## 2. 使い方

### orbit 画面

- **1回タップ**: 5週間カレンダーを開きます。
- **2回タップ**: orbit の設定画面を開きます。
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
- 日本以外: 原則として国 → 首都を選択します。複数の標準時を持つ広い国の一部には代表都市も収録しています。
- 日本: 都道府県 → 市区町村の順に選択します。


**Manual**
- 緯度・経度を直接設定します。

**GPS**
- 設定画面で **Get GPS fix** を実行したときだけ GPS を使用します。
- 有効な測位結果を得た後、キャンセルしたとき、または設定画面を離れたときには GPS をOFFにします。
- 通常の時計表示中に GPS は使用しません。保存済みの測位結果は単なる緯度・経度として使うため、通常表示時のGPS電力消費はありません。

### その他の設定

- **View side**: North / South
- 太陽・地球・月の表示サイズ
- 月の公転半径
- 祝日地域: Japan / England & Wales / Scotland / Northern Ireland
- カレンダーの自動復帰時間
- 記念日・独自休日
- 祝日キャッシュの削除

## 3. プログラム構造

### `app.js`

時計本体です。主に以下を担当します。

- 日付・時刻・バッテリー表示
- 太陽位置の概算
- 地球・昼夜境界・簡略地図の描画
- 観測地点と日の出・日の入り方向
- 月の位置・月相表示
- 国名・地名または座標表示
- タップ判定
- カレンダーとの画面切替
- LCD OFF/ON 時の状態管理

Bangle.js 内では `orbit.app.js` として保存されます。

### `calendar.js`

内蔵5週間カレンダーです。

- 35日分の日付作成
- 曜日・今日・土日表示
- 日本および英国3地域の祝日計算
- 記念日・独自休日
- 日付選択と点滅
- 5週間単位のページ移動
- 年ごとの小さな祝日キャッシュ

Bangle.js 内では `orbit.cal.js` として保存されます。

### `settings.js`

設定画面です。

- Place name / Manual / GPS
- GPS のオンデマンド測位と確実な電源OFF
- North / South
- 天体サイズと月軌道サイズ
- カレンダー地域
- 記念日・独自休日
- 祝日キャッシュ管理

Bangle.js 内では `orbit.settings.js` として保存されます。

### `locations.js`

国・首都・一部代表都市、日本の都道府県索引を持ちます。日本の市区町村本体は大きいため別ファイルにし、都道府県ごとの `[offset, length]` を `exports.jpidx` に保持します。

### `japan-municipalities.dat`

日本全国の市区町村について、orbit の表示名と代表地点の緯度・経度を都道府県別JSON配列として連結したデータです。

通常時には全件をRAMへ展開しません。Place name 設定で都道府県を選んだときに、`locations.js` の `jpidx` を使って該当部分だけを `Storage.read()` します。

### ユーザーデータ

- `orbit.json`: 位置・表示方向・天体サイズなど
- `orbit.cal.json`: カレンダー地域・自動復帰時間など
- `orbit.events.json`: 記念日・独自休日

位置座標は `manualLat` / `manualLon` を共通の基準値として使います。Place name、Manual、GPS のどの方式でも、最終的にこの座標へ反映されます。

### Bangle.js 2 向けの軽量化

- 地図の海岸線を簡略化
- 太陽や地図の固定形状を事前計算
- 描画配列を再利用してGC負荷を低減
- 月形状を一定時間キャッシュ
- 地名表を必要時だけ読み込む
- 日本の市区町村は都道府県単位で部分読み込み
- 祝日は年単位のコンパクトなビット表でキャッシュ
- GPS は位置設定時だけ使用

改造時も、常時ロードや毎秒の重い計算を増やすより、**必要時読み込み・キャッシュ・部分描画**を優先すると安定しやすくなります。

## 4. 出典、ライセンスなど

### 太陽位置

太陽位置の概算式は NOAA の **General Solar Position Calculations** を参考にしています。

- NOAA Global Monitoring Laboratory, *General Solar Position Calculations*  
  https://gml.noaa.gov/grad/solcalc/solareqns.PDF

`solarPosition()` では fractional year、equation of time、solar declination、true solar time、hour angle、solar elevation / azimuth を求めています。

### 月相

月相表示では平均朔望月を用いています。

- Fred Espenak, NASA/GSFC, *Six Millennium Catalog of Phases of the Moon*  
  https://eclipse.gsfc.nasa.gov/phase/phasecat.html
- 2000年1月6日 18:14 UTC の新月表  
  https://eclipse.gsfc.nasa.gov/phase/phases1901.html

NASA/GSFC の資料では2000年の平均朔望月を約29.530588日としています。orbit はこれを基礎にした簡略周期モデルであり、個々の朔望月の変動は再現しません。

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

orbit 0.04 のデータ更新では、P05-22から作成されたオープンソースの変換表 **jp-address-search** の市区町村コード対応と代表地点表を用いて、orbit の既存の市区町村表示名・都道府県順を維持したまま座標を再作成しました。

- uiuifree / jp-address-search  
  https://github.com/uiuifree/rust-jp-address-search
- 同プロジェクトのライセンス: **MIT License**  
  https://github.com/uiuifree/rust-jp-address-search/blob/main/LICENSE
- P05から代表地点データを作成する処理  
  https://github.com/uiuifree/rust-jp-address-search/blob/main/src/bin/update_city_location.rs

同変換処理でP05の本庁記録をそのまま利用できない3地点（潟上市、浪江町、飯舘村）は、国土地理院の住所検索による役場所在地代表点で補正されています。国土地理院ウェブコンテンツは、特段の記載がない限り公共データ利用規約（PDL1.0）に基づき利用できます。

- 国土地理院コンテンツ利用規約  
  https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html

**orbit側で行った加工**
- 市区町村コードと既存のorbit表示名を対応付け
- 政令指定都市は市レベルを採用し、orbitが従来扱っていた市区町村の粒度を維持
- 緯度・経度を小数点以下4桁に丸める
- 都道府県ごとのランダムアクセス用オフセット表 `jpidx` を再作成

表示用のローマ字地名は既存orbitの表記を保持しており、国土交通省が作成した表記ではありません。

**出典表示**  
「国土数値情報（市町村役場等及び公的集会施設データ）」（国土交通省、2022年版、CC BY 4.0）をもとに、jp-address-search の公開変換処理を参考として orbit 用に加工・再構成。

### 世界の国・首都

世界の国名・首都座標は、開発時に REST Countries の旧オープンソース版を参考に作成した静的な地点表です。旧オープンソース版は MPL 2.0 で公開されています。

- REST Countries legacy open-source repository  
  https://github.com/restcountries/restcountries
- Mozilla Public License 2.0  
  https://www.mozilla.org/MPL/2.0/

現在の hosted REST Countries API を orbit が実行時に呼び出すことはありません。複数標準時を持つ一部の国について後から追加した代表都市は、orbit用に手動で追加したものです。

### Bangle.js / Espruino

- Bangle.js App Loader / BangleApps  
  https://github.com/espruino/BangleApps
- Espruino Bangle.js documentation  
  https://www.espruino.com/Bangle.js
- Espruino Reference  
  https://www.espruino.com/Reference

### orbit のソフトウェアライセンス

orbit は BangleApps リポジトリのライセンス方針に従い、**MIT License** で扱います。詳細はリポジトリ直下の `LICENSE` を参照してください。

第三者データには上記それぞれの利用条件・ライセンスが適用されます。

### 作者

onishi(R8/9/21)
