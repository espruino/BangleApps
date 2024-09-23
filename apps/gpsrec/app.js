Bangle.loadWidgets();
Bangle.drawWidgets();

var settings = require("Storage").readJSON("gpsrec.json",1)||{};
var osm;
try { // if it's installed, use the OpenStreetMap module
  osm = require("openstmap");
} catch (e) {}

function getFN(n) {
  return ".gpsrc"+n.toString(36);
}

function updateSettings() {
  require("Storage").write("gpsrec.json", settings);
  if (WIDGETS["gpsrec"])
    WIDGETS["gpsrec"].reload();
}

function showMainMenu() {
  const mainmenu = {
    '': { 'title': 'GPS Record' },
    'RECORD': {
      value: !!settings.recording,
      onchange: v => {
        settings.recording = v;
        updateSettings();
      }
    },
    'File #': {
      value: settings.file|0,
      min: 0,
      max: 35,
      step: 1,
      onchange: v => {
        settings.recording = false;
        settings.file = v;
        updateSettings();
      }
    },
    'Time Period': {
      value: settings.period||10,
      min: 1,
      max: 120,
      step: 1,
      format: v=>v+"s",
      onchange: v => {
        settings.recording = false;
        settings.period = v;
        updateSettings();
      }
    },
    'View Tracks': ()=>{viewTracks();},
    '< Back': ()=>{load();}
  };
  return E.showMenu(mainmenu);
}

function viewTracks() {
  const menu = {
    '': { 'title': 'GPS Tracks' }
  };
  var found = false;
  for (var n=0;n<36;n++) {
    var f = require("Storage").open(getFN(n),"r");
    if (f.readLine()!==undefined) {
      menu["Track "+n] = (n=>viewTrack(n)).bind(null,n,false);
      found = true;
    }
  }
  if (!found)
    menu["No Tracks found"] = function(){};
  menu['< Back'] = () => { showMainMenu(); };
  return E.showMenu(menu);
}

function getTrackInfo(fn) {
  "ram"
  var filename = getFN(fn);
  var minLat = 90;
  var maxLat = -90;
  var minLong = 180;
  var maxLong = -180;
  var starttime, duration=0;
  var f = require("Storage").open(filename,"r");
  if (f===undefined) return;
  var l = f.readLine(f);
  var nl = 0, c, n;
  if (l!==undefined) {
    c = l.split(",");
    starttime = parseInt(c[0]);
  }
  // pushed this loop together to try and bump loading speed a little
  while(l!==undefined) {
    ++nl;c=l.split(",");
    n = +c[1];if(n>maxLat)maxLat=n;if(n<minLat)minLat=n;
    n = +c[2];if(n>maxLong)maxLong=n;if(n<minLong)minLong=n;
    l = f.readLine(f);
  }
  if (c) duration = parseInt(c[0]) - starttime;
  var lfactor = Math.cos(minLat*Math.PI/180);
  var ylen = (maxLat-minLat);
  var xlen = (maxLong-minLong)* lfactor;
  var screenSize = g.getHeight()-48; // 24 for widgets, plus a border
  var scale = xlen>ylen ? screenSize/xlen : screenSize/ylen;
  return {
    fn : fn,
    filename : filename,
    time : new Date(starttime),
    records : nl,
    minLat : minLat, maxLat : maxLat,
    minLong : minLong, maxLong : maxLong,
    lat : (minLat+maxLat)/2, lon : (minLong+maxLong)/2,
    lfactor : lfactor,
    scale : scale,
    duration : Math.round(duration/1000)
  };
}

function asTime(v){
  var mins = Math.floor(v/60);
  var secs = v-mins*60;
  return ""+mins.toString()+"m "+secs.toString()+"s";
}

function viewTrack(n, info) {
  if (!info) {
    E.showMessage(/*LANG*/"Loading...","GPS Track "+n);
    info = getTrackInfo(n);
  }
  const menu = {
    '': { 'title': 'GPS Track '+n }
  };
  if (info.time)
    menu[info.time.toISOString().substr(0,16).replace("T"," ")] = function(){};
  menu["Duration"] = { value : asTime(info.duration)};
  menu["Records"] = { value : ""+info.records };
  menu['Plot Map'] = function() {
    info.qOSTM = false;
    plotTrack(info);
  };
  if (osm)
    menu['Plot OpenStMap'] = function() {
      info.qOSTM = true;
      plotTrack(info);
    }
  menu['Plot Alt.'] = function() {
    plotGraph(info, "altitude");
  };
  menu['Plot Speed'] = function() {
    plotGraph(info, "speed");
  };
  menu['Erase'] = function() {
    E.showPrompt("Delete Track?").then(function(v) {
      if (v) {
        settings.recording = false;
        updateSettings();
        var f = require("Storage").open(getFN(n),"r");
        f.erase();
        viewTracks();
      } else
        viewTrack(n, info);
    });
  };
  menu['< Back'] = () => { viewTracks(); };
  return E.showMenu(menu);
}

