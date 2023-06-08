/**
 * Buzz the passed `pattern` out on the internal vibration motor.
 *
 * A pattern is a sequence of `.`, `,`, `-`, `:`, `;` and `=` where
 * - `.` is one short and weak vibration
 * - `,` is one medium and weak vibration
 * - `-` is one long and weak vibration
 * - `:` is one short and strong vibration
 * - `;` is one medium and strong vibration
 * - `=` is one long and strong vibration
 *
 * You can use the `buzz_menu` module to display a menu where some common patterns can be chosen.
 *
 * @param {string} pattern A string like `.-.`, `..=`, `:.:`, `..`, etc.
 * @returns a Promise
 */
exports.pattern = pattern => new Promise(resolve => {
  function doBuzz() {
    if (pattern == "") return resolve();
    var c = pattern[0];
    pattern = pattern.substr(1);
    const BUZZ_WEAK = 0.25, BUZZ_STRONG = 1;
    const SHORT_MS = 100, MEDIUM_MS = 200, LONG_MS = 500;    
    if (c == ".") Bangle.buzz(SHORT_MS, BUZZ_WEAK).then(() => setTimeout(doBuzz, 100));
    else if (c == ",") Bangle.buzz(MEDIUM_MS, BUZZ_WEAK).then(() => setTimeout(doBuzz, 100));
    else if (c == "-") Bangle.buzz(LONG_MS, BUZZ_WEAK).then(() => setTimeout(doBuzz, 100));
    else if (c == ":") Bangle.buzz(SHORT_MS, BUZZ_STRONG).then(() => setTimeout(doBuzz, 100));
    else if (c == ";") Bangle.buzz(MEDIUM_MS, BUZZ_STRONG).then(() => setTimeout(doBuzz, 100));
    else if (c == "=") Bangle.buzz(LONG_MS, BUZZ_STRONG).then(() => setTimeout(doBuzz, 100));
    else setTimeout(doBuzz, 100);
  }
  doBuzz();
});
