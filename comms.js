Puck.debug=3;

/* 'app' is of the form:
{ name: "T-Rex",
  icon: "trex.png",
  description: "T-Rex game in the style of Chrome's offline game",
  storage: [
    {name:"+trex",file:"trex.json"},
    {name:"-trex",file:"trex.js"},
    {name:"*trex",file:"trex-icon.js"}
  ]
}
*/

// FIXME: use UART lib so that we handle errors properly
var Comms = {
uploadApp : app => {
  return new Promise((resolve,reject) => {
    // Load all files
    Promise.all(app.storage.map(storageFile => {
      if (storageFile.content)
        return Promise.resolve(storageFile);
      else if (storageFile.url)
        return httpGet("apps/"+storageFile.url).then(content => {
          return {
            name : storageFile.name,
            content : content,
            evaluate : storageFile.evaluate
        }});
      else return Promise.resolve();
    })).then(fileContents => { // now we just have a list of files + contents...
      // filter out empty files
      fileContents = fileContents.filter(x=>x!==undefined);
      // then map each file to a command to load into storage
      fileContents.forEach(storageFile => {
        // check if this is the JSON file
        if (storageFile.name[0]=="+") {
          storageFile.evaluate = true;
          var json = {};
          try {
            json = JSON.parse(storageFile.content);
          } catch (e) {
            reject(storageFile.name+" is not valid JSON");
          }
          json.files = fileContents.map(storageFile=>storageFile.name).join(",");
          storageFile.content = JSON.stringify(json);
        }
        // format ready for Espruino
        var js = storageFile.evaluate ? storageFile.content.trim() : toJS(storageFile.content);
        storageFile.cmd = `\x10require('Storage').write(${toJS(storageFile.name)},${js});`;
      });

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
    Puck.write("\x03"+cmds+"\x10load()\n",(result) => {
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
