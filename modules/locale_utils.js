// module "locale_utils"
//
// Utility functions that use the "locale" module so can produce text in the
// currently selected language.
//
// Some functions have a "firstDayOfWeek" parameter. Most used values are
// - 0/undefined --> Sunday
// - 1           --> Monday
// but you can start the week from any day if you need it.
// 
// Moreover some functions have an "abbreviated" parameter.
// It supports the following 3 values:
// - 0/undefined --> get the full value, without abbreviation (eg.: "Monday")
// - 1           --> get the short value (eg.: "Mon")
// - 2           --> get only the first char (eg.: "M")
//

/**
 * @param {int} i The index of the day of the week (0 = Sunday)
 * @param {int} abbreviated See module documentation
 * @returns The name of the i-th day of the week
 */
exports.dow = (i, abbreviated) => {
  return require("locale").dow(new Date(((i || 0) + 3.5) * 86400000), abbreviated).slice(0, (abbreviated == 2) ? 1 : 100);
}

/**
 * @param {int} i The index of the month (1 = January)
 * @param {int} abbreviated See module documentation
 * @returns The name of the i-th month
 */
exports.month = (i, abbreviated) => require("locale").month(new Date((i - 0.5) * 2628000000), abbreviated).slice(0, (abbreviated == 2) ? 1 : 100);

/**
 * @param {int} firstDayOfWeek 0/undefined -> Sunday,  
 *                             1           -> Monday
 * @param {int} abbreviated See module documentation
 * @returns All 7 days of the week as an array
 */
exports.dows = (firstDayOfWeek, abbreviated) => {
  var days = [];
  var locale = require("locale");
  for (var i = 0; i < 7; i++) {
    days.push(locale.dow(new Date(((firstDayOfWeek || 0) + i + 3.5) * 86400000), abbreviated).slice(0, (abbreviated == 2) ? 1 : 100));
  }
  return days;
};

/**
 * @param {int} abbreviated See module documentation
 * @returns All 12 months as an array
 */
exports.months = (abbreviated) => {
  var months = [];
  var locale = require("locale");
  for (var i = 1; i <= 12; i++) {
    months.push(locale.month(new Date((i - 0.5) * 2628000000), abbreviated).slice(0, (abbreviated == 2) ? 1 : 100));
  }
  return months;
};
