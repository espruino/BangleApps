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
var fontSmall = "6x8";
var fontMedium = g.getFonts().includes("6x15")?"6x15":"6x8:2";
var fontBig = g.getFonts().includes("12x20")?"12x20":"6x8:2";
var fontLarge = g.getFonts().includes("6x15")?"6x15:2":"6x8:4";
var colBg = g.theme.dark ? "#141":"#4f4";
var colSBg1 = g.theme.dark ? "#121":"#cFc";
var colSBg2 = g.theme.dark ? "#242":"#9F9";
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
  if (msg && msg.new) {
    if (WIDGETS["messages"]) WIDGETS["messages"].buzz();
    else Bangle.buzz();
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
function getMessageImage(msg) {
  if (msg.img) return atob(msg.img);
  var s = (msg.src||"").toLowerCase();
  if (s=="calendar") return atob("GBiBAAAAAAAAAAAAAA//8B//+BgAGBgAGBgAGB//+B//+B//+B9m2B//+B//+Btm2B//+B//+Btm+B//+B//+A//8AAAAAAAAAAAAA==");
  if (s=="facebook") return getFBIcon();
  if (s=="hangouts") return atob("FBaBAAH4AH/gD/8B//g//8P//H5n58Y+fGPnxj5+d+fmfj//4//8H//B//gH/4A/8AA+AAHAABgAAAA=");
  if (s=="instagram") return atob("GBiBAf////////////////wAP/n/n/P/z/f/b/eB7/c87/d+7/d+7/d+7/d+7/c87/eB7/f/7/P/z/n/n/wAP////////////////w==");
  if (s=="gmail") return getNotificationImage();
  if (s=="google home") return atob("GBiCAAAAAAAAAAAAAAAAAAAAAoAAAAAACqAAAAAAKqwAAAAAqroAAAACquqAAAAKq+qgAAAqr/qoAACqv/6qAAKq//+qgA6r///qsAqr///6sAqv///6sAqv///6sAqv///6sA6v///6sA6v///qsA6qqqqqsA6qqqqqsA6qqqqqsAP7///vwAAAAAAAAAAAAAAAAA==");
  if (s=="mail") return getNotificationImage();
  if (s=="messenger") return getFBIcon();
  if (s=="outlook mail") return getNotificationImage();
  if (s=="phone") return atob("FxeBABgAAPgAAfAAB/AAD+AAH+AAP8AAP4AAfgAA/AAA+AAA+AAA+AAB+AAB+AAB+OAB//AB//gB//gA//AA/8AAf4AAPAA=");
  if (s=="skype") return atob("GhoBB8AAB//AA//+Af//wH//+D///w/8D+P8Afz/DD8/j4/H4fP5/A/+f4B/n/gP5//B+fj8fj4/H8+DB/PwA/x/A/8P///B///gP//4B//8AD/+AAA+AA==");
  if (s=="slack") return atob("GBiBAAAAAAAAAABAAAHvAAHvAADvAAAPAB/PMB/veD/veB/mcAAAABzH8B3v+B3v+B3n8AHgAAHuAAHvAAHvAADGAAAAAAAAAAAAAA==");
  if (s=="sms message") return getNotificationImage();
  if (s=="twitter") return atob("GhYBAABgAAB+JgA/8cAf/ngH/5+B/8P8f+D///h///4f//+D///g///wD//8B//+AP//gD//wAP/8AB/+AB/+AH//AAf/AAAYAAA");
  if (s=="telegram") return atob("GBiBAAAAAAAAAAAAAAAAAwAAHwAA/wAD/wAf3gD/Pgf+fh/4/v/z/P/H/D8P/Acf/AM//AF/+AF/+AH/+ADz+ADh+ADAcAAAMAAAAA==");
  if (s=="whatsapp") return atob("GBiBAAB+AAP/wAf/4A//8B//+D///H9//n5//nw//vw///x///5///4///8e//+EP3/APn/wPn/+/j///H//+H//8H//4H//wMB+AA==");
  if (s=="wordfeud") return atob("GBgCWqqqqqqlf//////9v//////+v/////++v/////++v8///Lu+v8///L++v8///P/+v8v//P/+v9v//P/+v+fx/P/+v+Pk+P/+v/PN+f/+v/POuv/+v/Ofdv/+v/NvM//+v/I/Y//+v/k/k//+v/i/w//+v/7/6//+v//////+v//////+f//////9Wqqqqqql");
  if (msg.id=="music") return atob("FhaBAH//+/////////////h/+AH/4Af/gB/+H3/7/f/v9/+/3/7+f/vB/w8H+Dwf4PD/x/////////////3//+A=");
  if (msg.id=="back") return getBackImage();
  return getNotificationImage();
}

function showMapMessage(msg) {
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
    {type:"txt", font:fontMedium, label:target, bgCol:colBg, fillx:1, pad:2 },
    {type:"h", bgCol:colBg, fillx:1, c: [
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
    checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1});
  });
}

