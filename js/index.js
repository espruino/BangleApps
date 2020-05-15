var appJSON = []; // List of apps and info from apps.json
var appsInstalled = []; // list of app JSON
var appSortInfo = {}; // list of data to sort by, from appdates.csv { created, modified }
var files = []; // list of files on Bangle
var DEFAULTSETTINGS = {
  pretokenise : true,
  favourites : ["boot","launch","setting"]
};
var SETTINGS = JSON.parse(JSON.stringify(DEFAULTSETTINGS)); // clone

httpGet("apps.json").then(apps=>{
  try {
    appJSON = JSON.parse(apps);
  } catch(e) {
    console.log(e);
    showToast("App List Corrupted","error");
  }
  appJSON.sort(appSorter);
  refreshLibrary();
  refreshFilter();
});

httpGet("appdates.csv").then(csv=>{
  document.querySelector(".sort-nav").classList.remove("hidden");
  csv.split("\n").forEach(line=>{
    var l = line.split(",");
    appSortInfo[l[0]] = { 
      created : Date.parse(l[1]), 
      modified : Date.parse(l[2])
    };
  });
}).catch(err=>{
  console.log("No recent.csv - app sort disabled");
});

// ===========================================  Top Navigation
function showChangeLog(appid) {
  var app = appNameToApp(appid);
  function show(contents) {
    showPrompt(app.name+" Change Log",contents,{ok:true}).catch(()=>{});
  }
  httpGet(`apps/${appid}/ChangeLog`).
  then(show).catch(()=>show("No Change Log available"));
}
function showReadme(appid) {
  var app = appNameToApp(appid);
  var appPath = `apps/${appid}/`;
  var markedOptions = { baseUrl : appPath };
  function show(contents) {
    if (!contents) return;
    showPrompt(app.name + " Documentation", marked(contents, markedOptions), {ok: true}, false).catch(() => {});
  }
  httpGet(appPath+app.readme).then(show).catch(()=>show("Failed to load README."));
}
function handleCustomApp(appTemplate) {
  // Pops up an IFRAME that allows an app to be customised
  if (!appTemplate.custom) throw new Error("App doesn't have custom HTML");
  return new Promise((resolve,reject) => {
    var modal = htmlElement(`<div class="modal active">
      <a href="#close" class="modal-overlay " aria-label="Close"></a>
      <div class="modal-container" style="height:100%">
        <div class="modal-header">
          <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a>
          <div class="modal-title h5">${escapeHtml(appTemplate.name)}</div>
        </div>
        <div class="modal-body" style="height:100%">
          <div class="content" style="height:100%">
            <iframe src="apps/${appTemplate.id}/${appTemplate.custom}" style="width:100%;height:100%;border:0px;">
          </div>
        </div>
      </div>
    </div>`);
    document.body.append(modal);
    htmlToArray(modal.getElementsByTagName("a")).forEach(button => {
      button.addEventListener("click",event => {
        event.preventDefault();
        modal.remove();
        reject("Window closed");
      });
    });

    var iframe = modal.getElementsByTagName("iframe")[0];
    iframe.contentWindow.addEventListener("message", function(event) {
      var appFiles = event.data;
      var app = JSON.parse(JSON.stringify(appTemplate)); // clone template
      // copy extra keys from appFiles
      Object.keys(appFiles).forEach(k => {
        if (k!="storage") app[k] = appFiles[k]
      });
      appFiles.storage.forEach(f => {
        app.storage = app.storage.filter(s=>s.name!=f.name); // remove existing item
        app.storage.push(f); // add new
      });
      console.log("Received custom app", app);
      modal.remove();
      Comms.uploadApp(app).then(()=>{
        Progress.hide({sticky:true});
        resolve();
      }).catch(e => {
        Progress.hide({sticky:true});
        reject(e);
      });
    }, false);
  });
}

