Bangle.loadWidgets();
Bangle.drawWidgets();

let appSettings;

function loadAppSettings() {
  appSettings = require("Storage").readJSON("clinikali.json", 1) || {};

  let settingsChanged = false;

  if (!appSettings.file) {
    settingsChanged = true;
    appSettings.file = "clinikali.log0.csv";
  }

  if (settingsChanged) {
    require("Storage").writeJSON("clinikali.json", appSettings);
  }
}

loadAppSettings();

function updateAppSettings() {
  require("Storage").writeJSON("clinikali.json", appSettings);

  if (WIDGETS.recorder) {
    WIDGETS.recorder.reload();
  }
}

function extractTrackNumber(filename) {
  const matches = filename.match(/^clinikali\.log(.*)\.csv$/);

  if (matches) {
    return matches[1];
  }

  return 0;
}

function showMainMenu() {
  const mainMenu = {
    "": { title: "Recorder" },
    "< Back": () => {
      load();
    },
    RECORD: {
      value: !!appSettings.recording,
      onchange: (newValue) => {
        setTimeout(() => {
          E.showMenu();

          WIDGETS.recorder.setRecording(newValue).then(() => {
            loadAppSettings();
            showMainMenu();
          });
        }, 1);
      },
    },
    File: { value: extractTrackNumber(appSettings.file) },
    "View Tracks": () => {
      viewTracks();
    },
    "Time Period": {
      value: appSettings.period || 10,
      min: 1,
      max: 120,
      step: 1,
      format: (value) => `${value}s`,
      onchange: (newValue) => {
        appSettings.recording = false; // stop recording if we change anything
        appSettings.period = newValue;
        updateAppSettings();
      },
    },
  };

  return E.showMenu(mainMenu);
}

function viewTracks() {
  const trackMenu = {
    "": { title: "Tracks" },
  };

  let tracksFound = false;

  require("Storage")
    .list(/^clinikali\.log.*\.csv$/, { sf: true })
    .reverse()
    .forEach((filename) => {
      tracksFound = true;
      trackMenu[extractTrackNumber(filename)] = () =>
        viewTrack(filename, false);
    });

  if (!tracksFound) {
    trackMenu["No Tracks found"] = () => {};
  }

  trackMenu["< Back"] = () => {
    showMainMenu();
  };

  return E.showMenu(trackMenu);
}

function viewTrack(filename) {
  const trackMenu = {
    "": { title: `Track ${extractTrackNumber(filename)}` },
  };

  trackMenu["Send via BT"] = () => {
    E.showMessage("Preparing...", "Bluetooth");

    // Set up Nordic UART Service
    NRF.setServices(
      {
        "6e400001-b5a3-f393-e0a9-e50e24dcca9e": {
          "6e400002-b5a3-f393-e0a9-e50e24dcca9e": {
            write: function (value) {
              // This function will be called when data is received
              console.log("Received from phone: " + E.toString(value));
            },
          },
          "6e400003-b5a3-f393-e0a9-e50e24dcca9e": {
            notify: true,
          },
        },
      },
      { advertise: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] },
    );

    // Start advertising
    NRF.setAdvertising({}, { name: "Bangle.js Recorder" });

    function sendFile() {
      E.showMessage("Sending...", "Bluetooth");
      let file = require("Storage").open(filename, "r");
      let line;
      let characteristic = NRF.getCharacteristic(
        "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
        "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
      );

      function sendNextChunk() {
        line = file.readLine();
        if (line !== undefined) {
          characteristic
            .notify(line + "\n")
            .then(() => {
              setTimeout(sendNextChunk, 50); // Add a small delay between chunks
            })
            .catch((err) => {
              E.showAlert("Send Failed: " + err).then(() => {
                viewTrack(filename);
              });
            });
        } else {
          E.showAlert("File Sent").then(() => {
            viewTrack(filename);
          });
        }
      }

      sendNextChunk();
    }

    // Wait for connection
    NRF.on("connect", function () {
      E.showMessage("Connected", "Bluetooth");
      setTimeout(sendFile, 1000); // Wait a bit before sending
    });

    // Show message to connect
    E.showAlert("Connect to\nBangle.js Recorder\non your device").then(() => {
      // If user cancels, stop advertising
      NRF.setAdvertising({});
      viewTrack(filename);
    });
  };

  trackMenu.Erase = () => {
    E.showPrompt("Delete Track?").then((shouldDelete) => {
      if (shouldDelete) {
        appSettings.recording = false;
        updateAppSettings();
        const fileToErase = require("Storage").open(filename, "r");
        fileToErase.erase();
        viewTracks();
      } else {
        viewTrack(filename);
      }
    });
  };

  trackMenu["< Back"] = () => {
    viewTracks();
  };

  return E.showMenu(trackMenu);
}

showMainMenu();
