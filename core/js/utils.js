function escapeHtml(text) {
  let map = {
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
  let div = document.createElement('div');
  div.innerHTML = str.trim();
  return div.firstChild;
}
function httpGet(url) {
  let isBinary = !(url.endsWith(".js") || url.endsWith(".json") || url.endsWith(".csv") || url.endsWith(".txt"));
  return new Promise((resolve,reject) => {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", () => {
      if (oReq.status!=200) {
        resolve(oReq.status+" - "+oReq.statusText)
        return;
      }
      if (!isBinary) {
        resolve(oReq.responseText)
      } else {
        // ensure we actually load the data as a raw 8 bit string (not utf-8/etc)
        let a = new FileReader();
        a.onloadend = function() {
          let bytes = new Uint8Array(a.result);
          let str = "";
          for (let i=0;i<bytes.length;i++)
            str += String.fromCharCode(bytes[i]);
          resolve(str)
        };
        a.readAsArrayBuffer(oReq.response);
      }
    });
    oReq.addEventListener("error", () => reject());
    oReq.addEventListener("abort", () => reject());
    oReq.open("GET", url, true);
    oReq.onerror = function () {
      reject("HTTP Request failed");
    };
    if (isBinary)
      oReq.responseType = 'blob';
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
  let sa = 0|a.sortorder;
  let sb = 0|b.sortorder;
  if (sa<sb) return -1;
  if (sa>sb) return 1;
  return (a.name==b.name) ? 0 : ((a.name<b.name) ? -1 : 1);
}

/* Given 2 JSON structures (1st from apps.json, 2nd from an installed app)
work out what to display re: versions and if we can update */
function getVersionInfo(appListing, appInstalled) {
  let versionText = "";
  let canUpdate = false;
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
