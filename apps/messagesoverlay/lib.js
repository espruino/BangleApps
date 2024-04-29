let lockListener;
let ovr;
let clearingTimeout;

// Converts a espruino version to a semantiv versioning object
const toSemantic = function (v){
  return {
    major: v.substring(0,v.indexOf("v")),
    minor: v.substring(v.indexOf("v") + 1, v.includes(".") ? v.indexOf(".") : v.length),
    patch: v.includes(".") ? v.substring(v.indexOf(".") + 1, v.length) : 0
  };
};

const isNewer = function(espruinoVersion, baseVersion){
  const s = toSemantic(espruinoVersion);
  const b = toSemantic(baseVersion);

  return s.major >= b.major &&
    s.minor >= b.major &&
    s.patch > b.patch;
};

let needsWorkaround;

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
  return (require('Storage').readJSON('setting.json', 1) || {}).quiet;
};

let eventQueue = [];
let callInProgress = false;
let buzzing = false;

const show = function(){
  let img = ovr.asImage();
  LOG("show", img.bpp);
  if (ovr.getBPP() == 1) {
    img.palette = new Uint16Array([g.theme.fg,g.theme.bg]);
  }
  Bangle.setLCDOverlay(img, ovrx, ovry);
};

const manageEvent = function(event) {
  event.new = true;

  LOG("manageEvent");
  if (event.id == "call") {
    showCall(event);
    return;
  }
  switch (event.t) {
    case "add":
      eventQueue.unshift(event);

      if (!callInProgress)
        showMessage(event);
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
        showMessage(event);
      break;
    }
    case "remove":
      if (eventQueue.length == 0 && !callInProgress)
        next();

      if (!callInProgress && eventQueue[0] !== undefined && eventQueue[0].id == event.id)
        next();
      else
        eventQueue = [];

      break;
  }
};

