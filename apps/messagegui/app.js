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
require("messages").pushMessage({"t":"add","id":1575479849,"src":"WhatsApp","title":"My Friend","body":"Hey! How's everything going?",reply:1,negative:1})
require("messages").pushMessage({"t":"add","id":1575479850,"src":"Skype","title":"My Friend","body":"Hey! How's everything going? This is a really really long message that is really so super long you'll have to scroll it lots and lots",positive:1,negative:1})
require("messages").pushMessage({"t":"add","id":23232,"src":"Skype","title":"Mr. Bobby McBobFace","body":"Boopedy-boop",positive:1,negative:1})
require("messages").pushMessage({"t":"add","id":23233,"src":"Skype","title":"Thyttan test","body":"Nummerplåtsbelysning trodo",positive:1,negative:1})
require("messages").pushMessage({"t":"add","id":23234,"src":"Skype","title":"Thyttan test 2","body":"Nummerplåtsbelysning trodo Nummerplåtsbelysning trodo Nummerplåtsbelysning trodo Nummerplåtsbelysning trodo Nummerplåtsbelysning trodo Nummerplåtsbelysning trodo",positive:1,negative:1})
// maps
GB({t:"nav",src:"maps",title:"Navigation",instr:"High St towards Tollgate Rd",distance:"966m",action:"continue",eta:"08:39"})
GB({t:"nav",src:"maps",title:"Navigation",instr:"High St",distance:"12km",action:"left_slight",eta:"08:39"})
GB({t:"nav",src:"maps",title:"Navigation",instr:"Main St / I-29 ALT / Centerpoint Dr",distance:12345,action:"left_slight",eta:"08:39"})
// call
require("messages").pushMessage({"t":"add","id":"call","src":"Phone","title":"Bob","body":"12421312",positive:true,negative:true})
*/
var Layout = require("Layout");
var layout; // global var containing the layout for the currently displayed message
var settings = require('Storage').readJSON("messages.settings.json", true) || {};
var reply;
try { reply = require("reply"); } catch (e) {}
var fontList = g.getFonts();
var fontSmall = fontList.includes("14")?"14":"6x8";
var fontMedium = fontList.includes("17")?"17":(fontList.includes("6x15")?"6x15":"6x8:2");
var fontBig = fontList.includes("22")?"22":(fontList.includes("12x20")?"12x20":"6x8:2");
var fontLarge = fontList.includes("28")?"28":(fontList.includes("6x15")?"6x15:2":"6x8:4");
var fontVLarge = fontList.includes("22")?"22:2":(fontList.includes("6x15")?"12x20:2":"6x8:5");

// If a font library is installed, just switch to using that for everything in messages
if (Graphics.prototype.setFontIntl) {
  fontSmall = "Intl";
  fontMedium = "Intl";
  fontBig = "Intl";
  /* 2v21 and before have a bug where the scale factor for PBF fonts wasn't
  taken into account in metrics, so we can't have big fonts on those firmwares.
  Having 'PBF' listed as a font was a bug fixed at the same time so we check for that. */
  let noScale = g.getFonts().includes("PBF");
  fontLarge = noScale?"Intl":"Intl:2";
  fontVLarge = noScale?"Intl":"Intl:3";
}

var active; // active screen (undefined/"list"/"music"/"map"/"message"/"scroller"/"settings")
var openMusic = false; // go back to music screen after we handle something else?
var replying = false; // If we're replying to a message, don't interrupt

/** this is a timeout if the app has started and is showing a single message
but the user hasn't seen it (eg no user input) - in which case
we should start a timeout for settings.unreadTimeout to return
to the clock. */
var unreadTimeout;
/// List of all our messages
var MESSAGES = require("messages").getMessages();
if (Bangle.MESSAGES) {
  // fast loading messages
  Bangle.MESSAGES.forEach(m => require("messages").apply(m, MESSAGES));
  delete Bangle.MESSAGES;
}

var onMessagesModified = function(type,msg) {
  if (msg.handled) return;
  msg.handled = true;
  require("messages").apply(msg, MESSAGES);
  // TODO: if new, show this new one
  if (msg && msg.id!=="music" && msg.id!=="nav" && msg.new &&
      !((require('Storage').readJSON('setting.json', 1) || {}).quiet)) {
    require("messages").buzz(msg.src);
  }
  if (msg && msg.id=="music") {
    if (msg.state && msg.state!="play") openMusic = false; // no longer playing music to go back to
    if ((active!=undefined) && (active!="list") && (active!="music")) return; // don't open music over other screens (but do if we're in the main menu)
  }
  if (msg && msg.id=="nav" && msg.t=="modify" && active!="map")
    return; // don't show an updated nav message if we're just in the menu
  showMessage(msg&&msg.id, false);
};
Bangle.on("message", onMessagesModified);