function handleAppInterface(app) {
  // IFRAME interface window that can be used to get data from the app
  if (!app.interface) throw new Error("App doesn't have interface HTML");
  return new Promise((resolve,reject) => {
    var modal = htmlElement(`<div class="modal active">
      <a href="#close" class="modal-overlay " aria-label="Close"></a>
      <div class="modal-container" style="height:100%">
        <div class="modal-header">
          <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a>
          <div class="modal-title h5">${escapeHtml(app.name)}</div>
        </div>
        <div class="modal-body" style="height:100%">
          <div class="content" style="height:100%">
            <iframe style="width:100%;height:100%;border:0px;">
          </div>
        </div>
      </div>
    </div>`);
    document.body.append(modal);
    htmlToArray(modal.getElementsByTagName("a")).forEach(button => {
      button.addEventListener("click",event => {
        event.preventDefault();
        modal.remove();
        //reject("Window closed");
      });
    });
    var iframe = modal.getElementsByTagName("iframe")[0];
    iframe.onload = function() {
      var iwin = iframe.contentWindow;
      iwin.addEventListener("message", function(event) {
        var msg = event.data;
        if (msg.type=="eval") {
          Puck.eval(msg.data, function(result) {
            iwin.postMessage({
              type : "evalrsp",
              data : result,
              id : msg.id
            });
          });
        } else if (msg.type=="write") {
          Puck.write(msg.data, function(result) {
            iwin.postMessage({
              type : "writersp",
              data : result,
              id : msg.id
            });
          });
        } else if (msg.type=="readstoragefile") {
          Comms.readStorageFile(msg.data/*filename*/).then(function(result) {
            iwin.postMessage({
              type : "readstoragefilersp",
              data : result,
              id : msg.id
            });
          });
        }
      }, false);
      iwin.postMessage({type:"init"});
    };
    iframe.src = `apps/${app.id}/${app.interface}`;
  });
}

function changeAppFavourite(favourite, app) {
  var favourites = SETTINGS.favourites;
  if (favourite) {
    SETTINGS.favourites = SETTINGS.favourites.concat([app.id]);
  } else {
    if ([ "boot","setting"].includes(app.id)) {
      showToast(app.name + ' is required, can\'t remove it' , 'warning');
    }else {
      SETTINGS.favourites = SETTINGS.favourites.filter(e => e != app.id);
    }
  }
  saveSettings();
  refreshLibrary();
}

// ===========================================  Top Navigation
function showTab(tabname) {
  htmlToArray(document.querySelectorAll("#tab-navigate .tab-item")).forEach(tab => {
    tab.classList.remove("active");
  });
  htmlToArray(document.querySelectorAll(".bangle-tab")).forEach(tab => {
    tab.style.display = "none";
  });
  document.getElementById("tab-"+tabname).classList.add("active");
  document.getElementById(tabname).style.display = "inherit";
}

// =========================================== Library

var chips = Array.from(document.querySelectorAll('.filter-nav .chip')).map(chip => chip.attributes.filterid.value);
var hash = window.location.hash ? window.location.hash.slice(1) : '';

var activeFilter = !!~chips.indexOf(hash) ? hash : '';
var activeSort = '';
var currentSearch = activeFilter ? '' : hash;

