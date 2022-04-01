/* MESSAGES is a list of:
  {id:int,
    src,
    title,
    subject,
    body,
    sender,
    tel:string,
    new:true // not read yet
  }
*/

/* For example for maps:

// a message
{"t":"add","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"}
// maps
{"t":"add","id":1,"src":"Maps","title":"0 yd - High St","body":"Campton - 11:48 ETA","img":"GhqBAAAMAAAHgAAD8AAB/gAA/8AAf/gAP/8AH//gD/98B//Pg/4B8f8Afv+PP//n3/f5//j+f/wfn/4D5/8Aef+AD//AAf/gAD/wAAf4AAD8AAAeAAADAAA="}
// call
{"t":"add","id":"call","src":"Phone","name":"Bob","number":"12421312",positive:true,negative:true}
*/

var Layout = require("Layout");
var settings = require('Storage').readJSON("messages.settings.json", true) || {};
var fontSmall = "6x8";
var fontMedium = g.getFonts().includes("6x15")?"6x15":"6x8:2";
var fontBig = g.getFonts().includes("12x20")?"12x20":"6x8:2";
var fontLarge = g.getFonts().includes("6x15")?"6x15:2":"6x8:4";
var active; // active screen
var openMusic = false; // go back to music screen after we handle something else?
// hack for 2v10 firmware's lack of ':size' font handling
try {
  g.setFont("6x8:2");
} catch (e) {
  g._setFont = g.setFont;
  g.setFont = function(f,s) {
    if (f.includes(":")) {
      f = f.split(":");
      return g._setFont(f[0],f[1]);
    }
    return g._setFont(f,s);
  };
}

/** this is a timeout if the app has started and is showing a single message
but the user hasn't seen it (eg no user input) - in which case
we should start a timeout for settings.unreadTimeout to return
to the clock. */
var unreadTimeout;
/// List of all our messages
var MESSAGES = require("Storage").readJSON("messages.json",1)||[];
if (!Array.isArray(MESSAGES)) MESSAGES=[];
var onMessagesModified = function(msg) {
  // TODO: if new, show this new one
  if (msg && msg.id!=="music" && msg.new && !((require('Storage').readJSON('setting.json', 1) || {}).quiet)) {
    if (WIDGETS["messages"]) WIDGETS["messages"].buzz();
    else Bangle.buzz();
  }
  if (msg && msg.id=="music") {
    if (msg.state && msg.state!="play") openMusic = false; // no longer playing music to go back to
    if (active!="music") return; // don't open music over other screens
  }
  showMessage(msg&&msg.id);
};
function saveMessages() {
  require("Storage").writeJSON("messages.json",MESSAGES)
}

