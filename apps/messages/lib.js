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
  {t:"remove-",id:int} // remove
  {t:"modify",id:int, title:string} // modified
*/
exports.pushMessage = function(event) {
  var messages, inApp = "undefined"!=typeof MESSAGES;
  if (inApp)
    messages = MESSAGES; // we're in an app that has already loaded messages
  else   // no app - load messages
    messages = require("Storage").readJSON("messages.json",1)||[];
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
    }
  }
  require("Storage").writeJSON("messages.json",messages);
  // if in app, process immediately
  if (inApp) return onMessagesModified(mIdx<0 ? {id:event.id} : messages[mIdx]);
  // if we've removed the last new message, hide the widget
  if (event.t=="remove" && !messages.some(m=>m.new)) {
    if (global.WIDGETS && WIDGETS.messages) WIDGETS.messages.hide();
  }
  // ok, saved now
  if (event.id=="music" && Bangle.CLOCK && messages[mIdx].new && openMusic()) {
    // just load the app to display music: no buzzing
    load("messages.app.js");
  } else if (event.t!="add") {
    // we only care if it's new
    return;
  } else if(event.new == false) {
    return;
  }
  // otherwise load messages/show widget
  var loadMessages = Bangle.CLOCK || event.important;
  // first, buzz
  var quiet       = (require('Storage').readJSON('setting.json',1)||{}).quiet;
  var unlockWatch = (require('Storage').readJSON('messages.settings.json',1)||{}).unlockWatch;
  if (!quiet && loadMessages && global.WIDGETS && WIDGETS.messages){
      WIDGETS.messages.buzz();
      if(unlockWatch != false){
        Bangle.setLocked(false);
        Bangle.setLCDPower(1); // turn screen on
      }
  }
  // after a delay load the app, to ensure we have all the messages
  if (exports.messageTimeout) clearTimeout(exports.messageTimeout);
  exports.messageTimeout = setTimeout(function() {
    exports.messageTimeout = undefined;
    // if we're in a clock or it's important, go straight to messages app
    if (loadMessages){
      return load("messages.app.js");
    }
    if (!quiet && (!global.WIDGETS || !WIDGETS.messages)) return Bangle.buzz(); // no widgets - just buzz to let someone know
    WIDGETS.messages.show();
  }, 500);
}
/// Remove all messages
exports.clearAll = function(event) {
  var messages, inApp = "undefined"!=typeof MESSAGES;
  if (inApp) {
    MESSAGES = [];
    messages = MESSAGES; // we're in an app that has already loaded messages
  } else   // no app - empty messages
    messages = [];
  // Save all messages
  require("Storage").writeJSON("messages.json",messages);
  // update app if in app
  if (inApp) return onMessagesModified();
  // if we have a widget, update it
  if (global.WIDGETS && WIDGETS.messages)
    WIDGETS.messages.hide();
}
