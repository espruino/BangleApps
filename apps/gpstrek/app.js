
{ //run in own scope for fast switch
const STORAGE = require("Storage");
const BAT_FULL = require("Storage").readJSON("setting.json").batFullVoltage || 0.3144;

let init = function(){
  global.screen = 1;
  global.drawTimeout = undefined;
  global.lastDrawnScreen = 0;
  global.firstDraw = true;
  global.slices = [];
  global.maxScreens = 1;
  global.scheduleDraw = false;

  Bangle.loadWidgets();
  WIDGETS.gpstrek.start(false);
  if (!WIDGETS.gpstrek.getState().numberOfSlices) WIDGETS.gpstrek.getState().numberOfSlices = 3;
};

let cleanup = function(){
  if (global.drawTimeout) clearTimeout(global.drawTimeout);
  delete global.screen;
  delete global.drawTimeout;
  delete global.lastDrawnScreen;
  delete global.firstDraw;
  delete global.slices;
  delete global.maxScreens;
};

init();
scheduleDraw = true;

let parseNumber = function(toParse){
  if (toParse.includes(".")) return parseFloat(toParse);
  return parseFloat("" + toParse + ".0");
};

let parseWaypoint = function(filename, offset, result){
  result.lat = parseNumber(STORAGE.read(filename, offset, 11));
  result.lon = parseNumber(STORAGE.read(filename, offset += 11, 12));
  return offset + 12;
};

let parseWaypointWithElevation = function (filename, offset, result){
  offset = parseWaypoint(filename, offset, result);
  result.alt = parseNumber(STORAGE.read(filename, offset, 6));
  return offset + 6;
};

let parseWaypointWithName = function(filename, offset, result){
  offset = parseWaypoint(filename, offset, result);
  return parseName(filename, offset, result);
};

let parseName = function(filename, offset, result){
  let nameLength = STORAGE.read(filename, offset, 2) - 0;
  result.name = STORAGE.read(filename, offset += 2, nameLength);
  return offset + nameLength;
};

let parseWaypointWithElevationAndName = function(filename, offset, result){
  offset = parseWaypointWithElevation(filename, offset, result);
  return parseName(filename, offset, result);
};

let getEntry = function(filename, offset, result){
  result.fileOffset = offset;
  let type = STORAGE.read(filename, offset++, 1);
  if (type == "") return -1;
  switch (type){
    case "A":
      offset = parseWaypoint(filename, offset, result);
      break;
    case "B":
      offset = parseWaypointWithName(filename, offset, result);
      break;
    case "C":
      offset = parseWaypointWithElevation(filename, offset, result);
      break;
    case "D":
      offset = parseWaypointWithElevationAndName(filename, offset, result);
      break;
    default:
      print("Unknown entry type", type);
      return -1;
  }
  offset++;

  result.fileLength = offset - result.fileOffset;
  //print(result);
  return offset;
};

const labels = ["N","NE","E","SE","S","SW","W","NW"];
const loc = require("locale");

let matchFontSize = function(graphics, text, height, width){
  graphics.setFontVector(height);
  let metrics;
  let size = 1;
  while (graphics.stringMetrics(text).width > 0.90 * width){
    size -= 0.05;
    graphics.setFont("Vector",Math.floor(height*size));
  }
};

let getDoubleLineSlice = function(title1,title2,provider1,provider2,refreshTime){
  let lastDrawn = Date.now() - Math.random()*refreshTime;
  let lastValue1 = 0;
  let lastValue2 = 0;
  return {
    refresh: function (){
      let bigChange1 = (Math.abs(lastValue1 - provider1()) > 1);
      let bigChange2 = (Math.abs(lastValue2 - provider2()) > 1);
      let refresh = (Bangle.isLocked()?(refreshTime?refreshTime*5:10000):(refreshTime?refreshTime*2:1000));
      let old = (Date.now() - lastDrawn) > refresh;
      return (bigChange1 || bigChange2) && old;
    },
    draw: function (graphics, x, y, height, width){
      lastDrawn = Date.now();
      if (typeof title1 == "function") title1 = title1();
      if (typeof title2 == "function") title2 = title2();
      graphics.clearRect(x,y,x+width,y+height);

      lastValue1 = provider1();
      matchFontSize(graphics, title1 + lastValue1, Math.floor(height*0.5), width);
      graphics.setFontAlign(-1,-1);
      graphics.drawString(title1, x+2, y);
      graphics.setFontAlign(1,-1);
      graphics.drawString(lastValue1, x+width, y);

      lastValue2 = provider2();
      matchFontSize(graphics, title2 + lastValue2, Math.floor(height*0.5), width);
      graphics.setFontAlign(-1,-1);
      graphics.drawString(title2, x+2, y+(height*0.5));
      graphics.setFontAlign(1,-1);
      graphics.drawString(lastValue2, x+width, y+(height*0.5));
    }
  };
};

let getTargetSlice = function(targetDataSource){
  let nameIndex = 0;
  let lastDrawn = Date.now() - Math.random()*3000;
  return {
    refresh: function (){
      return Date.now() - lastDrawn > (Bangle.isLocked()?3000:10000);
    },
    draw: function (graphics, x, y, height, width){
      lastDrawn = Date.now();
      graphics.clearRect(x,y,x+width,y+height);
      if (targetDataSource.icon){
        graphics.drawImage(targetDataSource.icon,x,y + (height - 16)/2);
        x += 16;
        width -= 16;
      }

      if (!targetDataSource.getTarget() || !targetDataSource.getStart()) return;

      let dist = distance(targetDataSource.getStart(),targetDataSource.getTarget());
      if (isNaN(dist)) dist = Infinity;
      let bearingString = bearing(targetDataSource.getStart(),targetDataSource.getTarget()) + "°";
      if (targetDataSource.getTarget().name) {
        graphics.setFont("Vector",Math.floor(height*0.5));
        let scrolledName = (targetDataSource.getTarget().name || "").substring(nameIndex);
        if (graphics.stringMetrics(scrolledName).width > width){
          nameIndex++;
        } else {
          nameIndex = 0;
        }
        graphics.drawString(scrolledName, x+2, y);

        let distanceString = loc.distance(dist,2);
        matchFontSize(graphics, distanceString + bearingString, height*0.5, width);
        graphics.drawString(bearingString, x+2, y+(height*0.5));
        graphics.setFontAlign(1,-1);
        graphics.drawString(distanceString, x + width, y+(height*0.5));
      } else {
        graphics.setFont("Vector",Math.floor(height*1));
        let bearingString = bearing(targetDataSource.getStart(),targetDataSource.getTarget()) + "°";
        let formattedDist = loc.distance(dist,2);
        let distNum = (formattedDist.match(/[0-9\.]+/) || [Infinity])[0];
        let size = 0.8;
        let distNumMetrics;
        while (graphics.stringMetrics(bearingString).width + (distNumMetrics = graphics.stringMetrics(distNum)).width > 0.90 * width){
          size -= 0.05;
          graphics.setFont("Vector",Math.floor(height*size));
        }
        graphics.drawString(bearingString, x+2, y + (height - distNumMetrics.height)/2);
        graphics.setFontAlign(1,-1);
        graphics.drawString(distNum, x + width, y + (height - distNumMetrics.height)/2);
        graphics.setFont("Vector",Math.floor(height*0.25));

        graphics.setFontAlign(-1,1);
        if (targetDataSource.getProgress){
          graphics.drawString(targetDataSource.getProgress(), x + 2, y + height);
        }
        graphics.setFontAlign(1,1);
        if (!isNaN(distNum) && distNum != Infinity)
          graphics.drawString(formattedDist.match(/[a-zA-Z]+/), x + width, y + height);
      }
    }
  };
};

let drawCompass = function(graphics, x, y, height, width, increment, start){
  graphics.setFont12x20();
  graphics.setFontAlign(0,-1);
  graphics.setColor(graphics.theme.fg);
  let frag = 0 - start%15;
  if (frag>0) frag = 0;
  let xpos = 0 + frag*increment;
  for (let i=start;i<=720;i+=15){
    var res = i + frag;
    if (res%90==0) {
      graphics.drawString(labels[Math.floor(res/45)%8],xpos,y+2);
      graphics.fillRect(xpos-2,Math.floor(y+height*0.6),xpos+2,Math.floor(y+height));
    } else if (res%45==0) {
      graphics.drawString(labels[Math.floor(res/45)%8],xpos,y+2);
      graphics.fillRect(xpos-2,Math.floor(y+height*0.75),xpos+2,Math.floor(y+height));
    } else if (res%15==0) {
      graphics.fillRect(xpos,Math.floor(y+height*0.9),xpos+1,Math.floor(y+height));
    }
    xpos+=increment*15;
    if (xpos > width + 20) break;
  }
};

let getCompassSlice = function(compassDataSource){
  let lastDrawn = Date.now() - Math.random()*2000;
  let lastDrawnValue = 0;
  const buffers = 4;
  let buf = [];
  return {
    refresh : function (){
      let bigChange = (Math.abs(lastDrawnValue - compassDataSource.getCourse()) > 2);
      let old = (Bangle.isLocked()?(Date.now() - lastDrawn > 2000):true);
      return bigChange && old;
    },
    draw: function (graphics, x,y,height,width){
      lastDrawn = Date.now();
      const max = 180;
      const increment=width/max;

      graphics.clearRect(x,y,x+width,y+height);

      lastDrawnValue = compassDataSource.getCourse();

      var start = lastDrawnValue - 90;
      if (isNaN(lastDrawnValue)) start = -90;
      if (start<0) start+=360;
      start = start % 360;

      if (WIDGETS.gpstrek.getState().acc && compassDataSource.getCourseType() == "MAG"){
        drawCompass(graphics,0,y+width*0.05,height-width*0.05,width,increment,start);
      } else {
        drawCompass(graphics,0,y,height,width,increment,start);
      }


      if (compassDataSource.getPoints){
        let points = compassDataSource.getPoints(); //storing this in a variable works around a minifier bug causing a problem in the next line: for(let a of a.getPoints())
        for (let p of points){
          g.reset();
          var bpos = p.bearing - lastDrawnValue;
          if (bpos>180) bpos -=360;
          if (bpos<-180) bpos +=360;
          bpos+=120;
          let min = 0;
          let max = 180;
          if (bpos<=min){
            bpos = Math.floor(width*0.05);
          } else if (bpos>=max) {
            bpos = Math.ceil(width*0.95);
          } else {
            bpos=Math.round(bpos*increment);
          }
          if (p.color){
            graphics.setColor(p.color);
          }
          if (p.icon){
            graphics.drawImage(p.icon, bpos,y+height-12, {rotate:0,scale:2});
          } else {
            graphics.fillCircle(bpos,y+height-12,Math.floor(width*0.03));
          }
        }
      }
      if (compassDataSource.getMarkers){
        let markers = compassDataSource.getMarkers(); //storing this in a variable works around a minifier bug causing a problem in the next line: for(let a of a.getMarkers())
        for (let m of markers){
          g.reset();
          g.setColor(m.fillcolor);
          let mpos = m.xpos * width;
          if (m.xpos < 0.05) mpos = Math.floor(width*0.05);
          if (m.xpos > 0.95) mpos = Math.ceil(width*0.95);
          g.fillPoly(triangle(mpos,y+height-m.height, m.height, m.width));
          g.setColor(m.linecolor);
          g.drawPoly(triangle(mpos,y+height-m.height, m.height, m.width),true);
        }
      }
      graphics.setColor(g.theme.fg);
      graphics.fillRect(x,y,Math.floor(width*0.05),y+height);
      graphics.fillRect(Math.ceil(width*0.95),y,width,y+height);
      if (WIDGETS.gpstrek.getState().acc && compassDataSource.getCourseType() == "MAG") {
        let xh = E.clip(width*0.5-height/2+(((WIDGETS.gpstrek.getState().acc.x+1)/2)*height),width*0.5 - height/2, width*0.5 + height/2);
        let yh = E.clip(y+(((WIDGETS.gpstrek.getState().acc.y+1)/2)*height),y,y+height);

        graphics.fillRect(width*0.5 - height/2, y, width*0.5 + height/2, y + Math.floor(width*0.05));

        graphics.setColor(g.theme.bg);
        graphics.drawLine(width*0.5 - 5, y, width*0.5 - 5, y + Math.floor(width*0.05));
        graphics.drawLine(width*0.5 + 5, y, width*0.5 + 5, y + Math.floor(width*0.05));
        graphics.fillRect(xh-1,y,xh+1,y+Math.floor(width*0.05));

        let left = Math.floor(width*0.05);
        let right = Math.ceil(width*0.95);
        graphics.drawLine(0,y+height/2-5,left,y+height/2-5);
        graphics.drawLine(right,y+height/2-5,x+width,y+height/2-5);
        graphics.drawLine(0,y+height/2+5,left,y+height/2+5);
        graphics.drawLine(right,y+height/2+5,x+width,y+height/2+5);
        graphics.fillRect(0,yh-1,left,yh+1);
        graphics.fillRect(right,yh-1,x+width,yh+1);
      }
      graphics.setColor(g.theme.fg);
      graphics.drawRect(Math.floor(width*0.05),y,Math.ceil(width*0.95),y+height);
    }
  };
};

let radians = function(a) {
  return a*Math.PI/180;
};

let degrees = function(a) {
  let d = a*180/Math.PI;
  return (d+360)%360;
};

let bearing = function(a,b){
  if (!a || !b || !a.lon || !a.lat || !b.lon || !b.lat) return Infinity;
  let delta = radians(b.lon-a.lon);
  let alat = radians(a.lat);
  let blat = radians(b.lat);
  let y = Math.sin(delta) * Math.cos(blat);
  let x = Math.cos(alat)*Math.sin(blat) -
        Math.sin(alat)*Math.cos(blat)*Math.cos(delta);
  return Math.round(degrees(Math.atan2(y, x)));
};

let distance = function(a,b){
  if (!a || !b || !a.lon || !a.lat || !b.lon || !b.lat) return Infinity;
  let x = radians(a.lon-b.lon) * Math.cos(radians((a.lat+b.lat)/2));
  let y = radians(b.lat-a.lat);
  return Math.round(Math.sqrt(x*x + y*y) * 6371000);
};

let getAveragedCompass = function(){
  return Math.round(WIDGETS.gpstrek.getState().avgComp);
};

let triangle = function(x, y, width, height){
  return  [
    Math.round(x),Math.round(y),
    Math.round(x+width * 0.5), Math.round(y+height),
    Math.round(x-width * 0.5), Math.round(y+height)
  ];
};

let onSwipe = function(dir){
  if (dir < 0) {
    nextScreen();
  } else if (dir > 0) {
    switchMenu();
  } else {
    nextScreen();
  }
};

let setButtons = function(){
  let options = {
    mode: "custom",
    swipe: onSwipe,
    btn: nextScreen,
    touch: nextScreen
  };
  Bangle.setUI(options);
};

let getApproxFileSize = function(name){
  let currentStart = STORAGE.getStats().totalBytes;
  let currentSize = 0;
  for (let i = currentStart; i > 500; i/=2){
    let currentDiff = i;
    //print("Searching", currentDiff);
    while (STORAGE.read(name, currentSize+currentDiff, 1) == ""){
      //print("Loop", currentDiff);
      currentDiff = Math.ceil(currentDiff/2);
    }
    i = currentDiff*2;
    currentSize += currentDiff;
  }
  return currentSize;
};

let parseRouteData = function(filename, progressMonitor){
  let routeInfo = {};

  routeInfo.filename = filename;
  routeInfo.refs = [];

  let c = {};
  let scanOffset = 0;
  routeInfo.length = 0;
  routeInfo.count = 0;
  routeInfo.mirror = false;
  let lastSeenWaypoint;
  let lastSeenAlt;
  let waypoint = {};

  routeInfo.up = 0;
  routeInfo.down = 0;
  
  let size = getApproxFileSize(filename);

  while ((scanOffset = getEntry(filename, scanOffset, waypoint)) > 0) {
    if (routeInfo.count % 5 == 0) progressMonitor(scanOffset, "Loading", size);
    if (lastSeenWaypoint){
      routeInfo.length += distance(lastSeenWaypoint, waypoint);

      let diff = waypoint.alt - lastSeenAlt;
      //print("Distance", routeInfo.length, "alt", lastSeenAlt, waypoint.alt, diff);   
      if (waypoint.alt && lastSeenAlt && diff > 3){
        if (lastSeenAlt < waypoint.alt){
          //print("Up", diff);
          routeInfo.up += diff;
        } else {
          //print("Down", diff);
          routeInfo.down += diff;
        }
      }
    }
    routeInfo.count++;
    routeInfo.refs.push(waypoint.fileOffset);
    lastSeenWaypoint = waypoint;
    if (!isNaN(waypoint.alt)) lastSeenAlt = waypoint.alt;
    waypoint = {};
  }

  set(routeInfo, 0);
  return routeInfo;
};

let hasPrev = function(route){
  if (route.mirror) return route.index < (route.count - 1);
  return route.index > 0;
};

let hasNext = function(route){
  if (route.mirror) return route.index > 0;
  return route.index < (route.count - 1);
};

let next = function(route){
  if (!hasNext(route)) return;
  if (route.mirror) set(route, --route.index);
  if (!route.mirror) set(route, ++route.index);
};

let set = function(route, index){
  route.currentWaypoint = {};
  route.index = index;
  getEntry(route.filename, route.refs[index], route.currentWaypoint);
};

let prev = function(route){
  if (!hasPrev(route)) return;
  if (route.mirror) set(route, ++route.index);
  if (!route.mirror) set(route, --route.index);
};

let lastMirror;
let cachedLast;

let getLast = function(route){
  let wp = {};
  if (lastMirror != route.mirror){
    if (route.mirror) getEntry(route.filename, route.refs[0], wp);
    if (!route.mirror) getEntry(route.filename, route.refs[route.count - 1], wp);
    lastMirror = route.mirror;
    cachedLast = wp;
  }
  return cachedLast;
};

let removeMenu = function(){
  E.showMenu();
  switchNav();
};

let showProgress = function(progress, title, max){
  //print("Progress",progress,max)
  let message = title? title: "Loading";
  if (max){
    message += " " + E.clip((progress/max*100),0,100).toFixed(0) +"%";
  } else {
    let dots = progress % 4;
    for (let i = 0; i < dots; i++) message += ".";
    for (let i = dots; i < 4; i++) message += " ";
  }
  E.showMessage(message);
};

let handleLoading = function(c){
  E.showMenu();
  WIDGETS.gpstrek.getState().route = parseRouteData(c, showProgress);
  WIDGETS.gpstrek.getState().waypoint = null;
  WIDGETS.gpstrek.getState().route.mirror = false;
  removeMenu();
};

let showRouteSelector  = function(){
  var menu = {
    "" : {
      back : showRouteMenu,
    }
  };

  STORAGE.list(/\.trf$/).forEach((file)=>{
     menu[file] = ()=>{handleLoading(file);};
  });

  E.showMenu(menu);
};

let showRouteMenu = function(){
  var menu = {
    "" : {
      "title" : "Route",
      back : showMenu,
    },
    "Select file" : showRouteSelector
  };

  if (WIDGETS.gpstrek.getState().route){
    menu.Mirror = {
      value: WIDGETS.gpstrek.getState() && WIDGETS.gpstrek.getState().route && !!WIDGETS.gpstrek.getState().route.mirror || false,
      onchange: v=>{
        WIDGETS.gpstrek.getState().route.mirror = v;
      }
    };
    menu['Select closest waypoint'] = function () {
      if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.lat){
        setClosestWaypoint(WIDGETS.gpstrek.getState().route, null, showProgress); removeMenu();
      } else {
        E.showAlert("No position").then(()=>{E.showMenu(menu);});
      }
    };
    menu['Select closest waypoint (not visited)'] = function () {
      if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.lat){
        setClosestWaypoint(WIDGETS.gpstrek.getState().route, WIDGETS.gpstrek.getState().route.index, showProgress); removeMenu();
      } else {
        E.showAlert("No position").then(()=>{E.showMenu(menu);});
      }
    };
    menu['Select waypoint'] = {
      value : WIDGETS.gpstrek.getState().route.index,
      min:1,max:WIDGETS.gpstrek.getState().route.count,step:1,
      onchange : v => { set(WIDGETS.gpstrek.getState().route, v-1); }
    };
    menu['Select waypoint as current position'] = function (){
      WIDGETS.gpstrek.getState().currentPos.lat = WIDGETS.gpstrek.getState().route.currentWaypoint.lat;
      WIDGETS.gpstrek.getState().currentPos.lon = WIDGETS.gpstrek.getState().route.currentWaypoint.lon;
      WIDGETS.gpstrek.getState().currentPos.alt = WIDGETS.gpstrek.getState().route.currentWaypoint.alt;
      removeMenu();
    };
  }

  if (WIDGETS.gpstrek.getState().route && hasPrev(WIDGETS.gpstrek.getState().route))
    menu['Previous waypoint'] = function() { prev(WIDGETS.gpstrek.getState().route); removeMenu(); };
  if (WIDGETS.gpstrek.getState().route && hasNext(WIDGETS.gpstrek.getState().route))
    menu['Next waypoint'] = function() { next(WIDGETS.gpstrek.getState().route); removeMenu(); };
  E.showMenu(menu);
};

