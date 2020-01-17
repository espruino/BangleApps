Puck.debug=3;

// FIXME: use UART lib so that we handle errors properly
var Comms = {
uploadApp : app => {
  return AppInfo.getFiles(app, httpGet).then(fileContents => {
    return new Promise((resolve,reject) => {
      var appJSONFile = fileContents.find(f=>f.name=="+"+app.id);
      var appJSON = undefined;
      if (appJSONFile)
        try {
          appJSON=JSON.parse(appJSONFile.content);
          appJSON.id = app.id;
        } catch(e) {
          console.log("Error decoding app JSON for",app.id,e);
        }
      fileContents = fileContents.map(storageFile=>storageFile.cmd).join("\n")+"\n";
      console.log("uploadApp",fileContents);
      // reset to ensure we have enough memory to upload what we need to
      Puck.write("\x03reset();\n", (result) => {
        if (result===null) return reject("");
        setTimeout(() => { // wait for reset
          Puck.write("\x10E.showMessage('Uploading...')\n"+fileContents+"\x10E.showMessage('Hold BTN3\\nto reload')\n",(result) => {
            if (result===null) return reject("");
            resolve(appJSON);
          });
        },500);
      });
    });
  });
},
getInstalledApps : () => {
  return new Promise((resolve,reject) => {
    Puck.write("\x03",(result) => {
      if (result===null) return reject("");
      Puck.eval('require("Storage").list().filter(f=>f[0]=="+").map(f=>{var j=require("Storage").readJSON(f)||{};j.id=f.substr(1);return j})', (appList,err) => {
        if (appList===null) return reject(err || "");
        console.log("getInstalledApps", appList);
        resolve(appList);
      });
    });
  });
},
removeApp : app => { // expects an app structure
  var cmds = app.storage.map(file=>{
    return `\x10require("Storage").erase(${toJS(file.name)});\n`;
  }).join("");
  console.log("removeApp", cmds);
  return new Promise((resolve,reject) => {
    Puck.write("\x03"+cmds+"\x10E.showMessage('Hold BTN3\\nto reload')\n",(result) => {
      if (result===null) return reject("");
      resolve();
    });
  });
},
removeAllApps : () => {
  return new Promise((resolve,reject) => {
    // Use eval here so we wait for it to finish
    Puck.eval('require("Storage").eraseAll()||true', (result,err) => {
      if (result===null) return reject(err || "");
      Puck.write('\x03\x10reset()\n',(result) => {
        if (result===null) return reject("");
        resolve();
      });
    });
  });
},
setTime : () => {
  return new Promise((resolve,reject) => {
    var d = new Date();
    var tz = d.getTimezoneOffset()/-60
    var cmd = '\x03\x10setTime('+(d.getTime()/1000)+');';
    // in 1v93 we have timezones too
    cmd += 'E.setTimeZone('+tz+');';
    cmd += "(s=>{s&&(s.timezone="+tz+")&&require('Storage').write('@setting',s);})(require('Storage').readJSON('@setting'))\n";
    Puck.write(cmd, (result) => {
      if (result===null) return reject("");
      resolve();
    });
  });
},
disconnectDevice: () => {
  var connection = Puck.getConnection();

  if (!connection) return;

  connection.close();
},
watchConnectionChange : cb => {
  var connected = Puck.isConnected();

  //TODO Switch to an event listener when Puck will support it
  var interval = setInterval(() => {
    if (connected === Puck.isConnected()) return;

    connected = Puck.isConnected();
    cb(connected);
  }, 1000);

  //stop watching
  return () => {
    clearInterval(interval);
  };
},
listFiles : () => {
  return new Promise((resolve,reject) => {
    Puck.write("\x03",(result) => {
      if (result===null) return reject("");
      //use encodeURIComponent to serialize octal sequence of append files
      Puck.eval('require("Storage").list().map(encodeURIComponent)', (files,err) => {
        if (files===null) return reject(err || "");
        files = files.map(decodeURIComponent);
        console.log("listFiles", files);
        resolve(files);
      });
    });
  });
},
readFile : (file) => {
  return new Promise((resolve,reject) => {
    //encode name to avoid serialization issue due to octal sequence
    const name = encodeURIComponent(file);
    Puck.write("\x03",(result) => {
      if (result===null) return reject("");
      //TODO: big files will not fit in RAM.
      //we should loop and read chunks one by one.
      //Use btoa for binary content
      Puck.eval(`btoa(require("Storage").read(decodeURIComponent("${name}"))))`, (content,err) => {
        if (content===null) return reject(err || "");
        resolve(atob(content));
      });
    });
  });
}
};
