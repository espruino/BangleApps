const SETTINGS_FILE = "pastel.json";
let settings = {"grid":false, "date":false, "font":"Lato"}

require("Storage").write(SETTINGS_FILE, settings);
settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
console.log(settings);
