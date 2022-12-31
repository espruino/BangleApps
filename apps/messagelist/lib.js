// Handle incoming messages while the app is not loaded
// The messages app overrides Bangle.messageListener
// (placed in separate file, so we don't read this all at boot time)
exports.messageListener = function(type, msg) {
  if (msg.handled || (global.__FILE__ && __FILE__.startsWith("messagelist."))) return; // already handled/app open
  // clean up, in case previous message didn't load the app after all
  if (exports.loadTimeout) clearTimeout(exports.loadTimeout);
  delete exports.loadTimeout;
  delete exports.buzz;
  const quiet = () => (require("Storage").readJSON("setting.json", 1) || {}).quiet;
  /**
   * Quietly load the app for music/map, if not already loading
   */
  function loadQuietly(msg) {
    if (exports.loadTimeout) return; // already loading
    exports.loadTimeout = setTimeout(function() {
      Bangle.load("messagelist.app.js");
    }, 500);
  }
  function loadNormal(msg) {
    if (exports.loadTimeout) clearTimeout(exports.loadTimeout); // restart timeout
    exports.loadTimeout = setTimeout(function() {
      delete exports.loadTimeout;
      // check there are still new messages (for #1362)
      let messages = require("messages").getMessages(msg);
      (Bangle.MESSAGES || []).forEach(m => require("messages").apply(m, messages));
      if (!messages.some(m => m.new)) return; // don't use `status()`: also load for new music!
      // if we're in a clock, or it's important, open app
      if (Bangle.CLOCK || msg.important) {
        if (exports.buzz) require("messages").buzz(msg.src);
        Bangle.load("messagelist.app.js");
      }
    }, 500);
  }

  /**
   * Mark message as handled, and save it for the app
   */
  const handled = () => {
    if (!Bangle.MESSAGES) Bangle.MESSAGES = [];
    require("messages").apply(msg, Bangle.MESSAGES);
    if (!Bangle.MESSAGES.length) delete Bangle.MESSAGES;
    if (msg.t==="remove") require("messages").save(msg);
    else msg.handled = true;
  };
  /**
   * Write messages to flash after all, when not laoding the app
   */
  const saveToFlash = () => {
    (Bangle.MESSAGES||[]).forEach(m=>require("messages").save(m));
    delete Bangle.MESSAGES;
  }

  switch(type) {
    case "music":
      if (!Bangle.CLOCK) return;
      // only load app if we are playing, and we know which song
      if (msg.state!=="play" || !msg.title) return;
      if (exports.openMusic===undefined) {
        // only read settings for first music message
        exports.openMusic = !!(exports.settings().openMusic);
      }
      if (!exports.openMusic) return; // we don't care about music
      if (quiet()) return;
      msg.new = true;
      handled();
      return loadQuietly();

    case "map":
      handled();
      if (msg.t!=="remove" && Bangle.CLOCK) loadQuietly();
      else saveToFlash();
      return;

    case "text":
      handled();
      if (exports.settings().autoOpen===false) return saveToFlash();
      if (quiet()) return saveToFlash();
      if (msg.t!=="add" || !msg.new || !(Bangle.CLOCK || msg.important)) {
        // not important enough to load the app
        if (msg.t==="add" && msg.new) require("messages").buzz(msg);
        return saveToFlash();
      }
      if (msg.t==="add" && msg.new) exports.buzz = true;
      return loadNormal(msg);

    case "alarm":
      if (quiet()<2) return saveToFlash();
    // fall through
    case "call":
      handled();
      exports.buzz = true;
      return loadNormal(msg);

    // case "clearAll": do nothing
  }
};

exports.settings = function() {
  return Object.assign({
      // Interface //
      fontSize: 1,
      onTap: 0, // [Message menu, Dismiss, Back, Nothing]
      button: true,

      // Behaviour //
      vibrate: ":",
      vibrateCalls: ":",
      vibrateAlarms: ":",
      repeat: 4,
      vibrateTimeout: 60,
      unreadTimeout: 60,
      autoOpen: true,

      // Music //
      openMusic: true,
      // no default: alwaysShowMusic (auto-enabled by app when music happens)
      showAlbum: true,
      musicButtons: false,

      // Widget //
      flash: true,
      // showRead: false,

      // Utils //
    },
    // fall back to default app settings if not set for messagelist
    (require("Storage").readJSON("messages.settings.json", true) || {}),
    (require("Storage").readJSON("messagelist.settings.json", true) || {}));
};

