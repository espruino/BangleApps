/* Thanks to pinsafe from BangleApps repository */

/* create waypoint is unusable on watch -- button takes us back to menu */

var Layout = require("Layout");

/* fmt library v0.2.3 */
let fmt = {
  icon_alt : "\0\x08\x1a\1\x00\x00\x00\x20\x30\x78\x7C\xFE\xFF\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_m : "\0\x08\x1a\1\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_km : "\0\x08\x1a\1\xC3\xC6\xCC\xD8\xF0\xD8\xCC\xC6\xC3\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_kph : "\0\x08\x1a\1\xC3\xC6\xCC\xD8\xF0\xD8\xCC\xC6\xC3\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\xFF\x00\xC3\xC3\xFF\xC3\xC3",
  icon_c : "\0\x08\x1a\1\x00\x00\x60\x90\x90\x60\x00\x7F\xFF\xC0\xC0\xC0\xC0\xC0\xFF\x7F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_hpa : "\x00\x08\x16\x01\x00\x80\xb0\xc8\x88\x88\x88\x00\xf0\x88\x84\x84\x88\xf0\x80\x8c\x92\x22\x25\x19\x00\x00",
  icon_9 : "\x00\x08\x16\x01\x00\x00\x00\x00\x38\x44\x44\x4c\x34\x04\x04\x38\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_10 : "\x00\x08\x16\x01\x00\x08\x18\x28\x08\x08\x08\x00\x00\x18\x24\x24\x24\x24\x18\x00\x00\x00\x00\x00\x00\x00",

  /* 0 .. DD.ddddd
     1 .. DD MM.mmm'
     2 .. DD MM'ss"
  */
  geo_mode : 1,

  init: function() {},
  fmtDist: function(km) {
    if (km >= 1.0) return km.toFixed(1) + this.icon_km;
    return (km*1000).toFixed(0) + this.icon_m;
  },
  fmtSteps: function(n) { return this.fmtDist(0.001 * 0.719 * n); },
  fmtAlt: function(m) { return m.toFixed(0) + this.icon_alt; },
  fmtTemp: function(c) { return c.toFixed(1) + this.icon_c; },
  fmtPress: function(p) {
    if (p < 900 || p > 1100)
      return p.toFixed(0) + this.icon_hpa;
    if (p < 1000) {
      p -= 900;
      return this.icon_9 + this.add0(p.toFixed(0)) + this.icon_hpa;
    }
    p -= 1000;
    return this.icon_10 + this.add0(p.toFixed(0)) + this.icon_hpa;
  },
  draw_dot : 1,
  add0: function(i) {
    if (i > 9) {
      return ""+i;
    } else {
      return "0"+i;
    }
  },
  fmtTOD: function(now) {
    this.draw_dot = !this.draw_dot;
    let dot = ":";
    if (!this.draw_dot)
      dot = ".";
    return now.getHours() + dot + this.add0(now.getMinutes());
  },
  fmtNow: function() { return this.fmtTOD(new Date()); },
  fmtTimeDiff: function(d) {
    if (d < 180)
      return ""+d.toFixed(0);
    d = d/60;
    return ""+d.toFixed(0)+"m";
  },
  fmtAngle: function(x) {
    switch (this.geo_mode) {
    case 0:
      return "" + x;
    case 1: {
      let d = Math.floor(x);
      let m = x - d;
      m = m*60;
      return "" + d + " " + m.toFixed(3) + "'";
    }
    case 2: {
      let d = Math.floor(x);
      let m = x - d;
      m = m*60;
      let mf = Math.floor(m);
      let s = m - mf;
      s = s*60;
      return "" + d + " " + mf + "'" + s.toFixed(0) + '"';
    }
    }
    return "bad mode?";
  },
  fmtPos: function(pos) {
    let x = pos.lat;
    let c = "N";
    if (x<0) {
      c = "S";
      x = -x;
    }
    let s = c+this.fmtAngle(x) + "\n";
    x = pos.lon;
    c = "E";
    if (x<0) {
      c = "W";
      x = -x;
    }
    return s + c + this.fmtAngle(x);
  },
  fmtFix: function(fix, t) {
    if (fix && fix.fix && fix.lat) {
      return this.fmtSpeed(fix.speed) + " " +
        this.fmtAlt(fix.alt);
    } else {
      return "N/FIX " + this.fmtTimeDiff(t);
    }
  },
  fmtSpeed: function(kph) {
    return kph.toFixed(1) + this.icon_kph;
  },
  radians: function(a) { return a*Math.PI/180; },
  degrees: function(a) { return a*180/Math.PI; },
  // distance between 2 lat and lons, in meters, Mean Earth Radius = 6371km
  // https://www.movable-type.co.uk/scripts/latlong.html
  // (Equirectangular approximation)
  // returns value in meters
  distance: function(a,b) {
    var x = this.radians(b.lon-a.lon) * Math.cos(this.radians((a.lat+b.lat)/2));
    var y = this.radians(b.lat-a.lat);
    return Math.sqrt(x*x + y*y) * 6371000;
  },
  // thanks to waypointer
  bearing: function(a,b) {
    var delta = this.radians(b.lon-a.lon);
    var alat = this.radians(a.lat);
    var blat = this.radians(b.lat);
    var y = Math.sin(delta) * Math.cos(blat);
    var x = Math.cos(alat) * Math.sin(blat) -
        Math.sin(alat)*Math.cos(blat)*Math.cos(delta);
    return Math.round(this.degrees(Math.atan2(y, x)));
  },
};