let showWaypointSelector = function(){
  let waypoints = require("waypoints").load();
  var menu = {
    "" : {
      back : showWaypointMenu,
    }
  };

  waypoints.forEach((wp,c)=>{
    menu[waypoints[c].name] = function (){
      WIDGETS.gpstrek.getState().waypoint = waypoints[c];
      WIDGETS.gpstrek.getState().waypointIndex = c;
      WIDGETS.gpstrek.getState().route = null;
      removeMenu();
    };
  });

  E.showMenu(menu);
};

let showCalibrationMenu = function(){
  let menu = {
    "" : {
      "title" : "Calibration",
      back : showMenu,
    },
    "Barometer (GPS)" : ()=>{
      if (!WIDGETS.gpstrek.getState().currentPos || isNaN(WIDGETS.gpstrek.getState().currentPos.alt)){
        E.showAlert("No GPS altitude").then(()=>{E.showMenu(menu);});
      } else {
        WIDGETS.gpstrek.getState().calibAltDiff = WIDGETS.gpstrek.getState().altitude - WIDGETS.gpstrek.getState().currentPos.alt;
        E.showAlert("Calibrated Altitude Difference: " + WIDGETS.gpstrek.getState().calibAltDiff.toFixed(0)).then(()=>{removeMenu();});
      }
    },
    "Barometer (Manual)" : {
      value : Math.round(WIDGETS.gpstrek.getState().currentPos && (WIDGETS.gpstrek.getState().currentPos.alt != undefined && !isNaN(WIDGETS.gpstrek.getState().currentPos.alt)) ? WIDGETS.gpstrek.getState().currentPos.alt: WIDGETS.gpstrek.getState().altitude),
      min:-2000,max: 10000,step:1,
      onchange : v => { WIDGETS.gpstrek.getState().calibAltDiff = WIDGETS.gpstrek.getState().altitude - v; }
    },
    "Reset Compass" : ()=>{ Bangle.resetCompass(); removeMenu();},
  };
  E.showMenu(menu);
};