function getBackImage() {
  return atob("FhYBAAAAEAAAwAAHAAA//wH//wf//g///BwB+DAB4EAHwAAPAAA8AADwAAPAAB4AAHgAB+AH/wA/+AD/wAH8AA==");
}
function getNotificationImage() {
  return atob("HBKBAD///8H///iP//8cf//j4//8f5//j/x/8//j/H//H4//4PB//EYj/44HH/Hw+P4//8fH//44///xH///g////A==");
}
function getFBIcon() {
  return atob("GBiBAAAAAAAAAAAYAAD/AAP/wAf/4A/48A/g8B/g+B/j+B/n+D/n/D8A/B8A+B+B+B/n+A/n8A/n8Afn4APnwADnAAAAAAAAAAAAAA==");
}
function getPosImage() {
  return atob("GRSBAAAAAYAAAcAAAeAAAfAAAfAAAfAAAfAAAfAAAfBgAfA4AfAeAfAPgfAD4fAA+fAAP/AAD/AAA/AAAPAAADAAAA==");
}
function getNegImage() {
  return atob("FhaBADAAMeAB78AP/4B/fwP4/h/B/P4D//AH/4AP/AAf4AB/gAP/AB/+AP/8B/P4P4fx/A/v4B//AD94AHjAAMA=");
}
/*
* icons should be 24x24px with 1bpp colors and transparancy
*/
function getMessageImage(msg) {
  if (msg.img) return atob(msg.img);
  var s = (msg.src||"").toLowerCase();
  if (s=="alarm" || s =="alarmclockreceiver") return atob("GBjBAP////8AAAAAAAACAEAHAOAefng5/5wTgcgHAOAOGHAMGDAYGBgYGBgYGBgYGBgYDhgYBxgMATAOAHAHAOADgcAB/4AAfgAAAAAAAAA=");
  if (s=="calendar") return atob("GBiBAAAAAAAAAAAAAA//8B//+BgAGBgAGBgAGB//+B//+B//+B9m2B//+B//+Btm2B//+B//+Btm+B//+B//+A//8AAAAAAAAAAAAA==");
  if (s=="facebook") return getFBIcon();
  if (s=="hangouts") return atob("FBaBAAH4AH/gD/8B//g//8P//H5n58Y+fGPnxj5+d+fmfj//4//8H//B//gH/4A/8AA+AAHAABgAAAA=");
  if (s=="home assistant") return atob("FhaBAAAAAADAAAeAAD8AAf4AD/3AfP8D7fwft/D/P8ec572zbzbNsOEhw+AfD8D8P4fw/z/D/P8P8/w/z/AAAAA=");
  if (s=="instagram") return atob("GBiBAAAAAAAAAAAAAAAAAAP/wAYAYAwAMAgAkAh+EAjDEAiBEAiBEAiBEAiBEAjDEAh+EAgAEAwAMAYAYAP/wAAAAAAAAAAAAAAAAA==");
  if (s=="gmail") return getNotificationImage();
  if (s=="google home") return atob("GBiCAAAAAAAAAAAAAAAAAAAAAoAAAAAACqAAAAAAKqwAAAAAqroAAAACquqAAAAKq+qgAAAqr/qoAACqv/6qAAKq//+qgA6r///qsAqr///6sAqv///6sAqv///6sAqv///6sA6v///6sA6v///qsA6qqqqqsA6qqqqqsA6qqqqqsAP7///vwAAAAAAAAAAAAAAAAA==");
  if (s=="mail") return getNotificationImage();
  if (s=="messenger") return getFBIcon();
  if (s=="outlook mail") return getNotificationImage();
  if (s=="phone") return atob("FxeBABgAAPgAAfAAB/AAD+AAH+AAP8AAP4AAfgAA/AAA+AAA+AAA+AAB+AAB+AAB+OAB//AB//gB//gA//AA/8AAf4AAPAA=");
  if (s=="skype") return atob("GhoBB8AAB//AA//+Af//wH//+D///w/8D+P8Afz/DD8/j4/H4fP5/A/+f4B/n/gP5//B+fj8fj4/H8+DB/PwA/x/A/8P///B///gP//4B//8AD/+AAA+AA==");
  if (s=="slack") return atob("GBiBAAAAAAAAAABAAAHvAAHvAADvAAAPAB/PMB/veD/veB/mcAAAABzH8B3v+B3v+B3n8AHgAAHuAAHvAAHvAADGAAAAAAAAAAAAAA==");
  if (s=="sms message") return getNotificationImage();
  if (s=="threema") return atob("GBjB/4Yx//8AAAAAAAAAAAAAfgAB/4AD/8AH/+AH/+AP//AP2/APw/APw/AHw+AH/+AH/8AH/4AH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
  if (s=="twitter") return atob("GhYBAABgAAB+JgA/8cAf/ngH/5+B/8P8f+D///h///4f//+D///g///wD//8B//+AP//gD//wAP/8AB/+AB/+AH//AAf/AAAYAAA");
  if (s=="telegram") return atob("GBiBAAAAAAAAAAAAAAAAAwAAHwAA/wAD/wAf3gD/Pgf+fh/4/v/z/P/H/D8P/Acf/AM//AF/+AF/+AH/+ADz+ADh+ADAcAAAMAAAAA==");
  if (s=="whatsapp") return atob("GBiBAAB+AAP/wAf/4A//8B//+D///H9//n5//nw//vw///x///5///4///8e//+EP3/APn/wPn/+/j///H//+H//8H//4H//wMB+AA==");
  if (s=="wordfeud") return atob("GBgCWqqqqqqlf//////9v//////+v/////++v/////++v8///Lu+v8///L++v8///P/+v8v//P/+v9v//P/+v+fx/P/+v+Pk+P/+v/PN+f/+v/POuv/+v/Ofdv/+v/NvM//+v/I/Y//+v/k/k//+v/i/w//+v/7/6//+v//////+v//////+f//////9Wqqqqqql");
  if (msg.id=="music") return atob("FhaBAH//+/////////////h/+AH/4Af/gB/+H3/7/f/v9/+/3/7+f/vB/w8H+Dwf4PD/x/////////////3//+A=");
  if (msg.id=="back") return getBackImage();
  return getNotificationImage();
}
function getMessageImageCol(msg,def) {
  return {
    // generic colors, using B2-safe colors
    "alarm": "#fff",
    "calendar": "#f00",
    "mail": "#ff0",
    "music": "#f0f",
    "phone": "#0f0",
    "sms message": "#0ff",
    // brands, according to https://www.schemecolor.com/?s (picking one for multicolored logos)
    // all dithered on B2, but we only use the color for the icons.  (Could maybe pick the closest 3-bit color for B2?)
    "facebook": "#4267b2",
    "gmail": "#ea4335",
    "google home": "#fbbc05",
    "home assistant": "#fff", // ha-blue is #41bdf5, but that's the background
    "hangouts": "#1ba261",
    "instagram": "#dd2a7b",
    "messenger": "#0078ff",
    "outlook mail": "#0072c6",
    "skype": "#00aff0",
    "slack": "#e51670",
    "threema": "#000",
    "telegram": "#0088cc",
    "twitter": "#1da1f2",
    "whatsapp": "#4fce5d",
    "wordfeud": "#e7d3c7",
  }[(msg.src||"").toLowerCase()]||(def !== undefined?def:g.theme.fg);
}

function showMapMessage(msg) {
  active = "map";
  var m;
  var distance, street, target, eta;
  m=msg.title.match(/(.*) - (.*)/);
  if (m) {
    distance = m[1];
    street = m[2];
  } else street=msg.title;
  m=msg.body.match(/(.*) - (.*)/);
  if (m) {
    target = m[1];
    eta = m[2];
  } else target=msg.body;
  layout = new Layout({ type:"v", c: [
    {type:"txt", font:fontMedium, label:target, bgCol:g.theme.bg2, col: g.theme.fg2, fillx:1, pad:2 },
    {type:"h", bgCol:g.theme.bg2, col: g.theme.fg2,  fillx:1, c: [
      {type:"txt", font:"6x8", label:"Towards" },
      {type:"txt", font:fontLarge, label:street }
    ]},
    {type:"h",fillx:1, filly:1, c: [
      msg.img?{type:"img",src:atob(msg.img), scale:2}:{},
      {type:"v", fillx:1, c: [
        {type:"txt", font:fontLarge, label:distance||"" }
      ]},
    ]},
    {type:"txt", font:"6x8:2", label:eta }
  ]});
  g.clearRect(Bangle.appRect);
  layout.render();
  Bangle.setUI("updown",function() {
    // any input to mark as not new and return to menu
    msg.new = false;
    saveMessages();
    layout = undefined;
    checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1,openMusic:0});
  });
}

