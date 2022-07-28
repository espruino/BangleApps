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
require("messages").pushMessage({"t":"add","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"})
// maps
require("messages").pushMessage({"t":"add","id":1,"src":"Maps","title":"0 yd - High St","body":"Campton - 11:48 ETA","img":"GhqBAAAMAAAHgAAD8AAB/gAA/8AAf/gAP/8AH//gD/98B//Pg/4B8f8Afv+PP//n3/f5//j+f/wfn/4D5/8Aef+AD//AAf/gAD/wAAf4AAD8AAAeAAADAAA="});
// call
require("messages").pushMessage({"t":"add","id":"call","src":"Phone","title":"Bob","body":"12421312",positive:true,negative:true})
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
  if (msg && msg.id!=="music" && msg.new && active!="map" &&
      !((require('Storage').readJSON('setting.json', 1) || {}).quiet)) {
    if (WIDGETS["messages"]) WIDGETS["messages"].buzz(msg.src);
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
  g.reset().clearRect(Bangle.appRect);
  layout.render();
  function back() { // mark as not new and return to menu
    msg.new = false;
    saveMessages();
    layout = undefined;
    checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1,openMusic:0});
  }
  Bangle.setUI({mode:"updown", back: back}, back); // any input takes us back
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
    },
    back : () => showMessage(msg.id)
  });
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
    layout = undefined;
    msg.new = false; saveMessages(); // read mail
    cancelReloadTimeout(); // don't auto-reload to clock now
    checkMessages({clockIfNoMsg:1,clockIfAllRead:0,showMsgIfUnread:0,openMusic:openMusic});
  }
  var buttons = [
  ];
  if (msg.positive) {
    buttons.push({type:"btn", src:atob("GRSBAAAAAYAAAcAAAeAAAfAAAfAAAfAAAfAAAfAAAfBgAfA4AfAeAfAPgfAD4fAA+fAAP/AAD/AAA/AAAPAAADAAAA=="), cb:()=>{
      msg.new = false; saveMessages();
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,true);
      checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1,openMusic:openMusic});
    }});
  }
  if (msg.negative) {
    if (buttons.length) buttons.push({width:32}); // nasty hack...
    buttons.push({type:"btn", src:atob("FhaBADAAMeAB78AP/4B/fwP4/h/B/P4D//AH/4AP/AAf4AB/gAP/AB/+AP/8B/P4P4fx/A/v4B//AD94AHjAAMA="), cb:()=>{
      msg.new = false; saveMessages();
      cancelReloadTimeout(); // don't auto-reload to clock now
      Bangle.messageResponse(msg,false);
      checkMessages({clockIfNoMsg:1,clockIfAllRead:1,showMsgIfUnread:1,openMusic:openMusic});
    }});
  }


  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:g.theme.bg2, col: g.theme.fg2,  c: [
      { type:"v", fillx:1, c: [
        {type:"txt", font:fontSmall, label:msg.src||/*LANG*/"Message", bgCol:g.theme.bg2, col: g.theme.fg2, fillx:1, pad:2, halign:1 },
        title?{type:"txt", font:titleFont, label:title, bgCol:g.theme.bg2, col: g.theme.fg2, fillx:1, pad:2 }:{},
      ]},
      { type:"btn", src:require("messages").getMessageImage(msg), col:require("messages").getMessageImageCol(msg, g.theme.fg2), pad: 3, cb:()=>{
        cancelReloadTimeout(); // don't auto-reload to clock now
        showMessageSettings(msg);
      }},
    ]},
    {type:"txt", font:bodyFont, label:body, fillx:1, filly:1, pad:2, cb:()=>{
      // allow tapping to show a larger version
      showMessageScroller(msg);
    } },
    {type:"h",fillx:1, c: buttons}
  ]},{back:goBack});
  g.reset().clearRect(Bangle.appRect);
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
  var newMessages = MESSAGES.filter(m=>m.new&&m.id!="music");
  // If we have a new message, show it
  if (options.showMsgIfUnread && newMessages.length) {
    showMessage(newMessages[0].id);
    // buzz after showMessage, so beingbusy during layout doesn't affect the buzz pattern
    if (global.BUZZ_ON_NEW_MESSAGE) {
      // this is set if we entered the messages app by loading `messages.new.js`
      // ... but only buzz the first time we view a new message
      global.BUZZ_ON_NEW_MESSAGE = false;
      // messages.buzz respects quiet mode - no need to check here
      WIDGETS.messages.buzz(newMessages[0].src);
    }
    return;
  }
  // no new messages: show playing music? (only if we have playing music to show)
  if (options.openMusic && MESSAGES.some(m=>m.id=="music" && m.track && m.state=="play"))
    return showMessage('music');
  // no new messages - go to clock?
  if (options.clockIfAllRead && newMessages.length==0)
    return load();
  active = "main";
  // Otherwise show a menu
  E.showScroller({
    h : 48,
    c : Math.max(MESSAGES.length,3), // workaround for 2v10.219 firmware (min 3 not needed for 2v11)
    draw : function(idx, r) {"ram"
      var msg = MESSAGES[idx];
      if (msg && msg.new) g.setBgColor(g.theme.bgH).setColor(g.theme.fgH);
      else g.setColor(g.theme.fg);
      g.clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
      if (!msg) return;
      var x = r.x+2, title = msg.title, body = msg.body;
      var img = require("messages").getMessageImage(msg);
      if (msg.id=="music") {
        title = msg.artist || /*LANG*/"Music";
        body = msg.track;
      }
      if (img) {
        var fg = g.getColor();
        g.setColor(require("messages").getMessageImageCol(msg,fg)).drawImage(img, x+24, r.y+24, {rotate:0}) // force centering
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
    select : idx => showMessage(MESSAGES[idx].id),
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
Bangle.drawWidgets();

setTimeout(() => {
  var unreadTimeoutMillis = (settings.unreadTimeout || 60) * 1000;
  if (unreadTimeoutMillis) {
    unreadTimeout = setTimeout(load, unreadTimeoutMillis);
  }
  // only openMusic on launch if music is new
  var newMusic = MESSAGES.some(m => m.id === "music" && m.new);
  checkMessages({ clockIfNoMsg: 0, clockIfAllRead: 0, showMsgIfUnread: 1, openMusic: newMusic && settings.openMusic });
}, 10); // if checkMessages wants to 'load', do that
