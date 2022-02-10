Bangle.loadWidgets();
Bangle.drawWidgets();

var settings;

var osm;
try { // if it's installed, use the OpenStreetMap module
  osm = require("openstmap");
} catch (e) {}

function loadSettings() {
  settings = require("Storage").readJSON("recorder.json",1)||{};
  var changed = false;
  if (!settings.file) {
    changed = true;
    settings.file = "recorder.log0.csv";
  }
  if (!Array.isArray(settings.record)) {
    settings.record = ["gps"];
    changed = true;
  }
  if (changed)
    require("Storage").writeJSON("recorder.json", settings);
}
loadSettings();

function updateSettings() {
  require("Storage").writeJSON("recorder.json", settings);
  if (WIDGETS["recorder"])
    WIDGETS["recorder"].reload();
}

function getTrackNumber(filename) {
  return parseInt(filename.match(/^recorder\.log(.*)\.csv$/)[1]||0);
}

function showMainMenu() {
  function boolFormat(v) { return v?"Yes":"No"; }
  function menuRecord(id) {
    return {
      value: settings.record.includes(id),
      format: boolFormat,
      onchange: v => {
        settings.recording = false; // stop recording if we change anything
        settings.record = settings.record.filter(r=>r!=id);
        if (v) settings.record.push(id);
        updateSettings();
      }
    };
  }
  const mainmenu = {
    '': { 'title': 'Recorder' },
    '< Back': ()=>{load();},
    'RECORD': {
      value: !!settings.recording,
      format: v=>v?"On":"Off",
      onchange: v => {
        setTimeout(function() {
          E.showMenu();
          WIDGETS["recorder"].setRecording(v).then(function() {
            print("Complete");
            loadSettings();
            print(settings.recording);
            showMainMenu();
          });
        }, 1);
      }
    },
    'File #': {
      value: getTrackNumber(settings.file),
      min: 0,
      max: 99,
      step: 1,
      onchange: v => {
        settings.recording = false; // stop recording if we change anything
        settings.file = "recorder.log"+v+".csv";
        updateSettings();
      }
    },
    'View Tracks': ()=>{viewTracks();},
    'Time Period': {
      value: settings.period||10,
      min: 1,
      max: 120,
      step: 1,
      format: v=>v+"s",
      onchange: v => {
        settings.recording = false; // stop recording if we change anything
        settings.period = v;
        updateSettings();
      }
    }
  };
  var recorders = WIDGETS["recorder"].getRecorders();
  Object.keys(recorders).forEach(id=>{
    mainmenu["Log "+recorders[id]().name] = menuRecord(id);
  });
  delete recorders;
  return E.showMenu(mainmenu);
}



function viewTracks() {
  const menu = {
    '': { 'title': 'Tracks' }
  };
  var found = false;
  require("Storage").list(/^recorder\.log.*\.csv$/,{sf:true}).forEach(filename=>{
    found = true;
    menu["Track "+getTrackNumber(filename)] = ()=>viewTrack(filename,false);
  });
  if (!found)
    menu["No Tracks found"] = function(){};
  menu['< Back'] = () => { showMainMenu(); };
  return E.showMenu(menu);
}

function getTrackInfo(filename) {
  "ram"
  var minLat = 90;
  var maxLat = -90;
  var minLong = 180;
  var maxLong = -180;
  var starttime, duration=0;
  var f = require("Storage").open(filename,"r");
  if (f===undefined) return;
  var l = f.readLine(f);
  var fields, timeIdx, latIdx, lonIdx;
  var nl = 0, c, n;
  if (l!==undefined) {
    fields = l.trim().split(",");
    timeIdx = fields.indexOf("Time");
    latIdx = fields.indexOf("Latitude");
    lonIdx = fields.indexOf("Longitude");
    l = f.readLine(f);
  }
  if (l!==undefined) {
    c = l.split(",");
    starttime = parseInt(c[timeIdx]);
  }
  // pushed this loop together to try and bump loading speed a little
  while(l!==undefined) {
    ++nl;c=l.split(",");l = f.readLine(f);
    if (c[latIdx]=="")continue;
    n = +c[latIdx];if(n>maxLat)maxLat=n;if(n<minLat)minLat=n;
    n = +c[lonIdx];if(n>maxLong)maxLong=n;if(n<minLong)minLong=n;
  }
  if (c) duration = parseInt(c[timeIdx]) - starttime;
  var lfactor = Math.cos(minLat*Math.PI/180);
  var ylen = (maxLat-minLat);
  var xlen = (maxLong-minLong)* lfactor;
  var screenSize = g.getHeight()-48; // 24 for widgets, plus a border
  var scale = xlen>ylen ? screenSize/xlen : screenSize/ylen;
  return {
    fn : getTrackNumber(filename),
    fields : fields,
    filename : filename,
    time : new Date(starttime*1000),
    records : nl,
    minLat : minLat, maxLat : maxLat,
    minLong : minLong, maxLong : maxLong,
    lat : (minLat+maxLat)/2, lon : (minLong+maxLong)/2,
    lfactor : lfactor,
    scale : scale,
    duration : Math.round(duration)
  };
}