var updateLabelsInterval;
function showMusicMessage(msg) {
  active = "music";
  openMusic = msg.state=="play";
  var trackScrollOffset = 0;
  var artistScrollOffset = 0;
  var albumScrollOffset = 0;
  var trackName = '';
  var artistName = '';
  var albumName = '';

  function fmtTime(s) {
    var m = Math.floor(s/60);
    s = (parseInt(s%60)).toString().padStart(2,0);
    return m+":"+s;
  }
  function reduceStringAndPad(text, offset, maxLen) {
    var sliceLength = offset + maxLen > text.length ? text.length - offset : maxLen;
    return text.substr(offset, sliceLength).padEnd(maxLen, " ");
  }


  function back() {
    clearInterval(updateLabelsInterval);
    updateLabelsInterval = undefined;
    openMusic = false;
    var wasNew = msg.new;
    msg.new = false;
    saveMessages();
    layout = undefined;
    if (wasNew) checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:0,openMusic:0});
    else checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
  }
  function updateLabels() {
    trackName = reduceStringAndPad(msg.track, trackScrollOffset, 13);
    artistName = reduceStringAndPad(msg.artist, artistScrollOffset, 21);
    albumName = reduceStringAndPad(msg.album, albumScrollOffset, 21);

    trackScrollOffset++;
    artistScrollOffset++;
    albumScrollOffset++;

    if ((trackScrollOffset + 13) > msg.track.length) trackScrollOffset = 0;
    if ((artistScrollOffset + 21) > msg.artist.length) artistScrollOffset = 0;
    if ((albumScrollOffset + 21) > msg.album.length) albumScrollOffset = 0;
  }
  updateLabels();

  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:g.theme.bg2, col: g.theme.fg2,  c: [
      { type:"btn", src:getBackImage, cb:back },
      { type:"v", fillx:1, c: [
        { type:"txt", font:fontMedium, bgCol:g.theme.bg2, label:artistName, pad:2, id:"artist" },
        { type:"txt", font:fontMedium, bgCol:g.theme.bg2, label:albumName, pad:2, id:"album" }
      ]}
    ]},
    {type:"txt", font:fontLarge, bgCol:g.theme.bg, label:trackName, fillx:1, filly:1, pad:2, id:"track" },
    Bangle.musicControl?{type:"h",fillx:1, c: [
      {type:"btn", pad:8, label:"\0"+atob("FhgBwAADwAAPwAA/wAD/gAP/gA//gD//gP//g///j///P//////////P//4//+D//gP/4A/+AD/gAP8AA/AADwAAMAAA"), cb:()=>Bangle.musicControl("play")}, // play
      {type:"btn", pad:8, label:"\0"+atob("EhaBAHgHvwP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP3gHg"), cb:()=>Bangle.musicControl("pause")}, // pause
      {type:"btn", pad:8, label:"\0"+atob("EhKBAMAB+AB/gB/wB/8B/+B//B//x//5//5//x//B/+B/8B/wB/gB+AB8ABw"), cb:()=>Bangle.musicControl("next")}, // next
    ]}:{},
    {type:"txt", font:"6x8:2", label:msg.dur?fmtTime(msg.dur):"--:--" }
  ]});
  g.clearRect(Bangle.appRect);
  layout.render();

  updateLabelsInterval = setInterval(function() {
    updateLabels();
    layout.artist.label = artistName;
    layout.album.label = albumName;
    layout.track.label = trackName;
    layout.render();
  }, 400);
}

