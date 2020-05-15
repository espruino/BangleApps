Puck.debug=3;

// FIXME: use UART lib so that we handle errors properly
var Comms = {
reset : (opt) => new Promise((resolve,reject) => {
  Puck.write(`\x03\x10reset(${opt=="wipe"?"1":""});\n`, (result) => {
    if (result===null) return reject("Connection failed");
    setTimeout(resolve,500);
  });
}),
uploadApp : (app,skipReset) => { // expects an apps.json structure (i.e. with `storage`)
  Progress.show({title:`Uploading ${app.name}`,sticky:true});
  return AppInfo.getFiles(app, {
    fileGetter : httpGet,
    settings : SETTINGS
  }).then(fileContents => {
    return new Promise((resolve,reject) => {
      console.log("uploadApp",fileContents.map(f=>f.name).join(", "));
      var maxBytes = fileContents.reduce((b,f)=>b+f.cmd.length, 0)||1;
      var currentBytes = 0;

      var appInfoFileName = app.id+".info";
      var appInfoFile = fileContents.find(f=>f.name==appInfoFileName);
      if (!appInfoFile) reject(`${appInfoFileName} not found`);
      var appInfo = JSON.parse(appInfoFile.content);

      // Upload each file one at a time
      function doUploadFiles() {
        // No files left - print 'reboot' message
        if (fileContents.length==0) {
          Puck.write(`\x10E.showMessage('Hold BTN3\\nto reload')\n`,(result) => {
            Progress.hide({sticky:true});
            if (result===null) return reject("");
            resolve(appInfo);
          });
          return;
        }
        var f = fileContents.shift();
        console.log(`Upload ${f.name} => ${JSON.stringify(f.content)}`);
        // Chould check CRC here if needed instead of returning 'OK'...
        // E.CRC32(require("Storage").read(${JSON.stringify(app.name)}))
        var cmds = f.cmd.split("\n");
        function uploadCmd() {
          if (!cmds.length) return doUploadFiles();
          var cmd = cmds.shift();
          Progress.show({
            min:currentBytes / maxBytes,
            max:(currentBytes+cmd.length) / maxBytes});
          currentBytes += cmd.length;
          Puck.write(`${cmd};Bluetooth.println("OK")\n`,(result) => {
            if (!result || result.trim()!="OK") {
              Progress.hide({sticky:true});
              return reject("Unexpected response "+(result||""));
            }
            uploadCmd();
          }, true); // wait for a newline
        }
        uploadCmd();
      }
      // Start the upload
      function doUpload() {
        Puck.write(`\x10E.showMessage('Uploading\\n${app.id}...')\n`,(result) => {
          if (result===null) {
            Progress.hide({sticky:true});
            return reject("");
          }
          doUploadFiles();
        });
      }
      if (skipReset) {
        doUpload();
      } else {
        // reset to ensure we have enough memory to upload what we need to
        Comms.reset().then(doUpload, reject)
      }
    });
  });
},
getInstalledApps : () => {
  Progress.show({title:`Getting app list...`,sticky:true});
  return new Promise((resolve,reject) => {
    Puck.write("\x03",(result) => {
      if (result===null) {
        Progress.hide({sticky:true});
        return reject("");
      }
      Puck.write('\x10Bluetooth.print("[");require("Storage").list(/\.info$/).forEach(f=>{var j=require("Storage").readJSON(f,1)||{};j.id=f.slice(0,-5);Bluetooth.print(JSON.stringify(j)+",")});Bluetooth.println("0]")\n', (appList,err) => {
        Progress.hide({sticky:true});
        try {
          appList = JSON.parse(appList);
          // remove last element since we added a final '0'
          // to make things easy on the Bangle.js side
          appList = appList.slice(0,-1);
        } catch (e) {
          appList = null;
          err = e.toString();
        }
        if (appList===null) return reject(err || "");
        console.log("getInstalledApps", appList);
        resolve(appList);
      }, true /* callback on newline */);
    });
  });
},
removeApp : app => { // expects an appid.info structure (i.e. with `files`)
  if (!app.files && !app.data) return Promise.resolve(); // nothing to erase
  Progress.show({title:`Removing ${app.name}`,sticky:true});
  let cmds = '\x10const s=require("Storage");\n';
  // remove App files: regular files, exact names only
  cmds += app.files.split(',').map(file => `\x10s.erase(${toJS(file)});\n`).join("");
  // remove app Data: (dataFiles and storageFiles)
  const data = AppInfo.parseDataString(app.data)
  const isGlob = f => /[?*]/.test(f)
  //   regular files, can use wildcards
  cmds += data.dataFiles.map(file => {
    if (!isGlob(file)) return `\x10s.erase(${toJS(file)});\n`;
    const regex = new RegExp(globToRegex(file))
    return `\x10s.list(${regex}).forEach(f=>s.erase(f));\n`;
  }).join("");
  //   storageFiles, can use wildcards
  cmds += data.storageFiles.map(file => {
    if (!isGlob(file)) return `\x10s.open(${toJS(file)},'r').erase();\n`;
    // storageFiles have a chunk number appended to their real name
    const regex = globToRegex(file+'\u0001')
    // open() doesn't want the chunk number though
    let cmd = `\x10s.list(${regex}).forEach(f=>s.open(f.substring(0,f.length-1),'r').erase());\n`
    // using a literal \u0001 char fails (not sure why), so escape it
    return cmd.replace('\u0001', '\\x01')
  }).join("");
  console.log("removeApp", cmds);
  return Comms.reset().then(new Promise((resolve,reject) => {
    Puck.write(`\x03\x10E.showMessage('Erasing\\n${app.id}...')${cmds}\x10E.showMessage('Hold BTN3\\nto reload')\n`,(result) => {
      Progress.hide({sticky:true});
      if (result===null) return reject("");
      resolve();
    });
  })).catch(function(reason) {
    Progress.hide({sticky:true});
    return Promise.reject(reason);
  });
},
removeAllApps : () => {
  Progress.show({title:"Removing all apps",progess:"animate",sticky:true});
  return new Promise((resolve,reject) => {
    // Use write with newline here so we wait for it to finish
    Puck.write('\x10E.showMessage("Erasing...");require("Storage").eraseAll();Bluetooth.println("OK");reset()\n', (result,err) => {
      Progress.hide({sticky:true});
      if (!result || result.trim()!="OK") return reject(err || "");
      resolve();
    }, true /* wait for newline */);
  });
},
setTime : () => {
  return new Promise((resolve,reject) => {
    var d = new Date();
    var tz = d.getTimezoneOffset()/-60
    var cmd = '\x03\x10setTime('+(d.getTime()/1000)+');';
    // in 1v93 we have timezones too
    cmd += 'E.setTimeZone('+tz+');';
    cmd += "(s=>{s&&(s.timezone="+tz+")&&require('Storage').write('setting.json',s);})(require('Storage').readJSON('setting.json',1))\n";
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
},
readStorageFile : (filename) => { // StorageFiles are different to normal storage entries
  return new Promise((resolve,reject) => {
    // Use "\xFF" to signal end of file (can't occur in files anyway)
    var fileContent = "";
    var fileSize = undefined;
    var connection = Puck.getConnection();
    connection.received = "";
    connection.cb = function(d) {
      var finished = false;
      var eofIndex = d.indexOf("\xFF");
      if (eofIndex>=0) {
        finished = true;
        d = d.substr(0,eofIndex);
      }
      fileContent += d;
      if (fileSize === undefined) {
        var newLineIdx = fileContent.indexOf("\n");
        if (newLineIdx>=0) {
          fileSize = parseInt(fileContent.substr(0,newLineIdx));
          console.log("File size is "+fileSize);
          fileContent = fileContent.substr(newLineIdx+1);
        }
      } else {
        Progress.show({percent:100*fileContent.length / (fileSize||1000000)});
      }
      if (finished) {
        Progress.hide();
        connection.received = "";
        connection.cb = undefined;
        resolve(fileContent);
      }
    };
    console.log(`Reading StorageFile ${JSON.stringify(filename)}`);
    connection.write(`\x03\x10(function() {
      var f = require("Storage").open(${JSON.stringify(filename)},"r");
      Bluetooth.println(f.getLength());
      var l = f.readLine();
      while (l!==undefined) { Bluetooth.print(l); l = f.readLine(); }
      Bluetooth.print("\xFF");
    })()\n`,() => {
      Progress.show({title:`Reading ${JSON.stringify(filename)}`,percent:0});
      console.log(`StorageFile read started...`);
    });
  });
}
};
