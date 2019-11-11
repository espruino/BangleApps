Puck.debug=3;

// FIXME: use UART lib so that we handle errors properly
var Comms = {
uploadApp : app => {
  return AppInfo.getFiles(app, httpGet).then(fileContents => {
    return new Promise((resolve,reject) => {
      fileContents = fileContents.map(storageFile=>storageFile.cmd).join("\n")+"\n";
      console.log("uploadApp",fileContents);
      // reset to ensure we have enough memory to upload what we need to
      Puck.write("\x03reset();\n", (result) => {
        if (result===null) return reject("");
        setTimeout(() => { // wait for reset
          Puck.write("\x10E.showMessage('Uploading...')\n"+fileContents+"load()\n",(result) => {
            if (result===null) return reject("");
            resolve();
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
      Puck.eval('require("Storage").list().filter(f=>f[0]=="+").map(f=>f.substr(1))', (appList,err) => {
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
    Puck.setTime((result) => {
      if (result===null) return reject("");
      resolve();
    });
  });
}
};