let showWaypointMenu = function(){
  let menu = {
    "" : {
      "title" : "Waypoint",
      back : showMenu,
    },
    "Select waypoint" : showWaypointSelector,
  };
  E.showMenu(menu);
};

let showBackgroundMenu = function(){
  let menu = {
    "" : {
      "title" : "Background",
      back : showMenu,
    },
    "Start" : ()=>{ E.showPrompt("Start?").then((v)=>{ if (v) {WIDGETS.gpstrek.start(true); removeMenu();} else {showMenu();}}).catch(()=>{showMenu();});},
    "Stop" : ()=>{ E.showPrompt("Stop?").then((v)=>{ if (v) {WIDGETS.gpstrek.stop(true); removeMenu();} else {showMenu();}}).catch(()=>{showMenu();});},
  };
  E.showMenu(menu);
};

let showMenu = function(){
  var mainmenu = {
    "" : {
      "title" : "Main",
      back : removeMenu,
    },
    "Route" : showRouteMenu,
    "Waypoint" : showWaypointMenu,
    "Background" : showBackgroundMenu,
    "Calibration": showCalibrationMenu,
    "Reset" : ()=>{ E.showPrompt("Do Reset?").then((v)=>{ if (v) {WIDGETS.gpstrek.resetState(); removeMenu();} else {E.showMenu(mainmenu);}}).catch(()=>{E.showMenu(mainmenu);});},
    "Info rows" : {
      value : WIDGETS.gpstrek.getState().numberOfSlices,
      min:1,max:6,step:1,
      onchange : v => { WIDGETS.gpstrek.getState().numberOfSlices = v; }
    },
  };

  E.showMenu(mainmenu);
};