function saveMessages() {
  require("messages").write(MESSAGES);
}
E.on("kill", saveMessages);

/* Listens to drag events to allow the user to swipe up/down to change message on Bangle.js 2
returns dragHandler which should then be removed with Bangle.removeListener("drah", dragHandler); on exit */
function addDragHandlerToChangeMessage(idx, scroller) {
  // save the scroll pos when finger pressed
  let lastTouched=false, lastScrollPos=0, scrollY=0;
  let dragHandler = (e) => {
    let scrollPos = scroller?scroller.scroll:0;
    if (e.b) {
      if (!lastTouched) lastScrollPos = scrollPos;
      scrollY += e.dy;
    }
    lastTouched = e.b;
    // swipe up down to prev/next but ONLY when finger released and if we're already at the top/bottom => scroller hasn't moved
    if (!e.b && scrollPos==lastScrollPos) {
      if (scrollY<-50 && idx<MESSAGES.length-1) {
        Bangle.buzz(30);
        showMessage(MESSAGES[idx+1].id, true);
      }
      if (scrollY>50 && idx>0) {
        Bangle.buzz(30);
        showMessage(MESSAGES[idx-1].id, true);
      }
      scrollY = 0;
    }
  };
  Bangle.on("drag", dragHandler);
  return dragHandler;
}

