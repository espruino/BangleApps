function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
// simple glob to regex conversion, only supports "*" and "?" wildcards
function globToRegex(pattern) {
  const ESCAPE = '.*+-?^${}()|[]\\';
  const regex = pattern.replace(/./g, c => {
    switch (c) {
      case '?': return '.';
      case '*': return '.*';
      default: return ESCAPE.includes(c) ? ('\\' + c) : c;
    }
  });
  return new RegExp('^'+regex+'$');
}
function htmlToArray(collection) {
  return [].slice.call(collection);
}
function htmlElement(str) {
  var div = document.createElement('div');
  div.innerHTML = str.trim();
  return div.firstChild;
}
function httpGet(url) {
  return new Promise((resolve,reject) => {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", () => {
      if (oReq.status==200) resolve(oReq.responseText)
      else reject(oReq.status+" - "+oReq.statusText);
    });
    oReq.addEventListener("error", () => reject());
    oReq.addEventListener("abort", () => reject());
    oReq.open("GET", url, true);
    oReq.onerror = function () {
      reject("HTTP Request failed");
    };
    oReq.send();
  });
}
function toJS(txt) {
  return JSON.stringify(txt);
}
// callback for sorting apps
function appSorter(a,b) {
  if (a.unknown || b.unknown)
    return (a.unknown)? 1 : -1;
  var sa = 0|a.sortorder;
  var sb = 0|b.sortorder;
  if (sa<sb) return -1;
  if (sa>sb) return 1;
  return (a.name==b.name) ? 0 : ((a.name<b.name) ? -1 : 1);
}

/* Given 2 JSON structures (1st from apps.json, 2nd from an installed app)
work out what to display re: versions and if we can update */
function getVersionInfo(appListing, appInstalled) {
  var versionText = "";
  var canUpdate = false;
  function clicky(v) {
    return `<a class="c-hand" onclick="showChangeLog('${appListing.id}')">${v}</a>`;
  }

  if (!appInstalled) {
    if (appListing.version)
      versionText = clicky("v"+appListing.version);
  } else {
    versionText = (appInstalled.version ? (clicky("v"+appInstalled.version)) : "Unknown version");
    if (appListing.version != appInstalled.version) {
      if (appListing.version) versionText += ", latest "+clicky("v"+appListing.version);
      canUpdate = true;
    }
  }
  return {
    text : versionText,
    canUpdate : canUpdate
  }
}