/* gps library v0.1.4 */
let gps = {
  emulator: -1,
  init: function(x) {
    this.emulator = (process.env.BOARD=="EMSCRIPTEN"
                     || process.env.BOARD=="EMSCRIPTEN2")?1:0;
    //this.emulator = 1; // FIXME
  },
  state: {},
  on_gps: function(f) {
    let fix = this.getGPSFix();
    f(fix);

    /*
      "lat": number,      // Latitude in degrees
      "lon": number,      // Longitude in degrees
      "alt": number,      // altitude in M
      "speed": number,    // Speed in kph
      "course": number,   // Course in degrees
      "time": Date,       // Current Time (or undefined if not known)
      "satellites": 7,    // Number of satellites
      "fix": 1            // NMEA Fix state - 0 is no fix
      "hdop": number,     // Horizontal Dilution of Precision
    */
    this.state.timeout = setTimeout(this.on_gps, 1000, f);
  },
  off_gps: function() {
    clearTimeout(this.state.timeout);
  },
  getGPSFix: function() {
    if (!this.emulator)
      return Bangle.getGPSFix();
    let fix = {};
    fix.fix = 1;
    fix.lat = 50;
    fix.lon = 14-(getTime()-this.gps_start) / 1000; /* Go West! */
    fix.alt = 200;
    fix.speed = 5;
    fix.course = 195;
    fix.time = Date();
    fix.satellites = 5;
    fix.hdop = 12;
    return fix;
  },
  gps_start : -1,
  start_gps: function() {
    Bangle.setGPSPower(1, "libgps");
    this.gps_start = getTime();
  },
  stop_gps: function() {
    Bangle.setGPSPower(0, "libgps");
  },
};

let sun = {}; /* To get rid of warnings */

