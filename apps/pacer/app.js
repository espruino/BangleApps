Bangle.loadWidgets();
g.clear();
Bangle.drawWidgets();

var cfg;
try {
  cfg = require("Storage").readJSON("pacer.json",true)||{};
}
catch(err) {
  cfg = {};
}
if (process.env.BOARD == 'BANGLEJS2')
  var bangle2 = true;
else
  var bangle2 = false;

var laps = ["Off","0.25","0.5","1","2","5","10"];
var fg = 1;
var fixed = false;
var started = false;
var startHidden = false;
var recording = false;
var invID = 0;
var intID = 0;
var startID = 0;
var cadID = 0;
var finID = 0;
var lapID = 0;
var steps = 0;
var sats = 0;
var ctr = 0;
var elapsed_ms = 0;
var finish_ms = 0;
var lap_start_ms = 0;
var lap_ms;
var gps = {fix:0,satellites:0};
var fp;
var start_time;
var current_time;
var paused_time = 0;
var last_time = 0;
var begin_pause;
var next_lap = 0.0;
var skip_ctr = 0;
var skip_max = 0;
var force_write = true;
var show_lap = false;
var lcd_on = true;
var drawSats = true;
var dist = 0.0;
var pdist = 0.0;
var oldDist = 0.0;
var oldLat = -1;
var oldLon = -1;
var cadence = 0;
var pace = 0;
var ppace = 0;
var R = 6371;
var stepTimes = [];
var dists = [];

function pace_str(pval) {
  var psecs = 295 + 5 * pval;
  return ''+Math.floor(psecs/60)+':'+('0'+psecs%60).substr(-2);
}
  
function defaults() {
  if (typeof(cfg.record) != 'boolean')
    cfg.record = true;
  if (typeof(cfg.metric) != 'boolean')
    cfg.metric = false;
  if (typeof(cfg.lap_idx) != 'number')
    cfg.lap_idx = 3;
  if (typeof(cfg.dark) != 'boolean')
    cfg.dark = true;
  if (typeof(cfg.eco) != 'boolean')
    cfg.eco = false;
  if (typeof(cfg.storage) != 'boolean')
    cfg.storage = false;
  if (typeof(cfg.show_steps) != 'boolean')
    cfg.show_steps = false;
  if (typeof(cfg.pacer) != 'number')
    cfg.pacer = 0;
  fg = cfg.dark?1:0;
}

function genFilename() {
  var today=new Date();
  return ('.pacer'+today.getFullYear()+('0'+(today.getMonth()+1)).substr(-2)+('0'+today.getDate()).substr(-2)+('0'+today.getHours()).substr(-2)+('0'+today.getMinutes()).substr(-2)+('0'+today.getSeconds()).substr(-2)+'.csv');
}

function doCadence() {
  if (steps > 0)
    clearInterval(cadID);
  cadID = setTimeout(function() {
    cadence = 0;
  }, 2000);
  if (recording) {
    steps++;
    stepTimes.push(Date.now());
    stepTimes = stepTimes.slice(-20);
    const elapsed = stepTimes[stepTimes.length - 1] - stepTimes[0];
    cadence = elapsed ? Math.round(60000 * (stepTimes.length - 1) / elapsed) : 0;
  } else
    stepTimes = [];
}

function doPace(thistime,thisdist) {
  dists.push([thistime,thisdist]);
  dists = dists.slice(-30);
  const thiselapsed = dists[dists.length - 1][0] - dists[0][0];
  const thisdistance = dists[dists.length - 1][1] - dists[0][1];
  pace = thisdistance ? ((thiselapsed) / thisdistance) / 1000 : 0;
}

function countStep() {
  if (recording)
    steps++;
}

function calcCrow(lat1, lon1, lat2, lon2) 
{
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1r = toRad(lat1);
  var lat2r = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1r) * Math.cos(lat2r); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  if (isNaN(d))
    return 0;
  else
    return d;
}

function toRad(Value) 
{
  return Value * Math.PI / 180;
}

