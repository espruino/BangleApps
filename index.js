var appJSON = []; // List of apps and info from apps.json
var appsInstalled = []; // list of app IDs

httpGet("apps.json").then(apps=>{
  try {
    appJSON = JSON.parse(apps);
  } catch(e) {
    console.log(e);
    showToast("App List Corrupted","error");
  }
  appJSON.sort(appSorter);
  refreshLibrary();
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
function showPrompt(title, text) {
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
            ${escapeHtml(text)}
          </div>
        </div>
        <div class="modal-footer">
          <div class="modal-footer">
            <button class="btn btn-primary" isyes="1">Yes</button>
            <button class="btn" isyes="0">No</button>
          </div>
        </div>
      </div>
    </div>`);
    document.body.append(modal);
    htmlToArray(modal.getElementsByTagName("button")).forEach(button => {
      button.addEventListener("click",event => {
        event.preventDefault();
        var isYes = event.target.getAttribute("isyes")=="1";
        if (isYes) resolve();
        else reject();
        modal.remove();
      });
    });
  });
}
function handleCustomApp(app) {
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
            <iframe src="apps/${app.custom}" style="width:100%;height:100%;border:0px;">
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
      var app = event.data;
      console.log("Received custom app", app);
      modal.remove();
      Comms.uploadApp(app).then(resolve,reject);
    }, false);
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
function refreshLibrary() {
  var panelbody = document.querySelector("#librarycontainer .panel-body");
  panelbody.innerHTML = appJSON.map((app,idx) => {
    var icon = "icon-upload";
    if (app.custom)
      icon = "icon-menu";
    if (appsInstalled.includes(app.id))
      icon = "icon-delete";
    return `<div class="tile column col-6 col-sm-12 col-xs-12">
    <div class="tile-icon">
      <figure class="avatar"><img src="apps/${app.icon?app.icon:"apps/unknown.png"}" alt="${escapeHtml(app.name)}"></figure>
    </div>
    <div class="tile-content">
      <p class="tile-title text-bold">${escapeHtml(app.name)}</p>
      <p class="tile-subtitle">${escapeHtml(app.description)}</p>
    </div>
    <div class="tile-action">
      <button class="btn btn-link btn-action btn-lg"><i class="icon ${icon}" appid="${app.id}"></i></button>
    </div>
  </div>
  `;}).join("");
  // set badge up top
  var tab = document.querySelector("#tab-librarycontainer a");
  tab.classList.add("badge");
  tab.setAttribute("data-badge", appJSON.length);
  htmlToArray(panelbody.getElementsByTagName("button")).forEach(button => {
    button.addEventListener("click",event => {
      var icon = event.target;
      var appid = icon.getAttribute("appid");
      var app = appJSON.find(app=>app.id==appid);
      if (!app) return;
      if (icon.classList.contains("icon-upload")) {
        icon.classList.remove("icon-upload");
        icon.classList.add("loading");
        Comms.uploadApp(app).then(() => {
          appsInstalled.push(app.id);
          showToast(app.name+" Uploaded!", "success");
          icon.classList.remove("loading");
          icon.classList.add("icon-delete");
          refreshMyApps();
        }).catch(err => {
          showToast("Upload failed, "+err, "error");
          icon.classList.remove("loading");
          icon.classList.add("icon-upload");
        });
      } else if (icon.classList.contains("icon-menu")) {
        if (app.custom) {
          icon.classList.remove("icon-menu");
          icon.classList.add("loading");
          handleCustomApp(app).then(() => {
            appsInstalled.push(app.id);
            showToast(app.name+" Uploaded!", "success");
            icon.classList.remove("loading");
            icon.classList.add("icon-delete");
            refreshMyApps();
          }).catch(err => {
            showToast("Customise failed, "+err, "error");
            icon.classList.remove("loading");
            icon.classList.add("icon-menu");
          });
        }
      } else {
        icon.classList.remove("icon-delete");
        icon.classList.add("loading");
        removeApp(app);
      }
    });
  });
}

refreshLibrary();
// =========================================== My Apps

function removeApp(app) {
  return showPrompt("Delete","Really remove '"+app.name+"'?").then(() => {
    Comms.removeApp(app).then(()=>{
      appsInstalled = appsInstalled.filter(id=>id!=app.id);
      showToast(app.name+" removed successfully","success");
      refreshMyApps();
      refreshLibrary();
    }, err=>{
      showToast(app.name+" removal failed, "+err,"error");
    });
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
    icon: "unknown.png",
    description: "Unknown app",
    storage: [ {name:"+"+appName}],
    unknown: true,
  };
}

function showLoadingIndicator() {
  var panelbody = document.querySelector("#myappscontainer .panel-body");
  var tab = document.querySelector("#tab-myappscontainer a");
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
  panelbody.innerHTML = appsInstalled.map(appNameToApp).sort(appSorter).map(app => `<div class="tile column col-6 col-sm-12 col-xs-12">
    <div class="tile-icon">
      <figure class="avatar"><img src="apps/${app.icon}" alt="${escapeHtml(app.name)}"></figure>
    </div>
    <div class="tile-content">
      <p class="tile-title text-bold">${escapeHtml(app.name)}</p>
      <p class="tile-subtitle">${escapeHtml(app.description)}</p>
    </div>
    <div class="tile-action">
      <button class="btn btn-link btn-action btn-lg"><i class="icon icon-delete" appid="${app.id}"></i></button>
    </div>
  </div>
  `).join("");
  htmlToArray(panelbody.getElementsByTagName("button")).forEach(button => {
    button.addEventListener("click",event => {
      var icon = event.target;
      var appid = icon.getAttribute("appid");
      var app = appNameToApp(appid);
      removeApp(app);
    });
  });
}

function getInstalledApps() {
  showLoadingIndicator();
  // Get apps
  Comms.getInstalledApps().then(appIDs => {
    appsInstalled = appIDs;
    refreshMyApps();
    refreshLibrary();
  }).catch(err => {
    showToast("Getting app list failed, "+err,"error");
  });
}


document.getElementById("myappsrefresh").addEventListener("click",event=>{
  getInstalledApps();
});
