/* jshint esversion: 6 */
const distanceUnits = { // how many meters per X?
  "m": 1,
  "yd": 0.9144,
  "mi": 1609.34,
  "km": 1000,
  "kmi": 1000,
  "nm": 1852
};
const speedUnits = { // how many kph per X?
  "kmh": 1,
  "kph": 1,
  "km/h": 1,
  "mph": 1.60934,
  "kts": 1.852
};

/*
For a codepage, 'map' is a map of char codes 128 and above.
Where there is no character, just use '.'
*/
const codePages = {
  "ISO8859-1" : {
    name : "ISO8859-1",
    map : `
€.‚ƒ„…†‡ˆ‰Š‹Œ.Ž.
.‘’“”•–—˜™š›œ.žŸ
.¡¢£¤¥¦§¨©ª«¬.®¯
°±²³´µ¶·¸¹º»¼½¾¿
ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏ
ÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß
àáâãäåæçèéêëìíîï
ðñòóôõö÷øùúûüýþÿ
`.replace(/[ \n]/g,"")
  }
};
/* When it's not in the codepage, try and use
these conversions */
const charFallbacks = {
  "ą":"a",
  "ā":"a",
  "č":"c",
  "ć":"c",
  "ě":"e",
  "ę":"e",
  "ē":"e",
  "ģ":"g",
  "i":"ī",
  "ķ":"k",
  "ļ":"l",
  "ł":"l",
  "ń":"n",
  "ņ":"n",
  "ő":"o",
  "ó":"o",
  "ř":"r",
  "ś":"s",
  "š":"s",
  "ū":"u",
  "ż":"z",
  "ź":"z",
  "ž":"z",
 };

/*
timePattern / datePattern:

    %Y	year four digits
    %y	last two digits of year (00..99)
    %m	month (01..12)
    %d	day of month (e.g, 01)

    %a	locale's abbreviated weekday name (e.g., Sun)
    %A	locale's full weekday name (e.g., Sunday)
    %b	locale's abbreviated month name (e.g., Jan)
    %B	locale's full month name (e.g., January)

    %H	hour (00..23)
    %M	minute (00..59)
    %S	second (00..60)
    %p	locale's equivalent of either AM or PM; blank if not known
    %P  like %p, but lower case
*/

