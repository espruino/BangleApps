<!-- English -->

# orbit

**orbit 0.05 stable**

A clock app for Bangle.js 2 that lets you read the time, the phases of the Moon and related information from the relative positions of the Sun, Earth and Moon.

## 1. Purpose of orbit

orbit is an approximate clock that lets you look not only at the current time, but also at **how the Sun, Earth and Moon are positioned relative to one another right now** on the small screen of a wristwatch.

The clock face shows the Sun, Earth, Moon, the day and night sides of the Earth, the selected location, sunrise and sunset directions, the phase of the Moon, date and time, native Bangle.js status widgets, and the selected country and place name. The Earth is drawn as a simplified map. Its astronomical orientation is calculated from the absolute UTC time and the selected longitude, independently of the civil time-zone or daylight-saving-time setting used for the text clock.

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

The date and time drawn by orbit can be selected independently from the astronomical calculation.

- **Bangle** (default): Uses the same local date and time currently shown by Bangle.js.
- **Place**: When a named place is selected, orbit converts the watch's absolute UTC time using the standard UTC offset and daylight-saving-time (DST) rule stored for that place.

Changing **Time source** never changes the Sun / Earth / Moon geometry. The astronomical display always uses UTC.

Place time is available only for **Place name** locations. Manual and GPS locations do not contain enough information to determine a legal civil time zone reliably, so they fall back to Bangle time.

orbit does not change the Bangle.js system time zone or DST setting when Place time is used. The conversion is performed only inside orbit.

### Other settings

- **Date pos / Time pos**: Header / Top left / Below Sun can be selected independently.
- **Date size / Time size**: Font sizes for on-face date/time text. Header text follows the native widget-bar theme; on-face text is drawn on black.
- **View side**: North / South
- Display sizes of the Sun, Earth and Moon
- Lunar orbit radius
- Public holiday region: Japan / England & Wales / Scotland / Northern Ireland
- Calendar auto-return time
- Anniversaries and exceptional holidays
- Deletion of holiday cache

When the normal Bangle.js wrist-view gesture wakes the watch, orbit restores the LCD/backlight for the configured system LCD timeout. This does not affect the astronomical calculation.

## 3. Sources, licences and related information

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

### Time zones and daylight saving time

The compact Place-time table was prepared with reference to the IANA Time Zone Database (tzdb) and the open-source **countries-and-timezones** project.

- IANA Time Zone Database / tz repository  
  https://github.com/eggert/tz
- tz code and data are, unless otherwise specified in that repository, public domain.
- manuelmhtr / countries-and-timezones  
  https://github.com/manuelmhtr/countries-and-timezones
- Licence: **MIT License**  
  https://github.com/manuelmhtr/countries-and-timezones/blob/master/LICENSE

orbit does not include or execute the full tzdb. It stores the standard UTC offset and a compact shared DST-rule id for the named places included in orbit, and calculates the displayed Place time locally.

Civil time-zone and DST rules are set by governments and can change. Therefore the Place-time table is a static approximation that may require updating when rules change. It must not be used where legally authoritative or safety-critical local time is required.

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

### Creator

onisY

---

<!-- 日本語 -->

# orbit

**orbit 0.05 stable**

Bangle.js 2 用の、太陽・地球・月の位置関係から時刻、月の満ち欠け等を読み取る時計アプリです。

## 1. orbitの目的

orbit は、現在時刻だけでなく、**「今、太陽・地球・月がどのような関係にあるか」**を腕時計の小さな画面で眺める、大まかな時計です。

時計画面には、太陽、地球、月、地球の昼側・夜側、設定地点、日の出・日の入り方向、月の満ち欠け、日付・時刻、Bangle.js標準の状態ウィジェット、設定した国名・地名などを表示します。地球は簡略化した地図として描かれます。天体配置と地球の回転角は絶対時刻（UTC）と設定経度から算出し、文字として表示する現地時刻のタイムゾーンやサマータイム（DST）からは独立しています。

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
- 原則として国 → 首都を選択します。複数の標準時を持つ広い国の一部には代表都市も収録しています。は


**Manual**
- 緯度・経度を直接設定します。

**GPS**
- 設定画面で **Get GPS fix** を実行したときだけ GPS を使用します。
- 有効な測位結果を得た後、キャンセルしたとき、または設定画面を離れたときには GPS をOFFにします。
- 通常の時計表示中に GPS は使用しません。保存済みの測位結果は単なる緯度・経度として使うため、通常表示時のGPS電力消費はありません。

### 時刻表示の基準

orbitが文字として表示する日付・時刻は、天体配置の計算とは独立して選択できます。

- **Bangle**（初期設定）: Bangle.js本体が現在表示している現地日時をそのまま使用します。
- **Place**: Place nameで地名を選択した場合、その地点に保存された標準UTC差とDSTルールを使い、Bangle本体の絶対時刻（UTC）から現地日時をorbit内部で算出します。

**Time sourceを変更しても、太陽・地球・月の配置は変化しません。** 天体配置は常にUTCから計算します。

Place timeを利用できるのは **Place name** で地点を選択した場合です。Manual/GPSの緯度・経度だけから法的なタイムゾーン境界を正確に特定することはできないため、Manual/GPSではBangle timeへフォールバックします。

Place timeを使用しても、Bangle.js本体のタイムゾーン設定やDST設定は変更しません。現地時刻への変換はorbitの内部だけで行います。

### その他の設定

- Date pos / Time pos で Header / Top left / Below Sun を個別に選択できます。
- Date size / Time size で、描画面に表示する場合の文字サイズを選択できます。Header表示ではウィジェット帯の配色に合わせ、描画面では黒背景に白系文字で表示します。
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

現在の hosted REST Countries API を orbit が実行時に呼び出すことはありません。複数標準時を持つ一部の国について後から追加した代表都市は、orbit専用に手動で追加したものです。

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
### タイムゾーン・サマータイム

Place time用のコンパクトな時刻データは、IANA Time Zone Database（tzdb）およびオープンソースの **countries-and-timezones** を参考に作成しています。

- IANA Time Zone Database / tz repository  
  https://github.com/eggert/tz
- 同リポジトリのtz code/dataは、特記があるファイルを除き public domain
- manuelmhtr / countries-and-timezones  
  https://github.com/manuelmhtr/countries-and-timezones
- ライセンス: **MIT License**  
  https://github.com/manuelmhtr/countries-and-timezones/blob/master/LICENSE

orbitは完全なtzdbを収録・実行するのではなく、orbitに収録した地名について、標準UTC差と共通DSTルールIDを小さな表として保持し、Place time表示時にorbit内部で現地日時を計算します。

タイムゾーンやDST制度は各国・地域の政策によって変更されることがあります。そのため、このPlace timeデータは静的な近似データであり、制度変更時には更新が必要になる場合があります。法的に厳密な時刻や安全上重要な用途には使用しないでください。

### 作者

onishi