/* arrow library v0.0.3 */
let arrow = {
  name: "(unset)",
  waypoint: { lat: 0, lon: 0 },
  north: 0,
  updateWaypoint: function(lat, lon) {
    this.waypoint.lat = lat;
    this.waypoint.lon = lon;
  },

  // Display function to show arrows for waypoint, north, and sun
  draw: function(currentPos) {
    let fix = currentPos;
    let currentHeading = currentPos.course;
    g.clear().setFont("Vector", 22).setFontAlign(0, 0);

    let waypointBearing = fmt.bearing(currentPos, this.waypoint);
    let distance = fmt.distance(currentPos, this.waypoint);

    this.north = 0;
    if (0) {
      let compass = Bangle.getCompass();
      if (compass) {
        let c = compass.heading;
        this.north = c;
        print("Compass:", c);
        this.drawArrow(c, "Up", 1);
      }
    }

    if (fix.speed && fix.speed > 3)
      this.north = fix.course;

    // Draw compass arrow for north
    this.drawArrow(0, "N", 1);

    let s = fmt.fmtDist(distance/1000);
    // Draw arrow towards waypoint
    if (1) {
      this.drawArrow(waypointBearing, "", 3);
    }

    if (1) {
      let s = fmt.fmtSpeed(fix.speed);
      this.drawArrow(currentHeading, s, 1);
    }

    if (0) {
      let s;
      s = sun.sunPos();
      // Draw sun arrow if sun is visible
      if (s.altitude > 0) {
        this.drawArrow(s.azimuth, "Sun", 1);
      }
      s = sun.moonPos();
      // Draw sun arrow if sun is visible
      if (s.altitude > 0) {
        this.drawArrow(s.azimuth, "Moon", 1);
      }
    }

    g.setFont("Vector", 30).setFontAlign(-1, 1)
      .drawString(s, 0, 176)
      .setFontAlign(1, 1)
      .drawString(this.name, 176, 176);
  },

  drawArrow: function(angle, label, width) {
    // Convert angle to radians
    let rad = (angle - this.north) * Math.PI / 180;

    // Arrow parameters
    let centerX = 88;
    let centerY = 88;
    let length = 55; // Arrow length

    g.drawCircle(centerX, centerY, length);

    // Calculate the rectangle's corner points for the rotated arrow
    let dx = Math.sin(rad) * length;
    let dy = -Math.cos(rad) * length;
    let px = Math.sin(rad + Math.PI / 2) * (width / 2);
    let py = -Math.cos(rad + Math.PI / 2) * (width / 2);

    // Calculate each corner of the rectangle (arrow body)
    let x1 = centerX + px;
    let y1 = centerY + py;
    let x2 = centerX - px;
    let y2 = centerY - py;
    let x3 = x2 + dx * 0.9;
    let y3 = y2 + dy * 0.9;
    let x4 = x1 + dx * 0.9;
    let y4 = y1 + dy * 0.9;

    // Draw the filled rectangle for the arrow body
    g.fillPoly([x1, y1, x2, y2, x3, y3, x4, y4]);

    // Draw the label at the arrow's endpoint
    g.setFontAlign(0, 0);
    g.drawString(label, x3 + dx * 0.4, y3 + dy * 0.4);

    // Draw arrowhead
    this.drawArrowHead(rad, centerX + dx, centerY + dy);
  },

  drawArrowHead: function(rad, x, y) {
    // Arrowhead parameters
    let headLength = 16;   // Length of each arrowhead side
    let headAngle = Math.PI / 6; // Arrowhead angle

    let angle = rad - Math.PI/2;

    // Calculate positions for arrowhead points
    let xHead1 = x - headLength * Math.cos(angle - headAngle);
    let yHead1 = y - headLength * Math.sin(angle - headAngle);
    let xHead2 = x - headLength * Math.cos(angle + headAngle);
    let yHead2 = y - headLength * Math.sin(angle + headAngle);

    // Draw the arrowhead as a filled triangle
    g.fillPoly([x, y, xHead1, yHead1, xHead2, yHead2]);
  }
};

var wp = require('Storage').readJSON("waypoints.json", true) || [];
// Use this with corrupted waypoints
//var wp = [];
var key; /* Shared between functions, typically wp name */
var fix; /* GPS fix, shared between updateGps / updateGoto functions and confirmGps */
var cancel_gps; /* Shared between updateGps / updateGoto functions */

function writeWP() {
  require('Storage').writeJSON("waypoints.json", wp);
}

function mainMenu() {
  let textInputInstalled = true;
  try {
    require("textinput");
  } catch(err) {
    textInputInstalled = false;
  }
  var menu = {
    "< Back" : () => load()
  };
  menu["Show"]=showCard;
  if (textInputInstalled) {
    menu["Add"]=addCard;
    menu["Mark GPS"]=markGps;
  }
  menu["Remove"]=removeCard;
  menu["Format"]=setFormat;
  g.clear();
  E.showMenu(menu);
}

function updateGps() {
  let lat = "lat ", alt = "?";

  if (cancel_gps)
    return;
  fix = gps.getGPSFix();

  if (fix && fix.fix && fix.lat) {
    lat = "" + fmt.fmtPos(fix);
    alt = "" + fix.alt.toFixed(0);
    // speed = "" + fix.speed.toFixed(1);
    // hdop = "" + fix.hdop.toFixed(0);
  } else {
    lat = "NO FIX\n"
      + "" + (getTime() - gps.gps_start).toFixed(0) + "s ";
  }

  let msg = "";
  msg = lat + "\n"+ alt + "m";
  g.reset().setFont("Vector", 31)
    .setColor(1,1,1)
    .fillRect(0, 24, 176, 100)
    .setColor(0,0,0)
    .drawString(msg, 3, 25);
  setTimeout(updateGps, 1000);
}

