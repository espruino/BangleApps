(function() {
  var _GB = global.GB;
  global.GB = (event) => {
    if (_GB) setTimeout(_GB,0,event);
    // call handling?
    if (!event.t.startsWith("notify")) return;
    /* event is:
      {t:"notify",id:int, src,title,subject,body,sender,tel:string}
      {t:"notify~",id:int, title:string} // modified
      {t:"notify-",id:int} // remove
    */
    var messages, inApp = "undefined"!=typeof MESSAGES;
    if (inApp)
      messages = MESSAGES; // we're in an app that has already loaded messages
    else   // no app - load messages
      messages = require("Storage").readJSON("messages.json",1)||[];
    // now modify/delete as appropriate
    var mIdx = messages.findIndex(m=>m.id==event.id);
    if (event.t=="notify-") {
      if (mIdx>=0) messages.splice(mIdx, 1); // remove item
      mIdx=-1;
    } else { // add/modify
      if (event.t=="notify") event.new=true; // new message
      if (mIdx<0) mIdx=messages.push(event)-1;
      else Object.assign(messages[mIdx], event);
    }
    require("Storage").writeJSON("messages.json",messages);
    if (inApp) return onMessagesModified(mIdx<0 ? {id:event.id} : messages[mIdx]);
    // ok, saved now - we only care if it's new
    if (event.t!="notify") return;
    // if we're in a clock, go straight to messages app
    if (Bangle.CLOCK) return load("messages.app.js");
    if (!global.WIDGETS || !WIDGETS.messages) return Bangle.buzz(); // no widgets - just buzz to let someone know
    WIDGETS.messages.newMessage();
  };
})()
