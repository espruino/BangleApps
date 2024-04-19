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
require("messages").pushMessage({"t":"add","id":1575479849,"src":"Skype","title":"My Friend","body":"Hey! How's everything going?",positive:1,negative:1})
// maps
GB({t:"nav",src:"maps",title:"Navigation",instr:"High St towards Tollgate Rd",distance:"966yd",action:"continue",eta:"08:39"})
GB({t:"nav",src:"maps",title:"Navigation",instr:"High St",distance:"12km",action:"left_slight",eta:"08:39"})
GB({t:"nav",src:"maps",title:"Navigation",instr:"Main St / I-29 ALT / Centerpoint Dr",distance:12345,action:"left_slight",eta:"08:39"})
// call
require("messages").pushMessage({"t":"add","id":"call","src":"Phone","title":"Bob","body":"12421312",positive:true,negative:true})
*/
var Layout = require("Layout");
var layout; // global var containing the layout for the currently displayed message
var settings = require('Storage').readJSON("messages.settings.json", true) || {};
var fontSmall = "6x8";
var fontMedium = g.getFonts().includes("6x15")?"6x15":"6x8:2";
var fontBig = g.getFonts().includes("12x20")?"12x20":"6x8:2";
var fontLarge = g.getFonts().includes("6x15")?"6x15:2":"6x8:4";
var fontVLarge = g.getFonts().includes("6x15")?"12x20:2":"6x8:5";

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
  showMessage(msg&&msg.id);
};
Bangle.on("message", onMessagesModified);

function saveMessages() {
  require("messages").write(MESSAGES);
}
E.on("kill", saveMessages);

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
      {type:"txt", font:"6x8", label:"Towards" },
      {type:"txt", font:fontLarge, label:street }
    ]}:{},
    {type:"h",fillx:1, filly:1, c: [
      img?{type:"img",src:atob(img), scale:2, pad:6}:{},
      {type:"v", fillx:1, c: [
        {type:"txt", font:fontVLarge, label:distance||"" }
      ]},
    ]},
    {type:"txt", font:"6x8:2", label:msg.eta?`ETA ${msg.eta}`:"" }
  ]});
  g.reset().clearRect(Bangle.appRect);
  layout.render();
  function back() { // mark as not new and return to menu
    msg.new = false;
    layout = undefined;
    checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1,openMusic:0});
  }
  Bangle.setUI({mode:"updown", back: back}, back); // any input takes us back
}

let updateLabelsInterval;

function showMusicMessage(msg) {
  active = "music";
  // defaults, so e.g. msg.xyz.length doesn't error. `msg` should contain up to date info
  msg = Object.assign({artist: "", album: "", track: "Music"}, msg);
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
  ]}, { back : back });
  g.reset().clearRect(Bangle.appRect);
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
  cancelReloadTimeout();
  active = "scroller";
  var bodyFont = fontBig;
  g.setFont(bodyFont);
  var lines = [];
  if (msg.title) lines = g.wrapString(msg.title, g.getWidth()-10);
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
      g.setFont(bodyFont).setFontAlign(0,-1).drawString(lines[idx], r.x+r.w/2, r.y);
    }, select : function(idx) {
      if (idx>=lines.length-2)
        showMessage(msg.id);
    },
    back : () => showMessage(msg.id)
  });
}

function showMessageSettings(msg) {
  active = "settings";
  var menu = {"":{"title":/*LANG*/"Message"},
    "< Back" : () => showMessage(msg.id),
    /*LANG*/"View Message" : () => {
      showMessageScroller(msg);
    },
    /*LANG*/"Delete" : () => {
      MESSAGES = MESSAGES.filter(m=>m.id!=msg.id);
      checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
    },
  };
  if (Bangle.messageIgnore && msg.src)
    menu[/*LANG*/"Ignore"] = () => {
      E.showPrompt(/*LANG*/"Ignore all messages from "+E.toJS(msg.src)+"?", {title:/*LANG*/"Ignore"}).then(isYes => {
        if (isYes) {
          Bangle.messageIgnore(msg);
          MESSAGES = MESSAGES.filter(m=>m.id!=msg.id);
        }
        checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
      });
    };

  menu = Object.assign(menu, {
    /*LANG*/"Mark Unread" : () => {
      msg.new = true;
      checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
    },
    /*LANG*/"Mark all read" : () => {
      MESSAGES.forEach(msg => msg.new = false);
      checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
    },
    /*LANG*/"Delete all messages" : () => {
      E.showPrompt(/*LANG*/"Are you sure?", {title:/*LANG*/"Delete All Messages"}).then(isYes => {
        if (isYes) {
          MESSAGES = [];
        }
        checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0,openMusic:0});
      });
    },
  });
  E.showMenu(menu);
}

