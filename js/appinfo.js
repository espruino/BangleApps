function toJS(txt) {
  return JSON.stringify(txt);
}

var AppInfo = {
  getFiles : (app,fileGetter) => {
    return new Promise((resolve,reject) => {
      // Load all files
      Promise.all(app.storage.map(storageFile => {
        if (storageFile.content)
          return Promise.resolve(storageFile);
        else if (storageFile.url)
          return fileGetter(`apps/${app.id}/${storageFile.url}`).then(content => {
            return {
              name : storageFile.name,
              content : content,
              evaluate : storageFile.evaluate
          }});
        else return Promise.resolve();
      })).then(fileContents => { // now we just have a list of files + contents...
        // filter out empty files
        fileContents = fileContents.filter(x=>x!==undefined);
        // What about minification?
        // Add app's info JSON
        return AppInfo.createAppJSON(app, fileContents);
      }).then(fileContents => {
        // then map each file to a command to load into storage
        fileContents.forEach(storageFile => {
          // format ready for Espruino
          if (storageFile.evaluate) {
            let js = storageFile.content.trim();
            if (js.endsWith(";"))
              js = js.slice(0,-1);
            storageFile.cmd = `\x10require('Storage').write(${toJS(storageFile.name)},${js});`;
          } else {
            let code = storageFile.content;
            // write code in chunks, in case it is too big to fit in RAM (fix #157)
            var CHUNKSIZE = 4096;
            storageFile.cmd = `\x10require('Storage').write(${toJS(storageFile.name)},${toJS(code.substr(0,CHUNKSIZE))},0,${code.length});`;
            for (var i=CHUNKSIZE;i<code.length;i+=CHUNKSIZE)
               storageFile.cmd += `\n\x10require('Storage').write(${toJS(storageFile.name)},${toJS(code.substr(i,CHUNKSIZE))},${i});`;
          }
        });
        resolve(fileContents);
      }).catch(err => reject(err));
    });
  },
  createAppJSON : (app, fileContents) => {
    return new Promise((resolve,reject) => {
      var appJSONName = app.id+".info";
      // Check we don't already have a JSON file!
      var appJSONFile = fileContents.find(f=>f.name==appJSONName);
      if (appJSONFile) reject("App JSON file explicitly specified!");
      // Now actually create the app JSON
      var json = {
        id : app.id
      };
      if (app.shortName) json.name = app.shortName;
      else json.name = app.name;
      if (app.type && app.type!="app") json.type = app.type;
      if (fileContents.find(f=>f.name==app.id+".app.js"))
        json.src = app.id+".app.js";
      if (fileContents.find(f=>f.name==app.id+".settings.js"))
        json.settings = app.id+".settings.js";
      if (fileContents.find(f=>f.name==app.id+".img"))
        json.icon = app.id+".img";
      if (app.sortorder) json.sortorder = app.sortorder;
      if (app.version) json.version = app.version;
      var fileList = fileContents.map(storageFile=>storageFile.name);
      fileList.unshift(appJSONName); // do we want this? makes life easier!
      json.files = fileList.join(",");
      fileContents.push({
        name : appJSONName,
        content : JSON.stringify(json)
      });
      resolve(fileContents);
    });
  }
};

if ("undefined"!=typeof module)
  module.exports = AppInfo;