function saveGPS(fix) {
  var newLat, newLon, newTime, newDist;

  try {
    newTime = fix.time.getTime();
  }
  catch(err) {
    newTime = NaN;
  }
  newLat = fix.lat;
  newLon = fix.lon;
  gps = fix;
  if (!cfg.storage) {
    if (gps.satellites >= 8)
      skip_max = 0;
    else if (gps.satellites < 4)
      skip_max = 5;
    else
      skip_max = 8 - gps.satellites;
  }
  if (recording && cfg.pacer > 0 && skip_ctr >= (cfg.storage ? 9 : skip_max))
    pdist = (elapsed_ms / 1000) / ppace;
  if (isNaN(newLat) || isNaN(newLon) || isNaN(newTime)) {
    skip_ctr = 0;
    skip_max = 0;
    force_write = true;
  } else {
    if (oldLat != -1 && recording) {
      skip_ctr++;
      if (skip_ctr > (cfg.storage ? 9 : skip_max)) {
        skip_ctr = 0;
        oldDist = dist;
        newDist = calcCrow(oldLat, oldLon, newLat, newLon);
        dist += newDist;
        doPace(newTime,dist);
        oldLat = newLat;
        oldLon = newLon;
      }
    } else {
      oldLat = newLat;
      oldLon = newLon;
    }
    if (recording && cfg.record && (force_write || skip_ctr == 0)) {
      fp.write([gps.time.getTime(),gps.lat.toFixed(5),gps.lon.toFixed(5),gps.alt].join(",")+"\n");
      last_time = gps.time;
      if (force_write) {
        skip_ctr = 0;
        force_write = false;
      }
    }
  }
}

function drawInvert() {
  // not applicable to bangle2
  g.drawImage(atob("DQ0BD4HjHwT4L8D+B/A/gfwL4J8EeMD4AA=="),225,26);
}

function drawSatIcon() {
  if (bangle2)
    g.drawImage(atob("CQkBIDo7i+Pj6O4uAgA="),3,53);
  else
    g.drawImage(atob("DAwBEAOAcQ84T8D4HwPyHPCOAcAI"),4,66);
}

function drawStepsIcon() {
  if (bangle2)
    g.drawimage(atob("CQkBBhudzudzgBzsMAA="),3,139);
  else
    g.drawImage(atob("DAwBAMAcMeOeeeeeeAecAcOYOAGA"),4,197);
}

function drawCadenceIcon() {
  if (bangle2)
    g.drawImage(atob("CQkBCB4SEBgMBCQ8CAA="),3,139);
  else
    g.drawImage(atob("DAwBBAAwP4YxxDwDwDwjjGH8DAAg"),4,197);
}

function hideStart() {
  g.clearRect(bangle2?162:226,bangle2?81:113,bangle2?174:238,bangle2?93:125);
}

function drawStart() {
  hideStart();
  g.fillPoly([bangle2?162:226,bangle2?81:113,bangle2?162:226,bangle2?93:125,bangle2?174:238,bangle2?87:119,bangle2?162:226,bangle2?81:113]);
}

function drawPause() {
  hideStart();
  g.fillRect(bangle2?165:227,bangle2?82:113,bangle2?167:230,bangle2?92:125);
  g.fillRect(bangle2?171:234,bangle2?82:113,bangle2?173:237,bangle2?92:125);
}

function drawStop() {
  // not applicable to bangle2
  g.fillRect(226,202,237,213);
}

function drawExit() {
  if (bangle2)
    g.drawImage(atob("CQkBwfHdx8HB8d3HwQg="),165,82);
  else
    g.drawImage(atob("DAwBwD4HcOOcH4DwDwH4OccO4HwD"),226,202);
}

function setColours() {
  g.setBgColor(1-fg,1-fg,1-fg);
  g.setColor(fg,fg,fg);
}

function setScreenMode() {
  g.reset();
  setColours();
  g.clearRect(0,24,bangle2?175:239,bangle2?151:215);
}

function doLayout() {
  setColours();
  if (!bangle2)
    drawInvert();
  drawSatIcon();
  drawDist();
  drawTime();
  if (cfg.pacer == 0)
    drawPace();
  else {
    drawPacer();
    drawSmallPace();
  }
  g.setFont("6x8",bangle2?2:3);
  if (cfg.show_steps) {
    drawStepsIcon();
    g.drawString(steps.toString(),bangle2?15:20,bangle2?134:190,true);
  } else {
    drawCadenceIcon();
    g.drawString(cadence.toString()+"  ",bangle2?15:20,bangle2?134:190,true);
  }
  drawStart();
  if (!bangle2)
    drawStop();
}