function refreshFilter(){
  var filtersContainer = document.querySelector("#librarycontainer .filter-nav");
  filtersContainer.querySelector('.active').classList.remove('active');
  if(activeFilter) filtersContainer.querySelector('.chip[filterid="'+activeFilter+'"]').classList.add('active');
  else filtersContainer.querySelector('.chip[filterid]').classList.add('active');
}
function refreshSort(){
  var sortContainer = document.querySelector("#librarycontainer .sort-nav");
  sortContainer.querySelector('.active').classList.remove('active');
  if(activeSort) sortContainer.querySelector('.chip[sortid="'+activeSort+'"]').classList.add('active');
  else sortContainer.querySelector('.chip[sortid]').classList.add('active');
}
function refreshLibrary() {
  var panelbody = document.querySelector("#librarycontainer .panel-body");
  var visibleApps = appJSON;
  var favourites = SETTINGS.favourites;

  if (activeFilter) {
    if ( activeFilter == "favourites" ) {
      visibleApps = visibleApps.filter(app => app.id && (favourites.filter( e => e == app.id).length));
    } else {
      visibleApps = visibleApps.filter(app => app.tags && app.tags.split(',').includes(activeFilter));
    }
  }

  if (currentSearch) {
    visibleApps = visibleApps.filter(app => app.name.toLowerCase().includes(currentSearch) || app.tags.includes(currentSearch));
  }

  if (activeSort) {
    visibleApps = visibleApps.slice(); // clone the array so sort doesn't mess with original
    if (activeSort=="created" || activeSort=="modified") {
      visibleApps = visibleApps.sort((a,b) => appSortInfo[b.id][activeSort] - appSortInfo[a.id][activeSort]);
    } else throw new Error("Unknown sort type "+activeSort);
  }

  panelbody.innerHTML = visibleApps.map((app,idx) => {
    var appInstalled = appsInstalled.find(a=>a.id==app.id);
    var version = getVersionInfo(app, appInstalled);
    var versionInfo = version.text;
    if (versionInfo) versionInfo = " <small>("+versionInfo+")</small>";
    var readme = `<a class="c-hand" onclick="showReadme('${app.id}')">Read more...</a>`;
    var favourite = favourites.find(e => e == app.id);

    var username = "espruino";
    var githubMatch = window.location.href.match(/\/(\w+)\.github\.io/);
    if(githubMatch) username = githubMatch[1];
    var url = `https://github.com/${username}/BangleApps/tree/master/apps/${app.id}`;

    return `<div class="tile column col-6 col-sm-12 col-xs-12">
    <div class="tile-icon">
      <figure class="avatar"><img src="apps/${app.icon?`${app.id}/${app.icon}`:"unknown.png"}" alt="${escapeHtml(app.name)}"></figure><br/>
    </div>
    <div class="tile-content">
      <p class="tile-title text-bold">${escapeHtml(app.name)} ${versionInfo}</p>
      <p class="tile-subtitle">${escapeHtml(app.description)}${app.readme?`<br/>${readme}`:""}</p>
      <a href="${url}" target="_blank" class="link-github"><img src="img/github-icon-sml.png" alt="See the code on GitHub"/></a>
    </div>
    <div class="tile-action">
      <button class="btn btn-link btn-action btn-lg ${!app.custom?"text-error":"d-hide"}" appid="${app.id}" title="Favorite"><i class="icon"></i>${favourite?"&#x2665;":"&#x2661;"}</button>
      <button class="btn btn-link btn-action btn-lg ${(appInstalled&&app.interface)?"":"d-hide"}" appid="${app.id}" title="Download data from app"><i class="icon icon-download"></i></button>
      <button class="btn btn-link btn-action btn-lg ${app.allow_emulator?"":"d-hide"}" appid="${app.id}" title="Try in Emulator"><i class="icon icon-share"></i></button>
      <button class="btn btn-link btn-action btn-lg ${version.canUpdate?"":"d-hide"}" appid="${app.id}" title="Update App"><i class="icon icon-refresh"></i></button>
      <button class="btn btn-link btn-action btn-lg ${(!appInstalled && !app.custom)?"":"d-hide"}" appid="${app.id}" title="Upload App"><i class="icon icon-upload"></i></button>
      <button class="btn btn-link btn-action btn-lg ${appInstalled?"":"d-hide"}" appid="${app.id}" title="Remove App"><i class="icon icon-delete"></i></button>
      <button class="btn btn-link btn-action btn-lg ${app.custom?"":"d-hide"}" appid="${app.id}" title="Customise and Upload App"><i class="icon icon-menu"></i></button>
    </div>
  </div>
  `;}).join("");
  // set badge up top
  var tab = document.querySelector("#tab-librarycontainer a");
  tab.classList.add("badge");
  tab.setAttribute("data-badge", appJSON.length);
  htmlToArray(panelbody.getElementsByTagName("button")).forEach(button => {
    button.addEventListener("click",event => {
      var button = event.currentTarget;
      var icon = button.firstChild;
      var appid = button.getAttribute("appid");
      var app = appNameToApp(appid);
      if (!app) throw new Error("App "+appid+" not found");
      // check icon to figure out what we should do
      if (icon.classList.contains("icon-share")) {
        // emulator
        var file = app.storage.find(f=>f.name.endsWith('.js'));
        if (!file) {
          console.error("No entrypoint found for "+appid);
          return;
        }
        var baseurl = window.location.href;
        baseurl = baseurl.substr(0,baseurl.lastIndexOf("/"));
        var url = baseurl+"/apps/"+app.id+"/"+file.url;
        window.open(`https://espruino.com/ide/emulator.html?codeurl=${url}&upload`);
      } else if (icon.classList.contains("icon-upload")) {
        // upload
        icon.classList.remove("icon-upload");
        icon.classList.add("loading");
        uploadApp(app);
      } else if (icon.classList.contains("icon-menu")) {
        // custom HTML update
        icon.classList.remove("icon-menu");
        icon.classList.add("loading");
        customApp(app);
      } else if (icon.classList.contains("icon-delete")) {
        // Remove app
        icon.classList.remove("icon-delete");
        icon.classList.add("loading");
        removeApp(app);
      } else if (icon.classList.contains("icon-refresh")) {
        // Update app
        icon.classList.remove("icon-refresh");
        icon.classList.add("loading");
        updateApp(app);
      } else if (icon.classList.contains("icon-download")) {
        handleAppInterface(app);
      } else if ( button.innerText == String.fromCharCode(0x2661)) {
         changeAppFavourite(true, app);
      } else if ( button.innerText == String.fromCharCode(0x2665) ) {
         changeAppFavourite(false, app);
      }
    });
  });
}