var locales = {
  "en_GB": { // this is default
    lang: "en_GB",
    decimal_point: ".",
    thousands_sep: ",",
    currency_symbol: "£", currency_first: true,
    int_curr_symbol: "GBP",
    speed: 'mph',
    distance: { "0": "yd", "1": "mi" },
    temperature: '°C',
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%b %d %Y", 1: "%d/%m/%Y" }, // Feb 28 2020" // "01/03/2020"(short)
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    // No translation for english...
  },
  "en_IN": {
    lang: "en_IN",
    decimal_point: ".",
    thousands_sep: ",",
    currency_symbol: "Rs.",
    currency_first: true,
    int_curr_symbol: "INR",
    speed: 'kmh',
    distance: { "0": "m", "1": "km" },
    temperature: '°C',
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%d %b %Y", 1: "%d/%m/%Y" }, // 28 Feb 2020" // "28/03/2020"(short)
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    // No translation for english...
  },
  "en_NAV": { // navigation units nautical miles and knots
    lang: "en_NAV",
    decimal_point: ".",
    thousands_sep: ",",
    currency_symbol: "£", currency_first: true,
    int_curr_symbol: "GBP",
    speed: 'kts',
    distance: { "0": "m", "1": "nm" },
    temperature: '°C',
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%b %d %Y", 1: "%d/%m/%Y" }, // Feb 28 2020" // "01/03/2020"(short)
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    // No translation for english...
  },
  "de_DE": {
    lang: "de_DE",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS", 1: "%HH:%MM" },
    datePattern: { 0: "%d. %b %Y", "1": "%d.%m.%Y" }, // 1. Mär 2020 // 01.03.20
    abmonth: "Jan,Feb,Mär,Apr,Mai,Jun,Jul,Aug,Sep,Okt,Nov,Dez",
    month: "Januar,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember",
    abday: "So,Mo,Di,Mi,Do,Fr,Sa",
    day: "Sonntag,Montag,Dienstag,Mittwoch,Donnerstag,Freitag,Samstag",
    trans: { yes: "ja", Yes: "Ja", no: "nein", No: "Nein", ok: "ok", on: "an", off: "aus", 
			"< Back": "< Zurück", "Delete": "Löschen", "Mark Unread": "Als ungelesen markieren" }
  },
  "en_US": {
    lang: "en_US",
    decimal_point: ".",
    thousands_sep: ",",
    currency_symbol: "$", currency_first: true,
    int_curr_symbol: "USD",
    speed: "mph",
    distance: { 0: "yd", 1: "mi" },
    temperature: "°F",
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%b %d, %Y", 1: "%m/%d/%y" },
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    // No translation for english...
  },
  "en_JP": { // we do not have the font, so it is not ja_JP
    lang: "en_JP",
    decimal_point: ".",
    thousands_sep: ",",
    currency_symbol: "¥",
    int_curr_symbol: "JPY",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%Y/%m/%d", 1: "%y/%m/%d" },
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    // No translation for english...
  },
  "nl_NL": {
    lang: "nl_NL",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS", 1: "%HH:%MM" },
    datePattern: { 0: "%d %b %Y", 1: "%d-%m-%Y" }, // 28 feb 2020  // 28-02-2020
    abday: "zo,ma,di,wo,do,vr,za",
    day: "zondag,maandag,dinsdag,woensdag,donderdag,vrijdag,zaterdag",
    abmonth: "jan,feb,mrt,apr,mei,jun,jul,aug,sep,okt,nov,dec",
    month: "januari,februari,maart,april,mei,juni,juli,augustus,september,oktober,november,december",
    trans: { yes: "ja", Yes: "Ja", no: "nee", No: "Nee", ok: "ok", on: "aan", off: "uit",
             "< Back": "< Terug", "Delete": "Verwijderen", "Mark Unread": "Markeer als ongelezen" }
  },
  "en_NL": { // English date units with Dutch number, currency and navigation units.
    lang: "en_NL",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "km/h",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%b %d %Y", 1: "%d/%m/%Y" }, // Feb 28 2020" // "01/03/2020"(short)
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
  },
  "en_CA": {
    lang: "en_CA",
    decimal_point: ".",
    thousands_sep: ",",
    currency_symbol: "$",
    int_curr_symbol: "CAD",
    speed: "km/h",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A, %B %d, %Y", "1": "%Y-%m-%d" }, //  Sunday, March 1, 2020  // 2012-12-20
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    // No translation for english...
  },
  "fr_FR": {
    lang: "fr_FR",
    decimal_point: ",",
    thousands_sep: " ",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "km/h",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A %d %B %Y", "1": "%d/%m/%Y" }, // dimanche 1 mars 2020 //  01/03/2020
    abmonth: "janv,févr,mars,avril,mai,juin,juil,août,sept,oct,nov,déc",
    month: "janvier,février,mars,avril,mai,juin,juillet,août,septembre,octobre,novembre,décembre",
    abday: "dim,lun,mar,mer,jeu,ven,sam",
    day: "dimanche,lundi,mardi,mercredi,jeudi,vendredi,samedi",
    trans: { yes: "oui", Yes: "Oui", no: "non", No: "Non", ok: "ok", on: "on", off: "off" }
  },
  "sv_SE": {
    lang: "sv_SE",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "kr",
    int_curr_symbol: "SKR",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "fm", 1: "em" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A %B %d %Y", "1": "%Y-%m-%d" }, // söndag 1 mars 2020 //  2020-03-01
    abmonth: "jan,feb,mars,apr,maj,juni,juli,aug,sep,okt,nov,dec",
    month: "januari,februari,mars,april,maj,juni,juli,augusti,september,oktober,november,december",
    abday: "sön,mån,tis,ons,tors,fre,lör",
    day: "söndag,måndag,tisdag,onsdag,torsdag,fredag,lördag",
    trans: { yes: "ja", Yes: "Ja", no: "nej", No: "Nej", ok: "ok", on: "on", off: "off" }
  },
  "en_NZ": {
    lang: "en_NZ",
    decimal_point: ".",
    thousands_sep: ",",
    currency_symbol: "$",
    int_curr_symbol: "NZD",
    speed: "kph",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A, %B %d, %Y", "1": "%d/%m/%y" }, //  Sunday, 1 March 2020  // 1/3/20
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    // No translation for english...
  },
  "en_AU": {
    lang: "en_AU",
    decimal_point: ".",
    thousands_sep: ",",
    currency_symbol: "$",
    int_curr_symbol: "AUD",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A, %B %d, %Y", "1": "%d/%m/%y" }, //  Sunday, 1 March 2020  // 1/3/20
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    // No translation for english...
  },
  "de_AT": {
    lang: "de_AT",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A, %d. %B %Y", "1": "%d.%m.%y" }, // Sonntag, 1. März 2020 // 01.03.20
    abmonth: "Jän,Feb,März,Apr,Mai,Jun,Jul,Aug,Sep,Okt,Nov,Dez",
    month: "Jänner,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember",
    abday: "So,Mo,Di,Mi,Do,Fr,Sa",
    day: "Sonntag,Montag,Dienstag,Mittwoch,Donnerstag,Freitag,Samstag",
    trans: { yes: "ja", Yes: "Ja", no: "nein", No: "Nein", ok: "ok", on: "an", off: "aus", 
			"< Back": "< Zurück", "Delete": "Löschen", "Mark Unread": "Als ungelesen markieren" }
  },
  "en_IL": {
    lang: "en_IL",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "ILS"/*"₪"*/,
    int_curr_symbol: "ILS",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A, %B %d, %Y", "1": "%d/%m/%Y" }, //  Sunday, 1 March 2020  // 01/03/2020
    abmonth: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    month: "January,February,March,April,May,June,July,August,September,October,November,December",
    abday: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    // No translation for english...
  },
  "es_ES": {
    lang: "es_ES",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A, %d de %B de %Y", "1": "%d/%m/%y" }, //  domingo, 1 de marzo de 2020  // 01/03/20
    abmonth: "ene,feb,mar,abr,may,jun,jul,ago,sept,oct,nov,dic",
    month: "enero,febrero,marzo,abril,mayo,junio,julio,agosto,septiembre,octubre,noviembre,diciembre",
    abday: "dom,lun,mar,mié,jue,vie,sáb",
    day: "domingo,lunes,martes,miércoles,jueves,viernes,sábado",
    trans: { yes: "sí", Yes: "Sí", no: "no", No: "No", ok: "ok", on: "on", off: "off",
			"< Back": "< Atrás", "Delete": "Borrar ", "Mark Unread": "Marcar como no leído" }
  },
  "fr_BE": {
    lang: "fr_BE",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A %B %d %Y", "1": "%d/%m/%y" }, // dimanche 1 mars 2020 // 01/03/20
    abmonth: "anv.,févr.,mars,avril,mai,juin,juil.,août,sept.,oct.,nov.,déc.",
    month: "janvier,février,mars,avril,mai,juin,juillet,août,septembre,octobre,novembre,décembre",
    abday: "dim,lun,mar,mer,jeu,ven,sam",
    day: "dimanche,lundi,mardi,mercredi,jeudi,vendredi,samedi",
    trans: { yes: "oui", Yes: "Oui", no: "non", No: "Non", ok: "ok", on: "on", off: "off" }
  },
  "fi_FI": {
    lang: "fi_FI",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "ap", 1: "ip" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" }, // 17.00.00  // 17.00
    datePattern: { 0: "%A %d. %B %Y", "1": "%-d/%-m/%Y" }, // sunnuntai 1. maaliskuuta 2020 // 1.3.2020
    abmonth: "tammik,helmik,maalisk,huhtik,toukok,kesäk,heinäk,elok,syysk,lokak,marrask,jouluk",
    month: "tammikuuta,helmikuuta,maaliskuuta,huhtikuuta,toukokuuta,kesäkuuta,heinäkuuta,elokuuta,syyskuuta,lokakuuta,marraskuuta,joulukuuta",
    abday: "su,ma,ti,ke,to,pe,la",
    day: "sunnuntaina,maanantaina,tiistaina,keskiviikkona,torstaina,perjantaina,lauantaina",
    trans: { yes: "oui", Yes: "Oui", no: "no", No: "No", ok: "ok", on: "on", off: "off" }
  },
  "de_CH": {
    lang: "de_CH",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "CHF",
    int_curr_symbol: "CHF",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "vorm", 1: " nachm" },
    timePattern: { 0: "%HH:%MM:%SS", 1: "%HH:%MM" },
    datePattern: { 0: "%A, %d. %B %Y", "1": "%d.%m.%Y" }, // Sonntag, 1. März 2020 // 1.3.2020
    abmonth: "Jan,Feb,März,Apr,Mai,Jun,Jul,Aug,Sep,Okt,Nov,Dez",
    month: "Januar,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember",
    abday: "So,Mo,Di,Mi,Do,Fr,Sa",
    day: "Sonntag,Montag,Dienstag,Mittwoch,Donnerstag,Freitag,Samstag",
    trans: { yes: "ja", Yes: "Ja", no: "nein", No: "Nein", ok: "ok", on: "an", off: "aus" }
  },
  "fr_CH": {
    lang: "fr_CH",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "CHF",
    int_curr_symbol: "CHF",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "AM", 1: "PM" },
    timePattern: { 0: "%HH:%MM:%SS", 1: "%HH:%MM" },
    datePattern: { 0: "%A %d %B %Y", "1": "%d/%m/%y" }, // dimanche 1 mars 2020 //  01/03/20
    abmonth: "anv.,févr.,mars,avril,mai,juin,juil.,août,sept.,oct.,nov.,déc.",
    month: "janvier,février,mars,avril,mai,juin,juillet,août,septembre,octobre,novembre,décembre",
    abday: "dim,lun,mar,mer,jeu,ven,sam",
    day: "dimanche,lundi,mardi,mercredi,jeudi,vendredi,samedi",
    trans: { yes: "oui", Yes: "Oui", no: "non", No: "Non", ok: "ok", on: "on", off: "off" }
  },
  "it_CH": {
    lang: "it_CH",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "CHF",
    int_curr_symbol: "CHF",
    speed: 'kmh',
    distance: { "0": "m", "1": "km" },
    temperature: '°C',
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH.%MM.%SS ", 1: "%HH.%MM" }, // 17.00.00  // 17.00
    datePattern: { 0: "%A %B %d %Y", "1": "%d/%m/%Y" }, // sunnuntai 1. maaliskuuta 2020 // 1.3.2020
    abmonth: "gen,feb,mar,apr,mag,giu,lug,ago,set,ott,nov,dic",
    month: "gennaio,febbraio,marzo,aprile,maggio,giugno,luglio,agosto,settembre,ottobre,novembre,dicembre",
    abday: "dom,lun,mar,mer,gio,ven,sab",
    day: "domenica,lunedì,martedì,mercoledì,giovedì,venerdì, sabato",
    trans: { yes: "sì", Yes: "Sì", no: "no", No: "No", ok: "ok", on: "on", off: "off" }
  },
  "it_IT": {
    lang: "it_IT",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: 'kmh',
    distance: { "0": "m", "1": "km" },
    temperature: '°C',
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH.%MM.%SS ", 1: "%HH.%MM" }, // 17.00.00  // 17.00
    datePattern: { 0: "%A %B %d %Y", "1": "%d/%m/%Y" }, // sunnuntai 1. maaliskuuta 2020 // 1.3.2020
    abmonth: "gen,feb,mar,apr,mag,giu,lug,ago,set,ott,nov,dic",
    month: "gennaio,febbraio,marzo,aprile,maggio,giugno,luglio,agosto,settembre,ottobre,novembre,dicembre",
    abday: "dom,lun,mar,mer,gio,ven,sab",
    day: "domenica,lunedì,martedì,mercoledì,giovedì,venerdì, sabato",
    trans: { yes: "sì", Yes: "Sì", no: "no", No: "No", ok: "ok", on: "on", off: "off" }
  },
  "wae_CH": {
    lang: "wae_CH",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "CHF",
    int_curr_symbol: "CHF",
    speed: 'kmh',
    distance: { "0": "m", "1": "km" },
    temperature: '°C',
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH.%MM.%SS ", 1: "%HH.%MM" }, // 17.00.00  // 17.00
    datePattern: { 0: "%A, %d. %B %Y", "1": "%Y-%m-%d" }, // Sunntag, 1. Märze 2020 //  2020-03-01
    abmonth: "Jen,Hor,Mär,Abr,Mei,Brá,Hei,Öig,Her,Wím,Win,Chr",
    month: "Jenner,Hornig,Märze,Abrille,Meije,Bráčet,Heiwet,Öigšte,Herbštmánet,Wímánet,Wintermánet,Chrištmánet",
    abday: "Sun,Män,Ziš,Mit,Fró,Fri,Sam",
    day: "Sunntag,Mäntag,Zištag,Mittwuč,Fróntag,Fritag,Samštag",
    trans: { yes: "sì", Yes: "Sì", no: "no", No: "No", ok: "ok", on: "on", off: "off" }
  },
  "tr_TR": { // this is default
    lang: "tr_TR",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "TL",
    int_curr_symbol: "TRY",
    speed: 'kmh',
    distance: { "0": "m", "1": "km" },
    temperature: '°C',
    ampm: { 0: "öö", 1: "ös" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%d %w %Y %A", 1: "%d/%m/%Y" }, // 1 Mart 2020 Pazar // "01/03/2020"
    abmonth: "Oca,Sub,Mar,Nis,May,Haz,Tem,Agu,Eyl,Eki,Kas,Ara",
    month: "Ocak,Subat,Mart,Nisan,Mayis,Haziran,Temmuz,Agustos,Eylul,Ekim,Kasim,Aralik",
    abday: "Paz,Pzt,Sal,Car,Per,Cum,Cmt",
    day: "Pazar,Pazartesi,Sali,Carsamba,Persembe,Cuma,Cumartesi",
    trans: { yes: "evet", Yes: "Evet", no: "hayir", No: "Hayir", ok: "tamam", on: "acik", off: "kapali" }
  },
  "hu_HU": {
    lang: "hu_HU",
    decimal_point: ",",
    thousands_sep: " ",
    currency_symbol: "Ft",
    int_curr_symbol: "HUF",
    speed: 'kph',
    distance: { "0": "m", "1": "km" },
    temperature: '°C',
    ampm: { 0: "de", 1: "du" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%Y %b %d, %A", 1: "%Y.%m.%d" }, // 2020 Feb 28, Péntek" // "2020.03.01."(short)
    abmonth: "Jan,Feb,Már,Ápr,Máj,Jún,Júl,Aug,Szep,Okt,Nov,Dec",
    month: "Január,Február,Március,Április,Május,Június,Július,Augusztus,Szeptember,Október,November,December",
    abday: "Vas,Hét,Ke,Szer,Csüt,Pén,Szom",
    day: "Vasárnap,Hétfő,Kedd,Szerda,Csütörtök,Péntek,Szombat",
    trans: { yes: "igen", Yes: "Igen", no: "nem", No: "Nem", ok: "ok", on: "be", off: "ki" }
  },
  "oc_FR": {
    lang: "oc_FR",
    decimal_point: ",",
    thousands_sep: " ",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "km/h",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A %d %B de %Y", "1": "%d/%m/%Y" }, // dimenge 1 de març de 2020 //  01/03/2020
    abmonth: "gen.,febr.,març,abril,mai,junh,julh,ago.,set.,oct.,nov.,dec.",
    month: "genièr,febrièr,març,abril,mai,junh,julhet,agost,setembre,octòbre,novembre,decembre",
    abday: "dg,dl,dm,dc,dj,dv,ds",
    day: "dimenge,diluns,dimars,dimècres,dijòus,divendres,dissabte",
    trans: { yes: "òc", Yes: "Òc", no: "non", No: "Non", ok: "ok", on: "on", off: "off" }
  },  
  "pt_BR": {
    lang: "pt_BR",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "R$", currency_first: true,
    int_curr_symbol: "BRL",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%d %b %Y", 1: "%d/%m/%y" },
    abmonth: "Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez",
    month: "Janeiro,Fevereiro,Março,Abril,Maio,Junho,Julho,Agosto,Setembro,Outubro,Novembro,Dezembro",
    abday: "Dom,Seg,Ter,Qua,Qui,Sex,Sab",
    day: "Domingo,Segunda-feira,Terça-feira,Quarta-feira,Quinta-feira,Sexta-feira,Sábado",
    trans: { yes: "sim", Yes: "Sim", no: "não", No: "Não", ok: "certo", on: "ligado", off: "desligado" }
  },
  "cs_CZ": { // THIS NEVER WORKED PROPERLY - many chars are not in the ISO8859-1 codepage and we use charFallbacks
    lang: "cs_CZ",
    decimal_point: ",",
    thousands_sep: " ",
    currency_symbol: "Kč",
    int_curr_symbol: " CZK",
    speed: 'kmh',
    distance: { "0": "m", "1": "km" },
    temperature: '°C',
    ampm: { 0: "dop", 1: "odp" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%d. %b %Y", 1: "%d.%m.%Y" }, // "30. led 2020" // "30.01.2020"(short)
    abmonth: "led,úno,bře,dub,kvě,čvn,čvc,srp,zář,říj,lis,pro",
    month: "leden,únor,březen,duben,květen,červen,červenec,srpen,září,říjen,listopad,prosinec",
    abday: "ne,po,út,st,čt,pá,so",
    day: "neděle,pondělí,úterý,středa,čtvrtek,pátek,sobota",
    trans: { yes: "tak", Yes: "Tak", no: "nie", No: "Nie", ok: "ok", on: "na", off: "poza" }
  },
  "sl_SI": {
    lang: "sl_SI",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "km/h",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "dop.", 1: "pop." },
    timePattern: { 0: "%HH:%MM:%SS", 1: "%HH:%MM" },
    datePattern: { 0: "%-d. %b %Y", 1: "%-d.%-m.%Y" }, // "3. jan. 2020" // "3.1.2020"(short)
    abmonth: "jan.,feb.,mar.,apr.,maj,jun.,jul.,avg.,sep.,okt.,nov.,dec.",
    month: "januar,februar,marec,april,maj,junij,julij,avgust,september,oktober,november,december",
    abday: "ned.,pon.,tor.,sre.,čet.,pet.,sob.",
    day: "nedelja,ponedeljek,torek,sreda,četrtek,petek,sobota",
    trans: { yes: "da", Yes: "Da", no: "ne", No: "Ne", ok: "ok", on: "Vklj.", off: "Izklj.", "< Back": "< Nazaj" }
  },
  "pt_PT": {
    lang: "pt_PT",
    decimal_point: ",",
    thousands_sep: " ",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "am", 1: "pm" },
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%d %b %Y", 1: "%d/%m/%y" },
    abmonth: "Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez",
    month: "Janeiro,Fevereiro,Março,Abril,Maio,Junho,Julho,Agosto,Setembro,Outubro,Novembro,Dezembro",
    abday: "Dom,Seg,Ter,Qua,Qui,Sex,Sab",
    day: "Domingo,Segunda-feira,Terça-feira,Quarta-feira,Quinta-feira,Sexta-feira,Sábado",
    trans: { yes: "sim", Yes: "Sim", no: "não", No: "Não", ok: "ok", on: "on", off: "off" }
  },
  "pl_PL": {
    lang: "pl_PL",
    decimal_point: ",",
    thousands_sep: " ",
    currency_symbol: "zł",
    int_curr_symbol: "PLN",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS", 1: "%HH:%MM" },
    datePattern: { 0: "%d. %b %Y", "1": "%d.%m.%Y" }, // 1. Mar 2021 // 01.03.2021
    abmonth: "Sty,Lut,Mar,Kwi,Maj,Cze,Lip,Sie,Wrz,Paź,Lis,Gru",
    month: "Styczeń,Luty,Marzec,Kwiecień,Maj,Czerwiec,Lipiec,Sierpień,Wrzesień,Październik,Listopad,Grudzień",
    abday: "Ndz,Pon,Wt,Śr,Czw,Pt,Sob",
    day: "Niedziela,Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota",
    trans: { yes: "tak", Yes: "Tak", no: "nie", No: "Nie", ok: "ok", on: "on", off: "off", "< Back": "< Wstecz" }
  },
  "lv_LV": { // Using charfallbacks
    lang: "lv_LV",
    decimal_point: ",",
    thousands_sep: " ",
    currency_symbol: "€",
    int_curr_symbol: "EUR",
    speed: "kmh",
    distance: { 0: "m", 1: "km" },
    temperature: "°C",
    ampm: { 0: "", 1: "" },
    timePattern: { 0: "%HH:%MM:%SS", 1: "%HH:%MM" },
    datePattern: { 0: "%d. %b %Y", "1": "%d.%m.%Y" }, // 1. Mar 2020 // 01.03.20
    abmonth: "Jan,Feb,Mar,Apr,Mai,Jūn,Jūl,Aug,Sep,Okt,Nov,Dec",
    month: "Janvāris,Februāris,Marts,Aprīlis,Maijs,Jūnijs,Jūlijs,Augusts,Septemberis,Oktobris,Novembris,Decembris",
    abday: "Pr,Ot,Tr,Ce,Pk,Se,Sv",
    day: "Pirmdiena,Otrdiena,Trešdiena,Ceturtdiena,Piektdiena,Sestdiena,Svētdiena",
    trans: { yes: "jā", Yes: "Jā", no: "nē", No: "Nē", ok: "labi", on: "Ieslēgt", off: "Izslēgt", "< Back": "< Atpakaļ" }
  },
/*,
  "he_IL": { // This won't work until we get a font - see https://github.com/espruino/BangleApps/issues/399
    codePage : "ISO8859-8",
    lang: "he_IL",
    decimal_point: ",",
    thousands_sep: ".",
    currency_symbol: "₪",
    int_curr_symbol: "ILS",
    speed: "קמ״ש",
    distance: { 0: "מ׳", 1: "ק״מ" },
    temperature: "°C",
    ampm: {0:"am",1:"pm"},
    timePattern: { 0: "%HH:%MM:%SS ", 1: "%HH:%MM" },
    datePattern: { 0: "%A, %B %d, %Y", "1": "%d/%m/%Y" }, //  Sunday, 1 March 2020  // 01/03/2020
    abmonth: "ינו,פבר,מרץ,אפר,מאי,יונ,יול,אוג,ספט,אוק,נוב,דצמ",
    month: "ינואר,פברואר,מרץ,אפריל,מאי,יוני,יולי,אוגוסט,ספטמבר,אוקטובר,נובמבר,דצמבר",
    abday: "א׳,ב׳,ג׳,ד׳,ה,ו׳,ש׳",
    day: "ראשון,שני,שלישי,רביעי,חמישי,שישי,שבת",
    trans: { yes: "כן", Yes: "כן", no: "לא", No: "לא", ok: "אישור", on: "פעיל", off: "כבוי" }
  }*/
};