function updateGoto() {
  let have = false, lat = "lat ", alt = "?";

  if (cancel_gps)
    return;
  fix = gps.getGPSFix();

  if (fix && fix.fix && fix.lat) {
    lat = "" + fmt.fmtPos(fix);
    alt = "" + fix.alt.toFixed(0);
    // speed = "" + fix.speed.toFixed(1);
    // hdop = "" + fix.hdop.toFixed(0);
    have = true;
  } else {
    lat = "NO FIX\n"
      + "" + (getTime() - gps.gps_start).toFixed(0) + "s ";
  }

  let msg = arrow.name + "\n";
  msg = lat + "\n"+ alt + "m";
  if (!have) {
    g.reset().setFont("Vector", 31)
      .setColor(1,1,1)
      .fillRect(0, 24, 176, 100)
      .setColor(0,0,0)
      .drawString(msg, 3, 25);
  } else {
    arrow.draw(fix);
  }
  setTimeout(updateGoto, 1000);
}

function stopGps() {
  cancel_gps = true;
  gps.stop_gps();
}

function confirmGps(s) {
  key = s;
  var la = new Layout (
    {type:"v", c: [
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:""},
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:""},
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:""},
      {type:"h", c: [
        {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "Yes", cb:l=>{
          print("should mark", key, fix); createWP(fix.lat, fix.lon, fix.alt, key); stopGps(); mainMenu();
        }},
        {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: " No", cb:l=>{ stopGps(); mainMenu(); }}
      ]}
    ], lazy:true});
  g.clear();
  la.render();
  updateGps();
}

function markGps() {
  cancel_gps = false;
  gps.start_gps();
  require("textinput").input({text:"mk"}).then(key => {
    confirmGps(key);
  });
}

function setFormat() {
  var la = new Layout (
    {type:"v", c: [
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:"Format"},
      {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "DD.dddd", cb:l=>{  fmt.geo_mode = 0; mainMenu(); }},
      {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "DD MM.mmm'", cb:l=>{  fmt.geo_mode = 1; mainMenu(); }},
      {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "DD MM'ss"+'"', cb:l=>{  fmt.geo_mode = 2; mainMenu(); }},
    ], lazy:true});
  g.clear();
  la.render();
}

function showNumpad(text, key_, callback) {
  key = key_;
  E.showMenu();
  function addDigit(digit) {
    key+=digit;
    if (1) {
      let l = text[key.length];
      switch (l) {
        case '.': case ' ': case "'":
          key+=l;
          break;
        case 'd': case 'D': default:
          break;
      }
    }
    Bangle.buzz(20);
    update();
  }
  function update() {
    g.reset();
    g.clearRect(0,0,g.getWidth(),23);
    let s = key + text.substr(key.length, 999);
    g.setFont("Vector:24").setFontAlign(1,0).drawString(s,g.getWidth(),12);
  }
  let ds="12%";
  var numPad = new Layout ({
      type:"v", c: [{
        type:"v", c: [
          {type:"", height:24},
          {type:"h",filly:1, c: [
            {type:"btn", font:ds, width:58, label:"7", cb:l=>{addDigit("7");}},
            {type:"btn", font:ds, width:58, label:"8", cb:l=>{addDigit("8");}},
            {type:"btn", font:ds, width:58, label:"9", cb:l=>{addDigit("9");}}
          ]},
          {type:"h",filly:1, c: [
            {type:"btn", font:ds, width:58, label:"4", cb:l=>{addDigit("4");}},
            {type:"btn", font:ds, width:58, label:"5", cb:l=>{addDigit("5");}},
            {type:"btn", font:ds, width:58, label:"6", cb:l=>{addDigit("6");}}
          ]},
          {type:"h",filly:1, c: [
            {type:"btn", font:ds, width:58, label:"1", cb:l=>{addDigit("1");}},
            {type:"btn", font:ds, width:58, label:"2", cb:l=>{addDigit("2");}},
            {type:"btn", font:ds, width:58, label:"3", cb:l=>{addDigit("3");}}
          ]},
          {type:"h",filly:1, c: [
            {type:"btn", font:ds, width:58, label:"0", cb:l=>{addDigit("0");}},
            {type:"btn", font:ds, width:58, label:"C", cb:l=>{key=key.slice(0,-1); update();}},
            {type:"btn", font:ds, width:58, id:"OK", label:"OK", cb:callback}
          ]}
        ]}
      ], lazy:true});
  g.clear();
  numPad.render();
  update();
}

function goTo() {
  cancel_gps = false;
  gps.start_gps();

  var la = new Layout (
    {type:"v", c: [
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:""},
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:""},
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:""},
      {type:"h", c: [
        {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: " Done", cb:l=>{ stopGps(); mainMenu(); }}
      ]}
    ], lazy:true});
  g.clear();
  la.render();

  updateGoto();
}