refreshFilter();
refreshLibrary();
// =========================================== My Apps

function uploadApp(app) {
  return getInstalledApps().then(()=>{
    if (appsInstalled.some(i => i.id === app.id)) {
      return updateApp(app);
    }
    Comms.uploadApp(app).then((appJSON) => {
      Progress.hide({ sticky: true });
      if (appJSON) {
        appsInstalled.push(appJSON);
      }
      showToast(app.name + ' Uploaded!', 'success');
    }).catch(err => {
      Progress.hide({ sticky: true });
      showToast('Upload failed, ' + err, 'error');
    }).finally(()=>{
      refreshMyApps();
      refreshLibrary();
    });
  }).catch(err => {
    showToast("Device connection failed, "+err,"error");
  });
}

function removeApp(app) {
  return showPrompt("Delete","Really remove '"+app.name+"'?").then(() => {
    return getInstalledApps().then(()=>{
      // a = from appid.info, app = from apps.json
      return Comms.removeApp(appsInstalled.find(a => a.id === app.id));
    });
  }).then(()=>{
    appsInstalled = appsInstalled.filter(a=>a.id!=app.id);
    showToast(app.name+" removed successfully","success");
    refreshMyApps();
    refreshLibrary();
  }, err=>{
    showToast(app.name+" removal failed, "+err,"error");
  });
}

function customApp(app) {
  return handleCustomApp(app).then((appJSON) => {
    if (appJSON) appsInstalled.push(appJSON);
    showToast(app.name+" Uploaded!", "success");
    refreshMyApps();
    refreshLibrary();
  }).catch(err => {
    showToast("Customise failed, "+err, "error");
    refreshMyApps();
    refreshLibrary();
  });
}

