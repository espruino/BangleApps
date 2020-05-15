Bangle.loadWidgets();
Bangle.drawWidgets();

var settings = require("Storage").readJSON("gpsrec.json",1)||{};

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
      format: v=>v?"On":"Off",
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
      value: settings.period||1,
      min: 1,
      max: 60,
      step: 1,
      onchange: v => {
        settings.recording = false;
        settings.period = v;
        updateSettings();
      }
    },
    'View Tracks': viewTracks,
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
      menu["Track "+n] = viewTrack.bind(null,n,false);
      found = true;
    }
  }
  if (!found)
    menu["No Tracks found"] = function(){};
  menu['< Back'] = showMainMenu;
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
  var scale = xlen>ylen ? 200/xlen : 200/ylen;
  return {
    fn : fn,
    filename : filename,
    time : new Date(starttime),
    records : nl,
    minLat : minLat, maxLat : maxLat,
    minLong : minLong, maxLong : maxLong,
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
    E.showMessage("Loading...","GPS Track "+n);
    info = getTrackInfo(n);
  }
  const menu = {
    '': { 'title': 'GPS Track '+n }
  };
  if (info.time)
    menu[info.time.toISOString().substr(0,16).replace("T"," ")] = function(){};
  menu["Duration"] = { value : asTime(info.duration)};
  menu["Records"] = { value : ""+info.records };
  menu['Plot'] = function() {
    plotTrack(info);
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
  menu['< Back'] = viewTracks;
  return E.showMenu(menu);
}

function plotTrack(info) {
  "ram"

  function radians(a) {
    return a*Math.PI/180;
  }

  function distance(lat1,long1,lat2,long2){
    var x = radians(long1-long2) * Math.cos(radians((lat1+lat2)/2));
    var y = radians(lat2-lat1);
    return Math.sqrt(x*x + y*y) * 6371000;
  }

  E.showMenu(); // remove menu
  g.setColor(1,0.5,0.5);
  g.setFont("Vector",16);
  g.fillRect(9,80,11,120);
  g.fillPoly([9,60,19,80,0,80]);
  g.setColor(1,1,1);
  g.drawString("N",2,40);
  g.drawString("Track"+info.fn.toString()+" - Loading",10,220);
  g.setColor(0,0,0);
  g.fillRect(0,220,239,239);
  g.setColor(1,1,1);
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
  var x = 30 + Math.round((long-info.minLong)*info.lfactor*info.scale);
  var y = 210 - Math.round((lat - info.minLat)*info.scale);
  g.moveTo(x,y);
  g.setColor(0,1,0);
  g.fillCircle(x,y,5);
  g.setColor(1,1,1);
  l = f.readLine(f);
  while(l!==undefined) {
    c = l.split(",");
    lat = +c[1];
    long = +c[2];
    x = 30 + Math.round((long-info.minLong)*info.lfactor*info.scale);
    y = 210 - Math.round((lat - info.minLat)*info.scale);
    g.lineTo(x,y);
    var d = distance(olat,olong,lat,long);
    if (!isNaN(d)) dist+=d;
    olat = lat;
    olong = long;
    ox = x;
    oy = y;
    l = f.readLine(f);
  }
  g.setColor(1,0,0);
  g.fillCircle(ox,oy,5);
  g.setColor(1,1,1);
  g.drawString(require("locale").distance(dist),120,220);
  g.setFont("6x8",2);
  g.setFontAlign(0,0,3);
  g.drawString("Back",230,200);
  setWatch(function() {
    viewTrack(info.fn, info);
  }, BTN3);
}

showMainMenu();
