/* BangTurn settings, installed as "bangturn.settings.js": shown under
   Settings > Apps > BangTurn. The walk length, which opens the
   scroll wheel picker (bangturn.picker). A new length applies to the next
   walk; a walk that is running keeps its own. And the speed units
   (kph or mph), switched with a tap, and the GPS log (see
   bangturn.speed), on or off, and whether the watch's own GPS may be used
   (no: phone GPS only). */
(function (back) {
  var bt = require("bangturn");
  function menu() {
    var m = { "": { title: "BangTurn", back: back } };
    // a plain item, so a tap opens the wheels rather than a number stepper
    m["Length: " + bt.getMins() + " min"] = function () {
      E.showMenu();
      require("bangturn.picker").show(bt.getMins(), function (mins) {
        bt.setMins(mins);
        menu();
      });
    };
    m["Units: " + bt.getUnits()] = function () {
      bt.setUnits(bt.getUnits() == "kph" ? "mph" : "kph");
      menu();
    };
    m["GPS log: " + (bt.getLog() ? "on" : "off")] = function () {
      bt.setLog(!bt.getLog());
      menu();
    };
    m["Use watch GPS: " + (bt.getWatchGps() ? "yes" : "no")] = function () {
      bt.setWatchGps(!bt.getWatchGps());
      menu();
    };
    E.showMenu(m);
  }
  menu();
})