function updateApp(app) {
  if (app.custom) return customApp(app);
  return getInstalledApps().then(() => {
    // a = from appid.info, app = from apps.json
    let remove = appsInstalled.find(a => a.id === app.id);
    // no need to remove files which will be overwritten anyway
    remove.files = remove.files.split(',')
      .filter(f => f !== app.id + '.info')
      .filter(f => !app.storage.some(s => s.name === f))
      .join(',');
    let data = AppInfo.parseDataString(remove.data)
    if ('data' in app) {
      // only remove data files which are no longer declared in new app version
      const removeData = (f) => !app.data.some(d => (d.name || d.wildcard)===f)
      data.dataFiles = data.dataFiles.filter(removeData)
      data.storageFiles = data.storageFiles.filter(removeData)
    }
    remove.data = AppInfo.makeDataString(data)
    return Comms.removeApp(remove);
  }).then(()=>{
    showToast(`Updating ${app.name}...`);
    appsInstalled = appsInstalled.filter(a=>a.id!=app.id);
    return Comms.uploadApp(app);
  }).then((appJSON) => {
    if (appJSON) appsInstalled.push(appJSON);
    showToast(app.name+" Updated!", "success");
    refreshMyApps();
    refreshLibrary();
  }, err=>{
    showToast(app.name+" update failed, "+err,"error");
    refreshMyApps();
    refreshLibrary();
  });
}



function appNameToApp(appName) {
  var app = appJSON.find(app=>app.id==appName);
  if (app) return app;
  /* If app not known, add just one file
  which is the JSON - so we'll remove it from
  the menu but may not get rid of all files. */
  return { id: appName,
    name: "Unknown app "+appName,
    icon: "../unknown.png",
    description: "Unknown app",
    storage: [ {name:appName+".info"}],
    unknown: true,
  };
}

function showLoadingIndicator(id) {
  var panelbody = document.querySelector(`#${id} .panel-body`);
  var tab = document.querySelector(`#tab-${id} a`);
  // set badge up top
  tab.classList.add("badge");
  tab.setAttribute("data-badge", "");
  // Loading indicator
  panelbody.innerHTML = '<div class="tile column col-12"><div class="tile-content" style="min-height:48px;"><div class="loading loading-lg"></div></div></div>';
}

function getAppsToUpdate() {
  var appsToUpdate = [];
  appsInstalled.forEach(appInstalled => {
    var app = appNameToApp(appInstalled.id);
    if (app.version != appInstalled.version)
      appsToUpdate.push(app);
  });
  return appsToUpdate;
}

function refreshMyApps() {
  var panelbody = document.querySelector("#myappscontainer .panel-body");
  panelbody.innerHTML = appsInstalled.map(appInstalled => {
var app = appNameToApp(appInstalled.id);
var version = getVersionInfo(app, appInstalled);
return `<div class="tile column col-6 col-sm-12 col-xs-12">
    <div class="tile-icon">
      <figure class="avatar"><img src="apps/${app.icon?`${app.id}/${app.icon}`:"unknown.png"}" alt="${escapeHtml(app.name)}"></figure>
    </div>
    <div class="tile-content">
      <p class="tile-title text-bold">${escapeHtml(app.name)} <small>(${version.text})</small></p>
      <p class="tile-subtitle">${escapeHtml(app.description)}</p>
    </div>
    <div class="tile-action">
      <button class="btn btn-link btn-action btn-lg ${(appInstalled&&app.interface)?"":"d-hide"}" appid="${app.id}" title="Download data from app"><i class="icon icon-download"></i></button>
      <button class="btn btn-link btn-action btn-lg ${version.canUpdate?'':'d-hide'}" appid="${app.id}" title="Update App"><i class="icon icon-refresh"></i></button>
      <button class="btn btn-link btn-action btn-lg" appid="${app.id}" title="Remove App"><i class="icon icon-delete"></i></button>
    </div>
  </div>
  `}).join("");
  htmlToArray(panelbody.getElementsByTagName("button")).forEach(button => {
    button.addEventListener("click",event => {
      var button = event.currentTarget;
      var icon = button.firstChild;
      var appid = button.getAttribute("appid");
      var app = appNameToApp(appid);
      if (!app) throw new Error("App "+appid+" not found");
      // check icon to figure out what we should do
      if (icon.classList.contains("icon-delete")) removeApp(app);
      if (icon.classList.contains("icon-refresh")) updateApp(app);
      if (icon.classList.contains("icon-download")) handleAppInterface(app);
    });
  });
  var appsToUpdate = getAppsToUpdate();
  var tab = document.querySelector("#tab-myappscontainer a");
  var updateApps = document.querySelector("#myappscontainer .updateapps");
  if (appsToUpdate.length) {
    updateApps.innerHTML = `Update ${appsToUpdate.length} apps`;
    updateApps.classList.remove("hidden");
    tab.setAttribute("data-badge", `${appsInstalled.length} ⬆${appsToUpdate.length}`);
  } else {
    updateApps.classList.add("hidden");
    tab.setAttribute("data-badge", appsInstalled.length);
  }
}

