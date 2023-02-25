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


let lockListener;

let LOG = function() {
  print.apply(null, arguments);
};

let settings = (() => {
  let tmp = {};
  tmp.NewEventFileName = "messagesoverlay.NewEvent.json";

  tmp.fontSmall = "6x8";
  tmp.fontMedium = g.getFonts().includes("Vector") ? "Vector:16" : "6x8:2";
  tmp.fontBig = g.getFonts().includes("12x20") ? "12x20" : "6x8:2";
  tmp.fontLarge = g.getFonts().includes("6x15") ? "6x15:2" : "6x8:4";

  tmp.colLock = g.theme.dark ? "#ff0000" : "#ff0000";

  tmp.quiet = ((require('Storage').readJSON('settings.json', 1) || {}).quiet);

  return tmp;
})();
let EventQueue = [];
let callInProgress = false;


let manageEvent = function(ovr, event) {
  event.new = true;

  LOG("manageEvent");
  if (event.id == "call") {
    showCall(ovr, event);
    return;
  }
  switch (event.t) {
    case "add":
      EventQueue.unshift(event);

      if (!callInProgress)
        showMessage(ovr, event);
      break;

    case "modify":
      let find = false;
      EventQueue.forEach(element => {
        if (element.id == event.id) {
          find = true;
          Object.assign(element, event);
        }
      });
      if (!find)
        EventQueue.unshift(event);

      if (!callInProgress)
        showMessage(ovr, event);
      break;

    case "remove":
      if (EventQueue.length == 0 && !callInProgress)
        next(ovr);

      if (!callInProgress && EventQueue[0] !== undefined && EventQueue[0].id == event.id)
        next(ovr);

      else {
        let newEventQueue = [];
        EventQueue.forEach(element => {
          if (element.id != event.id)
            newEventQueue.push(element);
        });
        EventQueue = newEventQueue;
      }

      break;
    case "musicstate":
    case "musicinfo":

      break;
  }
};

let drawScreen = function(ovr, title, titleFont, src, iconcolor, icon){
  ovr.setBgColor(ovr.theme.bg2);
  ovr.clearRect(0,0,ovr.getWidth(),40);

  ovr.setColor(ovr.theme.fg2);
  ovr.setFont(settings.fontSmall);
  ovr.setFontAlign(0,-1);
  ovr.drawString(src, ovr.getWidth()/2, 2);

  ovr.setFont(titleFont);
  ovr.drawString(title, ovr.getWidth()/2, 12);

  let x = 150;
  let y = 5;
  let w = 22;
  let h = 30;
  var poly = [
    x,y+4,
    x+4,y,
    x+w-5,y,
    x+w-1,y+4,
    x+w-1,y+h-5,
    x+w-5,y+h-1,
    x+4,y+h-1,
    x,y+h-5,
    x,y+4
  ];
  ovr.setColor(ovr.theme.fg2);
  ovr.drawPoly(poly,true);
  ovr.drawString("X",160,10);

  ovr.setColor(iconcolor);
  ovr.setBgColor("#fff");
  ovr.drawImage(icon,10,10);
};

let showMessage = function(ovr, msg) {
  LOG("showMessage");
  LOG(msg);
  ovr.setBgColor(settings.colBg);


  if (typeof msg.CanScrollDown === "undefined")
    msg.CanScrollDown = false;
  if (typeof msg.CanScrollUp === "undefined")
    msg.CanScrollUp = false;

  // Normal text message display
  let title = msg.title,
    titleFont = settings.fontLarge,
    lines;
  if (title) {
    let w = ovr.getWidth() - 48;
    if (ovr.setFont(titleFont).stringWidth(title) > w)
      titleFont = settings.fontMedium;
    if (ovr.setFont(titleFont).stringWidth(title) > w) {
      lines = ovr.wrapString(title, w);
      title = (lines.length > 2) ? lines.slice(0, 2).join("\n") + "..." : lines.join("\n");
    }
  }

  drawScreen(ovr, title, titleFont, msg.src || /*LANG*/ "Message", require("messageicons").getColor(msg), require("messageicons").getImage(msg));

  if (!settings.quiet && msg.new) {
    msg.new = false;
    Bangle.buzz();
  }

  PrintMessageStrings(ovr, msg);
};

