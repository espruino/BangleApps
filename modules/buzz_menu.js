/* Display a menu to select from various vibration patterns for use with buzz.js */

exports.pattern = function(value, callback) {
  var vibPatterns = ["", ".", "..", "-", "--", "-.-", "---"];
  return {
    value: Math.max(0,vibPatterns.indexOf(value)),
    min: 0, max: vibPatterns.length,
    format: v => vibPatterns[v]||/*LANG*/"Off",
    onchange: v => {
      callback(vibPatterns[v]);
    }
  };
}