function drawDist() {
  g.setFont("6x8",bangle2?4:5);  // 3:5?
  var dStr = dist.toString();
  if (dStr.indexOf('.') == -1)
    dStr += '.0';
  g.drawString(((' '+(dStr.split('.'))[0])).substr(-2),bangle2?33:53,bangle2?26:35,true);
  g.fillRect(bangle2?80:112,bangle2?51:66,bangle2?82:115,bangle2?53:69);
  g.drawString(((dStr.split('.'))[1]+'0').substr(0,2),bangle2?86:120,bangle2?26:35,true);
  g.setFont("6x8",2);
  g.drawString(cfg.metric?"K":"M",bangle2?134:180,bangle2?40:56,true);
}

function drawPacer() {
  g.setFont("6x8",bangle2?3:5);
  var pstr=(pdist>dist?'-':'+')+(Math.floor(Math.abs(dist-pdist)))%100;
  g.drawString(pstr,bangle2?(49-(pstr.length>2?18:0)):(53-(pstr.length>2?30:0)),bangle2?107:145,true);
  g.fillRect(bangle2?84:112,bangle2?126:176,bangle2?85:115,bangle2?127:179);
  g.drawString(('0'+Math.floor(Math.abs(((dist-pdist)*100)%100))).substr(-2),bangle2?89:120,bangle2?107:145,true);
  g.setFont("6x8",bangle2?1:2);
  g.drawString(cfg.metric?"K":"M",bangle2?125:180,bangle2?121:166,true);
}

function drawPace() {
  g.setFont("6x8",bangle2?3:5);
  if (pace > 0 && pace < 6000)
    g.drawString((' '+Math.floor(pace/60)).substr(-2),bangle2?49:53,bangle2?107:145,true);
  else
    g.drawString("--",bangle2?49:53,bangle2?107:145,true);
  g.fillRect(bangle2?84:112,bangle2?117:160,bangle2?85:115,bangle2?118:163);
  g.fillRect(bangle2?84:112,bangle2?120:166,bangle2?85:115,bangle2?121:169);
  if (pace > 0 && pace < 6000)
    g.drawString(('0'+Math.floor(pace%60)).substr(-2),bangle2?89:120,bangle2?107:145,true);
  else
    g.drawString("--",bangle2?89:120,bangle2?107:145,true);
  g.setFont("6x8",bangle2?1:2);
  g.drawString(cfg.metric?"/K":"/M",bangle2?124:178,bangle2?121:166,true);
}

function drawSmallPace() {
  g.setFont("6x8",bangle2?2:3);
  if (pace > 0 && pace < 6000)
    g.drawString((' '+Math.floor(pace/60)).substr(-2),bangle2?113:136,bangle2?134:190,true);
  else
    g.drawString("--",bangle2?113:136,bangle2?134:190,true);
  if (bangle2) {
    g.setPixel(136,140);
    g.setPixel(136,142);
  } else {
    g.fillRect(172,199,173,200);
    g.fillRect(172,203,173,204);
  }
  if (pace > 0 && pace < 6000)
    g.drawString(('0'+Math.floor(pace%60)).substr(-2),bangle2?138:176,bangle2?134:190,true);
  else
    g.drawString("--",bangle2?138:176,bangle2?134:190,true);
  g.setFont("6x8",1);
  g.drawString(cfg.metric?"/K":"/M",bangle2?164:212,bangle2?141:204,true);
}

function drawTime() {
  var seconds;
  var minutes;
  var hours;

  setColours();
  g.setFont("6x8",bangle2?5:7);
  seconds = parseInt(elapsed_ms/1000) % 60;
  minutes = parseInt(elapsed_ms/60000) % 60;
  hours = parseInt(elapsed_ms/3600000) % 10;
  g.drawString(hours.toString(),bangle2?6:5,bangle2?63:82,true);
  g.fillRect(bangle2?34:44,bangle2?79:103,bangle2?36:48,bangle2?81:107);
  g.fillRect(bangle2?34:44,bangle2?84:112,bangle2?36:48,bangle2?86:116);
  g.drawString(('0'+minutes).substr(-2),bangle2?40:53,bangle2?63:82,true);
  g.fillRect(bangle2?98:134,bangle2?79:103,bangle2?100:138,bangle2?81:107);
  g.fillRect(bangle2?98:134,bangle2?84:112,bangle2?100:138,bangle2?86:116);
  g.drawString(('0'+seconds).substr(-2),bangle2?104:143,bangle2?63:82,true);
}