function showMessageScroller(msg) {
  active = "scroller";
  var bodyFont = fontBig;
  g.setFont(bodyFont);
  var lines = [];
  if (msg.title) lines = g.wrapString(msg.title, g.getWidth()-10)
  var titleCnt = lines.length;
  if (titleCnt) lines.push(""); // add blank line after title
  lines = lines.concat(g.wrapString(msg.body, g.getWidth()-10),["",/*LANG*/"< Back"]);
  E.showScroller({
    h : g.getFontHeight(), // height of each menu item in pixels
    c : lines.length, // number of menu items
    // a function to draw a menu item
    draw : function(idx, r) {
      // FIXME: in 2v13 onwards, clearRect(r) will work fine. There's a bug in 2v12
      g.setBgColor(idx<titleCnt ? g.theme.bg2 : g.theme.bg).
        setColor(idx<titleCnt ? g.theme.fg2 : g.theme.fg).
        clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
      g.setFont(bodyFont).drawString(lines[idx], r.x, r.y);
    }, select : function(idx) {
      if (idx>=lines.length-2)
        showMessage(msg.id);
    }
  });
  // ensure button-press on Bangle.js 2 takes us back
  if (process.env.HWVERSION>1) Bangle.btnWatches = [
    setWatch(() => showMessage(msg.id), BTN1, {repeat:1,edge:"falling"})
  ];
}

function showMessageSettings(msg) {
  active = "settings";
  E.showMenu({"":{"title":/*LANG*/"Message"},
    "< Back" : () => showMessage(msg.id),
    /*LANG*/"View Message" : () => {
      showMessageScroller(msg);
    },
    /*LANG*/"Delete" : () => {
      MESSAGES = MESSAGES.filter(m=>m.id!=msg.id);
      saveMessages();
      checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
    },
    /*LANG*/"Mark Unread" : () => {
      msg.new = true;
      saveMessages();
      checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
    },
    /*LANG*/"Mark all read" : () => {
      MESSAGES.forEach(msg => msg.new = false);
      saveMessages();
      checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
    },
    /*LANG*/"Delete all messages" : () => {
      E.showPrompt(/*LANG*/"Are you sure?", {title:/*LANG*/"Delete All Messages"}).then(isYes => {
        if (isYes) {
          MESSAGES = [];
          saveMessages();
        }
        checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
      });
    },
  });
}

