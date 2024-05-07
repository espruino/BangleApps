#!/usr/bin/env node

/**
 * @file
 * Will generate the `apps/locale/locales.js` file that contains locale-specific information for each supported language.
 * Most of the information is gathered automatically from sources like CLDR, but some of it is manually set in `apps/locale/locales-meta.js`.
 *
 * Remember to run `npm install`, otherwise this script won't have access to the necessary libraries.
 *
 * To generate all locales, run:
 * node bin/create-locales-js.mjs
 *
 * To generate all locales and be notified of minor issues, run:
 * node bin/create-locales-js.mjs --ideal
 *
 * To see the output for a single locale, run:
 * node bin/create-locales-js.mjs LOCALECODE
 *
 * LOCALECODE is the locale that you want to see the output for, e.g. "en_US". The locale must be defined in `apps/locale/locales-meta.js`.
 * When outputting a single locale, the `--ideal` flag is automatically set.
 */

import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import cldr from "cldr";
import Utils from "../core/js/utils.js";
import meta from "../apps/locale/locales-meta.js";

/**
 * The name of the file that we import the metadata and seed locales from.
 * This is only used for human-readable prompts.
 */
const inputPathFriendlyName = "apps/locale/locales-meta.js";

/**
 * The file that the full locales will be written to.
 */
const outputPath = "apps/locale/locales.js";

/**
 * An overview of all keys in a locale object.
 * This is useful for multiple things:
 * - ensure there are no unsupported keys in the seed data (add the key here and in the generator code if you need to support a new key)
 * - ensure that keys in the output locales are always printed in this order. That helps a lot when looking at diffs of what changed
 */
const localeKeys = [
  "lang",
  "fallbackLang",
  "icon",
  "notes",
  "calendar",
  "numberingSystem",
  "decimal_point",
  "thousands_sep",
  "speed",
  "distance",
  "temperature",
  "ampm",
  "timePattern",
  "datePattern",
  "abmonth",
  "month",
  "abday",
  "day",
  "trans",
];

/**
 * Maps from the Unicode standard datetime format to the custom datetime format used by Espruino.
 * The Unicode standard is a superset of Espruinos, so some mappings are only approximations and other mappings are not supported at all.
 *
 *
 * The unicode datetime format is documented here:
 * https://www.unicode.org/reports/tr35/tr35-29.html#Date_Format_Patterns
 *
 *
 * The Espruino datetime format is as follows:
 *
 * %Y   year, all digits (2004, 2020, 32100)
 * %y   year, last two digits (04, 20, 00)
 * %m   month, two digits (01, 12)
 * %-m  month, one or two digits (1, 12)
 * %d   day of month, two digits (01, 26)
 * %-d  day of month, one or two digits (1, 26)
 *
 * %A   locale's weekday name, full (e.g., Sunday)
 * %a   locale's weekday name, abbreviated (e.g., Sun)
 * %B   locale's month name, full (e.g., January)
 * %b   locale's month name, abbreviated (e.g., Jan)
 *
 * %HH  hours, two digits (00..23)
 * %MM  minutes, two digits (00..59)
 * %SS  seconds, two digits (00..60)
 * %P   locale's equivalent of either am or pm, lowercase
 * %p   locale's equivalent of either AM or PM, uppercase
 */
const datetime_format_map = {
  y: "%Y",
  yy: "%y",
  yyy: "%Y",
  yyyy: "%Y",
  Y: "%Y",
  YY: "%y",
  YYY: "%Y",
  YYYY: "%Y",
  M: "%-m",
  MM: "%m",
  MMM: "%b",
  MMMM: "%B",
  MMMMM: "%b",
  L: "%-m",
  LL: "%m",
  LLL: "%b",
  LLLL: "%B",
  LLLLL: "%b",
  d: "%-d",
  dd: "%d",
  E: "%a",
  EE: "%a",
  EEE: "%a",
  EEEE: "%A",
  EEEEE: "%a",
  EEEEEE: "%a",
  eee: "%a",
  eeee: "%A",
  eeeee: "%a",
  eeeeee: "%a",
  ccc: "%a",
  cccc: "%A",
  ccccc: "%a",
  cccccc: "%a",
  a: "", // should be %p but espruino time pattern should not include am/pm
  h: "%HH",
  hh: "%HH",
  H: "%HH",
  HH: "%HH",
  m: "%MM",
  mm: "%MM",
  s: "%SS",
  ss: "%SS",
};
/**
 * Maps the Espruino datetime format to max character lengths.
 * Used when determining if a format is too long.
 */
