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
GB({"t":"notify~","id":1,"body":"Campton - 11:55 ETA"})
GB({"t":"notify~","id":1,"title":"0 yd - High St"})
GB({"t":"notify~","id":1,"body":"Campton - 11:56 ETA"})

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

// Show a single menu item for the message
function showMessageMenuItem(y, idx) {
  var msg = MESSAGES[idx];
  var W = g.getWidth(), H=48;
  if (msg.new) g.setBgColor("#4F4");
  else g.setBgColor("#CFC");
  g.clearRect(0,y,W-1,y+H-1).setColor(g.theme.fg);
  var m = msg.title+"\n"+msg.body;
  if (msg.src) g.setFontAlign(1,-1).drawString(msg.src, W-2, y+2);
  if (msg.title) g.setFontAlign(-1,-1).setFont("12x20").drawString(msg.title, 2,y+2);
  if (msg.body) {
    g.setFontAlign(-1,-1).setFont("6x8");
    var l = g.wrapString(msg.body, W-14);
    if (l.length>3) {
      l = l.slice(0,3);
      l[l.length-1]+="...";
    }
    g.drawString(l.join("\n"), 12,y+20);
  }
}
//test
//g.clear(1); showMessageMenuItem(MESSAGES[0],24)

if (process.env.HWVERSION==1) { // Bangle.js 1
  showBigMenu = function(options) {
  /* options = {
    h = height
    items = # of items
    draw = function(y, idx)
    onSelect = function(idx)
  }*/
    var selected = 0;
    var menuScroll = 0;
    var menuShowing = false;
    var w = g.getWidth();
    var h = g.getHeight();
    var m = w/2;
    var n = Math.floor((h-48)/options.h);

    function drawMenu() {
      g.reset();
      if (selected>=n+menuScroll) menuScroll = 1+selected-n;
      if (selected<menuScroll) menuScroll = selected;
      // draw
      g.setColor(g.theme.fg);
      for (var i=0;i<n;i++) {
        var idx = i+menuScroll;
        if (idx<0 || idx>=options.items) break;
        var y = 24+i*options.h;
        options.draw(y, idx);
        // border for selected
        if (i+menuScroll==selected) {
          g.setColor(g.theme.fgG).drawRect(0,y,w-1,y+options.h-1).drawRect(1,y+1,w-2,y+options.h-2);
        }
      }
      // arrows
      g.setColor(menuScroll ? g.theme.fg : g.theme.bg);
      g.fillPoly([m,6,m-14,20,m+14,20]);
      g.setColor((options.items>n+menuScroll) ? g.theme.fg : g.theme.bg);
      g.fillPoly([m,h-7,m-14,h-21,m+14,h-21]);
    }
    g.clearRect(0,24,w-1,h-1);
    drawMenu();
    Bangle.setUI("updown",dir=>{
      if (dir) {
        selected += dir;
        if (selected<0) selected = options.items-1;
        if (selected>=options.items) selected = 0;
        drawMenu();
      } else {
        options.onSelect(selected);
      }
    });
  }
} else { // Bangle.js 2
  showBigMenu = function(options) {
    /* options = {
      h = height
      items = # of items
      draw = function(y, idx)
      onSelect = function(idx)
    }*/
    var menuScroll = 0;
    var menuShowing = false;
    var w = g.getWidth();
    var h = g.getHeight();
    var n = Math.ceil((h-24)/options.h);
    var menuScrollMax = options.h*options.items - (h-24);

    function drawItem(i) {
      var y = 24+i*options.h-menuScroll;
      if (i<0 || i>=options.items || y<-options.h || y>=h) return;
      options.draw(y, i);
    }

    function drawMenu() {
      g.reset().clearRect(0,24,w-1,h-1);
      g.setClipRect(0,24,w-1,h-1);
      for (var i=0;i<n;i++) drawItem(i);
      g.setClipRect(0,0,w-1,h-1);
    }
    drawMenu();
    g.flip(); // force an update now to make this snappier

    Bangle.dragHandler = e=>{
      var dy = e.dy;
      if (menuScroll - dy < 0)
        dy = menuScroll;
      if (menuScroll - dy > menuScrollMax)
        dy = menuScroll - menuScrollMax;
      if (!dy) return;
      g.reset().setClipRect(0,24,g.getWidth()-1,g.getHeight()-1);
      g.scroll(0,dy);
      menuScroll -= dy;
      if (e.dy < 0) {
        drawItem(Math.floor((menuScroll+24+g.getHeight())/options.h)-1);
        if (e.dy <= -options.h) drawItem(Math.floor((menuScroll+24+h)/options.h)-2);
      } else {
        drawItem(Math.floor((menuScroll+24)/options.h));
        if (e.dy >= options.h) drawItem(Math.floor((menuScroll+24)/options.h)+1);
      }
      g.setClipRect(0,0,w-1,h-1);
    };
    Bangle.on('drag',Bangle.dragHandler);
    Bangle.touchHandler = (_,e)=>{
      if (e.y<20) return;
      var i = Math.floor((e.y+menuScroll-24) / options.h);
      if (i>=0 && i<options.items)
        options.onSelect(i);
    };
    Bangle.on("touch", Bangle.touchHandler);
  }
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
  // TODO: IF A NEW MESSAGE, SHOW IT
  if (!forceShowMenu) {
    var newMessages = MESSAGES.filter(m=>m.new);
    if (newMessages.length)
      return showMessage(newMessages[0].id);
  }
  // Otherwise show a menu
  var m = {
    "":{title:"Messages"},
    "< Back": ()=>load()
  };
  /*g.setFont("6x8");
  MESSAGES.forEach(msg=>{
    // "id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"
    var title = g.wrapString(msg.title, g.getWidth())[0];
    m[title] = function() {
      showMessage(msg.id);
    }
  });
  E.showMenu(m);*/
  showBigMenu({
    h : 48,
    items : MESSAGES.length,
    draw : showMessageMenuItem,
    onSelect : idx => showMessage(MESSAGES[idx].id)
  });
}

Bangle.loadWidgets();
Bangle.drawWidgets();
checkMessages();