function showMessage(msgid) {
  var msg = MESSAGES.find(m=>m.id==msgid);
  if (updateLabelsInterval) {
    clearInterval(updateLabelsInterval);
    updateLabelsInterval=undefined;
  }
  if (!msg) return checkMessages({clockIfNoMsg:1,clockIfAllRead:0,showMsgIfUnread:0,openMusic:openMusic}); // go home if no message found
  if (msg.id=="music") {
    cancelReloadTimeout(); // don't auto-reload to clock now
    return showMusicMessage(msg);
  }
  if (msg.src=="Maps") {
    cancelReloadTimeout(); // don't auto-reload to clock now
    return showMapMessage(msg);
  }
  active = "message";
  // Normal text message display
  var title=msg.title, titleFont = fontLarge, lines;
  if (title) {
    var w = g.getWidth()-48;
    if (g.setFont(titleFont).stringWidth(title) > w) {
      titleFont = fontBig;
      if (settings.fontSize!=1 && g.setFont(titleFont).stringWidth(title) > w)
        titleFont = fontMedium;
    }
    if (g.setFont(titleFont).stringWidth(title) > w) {
      lines = g.wrapString(title, w);
      title = (lines.length>2) ? lines.slice(0,2).join("\n")+"..." : lines.join("\n");
    }
  }
  // If body of message is only two lines long w/ large font, use large font.
  var body=msg.body, bodyFont = fontLarge;
  if (body) {
    var w = g.getWidth()-10;
    if (g.setFont(bodyFont).stringWidth(body) > w * 2) {
      bodyFont = fontBig;
      if (settings.fontSize!=1 && g.setFont(bodyFont).stringWidth(body) > w * 3)
        bodyFont = fontMedium;
    }
    if (g.setFont(bodyFont).stringWidth(body) > w) {
      lines = g.setFont(bodyFont).wrapString(msg.body, w);
      var maxLines = Math.floor((g.getHeight()-110) / g.getFontHeight());
      body = (lines.length>maxLines) ? lines.slice(0,maxLines).join("\n")+"..." : lines.join("\n");
    }
  }
  function goBack() {
    msg.new = false; saveMessages(); // read mail
    cancelReloadTimeout(); // don't auto-reload to clock now
    checkMessages({clockIfNoMsg:1,clockIfAllRead:0,showMsgIfUnread:0,openMusic:openMusic});
  }
  var buttons = [
    {type:"btn", src:getBackImage(), cb:goBack} // back
  ];
  if (msg.positive) {
    buttons.push({fillx:1});
    buttons.push({type:"btn", src:getPosImage(), cb:()=>{
      msg.new = false; saveMessages();
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,true);
      checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1,openMusic:openMusic});
    }});
  }
  if (msg.negative) {
    buttons.push({fillx:1});
    buttons.push({type:"btn", src:getNegImage(), cb:()=>{
      msg.new = false; saveMessages();
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,false);
      checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1,openMusic:openMusic});
    }});
  }


  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:g.theme.bg2, col: g.theme.fg2,  c: [
      { type:"btn", src:getMessageImage(msg), col:getMessageImageCol(msg), pad: 3, cb:()=>{
        cancelReloadTimeout(); // don't auto-reload to clock now
        showMessageSettings(msg);
      }},
      { type:"v", fillx:1, c: [
        {type:"txt", font:fontSmall, label:msg.src||/*LANG*/"Message", bgCol:g.theme.bg2, col: g.theme.fg2, fillx:1, pad:2, halign:1 },
        title?{type:"txt", font:titleFont, label:title, bgCol:g.theme.bg2, col: g.theme.fg2, fillx:1, pad:2 }:{},
      ]},
    ]},
    {type:"txt", font:bodyFont, label:body, fillx:1, filly:1, pad:2, cb:()=>{
      // allow tapping to show a larger version
      showMessageScroller(msg);
    } },
    {type:"h",fillx:1, c: buttons}
  ]});
  g.clearRect(Bangle.appRect);
  layout.render();
  // ensure button-press on Bangle.js 2 takes us back
  if (process.env.HWVERSION>1) Bangle.btnWatches = [
    setWatch(goBack, BTN1, {repeat:1,edge:"falling"})
  ];
}


