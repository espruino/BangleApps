Bangle.loadWidgets();
Bangle.drawWidgets();

Bangle.setHRMPower(1);
Bangle.on("accel", () => {});

let settings;

function loadSettings() {
  settings = require("Storage").readJSON("clinikali.json", 1) ?? {};

  let changed = false;

  if (!settings.file) {
    changed = true;
    settings.file = "clinikali.log0.csv";
  }

  if (changed) {
    require("Storage").write("clinikali.json", settings);
  }
}

loadSettings();

function updateSettings() {
  require("Storage").write("clinikali.json", settings);

  if (WIDGETS.recorder) {
    WIDGETS.recorder.reload();
  }
}

function getFileNumber(filename) {
  const matches = filename.match(/^clinikali\.log(.*)\.csv$/);

  return matches ? matches[1] : 0;
}

function showMainMenu() {
  const mainMenu = {
    "": { "title": "Clinikali" },
    "< Back": () => { load(); },
    "Record": {
      value: !!settings.recording,
      onchange: (v) => {
        setTimeout(() => {
          E.showMenu();
          WIDGETS.recorder.setRecording(v).then(() => {
            loadSettings();
            showMainMenu();
          });
        }, 1);
      }
    },
    "File": {
      value: getFileNumber(settings.file),
    },
    "View Files": () => { viewFiles(); },
  }

  return E.showMenu(mainMenu);
}

function viewFiles() {
  const menu = {
    "": { "title": "Files" },
  };

  let found = false;

  require("Storage").list(/^clinikali\.log.*\.csv$/, { sf: true }).reverse().forEach((file) => {
    found = true;
    menu[getFileNumber(file)] = () => viewFile(file, false);
  });

  if (!found) {
    menu["No files found"] = () => {};
  }

  menu["< Back"] = () => { showMainMenu(); };

  return E.showMenu(menu);
}

function viewFile(filename, info) {
  if (!info) {
    E.showMessage("Loading...", `File ${getFileNumber(filename)}`);
    info = getFileInfo(filename);
  }

  const menu = {
    "": { "title": `File ${info.fn}` },
  };

  if (info.time) {
    menu[info.time.toISOString().substr(0, 16).replace("T", " ")] = {};
  }

  menu["Duration"] = { value: asTime(info.duration) };
  menu["Records"] = { value: info.records };
  menu["Erase"] = () => {
    E.showPrompt("Delete file?").then((v) => {
      if (v) {
        settings.recording = false;
        updateSettings();

        const f = require("Storage").open(filename, "r");
        f.erase();

        viewFiles();
      } else {
        viewFile(filename, info);
      }
    });
  };
  menu["< Back"] = () => { viewFiles(); };

  return E.showMenu(menu);
}

function asTime(v) {
  const mins = Math.floor(v/60);
  const secs = v - mins * 60;

  return `${mins.toString()}m ${secs.toString()}s`;
}

function getFileInfo(filename) {
  "ram";

  let startTime, duration = 0;
  let f = require("Storage").open(filename, "r");

  if (f === undefined) {
    return;
  }

  let l = f.readLine(f);
  let fields, timeIdx;
  let nl = 0, c;

  if (l !== undefined) {
    fields = l.trim().split(",");
    timeIdx = fields.indexOf("time");
    l = f.readLine(f);
  }

  if (l !== undefined) {
    c = l.split(",");
    startTime = parseInt(c[timeIdx]);
  }

  while (l !== undefined) {
    ++nl;
    c = l.split(",");
    l = f.readLine(f);
  }

  if (c) {
    duration = parseInt(c[timeIdx]) - startTime;
  }

  return {
    fn: getFileNumber(filename),
    fields,
    filename,
    time: startTime ? new Date(startTime * 1000) : undefined,
    records: nl,
    duration: Math.round(duration),
  };
}