const datetime_length_map = {
  "%Y": 4,
  "%y": 2,
  "%m": 2,
  "%-m": 2,
  "%d": 2,
  "%-d": 2,
  "%A": 13,
  "%a": 4,
  "%B": 11,
  "%b": 4,
  "%HH": 2,
  "%MM": 2,
  "%SS": 2,
  "%P": 0,
  "%p": 0,
};

/**
 * Takes a Unicode datetime format string and returns a datetime format string that Espruino can parse.
 * The Unicode standard is a superset of Espruinos, so some mappings are only approximations and other mappings are not supported at all.
 *
 * @param {string} datetimeUnicode - The datetime Unicode format
 * @returns {string} - The datetime Espruino format
 */
function transformDatetimeFormat(datetimeUnicode) {
  let datetimeEspruino = "";
  let formatBuffer = "";
  function commitBuffer(i) {
    if (formatBuffer[0] === "'") {
      if (formatBuffer.length > 1 && formatBuffer.at(-1) === "'") {
        datetimeEspruino += formatBuffer.slice(1, -1);
        formatBuffer = "";
      }
    } else if (
      formatBuffer.length > 0 &&
      formatBuffer[0] !== datetimeUnicode[i]
    ) {
      datetimeEspruino += datetime_format_map[formatBuffer] ?? formatBuffer;
      formatBuffer = "";
    }
  }
  for (let i = 0; i < datetimeUnicode.length; i++) {
    commitBuffer(i);
    formatBuffer += datetimeUnicode[i];
  }
  commitBuffer(datetimeUnicode.length);
  // If we remove am/pm we sometimes need to remove some whitespace as well
  datetimeEspruino = datetimeEspruino.trim();
  return datetimeEspruino;
}

/**
 * Takes an Espruino datetime format string and returns the maximum possible length of characters that the format could use.
 *
 * @param {string} datetimeEspruino - The datetime Espruino format
 * @returns {number} - The maximum possible length of the format
 */
function getLengthOfDatetimeFormat(datetimeEspruino) {
  let formatLength = 0;
  let formatBuffer = "";
  function commitBuffer(i) {
    if (formatBuffer.length === 0) {
      if (datetimeEspruino[i] === "%") {
        formatBuffer = "%";
      } else {
        formatLength++;
      }
    } else {
      formatBuffer += datetimeEspruino[i];
      const length = datetime_length_map[formatBuffer];
      if (length !== undefined) {
        formatLength += length;
        formatBuffer = "";
      }
    }
  }
  for (let i = 0; i < datetimeEspruino.length; i++) {
    commitBuffer(i);
  }
  return formatLength;
}

/**
 * Most country codes have a corresponding emoji flag, this function will return that emoji.
 * WARNING: There is no check to see if the emoji is supported by various ecosystems.
 *
 * @param {string} countryCode - The two-letter country code
 * @returns {string} - The emoji for that country
 */
function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

/**
 * We use the Ecmascript standard to define which calendar to use, but the CLDR package sometimes uses different names.
 * This maps from Ecmascript calendar ids to CLDR calendar ids.
 */
const calendar_id_map = {
  gregory: "gregorian",
  "islamic-civil": "islamicc",
};

/**
 * Checks if the CLDR database contains data on the specified locale.
 * The check is memoized so it is fine to call this many times.
 *
 * @param {string} localeId - The locale id to check.
 * @returns {boolean} - True if the data exists, false if not.
 */