const roundedRect = function(x,y,w,h,filled){
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

const DIVIDER = 38;

const drawScreen = function(title, src, iconcolor, icon){
  setColors(false);

  drawBorder();

  setColors(true);
  ovr.clearRect(2,2,ovr.getWidth()-3, DIVIDER - 1);

  ovr.setFont(settings.fontSmall);
  ovr.setFontAlign(0,-1);

  const textCenter = (ovr.getWidth()+34-24)/2-1;

  const w = ovr.getWidth() - 35 - 26;

  if (title)
    drawTitle(title, textCenter, w, 8, DIVIDER - 8, 0);

  if (src)
    drawSource(src, textCenter, w, 2, -1);

  if (ovr.getBPP() > 1) {
    let old = ovr.getBgColor();
    ovr.setBgColor("#888");
    roundedRect(4, 5, 30, 30,true);
    ovr.setBgColor(old);
    old = ovr.getColor();
    ovr.setColor(iconcolor);
    ovr.drawImage(icon,7,8);
    ovr.setColor(old);
  } else {
    roundedRect(4, 5, 30, 30,true);
    ovr.drawImage(icon,7,8);
  }

  roundedRect(ovr.getWidth()-26,5,22,30,true);
  ovr.setFontAlign(0,0);
  ovr.setFont("Vector:16");
  ovr.drawString("X",ovr.getWidth()-14,20);
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

  let dh;
  let a;
  if (ovr.stringWidth(title) > w) {
    let ws = ovr.wrapString(title, w);
    if (ws.length >= 2 && ovr.stringWidth(ws[1]) > w - 8){
      ws[1] = ws[1].substring(0, ws[1].length - 2);
      ws[1] += "...";
    }
    title = ws.slice(0, 2).join("\n");

    a = -1;
    dh = y + 2;
  } else {
    a = 0;
    dh = y + h/2;
  }
  ovr.setFontAlign(0, a);
  ovr.drawString(title, center, dh);
};

const setColors = function(lockRelevant) {
  if (lockRelevant && !Bangle.isLocked()){
    ovr.setColor(ovr.theme.fg2);
    ovr.setBgColor(ovr.theme.bg2);
  } else {
    ovr.setColor(ovr.theme.fg);
    ovr.setBgColor(ovr.theme.bg);
  }
};

const showMessage = function(msg) {
  LOG("showMessage");

  ovr.setClipRect(0,0,ovr.getWidth(),ovr.getHeight());

  drawScreen(msg.title, msg.src || /*LANG*/ "Message", require("messageicons").getColor(msg), require("messageicons").getImage(msg));


  if (!Bangle.isLocked()){
    ovr.setColor(ovr.theme.fg);
    ovr.setBgColor(ovr.theme.bg);
  }

  drawMessage(msg);

  if (!isQuiet() && msg.new) {
    msg.new = false;
    if (!buzzing){
      buzzing = true;
      Bangle.buzz().then(()=>{setTimeout(()=>{buzzing = false;},2000);});
    }
    Bangle.setLCDPower(1);
  }
};

const drawBorder = function() {
  LOG("drawBorder", isQuiet());
  ovr.drawRect(0,0,ovr.getWidth()-1,ovr.getHeight()-1);
  ovr.drawRect(1,1,ovr.getWidth()-2,ovr.getHeight()-2);
  ovr.drawRect(2,DIVIDER,ovr.getWidth()-2,DIVIDER+1);
  show();
};

const showCall = function(msg) {
  LOG("showCall");
  LOG(msg);

  if (msg.t == "remove") {
    LOG("hide call screen");
    next(); //dont shift
    return;
  }

  callInProgress = true;

  drawScreen(msg.title, msg.src || /*LANG*/ "Message", require("messageicons").getColor(msg), require("messageicons").getImage(msg));

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
  drawMessage(msg);
};

const next = function() {
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

  showMessage(eventQueue[0]);
  return true;
};

let callBuzzTimer = null;
const stopCallBuzz = function() {
  if (callBuzzTimer) {
    clearInterval(callBuzzTimer);
    callBuzzTimer = undefined;
  }
};

const drawTriangleUp = function() {
  ovr.fillPoly([ovr.getWidth()-10, 46,ovr.getWidth()-15, 56,ovr.getWidth()-5, 56]);
};

const drawTriangleDown = function() {
  ovr.fillPoly([ovr.getWidth()-10, ovr.getHeight()-6, ovr.getWidth()-15, ovr.getHeight()-16, ovr.getWidth()-5, ovr.getHeight()-16]);
};


const scrollUp = function() {
  const msg = eventQueue[0];
  LOG("up", msg);

  if (!msg.CanscrollUp) return;

  msg.FirstLine = msg.FirstLine > 0 ? msg.FirstLine - 1 : 0;
  drawMessage(msg);
};

const scrollDown = function() {
  const msg = eventQueue[0];
  LOG("down", msg);

  if (!msg.CanscrollDown) return;

  msg.FirstLine = msg.FirstLine + 1;
  drawMessage(msg);
};

const drawMessage = function(msg) {
  setColors(false);
  const getStringHeight = function(str){
    "jit";
    const metrics = ovr.stringMetrics(str);
    if (needsWorkaround === undefined)
      needsWorkaround = isNewer("2v21.13", process.version);
    if (needsWorkaround && metrics.maxImageHeight > 16)
      metrics.maxImageHeight = metrics.height;
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

  if (msg.FirstLine === undefined) msg.FirstLine = 0;

  const padding = eventQueue.length > 1 ? (eventQueue.length > 3 ? 7 : 5) : 3;

  const yText = DIVIDER+2;
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

  if (msg.FirstLine != 0) {
    msg.CanscrollUp = true;
    drawTriangleUp();
  } else
    msg.CanscrollUp = false;

  if (drawnHeight >= maxTextHeight) {
    msg.CanscrollDown = true;
    drawTriangleDown();
  } else
    msg.CanscrollDown = false;

  show();
};

const getDragHandler = function(){
  return (e) => {
    if (e.dy > 0) {
      scrollUp();
    } else if (e.dy < 0){
      scrollDown();
    }
  };
};

const getTouchHandler = function(){
  return (_, xy) => {
    if (xy.y < ovry + DIVIDER){
      next();
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

const origClearWatch = clearWatch;
const backupClearWatch = function(w) {
  if (w)
    backup.watches.filter((e)=>e.index != w);
  else
    backup.watches = [];
};

const origSetWatch = setWatch;
const backupSetWatch = function(){
  if (!backup.watches)
    backup.watches = [];
  LOG("backup for watch", arguments);
  let i = backup.watches.map((e)=>e.index).sort().pop() + 1;
  backup.watches.push({index:i, args:arguments});
  return i;
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
    let toRemove = [];

    origClearWatch.call(global);

    for(let i = 0; i < backup.watches.length; i++){
      let w = backup.watches[i];
      LOG("Restoring watch", w);
      if (w) {
        origSetWatch.apply(global, w);
      } else {
        toRemove.push(i+1);
        origSetWatch.call(global, ()=>{}, BTN);
      }
    }

    LOG("Remove watches", toRemove, global["\xff"].watches);
    for(let c of toRemove){
      origClearWatch.call(global, c);
    }
  }

  global.setWatch = origSetWatch;
  global.clearWatch = origClearWatch;
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

  for (let i = 1; i < global["\xff"].watches.length; i++){
    let w = global["\xff"].watches[i];
    LOG("Transform watch", w);
    if (w) {
      w = [
        w.callback,
        w.pin,
        w
      ];
      delete w[2].callback;
      delete w[2].pin;
      w[2].debounce = Math.round(w[2].debounce / 1048.576);
    } else {
      w = null;
    }
    LOG("Transformed to", w);
    backup.watches.push(w);
  }

  LOG("Backed up watches", backup.watches);
  clearWatch();

  global.setWatch = backupSetWatch;
  global.clearWatch = backupClearWatch;
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
};

const backup = {};

const main = function(event) {
  LOG("Main", event.t);
  const didBackup = backupHandlers();

  if (!lockListener) {
    lockListener = function (e){
      updateClearingTimeout();
      showMessage(eventQueue[0]);
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
    manageEvent(event);
  } else {
    LOG("No event given");
    cleanup();
  }
};

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
        showMessage(event);
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

  let free = process.memory().free;
  let bpp = settings.systemTheme ? 16 : 4;

  let estimatedMemUse = bpp == 16 ? 4096 : (bpp == 4 ? 1536 : 768);
  // reduce estimation if ovr already exists and uses memory;
  if (ovr)
    estimatedMemUse -= ovr.getBPP() == 16 ? 4096 : (ovr.getBPP() == 4 ? 1536 : 768);

  if (process.memory().free - estimatedMemUse < settings.minfreemem * 1024) {
    // we are going to be under our minfreemem setting if we proceed
    bpp = 1;
    if (ovr && ovr.getBPP() > 1){
      // can reduce memory by going 1 bit
      let saves = ovr.getBPP() == 16 ? 4096 - 768 : 768;
      estimatedMemUse -= saves;
      LOG("Go to 1 bit, saving", saves);
    } else {
      estimatedMemUse = 768;
    }
  }


  if (E.getSizeOf){
    let e = E.getSizeOf(eventQueue);
    estimatedMemUse += e;
    LOG("EventQueue has", e, "blocks");
  }

  LOG("Free ", free, "estimated use", estimatedMemUse, "for", bpp, "BPP");

  while (process.memory().free - estimatedMemUse < settings.minfreemem * 1024 && eventQueue.length > 0){
    const dropped = eventQueue.pop();
    print("Dropped message because of memory constraints", dropped);
  }

  if (!ovr || ovr.getBPP() != bpp) {
    ovr = Graphics.createArrayBuffer(ovrw, ovrh, bpp, {
      msb: true
    });
    if(E.getSizeOf)
       LOG("New overlay uses", E.getSizeOf(ovr), "blocks");
  }

  ovr.reset();

  if (bpp > 1){
    if (settings.systemTheme){
      ovr.theme = g.theme;
    } else {
      ovr.theme = {
        fg: g.theme.dark ? 15: 0,
        bg: g.theme.dark ? 0: 15,
        fg2: g.theme.dark ? 15: 0,
        bg2: g.theme.dark ? 9 : 8,
        fgH: g.theme.dark ? 15 : 0,
        bgH: g.theme.dark ? 9: 8,
      };
    }
  }
  else {
    if (g.theme.dark)
      ovr.theme = { fg:1, bg:0, fg2:0, bg2:1, fgH:0, bgH:1 };
    else
      ovr.theme = { fg:0, bg:1, fg2:1, bg2:0, fgH:1, bgH:0 };
  }

  main(event);

  updateClearingTimeout();

  event.handled = true;
  g.flip();
};