function showMusicMessage(msg) {
  function fmtTime(s) {
    var m = Math.floor(s/60);
    s = (parseInt(s%60)).toString().padStart(2,0);
    return m+":"+s;
  }

  function back() {
    msg.new = false;
    saveMessages();
    layout = undefined;
    checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1});
  }
  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:colBg,  c: [
      { type:"btn", src:getBackImage, cb:back },
      { type:"v", fillx:1, c: [
        { type:"txt", font:fontMedium, label:msg.artist, pad:2 },
        { type:"txt", font:fontMedium, label:msg.album, pad:2 }
      ]}
    ]},
    {type:"txt", font:fontLarge, label:msg.track, fillx:1, filly:1, pad:2 },
    Bangle.musicControl?{type:"h",fillx:1, c: [
      {type:"btn", pad:8, label:"\0"+atob("FhgBwAADwAAPwAA/wAD/gAP/gA//gD//gP//g///j///P//////////P//4//+D//gP/4A/+AD/gAP8AA/AADwAAMAAA"), cb:()=>Bangle.musicControl("play")}, // play
      {type:"btn", pad:8, label:"\0"+atob("EhaBAHgHvwP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP/wP3gHg"), cb:()=>Bangle.musicControl("pause")}, // pause
      {type:"btn", pad:8, label:"\0"+atob("EhKBAMAB+AB/gB/wB/8B/+B//B//x//5//5//x//B/+B/8B/wB/gB+AB8ABw"), cb:()=>Bangle.musicControl("next")}, // next
    ]}:{},
    {type:"txt", font:"6x8:2", label:msg.dur?fmtTime(msg.dur):"--:--" }
  ]});
  g.clearRect(Bangle.appRect);
  layout.render();
}

function showMessageSettings(msg) {
  E.showMenu({"":{"title":/*LANG*/"Message"},
    "< Back" : () => showMessage(msg.id),
    /*LANG*/"Delete" : () => {
      MESSAGES = MESSAGES.filter(m=>m.id!=msg.id);
      saveMessages();
      checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0});
    },
    /*LANG*/"Mark Unread" : () => {
      msg.new = true;
      saveMessages();
      checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0});
    },
    /*LANG*/"Delete all messages" : () => {
      E.showPrompt(/*LANG*/"Are you sure?", {title:/*LANG*/"Delete All Messages"}).then(isYes => {
        if (isYes) {
          MESSAGES = [];
          saveMessages();
        }
        checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0});
      });
    },
  });
}

