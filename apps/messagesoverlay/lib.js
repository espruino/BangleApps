let lockListener;
let quiet;

const toSemantic = function (espruinoVersion){
  return {
    major: espruinoVersion.substring(0,espruinoVersion.indexOf("v")),
    minor: espruinoVersion.substring(espruinoVersion.indexOf("v") + 1, espruinoVersion.includes(".") ? espruinoVersion.indexOf(".") : espruinoVersion.length),
    patch: espruinoVersion.includes(".") ? espruinoVersion.substring(espruinoVersion.indexOf(".") + 1, espruinoVersion.length) : 0
  };
};

const isNewer = function(espruinoVersion, baseVersion){
  const s = toSemantic(espruinoVersion);
  const b = toSemantic(baseVersion);

  return s.major >= b.major &&
    s.minor >= b.major &&
    s.patch > b.patch;
};

let settings = Object.assign(
  require('Storage').readJSON("messagesoverlay.default.json", true) || {},
  require('Storage').readJSON("messagesoverlay.json", true) || {}
);

settings = Object.assign({
  fontSmall:"6x8",
  fontMedium:"6x15",
  fontBig: "12x20"
}, settings);

const ovrx = settings.border;
const ovry = ovrx;
const ovrw = g.getWidth()-2*ovrx;
const ovrh = g.getHeight()-2*ovry;

let LOG=()=>{};
//LOG = function() { print.apply(null, arguments);};

const isQuiet = function(){
  if (quiet == undefined) quiet = (require('Storage').readJSON('setting.json', 1) || {}).quiet;
  return quiet;
};

let eventQueue = [];
let callInProgress = false;
let buzzing = false;

const show = function(ovr){
  let img = ovr;
  LOG("show", img.getBPP());
  if (ovr.getBPP() == 1) {
    img = ovr.asImage();
    img.paconstte = new Uint16Array([g.theme.fg,g.theme.bg]);
  }
  Bangle.setLCDOverlay(img, ovrx, ovry);
};

