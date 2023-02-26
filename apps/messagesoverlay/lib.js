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

const ovrx = 10;
const ovry = 10;
const ovrw = g.getWidth()-2*ovrx;
const ovrh = g.getHeight()-2*ovry;

let lockListener;

let LOG = function() {
  //print.apply(null, arguments);
};

let settings = (() => {
  let tmp = {};

  tmp.fontSmall = "6x8";
  tmp.fontMedium = g.getFonts().includes("Vector") ? "Vector:16" : "6x8:2";
  tmp.fontBig = g.getFonts().includes("12x20") ? "12x20" : "6x8:2";
  tmp.fontLarge = g.getFonts().includes("6x15") ? "6x15:2" : "6x8:4";

  tmp.quiet = ((require('Storage').readJSON('settings.json', 1) || {}).quiet);

  return tmp;
})();

let eventQueue = [];
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
      eventQueue.unshift(event);

      if (!callInProgress)
        showMessage(ovr, event);
      break;

    case "modify":
      let find = false;
      eventQueue.forEach(element => {
        if (element.id == event.id) {
          find = true;
          Object.assign(element, event);
        }
      });
      if (!find)
        eventQueue.unshift(event);

      if (!callInProgress)
        showMessage(ovr, event);
      break;

    case "remove":
      if (eventQueue.length == 0 && !callInProgress)
        next(ovr);

      if (!callInProgress && eventQueue[0] !== undefined && eventQueue[0].id == event.id)
        next(ovr);

      else {
        let neweventQueue = [];
        eventQueue.forEach(element => {
          if (element.id != event.id)
            neweventQueue.push(element);
        });
        eventQueue = neweventQueue;
      }

      break;
    case "musicstate":
    case "musicinfo":

      break;
  }
};

let roundedRect = function(ovr, x,y,w,h,filled){
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
  ovr.drawPoly(poly,true);
  if (filled) ovr.fillPoly(poly,true);
};

let drawScreen = function(ovr, title, titleFont, src, iconcolor, icon){
  ovr.setBgColor(ovr.theme.bg2);
  ovr.clearRect(0,0,ovr.getWidth(),40);

  ovr.setColor(ovr.theme.fg2);
  ovr.setFont(settings.fontSmall);
  ovr.setFontAlign(0,-1);
  ovr.drawString(src, (ovr.getWidth()-ovrx)/2, 2);

  ovr.setFont(titleFont);
  ovr.drawString(title, (ovr.getWidth()-ovrx)/2, 12);

  ovr.setColor(ovr.theme.fg2);
  roundedRect(ovr, ovr.getWidth()-26,5,22,30,false);
  ovr.drawString("X",ovr.getWidth()-16,10);

  ovr.setColor(iconcolor);
  ovr.setBgColor("#fff");
  ovr.drawImage(icon,8,8);
};

let showMessage = function(ovr, msg) {
  LOG("showMessage");
  ovr.setBgColor(settings.colBg);


  if (typeof msg.CanscrollDown === "undefined")
    msg.CanscrollDown = false;
  if (typeof msg.CanscrollUp === "undefined")
    msg.CanscrollUp = false;

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

  drawMessage(ovr, msg);
};

let drawBorder = function(ovr) {
  if (Bangle.isLocked())
    ovr.setColor(ovr.theme.fgH);
  else
    ovr.setColor(ovr.theme.fg);
  ovr.drawRect(0,0,ovr.getWidth()-1,ovr.getHeight()-1);
  ovr.drawRect(1,1,ovr.getWidth()-2,ovr.getHeight()-2);
  Bangle.setLCDOverlay(ovr,10,10);
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
    let w = ovr.getWidth() - 40;
    if (ovr.setFont(titleFont).stringWidth(title) > w)
      titleFont = settings.fontMedium;
    if (ovr.setFont(titleFont).stringWidth(title) > w) {
      lines = ovr.wrapString(title, w);
      title = (lines.length > 2) ? lines.slice(0, 2).join("\n") + "..." : lines.join("\n");
    }
  }

  drawScreen(ovr, title, titleFont, msg.src || /*LANG*/ "Message", require("messageicons").getColor(msg), require("messageicons").getImage(msg));

  stopCallBuzz();
  if (!settings.quiet) {
    if (msg.new) {
      msg.new = false;
      callBuzzTimer = setInterval(function() {
        Bangle.buzz(500);
      }, 1000);

      Bangle.buzz(500);
    }
  }
  drawMessage(ovr, msg);
};

let next = function(ovr) {
  LOG("next");
  stopCallBuzz();

  if (!callInProgress)
    eventQueue.shift();

  callInProgress = false;
  if (eventQueue.length == 0) {
    LOG("no element in queue - closing");
    cleanup();
    return;
  }

  showMessage(ovr, eventQueue[0]);
};

let showMapMessage = function(ovr, msg) {
  ovr.clearRect(Bangle.appRect);
  drawMessage(ovr, {
    body: "Not implemented!"
  });
};

let callBuzzTimer = null;
let stopCallBuzz = function() {
  if (callBuzzTimer) {
    clearInterval(callBuzzTimer);
    callBuzzTimer = null;
  }
};

let drawTriangleUp = function(ovr) {
  ovr.reset();
  ovr.fillPoly([ovr.getWidth()-9, 46,ovr.getWidth()-14, 56,ovr.getWidth()-4, 56]);
};

let drawTriangleDown = function(ovr) {
  ovr.reset();
  ovr.fillPoly([ovr.getWidth()-9, ovr.getHeight()-6, ovr.getWidth()-14, ovr.getHeight()-16, ovr.getWidth()-4, ovr.getHeight()-16]);
};

