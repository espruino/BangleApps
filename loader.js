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

var RECOMMENDED_VERSION = "2v11";
// could check http://www.espruino.com/json/BANGLEJS.json for this

// We're only interested in Bangles
DEVICEINFO = DEVICEINFO.filter(x=>x.id.startsWith("BANGLEJS"));

// Set up source code URL
(function() {
  let username = "espruino";
  let githubMatch = window.location.href.match(/\/(\w+)\.github\.io/);
  if (githubMatch) username = githubMatch[1];
  Const.APP_SOURCECODE_URL = `https://github.com/${username}/BangleApps/tree/master/apps`;
})();

// When a device is found, filter the apps accordingly
function onFoundDeviceInfo(deviceId, deviceVersion) {
  var fwURL = "#";
  if (deviceId == "BANGLEJS") {
    fwURL = "https://www.espruino.com/Bangle.js#firmware-updates";
    Const.MESSAGE_RELOAD = 'Hold BTN3\nto reload';
  }
  if (deviceId == "BANGLEJS2") {
    fwURL = "https://www.espruino.com/Bangle.js2#firmware-updates";
    Const.MESSAGE_RELOAD = 'Hold button\nto reload';
  }

  if (deviceId != "BANGLEJS" && deviceId != "BANGLEJS2") {
    showToast(`You're using ${deviceId}, not a Bangle.js. Did you want <a href="https://espruino.com/apps">espruino.com/apps</a> instead?` ,"warning", 20000);
  } else if (versionLess(deviceVersion, RECOMMENDED_VERSION)) {
    showToast(`You're using an old Bangle.js firmware (${deviceVersion}). You can <a href="${fwURL}" target="_blank">update with the instructions here</a>` ,"warning", 20000);
  }


  // check against features shown?
  filterAppsForDevice(deviceId);
  /* if we'd saved a device ID but this device is different, ensure
  we ask again next time */
  var savedDeviceId = getSavedDeviceId();
  if (savedDeviceId!==undefined && savedDeviceId!=deviceId)
    setSavedDeviceId(undefined);
}

var originalAppJSON = undefined;
function filterAppsForDevice(deviceId) {
  if (originalAppJSON===undefined && appJSON.length)
    originalAppJSON = appJSON;

  var device = DEVICEINFO.find(d=>d.id==deviceId);
  // set the device dropdown
  document.querySelector(".devicetype-nav span").innerText = device ? device.name : "All apps";

  if (!device) {
    if (deviceId!==undefined)
      showToast(`Device ID ${deviceId} not recognised. Some apps may not work`, "warning");
    appJSON = originalAppJSON;
  } else {
    // Now filter apps
    appJSON = originalAppJSON.filter(app => {
      var supported = ["BANGLEJS"];
      if (!app.supports) {
        console.log(`App ${app.id} doesn't include a 'supports' field - ignoring`);
        return false;
      }
      if (app.supports.includes(deviceId)) return true;
      //console.log(`Dropping ${app.id} because ${deviceId} is not in supported list ${app.supports.join(",")}`);
      return false;
    });
  }
  refreshLibrary();
}

// If 'remember' was checked in the window below, this is the device
function getSavedDeviceId() {
  let deviceId = localStorage.getItem("deviceId");
  if (("string"==typeof deviceId) && DEVICEINFO.find(d=>d.id == deviceId))
    return deviceId;
  return undefined;
}

function setSavedDeviceId(deviceId) {
  localStorage.setItem("deviceId", deviceId);
}

// At boot, show a window to choose which type of device you have...
window.addEventListener('load', (event) => {
  let deviceId = getSavedDeviceId()
  if (deviceId !== undefined) return; // already chosen

  var html = `<div class="columns">
    ${DEVICEINFO.map(d=>`
    <div class="column col-6 col-xs-6">
      <div class="card devicechooser" deviceid="${d.id}" style="cursor:pointer">
        <div class="card-header">
          <div class="card-title h5">${d.name}</div>
          <!--<div class="card-subtitle text-gray">...</div>-->
        </div>
        <div class="card-image">
          <img src="${d.img}" alt="${d.name}" width="256" height="256" class="img-responsive">
        </div>
      </div>
    </div>`).join("\n")}
  </div><div class="columns">
    <div class="column col-12">
    <div class="form-group">
      <label class="form-switch">
        <input type="checkbox" id="remember_device">
        <i class="form-icon"></i> Don't ask again
      </label>
    </div>
    </div>
  </div>`;
  showPrompt("Which Bangle.js?",html,{},false);
  htmlToArray(document.querySelectorAll(".devicechooser")).forEach(button => {
    button.addEventListener("click",event => {
      let rememberDevice = document.getElementById("remember_device").checked;

      let button = event.currentTarget;
      let deviceId = button.getAttribute("deviceid");
      hidePrompt();
      console.log("Chosen device", deviceId);
      setSavedDeviceId(rememberDevice ? deviceId : undefined);
      filterAppsForDevice(deviceId);
    });
  });
});

window.addEventListener('load', (event) => {
  // Hook onto device chooser dropdown
  htmlToArray(document.querySelectorAll(".devicetype-nav .menu-item")).forEach(button => {
    button.addEventListener("click", event => {
      var a = event.target;
      var deviceId = a.getAttribute("dt")||undefined;
      filterAppsForDevice(deviceId); // also sets the device dropdown
      setSavedDeviceId(undefined); // ask at startup next time
      document.querySelector(".devicetype-nav span").innerText = a.innerText;
    });
  });

  // Button to install all default apps in one go
  document.getElementById("installdefault").addEventListener("click",event=>{
    getInstalledApps().then(() => {
      if (device.id == "BANGLEJS")
        return httpGet("defaultapps_banglejs1.json");
      if (device.id == "BANGLEJS2")
        return httpGet("defaultapps_banglejs2.json");
      throw new Error("Unknown device "+device.id);
    }).then(json=>{
      return installMultipleApps(JSON.parse(json), "default");
    }).catch(err=>{
      Progress.hide({sticky:true});
      showToast("App Install failed, "+err,"error");
    });
  });
});

function onAppJSONLoaded() {
  let deviceId = getSavedDeviceId()
  if (deviceId !== undefined)
    filterAppsForDevice(deviceId);

  /* Disable external screenshot loading - seems we probably have enough
  screenshots added manually in apps.json */
  /*return new Promise(resolve => {
    httpGet("screenshots.json").then(screenshotJSON=>{
      var screenshots = [];
      try {
        screenshots = JSON.parse(screenshotJSON);
      } catch(e) {
        console.error("Screenshot JSON Corrupted", e);
      }
      screenshots.forEach(s => {
        var app = appJSON.find(a=>a.id==s.id);
        if (!app) return;
        if (!app.screenshots) app.screenshots = [];
        app.screenshots.push({url:s.url});
      })
    }).catch(err=>{
      console.log("No screenshots.json found");
      resolve();
    });
  });*/
}
