bleServiceOptions.ancs = true;
if (NRF.amsIsActive) bleServiceOptions.ams = true; // amsIsActive was added at the same time as the "am" option
Bangle.ancsMessageQueue = [];

/* Handle ANCS events coming in, and fire off 'notify' events
when we actually have all the information we need */
E.on('ANCS',msg=>{
  /* eg:
  {
    event:"add",
    uid:42,
    category:4,
    categoryCnt:42,
    silent:true,
    important:false,
    preExisting:true,
    positive:false,
    negative:true
    } */

  //console.log("ANCS",msg.event,msg.id);
  // don't need info for remove events - pass these on
  if (msg.event=="remove")
    return E.emit("notify", msg);

  // not a remove - we need to get the message info first
  function ancsHandler() {
    var msg = Bangle.ancsMessageQueue[0];
    NRF.ancsGetNotificationInfo( msg.uid ).then( info => {

      if(msg.preExisting === true){
        info.new = false;
      } else {
        info.new = true;
      }

      E.emit("notify", Object.assign(msg, info));
      Bangle.ancsMessageQueue.shift();
      if (Bangle.ancsMessageQueue.length)
        ancsHandler();
    });
  }
  Bangle.ancsMessageQueue.push(msg);
  // if this is the first item in the queue, kick off ancsHandler,
  // otherwise ancsHandler will handle the rest
  if (Bangle.ancsMessageQueue.length==1)
    ancsHandler();
});

// Handle ANCS events with all the data
E.on('notify',msg=>{
/* Info from ANCS event plus
  "uid" : int,
  "appId" : string,
  "title" : string,
  "subtitle" : string,
  "message" : string,
  "messageSize" : string,
  "date" : string,
  "new" : boolean,
  "posAction" : string,
  "negAction" : string,
  "name" : string,
*/
  var unicodeRemap = {
    '2019':"'",
    '260':"A",
    '261':"a",
    '262':"C",
    '263':"c",
    '280':"E",
    '281':"e",
    '321':"L",
    '322':"l",
    '323':"N",
    '324':"n",
    '346':"S",
    '347':"s",
    '377':"Z",
    '378':"z",
    '379':"Z",
    '380':"z",
  };
  var replacer = ""; //(n)=>print('Unknown unicode '+n.toString(16));
  //if (appNames[msg.appId]) msg.a
  require("messages").pushMessage({
    t : msg.event,
    id : msg.uid,
    src : require("appmeta").getIosAppTitle(msg.appId),
    new : msg.new,
    title : msg.title&&E.decodeUTF8(msg.title, unicodeRemap, replacer),
    subject : msg.subtitle&&E.decodeUTF8(msg.subtitle, unicodeRemap, replacer),
    body : msg.message&&E.decodeUTF8(msg.message, unicodeRemap, replacer) || "Cannot display"
  });
  // TODO: posaction/negaction?
});

// Apple media service
E.on('AMS',a=>{
  function push(m) {
    var msg = { t : "modify", id : "music", title:"Music" };
    if (a.id=="artist")  msg.artist = m;
    else if (a.id=="album")  msg.album = m;
    else if (a.id=="title")  msg.track = m;
    else if (a.id=="duration")  msg.dur = m;
    else return;
    require("messages").pushMessage(msg);
  }
  if (a.truncated) NRF.amsGetMusicInfo(a.id).then(push)
  else push(a.value);
});

// Music control
Bangle.musicControl = cmd => {
  // play, pause, playpause, next, prev, volup, voldown, repeat, shuffle, skipforward, skipback, like, dislike, bookmark
  NRF.amsCommand(cmd);
};
// Message response
Bangle.messageResponse = (msg,response) => {
  if (isFinite(msg.id)) return NRF.sendANCSAction(msg.id, response);//true/false
  // error/warn here?
};
// remove all messages on disconnect
NRF.on("disconnect", () => require("messages").clearAll());

/*
// For testing...

NRF.ancsGetNotificationInfo = function(uid) {
  print("ancsGetNotificationInfo",uid);
  return Promise.resolve({
    "uid" : uid,
    "appId" : "Hangouts",
    "title" : "Hello",
    "subtitle" : "There",
    "message" : "Lots and lots of text",
    "messageSize" : 100,
    "date" : "...",
    "posAction" : "ok",
    "negAction" : "cancel",
    "name" : "Fred",
  });
};

E.emit("ANCS", {
    event:"add",
    uid:42,
    category:4,
    categoryCnt:42,
    silent:true,
    important:false,
    preExisting:true,
    positive:false,
    negative:true
});

*/
