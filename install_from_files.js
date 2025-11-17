/**
 * Apploader - Install App from selected files
 */
function installFromFiles() {
  return new Promise(resolve => {
    // Ask user to select all files at once (multi-select)
    Espruino.Core.Utils.fileOpenDialog({
        id:"installappfiles",
        type:"arraybuffer",
        multi:true,
        mimeType:"*/*"}, function(fileData, mimeType, fileName) {

      // Collect all files (callback is invoked once per file when multi:true)
      if (!installFromFiles.fileCollection) {
        installFromFiles.fileCollection = {
          files: [],
          count: 0
        };
      }

      // Store this file
      installFromFiles.fileCollection.files.push({
        name: fileName,
        data: fileData,
        mimeType: mimeType
      });
      installFromFiles.fileCollection.count++;

      // Use setTimeout to batch-process after all callbacks complete
      clearTimeout(installFromFiles.processTimeout);
      installFromFiles.processTimeout = setTimeout(function() {
        var files = installFromFiles.fileCollection.files;
        installFromFiles.fileCollection = null; // reset for next use

        if (!files || files.length === 0) return resolve();

        // Find metadata.json
        var metadataFile = files.find(f => f.name === 'metadata.json' || f.name.endsWith('/metadata.json'));

        if (!metadataFile) {
          showToast('No metadata.json found in selected files', 'error');
          return resolve();
        }

        // Parse metadata.json
        var metadata;
        try {
          var metadataText = new TextDecoder().decode(new Uint8Array(metadataFile.data));
          metadata = JSON.parse(metadataText);
        } catch(err) {
          showToast('Failed to parse metadata.json: ' + err, 'error');
          return resolve();
        }

        if (!metadata.id) {
          showToast('metadata.json missing required "id" field', 'error');
          return resolve();
        }

        if (!metadata.storage || !Array.isArray(metadata.storage)) {
          showToast('metadata.json missing or invalid "storage" array', 'error');
          return resolve();
        }

        // Build file map by name (both simple filename and full path)
        var fileMap = {};
        files.forEach(f => {
          var simpleName = f.name.split('/').pop();
          fileMap[simpleName] = f;
          fileMap[f.name] = f;
        });

        // Build app object from metadata
        var app = {
          id: metadata.id,
          name: metadata.name || metadata.id,
          version: metadata.version || "0.0.0",
          type: metadata.type,
          tags: metadata.tags,
          sortorder: metadata.sortorder,
          storage: metadata.storage,
          data: metadata.data || []
        };

        // Determine number of files that will actually be transferred
        var transferCount = app.storage.filter(storageEntry => {
          var url = storageEntry.url || storageEntry.name;
          return fileMap[url];
        }).length;

        // Confirm with user, listing transfer count instead of raw selected file count
        showPrompt("Install App from Files",
          `Install app "${app.name}" (${app.id}) version ${app.version}?\n\nWill transfer ${transferCount} file(s) from metadata.\n\nThis will delete the existing version if installed.`
        ).then(() => {
          Progress.show({title:`Reading files...`});

          var sourceContents = {}; // url -> content
          var missingFiles = [];

          function isTextPath(p){
            return /\.(js|json|txt|md|html|css)$/i.test(p);
          }

          // Process all files referenced in storage
          app.storage.forEach(storageEntry => {
            var url = storageEntry.url || storageEntry.name;
            var file = fileMap[url];

            if (!file) {
              console.warn(`File not found: ${url}`);
              missingFiles.push(url);
              return;
            }

            try {
              var isText = storageEntry.evaluate || isTextPath(url);

              if (isText) {
                // Convert to text
                sourceContents[url] = new TextDecoder().decode(new Uint8Array(file.data));
              } else {
                // Convert ArrayBuffer to binary string
                var a = new Uint8Array(file.data);
                var s = "";
                for (var i=0; i<a.length; i++) s += String.fromCharCode(a[i]);
                sourceContents[url] = s;
              }
            } catch(err) {
              console.error(`Failed to read ${url}:`, err);
              missingFiles.push(url);
            }
          });

          if (missingFiles.length > 0) {
            Progress.hide({sticky:true});
            showToast('Missing or unreadable files: ' + missingFiles.join(', '), 'error');
            return resolve();
          }

          // Build app object with inline contents
          var appForUpload = {
            id: app.id,
            name: app.name,
            version: app.version,
            type: app.type,
            tags: app.tags,
            sortorder: app.sortorder,
            storage: app.storage.map(storageEntry => {
              var url = storageEntry.url || storageEntry.name;
              var content = sourceContents[url];
              if (content === undefined) return null;
              return {
                name: storageEntry.name,
                url: storageEntry.url,
                content: content,
                evaluate: !!storageEntry.evaluate,
                noOverwrite: !!storageEntry.noOverwrite,
                dataFile: !!storageEntry.dataFile,
                supports: storageEntry.supports
              };
            }).filter(Boolean),
            data: app.data || []
          };

          return Promise.resolve(appForUpload)
          .then(appForUpload => {
            // Delete existing app if installed using the same pattern as updateApp
            Progress.hide({sticky:true});
            Progress.show({title:`Checking for existing version...`});
            return Comms.getAppInfo(appForUpload)
              .then(remove => {
                if (!remove) return appForUpload; // not installed
                Progress.hide({sticky:true});
                Progress.show({title:`Removing old version...`});
                // containsFileList:true so we trust the watch's file list
                return Comms.removeApp(remove, {containsFileList:true}).then(() => appForUpload);
              });
          }).then(appForUpload => {
            // Upload using the standard pipeline
            Progress.hide({sticky:true});
            Progress.show({title:`Installing ${appForUpload.name}...`, sticky:true});
            return Comms.uploadApp(appForUpload, {device: device, language: LANGUAGE});
          }).then(() => {
            Progress.hide({sticky:true});
            showToast(`App "${app.name}" installed successfully!`, 'success');
            resolve();
          }).catch(err => {
            Progress.hide({sticky:true});
            showToast('Install failed: ' + err, 'error');
            console.error(err);
            resolve();
          });
        }).catch(err => {
          Progress.hide({sticky:true});
          showToast('Install cancelled or failed: ' + err, 'error');
          console.error(err);
          resolve();
        });
      }, 100); // Small delay to ensure all file callbacks complete
    });
  });
}

// Attach UI handler to the button
window.addEventListener('load', (event) => {
  var btn = document.getElementById("installappfromfiles");
  if (!btn) return;
  btn.addEventListener("click", event => {
    startOperation({name:"Install App from Files"}, () => installFromFiles());
  });
});