function showMapMessage(msg) {
  active = "map";
  require("messages").stopBuzz(); // stop repeated buzzing while the map is showing
  var m, distance, street, target, img;
  if ("string"==typeof msg.distance) // new gadgetbridge
    distance = msg.distance;
  else if ("number"==typeof msg.distance) // 0.74 gadgetbridge
    distance = require("locale").distance(msg.distance);
  if (msg.instr) {
    var instr = msg.instr.replace(/\s*\/\s*/g," \/\n"); // convert slashes to newlines
    if (instr.includes("towards") || instr.includes("toward")) {
      m = instr.split(/towards|toward/);
      target = m[0].trim();
      street = m[1].trim();
    }else
      target = instr;
  }
  var carIsRHD = !!settings.carIsRHD;
  switch (msg.action) {
  case "continue": img = "EBgBAIABwAPgD/Af+D/8f/773/PPY8cDwAPAA8ADwAPAA8AAAAPAA8ADwAAAA8ADwAPA";break;
  case "left": img = "GhcBAYAAAPAAAHwAAD4AAB8AAA+AAAf//8P///x///+PAAPx4AA8fAAHD4ABwfAAcDwAHAIABwAAAcAAAHAAABwAAAcAAAHAAABwAAAc";break;
  case "right": img = "GhcBAABgAAA8AAAPgAAB8AAAPgAAB8D///j///9///+/AAPPAAHjgAD44AB8OAA+DgAPA4ABAOAAADgAAA4AAAOAAADgAAA4AAAOAAAA";break;
  case "left_slight": img = "ERgB//B/+D/8H4AP4Af4A74Bz4Dj4HD4OD4cD4AD4ADwADwADgAHgAPAAOAAcAA4ABwADgAH";break;
  case "right_slight": img = "ERgBB/+D/8H/4APwA/gD/APuA+cD44Phw+Dj4HPgAeAB4ADgAPAAeAA4ABwADgAHAAOAAcAA";break;
  case "left_sharp": img = "GBaBAAAA+AAB/AAH/gAPjgAeBwA8BwB4B+DwB+HgB+PAB+eAB+8AB+4AB/wAB/gAB//gB//gB//gBwAABwAABwAABwAABw=="; break;
  case "right_sharp": img = "GBaBAB8AAD+AAH/gAHHwAOB4AOA8AOAeAOAPB+AHh+ADx+AB5+AA9+AAd+AAP+AAH+AH/+AH/+AH/+AAAOAAAOAAAOAAAA==";break;
  case "keep_left": img = "ERmBAACAAOAB+AD+AP+B/+H3+PO+8c8w4wBwADgAHgAPAAfAAfAAfAAfAAeAAeAAcAA8AA4ABwADgA==";break;
  case "keep_right": img = "ERmBAACAAOAA/AD+AP+A//D/fPueeceY4YBwADgAPAAeAB8AHwAfAB8ADwAPAAcAB4ADgAHAAOAAAA==";break;
  case "uturn_left": img = "GRiBAAAH4AAP/AAP/wAPj8APAfAPAHgHgB4DgA8BwAOA4AHAcADsOMB/HPA7zvgd9/gOf/gHH/gDh/gBwfgA4DgAcBgAOAAAHAAADgAABw==";break;
  case "uturn_right": img = "GRiBAAPwAAf+AAf/gAfj4AfAeAPAHgPADwHgA4DgAcBwAOA4AHAcBjhuB5x/A+57gP99wD/84A/8cAP8OAD8HAA4DgAMBwAAA4AAAcAAAA==";break;
  case "finish": img = "HhsBAcAAAD/AAAH/wAAPB4AAeA4AAcAcAAYIcAA4cMAA48MAA4cMAAYAcAAcAcAAcA4AAOA4AAOBxjwHBzjwHjj/4Dnn/4B3P/4B+Pj4A8fj8Acfj8AI//8AA//+AA/j+AB/j+AB/j/A";break;
  case "roundabout_left": img = carIsRHD ? "HBaCAAADwAAAAAAAD/AAAVUAAD/wABVVUAD/wABVVVQD/wAAVABUD/wAAVAAFT/////wABX/////8AAF//////AABT/////wABUP/AAD/AAVA/8AA/8AVAD/wAD//VQAP/AAP/1QAA/wAA/9AAADwAAD/AAAAAAAA/wAAAAAAAP8AAAAAAAD/AAAAAAAA/wAAAAAAAP8AAAAAAAD/AA=" : "HRYCAAPAAAAAAAAD/AAD//AAA/8AD///AAP/AA////AD/wAD/wP/A/8AA/wAP8P/////AAP//////8AA///////AAD/P////8AAP8P/AABUAD/AP/AAFUA/8AP/AAFX//AAP/AAFf/wAAP8AAB/8AAAPAAAD8AAAAAAAAPwAAAAAAAA/AAAAAAAAD8AAAAAAAAPwAAAAAAAA/AAAAAAAAD8AAA==";break;
  case "roundabout_right": img = carIsRHD ? "HRaCAAAAAAAA8AAAP/8AAP8AAD///AA/8AA////AA/8AP/A/8AA/8A/wAP8AA/8P8AA/////8/wAD///////AAD//////8AAP////8P8ABUAAP/A/8AVQAD/wA//1UAA/8AA//VAAP/AAA/9AAA/wAAAPwAAA8AAAA/AAAAAAAAD8AAAAAAAAPwAAAAAAAA/AAAAAAAAD8AAAAAAAAPwAAAAAAA=" : "HBYCAAAAAAPAAABVQAAP8AAFVVQAD/wAFVVVAAP/ABUAFQAA/8BUAAVAAD/wVAAP/////FAAD/////9QAA//////VAAP/////FQAP8AAP/AVAP/AAP/AFX//AAP/AAV//AAP/AAAf/AAD/AAAD/AAAPAAAA/wAAAAAAAP8AAAAAAAD/AAAAAAAA/wAAAAAAAP8AAAAAAAD/AAAAAAA==";break;
  case "roundabout_straight": img = carIsRHD ? "EBuCAAADwAAAD/AAAD/8AAD//wAD///AD///8D/P8/z/D/D//A/wPzAP8AwA//UAA//1QA//9VA/8AFUP8AAVD8AAFQ/AABUPwAAVD8AAFQ/wABUP/ABVA//9VAD//VAAP/1AAAP8AAAD/AAAA/wAA==" : "EBsCAAPAAAAP8AAAP/wAAP//AAP//8AP///wP8/z/P8P8P/8D/A/MA/wDABf/wABX//ABV//8BVAD/wVAAP8FQAA/BUAAPwVAAD8FQAA/BUAA/wVQA/8BV//8AFf/8AAX/8AAA/wAAAP8AAAD/AA";break;
  case "roundabout_uturn": img = carIsRHD ? "ICCBAAAAAAAAAAAAAAAAAAAP4AAAH/AAAD/4AAB4fAAA8DwAAPAcAADgHgAA4B4AAPAcAADwPAAAeHwAADz4AAAc8AAABPAAAADwAAAY8YAAPPPAAD73gAAf/4AAD/8AABf8AAAb+AAAHfAAABzwAAAcYAAAAAAAAAAAAAAAAAAAAAAA" : "ICABAAAAAAAAAAAAAAAAAAfwAAAP+AAAH/wAAD4eAAA8DwAAOA8AAHgHAAB4BwAAOA8AADwPAAA+HgAAHzwAAA84AAAPIAAADwAAAY8YAAPPPAAB73wAAf/4AAD/8AAAP+gAAB/YAAAPuAAADzgAAAY4AAAAAAAAAAAAAAAAAAAAAAA=";break;
  }

  layout = new Layout({ type:"v", c: [
    {type:"txt", font:street?fontMedium:fontLarge, label:target, bgCol:g.theme.bg2, col: g.theme.fg2, fillx:1, pad:3 },
    street?{type:"h", bgCol:g.theme.bg2, col: g.theme.fg2,  fillx:1, c: [
      {type:"txt", font:fontSmall, label:"Towards" },
      {type:"txt", font:fontLarge, label:street }
    ]}:{type:""},
    {type:"h",fillx:1, filly:1, c: [
      img?{type:"img",src:atob(img), scale:2, pad:6}:{type:""},
      {type:"v", fillx:1, c: [
        {type:"txt", font:fontVLarge, label:distance||"" }
      ]},
    ]},
    {type:"txt", font:fontMedium, label:msg.eta?`ETA ${msg.eta}`:"" }
  ]}, { back : function() { // mark as not new and return to menu
    msg.new = false;
    layout = undefined;
    checkMessages({clockIfNoMsg:1,clockIfAllRead:1,ignoreUnread:settings.ignoreUnread,openMusic:0});
  }, remove : function() {
    Bangle.removeListener("drag", dragHandler);
  }});
  g.reset().clearRect(Bangle.appRect);
  layout.render();
  // handle up/down to drag to new message
  let dragHandler = addDragHandlerToChangeMessage(MESSAGES.findIndex(m=>m==msg));
}