function showMessage(msgid) {
  let idx = MESSAGES.findIndex(m=>m.id==msgid);
  var msg = MESSAGES[idx];
  if (updateLabelsInterval) {
    clearInterval(updateLabelsInterval);
    updateLabelsInterval=undefined;
  }
  if (!msg) return checkMessages({clockIfNoMsg:1,clockIfAllRead:0,showMsgIfUnread:0,openMusic:openMusic}); // go home if no message found
  if (msg.id=="music") {
    cancelReloadTimeout(); // don't auto-reload to clock now
    return showMusicMessage(msg);
  }
  if (msg.id=="nav") {
    cancelReloadTimeout(); // don't auto-reload to clock now
    return showMapMessage(msg);
  }
  active = "message";
  // Normal text message display
  var title=msg.title, titleFont = fontLarge, lines;
  var body=msg.body, bodyFont = fontLarge;
  // If no body, use the title text instead...
  if (body===undefined) {
    body = title;
    title = undefined;
  }
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
  if (body) { // Try and find a font that fits...
    var w = g.getWidth()-2, h = Bangle.appRect.h-60;
    if (g.setFont(bodyFont).wrapString(body, w).length*g.getFontHeight() > h) {
      bodyFont = fontBig;
      if (settings.fontSize!=1 && g.setFont(bodyFont).wrapString(body, w).length*g.getFontHeight() > h) {
        bodyFont = fontMedium;
      }
    }
    // Now crop, given whatever font we have available
    lines = g.setFont(bodyFont).wrapString(body, w);
    var maxLines = Math.floor(h / g.getFontHeight());
    if (lines.length>maxLines) // if too long, wrap with a bit less spae so we have room for '...'
      body = g.setFont(bodyFont).wrapString(body, w-10).slice(0,maxLines).join("\n")+"...";
    else
      body = lines.join("\n");
  }
  function goBack() {
    layout = undefined;
    msg.new = false; // read mail
    cancelReloadTimeout(); // don't auto-reload to clock now
    checkMessages({clockIfNoMsg:1,clockIfAllRead:0,showMsgIfUnread:0,openMusic:openMusic});
  }
  var negHandler,posHandler,footer = [ ];
  if (msg.negative) {
    negHandler = ()=>{
      msg.new = false;
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,false);
      checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1,openMusic:openMusic});
    }; footer.push({type:"img",src:atob("PhAB4A8AAAAAAAPAfAMAAAAAD4PwHAAAAAA/H4DwAAAAAH78B8AAAAAA/+A/AAAAAAH/Af//////w/gP//////8P4D///////H/Af//////z/4D8AAAAAB+/AfAAAAAA/H4DwAAAAAPg/AcAAAAADwHwDAAAAAA4A8AAAAAAAA=="),col:"#f00",cb:negHandler});
  }
  footer.push({fillx:1}); // push images to left/right
  if (msg.positive) {
    posHandler = ()=>{
      msg.new = false;
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,true);
      checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1,openMusic:openMusic});
    };
        footer.push({type:"img",src:atob("QRABAAAAAAAAAAOAAAAABgAAA8AAAAADgAAD4AAAAAHgAAPgAAAAAPgAA+AAAAAAfgAD4///////gAPh///////gA+D///////AD4H//////8cPgAAAAAAPw8+AAAAAAAfB/4AAAAAAA8B/gAAAAAABwB+AAAAAAADAB4AAAAAAAAABgAA=="),col:"#0f0",cb:posHandler});

  }

  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:g.theme.bg2, col: g.theme.fg2,  c: [
      { type:"v", fillx:1, c: [
        {type:"txt", font:fontSmall, label:msg.src||/*LANG*/"Message", bgCol:g.theme.bg2, col: g.theme.fg2, fillx:1, pad:2, halign:1 },
        title?{type:"txt", font:titleFont, label:title, bgCol:g.theme.bg2, col: g.theme.fg2, fillx:1, pad:2 }:{},
      ]},
      { type:"btn",
        src:require("messageicons").getImage(msg),
        col:require("messageicons").getColor(msg, {settings:settings, default:g.theme.fg2}),
        pad: 3, cb:()=>{
          cancelReloadTimeout(); // don't auto-reload to clock now
          showMessageSettings(msg);
        }
      },
    ]},
    {type:"txt", font:bodyFont, label:body, fillx:1, filly:1, pad:2, cb:()=>{
      // allow tapping to show a larger version
      showMessageScroller(msg);
    } },
    {type:"h",fillx:1, c: footer}
  ]},{back:goBack});

  Bangle.swipeHandler = (lr,ud) => {
    if (lr>0 && posHandler) posHandler();
    if (lr<0 && negHandler) negHandler();
    if (ud>0 && idx<MESSAGES.length-1) showMessage(MESSAGES[idx+1].id);
    if (ud<0 && idx>0) showMessage(MESSAGES[idx-1].id);
  };
  Bangle.on("swipe", Bangle.swipeHandler);
  g.reset().clearRect(Bangle.appRect);
  layout.render();
}


