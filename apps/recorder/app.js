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
  require("recorder").reload();
}

function getTrackNumber(filename) {
  var matches = filename.match(/^recorder\.log(.*)\.csv$/);
  if (matches) return matches[1];
  return 0;
}

function showMainMenu() {
  function menuRecord(id) {
    return {
      value: settings.record.includes(id),
      onchange: v => {
        settings.recording = false; // stop recording if we change anything
        settings.record = settings.record.filter(r=>r!=id);
        if (v) settings.record.push(id);
        updateSettings();
      }
    };
  }
  const mainmenu = {
    '': { 'title': /*LANG*/'Recorder' },
    '< Back': ()=>{load();},
    /*LANG*/'RECORD': {
      value: !!settings.recording,
      onchange: v => {
        setTimeout(function() {
          E.showMenu();
          require("recorder").setRecording(v).then(function() {
            //print("Record start Complete");
            loadSettings();
            //print("Recording: "+settings.recording);
            showMainMenu();
          });
        }, 1);
      }
    },
    /*LANG*/'File' : {value:getTrackNumber(settings.file)},
    /*LANG*/'View Tracks': ()=>{viewTracks();},
    /*LANG*/'Time Period': {
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
  var recorders = require("recorder").getRecorders();
  Object.keys(recorders).forEach(id=>{
    mainmenu[/*LANG*/"Log "+recorders[id]().name] = menuRecord(id);
  });
  delete recorders;
  return E.showMenu(mainmenu);
}



function viewTracks() {
  const menu = {
    '': { 'title': /*LANG*/'Tracks' }
  };
  var found = false;
  require("Storage").list(/^recorder\.log.*\.csv$/,{sf:true}).reverse().forEach(filename=>{
    found = true;
    menu[/*LANG*/getTrackNumber(filename)] = ()=>viewTrack(filename,false);
  });
  if (!found)
    menu[/*LANG*/"No Tracks found"] = function(){};
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
    E.showMessage(/*LANG*/"Loading...",/*LANG*/"Track "+getTrackNumber(filename));
    info = getTrackInfo(filename);
  }
  //console.log(info);
  const menu = {
    '': { 'title': /*LANG*/'Track '+info.fn }
  };
  if (info.time)
    menu[info.time.toISOString().substr(0,16).replace("T"," ")] = {value:""};
  menu["Duration"] = { value : asTime(info.duration)};
  menu["Records"] = { value : ""+info.records };
  if (info.fields.includes("Latitude"))
    menu[/*LANG*/'Plot Map'] = function() {
      info.qOSTM = false;
      plotTrack(info);
    };
  if (osm && info.fields.includes("Latitude"))
    menu[/*LANG*/'Plot OpenStMap'] = function() {
      info.qOSTM = true;
      plotTrack(info);
    }
  if (info.fields.includes("Altitude") ||
      info.fields.includes("Barometer Altitude"))
    menu[/*LANG*/'Plot Alt.'] = function() {
      plotGraph(info, "Altitude");
    };
  if (info.fields.includes("Latitude"))
    menu[/*LANG*/'Plot Speed'] = function() {
      plotGraph(info, "Speed");
    };
  if (info.fields.includes("Heartrate"))
    menu[/*LANG*/'Plot HRM'] = function() {
      plotGraph(info, "Heartrate");
    };
  if (info.fields.includes("Steps"))
    menu[/*LANG*/'Plot Steps'] = function() {
      plotGraph(info, "Steps");
    };
  if (info.fields.includes("Battery Percentage"))
    menu[/*LANG*/'Plot Battery'] = function() {
      plotGraph(info, "Battery");
    };
  // TODO: steps, heart rate?
  menu[/*LANG*/'Erase'] = function() {
    E.showPrompt(/*LANG*/"Delete Track?").then(function(v) {
      if (v) {
        settings.recording = false;
        updateSettings();
        var f = require("Storage").open(filename,"r");
        f.erase();
        viewTracks();
      } else
        viewTrack(filename, info);
    });
  };
  menu['< Back'] = () => { viewTracks(); };
  return E.showMenu(menu);
}

function plotTrack(info) { "ram"
  function distance(lat1,long1,lat2,long2) { "ram"
    var x = (long1-long2) * Math.cos((lat1+lat2)*Math.PI/360);
    var y = lat2 - lat1;
    return Math.sqrt(x*x + y*y) * 6371000 * Math.PI / 180;
  }

  // Function to convert lat/lon to XY
  var XY;
  if (info.qOSTM) {
    // scale map to view full track
    const max = Bangle.project({lat: info.maxLat, lon: info.maxLong});
    const min = Bangle.project({lat: info.minLat, lon: info.minLong});
    const scaleX = (max.x-min.x)/Bangle.appRect.w;
    const scaleY = (max.y-min.y)/Bangle.appRect.h;
    osm.scale = Math.ceil((scaleX > scaleY ? scaleX : scaleY)*1.1); // add 10% margin
    XY = osm.latLonToXY.bind(osm);
  } else {
    XY = function(lat, lon) { "ram"
      return {x:cx + Math.round((long - info.lon)*info.lfactor*info.scale),
              y:cy + Math.round((info.lat - lat)*info.scale)};
    };
  }

  E.showMenu(); // remove menu
  E.showMessage(/*LANG*/"Drawing...",/*LANG*/"Track "+info.fn);
  g.flip(); // on buffered screens, draw a not saying we're busy
  g.clear(1);
  var G = g;
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
  var mp = XY(lat, long);
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
    mp = XY(lat, long);
    G.lineTo(mp.x,mp.y);
    if (info.qOSTM) G.fillCircle(mp.x,mp.y,2); // make the track more visible
    var d = distance(olat,olong,lat,long);
    if (!isNaN(d)) dist+=d;
    olat = lat;
    olong = long;
    ox = mp.x;
    oy = mp.y;
    if (++i > 100) { G.flip();i=0; }
  }
  g.setColor("#f00");
  g.fillCircle(ox,oy,5);
  if (info.qOSTM) g.setColor("#000");
  else g.setColor(g.theme.fg);
  g.drawString(require("locale").distance(dist,2),g.getWidth() / 2, g.getHeight() - 20);
  g.setFont("6x8",2);
  g.setFontAlign(0,0,3);
  var isBTN3 = "BTN3" in global;
  g.drawString(/*LANG*/"Back",g.getWidth() - 10, isBTN3 ? (g.getHeight() - 40) : (g.getHeight()/2));
  setWatch(function() {
    viewTrack(info.fn, info);
  }, isBTN3?BTN3:BTN1, {edge:"falling"});
  Bangle.drawWidgets();
  g.flip();
}