let switchMenu = function(){
  stopDrawing();
  showMenu();
};

let stopDrawing = function(){
  if (drawTimeout) clearTimeout(drawTimeout);
  scheduleDraw = false;
};

let drawInTimeout = function(){
  if (global.drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(()=>{
    drawTimeout = undefined;
    draw();
  },50);
};

let switchNav = function(){
  if (!screen) screen = 1;
  setButtons();
  scheduleDraw = true;
  firstDraw = true;
  drawInTimeout();
};

let nextScreen = function(){
  screen++;
  if (screen > maxScreens){
    screen = 1;
  }
  drawInTimeout();
};

let setClosestWaypoint = function(route, startindex, progress){
  if (startindex >= WIDGETS.gpstrek.getState().route.count) startindex = WIDGETS.gpstrek.getState().route.count - 1;
  if (!WIDGETS.gpstrek.getState().currentPos.lat){
    set(route, startindex);
    return;
  }
  let minDist = 100000000000000;
  let minIndex = 0;
  for (let i = startindex?startindex:0; i < route.count - 1; i++){
    if (progress && (i % 5 == 0)) progress(i-(startindex?startindex:0), "Searching", route.count);
    let wp = {};
    getEntry(route.filename, route.refs[i], wp);
    let curDist = distance(WIDGETS.gpstrek.getState().currentPos, wp);
    if (curDist < minDist){
      minDist = curDist;
      minIndex = i;
    } else {
      if (startindex) break;
    }
  }
  set(route, minIndex);
};

const finishIcon = atob("CggB//meZmeZ+Z5n/w==");

const compassSliceData = {
  getCourseType: function(){
    return (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.course) ? "GPS" : "MAG";
  },
  getCourse: function (){
    if(compassSliceData.getCourseType() == "GPS") return WIDGETS.gpstrek.getState().currentPos.course;
    return getAveragedCompass();
  },
  getPoints: function (){
    let points = [];
    if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.lon && WIDGETS.gpstrek.getState().route && WIDGETS.gpstrek.getState().route.currentWaypoint){
      points.push({bearing:bearing(WIDGETS.gpstrek.getState().currentPos, WIDGETS.gpstrek.getState().route.currentWaypoint), color:"#0f0"});
    }
    if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.lon && WIDGETS.gpstrek.getState().route){
      points.push({bearing:bearing(WIDGETS.gpstrek.getState().currentPos, getLast(WIDGETS.gpstrek.getState().route)), icon: finishIcon});
    }
    if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.lon && WIDGETS.gpstrek.getState().waypoint){
      points.push({bearing:bearing(WIDGETS.gpstrek.getState().currentPos, WIDGETS.gpstrek.getState().waypoint), icon: finishIcon});
    }
    return points;
  },
  getMarkers: function (){
    return [{xpos:0.5, width:10, height:10, linecolor:g.theme.fg, fillcolor:"#f00"}];
  }
};

