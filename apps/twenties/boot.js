{ // This boot script is deleted once the companion alarm is set up.
  // The app will continue working by having the alarm rearm itself until
  // the app is uninstalled.
  require("twenties").setup();
  setTimeout(require("Storage").erase, 1000, "twenties.boot.js");
}