function plotTrack(info) {
  "ram"

  function distance(lat1,long1,lat2,long2) { "ram"
    var x = (long1-long2) * Math.cos((lat1+lat2)*Math.PI/360);
    var y = lat2 - lat1;
    return Math.sqrt(x*x + y*y) * 6371000 * Math.PI / 180;
  }

  // Function to convert lat/lon to XY
  var getMapXY;
  if (info.qOSTM) {
    getMapXY = osm.latLonToXY.bind(osm);
  } else {
    getMapXY = function(lat, lon) { "ram"
      return {x:cx + Math.round((long - info.lon)*info.lfactor*info.scale),
              y:cy + Math.round((info.lat - lat)*info.scale)};
    }
  }

  E.showMenu(); // remove menu
  E.showMessage("Drawing...","GPS Track "+info.fn);
  g.flip(); // on buffered screens, draw a not saying we're busy
  g.clear(1);
  var cx = g.getWidth()/2;
  var cy = 24 + (g.getHeight()-24)/2;
  g.setColor(1,0.5,0.5);
  g.setFont("Vector",16);
  g.drawString("Track"+info.fn.toString()+" - Loading",10,220);
  g.setColor(g.theme.bg);
  g.fillRect(0,220,239,239);
  if (!info.qOSTM) {
    g.setColor(1, 0, 0);
    g.fillRect(9,80,11,120);
    g.fillPoly([9,60,19,80,0,80]);
    g.setColor(g.theme.fg);
    g.drawString("N",2,40);
  } else {
    osm.lat = info.lat;
    osm.lon = info.lon;
    osm.draw();
    g.setColor(0, 0, 0);
  }
  g.drawString(asTime(info.duration),10,220);
  var f = require("Storage").open(info.filename,"r");
  if (f===undefined) return;
  var l = f.readLine(f);
  var ox=0;
  var oy=0;
  var olat,olong,dist=0;
  var i=0;
  var c = l.split(",");
  var lat = +c[1];
  var long = +c[2];
  var mp = getMapXY(lat, long);
  g.moveTo(mp.x,mp.y);
  g.setColor(0,1,0);
  g.fillCircle(mp.x,mp.y,5);
  if (info.qOSTM) g.setColor(1,0,0.55);
  else g.setColor(g.theme.fg);
  l = f.readLine(f);
  while(l!==undefined) {
    c = l.split(",");
    lat = +c[1];
    long = +c[2];
    mp = getMapXY(lat, long);
    g.lineTo(mp.x,mp.y);
    if (info.qOSTM) g.fillCircle(mp.x,mp.y,2); // make the track more visible
    var d = distance(olat,olong,lat,long);
    if (!isNaN(d)) dist+=d;
    olat = lat;
    olong = long;
    ox = mp.x;
    oy = mp.y;
    l = f.readLine(f);
  }
  g.setColor(1,0,0);
  g.fillCircle(ox,oy,5);
  if (info.qOSTM) g.setColor(0, 0, 0);
  else g.setColor(g.theme.fg);
  g.drawString(require("locale").distance(dist,2),g.getWidth() / 2, g.getHeight() - 20);
  g.setFont("6x8",2);
  g.setFontAlign(0,0,3);
  g.drawString("Back",g.getWidth() - 10, g.getHeight()/2);
  setWatch(function() {
    viewTrack(info.fn, info);
  }, global.BTN3||BTN1);
  Bangle.drawWidgets();
  g.flip();
}

function plotGraph(info, style) {
  "ram"
  E.showMenu(); // remove menu
  E.showMessage("Calculating...","GPS Track "+info.fn);
  var filename = getFN(info.fn);
  var infn = new Float32Array(80);
  var infc = new Uint16Array(80);
  var title;
  var lt = 0; // last time
  var strt, dur = info.duration;
  var f = require("Storage").open(filename,"r");
  if (f===undefined) return;
  var l = f.readLine(f);
  var nl = 0, c, i;
  if (l!==undefined) {
    c = l.split(",");
    strt = c[0]/1000;
  }
  if (style=="altitude") {
    title = "Altitude (m)";
    while(l!==undefined) {
      ++nl;c=l.split(",");
      i = Math.round(80*(c[0]/1000 - strt)/dur);
      infn[i]+=+c[3];
      infc[i]++;
      l = f.readLine(f);
    }
  } else if (style=="speed") {
    title = "Speed (m/s)";
    var p,lp = Bangle.project({lat:c[1],lon:c[2]});
    var t,dx,dy,d,lt = c[0]/1000;
    while(l!==undefined) {
      ++nl;c=l.split(",");
      i = Math.round(80*(c[0]/1000 - strt)/dur);
      t = c[0]/1000;
      p = Bangle.project({lat:c[1],lon:c[2]});
      dx = p.x-lp.x;
      dy = p.y-lp.y;
      d = Math.sqrt(dx*dx+dy*dy);
      if (t!=lt) {
        infn[i]+=d / (t-lt); // speed
        infc[i]++;
      }
      lp = p;
      lt = t;
      l = f.readLine(f);
    }
  } else throw new Error("Unknown type");
  var min=100000,max=-100000;
  for (var i=0;i<infn.length;i++) {
    if (infc[i]>0) infn[i]/=infc[i];
    var n = infn[i];
    if (n>max) max=n;
    if (n<min) min=n;
  }
  // work out a nice grid value
  var heightDiff = max-min;
  var grid = 1;
  while (heightDiff/grid > 8) {
    grid*=2;
  }
  // draw
  g.clear(1).setFont("6x8",1);
  var r = require("graph").drawLine(g, infn, {
    x:4,y:24,
    width: g.getWidth()-24,
    height: g.getHeight()-(24+8),
    axes : true,
    gridy : grid,
    gridx : infn.length / 3,
    title: title,
    xlabel : x=>Math.round(x*dur/(60*infn.length))+" min" // minutes
  });
  g.setFont("6x8",2);
  g.setFontAlign(0,0,3);
  g.drawString("Back",g.getWidth() - 10, g.getHeight() - 40);
  setWatch(function() {
    viewTrack(info.fn, info);
  }, global.BTN3||BTN1);
  g.flip();
}

showMainMenu();
