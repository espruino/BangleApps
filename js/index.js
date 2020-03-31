var appJSON = []; // List of apps and info from apps.json
var appsInstalled = []; // list of app JSON
var files = []; // list of files on Bangle

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

// Status
// ===========================================  Top Navigation
function showToast(message, type) {
  // toast-primary, toast-success, toast-warning or toast-error
  var style = "toast-primary";
  if (type=="success")  style = "toast-success";
  else if (type=="error")  style = "toast-error";
  else if (type!==undefined) console.log("showToast: unknown toast "+type);
  var toastcontainer = document.getElementById("toastcontainer");
  var msgDiv = htmlElement(`<div class="toast ${style}"></div>`);
  msgDiv.innerHTML = message;
  toastcontainer.append(msgDiv);
  setTimeout(function() {
    msgDiv.remove();
  }, 5000);
}
var progressToast; // the DOM element
var progressSticky; // showProgress(,,"sticky") don't remove until hideProgress("sticky")
var progressInterval; // the interval used if showProgress(..., "animate")
var progressPercent; // the current progress percentage
function showProgress(text, percent, sticky) {
  if (sticky=="sticky")
    progressSticky = true;
  if (!progressToast) {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = undefined;
    }
    if (percent == "animate") {
      progressInterval = setInterval(function() {
        progressPercent += 2;
        if (progressPercent>100) progressPercent=0;
        showProgress(undefined, progressPercent);
      }, 100);
      percent = 0;
    }
    progressPercent = percent;

    var toastcontainer = document.getElementById("toastcontainer");
    progressToast = htmlElement(`<div class="toast">
    ${text ? `<div>${text}</div>`:``}
    <div class="bar bar-sm">
      <div class="bar-item" id="progressToast" role="progressbar" style="width:${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
  </div>`);
    toastcontainer.append(progressToast);
  } else {
    var pt=document.getElementById("progressToast");
    pt.setAttribute("aria-valuenow",percent);
    pt.style.width = percent+"%";
  }
}
function hideProgress(sticky) {
  if (progressSticky && sticky!="sticky")
    return;
  progressSticky = false;
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = undefined;
  }
  if (progressToast) progressToast.remove();
  progressToast = undefined;
}

Puck.writeProgress = function(charsSent, charsTotal) {
  if (charsSent===undefined) {
    hideProgress();
    return;
  }
  var percent = Math.round(charsSent*100/charsTotal);
  showProgress(undefined, percent);
}
function showPrompt(title, text, buttons) {
  if (!buttons) buttons={yes:1,no:1};
  return new Promise((resolve,reject) => {
    var modal = htmlElement(`<div class="modal active">
      <!--<a href="#close" class="modal-overlay" aria-label="Close"></a>-->
      <div class="modal-container">
        <div class="modal-header">
          <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a>
          <div class="modal-title h5">${escapeHtml(title)}</div>
        </div>
        <div class="modal-body">
          <div class="content">
            ${escapeHtml(text).replace(/\n/g,'<br/>')}
          </div>
        </div>
        <div class="modal-footer">
          <div class="modal-footer">
            ${buttons.yes?'<button class="btn btn-primary" isyes="1">Yes</button>':''}
            ${buttons.no?'<button class="btn" isyes="0">No</button>':''}
            ${buttons.ok?'<button class="btn" isyes="1">Ok</button>':''}
          </div>
        </div>
      </div>
    </div>`);
    document.body.append(modal);
    modal.querySelector("a[href='#close']").addEventListener("click",event => {
      event.preventDefault();
      reject("User cancelled");
      modal.remove();
    });
    htmlToArray(modal.getElementsByTagName("button")).forEach(button => {
      button.addEventListener("click",event => {
        event.preventDefault();
        var isYes = event.target.getAttribute("isyes")=="1";
        if (isYes) resolve();
        else reject("User cancelled");
        modal.remove();
      });
    });
  });
}
function showChangeLog(appid) {
  var app = appNameToApp(appid);
  function show(contents) {
    showPrompt(app.name+" Change Log",contents,{ok:true}).catch(()=>{});;
  }
  httpGet(`apps/${appid}/ChangeLog`).
  then(show).catch(()=>show("No Change Log available"));
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
      var app = {};
      Object.keys(appTemplate).forEach(k => app[k] = appTemplate[k]);
      Object.keys(appFiles).forEach(k => app[k] = appFiles[k]);
      console.log("Received custom app", app);
      modal.remove();
      showProgress(`Uploading ${app.name}`,undefined,"sticky");
      Comms.uploadApp(app).then(()=>{
        hideProgress("sticky");
        resolve();
      }).catch(e => {
        hideProgress("sticky");
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
        }
      }, false);
      iwin.postMessage({type:"init"});
    };
    iframe.src = `apps/${app.id}/${app.interface}`;
  });
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