function drawGPSBox() {
  g.drawRect(2,26,bangle2?12:17,bangle2?51:63);
}

function drawGPS() {
  g.clearRect(3,27,bangle2?11:16,bangle2?50:62);
  if (gps.satellites > 0) {
    if (!gps.fix)
      g.setColor("#FF0000");
    else if (gps.satellites < 4)
      g.setColor("#FF5500");
    else if (gps.satellites < 6)
      g.setColor("#FF8800");
    else if (gps.satellites < 8)
      g.setColor("#FFCC00");
    else
      g.setColor("#00FF00");
    g.fillRect(3,bangle2?50:62,bangle2?11:16,(bangle2?50:62)-(gps.satellites>12?12:gps.satellites)*(bangle2?2:3)+1);
    g.setColor(fg,fg,fg);
  }
}

function hideLap() {
  show_lap = false;
  g.reset();
  setColours();
  g.clearRect(bangle2?6:5,bangle2?63:82,bangle2?162:224,bangle2?129:182);
  if (recording) {
    current_time = Date.now();
    elapsed_ms = current_time - (start_time + paused_time);
  } else
    elapsed_ms = begin_pause - (start_time + paused_time);
  drawTime();
  if (cfg.pacer == 0)
    drawPace();
  else {
    drawPacer();
    drawSmallPace();
  }
}

function showLap() {
  g.clearRect(bangle2?6:5,bangle2?63:82,bangle2?162:224,bangle2?129:182);
  g.drawRect(bangle2?21:28,bangle2?68:90,bangle2?147:201,bangle2?124:174);
  g.drawRect(bangle2?23:30,bangle2?70:92,bangle2?145:199,bangle2?122:172);
  g.setFont("6x8",bangle2?1:2);
  g.drawString("Last lap",bangle2?61:68,bangle2?77:102,true);
  g.setFont("6x8",bangle2?3:5);
  if (lap_ms < 600000) {
    g.drawString((''+Math.floor(lap_ms/60000)),bangle2?57:69,bangle2?89:122,true);
    g.fillRect(bangle2?74:98,bangle2?99:137,bangle2?75:101,bangle2?100:140);
    g.fillRect(bangle2?74:98,bangle2?102:143,bangle2?75:101,bangle2?103:146);
    g.drawString(('0'+Math.floor((lap_ms%60000)/1000)).substr(-2),bangle2?78:106,bangle2?89:122,true);
  } else if (lap_ms < 3600000) {
    g.drawString((''+Math.floor(lap_ms/60000)),bangle2?48:54,bangle2?89:122,true);
    g.fillRect(bangle2?83:113,bangle2?99:137,bangle2?84:116,bangle2?100:140);
    g.fillRect(bangle2?83:113,bangle2?102:143,bangle2?84:116,bangle2?103:146);
    g.drawString(('0'+Math.floor((lap_ms%60000)/1000)).substr(-2),bangle2?87:121,bangle2?89:122,true);
  } else {
    g.drawString((''+Math.floor(lap_ms/3600000)).substr(-1),bangle2?37:35,bangle2?89:122,true);
    g.fillRect(bangle2?54:64,bangle2?99:137,bangle2?55:67,bangle2?100:140);
    g.fillRect(bangle2?54:64,bangle2?102:143,bangle2?55:67,bangle2?103:146);
    g.drawString(('0'+Math.floor((lap_ms%3600000)/60000)).substr(-2),bangle2?58:72,bangle2?89:122,true);
    g.fillRect(bangle2?93:131,bangle2?99:137,bangle2?94:134,bangle2?100:140);
    g.fillRect(bangle2?93:131,bangle2?102:143,bangle2?94:134,bangle2?103:146);
    g.drawString(('0'+Math.floor((lap_ms%60000)/1000)).substr(-2),bangle2?97:139,bangle2?89:122,true);
  }
  Bangle.setLCDPower(true);
}

