/* Display a menu to select from various vibration patterns for use with buzz.js */

exports.pattern = function(value, callback) {
  var vibPatterns = ["", ".", "..", "-", "--", "-.-", "---"];
  return {
    value: Math.max(0,vibPatterns.indexOf(value)),
    min: 0, max: vibPatterns.length-1,
    format: v => vibPatterns[v]||/*LANG*/"Off",
    onchange: v => {
      require("buzz").pattern(vibPatterns[v]);
      callback(vibPatterns[v]);
    }
  };
}