function showMusicMessage(msg) {
  active = "music";
  // defaults, so e.g. msg.xyz.length doesn't error. `msg` should contain up to date info
  msg.artist = msg.artist||"";
  msg.album = msg.album||"";
  msg.track = msg.track||"Music";
  openMusic = msg.state=="play";
  var trackScrollOffset = 0;
  var artistScrollOffset = 0;
  var albumScrollOffset = 0;
  var trackName = '';
  var artistName = '';
  var albumName = '';
  var updateLabelsInterval;

  function fmtTime(s) {
    var m = Math.floor(s/60);
    s = (parseInt(s%60)).toString().padStart(2,0);
    return m+":"+s;
  }
  function reduceStringAndPad(text, offset, maxLen) {
    var sliceLength = offset + maxLen > text.length ? text.length - offset : maxLen;
    return text.substr(offset, sliceLength).padEnd(maxLen, " ");
  }
  function unload() {
    if (updateLabelsInterval)
      clearInterval(updateLabelsInterval);
    updateLabelsInterval = undefined;
    Bangle.removeListener("drag", dragHandler);
  }
  function back() {
    unload();
    openMusic = false;
    var wasNew = msg.new;
    msg.new = false;
    layout = undefined;
    if (wasNew) checkMessages({clockIfNoMsg:1,clockIfAllRead:1,ignoreUnread:1,openMusic:0});
    else returnToMain();
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
      { type:"v", fillx:1, c: [
        { type:"txt", font:fontMedium, bgCol:g.theme.bg2, label:artistName, pad:2, id:"artist" },
        { type:"txt", font:fontMedium, bgCol:g.theme.bg2, label:albumName, pad:2, id:"album" }
      ]},
      { type:"img", pad:4, src:require("messageicons").getImage(msg),
        cb:()=>{
          unload();
          showMessageSettings(msg);
        }
      }
    ]},
    {type:"txt", font:fontLarge, bgCol:g.theme.bg, label:trackName, fillx:1, filly:1, pad:2, id:"track" },
    Bangle.musicControl?{type:"h",fillx:1, c: [
      {type:"btn", pad:8, label:atob("ABYYgQDAAAPAAA/AAD/AAP+AA/+AD/+AP/+A//+D//+P//8//////////8///j//4P/+A//gD/4AP+AA/wAD8AAPAAAwAAA="), cb:()=>Bangle.musicControl("play")}, // play
      {type:"btn", pad:8, label:atob("ABIWgQB4B78D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D/8D94B4A=="), cb:()=>Bangle.musicControl("pause")}, // pause
      {type:"btn", pad:8, label:atob("ABISgQDAAfgAf4Af8Af/Af/gf/wf/8f/+f/+f/8f/wf/gf/Af8Af4AfgAfAAcA=="), cb:()=>Bangle.musicControl("next")}, // next
    ]}:{},
    {type:"txt", font:"6x8:2", label:msg.dur?fmtTime(msg.dur):"--:--" }
  ]}, { back : back, remove : unload
  });
  g.reset().clearRect(Bangle.appRect);
  layout.render();

  // handle up/down to drag to new message
  let dragHandler = addDragHandlerToChangeMessage(MESSAGES.findIndex(m=>m==msg));

  updateLabelsInterval = setInterval(function() {
    updateLabels();
    layout.artist.label = artistName;
    layout.album.label = albumName;
    layout.track.label = trackName;
    layout.render();
  }, 400);
}