function mainLoop() {
  g.reset();
  setColours();
  current_time = Date.now();
  if (started) {
    elapsed_ms = current_time - (start_time + paused_time);
    if (oldDist != dist) {
      drawDist();
      if (cfg.lap_idx > 0 && dist >= next_lap ) {
        show_lap = true;
        next_lap += parseFloat(laps[cfg.lap_idx]);
        lap_ms = elapsed_ms - lap_start_ms;
        lap_start_ms = elapsed_ms;
        Bangle.buzz();
        lapID = setTimeout(hideLap,5000);
        showLap();
      }
    }
  } else
    elapsed_ms = 0;
  drawSats = false;
  if (recording) {
    if (!show_lap)
      drawTime();
    g.setFont("6x8",bangle2?2:3);
    if (cfg.show_steps)
      g.drawString(steps.toString(),bangle2?15:20,bangle2?134:190,true);
    else
      g.drawString(cadence.toString()+"  ",bangle2?15:20,bangle2?134:190,true);
  } /* else
    g.setFont("6x8",3); */
  if (!show_lap)
    if (cfg.pacer == 0)
      drawPace();
    else {
      drawPacer();
      drawSmallPace();
    }
  if (gps.fix) {
    if (!started && startHidden) {
      startHidden = false;
      if (!bangle2)
        startID = setWatch(start, BTN2);
      else
        startID = setWatch(start, BTN1, {edge: 'falling'});
      drawStart();
    }
    if (!fixed) {
      fixed = true;
      drawSats = true;
    }
  } else {
    if (!started && !startHidden) {
      startHidden = true;
      clearWatch(startID);
      hideStart();
    }
    if (fixed) {
      fixed = false;
      drawSats = true;
    }
  }
  if (gps.satellites != sats) {
    sats = gps.satellites;
    drawSats = true;
  }
  if (drawSats)
    drawGPS();
  if (ctr++%10 == 0) {
    g.reset();
    Bangle.drawWidgets();
  }
}

function restart(e) {
  if (bangle2 && (e.time - e.lastTime > 0.5)) {
    finish();
  } else {
    g.reset();
    setColours();
    paused_time += (Date.now() - begin_pause);
    pace = 0;
    drawPause();
    oldDist = dist;
    skip_ctr = 0;
    force_write = true;
    recording = true;
    Bangle.buzz();
    if (!bangle2)
      setWatch(pause, BTN2);
    else
      setWatch(pause, BTN1, { edge: 'falling' });
  }
}

function pause(e) {
  if (bangle2 && (e.time - e.lastTime > 0.5)) {
    finish();
  }
  g.reset();
  setColours();
  begin_pause = Date.now();
  elapsed_ms = begin_pause - (start_time + paused_time);
  finish_ms = elapsed_ms;
  drawDist();
  recording = false;
  if (!show_lap)
    drawTime();
  drawStart();
  if (!isNaN(gps.time) && !isNaN(gps.lat) && !isNaN(gps.lon) && !isNaN(gps.alt) && cfg.record && (last_time != gps.time))
    fp.write([gps.time.getTime(),gps.lat.toFixed(5),gps.lon.toFixed(5),gps.alt].join(",")+"\n");
  Bangle.buzz();
  dists = [];
  if (!bangle2)
    setWatch(restart, BTN2);
  else
    setWatch(restart, BTN1, { edge: 'falling' });
}

function start() {
  g.reset();
  setColours();
  if (cfg.eco){
    Bangle.setLCDPower(true);
    Bangle.setLCDTimeout(10);
  }
  if (cfg.record)
    fp = require("Storage").open(genFilename(),"w");
  start_time = Date.now();
  drawPause();
  Bangle.buzz();
  started = true;
  recording = true;
  if (!bangle2)
    setWatch(pause, BTN2);
  else
    setWatch(pause, BTN1, { edge: 'falling' });
  if (cfg.show_steps)
    Bangle.on('step',countStep);
  else
    Bangle.on('step',doCadence);
  clearInterval(intID);
  intID = setInterval(mainLoop,200);
  if (cfg.lap_idx > 0)
    next_lap = parseFloat(laps[cfg.lap_idx]);
}