const waypointData = {
  icon: atob("EBCBAAAAAAAAAAAAcIB+zg/uAe4AwACAAAAAAAAAAAAAAAAA"),
  getProgress: function() {
    return (WIDGETS.gpstrek.getState().route.index + 1) + "/" + WIDGETS.gpstrek.getState().route.count;
  },
  getTarget: function (){
    if (distance(WIDGETS.gpstrek.getState().currentPos,WIDGETS.gpstrek.getState().route.currentWaypoint) < 30 && hasNext(WIDGETS.gpstrek.getState().route)){
      next(WIDGETS.gpstrek.getState().route);
      Bangle.buzz(1000);
    }
    return WIDGETS.gpstrek.getState().route.currentWaypoint;
  },
  getStart: function (){
    return WIDGETS.gpstrek.getState().currentPos;
  }
};

const finishData = {
  icon: atob("EBABAAA/4DmgJmAmYDmgOaAmYD/gMAAwADAAMAAwAAAAAAA="),
  getTarget: function (){
    if (WIDGETS.gpstrek.getState().route) return getLast(WIDGETS.gpstrek.getState().route);
    if (WIDGETS.gpstrek.getState().waypoint) return WIDGETS.gpstrek.getState().waypoint;
  },
  getStart: function (){
    return WIDGETS.gpstrek.getState().currentPos;
  }
};

