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
    if (Bangle.getHealthStatus().movement > 124)
        return resolve(true);
    return resolve(false);
  });
};