function showMessage(msgid) {
  var msg = MESSAGES.find(m=>m.id==msgid);
  if (!msg) return checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:0}); // go home if no message found
  if (msg.src=="Maps") {
    cancelReloadTimeout(); // don't auto-reload to clock now
    return showMapMessage(msg);
  }
  if (msg.id=="music") {
    cancelReloadTimeout(); // don't auto-reload to clock now
    return showMusicMessage(msg);
  }
  // Normal text message display
  var title=msg.title, titleFont = fontLarge, lines;
  if (title) {
    var w = g.getWidth()-48;
    if (g.setFont(titleFont).stringWidth(title) > w)
      titleFont = fontMedium;
    if (g.setFont(titleFont).stringWidth(title) > w) {
      lines = g.wrapString(title, w);
      title = (lines.length>2) ? lines.slice(0,2).join("\n")+"..." : lines.join("\n");
    }
  }
  var buttons = [
    {type:"btn", src:getBackImage(), cb:()=>{
      msg.new = false; saveMessages(); // read mail
      cancelReloadTimeout(); // don't auto-reload to clock now
      checkMessages({clockIfNoMsg:1,clockIfAllRead:0,showMsgIfUnread:1});
    }} // back
  ];
  if (msg.positive) {
    buttons.push({type:"btn", src:getPosImage(), cb:()=>{
      msg.new = false; saveMessages();
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,true);
      checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1});
    }});
  }
  if (msg.negative) {
    buttons.push({type:"btn", src:getNegImage(), cb:()=>{
      msg.new = false; saveMessages();
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,false);
      checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1});
    }});
  }
  lines = g.wrapString(msg.body, g.getWidth()-10);
  var body = (lines.length>4) ? lines.slice(0,4).join("\n")+"..." : lines.join("\n");
  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:colBg,  c: [
      { type:"btn", src:getMessageImage(msg), pad: 3, cb:()=>{
        cancelReloadTimeout(); // don't auto-reload to clock now
        showMessageSettings(msg);
      }},
      { type:"v", fillx:1, c: [
        {type:"txt", font:fontSmall, label:msg.src||"Message", bgCol:colBg, fillx:1, pad:2, halign:1 },
        title?{type:"txt", font:titleFont, label:title, bgCol:colBg, fillx:1, pad:2 }:{},
      ]},
    ]},
    {type:"txt", font:fontMedium, label:body, fillx:1, filly:1, pad:2 },
    {type:"h",fillx:1, c: buttons}
  ]});
  g.clearRect(Bangle.appRect);
  layout.render();
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
  var newMessages = MESSAGES.filter(m=>m.new);
  // If we have a new message, show it
  if (options.showMsgIfUnread && newMessages.length)
    return showMessage(newMessages[0].id);
  // no new messages - go to clock?
  if (options.clockIfAllRead && newMessages.length==0)
    return load();
  // we don't have to time out of this screen...
  cancelReloadTimeout();
  // Otherwise show a menu
  E.showScroller({
    h : 48,
    c : Math.max(MESSAGES.length+1,3), // workaround for 2v10.219 firmware (min 3 not needed for 2v11)
    draw : function(idx, r) {"ram"
      var msg = MESSAGES[idx-1];
      if (msg && msg.new) g.setBgColor(colBg);
      else g.setBgColor((idx&1) ? colSBg1 : colSBg2);
      g.clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1).setColor(g.theme.fg);
      if (idx==0) msg = {id:"back", title:"< Back"};
      if (!msg) return;
      var x = r.x+2, title = msg.title, body = msg.body;
      var img = getMessageImage(msg);
      if (msg.id=="music") {
        title = msg.artist || /*LANG*/"Music";
        body = msg.track;
      }
      if (img) {
        g.drawImage(img, x+24, r.y+24, {rotate:0}); // force centering
        x += 50;
      }
      var m = msg.title+"\n"+msg.body;
      if (msg.src) g.setFontAlign(1,1).setFont("6x8").drawString(msg.src, r.x+r.w-2, r.y+r.h-2);
      if (title) g.setFontAlign(-1,-1).setFont(fontBig).drawString(title, x,r.y+2);
      if (body) {
        g.setFontAlign(-1,-1).setFont("6x8");
        var l = g.wrapString(body, r.w-14);
        if (l.length>3) {
          l = l.slice(0,3);
          l[l.length-1]+="...";
        }
        g.drawString(l.join("\n"), x+10,r.y+20);
      }
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
  var unreadTimeoutSecs = (require('Storage').readJSON("messages.settings.json", true) || {}).unreadTimeout;
  if (unreadTimeoutSecs===undefined) unreadTimeoutSecs=60;
  if (unreadTimeoutSecs)
    unreadTimeout = setTimeout(function() {
      print("Message not seen - reloading");
      load();
    }, unreadTimeoutSecs*1000);
  checkMessages({clockIfNoMsg:0,clockIfAllRead:0,showMsgIfUnread:1});
},10); // if checkMessages wants to 'load', do that