let getSliceHeight = function(number){
  return Math.floor(Bangle.appRect.h/WIDGETS.gpstrek.getState().numberOfSlices);
};

let compassSlice = getCompassSlice(compassSliceData);
let waypointSlice = getTargetSlice(waypointData);
let finishSlice = getTargetSlice(finishData);
let eleSlice = getDoubleLineSlice("Up","Down",()=>{
  return loc.distance(WIDGETS.gpstrek.getState().up,3) + "/" + (WIDGETS.gpstrek.getState().route ? loc.distance(WIDGETS.gpstrek.getState().route.up,3):"---");
},()=>{
  return loc.distance(WIDGETS.gpstrek.getState().down,3) + "/" + (WIDGETS.gpstrek.getState().route ? loc.distance(WIDGETS.gpstrek.getState().route.down,3): "---");
});

let statusSlice = getDoubleLineSlice("Speed","Alt",()=>{
  let speed = 0;
  if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.speed) speed = WIDGETS.gpstrek.getState().currentPos.speed;
  return loc.speed(speed,2);
},()=>{
  let alt = Infinity;
  if (!isNaN(WIDGETS.gpstrek.getState().altitude)){
    alt = isNaN(WIDGETS.gpstrek.getState().calibAltDiff) ? WIDGETS.gpstrek.getState().altitude : (WIDGETS.gpstrek.getState().altitude - WIDGETS.gpstrek.getState().calibAltDiff);
  }
  if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.alt) alt = WIDGETS.gpstrek.getState().currentPos.alt;
  if (isNaN(alt)) return "---";
  return loc.distance(alt,3);
});