function showMessageSettings(msg) {
  active = "settings";
  var menu = {"":{
      "title":/*LANG*/"Message",
      back:() => showMessage(msg.id, true)
    },
  };

  /* Bangle.js 1 can't press a button to go back from
  showMessage to the message list, so add the option here */
  if (process.env.BOARD=="BANGLEJS")
    menu[/*LANG*/"Message List"] = () => { returnToMain(); };

  if (msg.reply && reply)
    menu[/*LANG*/"Reply"] = () => {
      replying = true;
      reply.reply({msg: msg})
        .then(result => {
          Bluetooth.println(JSON.stringify(result));
          replying = false;
          showMessage(msg.id);
        })
        .catch(() => {
          replying = false;
          showMessage(msg.id);
        });
    };

  menu[/*LANG*/"Delete"] = () => {
    MESSAGES = MESSAGES.filter(m=>m.id!=msg.id);
    returnToMain();
  };

  if (Bangle.messageIgnore && msg.src)
    menu[/*LANG*/"Ignore"] = () => {
      E.showPrompt(/*LANG*/"Ignore all messages from "+E.toJS(msg.src)+"?", {title:/*LANG*/"Ignore"}).then(isYes => {
        if (isYes) {
          Bangle.messageIgnore(msg);
          MESSAGES = MESSAGES.filter(m=>m.id!=msg.id);
        }
        returnToMain();
      });
    };

  menu = Object.assign(menu, {
    /*LANG*/"Mark Unread" : () => {
      msg.new = true;
      returnToMain();
    },
    /*LANG*/"Mark all read" : () => {
      MESSAGES.forEach(msg => msg.new = false);
      returnToMain();
    },
    /*LANG*/"Delete all messages" : () => {
      E.showPrompt(/*LANG*/"Are you sure?", {title:/*LANG*/"Delete All Messages"}).then(isYes => {
        if (isYes) {
          MESSAGES = [];
        }
        returnToMain();
      });
    },
  });
  E.showMenu(menu);
}