function endScreen() {
  fg = 1-fg;
  setScreenMode();
  if (!bangle2)
    drawInvert();
  drawExit();
  g.setFont("6x8",bangle2?1:2);
  var dStr = dist.toString();
  if (dStr.indexOf('.') == -1)
    dStr += '.00';
  dStr = dStr.slice(0, (dStr.indexOf('.'))+3);
  if (bangle2)
    g.drawString('Distance: '+dStr+(cfg.metric?'K':'M'),38,43);
  else {
    //g.drawString('Distance: '+dist.toFixed(2),19,53);
    g.drawString('Distance: '+dStr,19,53);
    g.setFont("6x8",1);
    //g.drawString(cfg.metric?'K':'M',139+12*(dist.toFixed(2).length),60);
    g.drawString(cfg.metric?'K':'M',139+12*(dStr.length),60);
    g.setFont("6x8",2);
  }
  g.drawString('Time: '+parseInt(finish_ms/3600000)%10+':'+('0'+parseInt(finish_ms/60000)%60).substr(-2)+':'+('0'+parseInt(finish_ms/1000)%60).substr(-2),bangle2?62:67,bangle2?63:83);
  var avgPace = dist?((finish_ms/dist)/1000):0;
  var paceStr = 'Avg Pace: '+parseInt(avgPace/60)+':'+('0'+parseInt(avgPace%60)).substr(-2);
  if (bangle2)
    g.drawString(paceStr+(cfg.metric?'/K':'/M'),38,83);
  else {
    g.drawString(paceStr,19,113);
    g.setFont("6x8",1);
    g.drawString(cfg.metric?'/K':'/M',19+12*(paceStr.length),120);
    g.setFont("6x8",2);
  }
  g.drawString("Steps: "+steps,bangle2?56:55,bangle2?103:143);
  var avgCadence = steps?(60*steps/(finish_ms/1000)):0;
  g.drawString("Cadence: "+parseInt(avgCadence),bangle2?44:31,bangle2?123:173);
  g.reset();
  Bangle.drawWidgets();
}

function finish() {
  if (recording) {
    finish_ms = elapsed_ms;
    if (!isNaN(gps.time) && !isNaN(gps.lat) && !isNaN(gps.lon) && !isNaN(gps.alt) && cfg.record && (last_time != gps.time))
      fp.write([gps.time.getTime(),gps.lat.toFixed(5),gps.lon.toFixed(5),gps.alt].join(",")+"\n");
  }
  recording = false;
  Bangle.setGPSPower(0);
  Bangle.on('step',function(){});
  Bangle.on('GPS',function(){});
  clearInterval(lapID);
  clearInterval(intID);
  if (!bangle2) {
    clearWatch(finID);
    clearWatch(invID);
  }
  if (!bangle2) {
    setWatch(function() {if (lcd_on) endScreen();}, BTN1, {repeat:true});
    setWatch(function() {load();},BTN3);
  } else
    setWatch(function() {load();},BTN1);
  fg = 1-fg;
  endScreen();
}

function startScreen() {
  clearInterval(intID);
  if (!bangle2) {
    clearWatch(invID);
  }
  clearWatch(finID);
  setScreenMode();
  doLayout();
  drawGPSBox();
  Bangle.buzz();
  if (!bangle2) {
    invID = setWatch(invertRunning, BTN1, {repeat:true});
    startID = setWatch(start, BTN2);
    finID = setWatch(finish, BTN3);
  } else
    startID = setWatch(start, BTN1, {edge: 'falling'});
  fixed = false;
  intID = setInterval(mainLoop,1000);
}

function invertRunning() {
  // not applicable to bangle2
  if (!lcd_on)
    return;
  fg = 1-fg;
  setScreenMode();
  if (started)
    if (recording) {
      current_time = Date.now();
      elapsed_ms = current_time - (start_time + paused_time);
    } else
      elapsed_ms = begin_pause - (start_time + paused_time);
  else
    elapsed_ms = 0;
  drawInvert();
  drawSatIcon();
  drawGPSBox();
  drawGPS();
  drawDist();
  if (show_lap)
    showLap();
  else {
    drawTime();
    if (cfg.pacer == 0)
      drawPace();
    else {
      drawPacer();
      drawSmallPace();
    }
  }
  g.setFont("6x8",3);
  if (cfg.show_steps) {
    drawStepsIcon();
    g.drawString(steps.toString(),20,190,true);
  } else {
    drawCadenceIcon();
    g.drawString(cadence.toString()+"  ",20,190,true);
  }
  if (recording)
    drawPause();
  else if (started || gps.fix)
    drawStart();
  drawStop();
  g.reset();
  Bangle.drawWidgets();
}

