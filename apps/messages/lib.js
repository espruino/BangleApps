function openMusic() {
  // only read settings file for first music message
  if ("undefined"==typeof exports._openMusic) {
    exports._openMusic = !!((require('Storage').readJSON("messages.settings.json", true) || {}).openMusic);
  }
  return exports._openMusic;
}
/* Push a new message onto messages queue, event is:
  {t:"add",id:int, src,title,subject,body,sender,tel, important:bool, new:bool}
  {t:"add",id:int, id:"music", state, artist, track, etc} // add new
  {t:"remove",id:int} // remove
  {t:"modify",id:int, title:string} // modified
*/
exports.pushMessage = function(event) {
  var messages = exports.getMessages();
  // now modify/delete as appropriate
  var mIdx = messages.findIndex(m=>m.id==event.id);
  if (event.t=="remove") {
    if (mIdx>=0) messages.splice(mIdx, 1); // remove item
    mIdx=-1;
  } else { // add/modify
    if (event.t=="add"){
      if(event.new === undefined ) { // If 'new' has not been set yet, set it
        event.new=true; // Assume it should be new
      }
    }
    if (mIdx<0) {
      mIdx=0;
      messages.unshift(event); // add new messages to the beginning
    }
    else Object.assign(messages[mIdx], event);
    if (event.id=="music" && messages[mIdx].state=="play") {
      messages[mIdx].new = true; // new track, or playback (re)started
      type = 'music';
    }
  }
  require("Storage").writeJSON("messages.json",messages);
  var message = mIdx<0 ? {id:event.id, t:'remove'} : messages[mIdx];
  // if in app, process immediately
  if ("undefined"!=typeof MESSAGES) return onMessagesModified(message);
  // emit message event
  var type = 'text';
  if (["call", "music", "map"].includes(message.id)) type = message.id;
  if (message.src && message.src.toLowerCase().startsWith("alarm")) type = "alarm";
  Bangle.emit("message", type, message);
  // update the widget icons shown
  if (global.WIDGETS && WIDGETS.messages) WIDGETS.messages.update(messages,true);
  var handleMessage = () => {
    // if no new messages now, make sure we don't load the messages app
    if (event.t=="remove" && exports.messageTimeout && !messages.some(m => m.new)) {
      clearTimeout(exports.messageTimeout);
      delete exports.messageTimeout;
    }
    // ok, saved now
    if (event.id=="music" && Bangle.CLOCK && messages[mIdx].new && openMusic()) {
      // just load the app to display music: no buzzing
      Bangle.load("messages.app.js");
    } else if (event.t!="add") {
      // we only care if it's new
      return;
    } else if (event.new==false) {
      return;
    }
    // otherwise load messages/show widget
    var loadMessages = Bangle.CLOCK || event.important;
    var quiet = (require('Storage').readJSON('setting.json', 1) || {}).quiet;
    var appSettings = require('Storage').readJSON('messages.settings.json', 1) || {};
    var unlockWatch = appSettings.unlockWatch;
    // don't auto-open messages in quiet mode if quietNoAutOpn is true
    if ((quiet && appSettings.quietNoAutOpn) || appSettings.noAutOpn)
      loadMessages = false;
    delete appSettings;
    // after a delay load the app, to ensure we have all the messages
    if (exports.messageTimeout) clearTimeout(exports.messageTimeout);
    exports.messageTimeout = setTimeout(function() {
      exports.messageTimeout = undefined;
      // if we're in a clock or it's important, go straight to messages app
      if (loadMessages) {
        if (!quiet && unlockWatch) {
          Bangle.setLocked(false);
          Bangle.setLCDPower(1); // turn screen on
        }
        // we will buzz when we enter the messages app
        return Bangle.load("messages.new.js");
      }
      if (global.WIDGETS && WIDGETS.messages) WIDGETS.messages.update(messages);
      exports.buzz(message.src);
    }, 500);
  };
  setTimeout(()=>{
    if (!message.handled) handleMessage();
  },0);
}
/// Remove all messages
exports.clearAll = function() {
  if ("undefined"!= typeof MESSAGES) { // we're in a messages app, clear that as well
    MESSAGES = [];
  }
  // Clear all messages
  require("Storage").writeJSON("messages.json", []);
  // if we have a widget, update it
  if (global.WIDGETS && WIDGETS.messages)
    WIDGETS.messages.update([]);
  // let message listeners know
  Bangle.emit("message", "clearAll", {}); // guarantee listeners an object as `message`
  // clearAll cannot be marked as "handled"
  // update app if in app
  if ("function"== typeof onMessagesModified) onMessagesModified();
}

/**
 * @returns {array} All messages
 */
exports.getMessages = function() {
  if ("undefined"!=typeof MESSAGES) return MESSAGES; // loaded/managed by app
  return require("Storage").readJSON("messages.json",1)||[];
}

/**
 * Check if there are any messages
 * @returns {string} "new"/"old"/"none"
 */
 exports.status = function() {
  try {
    let status= "none";
    for(const m of exports.getMessages()) {
      if (["music", "map"].includes(m.id)) continue;
      if (m.new) return "new";
      status = "old";
    }
    return status;
  } catch(e) {
    return "none"; // don't bother e.g. the widget with errors
  }
};

/**
 * Start buzzing for new message
 * @param {string} msgSrc Message src to buzz for
 * @return {Promise} Resolves when initial buzz finishes (there might be repeat buzzes later)
 */
exports.buzz = function(msgSrc) {
  exports.stopBuzz(); // cancel any previous buzz timeouts
  if ((require('Storage').readJSON('setting.json',1)||{}).quiet) return Promise.resolve(); // never buzz during Quiet Mode
  var msgSettings = require('Storage').readJSON("messages.settings.json", true) || {};
  var pattern;
  if (msgSrc && msgSrc.toLowerCase() === "phone") {
    // special vibration pattern for incoming calls
    pattern = msgSettings.vibrateCalls;
  } else {
    pattern = msgSettings.vibrate;
  }
  if (pattern === undefined) { pattern = ":"; } // pattern may be "", so we can't use || ":" here
  if (!pattern) return Promise.resolve();

  var repeat = msgSettings.repeat;
  if (repeat===undefined) repeat=4; // repeat may be zero
  if (repeat) {
    exports.buzzTimeout = setTimeout(()=>require("buzz").pattern(pattern), repeat*1000);
    var vibrateTimeout = msgSettings.vibrateTimeout;
    if (vibrateTimeout===undefined) vibrateTimeout=60;
    if (vibrateTimeout && !exports.stopTimeout) exports.stopTimeout = setTimeout(exports.stopBuzz, vibrateTimeout*1000);
  }
  return require("buzz").pattern(pattern);
};
/**
 * Stop buzzing
 */
exports.stopBuzz = function() {
  if (exports.buzzTimeout) clearTimeout(exports.buzzTimeout);
  delete exports.buzzTimeout;
  if (exports.stopTimeout) clearTimeout(exports.stopTimeout);
  delete exports.stopTimeout;
};
