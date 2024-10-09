{
  let storageFile; // file for recording
  let activeRecorders = [];
  let writeSetup; // the interval for writing
  let writeSubSecs; // true if we should write .1s for time, otherwise round to nearest second

  const loadSettings = () => {
    const settings = require("Storage").readJSON("clinikali.json", 1) || {};
    settings.period = settings.period || 10;
    if (!settings.file || !settings.file.startsWith("clinikali.log"))
      settings.recording = false;
    if (!settings.record) settings.record = ["accel", "hrm", "baro"];
    return settings;
  };

  const updateSettings = (settings) => {
    require("Storage").writeJSON("clinikali.json", settings);
    if (WIDGETS.recorder) WIDGETS.recorder.reload();
  };

  const getRecorders = () => {
    const recorders = {
      accel: () => {
        let activity = "";
        function onAccel(h) {
          activity = h.x * h.x + h.y * h.y + h.z * h.z;
        }
        return {
          name: "Accel",
          fields: ["Activity"],
          getValues: () => {
            const r = [activity];
            activity = "";
            return r;
          },
          start: () => {
            Bangle.on("accel", onAccel);
          },
          stop: () => {
            Bangle.removeListener("accel", onAccel);
          },
          draw: (x, y) =>
            g
              .setColor("#00f")
              .drawImage(atob("DAwBAAH4EIHIEIHIEIHIEIEIH4AA"), x, y),
        };
      },
      hrm: () => {
        let bpm = "";
        function onHRM(h) {
          bpm = h.bpm;
        }
        return {
          name: "HR",
          fields: ["Heartrate"],
          getValues: () => {
            const r = [bpm];
            bpm = "";
            return r;
          },
          start: () => {
            Bangle.on("HRM", onHRM);
            Bangle.setHRMPower(1, "recorder");
          },
          stop: () => {
            Bangle.removeListener("HRM", onHRM);
            Bangle.setHRMPower(0, "recorder");
          },
          draw: (x, y) =>
            g
              .setColor(Bangle.isHRMOn() ? "#f00" : "#f88")
              .drawImage(atob("DAwBAAAAMMeef+f+f+P8H4DwBgAA"), x, y),
        };
      },
    };
    if (Bangle.getPressure) {
      recorders.baro = () => {
        let temp = "";
        function onPress(c) {
          temp = c.temperature;
        }
        return {
          name: "Baro",
          fields: ["Barometer Temperature"],
          getValues: () => {
            const r = [temp];
            temp = "";
            return r;
          },
          start: () => {
            Bangle.setBarometerPower(1, "recorder");
            Bangle.on("pressure", onPress);
          },
          stop: () => {
            Bangle.setBarometerPower(0, "recorder");
            Bangle.removeListener("pressure", onPress);
          },
          draw: (x, y) =>
            g
              .setColor("#0f0")
              .drawImage(atob("DAwBAAH4EIHIEIHIEIHIEIEIH4AA"), x, y),
        };
      };
    }

    require("Storage")
      .list(/^.*\.clinikali\.js$/)
      .forEach((fn) => eval(require("Storage").read(fn))(recorders));
    return recorders;
  };

  const getActiveRecorders = (settings) => {
    const activeRecorders = [];
    const recorders = getRecorders();
    settings.record.forEach((r) => {
      const recorder = recorders[r];
      if (!recorder) {
        console.log(`Recorder for ${E.toJS(r)}+not found`);
        return;
      }
      activeRecorders.push(recorder());
    });
    return activeRecorders;
  };
  const getCSVHeaders = (activeRecorders) =>
    ["Time"].concat(activeRecorders.map((r) => r.fields));

  const writeLog = () => {
    WIDGETS.recorder.draw();
    try {
      const fields = [
        writeSubSecs ? getTime().toFixed(1) : Math.round(getTime()),
      ];
      activeRecorders.forEach((recorder) =>
        fields.push.apply(fields, recorder.getValues()),
      );
      if (storageFile) storageFile.write(`${fields.join(",")}\n`);
    } catch (e) {
      console.log("recorder: error", e);
      const settings = loadSettings();
      settings.recording = false;
      require("Storage").write("clinikali.json", settings);
      reload();
    }
  };

  const reload = () => {
    const settings = loadSettings();
    if (typeof writeSetup === "number") clearInterval(writeSetup);
    writeSetup = undefined;

    activeRecorders.forEach((rec) => rec.stop());
    activeRecorders = [];

    if (settings.recording) {
      activeRecorders = getActiveRecorders(settings);
      activeRecorders.forEach((activeRecorder) => {
        activeRecorder.start();
      });
      WIDGETS.recorder.width = 15 + ((activeRecorders.length + 1) >> 1) * 12; // 12px per recorder
      if (require("Storage").list(settings.file).length) {
        storageFile = require("Storage").open(settings.file, "a");
      } else {
        storageFile = require("Storage").open(settings.file, "w");
        storageFile.write(`${getCSVHeaders(activeRecorders).join(",")}\n`);
      }
      WIDGETS.recorder.draw();
      writeSubSecs = settings.period === 1;
      writeSetup = setInterval(
        writeLog,
        settings.period * 1000,
        settings.period,
      );
    } else {
      WIDGETS.recorder.width = 0;
      storageFile = undefined;
    }
  };

  WIDGETS.recorder = {
    area: "tl",
    width: 0,
    draw: function () {
      if (!writeSetup) return;
      g.reset().drawImage(
        atob("DRSBAAGAHgDwAwAAA8B/D/hvx38zzh4w8A+AbgMwGYDMDGBjAA=="),
        this.x + 1,
        this.y + 2,
      );
      activeRecorders.forEach((recorder, i) => {
        recorder.draw(this.x + 15 + (i >> 1) * 12, this.y + (i & 1) * 12);
      });
    },
    getRecorders: getRecorders,
    reload: () => {
      reload();
      Bangle.drawWidgets();
    },
    isRecording: () => !!writeSetup,
    setRecording: (isOn, options) => {
      const settings = loadSettings();
      options = options || {};
      if (isOn && !settings.recording) {
        const date = new Date().toISOString().substr(0, 10).replace(/-/g, "");
        let trackNo = 10;
        function getTrackFilename() {
          return `clinikali.log${date}${trackNo.toString(36)}.csv`;
        }
        if (
          !settings.file ||
          !settings.file.startsWith(`clinikali.log${date}`)
        ) {
          settings.file = getTrackFilename();
        }
        const headers = require("Storage").open(settings.file, "r").readLine();
        if (headers) {
          if (
            headers.trim() !==
            getCSVHeaders(getActiveRecorders(settings)).join(",")
          ) {
            options.force = "new";
          }
          if (!options.force) {
            g.reset();
            return E.showPrompt(
              `Overwrite\nLog ${settings.file.match(/^clinikali\.log(.*)\.csv$/)[1]}?`,
              {
                title: "Recorder",
                buttons: {
                  Yes: "overwrite",
                  No: "cancel",
                  New: "new",
                  Append: "append",
                },
              },
            ).then((selection) => {
              if (selection === "cancel") return false;
              if (selection === "overwrite")
                return WIDGETS.recorder.setRecording(1, { force: "overwrite" });
              if (selection === "new")
                return WIDGETS.recorder.setRecording(1, { force: "new" });
              if (selection === "append")
                return WIDGETS.recorder.setRecording(1, { force: "append" });
              throw new Error("Unknown response!");
            });
          }
          if (options.force === "append") {
            // do nothing, filename is the same - we are good
          } else if (options.force === "overwrite") {
            require("Storage").open(settings.file, "r").erase();
          } else if (options.force === "new") {
            let newFileName;
            do {
              newFileName = getTrackFilename();
              trackNo++;
            } while (require("Storage").list(newFileName).length);
            settings.file = newFileName;
          } else throw new Error(`Unknown options.force, ${options.force}`);
        }
      }
      settings.recording = isOn;
      updateSettings(settings);
      WIDGETS.recorder.reload();
      return Promise.resolve(settings.recording);
    },
  };

  reload();
}