function showMessage(msgid, persist) {
  if (replying) { return; }
  if(!persist) resetReloadTimeout();
  let idx = MESSAGES.findIndex(m=>m.id==msgid);
  let msg = MESSAGES[idx];
  if (!msg) return returnToClockIfEmpty(); // go home if no message found
  if (msg.id=="music") {
    cancelReloadTimeout(); // don't auto-reload to clock now
    return showMusicMessage(msg);
  }
  if (msg.id=="nav") {
    cancelReloadTimeout(); // don't auto-reload to clock now
    return showMapMessage(msg);
  }
  // remove widgets here as we need to check the height when choosing a font
  Bangle.setUI(); // force last UI to be removed (will call require("widget_utils").show(); if last displaying a message)
  if (!settings.showWidgets) require("widget_utils").hide();
  active = "message";
  // Normal text message display
  let src=msg.src||/*LANG*/"Message", srcFont = fontSmall;
  let title=msg.title||"", titleFont = fontLarge, lines=[];
  let body=msg.body, bodyFont = fontLarge;
  // If no body, use the title text instead...
  if (!body) {
    body = title;
    title = "";
  }
  if (g.setFont(srcFont).stringWidth(src) > g.getWidth()-52)
    srcFont = "4x6";
  if (title) {
    let w = g.getWidth()-52;
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
  if (body) { // Try and find a font that fits...
    let w = g.getWidth()-2, h = Bangle.appRect.h-80;
    if (g.setFont(bodyFont).wrapString(body, w).length*g.getFontHeight() > h) {
      bodyFont = fontBig;
      if (settings.fontSize!=1 && g.setFont(bodyFont).wrapString(body, w).length*g.getFontHeight() > h) {
        bodyFont = fontMedium;
      }
    }
    lines = g.setFont(bodyFont).wrapString(body, w);
  }
  // By this point, `title` must be a string and `lines` must be an array of strings.
  // Either or both can be empty, but neither can be `undefined` (#3969).
  let negHandler,posHandler,rowLeftDraw,rowRightDraw;
  if (msg.negative) {
    negHandler = ()=>{
      msg.new = false;
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,false);
      returnToCheckMessages();
    };
    rowLeftDraw = function(r) {g.setColor("#f00").drawImage(atob("PhAB4A8AAAAAAAPAfAMAAAAAD4PwHAAAAAA/H4DwAAAAAH78B8AAAAAA/+A/AAAAAAH/Af//////w/gP//////8P4D///////H/Af//////z/4D8AAAAAB+/AfAAAAAA/H4DwAAAAAPg/AcAAAAADwHwDAAAAAA4A8AAAAAAAA=="),r.x+2,r.y+2);};
  }
  if (msg.reply && reply) {
    posHandler = ()=>{
      replying = true;
      msg.new = false;
      cancelReloadTimeout(); // don't auto-reload to clock now
      reply.reply({msg: msg})
        .then(result => {
          Bluetooth.println(JSON.stringify(result));
          replying = false;
          returnToCheckMessages();
        })
        .catch(() => {
          replying = false;
          showMessage(msg.id);
        });
    };
    rowRightDraw = function(r) {g.setColor("#0f0").drawImage(atob("QRABAAAAAAAH//+AAAAABgP//8AAAAADgf//4AAAAAHg4ABwAAAAAPh8APgAAAAAfj+B////////geHv///////hf+f///////GPw///////8cGBwAAAAAPx/gDgAAAAAfD/gHAAAAAA8DngOAAAAABwDHP8AAAAADACGf4AAAAAAAAM/w=="),r.x+r.w-67,r.y+2);};
  } else if (msg.positive) {
    posHandler = ()=>{
      msg.new = false;
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,true);
      returnToCheckMessages();
    };
    rowRightDraw = function(r) {g.setColor("#0f0").drawImage(atob("QRABAAAAAAAAAAOAAAAABgAAA8AAAAADgAAD4AAAAAHgAAPgAAAAAPgAA+AAAAAAfgAD4///////gAPh///////gA+D///////AD4H//////8cPgAAAAAAPw8+AAAAAAAfB/4AAAAAAA8B/gAAAAAABwB+AAAAAAADAB4AAAAAAAAABgAA=="),r.x+r.w-64,r.y+2);};
  }
  let fontHeight = g.setFont(bodyFont).getFontHeight();
  let lineHeight = (fontHeight>25)?fontHeight:25;
  if (title.includes("\n") && lineHeight<25) lineHeight=25; // ensure enough room for 2 lines of title in header
  let linesPerRow = 2;
  if (fontHeight<17) {
    lineHeight = 16;
    linesPerRow = 3;
  }
  if ((lines.length+4.5)*lineHeight < Bangle.appRect.h)
    lines.unshift(""); // if less lines, pad them out a bit at the top!
  let rowHeight = lineHeight*linesPerRow;
  let textLineOffset = -(linesPerRow + ((rowLeftDraw||rowRightDraw)?1:0));
  let msgIcon = require("messageicons").getImage(msg);
  let msgCol = require("messageicons").getColor(msg, {settings, default:g.theme.fg2});
  let scroller = E.showScroller({
    h : rowHeight, // height of each menu item in pixels
    c : Math.ceil((lines.length-textLineOffset) / linesPerRow), // number of menu items
    // a function to draw a menu item
    draw : function(idx, r) { "ram";
      if (idx) { // message body
        let lidx = idx*linesPerRow+textLineOffset;
        g.setBgColor(g.theme.bg).setColor(g.theme.fg).clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
        g.setFont(bodyFont).setFontAlign(0,-1).drawString(lines[lidx++]||"", r.x+r.w/2, r.y).drawString(lines[lidx++]||"", r.x+r.w/2, r.y+lineHeight);
        if (linesPerRow==3) g.drawString(lines[lidx++]||"", r.x+r.w/2, r.y+lineHeight*2);
        if (idx!=1) return;
        if (rowLeftDraw) rowLeftDraw(r);
        if (rowRightDraw) rowRightDraw(r);
      } else { // idx==0 => header
        g.setBgColor(g.theme.bg2).setColor(g.theme.fg).clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
        if (!settings.showWidgets && Bangle.isLocked()) g.drawImage(atob("DhABH+D/wwMMDDAwwMf/v//4f+H/h/8//P/z///f/g=="), r.x+1,r.y+4); // locked symbol
        var mid = (r.w-48)/2;
        g.setColor(g.theme.fg2).setFont(srcFont).setFontAlign(0,-1).drawString(src, mid, r.y+2);
        let srcHeight = g.getFontHeight();
        g.setFont(titleFont).setFontAlign(0,0).drawString(title, mid, r.y+ (r.h+srcHeight+2)/2);
        //g.setColor(g.theme.bgH).fillRect({x:r.x+r.w-47, y:r.y+3, w:44, h:44, r:6});
        g.setColor(msgCol).drawImage(msgIcon, r.x+r.w-24, r.y + rowHeight/2, {rotate:0/*center*/});
      }
    }, select : function(idx) {
      if (idx==0) { // the title
        cancelReloadTimeout(); // don't auto-reload to clock now
        showMessageSettings(msg);
      }
    },
    remove : function() {
      Bangle.removeListener("drag", dragHandler);
      Bangle.removeListener("swipe", swipeHandler);
      Bangle.removeListener("lock", lockHandler);
      if (!settings.showWidgets) require("widget_utils").show();
    },
    back : function() {
      msg.new = false; // read mail
      cancelReloadTimeout(); // don't auto-reload to clock now
      returnToClockIfEmpty();
    }
  });

  let dragHandler = addDragHandlerToChangeMessage(idx, scroller);
  // handle swipes
  let swipeHandler = (lr,ud) => {
    // left/right accept/reject
    if (lr>0 && posHandler) {
      Bangle.buzz(30);
      posHandler();
    }
    if (lr<0 && negHandler) {
      Bangle.buzz(30);
      negHandler();
    }
    /* handle up/down in drag handler because we want to
    move message only when the finger is released, or subsequent
    finger movement will end up dragging the new message */
  };
  Bangle.on("swipe", swipeHandler);
  let lockHandler = () => scroller.draw();
  Bangle.on("lock",lockHandler); // redraw when we lock/unlock
}


