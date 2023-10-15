const MIN_FREE_MEM = 1000;
const LOW_MEM = 2000;
const ovrx = 10;
const ovry = 10;
const ovrw = g.getWidth()-2*ovrx;
const ovrh = g.getHeight()-2*ovry;
let _g = g;

let lockListener;
let quiet;

let LOG = function() {
  //print.apply(null, arguments);
};

let isQuiet = function(){
  if (quiet == undefined) quiet = (require('Storage').readJSON('setting.json', 1) || {}).quiet;
  return quiet;
};

let settings = {
  fontSmall:"6x8",
  fontMedium:"Vector:14",
  fontBig:"Vector:20",
  fontLarge:"Vector:30",
};

let eventQueue = [];
let callInProgress = false;

let show = function(ovr){
  let img = ovr;
  LOG("show", img.getBPP());
  if (ovr.getBPP() == 1) {
    img = ovr.asImage();
    img.palette = new Uint16Array([_g.theme.fg,_g.theme.bg]);
  }
  Bangle.setLCDOverlay(img, ovrx, ovry);
};

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
      else 
        eventQueue = [];

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
  ovr.clearRect(2,2,ovr.getWidth()-3,37);

  ovr.setColor(ovr.theme.fg2);
  ovr.setFont(settings.fontSmall);
  ovr.setFontAlign(0,-1);

  let textCenter = (ovr.getWidth()+35-26)/2;

  if (src) {
    let shortened = src;
    while (ovr.stringWidth(shortened) > ovr.getWidth()-80) shortened = shortened.substring(0,shortened.length-2);
    if (shortened.length != src.length) shortened += "...";
    ovr.drawString(shortened, textCenter, 2);
  }

  ovr.setFontAlign(0,0);
  ovr.setFont(titleFont);
  if (title) ovr.drawString(title, textCenter, 38/2 + 5);

  ovr.setColor(ovr.theme.fg2);

  ovr.setFont(settings.fontMedium);
  roundedRect(ovr, ovr.getWidth()-26,5,22,30,false);
  ovr.setFont("Vector:16");
  ovr.drawString("X",ovr.getWidth()-14,21);

  ovr.setColor("#888");
  roundedRect(ovr, 5,5,30,30,true);
  ovr.setColor(ovr.getBPP() != 1 ? iconcolor : ovr.theme.bg2);
  ovr.drawImage(icon,8,8);
};

let showMessage = function(ovr, msg) {
  LOG("showMessage");
  ovr.setBgColor(ovr.theme.bg);

  if (typeof msg.CanscrollDown === "undefined")
    msg.CanscrollDown = false;
  if (typeof msg.CanscrollUp === "undefined")
    msg.CanscrollUp = false;

  // Normal text message display
  let title = msg.title,
    titleFont = settings.fontLarge,
    lines;
  if (title) {
    let w = ovr.getWidth() - 35 - 26;
    if (ovr.setFont(titleFont).stringWidth(title) > w)
      titleFont = settings.fontMedium;
    if (ovr.setFont(titleFont).stringWidth(title) > w) {
      lines = ovr.wrapString(title, w);
      title = (lines.length > 2) ? lines.slice(0, 2).join("\n") + "..." : lines.join("\n");
    }
  }

  drawScreen(ovr, title, titleFont, msg.src || /*LANG*/ "Message", require("messageicons").getColor(msg), require("messageicons").getImage(msg));

  if (!isQuiet() && msg.new) {
    msg.new = false;
    Bangle.buzz();
  }

  drawMessage(ovr, msg);
};

