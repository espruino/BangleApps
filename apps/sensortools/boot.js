if ((require('Storage').readJSON("sensortools.json", true) || {}).enabled) require("sensortools").enable();
