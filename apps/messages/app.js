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

GB({"t":"notify","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"})
GB({"t":"notify","id":2,"src":"Hangouts","title":"Gordon","body":"Hello world quite a lot of text here..."})
GB({"t":"notify","id":3,"src":"Messages","title":"Ted","body":"Bed time."})
GB({"t":"notify","id":4,"src":"Messages","title":"Kailo","body":"Mmm... food"})
GB({"t":"notify-","id":1})

GB({"t":"notify","id":1,"src":"Maps","title":"0 yd - High St","body":"Campton - 11:48 ETA","img":"Y2MBAA....AAAAAAAAAAAAAA="})
GB({"t":"notify~","id":1,"body":"Campton - 11:54 ETA"})
GB({"t":"notify~","id":1,"title":"High St"})

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
  layout = new Layout({
    type:"v", c: [
      {type:"txt", font:"6x15", label:target, bgCol:"#0f0", fillx:1, pad:2 },
      {type:"h", bgCol:"#0f0", fillx:1, c: [
        {type:"txt", font:"6x8", label:"Towards" },
        {type:"txt", font:"6x15:2", label:street }
      ]},
      {type:"h",fillx:1, filly:1, c: [
        {type:"img",src:atob(msg.img)},
        {type:"v", fillx:1, c: [
          {type:"txt", font:"6x15:2", label:distance||"" }
        ]},
      ]},

      {type:"txt", font:"6x8:2", label:eta }
    ]
  });
  g.clearRect(0,24,g.getWidth()-1,g.getHeight()-1);
  layout.render();
  Bangle.setUI("updown",function() {
    // any input to mark as not new and return to menu
    msg.new = false;
    saveMessages();
    checkMessages();
  });
}

function showMessage(msgid) {
  var msg = MESSAGES.find(m=>m.id==msgid);
  if (!msg) return checkMessages(); // go home if no message found
  if (msg.src=="Maps") return showMapMessage(msg);
  var m = msg.title+"\n"+msg.body;
  E.showPrompt(m,{title:"Message", buttons : {"Read":"read", "Back":"back"}}).then(chosen => {
    if (chosen=="read") {
      // any input to mark as not new and return to menu
      msg.new = false;
      saveMessages();
      checkMessages();
    } else {
      checkMessages(true);
    }
  });
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
    c : MESSAGES.length,
    draw : function(idx, r) {"ram"
      var msg = MESSAGES[idx-1];
      if (msg && msg.new) g.setBgColor("#4F4");
      else g.setBgColor((idx&1) ? "#CFC" : "#9F9");
      g.clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1).setColor(g.theme.fg);
      if (idx==0) msg = {title:"< Back"};
      var m = msg.title+"\n"+msg.body;
      if (msg.src) g.setFontAlign(1,-1).drawString(msg.src, r.x+r.w-2, r.t+2);
      if (msg.title) g.setFontAlign(-1,-1).setFont("12x20").drawString(msg.title, r.x+2,r.y+2);
      if (msg.body) {
        g.setFontAlign(-1,-1).setFont("6x8");
        var l = g.wrapString(msg.body, r.w-14);
        if (l.length>3) {
          l = l.slice(0,3);
          l[l.length-1]+="...";
        }
        g.drawString(l.join("\n"), r.x+12,r.y+20);
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