/* options = {
  clockIfNoMsg : bool
  clockIfAllRead : bool
  showMsgIfUnread : bool
}
*/
function checkMessages(options) {
  options=options||{};
  // If no messages, just show 'no messages' and return
  if (!MESSAGES.length) {
    if (!options.clockIfNoMsg) return E.showPrompt(/*LANG*/"No Messages",{
      title:/*LANG*/"Messages",
      img:require("heatshrink").decompress(atob("kkk4UBrkc/4AC/tEqtACQkBqtUDg0VqAIGgoZFDYQIIM1sD1QAD4AIBhnqA4WrmAIBhc6BAWs8AIBhXOBAWz0AIC2YIC5wID1gkB1c6BAYFBEQPqBAYXBEQOqBAnDAIQaEnkAngaEEAPDFgo+IKA5iIOhCGIAFb7RqAIGgtUBA0VqobFgNVA")),
      buttons : {/*LANG*/"Ok":1}
    }).then(() => { load() });
    return load();
  }
  // we have >0 messages
  var newMessages = MESSAGES.filter(m=>m.new&&m.id!="music");
  // If we have a new message, show it
  if (options.showMsgIfUnread && newMessages.length)
    return showMessage(newMessages[0].id);
  // no new messages: show playing music? (only if we have playing music to show)
  if (options.openMusic && MESSAGES.some(m=>m.id=="music" && m.track && m.state=="play"))
    return showMessage('music');
  // no new messages - go to clock?
  if (options.clockIfAllRead && newMessages.length==0)
    return load();
  // we don't have to time out of this screen...
  cancelReloadTimeout();
  active = "main";
  // Otherwise show a menu
  E.showScroller({
    h : 48,
    c : Math.max(MESSAGES.length+1,3), // workaround for 2v10.219 firmware (min 3 not needed for 2v11)
    draw : function(idx, r) {"ram"
      var msg = MESSAGES[idx-1];
      if (msg && msg.new) g.setBgColor(g.theme.bgH).setColor(g.theme.fgH);
      else g.setColor(g.theme.fg);
      if (idx==0) msg = {id:"back", title:"< Back"};
      if (!msg) return;
      var x = r.x+2, title = msg.title, body = msg.body;
      var img = getMessageImage(msg);
      if (msg.id=="music") {
        title = msg.artist || /*LANG*/"Music";
        body = msg.track;
      }
      if (img) {
        var fg = g.getColor();
        g.setColor(getMessageImageCol(msg,fg)).drawImage(img, x+24, r.y+24, {rotate:0}) // force centering
         .setColor(fg); // only color the icon
        x += 50;
      }
      var m = msg.title+"\n"+msg.body, longBody=false;
      if (title) g.setFontAlign(-1,-1).setFont(fontBig).drawString(title, x,r.y+2);
      if (body) {
        g.setFontAlign(-1,-1).setFont("6x8");
        var l = g.wrapString(body, r.w-(x+14));
        if (l.length>3) {
          l = l.slice(0,3);
          l[l.length-1]+="...";
        }
        longBody = l.length>2;
        g.drawString(l.join("\n"), x+10,r.y+20);
      }
      if (!longBody && msg.src) g.setFontAlign(1,1).setFont("6x8").drawString(msg.src, r.x+r.w-2, r.y+r.h-2);
      g.setColor("#888").fillRect(r.x,r.y+r.h-1,r.x+r.w-1,r.y+r.h-1); // dividing line between items
    },
    select : idx => {
      if (idx==0) load();
      else showMessage(MESSAGES[idx-1].id);
    }
  });
}

function cancelReloadTimeout() {
  if (!unreadTimeout) return;
  clearTimeout(unreadTimeout);
  unreadTimeout = undefined;
}


g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
setTimeout(() => {
  var unreadTimeoutSecs = settings.unreadTimeout;
  if (unreadTimeoutSecs===undefined) unreadTimeoutSecs=60;
  if (unreadTimeoutSecs)
    unreadTimeout = setTimeout(function() {
      print("Message not seen - reloading");
      load();
    }, unreadTimeoutSecs*1000);
  // only openMusic on launch if music is new
  var newMusic = MESSAGES.some(m=>m.id==="music"&&m.new);
  checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:1,openMusic:newMusic&&settings.openMusic});
},10); // if checkMessages wants to 'load', do that
