const STORAGE = require("Storage");
const showWidgets = true;
let numberOfSlices=4;

if (showWidgets){
  Bangle.loadWidgets();
}

let state = WIDGETS.gpstrek.getState();
WIDGETS.gpstrek.start(false);

function parseNumber(toParse){
  if (toParse.includes(".")) return parseFloat(toParse);
  return parseFloat("" + toParse + ".0");
}

function parseWaypoint(filename, offset, result){
  result.lat = parseNumber(STORAGE.read(filename, offset, 11));
  result.lon = parseNumber(STORAGE.read(filename, offset += 11, 12));
  return offset + 12;
}

function parseWaypointWithElevation(filename, offset, result){
  offset = parseWaypoint(filename, offset, result);
  result.alt = parseNumber(STORAGE.read(filename, offset, 6));
  return offset + 6;
}

function parseWaypointWithName(filename, offset, result){
  offset = parseWaypoint(filename, offset, result);
  return parseName(filename, offset, result);
}

function parseName(filename, offset, result){
  let nameLength = STORAGE.read(filename, offset, 2) - 0;
  result.name = STORAGE.read(filename, offset += 2, nameLength);
  return offset + nameLength;
}

function parseWaypointWithElevationAndName(filename, offset, result){
  offset = parseWaypointWithElevation(filename, offset, result);
  return parseName(filename, offset, result);
}

function getEntry(filename, offset, result){
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
}

const labels = ["N","NE","E","SE","S","SW","W","NW"];
const loc = require("locale");

function matchFontSize(graphics, text, height, width){
  graphics.setFontVector(height);
  let metrics;
  let size = 1;
  while (graphics.stringMetrics(text).width > 0.90 * width){
    size -= 0.05;
    graphics.setFont("Vector",Math.floor(height*size));
  }
}

function getDoubleLineSlice(title1,title2,provider1,provider2,refreshTime){
  let lastDrawn = Date.now() - Math.random()*refreshTime;
  return {
    refresh: function (){
      return Date.now() - lastDrawn > (Bangle.isLocked()?(refreshTime?refreshTime:5000):(refreshTime?refreshTime*2:10000));
    },
    draw: function (graphics, x, y, height, width){
      lastDrawn = Date.now();
      if (typeof title1 == "function") title1 = title1();
      if (typeof title2 == "function") title2 = title2();
      graphics.clearRect(x,y,x+width,y+height);

      let value = provider1();
      matchFontSize(graphics, title1 + value, Math.floor(height*0.5), width);
      graphics.setFontAlign(-1,-1);
      graphics.drawString(title1, x+2, y);
      graphics.setFontAlign(1,-1);
      graphics.drawString(value, x+width, y);

      value = provider2();
      matchFontSize(graphics, title2 + value, Math.floor(height*0.5), width);
      graphics.setFontAlign(-1,-1);
      graphics.drawString(title2, x+2, y+(height*0.5));
      graphics.setFontAlign(1,-1);
      graphics.drawString(value, x+width, y+(height*0.5));
    }
  };
}

