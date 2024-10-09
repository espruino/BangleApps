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

function getTrackInfo(filename) {
  "ram";
  let startTime;
  let endTime;
  let recordCount = 0;

  const fileHandle = require("Storage").open(filename, "r");

  if (fileHandle === undefined) {
    return;
  }

  let line = fileHandle.readLine();
  let timeIndex;

  if (line !== undefined) {
    const fields = line.trim().split(",");

    timeIndex = fields.indexOf("Time");
    line = fileHandle.readLine();
  }

  if (line !== undefined) {
    let columns = line.split(",");

    startTime = Number.parseInt(columns[timeIndex]);
    recordCount++;

    // Read through the file to get the last time and count records
    while ((line = fileHandle.readLine()) !== undefined) {
      columns = line.split(",");
      endTime = Number.parseInt(columns[timeIndex]);
      recordCount++;
    }
  }

  const duration = endTime ? endTime - startTime : 0;

  return {
    trackNumber: extractTrackNumber(filename),
    filename: filename,
    time: new Date(startTime * 1000),
    duration: Math.round(duration),
    records: recordCount,
  };
}

function formatDuration(durationInSeconds) {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds - minutes * 60;

  return `${minutes.toString()}m ${seconds.toString()}s`;
}

function viewTrack(filename, trackInfo) {
  if (!trackInfo) {
    E.showMessage("Loading...", `Track ${extractTrackNumber(filename)}`);
    trackInfo = getTrackInfo(filename);
  }

  const trackMenu = {
    "": { title: `Track ${trackInfo.trackNumber}` },
  };

  if (trackInfo.time) {
    trackMenu[trackInfo.time.toISOString().substr(0, 16).replace("T", " ")] =
      {};
  }

  if (trackInfo.duration !== undefined) {
    trackMenu.Duration = { value: formatDuration(trackInfo.duration) };
  }

  if (trackInfo.records !== undefined) {
    trackMenu.Records = { value: trackInfo.records.toString() };
  }

  trackMenu.Erase = () => {
    E.showPrompt("Delete Track?").then((shouldDelete) => {
      if (shouldDelete) {
        appSettings.recording = false;
        updateAppSettings();
        const fileToErase = require("Storage").open(filename, "r");
        fileToErase.erase();
        viewTracks();
      } else {
        viewTrack(filename, trackInfo);
      }
    });
  };

  trackMenu["< Back"] = () => {
    viewTracks();
  };

  return E.showMenu(trackMenu);
}

showMainMenu();
