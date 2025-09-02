bleServiceOptions.ancs = true;
bleServiceOptions.cts = true;
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
    NRF.ancsGetNotificationInfo( msg.uid ).then( info => { // success
      if(msg.preExisting === true){
        info.new = false;
      } else {
        info.new = true;
      }
      E.emit("notify", Object.assign(msg, info));
      Bangle.ancsMessageQueue.shift();
      if (Bangle.ancsMessageQueue.length)
        ancsHandler();
    }, err=>{ // failure
      console.log("ancsGetNotificationInfo failed",err);
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
  var appNames = {
    "ch.publisheria.bring": "Bring",
    "com.apple.facetime": "FaceTime",
    "com.apple.mobilecal": "Calendar",
    "com.apple.mobilemail": "Mail",
    "com.apple.mobilephone": "Phone",
    "com.apple.mobileslideshow": "Pictures",
    "com.apple.MobileSMS": "SMS Message",
    "com.apple.Passbook": "iOS Wallet",
    "com.apple.podcasts": "Podcasts",
    "com.apple.reminders": "Reminders",
    "com.apple.shortcuts": "Shortcuts",
    "com.apple.TestFlight": "TestFlight",
    "com.apple.ScreenTimeNotifications": "Screen Time",
    "com.apple.wifid.usernotification": "WiFi",
    "com.apple.Maps": "Maps",
    "com.apple.Music": "Apple Music",
    "com.apple.AppStore": "App Store",
    "com.apple.Preferences": "Settings",
    "com.apple.calculator": "Calculator",
    "com.apple.camera": "Camera",
    "com.apple.weather": "Weather",
    "com.apple.VoiceMemos": "Voice Memos",
    "com.apple.News": "News",
    "com.apple.tv": "Apple TV",
    "com.apple.findmy": "Find My",
    "com.apple.compass": "Compass",
    "com.apple.measure": "Measure",
    "com.atebits.Tweetie2": "Twitter",
    "com.burbn.instagram": "Instagram",
    "com.facebook.Facebook": "Facebook",
    "com.facebook.Messenger": "Messenger",
    "com.google.Chromecast": "Google Home",
    "com.google.Gmail": "GMail",
    "com.google.hangouts": "Hangouts",
    "com.google.ios.youtube": "YouTube",
    "com.google.ios.chrome": "Google Chrome",
    "com.google.Maps": "Google Maps",
    "com.google.Drive": "Google Drive",
    "com.google.GoogleMobile": "Google",
    "com.hammerandchisel.discord": "Discord",
    "com.ifttt.ifttt": "IFTTT",
    "com.jumbo.app": "Jumbo",
    "com.linkedin.LinkedIn": "LinkedIn",
    "com.marktplaats.iphone": "Marktplaats",
    "com.microsoft.Office.Outlook": "Outlook Mail",
    "com.microsoft.Office.Word": "Microsoft Word",
    "com.microsoft.Office.Excel": "Microsoft Excel",
    "com.microsoft.Office.Powerpoint": "Microsoft PowerPoint",
    "com.nestlabs.jasper.release": "Nest",
    "com.netflix.Netflix": "Netflix",
    "com.reddit.Reddit": "Reddit",
    "com.skype.skype": "Skype",
    "com.skype.SkypeForiPad": "Skype",
    "com.spotify.client": "Spotify",
    "com.soundcloud.TouchApp": "SoundCloud",
    "com.disney.disneyplus": "Disney+",
    "com.hbo.hbonow": "HBO Max",
    "com.amazon.Amazon": "Amazon Shopping",
    "com.amazon.AmazonVideo": "Prime Video",
    "com.dropbox.Dropbox": "Dropbox",
    "com.evernote.iPhone.Evernote": "Evernote",
    "com.trello": "Trello",
    "com.storytel.iphone": "Storytel",
    "com.strava.stravaride": "Strava",
    "com.tinyspeck.chatlyio": "Slack",
    "com.toyopagroup.picaboo": "Snapchat",
    "com.ubercab.UberClient": "Uber",
    "com.ubercab.UberEats": "UberEats",
    "com.unitedinternet.mmc.mobile.gmx.iosmailer": "GMX",
    "com.valvesoftware.Steam": "Steam",
    "com.vilcsak.bitcoin2": "Coinbase",
    "com.wordfeud.free": "WordFeud",
    "com.paypal.PPClient": "PayPal",
    "com.zhiliaoapp.musically": "TikTok",
    "com.pinterest": "Pinterest",
    "com.tumblr.tumblr": "Tumblr",
    "de.no26.Number26": "N26",
    "io.robbie.HomeAssistant": "Home Assistant",
    "net.superblock.Pushover": "Pushover",
    "net.weks.prowl": "Prowl",
    "net.whatsapp.WhatsApp": "WhatsApp",
    "nl.postnl.TrackNTrace": "PostNL",
    "org.whispersystems.signal": "Signal",
    "ph.telegra.Telegraph": "Telegram",
    "tv.twitch": "Twitch"
};

  

  //if (appNames[msg.appId]) msg.a
  if (msg.title === "BangleDumpCalendar") {
    // parse the message body into json:
    const d = JSON.parse(msg.message);
    /* Example:
    {
    "title": "Test Event",
    "start_time": "2023-11-10T11:00:00-08:00",
    "duration":"1:00:00",
    "notes": "This is a test event.",
    "location": "Stonehenge Amesbury, Wiltshire, SP4 7DE, England",
    "calName": "Home",
    "id": "1234567890"
    }
    and we want to convert to:
    {t:"calendar", id:int, type:int, timestamp:seconds, durationInSeconds, title:string, description:string,location:string,calName:string.color:int,allDay:bool
    for gadgetbridge
     */
    let calEvent = {
      t: "calendar",
      id: parseInt(d.id),
      type: 0,
      timestamp: Date.parse(d.start_time.slice(0, -5)) / 1000,
      durationInSeconds: d.duration ? d.duration.split(":").reduce((a, b) => a * 60 + parseInt(b)) : 0,
      title: d.title,
      description: d.notes,
      location: d.location,
      calName: d.calName,
      color: 0,
      allday: false
    }
    calEvent.allday = calEvent.durationInSeconds >= 24 * 56 * 60 - 1; // 24 hours for IOS is 23:59:59

    var cal = require("Storage").readJSON("android.calendar.json",true);
    if (!cal || !Array.isArray(cal)) cal = [];
    var i = cal.findIndex(e=>e.id==calEvent.id);
    if(i<0)
      cal.push(calEvent);
    else
      cal[i] = calEvent;
    cal = cal.filter(e=>e.timestamp>=Date.now()/1000);
    require("Storage").writeJSON("android.calendar.json", cal);
    NRF.ancsAction(msg.uid, false);
    return;
  }
  if (msg.title === "BangleDumpWeather") {
    const d = JSON.parse(msg.message);
    /* Example:
    {"temp":"291.07","hi":"293.02","lo":"288.18","hum":"49","rain":"0","uv":"0","wind":"1.54","code":"01d","txt":"Mostly Sunny","wdir":"303","loc":"Berlin"}
    what we want:
    t:"weather", temp,hi,lo,hum,rain,uv,code,txt,wind,wdir,loc
     */
    let weatherEvent = {
        t: "weather",
        temp: d.temp,
        feels: d.feels,
        hi: d.hi,
        lo: d.lo,
        hum: d.hum,
        rain: d.rain,
        uv: d.uv,
        code: d.code,
        txt: d.txt,
        wind: d.wind,
        wdir: d.wdir,
        loc: d.loc
    };
    // Convert string fields to numbers for iOS weather shortcut
    const numFields = ['code', 'wdir', 'temp','feels', 'hi', 'lo', 'hum', 'wind', 'uv', 'rain'];
    numFields.forEach(field => {
      if (weatherEvent[field] != null) weatherEvent[field] = +weatherEvent[field];
    });
    require("weather").update(weatherEvent);
    NRF.ancsAction(msg.uid, false);
    return;
  }
  
  if (msg.title === "BangleDumpLocation") {
    
    const d = JSON.parse(msg.message);
    
    /* Example:
    {"lat":"2912.0744", "lon":"2333.332", "city":"Chicago"}*/
    let locationJson = {
        t: "location",
        lat:d.lat,
        lon:d.lon,
        city:d.city
    
    };
    // Convert string fields to numbers
    const numFields = ['lat', 'lon'];
    numFields.forEach(field => {
      if (locationJson[field] != null) locationJson[field] = +locationJson[field];
    });
   
    //load mylocation file
    let myLocationJson = Object.assign({
      lat: d.lat,
      lon: d.lon,
      location:d.city
    }, require("Storage").readJSON("mylocation.json", true) || {});    
    //remove notification from phone
    NRF.ancsAction(msg.uid, false);
    if(Math.abs(myLocationJson.lat - locationJson.lat) < 0.0001	 && Math.abs(myLocationJson.lon -locationJson.lon) < 0.0001){
      //same location, do not write
      return;
    }
    
    myLocationJson.lon=locationJson.lon;
    myLocationJson.lat=locationJson.lat;
    myLocationJson.location=locationJson.city;
    require("Storage").write("mylocation.json",myLocationJson);
    

    return;
  }

  require("messages").pushMessage({
    t : msg.event,
    id : msg.uid,
    src : appNames[msg.appId] || msg.appId,
    new : msg.new,
    title : msg.title&&Bangle.ancsConvertUTF8(msg.title),
    subject : msg.subtitle&&Bangle.ancsConvertUTF8(msg.subtitle),
    body : msg.message&&Bangle.ancsConvertUTF8(msg.message) || "Cannot display",
    positive : msg.positive,
    negative : msg.negative
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
  if (isFinite(msg.id)) return NRF.ancsAction(msg.id, response);//true/false
  // error/warn here?
};
// remove all messages on disconnect
NRF.on("disconnect", () => {
  require("messages").clearAll();
  // Remove any messages from the ANCS queue
  Bangle.ancsMessageQueue = [];
});

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

E.on("notify", n => print("NOTIFY", n));

E.emit("ANCS", {
    event:"add",
    uid:42,
    category:4,
    categoryCnt:42,
    silent:true,
    important:false,
    preExisting:false,
    positive:false,
    negative:true
});


*/

{
  let settings = require("Storage").readJSON("ios.settings.json",1)||{};
  let ctsUpdate = e=>{
    if (process.env.VERSION=="2v19")
      e.date.setMonth(e.date.getMonth()-1); // fix for bug in 2v19 firmware
    var tz = 0;
    if (e.timezone!==undefined) {
      E.setTimeZone(e.timezone);
      tz = e.timezone*3600;
      var settings = require('Storage').readJSON('setting.json',1)||{};
      settings.timezone = e.timezone;
      require('Storage').writeJSON('setting.json',settings);
    }
    setTime((e.date.getTime()/1000) - tz);
  };
  if (settings.timeSync && NRF.ctsGetTime) {
    if (NRF.ctsIsActive())
      NRF.ctsGetTime().then(ctsUpdate, function(){ /* */ })
    E.on('CTS',ctsUpdate);
  }
  if (settings.no_utf8 || !require("Storage").read("font")) {
    // if UTF8 disabled or there is no fonts lib, convert UTF8 to ISO8859-1
    let unicodeRemap = {
      '2019':"'",
      '260':"A",
      '261':"a",
      '262':"C",
      '263':"c",
      '268':"C",
      '269':"c",
      '270':"D",
      '271':"d",
      '280':"E",
      '281':"e",
      '282':"E",
      '283':"e",
      '321':"L",
      '322':"l",
      '323':"N",
      '324':"n",
      '327':"N",
      '328':"n",
      '344':"R",
      '345':"r",
      '346':"S",
      '347':"s",
      '352':"S",
      '353':"s",
      '356':"T",
      '357':"t",
      '377':"Z",
      '378':"z",
      '379':"Z",
      '380':"z",
      '381':"Z",
      '382':"z",
    };
    let replacer = ""; //(n)=>print('Unknown unicode '+n.toString(16));
    Bangle.ancsConvertUTF8 = text => E.decodeUTF8(text, unicodeRemap, replacer);
  } else {
    Bangle.ancsConvertUTF8 = E.asUTF8;
  }
}
