/** Returns a promise that resolves with whether the Bangle
is worn or not.

Usage:

require("wear_detect").isWorn().then(worn => {
  console.log(worn ? "is worn" : "not worn");
});
*/
exports.isWorn = function() {
  return new Promise(resolve => {
    if (Bangle.isCharging())
        return resolve(false);
    if (E.getTemperature() > 24.625)
        return resolve(true);
    if (Bangle.getAccel().mag > 1.045)
        return resolve(true);
    return resolve(false);
  });
};
