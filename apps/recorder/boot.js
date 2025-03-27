if ((require("Storage").readJSON("recorder.json",1)||{}).recording) require("recorder"); // just requiring causes it to reload