/**
 * @param {string} icon Icon name
 * @returns string Icon image string, for use with g.drawImage()
 */
exports.getIcon = function(icon) {
  // TODO: icons should be 24x24px with 1bpp colors
  switch(icon.toLowerCase()) {
    // generic icons:
    case "alert":
      return atob("GBgBAAAAAP8AA//AD8PwHwD4HBg4ODwcODwccDwOcDwOYDwGYDwGYBgGYBgGcBgOcAAOOBgcODwcHDw4Hxj4D8PwA//AAP8AAAAA");
    case "alarm":
    case "alarmclockreceiver":
      return atob("GBjBAP////8AAAAAAAACAEAHAOAefng5/5wTgcgHAOAOGHAMGDAYGBgYGBgYGBgYGBgYDhgYBxgMATAOAHAHAOADgcAB/4AAfgAAAAAAAAA=");
    case "back": // TODO: 22x22
      return atob("FhYBAAAAEAAAwAAHAAA//wH//wf//g///BwB+DAB4EAHwAAPAAA8AADwAAPAAB4AAHgAB+AH/wA/+AD/wAH8AA==");
    case "calendar":
      return atob("GBiBAAAAAAAAAAAAAA//8B//+BgAGBgAGBgAGB//+B//+B//+B9m2B//+B//+Btm2B//+B//+Btm+B//+B//+A//8AAAAAAAAAAAAA==");
    case "mail":  // TODO: 28x18
    case "sms message":
    case "notification":
      return atob("HBKBAD///8H///iP//8cf//j4//8f5//j/x/8//j/H//H4//4PB//EYj/44HH/Hw+P4//8fH//44///xH///g////A==");
    case "map":  // TODO: 25x25,
      return atob("GRmBAAAAAAAAAAAAAAIAYAHx/wH//+D/+fhz75w/P/4f//8P//uH///D///h3f/w4P+4eO/8PHZ+HJ/nDu//g///wH+HwAYAIAAAAAAAAAAAAAA=");
    case "menu":
      return atob("GBiBAAAAAAAAAAAAAAAAAP///////wAAAAAAAAAAAAAAAAAAAP///////wAAAAAAAAAAAAAAAAAAAP///////wAAAAAAAAAAAAAAAA==");
    case "music":  // TODO: 22x22
      return atob("FhaBAH//+/////////////h/+AH/4Af/gB/+H3/7/f/v9/+/3/7+f/vB/w8H+Dwf4PD/x/////////////3//+A=");
    case "nak":  // TODO: 22x25
      return atob("FhmBAA//wH//j//+P//8///7///v//+///7//////////////v//////////z//+D8AAPwAAfgAB+AAD4AAPgAAeAAB4AAHAAA==");
    case "neg":  // TODO: 22x22
      return atob("FhaBADAAMeAB78AP/4B/fwP4/h/B/P4D//AH/4AP/AAf4AB/gAP/AB/+AP/8B/P4P4fx/A/v4B//AD94AHjAAMA=");
    case "next":
      return atob("GBiBAAAAAAAAAAAAAAwAcB8A+B+A+B/g+B/4+B/8+B//+B//+B//+B//+B//+B//+B/8+B/4+B/g+B+A+B8A+AwAcAAAAAAAAAAAAA==");
    case "nophone":  // TODO: 30x30
      return atob("Hh6BAAAAAAGAAAAHAAAADgAAABwADwA4Af8AcA/8AOB/+AHH/+ADv/8AB//wAA/HAAAeAAACOAAADHAAAHjgAAPhwAAfg4AAfgcAAfwOAA/wHAA/wDgA/gBwA/gA4AfAAcAfAAOAGAAHAAAADgAAABgAAAAA");
    case "ok":  // TODO: 22x25
      return atob("FhmBAAHAAAeAAB4AAPgAA+AAH4AAfgAD8AAPwAD//+//////////////7//////////////v//+///7///v//8///gf/+A//wA==");
    case "pause":
      return atob("GBiBAAAAAAAAAAAAAAOBwAfD4AfD4AfD4AfD4AfD4AfD4AfD4AfD4AfD4AfD4AfD4AfD4AfD4AfD4AfD4AfD4AOBwAAAAAAAAAAAAA==");
    case "phone":  // TODO: 23x23
    case "call":
      return atob("FxeBABgAAPgAAfAAB/AAD+AAH+AAP8AAP4AAfgAA/AAA+AAA+AAA+AAB+AAB+AAB+OAB//AB//gB//gA//AA/8AAf4AAPAA=");
    case "play":
      return atob("GBiBAAAAAAAAAAAAAAcAAA+AAA/gAA/4AA/8AA//AA//wA//4A//8A//8A//4A//wA//AA/8AA/4AA/gAA+AAAcAAAAAAAAAAAAAAA==");
    case "pos":  // TODO: 25x20
      return atob("GRSBAAAAAYAAAcAAAeAAAfAAAfAAAfAAAfAAAfAAAfBgAfA4AfAeAfAPgfAD4fAA+fAAP/AAD/AAA/AAAPAAADAAAA==");
    case "previous":
      return atob("GBiBAAAAAAAAAAAAAA4AMB8A+B8B+B8H+B8f+B8/+B//+B//+B//+B//+B//+B//+B8/+B8f+B8H+B8B+B8A+A4AMAAAAAAAAAAAAA==");
    case "settings":  // TODO: 20x20
      return atob("FBSBAAAAAA8AAPABzzgf/4H/+A//APnwfw/n4H5+B+fw/g+fAP/wH/+B//gc84APAADwAAAA");
    case "to do":
      return atob("GBgBAAAAAAAAAAAwAAB4AAD8AAH+AAP/DAf/Hg//Px/+f7/8///4///wf//gP//AH/+AD/8AB/4AA/wAAfgAAPAAAGAAAAAAAAAA");
    case "trash":
      return atob("GBiBAAAAAAAAAAB+AA//8A//8AYAYAYAYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAYAYAYAYAf/4AP/wAAAAAAAAA==");
    case "unknown":  // TODO: 30x30
      return atob("Hh6BAAAAAAAAAAAAAAAAAAPwAAA/8AAB/+AAD//AAD4fAAHwPgAHwPgAAAPgAAAfAAAA/AAAD+AAAH8AAAHwAAAPgAAAPgAAAPgAAAAAAAAAAAAAAAAAAHAAAAPgAAAPgAAAPgAAAHAAAAAAAAAAAAAAAAAA");
    case "unread":  // TODO: 29x24
      return atob("HRiBAAAAH4AAAf4AAB/4AAHz4AAfn4AA/Pz/5+fj/z8/j/n5/j/P//j/Pn3j+PPPx+P8fx+Pw/x+AF/B4A78RiP3xwOPvHw+Pcf/+Ox//+NH//+If//+B///+A==");
    default: //should never happen
      return exports.getIcon("unknown");
  }
};
/**
 * @param {string} icon Icon
 * @returns {string} Color to use with g.setColor()
 */
exports.getColor = function(icon) {
  switch(icon.toLowerCase()) {
    // generic colors, using B2-safe colors
    case "alert":
      return "#ff0";
    case "alarm":
      return "#fff";
    case "calendar":
      return "#f00";
    case "mail":
      return "#ff0";
    case "map":
      return "#f0f";
    case "music":
      return "#f0f";
    case "neg":
      return "#f00";
    case "notification":
      return "#0ff";
    case "phone":
    case "call":
      return "#0f0";
    case "settings":
      return "#000";
    case "sms message":
      return "#0ff";
    case "trash":
      return "#f00";
    case "unknown":
      return g.theme.fg;
    case "unread":
      return "#ff0";
    default:
      return g.theme.fg;
  }
};

/**
 * Launch GUI app with given message
 * @param {object} msg
 */
exports.open = function(msg) {
  if (msg && msg.id && !msg.show) {
    // store which message to load
    msg.show = 1;
  }

  Bangle.load((msg && msg.new && msg.id!=="music") ? "messagelist.new.js" : "messagelist.app.js");
};