function getTargetSlice(targetDataSource){
  let nameIndex = 0;
  let lastDrawn = Date.now() - Math.random()*3000;
  return {
    refresh: function (){
      return Date.now() - lastDrawn > (Bangle.isLocked()?10000:3000);
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
}

function drawCompass(graphics, x, y, height, width, increment, start){
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
}

function getCompassSlice(compassDataSource){
  let lastDrawn = Date.now() - Math.random()*2000;
  const buffers = 4;
  let buf = [];
  return {
    refresh : function (){return Bangle.isLocked()?(Date.now() - lastDrawn > 2000):true;},
    draw: function (graphics, x,y,height,width){
      lastDrawn = Date.now();
      const max = 180;
      const increment=width/max;

      graphics.clearRect(x,y,x+width,y+height);

      var start = compassDataSource.getCourse() - 90;
      if (isNaN(compassDataSource.getCourse())) start = -90;
      if (start<0) start+=360;
      start = start % 360;

      if (state.acc && compassDataSource.getCourseType() == "MAG"){
        drawCompass(graphics,0,y+width*0.05,height-width*0.05,width,increment,start);
      } else {
        drawCompass(graphics,0,y,height,width,increment,start);
      }


      if (compassDataSource.getPoints){
        for (let p of compassDataSource.getPoints()){
          var bpos = p.bearing - compassDataSource.getCourse();
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
          graphics.setColor(p.color);
          graphics.fillCircle(bpos,y+height-12,Math.floor(width*0.03));
        }
      }
      if (compassDataSource.getMarkers){
        for (let m of compassDataSource.getMarkers()){
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
      if (state.acc && compassDataSource.getCourseType() == "MAG") {
        let xh = E.clip(width*0.5-height/2+(((state.acc.x+1)/2)*height),width*0.5 - height/2, width*0.5 + height/2);
        let yh = E.clip(y+(((state.acc.y+1)/2)*height),y,y+height);

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
}

function radians(a) {
  return a*Math.PI/180;
}

function degrees(a) {
  var d = a*180/Math.PI;
  return (d+360)%360;
}

function bearing(a,b){
  if (!a || !b || !a.lon || !a.lat || !b.lon || !b.lat) return Infinity;
  var delta = radians(b.lon-a.lon);
  var alat = radians(a.lat);
  var blat = radians(b.lat);
  var y = Math.sin(delta) * Math.cos(blat);
  var x = Math.cos(alat)*Math.sin(blat) -
        Math.sin(alat)*Math.cos(blat)*Math.cos(delta);
  return Math.round(degrees(Math.atan2(y, x)));
}

function distance(a,b){
  if (!a || !b || !a.lon || !a.lat || !b.lon || !b.lat) return Infinity;
  var x = radians(a.lon-b.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);
  return Math.round(Math.sqrt(x*x + y*y) * 6371000);
}

function triangle (x, y, width, height){
  return  [
    Math.round(x),Math.round(y),
    Math.round(x+width * 0.5), Math.round(y+height),
    Math.round(x-width * 0.5), Math.round(y+height)
  ];
}

function setButtons(){
  Bangle.setUI("leftright", (dir)=>{
    if (dir < 0) {
      nextScreen();
    } else if (dir > 0) {
      switchMenu();
    } else {
      nextScreen();
    }
  });
}

function getApproxFileSize(name){
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
}

function parseRouteData(filename, progressMonitor){
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
}

function hasPrev(route){
  if (route.mirror) return route.index < (route.count - 1);
  return route.index > 0;
}

function hasNext(route){
  if (route.mirror) return route.index > 0;
  return route.index < (route.count - 1);
}

function next(route){
  if (!hasNext(route)) return;
  if (route.mirror) set(route, --route.index);
  if (!route.mirror) set(route, ++route.index);
}

function set(route, index){
  route.currentWaypoint = {};
  route.index = index;
  getEntry(route.filename, route.refs[index], route.currentWaypoint);
}

function prev(route){
  if (!hasPrev(route)) return;
  if (route.mirror) set(route, ++route.index);
  if (!route.mirror) set(route, --route.index);
}

let lastMirror;
let cachedLast;

function getLast(route){
  let wp = {};
  if (lastMirror != route.mirror){
    if (route.mirror) getEntry(route.filename, route.refs[0], wp);
    if (!route.mirror) getEntry(route.filename, route.refs[route.count - 1], wp);
    lastMirror = route.mirror;
    cachedLast = wp;
  }
  return cachedLast;
}

function removeMenu(){
  E.showMenu();
  switchNav();
}

function showProgress(progress, title, max){
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
}

function handleLoading(c){
  E.showMenu();
  state.route = parseRouteData(c, showProgress);
  state.waypoint = null;
  removeMenu();
  state.route.mirror = false;
}

function showRouteSelector (){
  var menu = {
    "" : {
      back : showRouteMenu,
    }
  };

  for (let c of STORAGE.list((/\.trf$/))){
    let file = c;
    menu[file] = ()=>{handleLoading(file);};
  }

  E.showMenu(menu);
}

function showRouteMenu(){
  var menu = {
    "" : {
      "title" : "Route",
      back : showMenu,
    },
    "Select file" : showRouteSelector
  };

  if (state.route){
    menu.Mirror = {
      value: state && state.route && !!state.route.mirror || false,
      onchange: v=>{
        state.route.mirror = v;
      }
    };
    menu['Select closest waypoint'] = function () {
      if (state.currentPos && state.currentPos.lat){
        setClosestWaypoint(state.route, null, showProgress); removeMenu();
      } else {
        E.showAlert("No position").then(()=>{E.showMenu(menu);});
      }
    };
    menu['Select closest waypoint (not visited)'] = function () {
      if (state.currentPos && state.currentPos.lat){
        setClosestWaypoint(state.route, state.route.index, showProgress); removeMenu();
      } else {
        E.showAlert("No position").then(()=>{E.showMenu(menu);});
      }
    };
    menu['Select waypoint'] = {
      value : state.route.index,
      min:1,max:state.route.count,step:1,
      onchange : v => { set(state.route, v-1); }
    };
    menu['Select waypoint as current position'] = function (){
      state.currentPos.lat = state.route.currentWaypoint.lat;
      state.currentPos.lon = state.route.currentWaypoint.lon;
      state.currentPos.alt = state.route.currentWaypoint.alt;
      removeMenu();
    };
  }

  if (state.route && hasPrev(state.route))
    menu['Previous waypoint'] = function() { prev(state.route); removeMenu(); };
  if (state.route && hasNext(state.route))
    menu['Next waypoint'] = function() { next(state.route); removeMenu(); };
  E.showMenu(menu);
}

function showWaypointSelector(){
  let waypoints = require("waypoints").load();
  var menu = {
    "" : {
      back : showWaypointMenu,
    }
  };

  for (let c in waypoints){
    menu[waypoints[c].name] = function (){
      state.waypoint = waypoints[c];
      state.waypointIndex = c;
      state.route = null;
      removeMenu();
    };
  }

  E.showMenu(menu);
}

function showCalibrationMenu(){
  let menu = {
    "" : {
      "title" : "Calibration",
      back : showMenu,
    },
    "Barometer (GPS)" : ()=>{
      if (!state.currentPos || isNaN(state.currentPos.alt)){
        E.showAlert("No GPS altitude").then(()=>{E.showMenu(menu);});
      } else {
        state.calibAltDiff = state.altitude - state.currentPos.alt;
        E.showAlert("Calibrated Altitude Difference: " + state.calibAltDiff.toFixed(0)).then(()=>{removeMenu();});
      }
    },
    "Barometer (Manual)" : {
      value : Math.round(state.currentPos && (state.currentPos.alt != undefined && !isNaN(state.currentPos.alt)) ? state.currentPos.alt: state.altitude),
      min:-2000,max: 10000,step:1,
      onchange : v => { state.calibAltDiff = state.altitude - v; }
    },
    "Reset Compass" : ()=>{ Bangle.resetCompass(); removeMenu();},
  };
  E.showMenu(menu);
}

function showWaypointMenu(){
  let menu = {
    "" : {
      "title" : "Waypoint",
      back : showMenu,
    },
    "Select waypoint" : showWaypointSelector,
  };
  E.showMenu(menu);
}

function showBackgroundMenu(){
  let menu = {
    "" : {
      "title" : "Background",
      back : showMenu,
    },
    "Start" : ()=>{ E.showPrompt("Start?").then((v)=>{ if (v) {WIDGETS.gpstrek.start(true); removeMenu();} else {E.showMenu(mainmenu);}});},
    "Stop" : ()=>{ E.showPrompt("Stop?").then((v)=>{ if (v) {WIDGETS.gpstrek.stop(true); removeMenu();} else {E.showMenu(mainmenu);}});},
  };
  E.showMenu(menu);
}

function showMenu(){
  var mainmenu = {
    "" : {
      "title" : "Main",
      back : removeMenu,
    },
    "Route" : showRouteMenu,
    "Waypoint" : showWaypointMenu,
    "Background" : showBackgroundMenu,
    "Calibration": showCalibrationMenu,
    "Reset" : ()=>{ E.showPrompt("Do Reset?").then((v)=>{ if (v) {WIDGETS.gpstrek.resetState(); removeMenu();} else {E.showMenu(mainmenu);}});},
    "Slices" : {
      value : numberOfSlices,
      min:1,max:6,step:1,
      onchange : v => { setNumberOfSlices(v); }
    },
  };

  E.showMenu(mainmenu);
}

let scheduleDraw = true;

function switchMenu(){
    screen = 0;
    scheduleDraw = false;
    showMenu();
}

function drawInTimeout(){
  setTimeout(()=>{
    draw();
    if (scheduleDraw)
      setTimeout(drawInTimeout, 0);
  },0);
}

function switchNav(){
  if (!screen) screen = 1;
  setButtons();
  scheduleDraw = true;
  drawInTimeout();
}

function nextScreen(){
  screen++;
  if (screen > maxScreens){
    screen = 1;
  }
}

function setClosestWaypoint(route, startindex, progress){
  if (startindex >= state.route.count) startindex = state.route.count - 1;
  if (!state.currentPos.lat){
    set(route, startindex);
    return;
  }
  let minDist = 100000000000000;
  let minIndex = 0;
  for (let i = startindex?startindex:0; i < route.count - 1; i++){
    if (progress && (i % 5 == 0)) progress(i-(startindex?startindex:0), "Searching", route.count);
    let wp = {};
    getEntry(route.filename, route.refs[i], wp);
    let curDist = distance(state.currentPos, wp);
    if (curDist < minDist){
      minDist = curDist;
      minIndex = i;
    } else {
      if (startindex) break;
    }
  }
  set(route, minIndex);
}

let screen = 1;

const compassSliceData = {
  getCourseType: function(){
    return (state.currentPos && state.currentPos.course) ? "GPS" : "MAG";
  },
  getCourse: function (){
    if(compassSliceData.getCourseType() == "GPS") return state.currentPos.course;
    return state.compassHeading?state.compassHeading:undefined;
  },
  getPoints: function (){
    let points = [];
    if (state.currentPos && state.currentPos.lon && state.route && state.route.currentWaypoint){
      points.push({bearing:bearing(state.currentPos, state.route.currentWaypoint), color:"#0f0"});
    }
    if (state.currentPos && state.currentPos.lon && state.route){
      points.push({bearing:bearing(state.currentPos, getLast(state.route)), color:"#00f"});
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
    return (state.route.index + 1) + "/" + state.route.count;
  },
  getTarget: function (){
    if (distance(state.currentPos,state.route.currentWaypoint) < 30 && hasNext(state.route)){
      next(state.route);
      Bangle.buzz(1000);
    }
    return state.route.currentWaypoint;
  },
  getStart: function (){
    return state.currentPos;
  }
};

const finishData = {
  icon: atob("EBABAAA/4DmgJmAmYDmgOaAmYD/gMAAwADAAMAAwAAAAAAA="),
  getTarget: function (){
    if (state.route) return getLast(state.route);
    if (state.waypoint) return state.waypoint;
  },
  getStart: function (){
    return state.currentPos;
  }
};

let sliceHeight;
function setNumberOfSlices(number){
  numberOfSlices = number;
  sliceHeight = Math.floor((g.getHeight()-(showWidgets?24:0))/numberOfSlices);
}

let slices = [];
let maxScreens = 1;
setNumberOfSlices(3);

let compassSlice = getCompassSlice(compassSliceData);
let waypointSlice = getTargetSlice(waypointData);
let finishSlice = getTargetSlice(finishData);
let eleSlice = getDoubleLineSlice("Up","Down",()=>{
  return loc.distance(state.up,3) + "/" + (state.route ? loc.distance(state.route.up,3):"---");
},()=>{
  return loc.distance(state.down,3) + "/" + (state.route ? loc.distance(state.route.down,3): "---");
});

let statusSlice = getDoubleLineSlice("Speed","Alt",()=>{
  let speed = 0;
  if (state.currentPos && state.currentPos.speed) speed = state.currentPos.speed;
  return loc.speed(speed,2);
},()=>{
  let alt = Infinity;
  if (!isNaN(state.altitude)){
    alt = isNaN(state.calibAltDiff) ? state.altitude : (state.altitude - state.calibAltDiff);
  }
  if (state.currentPos && state.currentPos.alt) alt = state.currentPos.alt;
  return loc.distance(alt,3);
});

let status2Slice = getDoubleLineSlice("Compass","GPS",()=>{
  return (state.compassHeading?Math.round(state.compassHeading):"---") + "°";
},()=>{
  let course = "---°";
  if (state.currentPos && state.currentPos.course) course = state.currentPos.course + "°";
  return course;
},200);

let healthSlice = getDoubleLineSlice("Heart","Steps",()=>{
  return state.bpm;
},()=>{
  return state.steps;
});

let system2Slice = getDoubleLineSlice("Bat","",()=>{
  return (Bangle.isCharging()?"+":"") + E.getBattery().toFixed(0)+"% " + NRF.getBattery().toFixed(2) + "V";
},()=>{
  return "";
});

let systemSlice = getDoubleLineSlice("RAM","Storage",()=>{
  let ram = process.memory(false);
  return ((ram.blocksize * ram.free)/1024).toFixed(0)+"kB";
},()=>{
  return (STORAGE.getFree()/1024).toFixed(0)+"kB";
});

function updateSlices(){
  slices = [];
  slices.push(compassSlice);

  if (state.currentPos && state.currentPos.lat && state.route && state.route.currentWaypoint && state.route.index < state.route.count - 1) {
    slices.push(waypointSlice);
  }
  if (state.currentPos && state.currentPos.lat && (state.route || state.waypoint)) {
    slices.push(finishSlice);
  }
  if ((state.route && state.route.down !== undefined) || state.down != undefined) {
    slices.push(eleSlice);
  }
  slices.push(statusSlice);
  slices.push(status2Slice);
  slices.push(healthSlice);
  slices.push(systemSlice);
  slices.push(system2Slice);
  maxScreens = Math.ceil(slices.length/numberOfSlices);
}

function clear() {
  g.clearRect(0,(showWidgets ? 24 : 0), g.getWidth(),g.getHeight());
}
let lastDrawnScreen;
let firstDraw = true;

function draw(){
  if (!screen) return;
  let ypos = showWidgets ? 24 : 0;

  let firstSlice = (screen-1)*numberOfSlices;

  updateSlices();

  let force = lastDrawnScreen != screen || firstDraw;
  if (force){
    clear();
    if (showWidgets){
      Bangle.drawWidgets();
    }
  }
  lastDrawnScreen = screen;

  for (let slice of slices.slice(firstSlice,firstSlice + numberOfSlices)) {
    g.reset();
    if (!slice.refresh || slice.refresh() || force) slice.draw(g,0,ypos,sliceHeight,g.getWidth());
    ypos += sliceHeight+1;
    g.drawLine(0,ypos-1,g.getWidth(),ypos-1);
  }
  firstDraw = false;
}


switchNav();

g.clear();