function checkCLDR(localeId) {
  if (idInCLDR.has(localeId)) return true;
  if (cldr.localeIds.includes(localeId.toLowerCase())) {
    idInCLDR.add(localeId);
    return true;
  } else {
    return false;
  }
}
const idInCLDR = new Set();

/**
 * The main function that takes a minimal seed locale and generates all other locale values based on the seed.
 * Refer to the documentation at the top of this file to learn more.
 *
 * @param {string} localeName - The user-facing locale name. Locale names must start with a valid locale id such as "en_US".
 * @param {object} locales - The manually defined locale data.
 * @returns {boolean} - The full locale information.
 * @throws if it is unable to determine what a value should be, the error message should explain what value needs to be set manually.
 */
function generateLocale(localeName, locales) {
  let locale = locales[localeName];

  for (const key of Object.keys(locale)) {
    if (!localeKeys.includes(key)) {
      throw new TypeError(
        `The locale ${localeName} contains a key '${key}' that is not supported. Maybe you misspelled it?`,
      );
    }
  }

  if (!locale.calendar) {
    throw new TypeError(
      `The locale ${localeName} must define a valid calendar`,
    );
  }
  const calendar = calendar_id_map[locale.calendar] ?? locale.calendar;

  if (!locale.numberingSystem) {
    throw new TypeError(
      `The locale ${localeName} must define a valid numbering system`,
    );
  }
  const numberingSystem = locale.numberingSystem;

  const localeMatch = localeName.match(
    /^(?<localeId>[a-zA-Z_]*_(?:(?<countryIdA2>[A-Z]{2})|(?<countryIdA3>[A-Z]{3})))(?:$|[^a-zA-Z_])/u,
  );
  const localeId = localeMatch?.groups?.localeId;
  const countryIdA2 = localeMatch?.groups?.countryIdA2;

  // If ever needed, you can convert A3 locale id's to A2 here.
  const countryIdA3 = localeMatch?.groups?.countryIdA3;

  if ((!localeId || !countryIdA2) && !locale.fallbackLang) {
    throw new TypeError(
      `The locale ${localeName} must start with a valid locale id, such as "en_US" or "da_DK"`,
    );
  }
  const countryId = countryIdA2;

  if (locale.lang && locale.lang !== localeName) {
    throw new TypeError(
      `locale.lang is not identical to the locale key for locale ${localeName}, please make it`,
    );
  }
  locale.lang ||= localeName;

  let fallbackLocale;
  if (locale.fallbackLang) {
    fallbackLocale = generateLocale(locale.fallbackLang, locales);
  }

  if (!locale.icon) {
    locale.icon ||= countryId
      ? getFlagEmoji(countryId)
      : undefined || fallbackLocale?.icon;
    if (!locale.icon) {
      throw new TypeError(
        `Unable to determine a suitable icon for locale ${localeName}, please provide it manually`,
      );
    }
  }
  if (!locale.decimal_point || !locale.thousands_sep) {
    if (checkCLDR(localeId)) {
      const numberSymbols = cldr.extractNumberSymbols(
        localeId,
        numberingSystem,
      );
      locale.decimal_point ||= numberSymbols.decimal;
      locale.thousands_sep ||= numberSymbols.group;
    }
    locale.decimal_point ||= fallbackLocale?.decimal_point;
    locale.thousands_sep ||= fallbackLocale?.thousands_sep;
    if (!locale.decimal_point || !locale.thousands_sep) {
      throw new TypeError(
        `Could not determine the decimal and thousands separators for locale ${localeName}, please provide them manually`,
      );
    }
  }
  locale.speed ||= fallbackLocale?.speed || "km/h"; // true 99% of the time, some locales prefer a translated name but often still accept the english version
  locale.distance ||= {};
  locale.distance["0"] ||= fallbackLocale?.distance["0"] || "m"; // true 99% of the time
  locale.distance["1"] ||= fallbackLocale?.distance["1"] || "km"; // true 99% of the time
  locale.temperature ||= fallbackLocale?.temperature || "°C"; // true 99% of the time
  if (!locale.ampm?.["0"] || !locale.ampm?.["1"]) {
    locale.ampm ||= {};
    if (checkCLDR(localeId)) {
      const dayPeriods = cldr.extractDayPeriods(localeId, calendar)?.standAlone
        ?.abbreviated;
      locale.ampm["0"] ||= dayPeriods.am;
      locale.ampm["1"] ||= dayPeriods.pm;
    }
    locale.ampm["0"] ||= fallbackLocale?.ampm?.["0"];
    locale.ampm["1"] ||= fallbackLocale?.ampm?.["1"];
    if (!locale.ampm?.["0"] || !locale.ampm?.["1"]) {
      throw new TypeError(
        `Could not determine AM/PM format for locale ${localeName}, please provide it manually`,
      );
    }
  }
  if (!locale.timePattern?.["0"] || !locale.timePattern?.["1"]) {
    locale.timePattern ||= {};
    if (checkCLDR(localeId)) {
      const timeFormats = cldr.extractTimeFormats(localeId, calendar);
      locale.timePattern["0"] ||= transformDatetimeFormat(timeFormats.medium);
      locale.timePattern["1"] ||= transformDatetimeFormat(timeFormats.short);
    }
    locale.timePattern["0"] ||= fallbackLocale?.timePattern["0"];
    locale.timePattern["1"] ||= fallbackLocale?.timePattern["1"];
    if (!locale.timePattern?.["0"] || !locale.timePattern?.["1"]) {
      throw new TypeError(
        `Could not determine time format for locale ${localeName}, please provide it manually`,
      );
    }
  }
  if (!locale.datePattern?.["0"] || !locale.datePattern?.["1"]) {
    locale.datePattern ||= {};
    if (checkCLDR(localeId)) {
      const dateFormats = cldr.extractDateFormats(localeId, calendar);
      locale.datePattern["0"] ||= transformDatetimeFormat(dateFormats.medium);
      locale.datePattern["1"] ||= transformDatetimeFormat(dateFormats.short);
    }
    locale.datePattern["0"] ||= fallbackLocale?.datePattern["0"];
    locale.datePattern["1"] ||= fallbackLocale?.datePattern["1"];
    if (!locale.datePattern?.["0"] || !locale.datePattern?.["1"]) {
      throw new TypeError(
        `Could not determine date format for locale ${localeName}, please provide it manually`,
      );
    }
  }
  if (!locale.abmonth || !locale.month) {
    if (checkCLDR(localeId)) {
      const months = cldr.extractMonthNames(localeId, calendar);
      locale.abmonth ||= months?.standAlone?.abbreviated?.join(",");
      locale.month ||= months?.standAlone?.wide?.join(",");
    }
    locale.abmonth ||= fallbackLocale?.abmonth;
    locale.month ||= fallbackLocale?.month;
    if (!locale.abmonth || !locale.month) {
      throw new TypeError(
        `Could not determine month names for locale ${localeName}, please provide them manually`,
      );
    }
  }
  if (!locale.abday || !locale.day) {
    if (checkCLDR(localeId)) {
      const days = cldr.extractDayNames(localeId, calendar);
      locale.abday ||= days?.standAlone?.abbreviated?.join(",");
      locale.day ||= days?.standAlone?.wide?.join(",");
    }
    locale.abday ||= fallbackLocale?.abday;
    locale.day ||= fallbackLocale?.day;
    if (!locale.abday || !locale.day) {
      throw new TypeError(
        `Could not determine day names for locale ${localeName}, please provide them manually`,
      );
    }
  }

  // Save space by deleting fields that will evaluate to false
  for (const key of Object.keys(locale)) {
    if (locale[key] === false) {
      delete locale[key];
    }
  }

  // There is no need to include information about how we internally generate the language
  delete locale.fallbackLang;

  locale = approximateChars(locale);

  // Order all keys in the locale to ensure consistent output
  const orderedLocale = {};
  for (const key of localeKeys) {
    if (key in locale) orderedLocale[key] = locale[key];
  }

  return orderedLocale;
}

