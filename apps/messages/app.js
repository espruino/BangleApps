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

*/

var Layout = require("Layout");

var MESSAGES = require("Storage").readJSON("messages.json",1)||[];
if (!Array.isArray(MESSAGES)) MESSAGES=[];
var onMessagesModified = function(msg) {
  // TODO: if new, show this new one
  if (msg.new) Bangle.buzz();
  showMessage(msg.id);
};
function saveMessages() {
  require("Storage").writeJSON("messages.json",MESSAGES)
}

function getBackImage() {
  return atob("FhYBAAAAEAAAwAAHAAA//wH//wf//g///BwB+DAB4EAHwAAPAAA8AADwAAPAAB4AAHgAB+AH/wA/+AD/wAH8AA==");
}
function getMessageImage(msg) {
  if (msg.img) return atob(msg.img);
  var s = (msg.src||"").toLowerCase();
  if (s=="skype") return atob("GhoBB8AAB//AA//+Af//wH//+D///w/8D+P8Afz/DD8/j4/H4fP5/A/+f4B/n/gP5//B+fj8fj4/H8+DB/PwA/x/A/8P///B///gP//4B//8AD/+AAA+AA==");
  if (s=="hangouts") return atob("FBaBAAH4AH/gD/8B//g//8P//H5n58Y+fGPnxj5+d+fmfj//4//8H//B//gH/4A/8AA+AAHAABgAAAA=");
  if (s=="whatsapp") return atob("GBiBAAB+AAP/wAf/4A//8B//+D///H9//n5//nw//vw///x///5///4///8e//+EP3/APn/wPn/+/j///H//+H//8H//4H//wMB+AA==");
  if (msg.id=="music") return atob("FhaBAH//+/////////////h/+AH/4Af/gB/+H3/7/f/v9/+/3/7+f/vB/w8H+Dwf4PD/x/////////////3//+A=");
  if (msg.id=="back") return getBackImage();
  return atob("HBKBAD///8H///iP//8cf//j4//8f5//j/x/8//j/H//H4//4PB//EYj/44HH/Hw+P4//8fH//44///xH///g////A==");
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
    {type:"txt", font:"6x15", label:target, bgCol:"#0f0", fillx:1, pad:2 },
    {type:"h", bgCol:"#0f0", fillx:1, c: [
      {type:"txt", font:"6x8", label:"Towards" },
      {type:"txt", font:"6x15:2", label:street }
    ]},
    {type:"h",fillx:1, filly:1, c: [
      msg.img?{type:"img",src:atob(msg.img), scale:2}:{},
      {type:"v", fillx:1, c: [
        {type:"txt", font:"6x15:2", label:distance||"" }
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
    checkMessages();
  });
}

function showMusicMessage(msg) {
  function fmtTime(s) {
    var m = Math.floor(s/60);
    s = (s%60).toString().padStart(2,0);
    return m+":"+s;
  }

  function back() {
    msg.new = false;
    saveMessages();
    layout = undefined;
    checkMessages();
  }
  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:"#0f0",  c: [
      { type:"btn", src:getBackImage, cb:back },
      { type:"v", fillx:1, c: [
        { type:"txt", font:"6x15:2", label:msg.artist, pad:2 },
        { type:"txt", font:"6x15", label:msg.album, pad:2 }
      ]}
    ]},
    {type:"txt", font:"6x15:2", label:msg.track, fillx:1, filly:1, pad:2 },
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

function showMessage(msgid) {
  var msg = MESSAGES.find(m=>m.id==msgid);
  if (!msg) return checkMessages(); // go home if no message found
  if (msg.src=="Maps") return showMapMessage(msg);
  if (msg.id=="music") return showMusicMessage(msg);
  // Normal text message display
  var title=msg.title, titleFont = "6x15:2";
  if (title) {
    var w = g.getWidth()-40;
    if (g.setFont(titleFont).stringWidth(title) > w)
      titleFont = "6x15";
    if (g.setFont(titleFont).stringWidth(title) > w)
      title = g.wrapString(title, w).join("\n");
  }
  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:"#0f0",  c: [
      { type:"img", src:getMessageImage(msg), pad:2 },
      { type:"v", fillx:1, c: [
        {type:"txt", font:"6x15", label:msg.src||"Message", bgCol:"#0f0", fillx:1, pad:2 },
        title?{type:"txt", font:titleFont, label:title, bgCol:"#0f0", fillx:1, pad:2 }:{},
      ]},
    ]},
    {type:"txt", font:"6x15", label:msg.body||"", wrap:true, fillx:1, filly:1, pad:2 },
    {type:"h",fillx:1, c: [
      {type:"btn", src:getBackImage(), cb:()=>checkMessages(true)}, // back
      msg.new?{type:"btn", src:atob("HRiBAD///8D///wj///Fj//8bj//x3z//Hvx/8/fx/j+/x+Ad/B4AL8Rh+HxwH+PHwf+cf5/+x/n/PH/P8cf+cx5/84HwAB4fgAD5/AAD/8AAD/wAAD/AAAD8A=="), cb:()=>{
        msg.new = false; // read mail
        saveMessages();
        checkMessages();
      }}:{}
    ]}
  ]});
  g.clearRect(Bangle.appRect);
  layout.render();
}

function checkMessages(forceShowMenu) {
  // If no messages, just show 'no messages' and return
  if (!MESSAGES.length)
    return E.showPrompt("No Messages",{
      title:"Messages",
      img:require("heatshrink").decompress(atob("kkk4UBrkc/4AC/tEqtACQkBqtUDg0VqAIGgoZFDYQIIM1sD1QAD4AIBhnqA4WrmAIBhc6BAWs8AIBhXOBAWz0AIC2YIC5wID1gkB1c6BAYFBEQPqBAYXBEQOqBAnDAIQaEnkAngaEEAPDFgo+IKA5iIOhCGIAFb7RqAIGgtUBA0VqobFgNVA")),
      buttons : {"Ok":1}
    }).then(() => { load() });
  // we have >0 messages
  // If we have a new message, show it
  if (!forceShowMenu) {
    var newMessages = MESSAGES.filter(m=>m.new);
    if (newMessages.length)
      return showMessage(newMessages[0].id);
  }
  // Otherwise show a menu
  E.showScroller({
    h : 48,
    c : MESSAGES.length+1,
    draw : function(idx, r) {"ram"
      var msg = MESSAGES[idx-1];
      if (msg && msg.new) g.setBgColor("#4F4");
      else g.setBgColor((idx&1) ? "#CFC" : "#9F9");
      g.clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1).setColor(g.theme.fg);
      if (idx==0) msg = {id:"back", title:"< Back"};
      if (!msg) return;
      var x = r.x+2, title = msg.title, body = msg.body;
      var img = getMessageImage(msg);
      if (msg.id=="music") {
        title = msg.artist || "Music";
        body = msg.track;
      }
      if (img) {
        g.drawImage(img, x+24, r.y+24, {rotate:0}); // force centering
        x += 50;
      }
      var m = msg.title+"\n"+msg.body;
      if (msg.src) g.setFontAlign(1,-1).drawString(msg.src, r.x+r.w-2, r.t+2);
      if (title) g.setFontAlign(-1,-1).setFont("12x20").drawString(title, x,r.y+2);
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

Bangle.loadWidgets();
Bangle.drawWidgets();
checkMessages();
