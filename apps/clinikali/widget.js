{
  let storageFile; // file for recording
  let activeRecorders = [];
  let writeSetup; // the interval for writing
  // let writeSubSecs; // true if we should write .1s for time, otherwise round to nearest second

  const loadAppSettings = () => {
    const appSettings = require("Storage").readJSON("clinikali.json", 1) || {};

    appSettings.period = appSettings.period || 10;

    if (!appSettings.file || !appSettings.file.startsWith("clinikali.log")) {
      appSettings.recording = false;
    }

    return appSettings;
  };

  const updateAppSettings = (appSettings) => {
    require("Storage").writeJSON("clinikali.json", appSettings);

    if (WIDGETS.recorder) {
      WIDGETS.recorder.reload();
    }
  };

  const getRecorders = () => {
    const recorders = {
      accel: () => {
        let activityValue = "";

        function onAccel(acceleration) {
          activityValue =
            acceleration.x * acceleration.x +
            acceleration.y * acceleration.y +
            acceleration.z * acceleration.z;
        }

        return {
          name: "Accel",
          fields: ["Activity"],
          getValues: () => {
            const result = [activityValue];
            activityValue = "";
            return result;
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
        let heartRate = "";

        function onHRM(heartRateData) {
          heartRate = heartRateData.bpm;
        }

        return {
          name: "HR",
          fields: ["Heartrate"],
          getValues: () => {
            const result = [heartRate];
            heartRate = "";
            return result;
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
        let temperature = "";

        function onPressure(pressureData) {
          temperature = pressureData.temperature;
        }

        return {
          name: "Baro",
          fields: ["Barometer Temperature"],
          getValues: () => {
            const result = [temperature];
            temperature = "";
            return result;
          },
          start: () => {
            Bangle.setBarometerPower(1, "recorder");
            Bangle.on("pressure", onPressure);
          },
          stop: () => {
            Bangle.setBarometerPower(0, "recorder");
            Bangle.removeListener("pressure", onPressure);
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
      .forEach((filename) =>
        eval(require("Storage").read(filename))(recorders),
      );

    return recorders;
  };

  const getActiveRecorders = () => {
    const appSettings = loadAppSettings();
    const recorders = getRecorders();

    // If no sensors are selected, return empty array
    if (!appSettings.record || appSettings.record.length === 0) {
      return [];
    }

    // Only return recorders that are in the appSettings.record array
    return appSettings.record
      .filter(name => recorders[name]) // Make sure recorder exists
      .map(name => recorders[name]());
  };

  const getCSVHeaders = (activeRecorders) =>
    ["Time"].concat(activeRecorders.map((recorder) => recorder.fields));

  const writeLog = () => {
    WIDGETS.recorder.draw();

    try {
      const fields = [
        new Date().toISOString().replace("T", " ").replace("Z", ""),
      ];

      activeRecorders.forEach((recorder) =>
        fields.push.apply(fields, recorder.getValues()),
      );

      if (storageFile) {
        storageFile.write(`${fields.join(",")}\n`);
      }
    } catch (error) {
      console.log("recorder: error", error);
      const appSettings = loadAppSettings();

      appSettings.recording = false;

      require("Storage").write("clinikali.json", appSettings);
      reload();
    }
  };

  const reload = () => {
    const appSettings = loadAppSettings();

    if (typeof writeSetup === "number") {
      clearInterval(writeSetup);
    }

    writeSetup = undefined;
    activeRecorders.forEach((recorder) => recorder.stop());
    activeRecorders = [];

    if (appSettings.recording) {
      activeRecorders = getActiveRecorders();
      activeRecorders.forEach((activeRecorder) => {
        activeRecorder.start();
      });

      WIDGETS.recorder.width = 15 + ((activeRecorders.length + 1) >> 1) * 12; // 12px per recorder

      if (require("Storage").list(appSettings.file).length) {
        storageFile = require("Storage").open(appSettings.file, "a");
      } else {
        storageFile = require("Storage").open(appSettings.file, "w");
        storageFile.write(`${getCSVHeaders(activeRecorders).join(",")}\n`);
      }

      WIDGETS.recorder.draw();
      // writeSubSecs = appSettings.period === 1;
      writeSetup = setInterval(
        writeLog,
        appSettings.period * 1000,
        appSettings.period,
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
      if (!writeSetup) {
        return;
      }

      g.reset().drawImage(
        atob("DRSBAAGAHgDwAwAAA8B/D/hvx38zzh4w8A+AbgMwGYDMDGBjAA=="),
        this.x + 1,
        this.y + 2,
      );
      activeRecorders.forEach((recorder, index) => {
        recorder.draw(
          this.x + 15 + (index >> 1) * 12,
          this.y + (index & 1) * 12,
        );
      });
    },
    getRecorders: getRecorders,
    reload: () => {
      reload();
      Bangle.drawWidgets();
    },
    isRecording: () => !!writeSetup,
    setRecording: (isOn, options) => {
      const appSettings = loadAppSettings();

      options = options || {};

      if (isOn && !appSettings.recording) {
        const currentDate = new Date()
          .toISOString()
          .substr(0, 10)
          .replace(/-/g, "");
        let trackNumber = 10;

        function generateTrackFilename() {
          return `clinikali.log${currentDate}${trackNumber.toString(36)}.csv`;
        }

        if (
          !appSettings.file ||
          !appSettings.file.startsWith(`clinikali.log${currentDate}`)
        ) {
          appSettings.file = generateTrackFilename();
        }

        const existingHeaders = require("Storage")
          .open(appSettings.file, "r")
          .readLine();

        if (existingHeaders) {
          if (
            existingHeaders.trim() !==
            getCSVHeaders(getActiveRecorders(appSettings)).join(",")
          ) {
            options.force = "new";
          }

          if (!options.force) {
            g.reset();
            return E.showPrompt(
              `Overwrite\nLog ${
                appSettings.file.match(/^clinikali\.log(.*)\.csv$/)[1]
              }?`,
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
              if (selection === "cancel") {
                return false;
              }
              if (selection === "overwrite") {
                return WIDGETS.recorder.setRecording(1, { force: "overwrite" });
              }
              if (selection === "new") {
                return WIDGETS.recorder.setRecording(1, { force: "new" });
              }
              if (selection === "append") {
                return WIDGETS.recorder.setRecording(1, { force: "append" });
              }
              throw new Error("Unknown response!");
            });
          }

          if (options.force === "append") {
            // do nothing, filename is the same - we are good
          } else if (options.force === "overwrite") {
            require("Storage").open(appSettings.file, "r").erase();
          } else if (options.force === "new") {
            let newFileName;

            do {
              newFileName = generateTrackFilename();
              trackNumber++;
            } while (require("Storage").list(newFileName).length);

            appSettings.file = newFileName;
          } else {
            throw new Error(`Unknown options.force, ${options.force}`);
          }
        }
      }

      appSettings.recording = isOn;
      updateAppSettings(appSettings);
      WIDGETS.recorder.reload();
      return Promise.resolve(appSettings.recording);
    },
  };

  reload();
}