function drawDots() {
  if (ctr % 4 == 0)
    g.drawString("   ",bangle2?116:176,bangle2?90:108,true);
  else if (ctr % 4 == 1)
    g.drawString(".",bangle2?116:176,bangle2?90:108);
  else if (ctr % 4 == 2)
    g.drawString("..",bangle2?116:176,bangle2?90:108);
  else
    g.drawString("...",bangle2?116:176,bangle2?90:108);
}

function invertWaiting() {
  /* not applicable to bangle2 */
  fg = 1-fg;
  setScreenMode();
  drawInvert();
  drawExit();
  g.setFont("6x8",2);
  g.drawString("Locating",68,88);
  g.drawString("Satellites",56,108);
  ctr--;
  drawDots();
  g.reset();
  Bangle.drawWidgets();
  ctr++;
}

function awaitGPSLoop() {
  g.reset();
  setColours();
  g.setFont("6x8",bangle2?1:2);
  drawDots();
  if (gps.fix)
    startScreen();
  if (ctr % 10 == 0) {
    g.reset();
    Bangle.drawWidgets();
  }
  ctr++;
}

function awaitGPS() {
  Bangle.setOptions({wakeOnTwist:false});
  Bangle.setGPSPower(1);
  Bangle.on('GPS', saveGPS);
  Bangle.setLCDPower(true);
  Bangle.setLCDTimeout(0);
  g.reset();
  setColours();
  if (!bangle2) {
    drawInvert();
    invID = setWatch(invertWaiting, BTN1, {repeat:true});
  }
  drawExit();
  g.setFont("6x8",bangle2?1:2);
  // g.drawString("Locating",bangle2?36:68,bangle2?72:88);
  // g.drawString("Satellites",bangle2?24:56,bangle2?92:108);
  g.drawString("Locating",bangle2?62:68,bangle2?78:88);
  g.drawString("Satellites",56,bangle2?90:108);
  intID = setInterval(awaitGPSLoop,1000);
  if (bangle2)
    finID = setWatch(function(){load();},BTN1);
  else
    finID = setWatch(function(){load();},BTN3);
}

function main() {
  require("Storage").write("pacer.json", cfg);
  E.showMenu();
  if (cfg.eco)
    Bangle.on('lcdPower', function(on) {setTimeout(function(){lcd_on = on;}, 500);});
  fg = cfg.dark?1:0;
  R = cfg.metric?6371:3959;
  ppace = 295 + 5 * cfg.pacer;
  setScreenMode();
  awaitGPS();
}

defaults();

var main_menu = {
  "" : { "title" : "Pacer"},
  "Start": function() { main(); },
  "Recording" : {
    value : cfg.record,
    format : v => v?"On":"Off",
    onchange : v => { cfg.record = v; },
  },
  "Units" : {
    value : cfg.metric,
    format : v => v?"Metric":"Imperial",
    onchange : v => { cfg.metric = v; },
  },
  "Lap" : {
    value : cfg.lap_idx,
    format : v => laps[v],
    min : 0, max : 6,
    onchange : v => { cfg.lap_idx = v; }
  },
  "Dark mode" : {
    value : cfg.dark,
    format : v => v?"On":"Off",
    onchange : v => { cfg.dark = v; },
  },
  "Eco battery" : {
    value : cfg.eco,
    format : v => v?"On":"Off",
    onchange : v => { cfg.eco = v; },
  },
  "Eco storage" : {
    value : cfg.storage,
    format : v => v?"On":"Off",
    onchange : v => { cfg.storage = v; },
  },
  "Steps" : {
    value : cfg.show_steps,
    format : v => v?"Count":"Cadence",
    onchange : v => { cfg.show_steps = v; },
  },
  "Pacer" : {
    value : cfg.pacer,
    format : v => v==0?"Off":pace_str(v),
    min : 0, max : 121,
    onchange : v => { cfg.pacer = v; }
  },
};

if (!bangle2) {
  Bangle.setLCDMode();
}
Bangle.setLCDBrightness(1);
setScreenMode();
E.showMenu(main_menu);