/**
 * Checks whether a generated locale conforms to some basic standards.
 * It is possible that the CLDR data does not conform to a standard, in which case manual data must be entered.
 *
 * @param {object} locale - The locale to test.
 * @param {boolean} checkIdeal - If true, logs comments about aspects that could be more ideal.
 * @returns {boolean} - True if the locale is conformant, false if something needs to be changed.
 */
function checkLocale(locale, checkIdeal = false) {
  let localePasses = true;
  function checkLength(name, string, max, ideal) {
    if (string.length > max) {
      console.error(
        `${name} "${string}" in locale ${locale.lang} must not be longer than ${max} characters`,
      );
      localePasses = false;
    }
    if (checkIdeal && ideal && string.length > ideal) {
      console.warn(
        `${name} "${string}" in locale ${locale.lang} should ideally not be longer than ${ideal} characters`,
      );
    }
  }
  function checkFormatLength(name, format, max, ideal) {
    const length = getLengthOfDatetimeFormat(format);
    if (length > max) {
      console.error(
        `${name} "${format}" in locale ${locale.lang} must not be longer than ${max} characters`,
      );
      localePasses = false;
    }
    if (checkIdeal && ideal && length > ideal) {
      console.warn(
        `${name} "${format}" in locale ${locale.lang} should ideally not be longer than ${ideal} characters`,
      );
    }
  }
  function checkIsIn(name, value, listName, list) {
    if (!list.includes(value)) {
      console.error(
        `${name} "${value}" must be included in the ${listName} map`,
      );
      localePasses = false;
    }
  }
  checkLength("decimal point", locale.decimal_point, 1);
  checkLength("thousands separator", locale.decimal_point, 1);
  checkLength("speed", locale.speed, 4);
  const speedUnits = Object.keys(meta.speedUnits);
  checkIsIn("speed", locale.speed, "speedUnits", speedUnits);
  checkLength("distance", locale.distance["0"], 3, 2);
  checkLength("distance", locale.distance["1"], 3, 2);
  const distanceUnits = Object.keys(meta.distanceUnits);
  checkIsIn("distance", locale.distance["0"], "distanceUnits", distanceUnits);
  checkIsIn("distance", locale.distance["1"], "distanceUnits", distanceUnits);
  checkLength("temperature", locale.temperature, 2);
  checkLength("AM", locale.ampm["0"], 3, 2);
  checkLength("PM", locale.ampm["1"], 3, 2);
  checkFormatLength("long time", locale.timePattern["0"], 8);
  checkFormatLength("short time", locale.timePattern["1"], 5);
  checkFormatLength("long date", locale.datePattern["0"], 14, 12);
  checkFormatLength("short date", locale.datePattern["1"], 11, 9);
  for (const abmonth of locale.abmonth.split(",")) {
    checkLength("abmonth", abmonth, 4, 3);
  }
  for (const month of locale.month.split(",")) {
    checkLength("month", month, 11);
  }
  for (const abday of locale.abday.split(",")) {
    checkLength("abday", abday, 4, 3);
  }
  for (const day of locale.day.split(",")) {
    checkLength("day", day, 13);
  }
  return localePasses;
}