let haveInstalledApps = false;
function getInstalledApps(refresh) {
  if (haveInstalledApps && !refresh) {
    return Promise.resolve(appsInstalled);
  }
  showLoadingIndicator("myappscontainer");
  // Get apps and files
  return Comms.getInstalledApps()
    .then(appJSON => {
      appsInstalled = appJSON;
      haveInstalledApps = true;
      refreshMyApps();
      refreshLibrary();
    })
    .then(() => handleConnectionChange(true))
    .then(() => appsInstalled)
    .catch(err=>{
      return Promise.reject();
    });
}

/// Removes everything and install the given apps, eg: installMultipleApps(["boot","mclock"], "minimal")
function installMultipleApps(appIds, promptName) {
  var apps = appIds.map( appid => appJSON.find(app=>app.id==appid) );
  if (apps.some(x=>x===undefined))
    return Promise.reject("Not all apps found");
  var appCount = apps.length;
  return showPrompt("Install Defaults",`Remove everything and install ${promptName} apps?`).then(() => {
    return Comms.removeAllApps();
  }).then(()=>{
    Progress.hide({sticky:true});
    appsInstalled = [];
    showToast(`Existing apps removed. Installing  ${appCount} apps...`);
    return new Promise((resolve,reject) => {
      function upload() {
        var app = apps.shift();
        if (app===undefined) return resolve();
        Progress.show({title:`${app.name} (${appCount-apps.length}/${appCount})`,sticky:true});
        Comms.uploadApp(app,"skip_reset").then((appJSON) => {
          Progress.hide({sticky:true});
          if (appJSON) appsInstalled.push(appJSON);
          showToast(`(${appCount-apps.length}/${appCount}) ${app.name} Uploaded`);
          upload();
        }).catch(function() {
          Progress.hide({sticky:true});
          reject();
        });
      }
      upload();
    });
  }).then(()=>{
    return Comms.setTime();
  }).then(()=>{
    showToast("Apps successfully installed!","success");
    return getInstalledApps(true);
  });
}

var connectMyDeviceBtn = document.getElementById("connectmydevice");

function handleConnectionChange(connected) {
  connectMyDeviceBtn.textContent = connected ? 'Disconnect' : 'Connect';
  connectMyDeviceBtn.classList.toggle('is-connected', connected);
}

htmlToArray(document.querySelectorAll(".btn.refresh")).map(button => button.addEventListener("click", () => {
  getInstalledApps(true).catch(err => {
    showToast("Getting app list failed, "+err,"error");
  });
}));
htmlToArray(document.querySelectorAll(".btn.updateapps")).map(button => button.addEventListener("click", () => {
  var appsToUpdate = getAppsToUpdate();
  var count = appsToUpdate.length;
  function updater() {
    if (!appsToUpdate.length) return;
    var app = appsToUpdate.pop();
    return updateApp(app).then(function() {
      return updater();
    });
  }
  updater().then(err => {
    showToast(`Updated ${count} apps`,"success");
  }).catch(err => {
    showToast("Update failed, "+err,"error");
  });
}));
connectMyDeviceBtn.addEventListener("click", () => {
  if (connectMyDeviceBtn.classList.contains('is-connected')) {
    Comms.disconnectDevice();
  } else {
    getInstalledApps(true).catch(err => {
      showToast("Device connection failed, "+err,"error");
    });
  }
});
Comms.watchConnectionChange(handleConnectionChange);

