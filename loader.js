if (window.location.host=="banglejs.com") {
  document.getElementById("apploaderlinks").innerHTML =
    'This is the official Bangle.js App Loader - you can also try the <a href="https://espruino.github.io/BangleApps/">Development Version</a> for the most recent apps.';
} else if (window.location.host=="espruino.github.io") {
  document.title += " [Development]";
  document.getElementById("apploaderlinks").innerHTML =
    'This is the development Bangle.js App Loader - you can also try the <a href="https://banglejs.com/apps/">Official Version</a> for stable apps.';
} else {
  document.title += " [Unofficial]";
  document.getElementById("apploaderlinks").innerHTML =
    'This is not the official Bangle.js App Loader - you can try the <a href="https://banglejs.com/apps/">Official Version</a> here.';
}

var RECOMMENDED_VERSION = "2v08";
// could check http://www.espruino.com/json/BANGLEJS.json for this

(function() {
  let username = "espruino";
  let githubMatch = window.location.href.match(/\/(\w+)\.github\.io/);
  if (githubMatch) username = githubMatch[1];
  Const.APP_SOURCECODE_URL = `https://github.com/${username}/BangleApps/tree/master/apps`;
})();

function onFoundDeviceInfo(deviceId, deviceVersion) {
  if (deviceId != "BANGLEJS") {
    showToast(`You're using ${deviceId}, not a Bangle.js. Did you want <a href="https://espruino.com/apps">espruino.com/apps</a> instead?` ,"warning", 20000);
  } else if (versionLess(deviceVersion, RECOMMENDED_VERSION)) {
    showToast(`You're using an old Bangle.js firmware (${deviceVersion}). You can <a href="https://www.espruino.com/Bangle.js#firmware-updates" target="_blank">update with the instructions here</a>` ,"warning", 20000);
  }
}