/* options = {
  clockIfNoMsg : bool
  clockIfAllRead : bool
  showMsgIfUnread : bool
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
  if (options.showMsgIfUnread && newMessages.length) {
    delete newMessages[0].show; // stop us getting stuck here if we're called a second time
    showMessage(newMessages[0].id);
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
    return showMessage('music');
  // no new messages - go to clock?
  if (options.clockIfAllRead && newMessages.length==0)
    return load();
  active = "list";
  // Otherwise show a list of messages
  E.showScroller({
    h : 48,
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
            col = require("messageicons").getColor(msg, {settings:settings, default:fg});
        g.setColor(col).drawImage(img, x+24, r.y+24, {rotate:0}) // force centering
         .setColor(fg); // only color the icon
        x += 50;
      }
      if (title) g.setFontAlign(-1,-1).setFont(fontBig).drawString(title, x,r.y+2);
      var longBody = false;
      if (body) {
        g.setFontAlign(-1,-1).setFont(fontSmall);
        // if the body includes an image, it probably won't be small enough to allow>1 line
        let maxLines = Math.floor(34/g.getFontHeight()), pady = 0;
        if (body.includes("\0")) { maxLines=1; pady=4; }
        var l = g.wrapString(body, r.w-(x+14));
        if (l.length>maxLines) {
          l = l.slice(0,maxLines);
          l[l.length-1]+="...";
        }
        longBody = l.length>2;
        // draw the body
        g.drawString(l.join("\n"), x+10,r.y+20+pady);
      }
      if (!longBody && msg.src) g.setFontAlign(1,1).setFont("6x8").drawString(msg.src, r.x+r.w-2, r.y+r.h-2);
      g.setColor("#888").fillRect(r.x,r.y+r.h-1,r.x+r.w-1,r.y+r.h-1); // dividing line between items
    },
    select : idx => {
      if (idx < MESSAGES.length)
        showMessage(MESSAGES[idx].id);
    },
    back : () => load()
  });
}


function cancelReloadTimeout() {
  if (!unreadTimeout) return;
  clearTimeout(unreadTimeout);
  unreadTimeout = undefined;
}

g.clear();

Bangle.loadWidgets();
require("messages").toggleWidget(false);
Bangle.drawWidgets();

setTimeout(() => {
  if (!isFinite(settings.unreadTimeout)) settings.unreadTimeout=60;
  if (settings.unreadTimeout)
    unreadTimeout = setTimeout(load, settings.unreadTimeout*1000);
  // only openMusic on launch if music is new, or state=="show" (set by messagesmusic)
  var musicMsg = MESSAGES.find(m => m.id === "music");
  checkMessages({
    clockIfNoMsg: 0, clockIfAllRead: 0, showMsgIfUnread: 1,
    openMusic: ((musicMsg&&musicMsg.new) && settings.openMusic) || (musicMsg&&musicMsg.state=="show"),
    dontStopBuzz: 1 });
}, 10); // if checkMessages wants to 'load', do that

/* If the Bangle is unlocked by the user, treat that
as a queue to stop repeated buzzing */
Bangle.on('lock',locked => {
  if (!locked)
    require("messages").stopBuzz();
});