let drawBorder = function(img) {
  LOG("drawBorder", isQuiet());
  if (img) ovr=img;
  if (Bangle.isLocked())
    ovr.setColor(ovr.theme.fgH);
  else
    ovr.setColor(ovr.theme.fg);
  ovr.drawRect(0,0,ovr.getWidth()-1,ovr.getHeight()-1);
  ovr.drawRect(1,1,ovr.getWidth()-2,ovr.getHeight()-2);
  show(ovr);
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
    let w = ovr.getWidth() - 35 -26;
    if (ovr.setFont(titleFont).stringWidth(title) > w)
      titleFont = settings.fontMedium;
    if (ovr.setFont(titleFont).stringWidth(title) > w) {
      lines = ovr.wrapString(title, w);
      title = (lines.length > 2) ? lines.slice(0, 2).join("\n") + "..." : lines.join("\n");
    }
  }

  drawScreen(ovr, title, titleFont, msg.src || /*LANG*/ "Message", require("messageicons").getColor(msg), require("messageicons").getImage(msg));

  stopCallBuzz();
  if (!isQuiet()) {
    if (msg.new) {
      msg.new = false;
      if (callBuzzTimer) clearInterval(callBuzzTimer);
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

let callBuzzTimer = null;
let stopCallBuzz = function() {
  if (callBuzzTimer) {
    clearInterval(callBuzzTimer);
    callBuzzTimer = undefined;
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

let linesScroll = 6;

let scrollUp = function(ovr) {
  msg = eventQueue[0];
  LOG("up", msg);
  if (typeof msg.FirstLine === "undefined")
    msg.FirstLine = 0;
  if (typeof msg.CanscrollUp === "undefined")
    msg.CanscrollUp = false;

  if (!msg.CanscrollUp) return;

  msg.FirstLine = msg.FirstLine > 0 ? msg.FirstLine - linesScroll : 0;

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

  msg.FirstLine = msg.FirstLine + linesScroll;
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
  ovr.setColor(ovr.theme.fg);
  ovr.clearRect(2, yText, ovrw-3, ovrh-3);
  let xText = Padding;
  yText += Padding;
  ovr.setFont(bodyFont);
  let HText = ovr.getFontHeight();

  yText = ((ovrh - yText) / 2) - (linesToPrint.length * HText / 2) + yText;

  if (linesToPrint.length <= 3) {
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
  show(ovr);
  if (!isQuiet()) Bangle.setLCDPower(1);
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

let restoreHandler = function(event){
  LOG("Restore", event, backup[event]);
  Bangle.removeAllListeners(event);
  Bangle["#on" + event]=backup[event];
  backup[event] = undefined;
};

let backupHandler = function(event){
  if (backupDone) return; // do not backup, overlay is already up
  backup[event] = Bangle["#on" + event];
  LOG("Backed up", backup[event]);
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

  Bangle.setLCDOverlay();
  backupDone = false;
  ovr = undefined;
  quiet = undefined;
};

let backup = {};

let backupDone = false;

let main = function(ovr, event) {
  LOG("Main", event, settings);

  if (!lockListener) {
    lockListener = function (){
      drawBorder();
    };
    Bangle.on('lock', lockListener);
  }
  backupHandler("touch");
  backupHandler("swipe");
  backupHandler("drag");
  if (!backupDone){
    Bangle.on('touch', getTouchHandler(ovr));
    Bangle.on('swipe', getSwipeHandler(ovr));
  }
  backupDone=true;

  if (event !== undefined){
    drawBorder(ovr);
    manageEvent(ovr, event);
  } else {
    LOG("No event given");
    cleanup();
  }
};

let ovr;

exports.message = function(type, event) {
  LOG("Got message", type, event);
  // only handle some event types
  if(!(type=="text" || type == "call")) return;
  if(type=="text" && event.id == "nav") return;
  if(event.handled) return;

  bpp = 4;
  if (process.memory().free < LOW_MEM)
    bpp = 1;

  while (process.memory().free < MIN_FREE_MEM && eventQueue.length > 0){
    let dropped = eventQueue.pop();
    print("Dropped message because of memory constraints", dropped);
  }

  if (!ovr || ovr.getBPP() != bpp) {
    ovr = Graphics.createArrayBuffer(ovrw, ovrh, bpp, {
      msb: true
    });
  } else {
    ovr.clear();
  }

  g = ovr;

  if (bpp == 4)
    ovr.theme = g.theme;
  else
    ovr.theme = { fg:0, bg:1, fg2:1, bg2:0, fgH:1, bgH:0 };

  main(ovr, event);
  if (!isQuiet()) Bangle.setLCDPower(1);
  event.handled = true;
  g = _g;
};
