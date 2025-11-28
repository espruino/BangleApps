// Will calling Bangle.load reset everything? if false, we fast load
function loadWillReset() {
  return Bangle.load === load || !Bangle.uiRemove;
    /* FIXME: Maybe we need a better way of deciding if an app will
    be fast loaded than just hard-coding a Bangle.uiRemove check.
    Bangle.load could return a bool (as the load doesn't happen immediately). */
}

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
  if (type==="clearAll") {
    require("messages").stopBuzz();
    return;
  }
  if (msg.t==="remove") {
    // we won't open the UI for removed messages, so make sure to delete it from flash
    if (Bangle.MESSAGES) {
      // we were waiting for exports.messageTimeout
      require("messages").apply(msg, Bangle.MESSAGES);
      if (!Bangle.MESSAGES.length) delete Bangle.MESSAGES;
    }
    if(type!=="music")
      require("messages").stopBuzz();
    return require("messages").save(msg); // always write removal to flash
  }

  const appSettings = require("Storage").readJSON("messages.settings.json", 1) || {};
  let loadMessages = (Bangle.CLOCK || msg.important); // should we load the messages app?
  if (type==="music") {
    if (Bangle.CLOCK && msg.state && msg.title && appSettings.openMusic) {
      loadMessages = true;
    } else {
      if (persistMusicInfo(msg)) return; // handled
    }
  }
  // Write the message to Bangle.MESSAGES. We'll deal with it in messageTimeout below
  if (!Bangle.MESSAGES) Bangle.MESSAGES = [];
  require("messages").apply(msg, Bangle.MESSAGES);
  if (!Bangle.MESSAGES.length) delete Bangle.MESSAGES;
  const saveToFlash = () => {
    // save messages from RAM to flash if we decide not to launch app
    // We apply all of Bangle.MESSAGES here in one write
    if (!Bangle.MESSAGES || !Bangle.MESSAGES.length) return;
    // Load saved messages without applying the current msg to avoid
    // applying it twice (getMessages(msg) would apply it already).
    let messages = require("messages").getMessages();
    (Bangle.MESSAGES || []).forEach(m => require("messages").apply(m, messages));
    require("messages").write(messages);
    delete Bangle.MESSAGES;
  }
  msg.handled = true;
  if ((msg.t!=="add" || !msg.new) && (type!=="music")) // music always has t:"modify"
    return saveToFlash();

  const quiet = (require("Storage").readJSON("setting.json", 1) || {}).quiet;
  const unlockWatch = appSettings.unlockWatch;
  // don't auto-open messages in quiet mode if quietNoAutOpn is true
  if ((quiet && appSettings.quietNoAutOpn) || appSettings.noAutOpn)
    loadMessages = false;
  // after a delay load the app, to ensure we have all the messages
  if (exports.messageTimeout) clearTimeout(exports.messageTimeout);
  exports.messageTimeout = setTimeout(function() {
    delete exports.messageTimeout;
    if (!Bangle.MESSAGES) return; // message was removed during the delay
    if (type!=="music") {
      if (!loadMessages) {
        // not opening the app, just buzz
        saveToFlash();
        return require("messages").buzz(msg.src);
      }
      if (!quiet && unlockWatch) {
        Bangle.setLocked(false);
        Bangle.setLCDPower(1); // turn screen on
      }
    }
    // if loading the gui would reload everything, we must save our messages
    if (loadWillReset()) saveToFlash();
    exports.open(msg);
  }, 500);
};

/**
 * Launch GUI app with given message
 * @param {object} msg
 */
exports.open = function(msg) {
  if (msg && msg.id) {
    // force a display by setting it as new and ensuring it ends up at the beginning of messages list
    msg.new = 1;
    if (loadWillReset()) {
      // no fast loading: store message to load in flash - `msg` will be put in first
      require("messages").save(msg, {force: 1});
    } else {
      // fast load - putting it at the end of Bangle.MESSAGES ensures it goes at the start of messages list
      if (!Bangle.MESSAGES) Bangle.MESSAGES=[];
      Bangle.MESSAGES = Bangle.MESSAGES.filter(m => m.id!=msg.id)
      Bangle.MESSAGES.push(msg); // putting at the
    }
  }

  Bangle.load((msg && msg.new && msg.id!=="music") ? "messagegui.new.js" : "messagegui.app.js");
};

/**
 * Persist info fields from music messages
 * @param {*} msg Music message
 * @returns true if the message was handled
 */
function persistMusicInfo(msg) {
  msg.handled = true;
  // if nothing to persist - return that it's handled
  if (msg.artist === undefined && msg.track === undefined && msg.album === undefined && msg.dur === undefined) return true;

  const a = msg.artist, t = msg.track, al = msg.album, d = msg.dur;

  // try to find the last music message
  const messagesMod = require("messages");
  const messages = messagesMod.getMessages();
  const mIdx = messages.findIndex(m => m.id === "music");
  const stored = mIdx >= 0 ? messages[mIdx] : null;

  if (!stored) {
    // new msg, always write
    const newEntry = { id: "music", artist: a, track: t, album: al, dur: d };
    messages.unshift(Object.assign({}, newEntry));
    messagesMod.write(messages);
  } else {
    // existing msg, only write if something changed
    if (stored.artist !== a || stored.track !== t || stored.album !== al || stored.dur !== d) {
      stored.artist = a;
      stored.track = t;
      stored.album = al;
      stored.dur = d;
      messagesMod.write(messages);
    }
  }
  return true;
}