const manageEvent = function(ovr, event) {
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

    case "modify": {
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
    }
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

const roundedRect = function(ovr, x,y,w,h,filled){
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
  if (filled){
    let c = ovr.getColor();
    ovr.setColor(ovr.getBgColor());
    ovr.fillPoly(poly,true);
    ovr.setColor(c);
  }
  ovr.drawPoly(poly,true);
};

const divider = 38;

const drawScreen = function(ovr, title, src, iconcolor, icon){
  ovr.setColor(ovr.theme.fg2);
  ovr.setBgColor(ovr.theme.bg2);
  ovr.clearRect(2,2,ovr.getWidth()-3, divider - 1);

  ovr.setFont(settings.fontSmall);
  ovr.setFontAlign(0,-1);

  const textCenter = (ovr.getWidth()+34-24)/2-1;

  const w = ovr.getWidth() - 35 - 26;

  if (title)
    drawTitle(title, textCenter, w, 8, divider - 8, 0);

  if (src)
    drawSource(src, textCenter, w, 2, -1);

  ovr.setColor(ovr.theme.fg);
  ovr.setBgColor(ovr.theme.bg);

  roundedRect(ovr, ovr.getWidth()-26,5,22,30,true);
  ovr.setFontAlign(0,0);
  ovr.setFont("Vector:16");
  ovr.drawString("X",ovr.getWidth()-14,20);

  ovr.setBgColor("#888");
  roundedRect(ovr, 4, 5, 30, 30,true);
  ovr.setBgColor(ovr.theme.bg);
  ovr.setColor(ovr.getBPP() != 1 ? iconcolor : ovr.theme.fg);
  ovr.drawImage(icon,7,8);
};

const drawSource = function(src, center, w, y, align) {
  ovr.setFont(settings.fontSmall);
  while (ovr.stringWidth(src) > w) src = src.substring(0,src.length-2);
  if (src.length != src.length) src += "...";
  ovr.setFontAlign(0,align);
  ovr.drawString(src, center, y);
};

const drawTitle = function(title, center, w, y, h) {
  let size = 30;

  while (ovr.setFont("Vector:" + size).stringWidth(title) > w){
    size -= 2;
    if (size < 14){
      ovr.setFont(settings.fontMedium);
      break;
    }
  }

  if (ovr.stringWidth(title) > w) {
    let ws = ovr.wrapString(title, w);
    if (ws.length >= 2 && ovr.stringWidth(ws[1]) > w - 8){
      ws[1] = ws[1].substring(0, ws[1].length - 2);
      ws[1] += "...";
    }
    title = ws.slice(0, 2).join("\n");

    ovr.setFontAlign(0,-1);
    ovr.drawString(title, center, y + 2);
  } else {
    ovr.setFontAlign(0,0);
    ovr.drawString(title, center, y + h/2);
  }
};

const showMessage = function(ovr, msg) {
  LOG("showMessage");

  ovr.setClipRect(0,0,ovr.getWidth(),ovr.getHeight());
  drawScreen(ovr, msg.title, msg.src || /*LANG*/ "Message", require("messageicons").getColor(msg), require("messageicons").getImage(msg));

  drawMessage(ovr, msg);

  if (!isQuiet() && msg.new) {
    msg.new = false;
    if (!buzzing){
      buzzing = true;
      Bangle.buzz().then(()=>{setTimeout(()=>{buzzing = false;},2000);});
    }
    Bangle.setLCDPower(1);
  }
};

const getBorderColor = function() {
  if (Bangle.isLocked())
    return ovr.theme.fg;
  else
    return ovr.theme.fgH;
};

const drawBorder = function(img) {
  LOG("drawBorder", isQuiet());
  ovr.setBgColor(ovr.theme.bg);
  if (img) ovr=img;
  ovr.setColor(getBorderColor());
  ovr.drawRect(0,0,ovr.getWidth()-1,ovr.getHeight()-1);
  ovr.drawRect(1,1,ovr.getWidth()-2,ovr.getHeight()-2);
  ovr.drawRect(2,divider,ovr.getWidth()-2,divider+1);
  show(ovr);
};

const showCall = function(ovr, msg) {
  LOG("showCall");
  LOG(msg);

  if (msg.t == "remove") {
    LOG("hide call screen");
    next(ovr); //dont shift
    return;
  }

  callInProgress = true;

  drawScreen(ovr, msg.title, msg.src || /*LANG*/ "Message", require("messageicons").getColor(msg), require("messageicons").getImage(msg));

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

const next = function(ovr) {
  LOG("next");
  stopCallBuzz();

  if (!callInProgress)
    eventQueue.shift();

  callInProgress = false;
  if (eventQueue.length == 0) {
    LOG("no element in queue - closing");
    cleanup();
    return false;
  }

  showMessage(ovr, eventQueue[0]);
  return true;
};

let callBuzzTimer = null;
const stopCallBuzz = function() {
  if (callBuzzTimer) {
    clearInterval(callBuzzTimer);
    callBuzzTimer = undefined;
  }
};

const drawTriangleUp = function(ovr) {
  ovr.fillPoly([ovr.getWidth()-10, 46,ovr.getWidth()-15, 56,ovr.getWidth()-5, 56]);
};

const drawTriangleDown = function(ovr) {
  ovr.fillPoly([ovr.getWidth()-10, ovr.getHeight()-6, ovr.getWidth()-15, ovr.getHeight()-16, ovr.getWidth()-5, ovr.getHeight()-16]);
};


const scrollUp = function(ovr) {
  const msg = eventQueue[0];
  LOG("up", msg);

  if (!msg.CanscrollUp) return;

  msg.FirstLine = msg.FirstLine > 0 ? msg.FirstLine - 1 : 0;
  drawMessage(ovr, msg);
};

const scrollDown = function(ovr) {
  const msg = eventQueue[0];
  LOG("down", msg);

  if (!msg.CanscrollDown) return;

  msg.FirstLine = msg.FirstLine + 1;
  drawMessage(ovr, msg);
};

const drawMessage = function(ovr, msg) {
  const getStringHeight = function(str){
    "jit";
    const metrics = ovr.stringMetrics(str);
    if (isNewer("2v21.13", process.version)){
      if (metrics.maxImageHeight > 16)
        metrics.maxImageHeight = metrics.height;
    }
    return Math.max(metrics.height, metrics.maxImageHeight);
  };

  const wrapString = function(str, maxWidth) {
    str = str.replace("\r\n", "\n").replace("\r", "\n");
    return ovr.wrapString(str, maxWidth);
  };
  const wrappedStringHeight = function(strArray){
    let r = 0;
    strArray.forEach((line, i) => {
      r += getStringHeight(line);
    });
    return r;
  };

  ovr.setColor(ovr.theme.fg);
  ovr.setBgColor(ovr.theme.bg);

  if (msg.FirstLine === undefined) msg.FirstLine = 0;

  const padding = eventQueue.length > 1 ? (eventQueue.length > 3 ? 7 : 5) : 3;

  const yText = 40;
  let yLine = yText + 4;

  ovr.setClipRect(2, yText, ovr.getWidth() - 3, ovr.getHeight() - 3);

  const maxTextHeight = ovr.getHeight() - yLine - padding + 2;

  if (!msg.lines) {
    let bodyFont = settings.fontBig;
    ovr.setFont(bodyFont);
    msg.lines = wrapString(msg.body, ovr.getWidth() - 4 - padding);

    if (wrappedStringHeight(msg.lines) > maxTextHeight) {
      bodyFont = settings.fontMedium;
      ovr.setFont(bodyFont);
      msg.lines = wrapString(msg.body, ovr.getWidth() - 4 - padding);
    }
    msg.bodyFont = bodyFont;
    msg.lineHeights = [];
    msg.lines.forEach((line, i) => {
      msg.lineHeights[i] = getStringHeight(line);
    });
  }

  LOG("Prepared message", msg);

  ovr.setFont(msg.bodyFont);
  ovr.setColor(ovr.theme.fg);
  ovr.setBgColor(ovr.theme.bg);
  ovr.clearRect(2, yText, ovr.getWidth()-3, ovr.getHeight()-3);

  let xText = 4;

  if (msg.bodyFont == settings.fontBig) {
    ovr.setFontAlign(0, -1);
    xText = Math.round(ovr.getWidth() / 2 - (padding - 3) / 2) + 1;
    yLine = (ovr.getHeight() + yLine) / 2 - (wrappedStringHeight(msg.lines) / 2);
    ovr.drawString(msg.lines.join("\n"), xText, yLine);
  } else {
    ovr.setFontAlign(-1, -1);
  }

  let currentLine = msg.FirstLine;

  let drawnHeight = 0;

  while(drawnHeight < maxTextHeight && msg.lines.length > currentLine) {
    const lineHeight = msg.lineHeights[currentLine];
    ovr.drawString(msg.lines[currentLine], xText, yLine + drawnHeight);
    drawnHeight += lineHeight;
    currentLine++;
  }

  if (eventQueue.length > 1){
    ovr.drawLine(ovr.getWidth()-4,ovr.getHeight()/2,ovr.getWidth()-4,ovr.getHeight()-4);
    ovr.drawLine(ovr.getWidth()/2,ovr.getHeight()-4,ovr.getWidth()-4,ovr.getHeight()-4);
  }
  if (eventQueue.length > 3){
    ovr.drawLine(ovr.getWidth()-6,ovr.getHeight()*0.6,ovr.getWidth()-6,ovr.getHeight()-6);
    ovr.drawLine(ovr.getWidth()*0.6,ovr.getHeight()-6,ovr.getWidth()-6,ovr.getHeight()-6);
  }

  ovr.setColor(ovr.theme.fg);
  if (msg.FirstLine != 0) {
    msg.CanscrollUp = true;
    drawTriangleUp(ovr);
  } else
    msg.CanscrollUp = false;

  if (currentLine < msg.lines.length) {
    msg.CanscrollDown = true;
    drawTriangleDown(ovr);
  } else
    msg.CanscrollDown = false;

  show(ovr);
};

const getDragHandler = function(ovr){
  return (e) => {
    if (e.dy > 0) {
      scrollUp(ovr);
    } else if (e.dy < 0){
      scrollDown(ovr);
    }
  };
};

const getTouchHandler = function(ovr){
  return (_, xy) => {
    if (xy.y < ovry + 40){
      next(ovr);
    }
  };
};

const EVENTS=["touch", "drag", "swipe"];

let hasBackup = false;

const origOn = Bangle.on;
const backupOn = function(event, handler){
  if (EVENTS.includes(event)){
    if (!backup[event])
      backup[event] = [];
    backup[event].push(handler);
  }
  else origOn.call(Bangle, event, handler);
};

const origSetWatch = setWatch;
const backupSetWatch = function(){
  if (!backup.watches)
    backup.watches = [];
  LOG("backup for watch", arguments);
  backup.watches.push(arguments);
};

const origRemove = Bangle.removeListener;
const backupRemove = function(event, handler){
  if (EVENTS.includes(event) && backup[event]){
    LOG("backup for " + event + ": " + backup[event]);
    backup[event] = backup[event].filter(e=>e!==handler);
  }
  else origRemove.call(Bangle, event, handler);
};

const origRemoveAll = Bangle.removeAllListeners;
const backupRemoveAll = function(event){
  if (backup[event])
    backup[event] = undefined;
  origRemoveAll.call(Bangle);
};

const restoreHandlers = function(){
  if (!hasBackup){
    LOG("No backup available");
    return;
  }

  for (const event of EVENTS){
    LOG("Restore", backup[event]);
    origRemoveAll.call(Bangle, event);
    if (backup[event] && backup[event].length == 1)
      backup[event] = backup[event][0];
    Bangle["#on" + event]=backup[event];
    backup[event] = undefined;
  }

  if (backup.watches){
    for (let w of backup.watches){
      LOG("Restore watch", w);
      origSetWatch.apply(global, w);
    }
  }

  global.setWatch = origSetWatch;
  Bangle.on = origOn;
  Bangle.removeListener = origRemove;
  Bangle.removeAllListeners = origRemoveAll;

  hasBackup = false;
};

const backupHandlers = function(){
  if (hasBackup){
    LOG("Backup already exists");
    return false; // do not backup, overlay is already up
  }

  for (const event of EVENTS){
    backup[event] = Bangle["#on" + event];
    if (typeof backup[event] == "function")
      backup[event] = [ backup[event] ];
    LOG("Backed up", backup[event], event);
    Bangle.removeAllListeners(event);
  }

  backup.watches = [];

  for (let w of global["\xff"].watches){
    LOG("Transform watch", w);
    if (w) {
      let args = [
        w.callback,
        w.pin,
        w
      ];
      delete args[2].callback;
      delete args[2].pin;
      args[2].debounce = Math.round(args[2].debounce / 1048.576);
      LOG("Transformed to", args);
      backup.watches.push(args);
    }
  }

  LOG("Backed up watches", backup.watches);
  clearWatch();

  global.setWatch = backupSetWatch;
  Bangle.on = backupOn;
  Bangle.removeListener = backupRemove;
  Bangle.removeAllListeners = backupRemoveAll;

  hasBackup = true;

  return true;
};

const cleanup = function(){
  if (lockListener) {
    Bangle.removeListener("lock", lockListener);
    lockListener = undefined;
  }
  restoreHandlers();

  Bangle.setLCDOverlay();
  ovr = undefined;
  quiet = undefined;
};

const backup = {};

const main = function(ovr, event) {
  LOG("Main", event.t);
  const didBackup = backupHandlers();

  if (!lockListener) {
    lockListener = function (e){
      updateClearingTimeout();
      drawBorder();
    };
    LOG("Add overlay lock handlers");
    origOn.call(Bangle, 'lock', lockListener);
  }

  if (didBackup){
    LOG("Add overlay UI handlers");
    origOn.call(Bangle, 'touch', getTouchHandler(ovr));
    origOn.call(Bangle, 'drag', getDragHandler(ovr));
  }

  if (event !== undefined){
    manageEvent(ovr, event);
    drawBorder(ovr);
  } else {
    LOG("No event given");
    cleanup();
  }
};

let ovr;
let clearingTimeout;

const updateClearingTimeout = ()=>{
  LOG("updateClearingTimeout");
  if (settings.autoclear <= 0)
    return;
  LOG("Remove clearing timeout", clearingTimeout);
  if (clearingTimeout) clearTimeout(clearingTimeout);
  if (Bangle.isLocked()){
    LOG("Set new clearing timeout");
    clearingTimeout = setTimeout(()=>{
      LOG("setNewTimeout");
      const event = eventQueue.pop();
      if (event)
        drawMessage(ovr, event);
      if (eventQueue.length > 0){
        LOG("still got elements");
        updateClearingTimeout();
      } else {
        cleanup();
      }
    }, settings.autoclear * 1000);
  } else {
    clearingTimeout = undefined;
  }
};

exports.message = function(type, event) {
  LOG("Got message", type, event);
  // only handle some event types
  if(!(type=="text" || type == "call")) return;
  if(type=="text" && event.id == "nav") return;
  if(event.handled) return;
  if(event.messagesoverlayignore) return;

  bpp = 4;
  if (process.memory().free < settings.lowmwm)
    bpp = 1;

  while (process.memory().free < settings.minfreemem && eventQueue.length > 0){
    const dropped = eventQueue.pop();
    print("Dropped message because of memory constraints", dropped);
  }

  if (!ovr || ovr.getBPP() != bpp) {
    ovr = Graphics.createArrayBuffer(ovrw, ovrh, bpp, {
      msb: true
    });
  }

  ovr.reset();

  if (bpp == 4)
    ovr.theme = g.theme;
  else
    ovr.theme = { fg:0, bg:1, fg2:1, bg2:0, fgH:1, bgH:0 };

  ovr.clear();
  main(ovr, event);

  updateClearingTimeout();

  if (!isQuiet()) Bangle.setLCDPower(1);
  event.handled = true;
};
