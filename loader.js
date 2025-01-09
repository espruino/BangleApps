if (window.location.host=="banglejs.com") {
  document.getElementById("apploaderlinks").innerHTML =
    'This is the official Bangle.js App Loader - you can also try the <a href="https://espruino.github.io/BangleApps/">Development Version</a> for the most recent apps.';
} else if (window.location.host=="espruino.github.io") {
  document.title += " [Development]";
  document.getElementById("apploaderlinks").innerHTML =
    'This is the development Bangle.js App Loader - you can also try the <a href="https://banglejs.com/apps/">Official Version</a> for stable apps.';
} else if (window.location.hostname==='localhost') {
  document.title += " [Local]";
  Const.APPS_JSON_FILE = "apps.local.json";
  document.getElementById("apploaderlinks").innerHTML =
    'This is your local Bangle.js App Loader - you can try the <a href="https://banglejs.com/apps/">Official Version</a> here.';
} else {
  document.title += " [Unofficial]";
  document.getElementById("apploaderlinks").innerHTML =
    'This is not the official Bangle.js App Loader - you can try the <a href="https://banglejs.com/apps/">Official Version</a> here.';
}

var RECOMMENDED_VERSION = "2v24";
// could check http://www.espruino.com/json/BANGLEJS.json for this

// We're only interested in Bangles
DEVICEINFO = DEVICEINFO.filter(x=>x.id.startsWith("BANGLEJS"));
// Where we get our usage data from
Const.APP_USAGE_JSON = "https://banglejs.com/apps/appusage.json";
Const.APP_DATES_CSV = "appdates.csv";

// Set up source code URL
(function() {
  let username = "espruino";
  let githubMatch = window.location.href.match(/\/([\w-]+)\.github\.io/);
  if (githubMatch) username = githubMatch[1];
  Const.APP_SOURCECODE_URL = `https://github.com/${username}/BangleApps/tree/master/apps`;
})();

// When a device is found, filter the apps accordingly
function onFoundDeviceInfo(deviceId, deviceVersion) {
  var fwURL = "#", fwExtraText = "";
  if (deviceId == "BANGLEJS") {
    fwURL = "https://www.espruino.com/Bangle.js#firmware-updates";
    Const.MESSAGE_RELOAD = 'Hold BTN3\nto reload';
  }
  if (deviceId == "BANGLEJS2") {
    fwExtraText = "with the <b>Firmware Update</b> app in this App Loader, or "
    fwURL = "https://www.espruino.com/Bangle.js2#firmware-updates";
    Const.MESSAGE_RELOAD = 'Hold button\nto reload';
  }

  if (deviceId != "BANGLEJS" && deviceId != "BANGLEJS2") {
    showToast(`You're using ${deviceId}, not a Bangle.js. Did you want <a href="https://espruino.com/apps">espruino.com/apps</a> instead?` ,"warning", 20000);
  } else if (versionLess(deviceVersion, RECOMMENDED_VERSION)) {
    showToast(`You're using an old Bangle.js firmware (${deviceVersion}) and ${RECOMMENDED_VERSION} is available (<a href="https://www.espruino.com/ChangeLog" target="_blank">see changes</a>). You can update ${fwExtraText}<a href="${fwURL}" target="_blank">with the instructions here</a>` ,"warning", 20000);
  }
  // check against features shown?
  filterAppsForDevice(deviceId);
  /* if we'd saved a device ID but this device is different, ensure
  we ask again next time */
  var savedDeviceId = getSavedDeviceId();
  if (savedDeviceId!==undefined && savedDeviceId!=deviceId)
    setSavedDeviceId(undefined);
}

// Called when we refresh the list of installed apps
function onRefreshMyApps() {
  /* if we're allowed to, send usage stats. We'll only
  actually send if the data has changed */
  sendUsageStats();
}

var submittedUsageInfo = "";
/* Send usage stats to servers if it has changed */
function sendUsageStats() {
  if (!SETTINGS.sendUsageStats) return; // not allowed!
  if (device.uid === undefined) return; // no data yet!
  if (!device.appsInstalled.length) return; // no installed apps or disconnected
  /* Work out what we'll send:
  * A suitably garbled UID so we can avoid too many duplicates
  * firmware version
  * apps installed
  * apps favourited
  */
  var usageInfo = `uid=${encodeURIComponent(device.uid)}&fw=${encodeURIComponent(device.version)}&apps=${encodeURIComponent(device.appsInstalled.map(a=>a.id).join(","))}&favs=${encodeURIComponent(SETTINGS.favourites.join(","))}`;
  // Do a quick check for unchanged data to reduce server load
  if (usageInfo != submittedUsageInfo) {
    console.log("sendUsageStats: Submitting usage stats...");
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "https://banglejs.com/submit_app_stats.php", true /*async*/);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.onload = (e) => {
      if (xmlhttp.readyState === 4)
        console.log(`sendUsageStats (${xmlhttp.status}): ${xmlhttp.responseText}`);
    };
    xmlhttp.onerror = (e) => {
      console.error("sendUsageStats ERROR: "+xmlhttp.statusText);
    };
    xmlhttp.send(usageInfo);
    submittedUsageInfo = usageInfo;
  }
}

