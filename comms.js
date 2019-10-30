Puck.debug=3;

var Comms = {
uploadApp : app => {
  /* eg
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
  return new Promise((resolve,reject) => {
    // Load all files
    Promise.all(app.storage.map(storageFile => httpGet("apps/"+storageFile.file)
      // map each file to a command to load into storage
      .then(contents=>`require('Storage').write(${toJS(storageFile.name)},${toJS(contents)});`)))
    //
    .then(function(fileContents) {
      fileContents = fileContents.join("\n");
      Puck.write(fileContents,function() {
        resolve();
      });
    });
  });
},
getInstalledApps : () => {
  return new Promise((resolve,reject) => {
    Puck.write("\x03",() => {
      Puck.eval('require("Storage").list().filter(f=>f[0]=="+").map(f=>f.substr(1))', appList => {
        resolve(appList);
      });
    });
  });
}
};
