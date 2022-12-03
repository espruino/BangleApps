/**
 * Listener set up in boot.js, calls into here to keep boot.js short
 */
exports.listener = function(type, msg) {
  // Default handler: Launch the GUI for all unhandled messages (except music if disabled in settings)
  if (msg.handled || (global.__FILE__ && __FILE__.startsWith('messagegui.'))) return; // already handled or app open

  // if no new messages now, make sure we don't load the messages app
  if (exports.messageTimeout && !msg.new && require("messages").status(msg) !== "new") {
    clearTimeout(exports.messageTimeout);
    delete exports.messageTimeout;
  }
  if (msg.t==="remove") return;

  const appSettings = require("Storage").readJSON("messages.settings.json", 1) || {};
  let loadMessages = (Bangle.CLOCK || event.important);
  if (type==="music") {
    if (Bangle.CLOCK && msg.state && msg.title && appSettings.openMusic) loadMessages = true;
    else return;
  }
  require("messages").save(msg);
  msg.handled = true;
  if ((msg.t!=="add" || !msg.new) && (type!=="music")) { // music always has t:"modify"
    return;
  }

  const quiet = (require("Storage").readJSON("setting.json", 1) || {}).quiet;
  const unlockWatch = appSettings.unlockWatch;
  // don't auto-open messages in quiet mode if quietNoAutOpn is true
  if ((quiet && appSettings.quietNoAutOpn) || appSettings.noAutOpn)
    loadMessages = false;

  // after a delay load the app, to ensure we have all the messages
  if (exports.messageTimeout) clearTimeout(exports.messageTimeout);
  exports.messageTimeout = setTimeout(function() {
    delete exports.messageTimeout;
    if (type!=="music") {
      if (!loadMessages) return require("messages").buzz(msg.src); // no opening the app, just buzz
      if (!quiet && unlockWatch) {
        Bangle.setLocked(false);
        Bangle.setLCDPower(1); // turn screen on
      }
    }
    exports.open(msg);
  }, 500);
};

/**
 * Launch GUI app with given message
 * @param {object} msg
 */
exports.open = function(msg) {
  if (msg && msg.id && !msg.show) {
    // store which message to load
    msg.show = 1;
    require("messages").save(msg, {force: 1});
  }

  Bangle.load((msg && msg.new && msg.id!=="music") ? "messagegui.new.js" : "messagegui.app.js");
};