/* options = {
  clockIfNoMsg : bool
  clockIfAllRead : bool
  ignoreUnread : bool   // don't automatically navigate to the first unread message
  openMusic : bool      // open music if it's playing
  dontStopBuzz : bool   // don't stuf buzzing (any time other than the first this is undefined/false)
}
*/
function checkMessages(options) {
  options=options||{};
  // If there's been some user interaction, it's time to stop repeated buzzing
  if (!options.dontStopBuzz)
    require("messages").stopBuzz();
  // If no messages, just show 'no messages' and return
  if (!MESSAGES.length) {
    active=undefined; // no messages
    if (!options.clockIfNoMsg) return E.showPrompt(/*LANG*/"No Messages",{
      title:/*LANG*/"Messages",
      img:require("heatshrink").decompress(atob("kkk4UBrkc/4AC/tEqtACQkBqtUDg0VqAIGgoZFDYQIIM1sD1QAD4AIBhnqA4WrmAIBhc6BAWs8AIBhXOBAWz0AIC2YIC5wID1gkB1c6BAYFBEQPqBAYXBEQOqBAnDAIQaEnkAngaEEAPDFgo+IKA5iIOhCGIAFb7RqAIGgtUBA0VqobFgNVA")),
      buttons : {/*LANG*/"Ok":1},
      back: () => load()
    }).then(() => load());
    return load();
  }
  // we have >0 messages
  var newMessages = MESSAGES.filter(m=>m.new&&m.id!="music");
  // If we have a new message, show it
  if (!options.ignoreUnread && newMessages.length) {
    delete newMessages[0].show; // stop us getting stuck here if we're called a second time
    showMessage(newMessages[0].id, false);
    // buzz after showMessage, so being busy during layout doesn't affect the buzz pattern
    if (global.BUZZ_ON_NEW_MESSAGE) {
      // this is set if we entered the messages app by loading `messagegui.new.js`
      // ... but only buzz the first time we view a new message
      global.BUZZ_ON_NEW_MESSAGE = false;
      // messages.buzz respects quiet mode - no need to check here
      require("messages").buzz(newMessages[0].src);
    }
    return;
  }
  // no new messages: show playing music? Only if we have playing music, or state=="show" (set by messagesmusic)
  if (options.openMusic && MESSAGES.some(m=>m.id=="music" && ((m.track && m.state=="play") || m.state=="show")))
    return showMessage('music', true);
  // no new messages - go to clock?
  if (options.clockIfAllRead && newMessages.length==0)
    return load();
  active = "list";
  // Otherwise show a list of messages
  E.showScroller({
    h : 50,
    c : Math.max(MESSAGES.length,3), // workaround for 2v10.219 firmware (min 3 not needed for 2v11)
    draw : function(idx, r) {"ram"
      var msg = MESSAGES[idx];
      if (msg && msg.new) g.setBgColor(g.theme.bgH).setColor(g.theme.fgH);
      else g.setBgColor(g.theme.bg).setColor(g.theme.fg);
      g.clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
      if (!msg) return;
      var x = r.x+2, title = msg.title, body = msg.body;
      var img = require("messageicons").getImage(msg);
      if (msg.id=="music") {
        title = msg.artist || /*LANG*/"Music";
        body = msg.track;
      }
      if (img) {
        var fg = g.getColor(),
            col = require("messageicons").getColor(msg, {settings, default:fg});
        g.setColor(col).drawImage(img, x+20, r.y+24, {rotate:0}) // force centering
         .setColor(fg); // only color the icon
        x += 40;
      }
      if (title) g.setFontAlign(-1,-1).setFont(fontBig).drawString(title, x,r.y+1);
      var longBody = false;
      if (body) {
        g.setFontAlign(-1,0).setFont(fontSmall);
        // if the body includes an image, it probably won't be small enough to allow>1 line
        let maxLines = Math.floor(34/g.getFontHeight());
        if (body.includes("\0")) { maxLines=1; }
        var l = g.wrapString(body, r.w-(x+8));
        if (l.length>maxLines) {
          l = l.slice(0,maxLines);
          l[l.length-1]+="...";
        }
        longBody = l.length>2;
        // draw the body
        g.drawString(l.join("\n"), x+6,r.y+36);
      }
      if (!longBody && msg.src) g.setFontAlign(1,1).setFont("6x8").drawString(msg.src, r.x+r.w-2, r.y+r.h-2);
      g.setColor("#888").fillRect(r.x,r.y+r.h-1,r.x+r.w-1,r.y+r.h-1); // dividing line between items
    },
    select : idx => {
      if (idx < MESSAGES.length)
        showMessage(MESSAGES[idx].id, true);
    },
    back : () => load()
  });
}