/**
 * Replaces unsupported string characters with similar characters that are supported.
 *
 * @param {object} object - The object where all strings should be checked for unsupported characters.
 * @returns {object} - The same object, strings are now using supported characters.
 */
function approximateChars(object) {
  for (let [key, value] of Object.entries(object)) {
    // emoji icons are not used on the watch, so they are free to use fancy chars
    if (key === "icon") continue;
    if (typeof value === "string") {
      const stringChars = value.split("");
      let newString = "";
      for (const char of stringChars) {
        newString += codePageLookup(char);
      }
      object[key] = newString;
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      approximateChars(value);
    }
  }
  return object;
  function codePageLookup(char) {
    const charCode = char.charCodeAt();
    if (charCode >= 32 && charCode < 128) {
      // ASCII - fully supported
      return char;
    } else if (meta.codePages["ISO8859-1"].map.indexOf(char) >= 0) {
      // At upload time, the char can be converted to a custom codepage
      return char;
    } else if (Utils.CODEPAGE_CONVERSIONS[char]) {
      // There is a custom fallback char for this, return it
      return Utils.CODEPAGE_CONVERSIONS[char];
    }
    throw new Error(
      `Character ${char} (${charCode}) is not supported by Banglejs. Please add it to CODEPAGE_CONVERSIONS.`,
    );
  }
}