function asTime(v){
  var mins = Math.floor(v/60);
  var secs = v-mins*60;
  return ""+mins.toString()+"m "+secs.toString()+"s";
}

function viewTrack(filename, info) {
  if (!info) {
    E.showMessage("Loading...","Track "+getTrackNumber(filename));
    info = getTrackInfo(filename);
  }
  //console.log(info);
  const menu = {
    '': { 'title': 'Track '+info.fn }
  };
  if (info.time)
    menu[info.time.toISOString().substr(0,16).replace("T"," ")] = function(){};
  menu["Duration"] = { value : asTime(info.duration)};
  menu["Records"] = { value : ""+info.records };
  if (info.fields.includes("Latitude"))
    menu['Plot Map'] = function() {
      info.qOSTM = false;
      plotTrack(info);
    };
  if (osm && info.fields.includes("Latitude"))
    menu['Plot OpenStMap'] = function() {
      info.qOSTM = true;
      plotTrack(info);
    }
  if (info.fields.includes("Altitude"))
    menu['Plot Alt.'] = function() {
      plotGraph(info, "Altitude");
    };
  if (info.fields.includes("Latitude"))
    menu['Plot Speed'] = function() {
      plotGraph(info, "Speed");
    };
  // TODO: steps, heart rate?
  menu['Erase'] = function() {
    E.showPrompt("Delete Track?").then(function(v) {
      if (v) {
        settings.recording = false;
        updateSettings();
        var f = require("Storage").open(filename,"r");
        f.erase();
        viewTracks();
      } else
        viewTrack(n, info);
    });
  };
  menu['< Back'] = () => { viewTracks(); };

  function plotTrack(info) { "ram"
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
      };
    }

    E.showMenu(); // remove menu
    E.showMessage("Drawing...","Track "+info.fn);
    g.flip(); // on buffered screens, draw a not saying we're busy
    g.clear(1);
    var s = require("Storage");
    var W = g.getWidth();
    var H = g.getHeight();
    var cx = W/2;
    var cy = 24 + (H-24)/2;
    if (!info.qOSTM) {
      g.setColor("#f00").fillRect(9,80,11,120).fillPoly([9,60,19,80,0,80]);
      g.setColor(g.theme.fg).setFont("6x8").setFontAlign(0,0).drawString("N",10,50);
    } else {
      osm.lat = info.lat;
      osm.lon = info.lon;
      osm.draw();
      g.setColor("#000");
    }
    var latIdx = info.fields.indexOf("Latitude");
    var lonIdx = info.fields.indexOf("Longitude");
    g.drawString(asTime(info.duration),10,220);
    var f = require("Storage").open(info.filename,"r");
    if (f===undefined) return;
    var l = f.readLine(f);
    l = f.readLine(f); // skip headers
    var ox=0;
    var oy=0;
    var olat,olong,dist=0;
    var i=0, c = l.split(",");
    // skip until we find our first data
    while(l!==undefined && c[latIdx]=="") {
      c = l.split(",");
      l = f.readLine(f);
    }
    // now start plotting
    var lat = +c[latIdx];
    var long = +c[lonIdx];
    var mp = getMapXY(lat, long);
    g.moveTo(mp.x,mp.y);
    g.setColor("#0f0");
    g.fillCircle(mp.x,mp.y,5);
    if (info.qOSTM) g.setColor("#f09");
    else g.setColor(g.theme.fg);
    l = f.readLine(f);
    g.flip(); // force update
    while(l!==undefined) {
      c = l.split(",");l = f.readLine(f);
      if (c[latIdx]=="")continue;
      lat = +c[latIdx];
      long = +c[lonIdx];
      mp = getMapXY(lat, long);
      g.lineTo(mp.x,mp.y);
      if (info.qOSTM) g.fillCircle(mp.x,mp.y,2); // make the track more visible
      var d = distance(olat,olong,lat,long);
      if (!isNaN(d)) dist+=d;
      olat = lat;
      olong = long;
      ox = mp.x;
      oy = mp.y;
      if (++i > 100) { g.flip();i=0; }
    }
    g.setColor("#f00");
    g.fillCircle(ox,oy,5);
    if (info.qOSTM) g.setColor("#000");
    else g.setColor(g.theme.fg);
    g.drawString(require("locale").distance(dist),g.getWidth() / 2, g.getHeight() - 20);
    g.setFont("6x8",2);
    g.setFontAlign(0,0,3);
    g.drawString("Back",g.getWidth() - 10, g.getHeight() - 40);
    setWatch(function() {
      viewTrack(info.fn, info);
    }, global.BTN3||BTN1);
    Bangle.drawWidgets();
    g.flip();
  }

  function plotGraph(info, style) { "ram"
    E.showMenu(); // remove menu
    E.showMessage("Calculating...","Track "+info.fn);
    var filename = info.filename;
    var infn = new Float32Array(80);
    var infc = new Uint16Array(80);
    var title;
    var lt = 0; // last time
    var tn = 0; // count for each time period
    var strt, dur = info.duration;
    var f = require("Storage").open(filename,"r");
    if (f===undefined) return;
    var l = f.readLine(f);
    l = f.readLine(f); // skip headers
    var nl = 0, c, i;
    var timeIdx = info.fields.indexOf("Time");
    if (l!==undefined) {
      c = l.split(",");
      strt = c[timeIdx];
    }
    if (style=="Altitude") {
      title = "Altitude (m)";
      var altIdx = info.fields.indexOf("Altitude");
      while(l!==undefined) {
        ++nl;c=l.split(",");l = f.readLine(f);
        if (c[altIdx]=="") continue;
        i = Math.round(80*(c[timeIdx] - strt)/dur);
        infn[i]+=+c[altIdx];
        infc[i]++;
      }
    } else if (style=="Speed") {
      title = "Speed (m/s)";
      var latIdx = info.fields.indexOf("Latitude");
      var lonIdx = info.fields.indexOf("Longitude");
      // skip until we find our first data
      while(l!==undefined && c[latIdx]=="") {
        c = l.split(",");
        l = f.readLine(f);
      }
      // now iterate
      var p,lp = Bangle.project({lat:c[1],lon:c[2]});
      var t,dx,dy,d,lt = c[timeIdx];
      while(l!==undefined) {
        ++nl;c=l.split(",");
        l = f.readLine(f);
        if (c[latIdx] == "") {
          continue;
        }
        t = c[timeIdx];
        i = Math.round(80*(t - strt)/dur);
        p = Bangle.project({lat:c[latIdx],lon:c[lonIdx]});
        dx = p.x-lp.x;
        dy = p.y-lp.y;
        d = Math.sqrt(dx*dx+dy*dy);
        if (t!=lt) {
          infn[i]+=d / (t-lt); // speed
          infc[i]++;
        }
        lp = p;
        lt = t;
      }
    } else throw new Error("Unknown type "+style);
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
      miny: min,
      maxy: max,
      xlabel : x=>Math.round(x*dur/(60*infn.length))+" min" // minutes
    });
    g.setFont("6x8",2);
    g.setFontAlign(0,0,3);
    g.drawString("Back",g.getWidth() - 10, g.getHeight() - 40);
    setWatch(function() {
      viewTrack(info.filename, info);
    }, global.BTN3||BTN1);
    g.flip();
  }

  return E.showMenu(menu);
}


showMainMenu();