function returnToCheckMessages(clock) {
  checkMessages({clockIfNoMsg:1,clockIfAllRead:1,ignoreUnread:settings.ignoreUnread,openMusic});
}

function returnToMain() {
  checkMessages({clockIfNoMsg:0,clockIfAllRead:0,ignoreUnread:1,openMusic:0});
}

function returnToClockIfEmpty() {
  checkMessages({clockIfNoMsg:1,clockIfAllRead:0,ignoreUnread:1,openMusic});
}

function cancelReloadTimeout() {
  if (!unreadTimeout) return;
  clearTimeout(unreadTimeout);
  unreadTimeout = undefined;
}

function resetReloadTimeout(){
  cancelReloadTimeout();
  if (!isFinite(settings.unreadTimeout)) settings.unreadTimeout=60;
  if (settings.unreadTimeout)
    unreadTimeout = setTimeout(load, settings.unreadTimeout*1000);
}

g.clear();

Bangle.loadWidgets();
require("messages").toggleWidget(false);
Bangle.drawWidgets();

setTimeout(() => {
  // only openMusic on launch if music is new, or state=="show" (set by messagesmusic)
  var musicMsg = MESSAGES.find(m => m.id === "music");
  checkMessages({
    clockIfNoMsg: 0, clockIfAllRead: 0, ignoreUnread: settings.ignoreUnread,
    openMusic: ((musicMsg&&musicMsg.new) && settings.openMusic) || (musicMsg&&musicMsg.state=="show"),
    dontStopBuzz: 1 });
}, 10); // if checkMessages wants to 'load', do that

/* If the Bangle is unlocked by the user, treat that
as a queue to stop repeated buzzing */
Bangle.on('lock',locked => {
  if (!locked)
    require("messages").stopBuzz();
});
