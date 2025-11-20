/**
 * Apploader - Install App from selected files
 * 
 * This function allows users to install BangleJS apps by selecting files from their local filesystem.
 * It reads metadata.json and uploads all referenced files to the watch.
 */
function installFromFiles() {
  return new Promise(resolve => {
    var MAX_WAIT_MS = 5000; // maximum time to wait for metadata.json
    var RESCHEDULE_MS = 400; // retry interval while waiting
    
    // SOURCE: core/lib/espruinotools.js fileOpenDialog
    // Request multi-file selection from user
    Espruino.Core.Utils.fileOpenDialog({
        id:"installappfiles",
        type:"arraybuffer",
        multi:true,
        mimeType:"*/*"}, function(fileData, mimeType, fileName) {

      // Collect all files (callback is invoked once per file when multi:true)
      if (!installFromFiles.fileCollection) {
        installFromFiles.fileCollection = {
          files: [],
          count: 0,
          firstTs: Date.now() // Track when first file arrived for timeout
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
      
      // ANDROID FIX: Debounce and reschedule until metadata.json appears or timeout
      // Standard desktop browsers deliver all files quickly; Android can have 100-500ms gaps
      installFromFiles.processTimeout = setTimeout(function processSelection() {
        var fc = installFromFiles.fileCollection;
        var files = fc ? fc.files : null;
        
        if (!files || files.length === 0) {
          // nothing yet; keep waiting until max wait then resolve silently
          if (fc && (Date.now() - fc.firstTs) < MAX_WAIT_MS) {
            installFromFiles.processTimeout = setTimeout(processSelection, RESCHEDULE_MS);
            return;
          }
          installFromFiles.fileCollection = null; // reset
          return resolve();
        }

        // Find metadata.json
        var metadataFile = files.find(f => f.name === 'metadata.json' || f.name.endsWith('/metadata.json'));

        if (!metadataFile) {
          if (fc && (Date.now() - fc.firstTs) < MAX_WAIT_MS) {
            // Keep waiting for the rest of the files
            installFromFiles.processTimeout = setTimeout(processSelection, RESCHEDULE_MS);
            return;
          }
          // Timed out waiting for metadata.json
          installFromFiles.fileCollection = null; // reset
          showToast('No metadata.json found in selected files', 'error');
          return resolve();
        }

        // We have metadata.json; stop collecting and proceed
        installFromFiles.fileCollection = null; // reset for next use

        // Parse metadata.json
        var metadata;
        try {
          var metadataText = new TextDecoder().decode(new Uint8Array(metadataFile.data));
          metadata = JSON.parse(metadataText);
        } catch(err) {
          showToast('Failed to parse metadata.json: ' + err, 'error');
          return resolve();
        }

        // Validate required fields per README.md
        if (!metadata.id) {
          showToast('metadata.json missing required "id" field', 'error');
          return resolve();
        }

        if (!metadata.storage || !Array.isArray(metadata.storage)) {
          showToast('metadata.json missing or invalid "storage" array', 'error');
          return resolve();
        }

        // SOURCE: core/js/appinfo.js getFiles() - build file map for lookup
        // Build file map by name (both simple filename and full path)
        // This handles both "app.js" selections and "folder/app.js" selections
        var fileMap = {};
        files.forEach(f => {
          var simpleName = f.name.split('/').pop();
          fileMap[simpleName] = f;
          fileMap[f.name] = f;
        });

        // SOURCE: core/js/appinfo.js createAppJSON() - build app object from metadata
        // Build app object from metadata
        var app = {
          id: metadata.id,
          name: metadata.name || metadata.id,
          version: metadata.version || "0.0.0",
          type: metadata.type,
          tags: metadata.tags,
          sortorder: metadata.sortorder,
          storage: metadata.storage,
          data: metadata.data || [] // NOTE: data[] files are NOT uploaded unless they have url/content
        };

        // SOURCE: core/js/appinfo.js getFiles() - filter by device support
        // Filter storage files by device compatibility (supports[] field)
        if (app.storage.some(file => file.supports)) {
          if (!device || !device.id) {
            showToast('App requires device-specific files, but no device connected', 'error');
            return resolve();
          }
          // Only keep files that either have no 'supports' field or that support this device
          app.storage = app.storage.filter(file => {
            if (!file.supports) return true;
            return file.supports.includes(device.id);
          });
        }

        // Determine number of storage files that will actually be transferred
        var storageTransferCount = app.storage.filter(storageEntry => {
          var url = storageEntry.url || storageEntry.name;
          return fileMap[url];
        }).length;

        // Determine number of data files expected to be transferred (url/content present, not wildcard)
        var dataTransferCount = 0;
        if (app.data && Array.isArray(app.data)) {
          app.data.forEach(dataEntry => {
            if (dataEntry.wildcard) return; // pattern only
            if (!dataEntry.url && !dataEntry.content) return; // no source specified
            var url = dataEntry.url || dataEntry.name;
            if (dataEntry.content || fileMap[url]) dataTransferCount++;
          });
        }

        // Build breakdown string (omit data if zero)
        var breakdown = `${storageTransferCount} storage file(s)` + (dataTransferCount>0 ? ` and ${dataTransferCount} data file(s)` : "");

        showPrompt("Install App from Files",
          `Install app "${app.name}" (${app.id}) version ${app.version}?\n\nWill transfer ${breakdown} from metadata.\n\nThis will delete the existing version if installed.`
        ).then(() => {
          Progress.show({title:`Reading files...`});

          var sourceContents = {}; // url -> content
          var missingFiles = [];

          // SOURCE: core/js/appinfo.js parseJS() - detect text files by extension
          function isTextPath(p){
            return /\.(js|json|txt|md|html|css)$/i.test(p);
          }

          // SOURCE: core/js/appinfo.js getFiles() - process all files referenced in storage
          // Process all files referenced in storage
          // NOTE: We do NOT process data[] files here unless they have url/content specified
          app.storage.forEach(storageEntry => {
            var url = storageEntry.url || storageEntry.name;
            var file = fileMap[url];

            if (!file) {
              console.warn(`File not found: ${url}`);
              missingFiles.push(url);
              return;
            }

            try {
              // EVALUATE FILES: If evaluate:true, file contains JS expression to evaluate on device
              // Common use: app-icon.js with heatshrink-compressed image data
              // Pattern from core/js/appinfo.js getFiles() and README.md
              var isText = storageEntry.evaluate || isTextPath(url);

              if (isText) {
                // Convert to text
                sourceContents[url] = new TextDecoder().decode(new Uint8Array(file.data));
              } else {
                // SOURCE: core/js/appinfo.js asJSExpr() - convert ArrayBuffer to binary string
                // Convert ArrayBuffer to binary string (for images, etc.)
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

          // SOURCE: README.md metadata.json - handle data[] files with url/content
          // Process data[] files that have url or content specified (initial data files to upload)
          if (app.data && Array.isArray(app.data)) {
            app.data.forEach(dataEntry => {
              // Skip entries that are just tracking patterns (wildcard, or name-only without url/content)
              if (dataEntry.wildcard) return;
              if (!dataEntry.url && !dataEntry.content) return;
              
              var url = dataEntry.url || dataEntry.name;
              var file = fileMap[url];
              
              if (!file && !dataEntry.content) {
                console.warn(`Data file not found: ${url}`);
                // Don't add to missingFiles - data files are optional
                return;
              }
              
              if (file) {
                try {
                  var isText = dataEntry.evaluate || isTextPath(url);
                  if (isText) {
                    sourceContents[url] = new TextDecoder().decode(new Uint8Array(file.data));
                  } else {
                    var a = new Uint8Array(file.data);
                    var s = "";
                    for (var i=0; i<a.length; i++) s += String.fromCharCode(a[i]);
                    sourceContents[url] = s;
                  }
                } catch(err) {
                  console.error(`Failed to read data file ${url}:`, err);
                }
              }
            });
          }

          if (missingFiles.length > 0) {
            Progress.hide({sticky:true});
            showToast('Missing or unreadable files: ' + missingFiles.join(', '), 'error');
            return resolve();
          }

          // SOURCE: core/js/appinfo.js createAppJSON() - build app object with inline contents
          // Build app object with inline contents for upload
          // This matches the structure expected by Comms.uploadApp
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
                evaluate: !!storageEntry.evaluate,      // JS expression to eval on device
                noOverwrite: !!storageEntry.noOverwrite, // Don't overwrite if exists (checked below)
                dataFile: !!storageEntry.dataFile,      // File written by app (not uploaded)
                supports: storageEntry.supports         // Device compatibility (already filtered above)
              };
            }).filter(Boolean),
            data: app.data || [] // Files app writes - tracked for uninstall, optionally uploaded if url/content provided
          };
          
          // Add data[] files with content to storage for upload
          if (app.data && Array.isArray(app.data)) {
            app.data.forEach(dataEntry => {
              // Only add if we have content and it's meant to be uploaded initially
              if (!dataEntry.url && !dataEntry.content) return;
              if (dataEntry.wildcard) return;
              
              var url = dataEntry.url || dataEntry.name;
              var content = dataEntry.content || sourceContents[url];
              if (content === undefined) return;
              
              appForUpload.storage.push({
                name: dataEntry.name,
                url: dataEntry.url,
                content: content,
                evaluate: !!dataEntry.evaluate,
                noOverwrite: true, // Data files should not overwrite by default
                dataFile: true,
                storageFile: !!dataEntry.storageFile
              });
            });
          }

          // SOURCE: core/js/index.js updateApp() lines 963-978
          // Check for noOverwrite files that exist on device
          var noOverwriteChecks = Promise.resolve();
          var filesToCheck = appForUpload.storage.filter(f => f.noOverwrite);
          
          if (filesToCheck.length > 0) {
            Progress.hide({sticky:true});
            Progress.show({title:`Checking existing files...`});
            
            // Build a single command to check all noOverwrite files at once
            var checkCmd = filesToCheck.map(f => 
              `require('Storage').read(${JSON.stringify(f.name)})!==undefined`
            ).join(',');
            
            noOverwriteChecks = new Promise((resolveCheck, rejectCheck) => {
              Comms.eval(`[${checkCmd}]`, (result, err) => {
                if (err) {
                  console.warn('Error checking noOverwrite files:', err);
                  resolveCheck(); // Continue anyway
                  return;
                }
                try {
                  var existsArray = result;
                  // Remove files that already exist from the upload list
                  filesToCheck.forEach((file, idx) => {
                    if (existsArray[idx]) {
                      console.log(`Skipping ${file.name} (noOverwrite and already exists)`);
                      var fileIdx = appForUpload.storage.indexOf(file);
                      if (fileIdx !== -1) {
                        appForUpload.storage.splice(fileIdx, 1);
                      }
                    }
                  });
                  resolveCheck();
                } catch(e) {
                  console.warn('Error parsing noOverwrite check results:', e);
                  resolveCheck(); // Continue anyway
                }
              });
            });
          }
          
          // SOURCE: core/js/index.js updateApp() lines 963-978
          // Delete existing app if installed using the same pattern as updateApp
          return noOverwriteChecks.then(appForUpload => {
            // SOURCE: core/js/index.js updateApp() line 963
            // Check if app is already installed
            Progress.hide({sticky:true});
            Progress.show({title:`Checking for existing version...`});
            return Comms.getAppInfo(appForUpload)
              .then(remove => {
                if (!remove) return appForUpload; // not installed
                Progress.hide({sticky:true});
                Progress.show({title:`Removing old version...`});
                // SOURCE: core/js/index.js updateApp() line 978
                // containsFileList:true tells removeApp to trust the watch's file list
                // This matches the updateApp pattern exactly
                return Comms.removeApp(remove, {containsFileList:true}).then(() => appForUpload);
              });
          }).then(appForUpload => {
            // SOURCE: core/js/index.js uploadApp() line 840 and updateApp() line 983
            // Upload using the standard pipeline
            Progress.hide({sticky:true});
            Progress.show({title:`Installing ${appForUpload.name}...`, sticky:true});
            // Pass device and language options like uploadApp/updateApp do
            // NOTE: Comms.uploadApp handles:
            //   - Creating .info file via AppInfo.createAppJSON
            //   - Minification/pretokenisation via AppInfo.parseJS if settings.minify=true
            //   - Module resolution
            //   - Language translation
            //   - File upload commands
            //   - Progress updates
            //   - Final success message via showUploadFinished()
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
      }, 1200); // Debounce to gather all files (Android-friendly)
    });
  });
}

// Attach UI handler to the button on window load
window.addEventListener('load', (event) => {
  var btn = document.getElementById("installappfromfiles");
  if (!btn) return;
  btn.addEventListener("click", event => {
    // SOURCE: core/js/index.js uploadApp/updateApp pattern
    // Wrap in startOperation for consistent UI feedback
    startOperation({name:"Install App from Files"}, () => installFromFiles());
  });
});