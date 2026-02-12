/**
 * Apploader - Install App from selected files
 * 
 * This function allows users to install BangleJS apps by selecting files from their local filesystem.
 * It reads metadata.json and uploads all referenced files to the watch using the standard upload pipeline.
 */
function installFromFiles() {
  return new Promise(resolve => {
    
    // Request multi-file selection from user
    Espruino.Core.Utils.fileOpenDialog({
      id:"installappfiles",
      type:"arraybuffer",
      multi:true,
      mimeType:"*/*",
      onComplete: function(files) {
        try {
          if (!files) return resolve(); // user cancelled
          const mapped = files.map(function(f) {
            return { name: f.fileName, data: f.contents };
          });
          processFiles(mapped, resolve);
        } catch (err) {
          showToast('Install failed: ' + err, 'error');
          console.error(err);
          resolve();
        }
      }
    });
  });
}

function processFiles(files, resolve) {
  if (!files || files.length === 0) {
    return resolve();
  }

  const metadataFile = files.find(f => f.name === 'metadata.json' || f.name.endsWith('/metadata.json'));

  if (!metadataFile) {
    showToast('No metadata.json found in selected files', 'error');
    return resolve();
  }

  // Parse metadata.json
  let app;
  try {
    const metadataText = new TextDecoder().decode(new Uint8Array(metadataFile.data));
    app = JSON.parse(metadataText);
  } catch(err) {
    showToast('Failed to parse metadata.json: ' + err, 'error');
    return resolve();
  }

  if (!app.id || !app.storage || !Array.isArray(app.storage)) {
    showToast('Invalid metadata.json', 'error');
    return resolve();
  }

  // Build file map for lookup (both simple filename and full path)
  const fileMap = {};
  files.forEach(f => {
    const simpleName = f.name.split('/').pop();
    fileMap[simpleName] = f;
    fileMap[f.name] = f;
  });

  // Populate content directly into storage entries so AppInfo.getFiles doesn't fetch URLs
  app.storage.forEach(storageEntry => {
    const fileName = storageEntry.url || storageEntry.name;
    const file = fileMap[fileName];
    if (file) {
      const data = new Uint8Array(file.data);
      let content = "";
      for (let i = 0; i < data.length; i++) {
        content += String.fromCharCode(data[i]);
      }
      storageEntry.content = content;
    }
  });

  // Populate content into data entries as well
  if (app.data && Array.isArray(app.data)) {
    app.data.forEach(dataEntry => {
      if (dataEntry.content) return; // already has inline content
      const fileName = dataEntry.url || dataEntry.name;
      const file = fileMap[fileName];
      if (file) {
        const data = new Uint8Array(file.data);
        let content = "";
        for (let i = 0; i < data.length; i++) {
          content += String.fromCharCode(data[i]);
        }
        dataEntry.content = content;
      }
    });
  }

  showPrompt("Install App from Files",
    `Install "${app.name}" (${app.id}) v${app.version}?\n\nThis will delete the existing version if installed.`
  ).then(() => {
    // Use standard updateApp flow (remove old, check deps, upload new)
    return getInstalledApps().then(() => {
      const isInstalled = device.appsInstalled.some(i => i.id === app.id);
      
      // If installed, use update flow; otherwise use install flow
      const uploadPromise = isInstalled 
        ? Comms.getAppInfo(app).then(remove => {
            return Comms.removeApp(remove, {containsFileList:true});
          }).then(() => {
            device.appsInstalled = device.appsInstalled.filter(a => a.id != app.id);
            return checkDependencies(app, {checkForClashes:false});
          })
        : checkDependencies(app);
      
      return uploadPromise.then(() => {
        return Comms.uploadApp(app, {
          device: device,
          language: LANGUAGE
        });
      }).then((appJSON) => {
        if (appJSON) device.appsInstalled.push(appJSON);
        showToast(`"${app.name}" installed!`, 'success');
        refreshMyApps();
        refreshLibrary();
      });
    });
  }).then(resolve).catch(err => {
    showToast('Install failed: ' + err, 'error');
    console.error(err);
    resolve();
  });
}

// Attach UI handler to the button on window load
window.addEventListener('load', (event) => {
  const btn = document.getElementById("installappfromfiles");
  if (!btn) return;
  btn.addEventListener("click", () => {
    startOperation({name:"Install App from Files"}, installFromFiles);
  });
});