let DrawLock = function(ovr) {
  if (Bangle.isLocked())
    ovr.setColor(settings.colLock);
  else
    ovr.setColor(ovr.theme.bg2);
  ovr.drawRect(0,0,ovr.getWidth()-1,ovr.getHeight()-1);
  ovr.drawRect(1,1,ovr.getWidth()-2,ovr.getHeight()-2);
  Bangle.setLCDOverlay(ovr,0,0);
};

let showCall = function(ovr, msg) {
  LOG("showCall");
  LOG(msg);

  if (msg.t == "remove") {
    LOG("hide call screen");
    next(ovr); //dont shift
    return;
  }

  callInProgress = true;

  let title = msg.title,
    titleFont = settings.fontLarge,
    lines;
  if (title) {
    let w = ovr.getWidth() - 48;
    if (ovr.setFont(titleFont).stringWidth(title) > w)
      titleFont = settings.fontMedium;
    if (ovr.setFont(titleFont).stringWidth(title) > w) {
      lines = ovr.wrapString(title, w);
      title = (lines.length > 2) ? lines.slice(0, 2).join("\n") + "..." : lines.join("\n");
    }
  }

  drawScreen(ovr, title, titleFont, msg.src || /*LANG*/ "Message", require("messageicons").getColor(msg), require("messageicons").getImage(msg));

  StopBuzzCall();
  if (!settings.quiet) {
    if (msg.new) {
      msg.new = false;
      CallBuzzTimer = setInterval(function() {
        Bangle.buzz(500);
      }, 1000);

      Bangle.buzz(500);
    }
  }
  PrintMessageStrings(ovr, msg);
};

let next = function(ovr) {
  LOG("next");
  StopBuzzCall();

  if (!callInProgress)
    EventQueue.shift();

  callInProgress = false;
  if (EventQueue.length == 0) {
    LOG("no element in queue - closing");
    cleanup();
    return;
  }

  showMessage(ovr, EventQueue[0]);
};

let showMapMessage = function(ovr, msg) {
  ovr.clearRect(Bangle.appRect);
  PrintMessageStrings(ovr, {
    body: "Not implemented!"
  });
};

let CallBuzzTimer = null;
let StopBuzzCall = function() {
  if (CallBuzzTimer) {
    clearInterval(CallBuzzTimer);
    CallBuzzTimer = null;
  }
};

let DrawTriangleUp = function(ovr) {
  ovr.reset();
  ovr.fillPoly([169, 46, 164, 56, 174, 56]);
};

let DrawTriangleDown = function(ovr) {
  ovr.reset();
  ovr.fillPoly([169, 170, 164, 160, 174, 160]);
};

let ScrollUp = function(ovr, msg) {
  msg = EventQueue[0];

  if (typeof msg.FirstLine === "undefined")
    msg.FirstLine = 0;
  if (typeof msg.CanScrollUp === "undefined")
    msg.CanScrollUp = false;

  if (!msg.CanScrollUp) return;

  msg.FirstLine = msg.FirstLine > 0 ? msg.FirstLine - 1 : 0;

  PrintMessageStrings(ovr, msg);
};

let ScrollDown = function(ovr, msg) {
  msg = EventQueue[0];
  if (typeof msg.FirstLine === "undefined")
    msg.FirstLine = 0;
  if (typeof msg.CanScrollDown === "undefined")
    msg.CanScrollDown = false;

  if (!msg.CanScrollDown) return;

  msg.FirstLine = msg.FirstLine + 1;
  PrintMessageStrings(ovr, msg);
};

