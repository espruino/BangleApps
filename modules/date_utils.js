// module "date_utils"
//
// Utility functions that use the "locale" module so can produce
// date-related text in the currently selected language.
//
// Some functions have a "firstDayOfWeek" parameter.
// Most used values are:
// - 0/undefined --> Sunday
// - 1           --> Monday
// but you can start the week from any day if you need it.
//
// Some functions have an "abbreviated" parameter.
// It supports the following 3 values:
// - 0/undefined --> get the full value, without abbreviation (eg.: "Monday", "January", etc.)
// - 1           --> get the short value (eg.: "Mon", "Jan", etc.)
// - 2           --> get only the first char (eg.: "M", "J", etc.)
//

/**
 * @param {int} i The index of the day of the week (0 = Sunday)
 * @param {int} abbreviated
 * @returns The localized name of the i-th day of the week
 */
exports.dow = (i, abbreviated) => {
  var dow = require("locale").dow({getDay:()=>(i|0)%7}, abbreviated).slice(0, (abbreviated == 2) ? 1 : 100);
  return abbreviated == 2 ? dow.toUpperCase() : dow;
}

/**
 * @param {int} firstDayOfWeek 0/undefined -> Sunday,
 *                             1           -> Monday
 * @param {int} abbreviated
 * @returns All 7 days of the week (localized) as an array
 */
exports.dows = (firstDayOfWeek, abbreviated) => {
  var dows = [];
  for (var i = 0; i < 7; i++) {
    dows.push(exports.dow(i + (firstDayOfWeek || 0), abbreviated))
  }
  return abbreviated == 2 ? dows.map(dow => dow.toUpperCase()) : dows;
};

/**
 * @param {int} i The index of the month (1 = January)
 * @param {int} abbreviated
 * @returns The localized name of the i-th month
 */
exports.month = (i, abbreviated) => {
  var month = require("locale").month({getMonth:()=>(11+(i|0))%12}, abbreviated).slice(0, (abbreviated == 2) ? 1 : 100);
  return abbreviated == 2 ? month.toUpperCase() : month;
}

/**
 * @param {int} abbreviated
 * @returns All 12 months (localized) as an array
 */
exports.months = (abbreviated) => {
  var months = [];
  var locale = require("locale");
  for (var i = 0; i < 12; i++)
    months.push(locale.month({getMonth:()=>i}, abbreviated).slice(0, (abbreviated == 2) ? 1 : 100));
  return abbreviated == 2 ? months.map(month => month.toUpperCase()) : months;
};
