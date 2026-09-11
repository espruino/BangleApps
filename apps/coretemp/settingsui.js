exports.open = function (back) {
  var store = require("coretemp.store");
  var settings = {};
  var OWNER = "coretemp.settings";
  var BACKGROUND_OWNER = "coretemp.enabled";

  function readSettings() {
    settings = store.read();
  }

  function writeSetting(key, value) {
    store.write(function (nextSettings) {
      // Full and partial logs are mutually exclusive settings.
      if (key === "debuglog" && value) delete nextSettings.debugpartiallog;
      if (key === "debugpartiallog" && value) delete nextSettings.debuglog;
      if (value === undefined || value === false) delete nextSettings[key];
      else nextSettings[key] = value;
    });
    readSettings();
    if (key === "enabled" && Bangle.setCORESensorPower) {
      Bangle.setCORESensorPower(!!value, BACKGROUND_OWNER);
    }
    if (key === "debuglog" && Bangle.CORESensorSetDebugLog) {
      Bangle.CORESensorSetDebugLog(!!value);
    }
    if ((key === "debuglog" || key === "debugpartiallog") && Bangle.CORESensorSetLogMode) {
      Bangle.CORESensorSetLogMode(settings.debuglog ? "full" : (settings.debugpartiallog ? "partial" : "off"));
    }
    if (key === "customprofileonly" && value && Bangle.CORESensorRebuildCache) {
      Promise.resolve(Bangle.CORESensorRebuildCache()).catch(function () {});
    }
  }

  function showNext(next) {
    var result;
    if (!next) return;
    result = next();
    if (result && typeof result === "object" && result[""]) E.showMenu(result);
    return result;
  }

  function ensureRuntime() {
    if (!Bangle.CORESensorPair) {
      try {
        require("CORESensor").enable();
      } catch (e) {
        return false;
      }
    }
    return !!Bangle.CORESensorPair;
  }

  function runWithCoreConnection(fn, skipConnect) {
    var acquiredPower = false;
    var promise = Promise.resolve();
    if (!ensureRuntime()) return Promise.reject(new Error("CORESensor runtime is unavailable"));
    // Settings actions borrow sensor power and release it afterward when no
    // app/background owner already had the CORE runtime active.
    if (Bangle.setCORESensorPower && Bangle.isCORESensorOn && !Bangle.isCORESensorOn()) {
      Bangle.setCORESensorPower(1, OWNER);
      acquiredPower = true;
    }
    if (!skipConnect) promise = promise.then(function () { return Bangle.CORESensorConnect(); });
    promise = promise.then(fn);
    return promise.then(function (result) {
      if (acquiredPower) Bangle.setCORESensorPower(0, OWNER);
      return result;
    }, function (err) {
      if (acquiredPower) Bangle.setCORESensorPower(0, OWNER);
      throw err;
    });
  }

  function formatError(err) {
    if (err === undefined || err === null) return String(err);
    if (err instanceof Error) return err.message || String(err);
    if (typeof err === "string") return err;
    if (typeof err === "object" && err.message) return String(err.message);
    if (err && err.length !== undefined && typeof err !== "function") return String(err);
    try {
      return JSON.stringify(err);
    } catch (e) {
      return String(err);
    }
  }

  function showError(title, err, next) {
    return E.showAlert(title + "\n" + formatError(err)).then(function () {
      return showNext(next);
    });
  }



  function normalizeHRMStatus(status) {
    // Older runtime builds and tests may omit derived fields; normalize at the
    // UI boundary so menu rendering stays tolerant of partial status objects.
    if (!status) status = {};
    if (!status.pairedSensors) status.pairedSensors = [];
    if (!status.lastScan) status.lastScan = [];
    if (!status.recent) status.recent = [];
    if (status.pairedCount === undefined) status.pairedCount = status.pairedSensors.length;
    if (status.paired === undefined) status.paired = !!status.pairedCount;
    if (status.multiplePaired === undefined) status.multiplePaired = status.pairedCount > 1;
    if (status.currentSource === undefined) status.currentSource = status.pairedSensors[0] || null;
    if (status.syncState === undefined) status.syncState = status.paired ? "paired" : "none";
    return status;
  }

  function formatAntId(id) {
    return id !== undefined && id !== null ? String(id) : "Unknown";
  }

  function describeEntry(entry) {
    return "ANT ID: " + formatAntId(entry.antId) + "\n" +
      "Transport: " + (entry.transport || "ANT+");
  }

  function describeHRMStatus(status) {
    var lines = [];
    status = normalizeHRMStatus(status);
    lines.push("Paired: " + status.pairedCount);
    lines.push("State: " + status.syncState);
    if (status.currentSource) lines.push("ANT ID: " + formatAntId(status.currentSource.antId));
    if (status.selected) lines.push("Selected: " + formatAntId(status.selected.antId));
    if (status.lastError) lines.push("Error: " + status.lastError);
    return lines.join("\n");
  }

  function showStatus(title, text, isFlagged, next) {
    if (isFlagged) {
      return E.showAlert(title + "\n" + text).then(function () {
        return showNext(next);
      });
    }
    return E.showPrompt(text, {
      title: title,
      buttons: { "OK": true }
    }).then(function () {
      return showNext(next);
    });
  }

  function showCoreStatus() {
    var status;
    var text;
    if (!ensureRuntime() || !Bangle.CORESensorGetStatus) {
      return E.showAlert("Runtime unavailable").then(function () {
        E.showMenu(debugMenu());
      });
    }
    status = Bangle.CORESensorGetStatus();
    text = "State: " + status.state + "\n" +
      "Task: " + (status.activeTask || "") + "\n" +
      "Profile: " + (status.profile || "") + "\n" +
      "Custom only: " + status.customProfileOnly + "\n" +
      "Upgrade: " + status.profileUpgradeScheduled + "\n" +
      "HRM: " + (status.hrm ? status.hrm.operation || "" : "") + "\n" +
      "Paired: " + status.paired + "\n" +
      "Connected: " + status.connected + "\n" +
      "Error: " + (status.lastError || "");
    return showStatus("CORE status", text, status.state === "error" || !!status.lastError, debugMenu);
  }

  function rebuildCache() {
    E.showMenu();
    E.showMessage("Rebuilding Cache...");
    return runWithCoreConnection(function () {
      return Bangle.CORESensorRebuildCache();
    }, true).then(function () {
      return E.showPrompt("Cache rebuilt", {
        title: "Success",
        buttons: { "OK": true }
      }).then(function () {
        E.showMenu(debugMenu());
      });
    }).catch(function (err) {
      return showError("Error rebuilding cache", err, debugMenu);
    });
  }

  function connectToDevice() {
    E.showMenu();
    E.showMessage("Connecting...");
    return runWithCoreConnection(function () {
      return Promise.resolve();
    }).then(function () {
      readSettings();
      E.showMenu(buildMainMenu());
    }).catch(function (err) {
      return showError("Error during connect", err, buildMainMenu);
    });
  }

  function formatCoreName() {
    return settings.btname || settings.btid;
  }

  function showHRMStatus() {
    E.showMenu();
    E.showMessage("Refreshing...");
    return runWithCoreConnection(function () {
      return Bangle.CORESensorHRMGetStatus();
    }).then(function (status) {
      status = normalizeHRMStatus(status);
      return showStatus("HRM status", describeHRMStatus(status), !!status.lastError || !!status.multiplePaired, openHRMMenu);
    }).catch(function (err) {
      return showError("Error loading HRM status", err, openHRMMenu);
    });
  }

  function showPairResult(status) {
    return E.showPrompt(describeHRMStatus(status), {
      title: "Success",
      buttons: { "OK": true }
    }).then(openHRMMenu);
  }

  function pairEntryWithReplace(entry, replaceExisting) {
    E.showMenu();
    E.showMessage("Pairing ANT+\n" + formatAntId(entry.antId) + "\n...");
    return runWithCoreConnection(function () {
      return Bangle.CORESensorHRMPairANT(entry, replaceExisting);
    }).then(showPairResult).catch(function (err) {
      return showError("Error pairing HRM", err, openHRMMenu);
    });
  }

  function confirmPairEntry(entry, parentMenu) {
    return runWithCoreConnection(function () {
      return Bangle.CORESensorHRMGetStatus();
    }).then(function (status) {
      status = normalizeHRMStatus(status);
      if (status.multiplePaired) {
        return E.showAlert("Multiple HRMs paired\nClear paired HRMs\nbefore pairing.").then(function () {
          if (parentMenu) E.showMenu(parentMenu);
          else openHRMMenu();
        });
      }
      if (status.pairedSensors.length === 1) {
        return E.showPrompt(
          status.pairedSensors[0].antId === entry.antId ?
            "Re-pair existing\nHRM?" :
            "Replace existing\nHRM?"
        ).then(function (confirmed) {
          if (!confirmed) {
            if (parentMenu) E.showMenu(parentMenu);
            else openHRMMenu();
            return;
          }
          return pairEntryWithReplace(entry, true);
        });
      }
      return E.showPrompt("Pair ANT+\n" + formatAntId(entry.antId) + "?").then(function (confirmed) {
        if (!confirmed) {
          if (parentMenu) E.showMenu(parentMenu);
          else openHRMMenu();
          return;
        }
        return pairEntryWithReplace(entry, false);
      });
    }).catch(function (err) {
      return showError("Error checking HRM", err, openHRMMenu);
    });
  }

  function openEntryMenu(entry, parentMenu) {
    E.showMenu({
      "": { title: "ANT+ " + formatAntId(entry.antId) },
      "< Back": function () { E.showMenu(parentMenu); },
      "Details": function () {
        E.showPrompt(describeEntry(entry), {
          title: "Details",
          buttons: { "OK": true }
        }).then(function () {
          openEntryMenu(entry, parentMenu);
        });
      },
      "Pair": function () {
        return confirmPairEntry(entry, parentMenu);
      }
    });
  }

  function scanANT() {
    var menu;
    E.showMenu();
    E.showMessage("Scanning\n5s");
    return runWithCoreConnection(function () {
      return Bangle.CORESensorHRMScanANT();
    }).then(function (found) {
      if (!found.length) return E.showAlert("No ANT+ HRM found").then(openHRMMenu);
      menu = {
        "": { title: "Scan ANT+" },
        "< Back": openHRMMenu
      };
      found.forEach(function (entry) {
        menu[(entry.index + 1) + ") " + formatAntId(entry.antId)] = function () {
          openEntryMenu(entry, menu);
        };
      });
      E.showMenu(menu);
    }).catch(function (err) {
      return showError("Error scanning HRM", err, openHRMMenu);
    });
  }

  function openRecentHRMs(status) {
    var menu = {
      "": { title: "Recent HRMs" },
      "< Back": openHRMMenu
    };
    status = normalizeHRMStatus(status);
    if (!status.recent.length) return E.showAlert("No recent HRMs").then(openHRMMenu);
    status.recent.forEach(function (entry) {
      menu[formatAntId(entry.antId)] = function () {
        openEntryMenu(entry, menu);
      };
    });
    E.showMenu(menu);
  }

  function clearHRM() {
    return E.showPrompt("Clear paired HRM?").then(function (confirmed) {
      if (!confirmed) return openHRMMenu();
      E.showMenu();
      E.showMessage("Clearing...");
      return runWithCoreConnection(function () {
        return Bangle.CORESensorHRMClearANT();
      }).then(function (status) {
        return E.showPrompt("Clear complete\n" + describeHRMStatus(status), {
          title: "Success",
          buttons: { "OK": true }
        }).then(openHRMMenu);
      }).catch(function (err) {
        return showError("Error clearing HRM", err, openHRMMenu);
      });
    });
  }

  function buildHRMMenu(status) {
    var menu;
    status = normalizeHRMStatus(status);
    menu = {
      "": { title: "HRM (ANT+)" },
      "< Back": function () { E.showMenu(buildMainMenu()); },
      "Status": showHRMStatus
    };
    if (status.selected) {
      menu["Preset HRM"] = function () {
        openEntryMenu(status.selected, menu);
      };
    }
    menu["Scan ANT+"] = scanANT;
    menu["Recent HRMs"] = function () { openRecentHRMs(status); };
    menu["Clear Paired HRM"] = clearHRM;
    return menu;
  }

  function openHRMMenu() {
    var state;
    if (!ensureRuntime() || !Bangle.CORESensorHRMGetStatus) {
      return E.showAlert("Runtime unavailable").then(function () {
        E.showMenu(buildMainMenu());
      });
    }
    state = Bangle.CORESensorHRMGetState ? Bangle.CORESensorHRMGetState() : {};
    E.showMenu(buildHRMMenu(state));
  }

  function debugMenu() {
    return {
      "": { title: "Debug" },
      "< Back": function () { E.showMenu(buildMainMenu()); },
      "Full log": {
        value: !!settings.debuglog,
        onchange: function (v) {
          writeSetting("debuglog", v);
          E.showMenu(debugMenu());
        }
      },
      "Partial log": {
        value: !!settings.debugpartiallog,
        onchange: function (v) {
          writeSetting("debugpartiallog", v);
          E.showMenu(debugMenu());
        }
      },
      "Custom CORE only": {
        value: !!settings.customprofileonly,
        onchange: function (v) { writeSetting("customprofileonly", v); }
      },
      "Status": showCoreStatus,
      "Rebuild cache": rebuildCache,
      "Reset CoreTemp": function () {
        return E.showPrompt("Clear CORE app data?\nRemoves pairing, cache,\nHRM config, settings,\nand logs. BLE bonds\nare not erased.", {
          title: "Reset CoreTemp"
        }).then(function (confirmed) {
          if (!confirmed) return E.showMenu(debugMenu());
          E.showMenu();
          E.showMessage("Resetting...");
          (Bangle.CORESensorUnpair ? Bangle.CORESensorUnpair() : Promise.resolve()).then(function () {
            try { require("Storage").open("coretemp.log", "r").erase(); } catch (e) {}
            try { require("Storage").open("coretemp.hrm.json", "r").erase(); } catch (e) {}
            require("Storage").writeJSON("coretemp.json", { enabled: false, widget: true });
            require("Storage").compact();
            readSettings();
            E.showPrompt("CORE reset complete.", {
              title: "Reset",
              buttons: { "OK": true }
            }).then(function () {
              E.showMenu(buildMainMenu());
            });
          }).catch(function (err) {
            showError("Reset failed", err, buildMainMenu);
          });
        });
      }
    };
  }

  function scanForCoreSensor() {
    var menu = { "< Back": function () { E.showMenu(buildMainMenu()); } };
    E.showMenu();
    E.showMessage("Scanning for\n5 seconds");
    NRF.findDevices(function (devices) {
      if (!devices) devices = [];
      menu[""] = { title: "Scan (" + devices.length + ")" };
      if (!devices.length) {
        return E.showAlert("No devices found").then(function () {
          E.showMenu(buildMainMenu());
        });
      }
      devices.forEach(function (device) {
        var shown = device.name || device.id.substr(0, 17);
        menu[shown] = function () {
          E.showPrompt("Pair with\n" + shown + "?").then(function (confirmed) {
            if (!confirmed) return E.showMenu(menu);
            E.showMenu();
            E.showMessage("Pairing...");
            runWithCoreConnection(function () {
              return Bangle.CORESensorPair(device).then(function (result) {
                readSettings();
                if (settings.enabled && Bangle.setCORESensorPower) {
                  Bangle.setCORESensorPower(1, BACKGROUND_OWNER);
                }
                return result;
              });
            }, true).then(function () {
              readSettings();
              return E.showPrompt("CORE paired", {
                title: "Success",
                buttons: { "OK": true }
              }).then(function () {
                E.showMenu(buildMainMenu());
              });
            }).catch(function (err) {
              return showError("Error during pairing", err, buildMainMenu);
            });
          });
        };
      });
      E.showMenu(menu);
    }, {
      timeout: 5000,
      active: true,
      // Pairing scans only for CORE's custom service; the fallback thermometer
      // profile is too generic to identify the device safely.
      filters: [{ services: ["00002100-5b1e-4347-b07c-97b514dae121"] }]
    });
  }

  function buildMainMenu() {
    var menu = {
      "": { title: "CORE Sensor" },
      "< Back": back,
      "Always On": {
        value: !!settings.enabled,
        onchange: function (v) { writeSetting("enabled", v); }
      },
      "Widget": {
        value: !!settings.widget,
        onchange: function (v) { writeSetting("widget", v); }
      }
    };
    if (settings.btname || settings.btid) {
      menu["Forget " + formatCoreName()] = function () {
        return E.showPrompt("Forget current CORE?\nRemoves saved device\nand cache. BLE bonds\nare not erased.").then(function (confirmed) {
          if (!confirmed) return E.showMenu(buildMainMenu());
          E.showMenu();
          E.showMessage("Forgetting...");
          Promise.resolve(Bangle.CORESensorUnpair()).then(function () {
            readSettings();
            E.showMenu(buildMainMenu());
          }).catch(function (err) {
            showError("Error during forget", err, buildMainMenu);
          });
        });
      };
      if (!(Bangle.isCORESensorConnected && Bangle.isCORESensorConnected())) {
        menu["Test " + formatCoreName()] = connectToDevice;
      }
      menu["HRM (ANT+)"] = openHRMMenu;
    } else {
      menu["Scan for CORE"] = scanForCoreSensor;
    }
    menu["Debug"] = function () { E.showMenu(debugMenu()); };
    return menu;
  }

  readSettings();
  ensureRuntime();
  E.showMenu(buildMainMenu());
};