function plotGraph(info, style) { "ram"
  E.showMenu(); // remove menu
  E.showMessage(/*LANG*/"Calculating...",/*LANG*/"Track "+info.fn);
  var filename = info.filename;
  var infn = new Float32Array(80);
  var infc = new Uint16Array(80);
  var title;
  var lt = 0; // last time
  //var tn = 0; // count for each time period
  var strt, dur = info.duration;
  if (dur<1) dur=1;
  var f = require("Storage").open(filename,"r");
  if (f===undefined) return;
  var l = f.readLine(f);
  l = f.readLine(f); // skip headers
  var c, i;
  var factor = 1; // multiplier used for values when graphing
  var timeIdx = info.fields.indexOf("Time");
  if (l!==undefined) {
    c = l.trim().split(",");
    strt = c[timeIdx];
  }
  if (style=="Heartrate") {
    title = /*LANG*/"Heartrate (bpm)";
    var hrmIdx = info.fields.indexOf("Heartrate");
    while(l!==undefined) {
      c=l.trim().split(",");l = f.readLine(f);
      if (c[hrmIdx]=="") continue;
      i = Math.round(80*(c[timeIdx] - strt)/dur);
      infn[i]+=+c[hrmIdx];
      infc[i]++;
    }
  } else if (style=="Altitude") {
    title = /*LANG*/"Altitude (m)";
    var altIdx = info.fields.indexOf("Barometer Altitude");
    if (altIdx<0) altIdx = info.fields.indexOf("Altitude");
    while(l!==undefined) {
      c=l.trim().split(",");l = f.readLine(f);
      if (c[altIdx]=="") continue;
      i = Math.round(80*(c[timeIdx] - strt)/dur);
      infn[i]+=+c[altIdx];
      infc[i]++;
    }
  } else if (style=="Steps") {
    title = /*LANG*/"Steps/min";
    var stpIdx = info.fields.indexOf("Steps");
    var t,lt = c[timeIdx];
    while(l!==undefined) {
      c=l.trim().split(",");l = f.readLine(f);
      if (c[stpIdx]=="") continue;
      t = c[timeIdx];
      i = Math.round(80*(t - strt)/dur);
      infn[i]+=60*c[stpIdx];
      infc[i]+=t-lt;
      lt = t;
    }
  } else if (style=="Battery") {
    title = /*LANG*/"Battery %";
    var batIdx = info.fields.indexOf("Battery Percentage");
    while(l!==undefined) {
      c=l.trim().split(",");l = f.readLine(f);
      if (c[batIdx]=="") continue;
      i = Math.round(80*(c[timeIdx] - strt)/dur);
      infn[i]+=+c[batIdx];
      infc[i]++;
    }
  } else if (style=="Speed") {
    // use locate to work out units
    var localeStr = require("locale").speed(1,5); // get what 1kph equates to
    let units = localeStr.replace(/[0-9.]*/,"");
    factor = parseFloat(localeStr)*3.6; // m/sec to whatever out units are
    title = /*LANG*/"Speed"+` (${units})`;
    var latIdx = info.fields.indexOf("Latitude");
    var lonIdx = info.fields.indexOf("Longitude");
    // skip until we find our first data
    while(l!==undefined && c[latIdx]=="") {
      c = l.trim().split(",");
      l = f.readLine(f);
    }
    // now iterate
    var p,lp = Bangle.project({lat:c[latIdx],lon:c[lonIdx]});
    var t,dx,dy,d,lt = c[timeIdx];
    while(l!==undefined) {
      c=l.trim().split(",");
      l = f.readLine(f);
      if (c[latIdx] == "") continue;
      t = c[timeIdx];
      i = Math.round(80*(t - strt)/dur);
      p = Bangle.project({lat:c[latIdx],lon:c[lonIdx]});
      dx = p.x-lp.x;
      dy = p.y-lp.y;
      d = Math.sqrt(dx*dx+dy*dy);
      infn[i]+=d; // speed
      infc[i]+=t-lt;
      lp = p;
      lt = t;
    }
  } else throw new Error("Unknown type "+style);
  var min=100000,max=-100000;
  for (var i=0;i<infn.length;i++) {
    if (infc[i]>0) infn[i]=factor*infn[i]/infc[i];
    else { // no data - search back and see if we can find something
      for (var j=i-1;j>=0;j--)
        if (infc[j]) { infn[i]=infn[j]; break; }
    }
    var n = infn[i];
    if (n>max) max=n;
    if (n<min) min=n;
  }
  if (style=="Battery") {min=0;max=100;}
  // work out a nice grid value
  var heightDiff = max-min;
  var grid = 1;
  while (heightDiff/grid > 8) {
    grid*=2;
  }
  // draw
  g.clear(1).setFont("6x8",1);
  require("graph").drawLine(g, infn, {
    x:4,y:24,
    width: g.getWidth()-24,
    height: g.getHeight()-(24+8),
    axes : true,
    gridy : grid,
    gridx : infn.length / 3,
    title: title,
    miny: min,
    maxy: max,
    xlabel : x=>Math.round(x*dur/(60*infn.length))+/*LANG*/" min" // minutes
  });
  g.setFont("6x8",2);
  g.setFontAlign(0,0,3);
  var isBTN3 = "BTN3" in global;
  g.drawString(/*LANG*/"Back",g.getWidth() - 10, isBTN3 ? (g.getHeight() - 40) : (g.getHeight()/2));
  setWatch(function() {
    viewTrack(info.filename, info);
  }, isBTN3?BTN3:BTN1, {edge:"falling"});
  g.flip();
}


showMainMenu();
