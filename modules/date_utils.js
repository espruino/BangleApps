/* Utility functions that use the 'locale' module so can produce text
in the currently selected language. */

/** Return the day of the week (0=Sunday)
    short==0/undefined -> "Sunday"
    short==1           -> "Sun"
*/
exports.getDOW = (dow, short) => require("locale").dow({getDay:()=>dow},short);

/** Return the month (1=January)
    short==0/undefined -> "January"
    short==1           -> "Jan"
*/
exports.getMonth = (month, short) => require("locale").month({getMonth:()=>month-1},short);

/** Return all 7 days of the week as an array ["Sunday","Monday",...].
    short==0/undefined -> ["Sunday",...
    short==1           -> ["Sun",...
    short==2           -> ["S",...
*/
exports.getDOWs = (short) => {
  var locale = require("locale");
  var days = [];
  for (var i=0;i<7;i++)
    days.push(locale.dow({getDay:()=>i},short).slice(0,(short==2)?1:100));
  return days;
}

/** Return all 12 months as an array ["January","February",...]
    short==0/undefined -> ["January",...
    short==1           -> ["Jan",...
*/
exports.getMonths = (short) => {
  var locale = require("locale");
  var months = [];
  for (var i=0;i<12;i++)
    months.push(locale.month({getMonth:()=>i},short));
  return months;
}