var filtersContainer = document.querySelector("#librarycontainer .filter-nav");
filtersContainer.addEventListener('click', ({ target }) => {
  if (target.classList.contains('active')) return;

  activeFilter = target.getAttribute('filterid') || '';
  refreshFilter();
  refreshLibrary();
  window.location.hash = activeFilter;
});

var librarySearchInput = document.querySelector("#searchform input");
librarySearchInput.value = currentSearch;
librarySearchInput.addEventListener('input', evt => {
  currentSearch = evt.target.value.toLowerCase();
  refreshLibrary();
});

var sortContainer = document.querySelector("#librarycontainer .sort-nav");
sortContainer.addEventListener('click', ({ target }) => {
  if (target.classList.contains('active')) return;

  activeSort = target.getAttribute('sortid') || '';
  refreshSort();
  refreshLibrary();
  window.location.hash = activeFilter;
});

// =========================================== About

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

// Settings
var SETTINGS_HOOKS = {}; // stuff to get called when a setting is loaded
/// Load settings and update controls
function loadSettings() {
  var j = localStorage.getItem("settings");
  if (typeof j != "string") return;
  try {
    var s = JSON.parse(j);
    Object.keys(s).forEach( k => {
      SETTINGS[k]=s[k];
      if (SETTINGS_HOOKS[k]) SETTINGS_HOOKS[k]();
    } );
  } catch (e) {
    console.error("Invalid settings");
  }
}
/// Save settings
function saveSettings() {
  localStorage.setItem("settings", JSON.stringify(SETTINGS));
  console.log("Changed settings", SETTINGS);
}
// Link in settings DOM elements
function settingsCheckbox(id, name) {
  var setting = document.getElementById(id);
  function update() {
    setting.checked = SETTINGS[name];
  }
  SETTINGS_HOOKS[name] = update;
  setting.addEventListener('click', function() {
    SETTINGS[name] = setting.checked;
    saveSettings();
  });
}
settingsCheckbox("settings-pretokenise", "pretokenise");
loadSettings();

document.getElementById("defaultsettings").addEventListener("click",event=>{
  SETTINGS = JSON.parse(JSON.stringify(DEFAULTSETTINGS)); // clone
  saveSettings();
  loadSettings(); // update all settings
  refreshLibrary(); // favourites were in settings
});

document.getElementById("settime").addEventListener("click",event=>{
  Comms.setTime().then(()=>{
    showToast("Time set successfully","success");
  }, err=>{
    showToast("Error setting time, "+err,"error");
  });
});
document.getElementById("removeall").addEventListener("click",event=>{
  showPrompt("Remove All","Really remove all apps?").then(() => {
    return Comms.removeAllApps();
  }).then(()=>{
    Progress.hide({sticky:true});
    appsInstalled = [];
    showToast("All apps removed","success");
    return getInstalledApps(true);
  }).catch(err=>{
    Progress.hide({sticky:true});
    showToast("App removal failed, "+err,"error");
  });
});
// Install all default apps in one go
document.getElementById("installdefault").addEventListener("click",event=>{
  httpGet("defaultapps.json").then(json=>{
    return installMultipleApps(JSON.parse(json), "default");
  }).catch(err=>{
    Progress.hide({sticky:true});
    showToast("App Install failed, "+err,"error");
  });
});

// Install all favourite apps in one go
document.getElementById("installfavourite").addEventListener("click",event=>{
  var favApps = SETTINGS.favourites;
  installMultipleApps(favApps, "favourite").catch(err=>{
    Progress.hide({sticky:true});
    showToast("App Install failed, "+err,"error");
  });
});