var originalAppJSON = undefined;
function filterAppsForDevice(deviceId) {
  if (originalAppJSON===undefined && appJSON.length)
    originalAppJSON = appJSON;

  var device = DEVICEINFO.find(d=>d.id==deviceId);
  // set the device dropdown
  document.querySelector(".devicetype-nav span").innerText = device ? device.name : "All apps";

  if (originalAppJSON) { // JSON might not have loaded yet
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
        <input type="checkbox" id="usage_stats" ${SETTINGS.sendUsageStats?"checked":""}>
        <i class="form-icon"></i> Send favourite and installed apps to banglejs.com<br/>
          <small>For 'Sort by Installed/Favourited' functionality (see <a href="http://www.espruino.com/Privacy">privacy policy</a>)</small>
      </label>
      <label class="form-switch">
        <input type="checkbox" id="remember_device">
        <i class="form-icon"></i> Don't ask again
      </label>
    </div>
    </div>
  </div>`;
  showPrompt("Which Bangle.js?",html,{},false);
  var usageStats = document.getElementById("usage_stats");
  usageStats.addEventListener("change",event=>{
    console.log("Send Usage Stats "+(event.target.checked?"on":"off"));
    SETTINGS.sendUsageStats = event.target.checked;
    saveSettings();
  });
  htmlToArray(document.querySelectorAll(".devicechooser")).forEach(button => {
    button.addEventListener("click",event => {
      let rememberDevice = !!document.getElementById("remember_device").checked;
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

  var el;

  // Button to install all default apps in one go
  el = document.getElementById("reinstallall");
  if (el) el.addEventListener("click",event=>{
    var promise =  showPrompt("Reinstall","Really re-install all apps?").then(() => {
      Comms.reset().then(_ =>
        getInstalledApps()
      ).then(installedapps => {
        console.log(installedapps);
        var promise = Promise.resolve();
        installedapps.forEach(app => {
          if (app.custom)
            return console.log(`Ignoring ${app.id} as customised`);
          var oldApp = app;
          app = appJSON.find(a => a.id==oldApp.id);
          if (!app)
            return console.log(`Ignoring ${oldApp.id} as not found`);
          promise = promise.then(() => updateApp(app, {noReset:true, noFinish:true}));
        });
        return promise;
      }).then( _ =>
        Comms.showUploadFinished()
      ).catch(err=>{
        Progress.hide({sticky:true});
        showToast("App re-install failed, "+err,"error");
      });
    });
  });


  // Button to install all default apps in one go
  el = document.getElementById("installdefault");
  if (el) el.addEventListener("click", event=>{
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

  // Button to reset the Bangle's settings
  el = document.getElementById("defaultbanglesettings");
  if (el) el.addEventListener("click", event=>{
    showPrompt("Reset Settings","Really reset Bangle.js settings?").then(() => {
      Comms.write("\x10require('Storage').erase('setting.json');load()\n");
      showToast("Settings reset!", "success");
    }, function() { /* cancelled */ });
  });


  // BLE Compatibility
  var selectBLECompat = document.getElementById("settings-ble-compat");
  if (selectBLECompat) {
    Puck.increaseMTU = !SETTINGS.bleCompat;
    selectBLECompat.checked = !!SETTINGS.bleCompat;
    selectBLECompat.addEventListener("change",event=>{
      console.log("BLE compatibility mode "+(event.target.checked?"on":"off"));
      SETTINGS.bleCompat = event.target.checked;
      Puck.increaseMTU = !SETTINGS.bleCompat;
      saveSettings();
    });
  }

  // Sending usage stats
  var selectUsageStats = document.getElementById("settings-usage-stats");
  if (selectUsageStats) {
    selectUsageStats.checked = !!SETTINGS.sendUsageStats;
    selectUsageStats.addEventListener("change",event=>{
      console.log("Send Usage Stats "+(event.target.checked?"on":"off"));
      SETTINGS.sendUsageStats = event.target.checked;
      saveSettings();
    });
  }

  // Load language list
  httpGet("lang/index.json").then(languagesJSON=>{
    var languages;
    try {
      languages = JSON.parse(languagesJSON);
    } catch(e) {
      console.error("lang/index.json Corrupted", e);
    }
    languages = languages.filter( l=> l.disabled===undefined );

    function reloadLanguage() {
      LANGUAGE = undefined;
      if (SETTINGS.language) {
        var language = languages.find(l=>l.code==SETTINGS.language);
        if (language) {
          var langURL = "lang/"+language.url;
          httpGet(langURL).then(languageJSON=>{
            try {
              LANGUAGE = JSON.parse(languageJSON);
              console.log(`${langURL} loaded successfully`);
            } catch(e) {
              console.error(`${langURL} Corrupted`, e);
            }
          });
        } else {
          console.error(`Language code ${JSON.stringify(SETTINGS.language)} not found in lang/index.json`);
        }
      }
    }

    var selectLang = document.getElementById("settings-lang");
    languages.forEach(lang => {
      selectLang.innerHTML += `<option value="${lang.code}" ${SETTINGS.language==lang.code?"selected":""}>${lang.name} (${lang.code})</option>`;
    });
    selectLang.addEventListener("change",event=>{
      SETTINGS.language = event.target.value;
      reloadLanguage();
      saveSettings();
    });
    reloadLanguage();
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
