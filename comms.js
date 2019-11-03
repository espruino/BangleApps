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
    Promise.all(app.storage.map(storageFile => httpGet("apps/"+storageFile.file)
      // map each file to a command to load into storage
      .then(contents=>`\x10require('Storage').write(${toJS(storageFile.name)},${storageFile.evaluate ? contents : toJS(contents)});`)))
    .then(function(fileContents) {
      fileContents = fileContents.join("\n");
      console.log("uploadApp",fileContents);
      // reset to ensure we have enough memory to upload what we need to
      Puck.write("\x03reset();\n", function() {
        setTimeout(function() { // wait for reset
          Puck.write(fileContents,function() {
            resolve();
          });
        },500);
      });
    });
  });
},
getInstalledApps : () => {
  return new Promise((resolve,reject) => {
    Puck.write("\x03",() => {
      Puck.eval('require("Storage").list().filter(f=>f[0]=="+").map(f=>f.substr(1))', appList => {
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
    Puck.write("\x03"+cmds,() => {
      resolve();
    });
  });
}
};