let scrollUp = function(ovr) {
  msg = eventQueue[0];
  LOG("up", msg);
  if (typeof msg.FirstLine === "undefined")
    msg.FirstLine = 0;
  if (typeof msg.CanscrollUp === "undefined")
    msg.CanscrollUp = false;

  if (!msg.CanscrollUp) return;

  msg.FirstLine = msg.FirstLine > 0 ? msg.FirstLine - 1 : 0;

  drawMessage(ovr, msg);
};

let scrollDown = function(ovr) {
  msg = eventQueue[0];
  LOG("down", msg);
  if (typeof msg.FirstLine === "undefined")
    msg.FirstLine = 0;
  if (typeof msg.CanscrollDown === "undefined")
    msg.CanscrollDown = false;

  if (!msg.CanscrollDown) return;

  msg.FirstLine = msg.FirstLine + 1;
  drawMessage(ovr, msg);
};

let drawMessage = function(ovr, msg) {
  let MyWrapString = function(str, maxWidth) {
    str = str.replace("\r\n", "\n").replace("\r", "\n");
    return ovr.wrapString(str, maxWidth);
  };

  if (typeof msg.FirstLine === "undefined") msg.FirstLine = 0;

  let bodyFont = typeof msg.bodyFont === "undefined" ? settings.fontMedium : msg.bodyFont;
  let Padding = 3;
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

  let NumLines = 7;

  let linesToPrint = (msg.lines.length > NumLines) ? msg.lines.slice(msg.FirstLine, msg.FirstLine + NumLines) : msg.lines;

  let yText = 40;

  ovr.setBgColor(ovr.theme.bg);
  ovr.clearRect(2, yText, ovrw-2, ovrh-2);
  let xText = Padding;
  yText += Padding;
  ovr.setFont(bodyFont);
  let HText = ovr.getFontHeight();

  yText = ((ovrh - yText) / 2) - (linesToPrint.length * HText / 2) + yText;

  if (linesToPrint.length <= 2) {
    ovr.setFontAlign(0, -1);
    xText = ovr.getWidth() / 2;
  } else
    ovr.setFontAlign(-1, -1);


  linesToPrint.forEach((line, i) => {
    ovr.drawString(line, xText, yText + HText * i);
  });

  if (msg.FirstLine != 0) {
    msg.CanscrollUp = true;
    drawTriangleUp(ovr);
  } else
    msg.CanscrollUp = false;

  if (msg.FirstLine + linesToPrint.length < msg.lines.length) {
    msg.CanscrollDown = true;
    drawTriangleDown(ovr);
  } else
    msg.CanscrollDown = false;
  Bangle.setLCDOverlay(ovr,ovrx,ovry);
};

let doubleTapUnlock = function(data) {
  if (data.double)
  {
    Bangle.setLocked(false);
    Bangle.setLCDPower(1);
  }
};

let getSwipeHandler = function(ovr){
  return (lr, ud) => {
    if (ud == 1) {
      scrollUp(ovr);
    } else if (ud == -1){
      scrollDown(ovr);
    }
  };
};

let getTouchHandler = function(ovr){
  return (_, xy) => {
    if (xy.y < ovry + 40){
      next(ovr);
    }
  };
};

let touchHandler;
let swipeHandler;

let restoreHandler = function(event){
  if (backup[event]){
    Bangle["#on" + event]=backup[event];
    backup[event] = undefined;
  }
};

let backupHandler = function(event){
  backup[event] = Bangle["#on" + event];
  Bangle.removeAllListeners(event);
};

let cleanup = function(){
  if (lockListener) {
    Bangle.removeListener("lock", lockListener);
    lockListener = undefined;
  }
  restoreHandler("touch");
  restoreHandler("swipe");
  restoreHandler("drag");

  Bangle.removeListener("tap", doubleTapUnlock);
  if (touchHandler) Bangle.removeListener("touch", touchHandler);
  if (swipeHandler) Bangle.removeListener("swipe", swipeHandler);
  Bangle.setLCDOverlay();
};

let backup = {};

let main = function(ovr, event) {
  LOG("Main", event, settings);
  if (!lockListener) {
    lockListener = function (){
      drawBorder(ovr);
    };
    Bangle.on('lock', lockListener);
  }

  backupHandler("touch");
  backupHandler("swipe");
  backupHandler("drag");

  Bangle.on('tap', doubleTapUnlock);
  if (touchHandler) Bangle.removeListener("touch",touchHandler);
  if (swipeHandler) Bangle.removeListener("swipe",swipeHandler);
  touchHandler = getTouchHandler(ovr);
  swipeHandler = getSwipeHandler(ovr);
  Bangle.on('touch', touchHandler);
  Bangle.on('swipe', swipeHandler);

  if (event !== undefined){
    manageEvent(ovr, event);
    Bangle.setLCDPower(1);
    drawBorder(ovr);
    Bangle.setLCDOverlay(ovr,10,10);
  } else {
    LOG("No event given");
    cleanup();
  }
};

exports.pushMessage = function(event) {
  if( event.id=="music") return require_real("messages").pushMessage(event);

  let ovr = Graphics.createArrayBuffer(ovrw, ovrh, 4, {
    msb: true
  });

  let _g = g;
  g = ovr;

  ovr.theme = g.theme;
  if(event.t=="remove") return;
  main(ovr, event);
  Bangle.setLCDOverlay(ovr, 10, 10);

  g = _g;
};


//Call original message library
exports.clearAll = function() { return require_real("messages").clearAll();};
exports.getMessages = function() { return require_real("messages").getMessages();};
exports.status = function() { return require_real("messages").status();};
exports.buzz = function() { return require_real("messages").buzz(msgSrc);};
exports.stopBuzz = function() { return require_real("messages").stopBuzz();};