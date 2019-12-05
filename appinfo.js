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
            if (app.version) json.version = app.version;
            json.files = fileContents.map(storageFile=>storageFile.name).join(",");
            storageFile.content = JSON.stringify(json);
          }
          // format ready for Espruino
          var js;
          if (storageFile.evaluate) {
            js = storageFile.content.trim();
            if (js.endsWith(";"))
              js = js.slice(0,-1);
          } else
            js = toJS(storageFile.content);
          storageFile.cmd = `\x10require('Storage').write(${toJS(storageFile.name)},${js});`;
        });
        resolve(fileContents);
      }).catch(err => reject(err));
    });
  },
};

if ("undefined"!=typeof module)
  module.exports = AppInfo;
