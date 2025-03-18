
{ //run in own scope for fast switch

const MODE_MENU = 0;
const MODE_MAP = 1;
const MODE_SLICES = 2;

const STORAGE = require("Storage");
const BAT_FULL = require("Storage").readJSON("setting.json").batFullVoltage || 0.3144;


const SETTINGS = Object.assign(
  require('Storage').readJSON("gpstrek.default.json", true) || {},
  require('Storage').readJSON("gpstrek.json", true) || {}
);

let init = function(){
  global.screen = 1;
  global.drawTimeout = undefined;
  global.lastDrawnScreen = 0;
  global.firstDraw = true;
  global.slices = [];
  global.maxSlicePages = 1;
  global.scheduleDraw = false;

  Bangle.loadWidgets();
  WIDGETS.gpstrek.start(false);
  if (!WIDGETS.gpstrek.getState().mode) WIDGETS.gpstrek.getState().mode = MODE_MENU;
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

let cache = {};
let cachedOffsets = [];

let getFromCache = function(filename, offset, result){
  if(filename == cache.filename && cache[offset]) {
    Object.assign(result, cache[offset]);
    result.access = Date.now();
    return offset + cache[offset].fileLength;
  }
  return offset;
};

let cacheCleanup = function (){
  if (SETTINGS.cacheMinFreeMem){
    while (cachedOffsets.length > 0 && process.memory(false).free < SETTINGS.cacheMinFreeMem){
      cache[cachedOffsets.shift()] = undefined;
    }
  }
  if (SETTINGS.cacheMaxEntries){
    while (cachedOffsets.length > SETTINGS.cacheMaxEntries){
      cache[cachedOffsets.shift()] = undefined;
    }
  }
};

let cacheAdd = function (filename, result) {
  cacheCleanup();
  if(cache.filename != filename) {
    cache = {};
    cache.filename = filename;
  }
  cache[result.fileOffset] = result;
  cachedOffsets.push(result.fileOffset);
};

let getEntry = function(filename, offset, result, noCaching){
  if (offset < 0) return offset;
  let cacheOffset = getFromCache(filename, offset, result);
  if (cacheOffset != offset) return cacheOffset;
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
  if (!noCaching && (SETTINGS.cacheMaxEntries || SETTINGS.cacheMinFreeMem)){
    cacheAdd(filename, result);
  }
  return offset;
};

const labels = ["N","NE","E","SE","S","SW","W","NW"];
const loc = require("locale");

let matchFontSize = function(graphics, text, height, width){
  graphics.setFontVector(height);
  //let metrics;
  let size = 1;
  while (graphics.stringMetrics(text).width > 0.90 * width){
    size -= 0.05;
    graphics.setFont("Vector",Math.floor(height*size));
  }
};

let getDoubleLineSlice = function(title1,title2,provider1,provider2){
  return {
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

const arrow = Graphics.createImage(`
     X
    XXX
   XXXXX
  XXX XXX
 XXX   XXX
XXX     XXX
`);

const thinarrow = Graphics.createImage(`
    X
   XXX
  XX XX
 XX   XX
XX     XX
`);

const cross = Graphics.createImage(`
XX       XX
 XX     XX
  XX   XX
   XX XX
    XXX
   XX XX
  XX   XX
 XX     XX
XX       XX
`);

const move = Graphics.createImage(`
      X
     XXX
    X X X
      X
      X
  X   X   X
 X    X    X
XXXXXXXXXXXXX
 X    X    X
  X   X   X
      X
      X
    X X X
     XXX
      X
`);

const point = Graphics.createImage(`
   XX
  XXXX
 XX  XX
XX    XX
XX    XX
 XX  XX
  XXXX
   XX
`);

let isGpsCourse = function(){
  return WIDGETS.gpstrek.getState().currentPos && isFinite(WIDGETS.gpstrek.getState().currentPos.course);
};

let isMapOverview = false;
let forceMapRedraw = false;

let activeTimeouts = [];
let taskQueue = [];
let queueProcessing = false;

let addToTaskQueue = function (func, data){
  if (queueProcessing) print("Adding during processing, this should not happen");
  taskQueue.push({f:func,d:data});
};

let prependTaskQueue = function (func, data, force){
  if (queueProcessing && !force) print("Prepending during processing, this should not happen");
  taskQueue.unshift({f:func,d:data});
};

let runQueue = function(inTimeouts){
  if (taskQueue.length > 0){
    let current = taskQueue.shift();
    if (inTimeouts){
      let id = setTimeout(()=>{
        current.f(current.d);
        activeTimeouts = activeTimeouts.filter((c)=>c!=id);
        runQueue(inTimeouts);
      },SETTINGS.queueWaitingTime);
      activeTimeouts.push(id);
    } else {
      current.f(current.d);
      runQueue(inTimeouts);
    }
  }
};

let processTaskQueue = function(inTimeouts){
  if (queueProcessing) return;
  addToTaskQueue(()=>{queueProcessing=false;});
  queueProcessing = true;
  runQueue(inTimeouts);
};

let clearTaskQueue = function(){
  taskQueue = [];
  for (let c of activeTimeouts){
    clearTimeout(c);
  }
  queueProcessing = false;
};

let getMapSlice = function(){
  let lastDrawn = 0;
  let lastCourse = 0;
  let lastStart;
  let lastCurrent;
  return {
    draw: function (graphics, x, y, height, width){
      let s = WIDGETS.gpstrek.getState();

      let course = 0;
      if (isGpsCourse())
        course = s.currentPos.course;
      else
        course = getAveragedCompass();

      let route = s.route;
      if (!route) return;
      let waypoint = get(route);
      let currentRouteIndex = getWaypointIndex(route);
      let startingPoint = Bangle.project(waypoint);
      let current = startingPoint;
      let currentPosFromGPS = false;
      if (s.currentPos.lat) {
        current = Bangle.project(s.currentPos);
        currentPosFromGPS = true;
      } else {
        // in case of no actual position assume previous waypoint as current
        let prevPoint = getPrev(route, currentRouteIndex);
        if (prevPoint && prevPoint.lat) current = Bangle.project(prevPoint);
      }

      const interfaceHeight = g.getHeight()*0.1;
      const errorMarkerSize=3;
      let compassHeight = height*0.4;
      if (!SETTINGS.mapCompass) compassHeight=0;
      if (compassHeight > g.getHeight()*0.1) compassHeight = g.getHeight()*0.1;
      let compassCenterX = x + errorMarkerSize + 8 + compassHeight;
      let compassCenterY = y + errorMarkerSize + 8 + compassHeight;
      let mapCenterX = isMapOverview?mapOverviewX:x+(width-10)/2+compassHeight+5;
      let mapCenterY = isMapOverview?mapOverviewY:y+height*0.4;
      let mapScale = isMapOverview?mapOverviewScale : mapLiveScale;
      let mapRot = require("graphics_utils").degreesToRadians(180-(isMapOverview?0:course));
      let mapTrans = {
        scale: mapScale,
        rotate: mapRot,
        x: mapCenterX,
        y: mapCenterY
      };

      let drawInterface = function(){

        graphics.setClipRect(x,y,x+width,y+height);
        graphics.setFont("Vector",25).setFontAlign(0,0);
        graphics.setColor(graphics.theme.fg);
        graphics.clearRect(x,y+height-interfaceHeight,x+width,y+height-1);

        graphics.drawRect(x,y+height-interfaceHeight,x+width/4,y+height-1);
        graphics.drawString("-", x+width*0.125,y+height-interfaceHeight*0.5);

        graphics.drawRect(x+width*0.75,y+height-interfaceHeight,x+width-1,y+height-1);
        graphics.drawString("+", x+width*0.875,y+height-interfaceHeight*0.5);

        let refs = [10,20,50,100,200,300,400,500,800,1000,2000,5000,10000,50000];
        let l = width*0.4;
        let scale = refs[0];
        for (let c of refs){
          if (c*mapScale > l)
            break;
          else
            scale = c;
        }
        let scaleString = loc.distance(scale, 2);

        let scaleHeight = interfaceHeight * 0.2;
        graphics.setFontAlign(-1,-1).setFont("Vector",12);
        graphics.drawString(scaleString,x+width*0.31,y+height-interfaceHeight, true);
        if (isFinite(scale)){
          graphics.drawLine(x+width*0.3,y+height-scaleHeight,x+width*0.3+scale*mapScale,y+height-scaleHeight);
          graphics.drawLine(x+width*0.3,y+height-scaleHeight,x+width*0.3,y+height-interfaceHeight);
          graphics.drawLine(x+width*0.3+scale*mapScale,y+height-scaleHeight,x+width*0.3+scale*mapScale,y+height-interfaceHeight);
        }
      };

      let drawMapCompass = function(){
        graphics.setClipRect(x,y,x+width,y+height-interfaceHeight-1);
        graphics.setFont6x15();
        let compass = [ 0,0, 0, compassHeight, 0, -compassHeight, compassHeight,0,-compassHeight,0 ];
        compass = graphics.transformVertices(compass, {
          rotate:require("graphics_utils").degreesToRadians(180-course),
          x: compassCenterX,
          y: compassCenterY
        });
        graphics.setFontAlign(0,0);
        graphics.setColor(graphics.theme.bg);
        graphics.fillCircle(compassCenterX, compassCenterY,compassHeight+7);
        graphics.setColor(graphics.theme.fg);
        graphics.drawCircle(compassCenterX, compassCenterY,compassHeight);
        graphics.drawString("N", compass[2], compass[3], true);
        graphics.drawString("S", compass[4], compass[5], true);
        graphics.drawString("W", compass[6], compass[7], true);
        graphics.drawString("E", compass[8], compass[9], true);

        if(!isGpsCourse() && !isMapOverview) {
          let xh = E.clip(s.acc.x*compassHeight, -compassHeight, compassHeight);
          let yh = E.clip(s.acc.y*compassHeight, -compassHeight, compassHeight);
          graphics.fillCircle(compassCenterX + xh, compassCenterY + yh,3);
        } else if (isMapOverview){
          graphics.setColor(0,0,1);
          graphics.fillCircle(compassCenterX, compassCenterY,3);
        }
      };

      let drawCurrentPos = function(){
        graphics.setClipRect(x,y,x+width,y+height-interfaceHeight-1);
        graphics.setColor(graphics.theme.fg);

        if (currentPosFromGPS) {
          let pos = graphics.transformVertices([ startingPoint.x - current.x, (startingPoint.y - current.y)*-1 ], mapTrans);

          if (!isMapOverview){
            if (pos[0] < x) { pos[0] = x + errorMarkerSize + 5; graphics.setColor(1,0,0).fillRect(x,y,x+errorMarkerSize,y+height);}
            if (pos[0] > x + width) {pos[0] = x + width - errorMarkerSize - 5; graphics.setColor(1,0,0).fillRect(x + width - errorMarkerSize,y,x + width ,y+height);}
            if (pos[1] < y) {pos[1] = y + errorMarkerSize + 1; graphics.setColor(1,0,0).fillRect(x,y,x + width,y+errorMarkerSize);}
            if (pos[1] > y + height - interfaceHeight -1) { pos[1] = y + height - errorMarkerSize - 5-interfaceHeight-1; graphics.setColor(1,0,0).fillRect(x,y + height - errorMarkerSize-interfaceHeight-1,x + width ,y+height-interfaceHeight-1);}
          }

          if (isMapOverview) {
            graphics.drawImage(arrow, pos[0],pos[1], {rotate: require("graphics_utils").degreesToRadians(course)});
          } else {
            graphics.drawImage(arrow, pos[0]-arrow.width/2,pos[1]);
          }
          graphics.setColor(0,1,0);
          graphics.fillRect(mapCenterX-1,mapCenterY-1, mapCenterX+1,mapCenterY+1);
          graphics.drawCircle(mapCenterX,mapCenterY, mapScale*SETTINGS.waypointChangeDist);
          graphics.setColor(graphics.theme.fg);
        } else {
          graphics.setColor(0,1,0);
          graphics.fillCircle(mapCenterX,mapCenterY, 5);
          graphics.setColor(graphics.theme.fg);
        }
      };

      let courseChanged = Math.abs(lastCourse - course) > SETTINGS.minCourseChange;
      let oldEnough = Date.now() - lastDrawn > SETTINGS.mapRefresh;
      let startChanged = (!lastStart || lastStart.x != startingPoint.x || lastStart.y != startingPoint.y);
      let neededChange = (SETTINGS.minPosChange/(isMapOverview?mapOverviewScale:mapLiveScale));
      let currentChanged = (!lastCurrent || (Math.abs(lastCurrent.x - current.x)) > neededChange|| (Math.abs(lastCurrent.y - current.y)) > neededChange);
      let liveChanged = !isMapOverview && (startChanged || currentChanged || courseChanged);
      let refreshMap = forceMapRedraw || (oldEnough && (liveChanged));

      let renderInTimeouts = isMapOverview || !Bangle.isLocked();
      if (refreshMap) {
        clearTaskQueue();

        //clear map view
        graphics.clearRect(x,y,x+width,y+height-interfaceHeight-1);

        if (isMapOverview && scrolling){
          addToTaskQueue(()=>{
            graphics.setColor(graphics.theme.fg);
            graphics.drawImage(move, compassCenterX-compassHeight, compassCenterY-compassHeight);
          });
        }

        if (!isMapOverview){
          drawCurrentPos();
        }
        if (SETTINGS.mapCompass && !isMapOverview && renderInTimeouts){
          drawMapCompass();
        }
        if (renderInTimeouts) drawInterface();

        forceMapRedraw = false;
        lastDrawn = Date.now();

        let drawPath = function(reverse, startingIndex, maxWaypoints){
          let data = {
            i:startingIndex,
            poly:[],
            maxWaypoints: maxWaypoints,
            breakLoop: false,
            dist: 0
          };

          let drawChunk = function(data){
            if (data.breakLoop) return;
            graphics.setColor(graphics.theme.fg);
            graphics.setClipRect(x,y,x+width,y+height-interfaceHeight-1);
            let finish;
            let last;
            let toDraw;
            let named = [];
            let dir = [];
            for (let j = 0; j < SETTINGS.mapChunkSize; j++){
              data.i = data.i + (reverse?-1:1);
              let p = get(route, data.i);
              if (!p || !p.lat) {
                data.i = data.i + (reverse?1:-1);
                data.breakLoop = true;
                break;
              }
              if (data.maxWaypoints && Math.abs(startingIndex - data.i) > data.maxWaypoints) {
                data.breakLoop = true;
                last = true;
                break;
              }
              toDraw = Bangle.project(p);

              if (SETTINGS.mapDirection){
                let lastWp = get(route, data.i - (reverse?-1:1));
                if (lastWp) data.dist+=distance(lastWp,p);
                if (!isMapOverview && data.dist > 20/mapScale){
                  dir.push({i:data.poly.length,b:require("graphics_utils").degreesToRadians(bearing(lastWp,p)-(reverse?0:180))});
                  data.dist=0;
                }
              }
              if (p.name)
                named.push({i:data.poly.length,n:p.name});
              data.poly.push(startingPoint.x-toDraw.x);
              data.poly.push((startingPoint.y-toDraw.y)*-1);
            }
            finish = isLast(route, getWaypointIndex(route, data.i));

            data.poly = graphics.transformVertices(data.poly, mapTrans);
            graphics.drawPoly(data.poly, false);

            if (!isMapOverview && (data.poly[data.poly.length-2] < (x - 10)
              || data.poly[data.poly.length-2] > (x + width + 10)
              || data.poly[data.poly.length-1] < (y - 10)
              || data.poly[data.poly.length-1] > (y + height + 10))) data.breakLoop = true;

            graphics.setFont6x15().setFontAlign(-1,0);
            for (let c of named){
              if (data.i != 0 || currentPosFromGPS){
                graphics.drawImage(point, Math.round(data.poly[c.i]-point.width/2), Math.round(data.poly[c.i+1]-point.height/2));
              }
              graphics.drawString(c.n, data.poly[c.i] + 10, data.poly[c.i+1]);
            }

            for (let c of dir){
              graphics.drawImage(thinarrow, data.poly[c.i], data.poly[c.i+1], {rotate: c.b});
            }

            if (finish)
              graphics.drawImage(finishIcon, data.poly[data.poly.length - 2] -5, data.poly[data.poly.length - 1] - 4);
            else if (last) {
              graphics.drawImage(cross, data.poly[data.poly.length - 2] - cross.width/2, data.poly[data.poly.length - 1] - cross.height/2);
            }

            //Add last drawn point to get closed path
            if (toDraw) {
              data.poly = [ startingPoint.x-toDraw.x, (startingPoint.y-toDraw.y)*-1];
              toDraw = null;
            }

            if (!data.breakLoop){
              prependTaskQueue(drawChunk, data, true);
            }
          };
          addToTaskQueue(drawChunk, data);
        };

        drawPath(true, currentRouteIndex+1);
        drawPath(false, currentRouteIndex-1);

        addToTaskQueue(drawInterface);

        addToTaskQueue(drawCurrentPos);

        addToTaskQueue(()=>{
          lastCourse = course;
          lastStart = startingPoint;
          lastCurrent = current;
        })
        processTaskQueue(renderInTimeouts);
      }
      if (SETTINGS.mapCompass && !isMapOverview){
        drawMapCompass();
      }
    }
  };
};

let getTargetSlice = function(targetDataSource){
  let nameIndex = 0;
  return {
    draw: function (graphics, x, y, height, width){
      graphics.clearRect(x,y,x+width,y+height);
      if (targetDataSource.icon){
        graphics.drawImage(targetDataSource.icon,x,y + (height - 16)/2);
        x += 16;
        width -= 16;
      }

      let start = targetDataSource.getStart();
      let target = targetDataSource.getTarget();

      if (!target || !start) return;

      let dist = distance(start,target);
      if (isNaN(dist)) dist = Infinity;
      let bearingString = bearing(start,target) + "°";
      if (target.name) {
        graphics.setFont("Vector",Math.floor(height*0.5));
        let scrolledName = (target.name || "").substring(nameIndex);
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
        let bearingString = bearing(start,target) + "°";
        let formattedDist = loc.distance(dist,2);
        let distNum = (formattedDist.match(/[0-9\.]+/) || [Infinity])[0];

        matchFontSize(graphics, bearingString + distNum, height*0.8, width);
        graphics.setFontAlign(-1,-1);
        graphics.drawString(bearingString, x+2, y);
        graphics.setFontAlign(1,-1);
        graphics.drawString(distNum, x + width, y);
        graphics.setFont("Vector",Math.floor(height*0.25));

        graphics.setFontAlign(-1,1);
        if (targetDataSource.getProgress){
          graphics.drawString(targetDataSource.getProgress(), x + 2, y + height);
        }
        graphics.setFontAlign(1,1);
        if (isFinite(distNum) && distNum != Infinity)
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
      graphics.drawString(labels[Math.floor(res/45)%8],xpos,y+height*0.1);
      graphics.fillRect(xpos-1,Math.floor(y+height*0.8),xpos+1,Math.floor(y+height));
    } else if (res%45==0) {
      graphics.drawString(labels[Math.floor(res/45)%8],xpos,y+height*0.1);
      graphics.fillRect(xpos-1,Math.floor(y+height*0.7),xpos+1,Math.floor(y+height));
    } else if (res%15==0) {
      graphics.fillRect(xpos,Math.floor(y+height*0.9),xpos+1,Math.floor(y+height));
    }
    xpos+=increment*15;
    if (xpos > width + 20) break;
  }
};

let getCompassSlice = function(){
  let compassDataSource = {
    getCourse: function (){
      if(isGpsCourse()) return WIDGETS.gpstrek.getState().currentPos.course;
      return getAveragedCompass();
    },
    getPoints: function (){
      let points = [];
      let s = WIDGETS.gpstrek.getState();
      if (s.currentPos && s.currentPos.lon && s.route){
        points.push({bearing:bearing(s.currentPos, getLast(s.route)), icon: finishIcon});
      }
      if (s.currentPos && s.currentPos.lon && s.waypoint){
        points.push({bearing:bearing(s.currentPos, s.waypoint), icon: finishIcon});
      }
      if (s.currentPos && s.currentPos.lon && s.route){
        points.push({bearing:bearing(s.currentPos, get(s.route)), color:"#0f0"});
      }
      return points;
    },
    getMarkers: function (){
      return [{xpos:0.5, width:10, height:10, linecolor:g.theme.fg, fillcolor:"#f00"}];
    }
  };
  let lastDrawnValue = 0;
  //const buffers = 4;
  //let buf = [];
  return {
    refresh: function(){
      return Math.abs(lastDrawnValue - compassDataSource.getCourse()) > SETTINGS.minCourseChange;
    },
    draw: function (graphics, x,y,height,width){
      const max = 180;
      const increment=width/max;

      let s = WIDGETS.gpstrek.getState();

      let course = isGpsCourse() ? s.currentPos.course : getAveragedCompass();

      lastDrawnValue = course;

      graphics.clearRect(x,y,x+width,y+height);

      var start = course - 90;
      if (isNaN(course)) start = -90;
      if (start<0) start+=360;
      start = start % 360;

      if (s.acc && !isGpsCourse()){
        drawCompass(graphics,0,y+width*0.05,height-width*0.05,width,increment,start);
      } else {
        drawCompass(graphics,0,y,height,width,increment,start);
      }


      if (compassDataSource.getPoints){
        let points = compassDataSource.getPoints(); //storing this in a variable works around a minifier bug causing a problem in the next line: for(let a of a.getPoints())
        for (let p of points){
          g.reset();
          var bpos = p.bearing - course;
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
      if (s.acc && !isGpsCourse()) {
        let xh = E.clip(width*0.5-height/2+(((s.acc.x+1)/2)*height),width*0.5 - height/2, width*0.5 + height/2);
        let yh = E.clip(y+(((s.acc.y+1)/2)*height),y,y+height);

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

mapOverviewX = g.getWidth()/2;
mapOverviewY = g.getHeight()/2;
mapOverviewScale = SETTINGS.overviewScale;
mapLiveScale = SETTINGS.mapScale;

let onAction = function(_,xy){
  clearTaskQueue();
  forceMapRedraw = true;
  if (WIDGETS.gpstrek.getState().mode == MODE_MAP){
    stopDrawing();
    if (xy && xy.y > Bangle.appRect.y+Bangle.appRect.h-g.getHeight()*0.2 && xy.y <= Bangle.appRect.y2){
      if (xy.x < Bangle.appRect.x + Bangle.appRect.w/2)
        if (isMapOverview) {
          mapOverviewScale /= 1.33;
        } else {
          mapLiveScale /= 1.33;
        }
      else
        if (isMapOverview) {
          mapOverviewScale *= 1.33;
        } else {
          mapLiveScale *= 1.33;
        }
    } else if (isMapOverview && xy && xy.y > Bangle.appRect.y){
      scrolling = !scrolling;
    }
    startDrawing();
  }
};

let scrolling = false;

let onSwipe = function(dirLR,dirUD){
  let s = WIDGETS.gpstrek.getState();
  clearTaskQueue();
  forceMapRedraw = true;

  if (s.mode == MODE_MAP){
    if (!scrolling){
      if (dirLR > 0) {
        switchMode(MODE_MENU);
      } else if (dirLR < 0) {
        switchMode(MODE_SLICES);
      }
      if (dirUD){
        isMapOverview = !isMapOverview;
        if (!isMapOverview){
          mapOverviewX = g.getWidth()/2;
          mapOverviewY = g.getHeight()/2;
          scrolling = false;
        }
        startDrawing();
      }
    } else {
      mapOverviewX += dirLR * SETTINGS.overviewScroll;
      mapOverviewY += dirUD * SETTINGS.overviewScroll;
    }
  } else if (s.mode == MODE_SLICES){
    if (dirLR > 0) {
      if (s.route){
        switchMode(MODE_MAP);
      } else {
        switchMode(MODE_MENU);
      }
    } else if (dirLR < 0) {
      switchMode(MODE_MENU);
    }
    if (dirUD){
      setSlicesPage(dirUD);
    }
  } else {
    if (dirLR > 0) {
      switchMode(MODE_SLICES);
    } else if (dirLR < 0) {
      if (s.route){
        switchMode(MODE_MAP);
      } else {
        switchMode(MODE_SLICES);
      }
    }
  }
};


let setButtons = function(){
  Bangle.removeListener("swipe", onSwipe);
  let options = {
    mode: "custom",
    swipe: onSwipe,
    btn: onAction,
    touch: onAction,
  };
  Bangle.setUI(options);
};

let getFileSize = function(filename){
  return STORAGE.readArrayBuffer(filename).byteLength;
};

let writeUint24 = function(filename, number, offset, size){
  let b = new ArrayBuffer(3);
  let n = new Uint24Array(b,0,1);
  n[0] = number;
  STORAGE.write(filename,b,offset,size);
};

let writeUint32 = function(filename, number, offset, size){
  let b = new ArrayBuffer(4);
  let n = new Uint32Array(b,0,1);
  n[0] = number;
  STORAGE.write(filename,b,offset,size);
};

let getRouteIndex = function(route){
  if (!route.indexToOffset) loadIndex(route);
  return route.indexToOffset;
}

let getIndexFileName = function(filename){
  return filename.substring(0,filename.length-1) + "i";
}

let loadIndex = function(routeInfo){
  routeInfo.indexToOffset = new Uint24Array(STORAGE.readArrayBuffer(getIndexFileName(routeInfo.filename)),4,routeInfo.count);
}

let loadRouteData = function(filename, progressMonitor){
  let routeInfo = {};

  routeInfo.filename = filename;

  let c = {};
  let scanOffset = 0;
  routeInfo.length = 0;
  routeInfo.mirror = false;
  let lastSeenWaypoint;
  let lastSeenAlt;
  let waypoint = {};
  let count = 0;

  routeInfo.up = 0;
  routeInfo.down = 0;

  let trfHash = E.CRC32(STORAGE.read(filename));
  let size = getFileSize(filename);
  let indexFileName = filename.substring(0,filename.length-1) + "i";
  //shortest possible entry is 24 characters + linebreak, 3 bytes per entry, 4 bytes hash in front
  let indexFileSize = Math.ceil(size/25*3 + 4);
  let createIndexFile = !STORAGE.read(indexFileName);
  if (!createIndexFile){
    let currentHash = new Uint32Array(STORAGE.readArrayBuffer(indexFileName),0,1)[0];
    if (currentHash != trfHash){
      createIndexFile = true;
    }
  }

  // write hash into index file, will be recreated by this
  if (createIndexFile)
    writeUint32(indexFileName, trfHash, 0, indexFileSize);

  while ((scanOffset = getEntry(filename, scanOffset, waypoint, true)) > 0) {
    if (count % 5 == 0) progressMonitor(scanOffset, "Loading", size);
    if (lastSeenWaypoint){
      routeInfo.length += distance(lastSeenWaypoint, waypoint);

      let diff = waypoint.alt - lastSeenAlt;
      if (waypoint.alt && lastSeenAlt && diff > 3){
        if (lastSeenAlt < waypoint.alt){
          routeInfo.up += diff;
        } else {
          routeInfo.down += diff;
        }
      }
    }
    if (createIndexFile) writeUint24(indexFileName, waypoint.fileOffset, 4 + count * 3, indexFileSize);
    count++;
    lastSeenWaypoint = waypoint;
    if (isFinite(waypoint.alt)) lastSeenAlt = waypoint.alt;
    waypoint = {};
  }
  routeInfo.count = count;
  loadIndex(routeInfo);

  set(routeInfo, 0);
  return routeInfo;
};

let hasPrev = function(route, index){
  if (isNaN(index)) index = getWaypointIndex(route);
  return index > 0;
};

let hasNext = function(route, index, count){
  if (!count) count = 1;
  if (isNaN(index)) index = route.index;
  return getWaypointIndex(route, index) + count < (getRouteIndex(route).length);
};

let getNext = function(route, index, count){
  if (!count) count = 1;
  if (isNaN(index)) index = getWaypointIndex(route);
  index += count;
  if (index >= getRouteIndex(route).length || index < 0) return;
  let result = {};
  getEntry(route.filename, getRouteIndex(route)[getWaypointIndex(route, index)], result);
  return result;
};

let get = function(route, index){
  if (isNaN(index)) index = getWaypointIndex(route);
  if (index >= getRouteIndex(route).length || index < 0) return;
  let result = {};
  getEntry(route.filename, getRouteIndex(route)[getWaypointIndex(route, index)], result);
  return result;
};

let getWaypointIndex = function(route, index){
  if (isNaN(index)) index = route.index;
  return route.mirror?getRouteIndex(route).length-1-index:index;
};

let setWaypointIndex = function(route, waypointIndex){
  if (route.mirror)
    route.index = getRouteIndex(route).length - 1 - waypointIndex;
  else
    route.index = waypointIndex;
};

let getPrev = function(route, index){
  return getNext(route, index, -1);
};

let next = function(route){
  if (!hasNext(route)) return;
  set(route, getWaypointIndex(route)+1);
};

let set = function(route, index){
  if (!route) return;
  route.index = getWaypointIndex(route, index);
};

let prev = function(route){
  if (!hasPrev(route)) return;
  set(route, getWaypointIndex(route)-1);
};

let getLast = function(route){
  return get(route, getRouteIndex(route).length - 1);
};

let isLast = function(route, index){
  if (isNaN(index)) index = route.index;
  index = getWaypointIndex(route, index);
  return getRouteIndex(route).length - 1 == index;
};

let removeMenu = function(){
  let s = WIDGETS.gpstrek.getState();
  E.showMenu();
  switch(searchNeeded){
    case 1:
      setClosestWaypoint(s.route, getWaypointIndex(s.route), showProgress);
      break;
    case 2:
      setClosestWaypoint(s.route, 0, showProgress)
      break;
  }
  searchNeeded = 0;
  onSwipe(-1,0);
};

let showProgress = function(progress, title, max){
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
  let s = WIDGETS.gpstrek.getState();
  s.route = loadRouteData(c, showProgress);
  if(SETTINGS.autosearch && searchNeeded < 2) searchNeeded = 2;
  s.waypoint = null;
};

let showRouteSelector  = function(){
  var menu = {
    "" : {
      back : showRouteMenu,
    }
  };

  STORAGE.list(/\.trf$/).sort().forEach((file)=>{
      menu[file] = ()=>{handleLoading(file); showRouteMenu()};
  });

  E.showMenu(menu);
};

// 1 for complete search, 2 for starting at current waypoint
let searchNeeded = 0;

let showRouteMenu = function(){
  var menu = {
    "" : {
      "title" : "Route",
      back : showMenu,
    },
    "Select file" : showRouteSelector
  };

  let s = WIDGETS.gpstrek.getState();

  if (s.route){
    menu.Mirror = {
      value: s && s.route && !!s.route.mirror || false,
      onchange: v=>{
        if (s.route.mirror != v){
          s.route.mirror = v;
          if(SETTINGS.autosearch)
            if (searchNeeded < 2) searchNeeded = 2;
          else
            setWaypointIndex(s.route, 0);
        }
      }
    };
    menu['Select closest waypoint'] = function () {
      if (s.currentPos && s.currentPos.lat){
        if (searchNeeded < 2) searchNeeded = 2;
        removeMenu();
      } else {
        E.showAlert("No position").then(()=>{E.showMenu(menu);});
      }
    };
    menu['Select closest waypoint (not visited)'] = function () {
      if (s.currentPos && s.currentPos.lat){
        if (searchNeeded < 1) searchNeeded = 1;
        removeMenu();
      } else {
        E.showAlert("No position").then(()=>{E.showMenu(menu);});
      }
    };
    menu['Select waypoint'] = {
      value : getWaypointIndex(s.route),
      min:0,max:getRouteIndex(s.route).length-1,step:1,
      onchange : v => { setWaypointIndex(s.route, v); }
    };
    menu['Select waypoint as current position'] = function (){
      let c = get(s.route);
      s.currentPos.lat = c.lat;
      s.currentPos.lon = c.lon;
      s.currentPos.alt = c.alt;
      removeMenu();
    };
  }

  if (s.route && hasPrev(s.route))
    menu['Previous waypoint'] = function() { prev(s.route); removeMenu(); };
  if (s.route && hasNext(s.route))
    menu['Next waypoint'] = function() { next(s.route); removeMenu(); };
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
      let s = WIDGETS.gpstrek.getState();
      s.waypoint = waypoints[c];
      s.waypointIndex = c;
      s.route = null;
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
      let s = WIDGETS.gpstrek.getState();
      if (!s.currentPos || isNaN(s.currentPos.alt)){
        E.showAlert("No GPS altitude").then(()=>{E.showMenu(menu);});
      } else {
        s.calibAltDiff = s.altitude - s.currentPos.alt;
        E.showAlert("Calibrated Altitude Difference: " + s.calibAltDiff.toFixed(0)).then(()=>{removeMenu();});
      }
    },
    "Barometer (Manual)" : {
      value : Math.round(WIDGETS.gpstrek.getState().currentPos && (WIDGETS.gpstrek.getState().currentPos.alt != undefined && isFinite(WIDGETS.gpstrek.getState().currentPos.alt)) ? WIDGETS.gpstrek.getState().currentPos.alt: WIDGETS.gpstrek.getState().altitude),
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
    "Start" : ()=>{ E.showPrompt("Start?").then((v)=>{ if (v) {WIDGETS.gpstrek.start(true); showMenu();} else {showMenu();}}).catch(()=>{showMenu();});},
    "Stop" : ()=>{ E.showPrompt("Stop?").then((v)=>{ if (v) {WIDGETS.gpstrek.stop(true); showMenu();} else {showMenu();}}).catch(()=>{showMenu();});},
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
  };

  E.showMenu(mainmenu);
  Bangle.removeListener("swipe", onSwipe);
  Bangle.on("swipe",onSwipe);
};

let switchMenu = function(){
  stopDrawing();
  showMenu();
};

let stopDrawing = function(){
  if (global.drawTimeout) clearTimeout(global.drawTimeout);
  global.drawTimeout = undefined;
  scheduleDraw = false;
};

let startDrawing = function(){
  firstDraw = true;
  scheduleDraw = true;
  draw();
  drawInTimeout();
};

let drawInTimeout = function(){
  if (global.drawTimeout) return;
  drawTimeout = setTimeout(()=>{
    drawTimeout = undefined;
    draw();
  },Bangle.isLocked()?SETTINGS.refreshLocked:SETTINGS.refresh);
};

let switchNav = function(){
  setButtons();
  startDrawing();
};

let setSlicesPage = function(change){
  page_slices -= change;
  if (page_slices >= maxSlicePages){
    page_slices = 0;
  }
  if (page_slices < 0){
    page_slices = maxSlicePages - 1;
  }
  drawInTimeout();
};

let setClosestWaypoint = function(route, startindex, progress, maxDist){
  let s = WIDGETS.gpstrek.getState();

  let stopSearchAfterFirstMatch = !isFinite(startindex);
  if (!startindex) startindex = 0;
  if (startindex >= getRouteIndex(s.route).length) startindex = getRouteIndex(s.route).length - 1;
  if (startindex < 0) startindex = 0;

  if (!s.currentPos.lat){
    set(route, startindex);
    return;
  }
  if (!maxDist) maxDist = Number.MAX_VALUE;
  let minDist = maxDist;
  let mincount = 0;

  let currentPos = s.currentPos;
  let count = 0;
  let wp;
  do {
    if (progress && (count % 5 == 0)) progress(count+startindex, "Searching", getRouteIndex(route).length);
    wp = getNext(route, startindex, count);
    if (!wp) break;
    let curDist = distance(currentPos, wp);
    if (curDist > maxDist) {
      break;
    }
    if (curDist < minDist){
      minDist = curDist;
      mincount = count;
    } else {
      if (stopSearchAfterFirstMatch) break;
    }
    count++;
  } while (wp);
  set(route, startindex + mincount);
};

const finishIcon = atob("CggB//meZmeZ+Z5n/w==");

const waypointData = {
  icon: atob("EBCBAAAAAAAAAAAAcIB+zg/uAe4AwACAAAAAAAAAAAAAAAAA"),
  getProgress: function() {
    return (getWaypointIndex(WIDGETS.gpstrek.getState().route) + 1) + "/" + getRouteIndex(WIDGETS.gpstrek.getState().route).length;
  },
  getTarget: function (){
    return get(WIDGETS.gpstrek.getState().route);
  },
  getStart: function (){
    return WIDGETS.gpstrek.getState().currentPos;
  }
};

const finishData = {
  icon: atob("EBABAAA/4DmgJmAmYDmgOaAmYD/gMAAwADAAMAAwAAAAAAA="),
  getTarget: function (){
    let s = WIDGETS.gpstrek.getState();
    if (s.route) return getLast(s.route);
    if (s.waypoint) return s.waypoint;
  },
  getStart: function (){
    return WIDGETS.gpstrek.getState().currentPos;
  }
};

let getSliceHeight = function(number){
  return Math.floor(Bangle.appRect.h/SETTINGS.numberOfSlices);
};

let compassSlice = getCompassSlice();
let mapSlice = getMapSlice();
let waypointSlice = getTargetSlice(waypointData);
let finishSlice = getTargetSlice(finishData);
let eleSlice = getDoubleLineSlice("Up","Down",()=>{
  let s = WIDGETS.gpstrek.getState();
  return loc.distance(s.up,3) + "/" + (s.route ? loc.distance(s.route.up,3):"---");
},()=>{
  let s = WIDGETS.gpstrek.getState();
  return loc.distance(s.down,3) + "/" + (s.route ? loc.distance(s.route.down,3): "---");
});

let statusSlice = getDoubleLineSlice("Speed","Alt",()=>{
  let speed = 0;
  let s = WIDGETS.gpstrek.getState();
  if (s.currentPos && s.currentPos.speed) speed = s.currentPos.speed;
  return loc.speed(speed,2);
},()=>{
  let alt = Infinity;
  let s = WIDGETS.gpstrek.getState();
  if (isFinite(s.altitude)){
    alt = isNaN(s.calibAltDiff) ? s.altitude : (s.altitude - s.calibAltDiff);
  }
  if (s.currentPos && s.currentPos.alt) alt = s.currentPos.alt;
  if (isNaN(alt)) return "---";
  return loc.distance(alt,3);
});

let status2Slice = getDoubleLineSlice("Compass","GPS",()=>{
  return getAveragedCompass() + "°";
},()=>{
  let course = "---°";
  let s = WIDGETS.gpstrek.getState();
  if (s.currentPos && s.currentPos.course) course = s.currentPos.course.toFixed(0) + "°";
  return course;
});

let healthSlice = getDoubleLineSlice("Heart","Steps",()=>{
  return WIDGETS.gpstrek.getState().bpm || "---";
},()=>{
  return isFinite(WIDGETS.gpstrek.getState().steps)? WIDGETS.gpstrek.getState().steps: "---";
});

let system2Slice = getDoubleLineSlice("Bat","Storage",()=>{
  return (Bangle.isCharging()?"+":"") + E.getBattery().toFixed(0)+"% " + (analogRead(D3)*4.2/BAT_FULL).toFixed(2) + "V";
},()=>{
  return (STORAGE.getFree()/1024).toFixed(0)+"kB";
});

let systemSlice = getDoubleLineSlice("RAM","WP Cache",()=>{
  let ram = process.memory(false);
  return ((ram.blocksize * ram.free)/1024).toFixed(0)+"kB";
},()=>{
  return cachedOffsets.length?cachedOffsets.length:0;
});

let clear = function() {
  g.clearRect(Bangle.appRect);
};

let minimumDistance = Number.MAX_VALUE;
let lastSearch = 0;
let autosearchCounter = 0;

let updateRouting = function() {
  let s = WIDGETS.gpstrek.getState();
  if (s.mode != MODE_MENU && s.route && s.currentPos.lat) {
    let currentDistanceToTarget = distance(s.currentPos,get(s.route));
    if (currentDistanceToTarget < minimumDistance){
      minimumDistance = currentDistanceToTarget;
    }
    if (SETTINGS.autosearch && autosearchCounter < SETTINGS.autosearchLimit && !isMapOverview && lastSearch + 15000 < Date.now() && minimumDistance < currentDistanceToTarget - SETTINGS.waypointChangeDist){
      Bangle.buzz(1000);
      setClosestWaypoint(s.route, getWaypointIndex(s.route), null, SETTINGS.maxDistForAutosearch);
      minimumDistance = Number.MAX_VALUE;
      lastSearch = Date.now();
      autosearchCounter++;
    }
    while (hasNext(s.route) && distance(s.currentPos,get(s.route)) < SETTINGS.waypointChangeDist) {
      next(s.route);
      minimumDistance = Number.MAX_VALUE;
      autosearchCounter = 0;
    }
  }
};

let updateSlices = function(){
  let s = WIDGETS.gpstrek.getState();
  slices = [ compassSlice ];
  if (s.currentPos && s.currentPos.lat && s.route && !isLast(s.route)) {
    slices.push(waypointSlice);
  }
  if (s.currentPos && s.currentPos.lat && (s.route || s.waypoint)) {
    slices.push(finishSlice);
  }
  slices.push(eleSlice);
  slices.push(statusSlice);
  slices.push(status2Slice);
  slices.push(healthSlice);
  slices.push(systemSlice);
  slices.push(system2Slice);
  maxSlicePages = Math.ceil(slices.length/SETTINGS.numberOfSlices);
};

let page_slices = 0;

let switchMode = function(targetMode){
  switch (targetMode){
    case MODE_MENU:
      WIDGETS.gpstrek.getState().mode = MODE_MENU;
      switchMenu();
      break;
    case MODE_MAP:
    case MODE_SLICES:
      WIDGETS.gpstrek.getState().mode = targetMode;
      E.showMenu();
      switchNav();
      break;
  }
}

let lastDrawnMode;
let lastDrawnPage;

let drawMap = function(){
  g.reset();
  mapSlice.draw(g,Bangle.appRect.x,Bangle.appRect.y, Bangle.appRect.h,Bangle.appRect.w);
}

let drawSlices = function(){
  let s = WIDGETS.gpstrek.getState();
  updateSlices();
  let ypos = Bangle.appRect.y;
  let force = lastDrawnPage != page_slices || firstDraw;
  if (force){
    clear();
  }
  let firstSlice = page_slices*SETTINGS.numberOfSlices;
  let sliceHeight = getSliceHeight();
  let slicesToDraw = slices.slice(firstSlice,firstSlice + SETTINGS.numberOfSlices);
  for (let slice of slicesToDraw) {
    g.reset();
    if (!slice.refresh || slice.refresh() || force)
      slice.draw(g,0,ypos,sliceHeight,g.getWidth());
    ypos += sliceHeight+1;
    g.drawLine(0,ypos-1,g.getWidth(),ypos-1);
  }
  lastDrawnPage = page_slices;
}

let draw = function(){
  let s = WIDGETS.gpstrek.getState();
  if (s.mode == MODE_MENU) return;

  if (lastDrawnMode != s.mode)
    firstDraw = true;

  if (firstDraw) {
    g.clear();
    Bangle.drawWidgets();
  }

  switch (s.mode) {
    case MODE_MAP:
      drawMap();
      break;
    case MODE_SLICES:
      drawSlices();
      break;
  }

  firstDraw = false;
  lastDrawnMode = s.mode;

  if (scheduleDraw){
    drawInTimeout();
  }
};

clear();

switchMode(MODE_SLICES);

setInterval(updateRouting, 500);
}
