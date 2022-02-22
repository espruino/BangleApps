/**
 * Events look like this:
 *   {t:"add",id:int, src,title,subject,body,sender,tel, important:bool, new:bool}
 *   {t:"add",id:int, id:"music", state, artist, track, etc} // add new
 *   {t:"remove",id:int} // remove
 *   {t:"modify",id:int, title:string} // modified
 */

/**
 * Load saved events
 * @returns {object[]}
 */
exports.load = function() {
  // start with contents of old file (if it still exists)
  var events = (require("Storage").readJSON("messages.json", 1) || []).reverse(); // newest message is first in array, but last in StorageFile
  var e, l, f = require("Storage").open("messages.jsonl", "r");
  var ids = {}, idx; // keep a list of id=>index
  while((l = f.readLine())!==undefined) {
    e = JSON.parse(l);
    idx = ids[e.id];
    switch(e.t) {
      case "remove":
        if (idx!==undefined) {
          events[idx] = null;
          delete ids[e.id];
        }
        break;
      case "modify":
        if (idx!==undefined) {
          // update existing event
          Object.assign(events[idx], e);
          break;
        }
      // not found: fall through and add as new
      case "add":
        if (idx!==undefined) {
          // we got events with duplicate ids :-(
          // overwrite with the newest one
          events[idx] = e;
          break;
        }
        if (e.id) ids[e.id] = events.length;
        events.push(e);
        break;
      default:
        throw `Invalid event type "${e.t}"`;
    }
  }
  return events.filter(e => e).reverse(); // newest message comes last in StorageFile, but should be first in array
};

function haveNew() {
  if ("undefined"!= typeof MESSAGES) {
    // we're in an app that loaded messages
    return MESSAGES.some(e => e.new);
  }
  // start with ids of new events in old file (if any)
  var ids = [], e;
  for(e of (require("Storage").readJSON("messages.json", 1) || []).filter(e => e.new)) {
    if (e.id===undefined) return true; // no id, so can't be removed/modified by storageFile line
    ids.push(e.id);
  }
  // add/remove ids of new messages to the list
  var l, f = require("Storage").open("messages.jsonl", "r");
  while((l = f.readLine())!==undefined) {
    e = JSON.parse(l);
    if (e.t=="remove") {
      if (ids.includes(e.id)) ids.splice(ids.indexOf(e.id), 1);
    } else if (e.new) {
      // add or modify event to new
      if (!e.id) return true;// no id, so can't be removed/modified by later line
      if (!ids.includes(e.id)) ids.push(e.id);
    } else if (e.t=="modify" && e.new==false && ids.includes(e.id)) {
      // event modified to no longer be new
      ids.splice(ids.indexOf(e.id), 1);
    }
  }

  return ids.length>0;
}
/**
 * Check if there are any unread messages
 * @returns {boolean}
 */
exports.haveNew = function(){
  try{
    return haveNew();
  } catch(e) {
    return false; // don't bother e.g. the widget with errors
  }
};

/**
 * Append message to storage file
 * @param {object} event
 */
function append(event) {
  require("Storage").open("messages.jsonl", "a")
    .write(JSON.stringify(event)+"\n");
}
/**
 * Save messages to storage file
 * @param {object[]} events
 */
exports.save = function(events) {
  require("Storage").erase("messages.json"); // clean up old file
  require("Storage").open("messages.jsonl", "w").erase();
  events.reverse().forEach(append); // newest message is first in array, but last in file
};
/**
 * Overwrite storage file with saved messages, to clean up "modify"/"remove" entries
 */
exports.compact = function() {
  exports.save(exports.load());
};

/**
 * Push a new message onto messages queue
 * @param {object} event
 */
exports.pushMessage = function(event) {
  var messages, inApp = "undefined"!= typeof MESSAGES;
  if (event.t=="add" && event.new===undefined) { // If 'new' has not been set yet, set it
    event.new = true; // Assume it should be new
  } else if (event.t=="remove") {
    if (event.id==undefined) return; // we can't handle this
    event = {t: "remove", id: event.id}; // we only need the id
  }
  if (inApp) {
    // we're in an app that has already loaded messages
    messages = MESSAGES;
    // modify/delete as appropriate
    var mIdx = messages.findIndex(m => m.id==event.id);
    if (event.t=="remove") {
      if (mIdx>=0) messages.splice(mIdx, 1); // remove item
      mIdx = -1;
    } else { // add/modify
      if (mIdx<0) {
        mIdx = 0;
        messages.unshift(event); // add new messages to the beginning
      } else {
        Object.assign(messages[mIdx], event);
      }
    }
    // process immediately (saving MESSAGES is app responsibility)
    return onMessagesModified(mIdx<0 ? {id: event.id} : messages[mIdx]);
  }
  // not in app: append to stored list of messages
  append(event);
  if (event.t=="remove") {
    // if we've removed the last new message, hide the widget
    if (global.WIDGETS && WIDGETS.message && !exports.haveNew()) WIDGETS.messages.hide();
  }
  if ((event.t=="remove" || event.t=="modify") && Math.random()>=0.8) {
    // perform housekeeping every so often
    exports.compact();
  }
  // ok, saved now - we only care if it's new
  if (event.t!="add" || !event.new) {
    return;
  }
  // otherwise load messages/show widget
  var loadMessages = Bangle.CLOCK || event.important;
  // first, buzz
  var quiet = (require("Storage").readJSON("setting.json", 1) || {}).quiet;
  if (!quiet && loadMessages && global.WIDGETS && WIDGETS.messages) {
    WIDGETS.messages.buzz();
  }
  // after a delay load the app, to ensure we have all the messages
  if (exports.messageTimeout) clearTimeout(exports.messageTimeout);
  exports.messageTimeout = setTimeout(function() {
    exports.messageTimeout = undefined;
    // if we're in a clock or it's important, go straight to messages app
    if (loadMessages) return load("messages.app.js");
    if (!quiet && (!global.WIDGETS || !WIDGETS.messages)) return Bangle.buzz(); // no widgets - just buzz to let someone know
    WIDGETS.messages.show();
  }, 500);
};
/// Remove all messages
exports.clearAll = function() {
  var inApp = "undefined"!= typeof MESSAGES;
  if (inApp) MESSAGES = []; // we're in an app that has already loaded messages
  // Erase messages file
  exports.save([]);
  // update app if in app
  if (inApp) return onMessagesModified();
  // if we have a widget, update it
  if (global.WIDGETS && WIDGETS.messages) WIDGETS.messages.hide();
};
