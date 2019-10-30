var appjson = [];
httpGet("apps.json").then(apps=>{
  appjson = JSON.parse(apps);
  appjson.sort(appSorter);
  refreshLibrary();
});

// Status
// ===========================================  Top Navigation
function showToast(message) {
  // toast-primary, toast-success, toast-warning or toast-error
  var toastcontainer = document.getElementById("toastcontainer");
  var msgDiv = htmlElement(`<div class="toast toast-primary"></div>`);
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
        var isYes = event.target.getAttribute("isyes");
        if (isYes) resolve();
        else reject();
        modal.remove();
      });
    });
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
  panelbody.innerHTML = appjson.map((app,idx) => `<div class="tile">
    <div class="tile-icon">
      <figure class="avatar"><img src="apps/${app.icon}" alt="${escapeHtml(app.name)}"></figure>
    </div>
    <div class="tile-content">
      <p class="tile-title text-bold">${escapeHtml(app.name)}</p>
      <p class="tile-subtitle">${escapeHtml(app.description)}</p>
    </div>
    <div class="tile-action">
      <button class="btn btn-link btn-action btn-lg"><i class="icon icon-upload" appid="${app.id}"></i></button>
    </div>
  </div>
  `);
  // set badge up top
  var tab = document.querySelector("#tab-librarycontainer a");
  tab.classList.add("badge");
  tab.setAttribute("data-badge", appjson.length);
  htmlToArray(panelbody.getElementsByTagName("button")).forEach(button => {
    button.addEventListener("click",event => {
      var icon = event.target;
      var appid = icon.getAttribute("appid");
      var app = appjson.find(app=>app.id==appid);
      if (!app) return;
      icon.classList.remove("icon-upload");
      icon.classList.add("loading");
      Comms.uploadApp(app).then(() => {
        showToast(app.name+" Uploaded!");
        icon.classList.remove("loading");
        icon.classList.add("icon-delete");
      }).catch(() => {
        icon.classList.remove("loading");
        icon.classList.add("icon-upload");
      });
    });
  });
}

refreshLibrary();
// =========================================== My Apps

function appNameToApp(appName) {
  var app = appjson.find(app=>app.id==appName);
  if (app) return app;
  return { id: "appName",
    name: "Unknown app "+appName,
    icon: "unknown.png",
    description: "Unknown app",
    storage: [],
    unknown: true,
  };
}

function refreshMyApps() {
  var panelbody = document.querySelector("#myappscontainer .panel-body");
  var tab = document.querySelector("#tab-myappscontainer a");
  // set badge up top
  tab.classList.add("badge");
  tab.setAttribute("data-badge", "");
  // Loading indicator
  panelbody.innerHTML = '<div class="loading loading-lg"></div>';
  // Get apps
  Comms.getInstalledApps().then(appIDs => {
    tab.setAttribute("data-badge", appIDs.length);
    panelbody.innerHTML = appIDs.map(appNameToApp).sort(appSorter).map(app => `<div class="tile">
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
    `);
    htmlToArray(panelbody.getElementsByTagName("button")).forEach(button => {
      button.addEventListener("click",event => {
        var icon = event.target;
        var appid = icon.getAttribute("appid");
        var app = appNameToApp(appid);
        showPrompt("Delete","Really remove app '"+appid+"'?").then(() => {
          // remove app!
          refreshMyApps();
        });
      });
    });
  });
}


document.getElementById("myappsrefresh").addEventListener("click",event=>{
  refreshMyApps();
});