var chips = Array.from(document.querySelectorAll('.chip')).map(chip => chip.attributes.filterid.value)
var hash = window.location.hash ? window.location.hash.slice(1) : '';

var activeFilter = !!~chips.indexOf(hash) ? hash : '';
var currentSearch = '';

function refreshFilter(){
  var filtersContainer = document.querySelector("#librarycontainer .filter-nav");
  filtersContainer.querySelector('.active').classList.remove('active');
  if(activeFilter) filtersContainer.querySelector('.chip[filterid="'+activeFilter+'"]').classList.add('active')
  else filtersContainer.querySelector('.chip[filterid]').classList.add('active')
}
function refreshLibrary() {
  var panelbody = document.querySelector("#librarycontainer .panel-body");
  var visibleApps = appJSON;

  if (activeFilter) {
    visibleApps = visibleApps.filter(app => app.tags && app.tags.split(',').includes(activeFilter));
  }

  if (currentSearch) {
    visibleApps = visibleApps.filter(app => app.name.toLowerCase().includes(currentSearch) || app.tags.includes(currentSearch));
  }

  panelbody.innerHTML = visibleApps.map((app,idx) => {
    var appInstalled = appsInstalled.find(a=>a.id==app.id);
    var version = getVersionInfo(app, appInstalled);
    var versionInfo = version.text;
    if (versionInfo) versionInfo = " <small>("+versionInfo+")</small>";
    return `<div class="tile column col-6 col-sm-12 col-xs-12">
    <div class="tile-icon">
      <figure class="avatar"><img src="apps/${app.icon?`${app.id}/${app.icon}`:"unknown.png"}" alt="${escapeHtml(app.name)}"></figure><br/>
    </div>
    <div class="tile-content">
      <p class="tile-title text-bold">${escapeHtml(app.name)} ${versionInfo}</p>
      <p class="tile-subtitle">${escapeHtml(app.description)}</p>
      <a href="https://github.com/espruino/BangleApps/tree/master/apps/${app.id}" target="_blank" class="link-github"><img src="img/github-icon-sml.png" alt="See the code on GitHub"/></a>
    </div>
    <div class="tile-action">
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
        showProgress(`Uploading ${app.name}`,undefined,"sticky");
        Comms.uploadApp(app).then((appJSON) => {
          hideProgress("sticky");
          if (appJSON) appsInstalled.push(appJSON);
          showToast(app.name+" Uploaded!", "success");
          icon.classList.remove("loading");
          icon.classList.add("icon-delete");
          refreshMyApps();
          refreshLibrary();
        }).catch(err => {
          hideProgress("sticky");
          showToast("Upload failed, "+err, "error");
          icon.classList.remove("loading");
          icon.classList.add("icon-upload");
        });
      } else if (icon.classList.contains("icon-menu")) {
        // custom HTML update
        if (app.custom) {
          icon.classList.remove("icon-menu");
          icon.classList.add("loading");
          handleCustomApp(app).then((appJSON) => {
            if (appJSON) appsInstalled.push(appJSON);
            showToast(app.name+" Uploaded!", "success");
            icon.classList.remove("loading");
            icon.classList.add("icon-delete");
            refreshMyApps();
            refreshLibrary();
          }).catch(err => {
            showToast("Customise failed, "+err, "error");
            icon.classList.remove("loading");
            icon.classList.add("icon-menu");
          });
        }
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
      }
    });
  });
}

refreshFilter();
refreshLibrary();
// =========================================== My Apps

function removeApp(app) {
  return showPrompt("Delete","Really remove '"+app.name+"'?").then(() => {
    return Comms.removeApp(app);
  }).then(()=>{
    appsInstalled = appsInstalled.filter(a=>a.id!=app.id);
    showToast(app.name+" removed successfully","success");
    refreshMyApps();
    refreshLibrary();
  }, err=>{
    showToast(app.name+" removal failed, "+err,"error");
  });
}

function updateApp(app) {
  showProgress(`Upgrading ${app.name}`,undefined,"sticky");
  Comms.removeApp(app).then(()=>{
    showToast(app.name+" removed successfully. Updating...",);
    appsInstalled = appsInstalled.filter(a=>a.id!=app.id);
    return Comms.uploadApp(app);
  }).then((appJSON) => {
    hideProgress("sticky");
    if (appJSON) appsInstalled.push(appJSON);
    showToast(app.name+" Updated!", "success");
    refreshMyApps();
    refreshLibrary();
  }, err=>{
    hideProgress("sticky");
    showToast(app.name+" update failed, "+err,"error");
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

function refreshMyApps() {
  var panelbody = document.querySelector("#myappscontainer .panel-body");
  var tab = document.querySelector("#tab-myappscontainer a");
  tab.setAttribute("data-badge", appsInstalled.length);
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
      if (icon.classList.contains("icon-download")) handleAppInterface(app)
    });
  });
}

function getInstalledApps() {
  showLoadingIndicator("myappscontainer");
  showProgress(`Getting app list...`,undefined,"sticky");
  // Get apps and files
  return Comms.getInstalledApps()
    .then(appJSON => {
      hideProgress("sticky");
      appsInstalled = appJSON;
      refreshMyApps();
      refreshLibrary();
    })
    .then(() => handleConnectionChange(true))
    .catch(err=>{
      hideProgress("sticky");
      return Promise.reject();
    });
}

var connectMyDeviceBtn = document.getElementById("connectmydevice");

function handleConnectionChange(connected) {
  connectMyDeviceBtn.textContent = connected ? 'Disconnect' : 'Connect';
  connectMyDeviceBtn.classList.toggle('is-connected', connected);
}

htmlToArray(document.querySelectorAll(".btn.refresh")).map(button => button.addEventListener("click", () => {
  getInstalledApps().catch(err => {
    showToast("Getting app list failed, "+err,"error");
  });
}));
connectMyDeviceBtn.addEventListener("click", () => {
  if (connectMyDeviceBtn.classList.contains('is-connected')) {
    Comms.disconnectDevice();
  } else {
    getInstalledApps().catch(err => {
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
  window.location.hash = activeFilter
});

var librarySearchInput = document.querySelector("#searchform input");

librarySearchInput.addEventListener('input', evt => {
  currentSearch = evt.target.value.toLowerCase();
  refreshLibrary();
});

// =========================================== About

document.getElementById("settime").addEventListener("click",event=>{
  Comms.setTime().then(()=>{
    showToast("Time set successfully","success");
  }, err=>{
    showToast("Error setting time, "+err,"error");
  });
});
document.getElementById("removeall").addEventListener("click",event=>{
  showPrompt("Remove All","Really remove all apps?").then(() => {
    showProgress("Removing all apps","animate", "sticky");
    return Comms.removeAllApps();
  }).then(()=>{
    hideProgress("sticky");
    appsInstalled = [];
    showToast("All apps removed","success");
    return getInstalledApps();
  }).catch(err=>{
    hideProgress("sticky");
    showToast("App removal failed, "+err,"error");
  });
});
// Install all default apps in one go
document.getElementById("installdefault").addEventListener("click",event=>{
  var defaultApps, appCount;
  httpGet("defaultapps.json").then(json=>{
    defaultApps = JSON.parse(json);
    defaultApps = defaultApps.map( appid => appJSON.find(app=>app.id==appid) );
    if (defaultApps.some(x=>x===undefined))
      throw "Not all apps found";
    appCount = defaultApps.length;
    return showPrompt("Install Defaults","Remove everything and install default apps?");
  }).then(() => {
    showProgress("Removing all apps","animate", "sticky");
    return Comms.removeAllApps();
  }).then(()=>{
    hideProgress("sticky");
    appsInstalled = [];
    showToast(`Existing apps removed. Installing  ${appCount} apps...`);
    return new Promise((resolve,reject) => {
      function upload() {
        var app = defaultApps.shift();
        if (app===undefined) return resolve();
        showProgress(`${app.name} (${appCount-defaultApps.length}/${appCount})`,undefined,"sticky");
        Comms.uploadApp(app,"skip_reset").then((appJSON) => {
          hideProgress("sticky");
          if (appJSON) appsInstalled.push(appJSON);
          showToast(`(${appCount-defaultApps.length}/${appCount}) ${app.name} Uploaded`);
          upload();
        }).catch(function() {
          hideProgress("sticky");
          reject()
        });
      }
      upload();
    });
  }).then(()=>{
    return Comms.setTime();
  }).then(()=>{
    showToast("Default apps successfully installed!","success");
    return getInstalledApps();
  }).catch(err=>{
    hideProgress("sticky");
    showToast("App Install failed, "+err,"error");
  });
});
