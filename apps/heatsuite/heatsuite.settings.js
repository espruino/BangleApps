(function (back) {

    var settingsJSON = "heatsuite.settings.json";
    var studyTasksJSON = "heatsuite.tasks.json";

    function log(msg) {
        if (!settings.DEBUG) {
            return;
        } else {
            console.log(msg);
        }
    }

    function writeSettings(key, value) {
        var s = require('Storage').readJSON(settingsJSON, true) || {};
        s[key] = value;
        require('Storage').writeJSON(settingsJSON, s);
        settings = readSettings();
        if (global.WIDGETS && WIDGETS["heatsuite"]) WIDGETS["heatsuite"].changed(); //redraw widget on settings update if open
    }

    function readSettings() {
        var out = Object.assign(
            require('Storage').readJSON("heatsuite.default.json", true) || {},
            require('Storage').readJSON(settingsJSON, true) || {}
        );
        out.StudyTasks = require('Storage').readJSON(studyTasksJSON, true) || {};
        return out;
    }
    var settings = readSettings();

    /*---- PAIRING FUNCTIONS FOR DEVICES ----*/
    function BPPair(id) {
        var device;
        E.showMessage(`Pairing /n ${id}`, "Bluetooth");
        NRF.connect(id).then(function (d) {
            device = d;
            return new Promise(resolve => setTimeout(resolve, 2000));
        }).then(function () {
            log("connected");
            if (device.getSecurityStatus().bonded) {
                log("Already bonded");
                return true;
            } else {
                log("Start bonding");
                return device.startBonding();
            }
        }).then(function () {
            device.device.on('gattserverdisconnected', function (reason) {
                log("Disconnected ", reason);
            });
            return device.getPrimaryService("1810");
        }).then(function (service) {
            log(service);
            return service.getCharacteristic("2A08");
        }).then(function (characteristic) {
            //set time on device during pairing
            var date = new Date();
            var b = new ArrayBuffer(7);
            var v = new DataView(b);
            v.setUint16(0, date.getFullYear(), true);
            v.setUint8(2, date.getMonth() + 1);
            v.setUint8(3, date.getDate());
            v.setUint8(4, date.getHours());
            v.setUint8(5, date.getMinutes());
            v.setUint8(5, date.getSeconds());
            var arr = [];
            for (let i = 0; i < v.buffer.length; i++) {
                arr[i] = v.buffer[i];
            }
            return characteristic.writeValue(arr);
        }).then(function () {
            writeSettings("bt_bloodPressure_id", id);
            // Store the name for displaying later. Will connect by ID
            if (device.name) {
                writeSettings("bt_bloodPressure_name", device.name);
            }
            E.showAlert("Paired!").then(function () { E.showMenu(deviceSettings()) });
            log("Device ID paired, time set, Done!");
            return device.disconnect();
        }).catch(function (e) {
            log(e);
            E.showAlert("error! " + e).then(function () { E.showMenu(deviceSettings()) });
        });
    }
    function PairTcore(id) {
        E.showMessage(`Pairing /n ${id}`, "Bluetooth");
        var gatt;
        NRF.connect(id).then(function (g) {
            gatt = g;
            console.log("connected!!!");
            //  return gatt.startBonding();
            //}).then(function() {
            console.log("bonded", gatt.getSecurityStatus());
            writeSettings("bt_coreTemperature_id", id);
            E.showAlert("Paired!").then(function () { E.showMenu(deviceSettings()) });
            log("Device ID paired, Done!");
            gatt.disconnect();
        }).catch(function (e) {
            log("ERROR: " + e);
            E.showAlert("error! " + e).then(function () { E.showMenu(deviceSettings()) });
        });
    }

    function deviceSettings() {
        var menu = { '< Back': function () { E.showMenu(mainMenuSettings()); } };
        menu[''] = { 'title': 'Devices' };
        settings.StudyTasks.forEach(task => {
            if (task.btPair === undefined || !task.btPair) return;
            let key = task.id; // Adjust based on how you identify tasks
            let id = "bt_" + key + "_id";
            if (settings[id] !== undefined) {
                menu["Clear " + key] = function () {
                    E.showPrompt("Clear " + key + " device?").then((r) => {
                        if (r) {
                            writeSettings("bt_" + key + "_id", undefined);
                            writeSettings("bt_" + key + "_name", undefined);
                        }
                        E.showMenu(mainMenuSettings());
                    });
                };
            } else {
                menu["Pair " + key] = () => createMenuFromScan(key, task.btInfo.service);
            }
        });
        return menu;
    }

    function recordMenu(){
        var  updateRecorder = function(name,v){
            var r = settings.record;
            r = r.filter(item => item !== name);
            if(v){
                r.push(name);
            }
            writeSettings("record",r);
        }
        var menu = { '< Back': function () { E.showMenu(mainMenuSettings()); } };
        menu[''] = { 'title': 'Recorder' };
        var recorderOptions = {
            'hrm' : 'Optical HR',
            'steps' : "Steps",
            'bat' : 'Battery',
            'movement': 'Movement',
            'acc':'Accelerometry',
            'baro':'Temp/Pressure',
            'bthrm': 'BT HRM',
            'CORESensor':'CORE Sensor'
        }
        for (let key in recorderOptions) {
            let name = recorderOptions[key];
            menu[name] = {
                value: settings.record.includes(key),
                onchange: v => {updateRecorder(key,v);}
            };
        }
        menu['High Acc'] = {
            value: settings.highAcc || false,
            onchange: v => {
                settings.highAcc = v;
                writeSettings("highAcc", v);
            }
        };
        return menu;
    }

    function mainMenuSettings() {
        var menu = {
            '': { 'title': 'Main' },
            '< Back': back
        };
        
        menu['Recorders'] = function () {E.showMenu(recordMenu()) };
        menu['Devices'] = function () { E.showMenu(deviceSettings()) };
        menu['GPS'] = function () { E.showMenu(gpsSettings()) };
        menu['Language'] = function () { E.showMenu(languageMenu()) };
        menu['Swipe Launch'] = {
            value: settings.swipeOpen || false,
            onchange: v => {
                settings.swipeOpen = v;
                writeSettings("swipeOpen", v);
            }
        };
        menu['Survey Random'] = {
            value: settings.surveyRandomize || false,
            onchange: v => {
                settings.GPS = v;
                writeSettings("surveyRandomize", v);
            }
        };
        menu['HRM Interval'] = {
            value: settings.HRMInterval || 0,
            min: 0, max: 60,
            onchange: v => {
                settings.HRMInterval = v;
                writeSettings("HRMInterval", v);
            }
        };
        menu['Restart BLE'] = function () {
            E.showPrompt("Restart Bluetooth?").then((r) => {
                if (r) {
                    NRF.disconnect()
                    NRF.restart();
                }
                E.showMenu(mainMenuSettings());
            });
        };
        menu['Clear Cache'] = function () {
            E.showPrompt("Clear Cache?").then((r) => {
                if (r) {
                    require('Storage').writeJSON("heatsuite.cache.json", {});
                }
                E.showMenu(mainMenuSettings());
            });
        }
        menu['Clear Study ID'] = function () {
            E.showPrompt("Clear study ID (includes ignored)?").then((r) => {
                if (r) {
                    writeSettings("studyID", undefined);
                    writeSettings("studyIDIgnore", []);
                }
                E.showMenu(mainMenuSettings());
            });
        }
        menu['Notifications'] = {
            value: settings.notifications || false,
            onchange: v => {
                settings.notifications = v;
                writeSettings("notifications", v);
            }
        };
        menu['Debug'] = function () { E.showMenu(debugMenu()) };
        return menu;
    }
    function debugMenu(){
        var menu = {
            '': { 'title': 'Debug' },
            '< Back': function () { E.showMenu(mainMenuSettings()); }
        }; 
        menu['Console'] = {
            value: settings.DEBUG || false,
            onchange: v => {
                settings.DEBUG = v;
            writeSettings("DEBUG", v);
            }
        };
        menu['Log (file)'] = {
            value: settings.SAVE_DEBUG || false,
            onchange: v => {
                settings.SAVE_DEBUG = v;
                writeSettings("SAVE_DEBUG", v);
            }
        };
        return menu;
    }
    function gpsSettings() {
        var menu = {
            '': { 'title': 'GPS' },
            '< Back': function () { E.showMenu(mainMenuSettings()); }
        };
        menu['GPS'] = {
            value: settings.GPS || false,
            onchange: v => {
                settings.GPS = v;
                writeSettings("GPS", v);
            }
        };
        menu['Scan Time (min)'] = {
            value: settings.GPSScanTime || 1,
            min: 0, max: 60,
            onchange: v => {
                settings.GPSScanTime = v;
                writeSettings("GPSScanTime", v);
            }
        };
        menu['Interval (min)'] = {
            value: settings.GPSInterval || 10,
            min: 0, max: 180,
            onchange: v => {
                settings.GPSinterval = v;
                writeSettings("GPSInterval", v);
            }
        };
        menu['Adaptive (min)'] = {
            value: settings.GPSAdaptiveTime || 2,
            min: 0, max: 60,
            onchange: v => {
                settings.GPSAdaptiveTime = v;
                writeSettings("GPSAdaptiveTime", v);
            }
        };
        return menu;
    }

    function languageMenu() {
        var menu = { '< Back': function () { E.showMenu(mainMenuSettings()); } };
        menu[''] = { 'title': 'Language' };
        var surveySettings = require('Storage').readJSON("heatsuite.survey.json", true) || {};

        Object.keys(surveySettings.supported).forEach(key => {
            //var id = surveySettings.supported[key];
            menu[key] = function () {
                E.showPrompt("Set " + key + "?").then((r) => {
                    if (r) {
                        writeSettings('lang', key);
                    }
                    E.showMenu(mainMenuSettings());
                });
            };
        });
        return menu;
    }

    function createMenuFromScan(type, service) {
        E.showMenu();
        E.showMessage("Scanning for 4 seconds");
        var submenu_scan = {
            '< Back': function () { E.showMenu(deviceSettings()); }
        };
        NRF.findDevices(function (devices) {
            submenu_scan[''] = { title: `Scan (${devices.length} found)` };
            if (devices.length === 0) {
                E.showAlert("No " + type + " devices found")
                    .then(() => E.showMenu(deviceSettings()));
                return;
            } else {
                devices.forEach((d) => {
                    print("Found device", d);
                    var shown = (d.name || d.id.substr(0, 17));
                    submenu_scan[shown] = function () {
                        E.showPrompt("Set " + shown + "?").then((r) => {
                            if (r) {
                                switch (type) {
                                    case "bloodPressure":
                                        BPPair(d.id);
                                        break;
                                    case "coreTemperature":
                                        PairTcore(d.id);
                                        break;
                                    case "bthrm":

                                        break;
                                    default:
                                        E.showMenu(deviceSettings());
                                        break;
                                }
                            } else {
                                E.showMenu(deviceSettings());
                            }
                        });
                    };
                });
            }
            E.showMenu(submenu_scan);
        }, { timeout: 4000, active: true, filters: [{ services: [service] }] });
    }
    
    E.showMenu(mainMenuSettings());
})