Bangle.loadWidgets();
Bangle.drawWidgets();

// Enable Bluetooth Low Energy
NRF.wake();

// Request pairing
NRF.security = { passkey: "123456", mitm: 1, display: 1 };

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

function extractFileNumber(filename) {
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
    File: { value: extractFileNumber(appSettings.file) },
    "View Files": () => {
      viewFiles();
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

function viewFile(filename) {
  const trackMenu = {
    "": { title: `File ${extractFileNumber(filename)}` },
    "Send Data": () => {
      E.showMessage("Preparing to send...");

      // Function to send data via Bluetooth
      function sendFileData() {
        let file = require("Storage").read(filename);
        if (!file) {
          E.showMessage("File not found!");
          setTimeout(viewTrack, 2000, filename);
          return;
        }

        const lines = file.split("\n");
        E.showMessage("Sending data...");

        // Send data line by line with markers
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim()) {
            // Only send non-empty lines
            Bluetooth.println("<data>");
            Bluetooth.println(lines[i]);
            Bluetooth.println("</data>");
          }
        }

        // Send end marker
        Bluetooth.println("<end>");

        E.showMessage("Data sent!");
        setTimeout(viewTrack, 2000, filename);
      }

      // Start sending data
      sendFileData();
    },
    Delete: () => {
      E.showPrompt("Delete File?").then((shouldDelete) => {
        if (shouldDelete) {
          require("Storage").erase(filename);
          viewFiles();
        } else {
          viewTrack(filename);
        }
      });
    },
    "< Back": () => {
      viewFiles();
    },
  };

  return E.showMenu(trackMenu);
}

function viewFiles() {
  const fileMenu = {
    "": { title: "Files" },
  };

  let filesFound = false;

  require("Storage")
    .list(/^clinikali\.log.*\.csv$/, { sf: true })
    .reverse()
    .forEach((filename) => {
      filesFound = true;
      fileMenu[extractFileNumber(filename)] = () => viewFile(filename);
    });

  if (!filesFound) {
    fileMenu["No Files found"] = () => {};
  }

  fileMenu["< Back"] = () => {
    showMainMenu();
  };

  return E.showMenu(fileMenu);
}

showMainMenu();