/**
 * Outputs the metadata and locales as a JS file.
 *
 * @param {object} meta - The metadata
 * @param {object} locales - The generated locales
 */
function outputLocales(meta, locales) {
  let content = `/* jshint esversion: 6 */
/* exported distanceUnits */
/* exported speedUnits */
/* exported codePages */
/* exported datePatterns */
/* exported timePatterns */
/* exported meridians */
/* exported locales */
/**
 * THIS FILE IS AUTOGENERATED.
 * If you need to edit it, please do so in '${inputPathFriendlyName}' instead.
 */
`;

  const localeValues = Object.values(locales);
  const datePatterns = {
    0: [
      ...new Set(localeValues.map((locale) => locale.datePattern["0"])),
    ].sort(),
    1: [
      ...new Set(localeValues.map((locale) => locale.datePattern["1"])),
    ].sort(),
  };
  const timePatterns = {
    0: [
      ...new Set(localeValues.map((locale) => locale.timePattern["0"])),
    ].sort(),
    1: [
      ...new Set(localeValues.map((locale) => locale.timePattern["1"])),
    ].sort(),
  };
  const meridians = {
    0: [
      ...new Set(localeValues.map((locale) => locale.ampm["0"])),
    ].sort(),
    1: [
      ...new Set(localeValues.map((locale) => locale.ampm["1"])),
    ].sort(),
  }

  const indent = 2;
  content += `\nconst distanceUnits = ${JSON.stringify(meta.distanceUnits, undefined, indent)};\n`;
  content += `const speedUnits = ${JSON.stringify(meta.speedUnits, undefined, indent)};\n`;
  content += `\nconst codePages = ${JSON.stringify(meta.codePages, undefined, indent)};\n`;
  content += `\nconst datePatterns = ${JSON.stringify(datePatterns, undefined, indent)};\n`;
  content += `\nconst timePatterns = ${JSON.stringify(timePatterns, undefined, indent)};\n`;
  content += `\nconst meridians = ${JSON.stringify(meridians, undefined, indent)};\n`;
  content += `\nvar locales = ${JSON.stringify(locales, undefined, indent)};\n`;

  fs.writeFileSync(path.resolve(outputPath), content);
}

const idealFlag = "--ideal";
const arg = process.argv[2];
if (arg && arg !== idealFlag) {
  console.log("Dev mode, creating", arg);
  const devLocale = meta.locales[arg];
  if (!devLocale) {
    throw new TypeError(
      `You need to define the locale in '${inputPathFriendlyName}' before this program can work. The key must be '${arg}'.`,
    );
  }
  const generatedLocale = generateLocale(arg, meta.locales);
  console.log(generatedLocale);
  checkLocale(generatedLocale, true);
} else {
  const localeNames = Object.keys(meta.locales);
  const createdLocales = {};
  console.log(
    `Creating ${localeNames.length} locales, this might take a minute...`,
  );
  let localesPassed = true;
  for (const localeName of localeNames) {
    const generatedLocale = generateLocale(localeName, meta.locales);
    createdLocales[localeName] = generatedLocale;
    const localePassed = checkLocale(generatedLocale, arg === idealFlag);
    if (!localePassed) localesPassed = false;
  }
  console.log(`Writing locales to '${outputPath}'`);
  outputLocales(meta, createdLocales);
  if (localesPassed) {
    console.log(`Succesfully created all locales!`);
  } else {
    throw new Error(
      "Some locales do not conform to standards, please fix this.",
    );
  }
}