let status2Slice = getDoubleLineSlice("Compass","GPS",()=>{
  return getAveragedCompass() + "°";
},()=>{
  let course = "---°";
  if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.course) course = WIDGETS.gpstrek.getState().currentPos.course + "°";
  return course;
},200);

let healthSlice = getDoubleLineSlice("Heart","Steps",()=>{
  return WIDGETS.gpstrek.getState().bpm || "---";
},()=>{
  return !isNaN(WIDGETS.gpstrek.getState().steps)? WIDGETS.gpstrek.getState().steps: "---";
});

let system2Slice = getDoubleLineSlice("Bat","",()=>{
  return (Bangle.isCharging()?"+":"") + E.getBattery().toFixed(0)+"% " + (analogRead(D3)*4.2/BAT_FULL).toFixed(2) + "V";
},()=>{
  return "";
});

let systemSlice = getDoubleLineSlice("RAM","Storage",()=>{
  let ram = process.memory(false);
  return ((ram.blocksize * ram.free)/1024).toFixed(0)+"kB";
},()=>{
  return (STORAGE.getFree()/1024).toFixed(0)+"kB";
});

let updateSlices = function(){
  slices = [];
  slices.push(compassSlice);

  if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.lat && WIDGETS.gpstrek.getState().route && WIDGETS.gpstrek.getState().route.currentWaypoint && WIDGETS.gpstrek.getState().route.index < WIDGETS.gpstrek.getState().route.count - 1) {
    slices.push(waypointSlice);
  }
  if (WIDGETS.gpstrek.getState().currentPos && WIDGETS.gpstrek.getState().currentPos.lat && (WIDGETS.gpstrek.getState().route || WIDGETS.gpstrek.getState().waypoint)) {
    slices.push(finishSlice);
  }
  if ((WIDGETS.gpstrek.getState().route && WIDGETS.gpstrek.getState().route.down !== undefined) || WIDGETS.gpstrek.getState().down != undefined) {
    slices.push(eleSlice);
  }
  slices.push(statusSlice);
  slices.push(status2Slice);
  slices.push(healthSlice);
  slices.push(systemSlice);
  slices.push(system2Slice);
  maxScreens = Math.ceil(slices.length/WIDGETS.gpstrek.getState().numberOfSlices);
};

let clear = function() {
  g.clearRect(Bangle.appRect);
};

let draw = function(){
  if (!global.screen) return;
  let ypos = Bangle.appRect.y;

  let firstSlice = (screen-1)*WIDGETS.gpstrek.getState().numberOfSlices;

  updateSlices();

  let force = lastDrawnScreen != screen || firstDraw;
  if (force){
    clear();
  }
  if (firstDraw) Bangle.drawWidgets();
  lastDrawnScreen = screen;

  let sliceHeight = getSliceHeight();
  for (let slice of slices.slice(firstSlice,firstSlice + WIDGETS.gpstrek.getState().numberOfSlices)) {
    g.reset();
    if (!slice.refresh || slice.refresh() || force) slice.draw(g,0,ypos,sliceHeight,g.getWidth());
    ypos += sliceHeight+1;
    g.drawLine(0,ypos-1,g.getWidth(),ypos-1);
  }
  
  if (scheduleDraw){
    drawInTimeout();
  }
  firstDraw = false;
};


switchNav();

clear();
}