let PrintMessageStrings = function(ovr, msg) {
  let MyWrapString = function(str, maxWidth) {
    str = str.replace("\r\n", "\n").replace("\r", "\n");
    return ovr.wrapString(str, maxWidth);
  };

  if (typeof msg.FirstLine === "undefined") msg.FirstLine = 0;

  let bodyFont = typeof msg.bodyFont === "undefined" ? settings.fontMedium : msg.bodyFont;
  let Padding = 2;
  if (typeof msg.lines === "undefined") {
    ovr.setFont(bodyFont);
    msg.lines = MyWrapString(msg.body, ovr.getWidth() - (Padding * 2));
    if (msg.lines.length <= 2) {
      bodyFont = ovr.getFonts().includes("Vector") ? "Vector:20" : "6x8:3";
      ovr.setFont(bodyFont);
      msg.lines = MyWrapString(msg.body, ovr.getWidth() - (Padding * 2));
      msg.bodyFont = bodyFont;
    }
  }

  let NumLines = 9;
  let linesToPrint = (msg.lines.length > NumLines) ? msg.lines.slice(msg.FirstLine, msg.FirstLine + NumLines) : msg.lines;


  let yText = 40;

  ovr.setBgColor(ovr.theme.bg);
  ovr.clearRect(0, yText, 176, 176);
  let xText = Padding;
  yText += Padding;
  ovr.setFont(bodyFont);
  let HText = ovr.getFontHeight();

  yText = ((176 - yText) / 2) - (linesToPrint.length * HText / 2) + yText;

  if (linesToPrint.length <= 2) {
    ovr.setFontAlign(0, -1);
    xText = ovr.getWidth() / 2;
  } else
    ovr.setFontAlign(-1, -1);


  linesToPrint.forEach((line, i) => {
    ovr.drawString(line, xText, yText + HText * i);
  });

  if (msg.FirstLine != 0) {
    msg.CanScrollUp = true;
    DrawTriangleUp(ovr);
  } else
    msg.CanScrollUp = false;

  if (msg.FirstLine + linesToPrint.length < msg.lines.length) {
    msg.CanScrollDown = true;
    DrawTriangleDown(ovr);
  } else
    msg.CanScrollDown = false;
};

let doubleTapUnlock = function(data) {
  if (data.double)
  {
    Bangle.setLocked(false);
    Bangle.setLCDPower(1);
  }
};

let getTouchHandler = function(ovr){
  return (button, xy) => {
    if (xy.y < 40){
      next(ovr);
    } else if (xy.y < (ovr.getHeight() - 40)/2) {
      ScrollUp(ovr);
    } else {
      ScrollDown(ovr);
    }
  };
};

let touchHandler;

let cleanup = function(){
  if (lockListener) {
    Bangle.removeListener("lock", lockListener);
    lockListener = undefined;
  }
  if (touchBack){
    Bangle["#ontouch"]=touchBack;
    LOG("Restored touch handlers:", touchBack);
    touchBack = undefined;
  }

  Bangle.removeListener("tap", doubleTapUnlock);
  if (touchHandler) Bangle.removeListener("touch", touchHandler);
  Bangle.setLCDOverlay();
};

let touchBack;

let main = function(ovr, event) {
  LOG("Main", event, settings);
  if (!lockListener) {
    lockListener = function (){
      DrawLock(ovr);
    };
    Bangle.on('lock', lockListener);
  }

  touchBack = Bangle["#ontouch"];
  Bangle.removeAllListeners("touch");

  Bangle.on('tap', doubleTapUnlock);
  if (touchHandler) Bangle.removeListener("touch",touchHandler);
  touchHandler = getTouchHandler(ovr);
  Bangle.on('touch', touchHandler);

  if (event !== undefined){
    manageEvent(ovr, event);
    Bangle.setLCDPower(1);
    DrawLock(ovr);
    Bangle.setLCDOverlay(ovr,0,0);
  } else {
    LOG("No event given");
    cleanup();
  }
};

exports.pushMessage = function(event) {
  if( event.id=="music") return require_real("messages").pushMessage(event);

  let ovr = Graphics.createArrayBuffer(g.getWidth(), g.getHeight(), 4, {
    msb: true
  });

  let _g = g;
  g = ovr;

  ovr.theme = g.theme;
  if(event.t=="remove") return;
  main(ovr, event);
  Bangle.setLCDOverlay(ovr, 0, 0);

  g = _g;
};


//Call original message library
exports.clearAll = function() { return require_real("messages").clearAll();};
exports.getMessages = function() { return require_real("messages").getMessages();};
exports.status = function() { return require_real("messages").status();};
exports.buzz = function() { return require_real("messages").buzz(msgSrc);};
exports.stopBuzz = function() { return require_real("messages").stopBuzz();};