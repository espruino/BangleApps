/**
 * Display a menu to select from various common vibration patterns for use with buzz.js.
 * 
 * @param {string} value The pre-selected pattern
 * @param {*} callback A function called with the user selected pattern
 */
exports.pattern = function (value, callback) {
  var patterns = ["", ".", ":", "..", "::", ",", ";", ",,", ";;", "-", "=", "--", "==", "...", ":::", "---", ";;;", "==="];
  return {
    value: Math.max(0, patterns.indexOf(value)),
    min: 0,
    max: patterns.length - 1,
    format: v => patterns[v] || /*LANG*/"Off",
    onchange: v => {
      require("buzz").pattern(patterns[v]);
      callback(patterns[v]);
    }
  };
}