function show(card) {
  var i = wp[card];
  var l = fmt.fmtPos(i);
  arrow.name = i.name;
  arrow.waypoint = i;

  var la = new Layout (
    {type:"v", c: [
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:arrow.name },
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:l },
      {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:""},
      {type:"h", c: [
        {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "Go", cb:l=>{ goTo(); }},
        {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "Ok", cb:l=>{ mainMenu(); }}
      ]}
    ], lazy:true});
  g.clear();
  la.render();
}

function showCard() {
  var menu = {
    "" : {title : "Select WP"},
    "< Back" : mainMenu
  };
  if (wp.length==0) Object.assign(menu, {"No WPs":""});
  else {
    wp.forEach((val, card) => {
      const name = val.name;
      menu[name]= () => show(card);
    });
  }
  E.showMenu(menu);
}

function remove(c) {
  let card = wp[c];
  let name = card["name"];

  E.showPrompt(name,{
    title:"Delete",
  }).then(function(v) {
    if (v) {
      wp.splice(c, 1);
      writeWP();
    }
    mainMenu();
  });
}

function removeCard() {
  var menu = {
    "" : {title : "Select WP"},
    "< Back" : mainMenu
  };
  if (wp.length==0) Object.assign(menu, {"No WPs":""});
  else {
    wp.forEach((val, card) => {
      const name = val.name;
      menu[name]=()=> remove(card);
    });
  }
  E.showMenu(menu);
}

function ask01(t, cb) {
  var la = new Layout (
        {type:"v", c: [
          {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:"Select"},
          {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: t[0], cb:l=>{ cb(1); }},
          {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: t[1], cb:l=>{ cb(-1); }},
        ], lazy:true});
  g.clear();
  la.render();
}

function askCoordinate(t1, t2, callback) {
  ask01(t1, function(sign) {
    let d, m, s;
    switch (fmt.geo_mode) {
    case 0: s = "DDD.dddd"; break;
    case 1: s = "DDD MM.mmm"; break;
    case 2: s = "DDD MM'ss"+'"'; break;
    }
    showNumpad(s, t2, function() {
      let res = 0;
      switch (fmt.geo_mode) {
      case 0:
        res = parseFloat(key);
        break;
      case 1:
        d = parseInt(key.substr(0, 3));
        m = parseFloat(key.substr(3,99));
        res = d + m/60.0;
        break;
      case 2:
        d = parseInt(key.substr(0, 3));
        m = parseInt(key.substr(4, 2));
        s = parseInt(key.substr(7, 2));
        res = d + m/60.0 + s/3600.0;
      }
      res = sign * res;
      print("Coordinate", res);
      callback(res);
    });
  });
}

function askPosition(callback) {
  askCoordinate("NS", "0", function(lat) {
    askCoordinate("EW", "", function(lon) {
        callback(lat, lon);
    });
  });
}

function createWP(lat, lon, alt, name) {
  let n = {};
  n["name"] = name;
  n["lat"] = lat;
  n["lon"] = lon;
  if (alt != -9999)
    n["alt"] = alt;
  wp.push(n);
  print("add -- waypoints", wp);
  writeWP();
}

function addCardName(name) {
  g.clear();
  askPosition(function(lat, lon) {
    print("position -- ", lat, lon);
    createWP(lat, lon, -9999, name);
    mainMenu();
  });
}

function addCard() {
  require("textinput").input({text:"wp"}).then(key => {
    let result = key;
    if (wp[result]!=undefined) {
      E.showMenu();
      var alreadyExists = new Layout (
        {type:"v", c: [
          {type:"txt", font:Math.min(15,100/result.length)+"%", pad:1, fillx:1, filly:1, label:result},
          {type:"txt", font:"12%", pad:1, fillx:1, filly:1, label:"already exists."},
          {type:"h", c: [
            {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "Replace", cb:l=>{addCardName(result);}},
            {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "Cancel", cb:l=>{mainMenu();}}
          ]}
        ], lazy:true});
      g.clear();
      alreadyExists.render();
    }
    addCardName(result);
  });
}

fmt.init();
gps.init();

function testArrow() {
  //Bangle.resetCompass(); // FIXME
  Bangle.setCompassPower(1, "waypoints");

  arrow.name = "test";
  arrow.waypoint.lat = 50;
  arrow.waypoint.lon = 14.75;
  goTo();
}

g.reset();
if (1)
  mainMenu();
else
  testArrow();
