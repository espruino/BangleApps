Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);

var minLat;
var maxLat;
var minLong;
var maxLong;
var lfactor;
var scale;
var duration;

function getLength(fn) {
  minLat = 90;
  maxLat = -90;
  minLong = 180;
  maxLong = -180;
  duration = 0;
  var f = require("Storage").open(".gpsrc"+fn.toString(36),"r");
  if (f===undefined) return;
  var l = f.readLine(f);
  var nl = 0;
  var starttime=0;
  while(l!==undefined) {
    ++nl;
    var c = l.split(",");
    if (starttime==0) starttime = parseInt(c[0]);
    else duration =  parseInt(c[0]) - starttime; 
    var lat = parseFloat(c[1]);
    if (lat>maxLat) maxLat = lat;
    if (lat<minLat) minLat = lat;
    var lng = parseFloat(c[2]);
    if (lng>maxLong) maxLong = lng;
    if (lng<minLong) minLong = lng; 
    l = f.readLine(f);
  }
  lfactor = Math.cos(minLat*Math.PI/180);
  var ylen = (maxLat-minLat);
  var xlen = (maxLong-minLong)* lfactor;
  scale = xlen>ylen ? 200/xlen : 200/ylen; 
  duration = Math.round(duration/1000);
  return nl;
}

function mins(v){
  var mins = Math.floor(v/60);
  var secs = v-mins*60;
  return ""+mins.toString()+"m "+secs.toString()+"s";
}

function xcoord(long){
  return 30+Math.round((long-minLong)*lfactor*scale);
}

function ycoord(lat){
  return 210 - Math.round((lat - minLat)*scale);
}

function radians(a) {
  return a*Math.PI/180;
}

function distance(lat1,long1,lat2,long2){
  var x = radians(long1-long2) * Math.cos(radians((lat1+lat2)/2));
  var y = radians(lat2-lat1);
  return Math.sqrt(x*x + y*y) * 6371000;
}

function drawTrack(fn){
  g.clear();
  g.setColor(1,0.5,0.5);
  g.setFont("Vector",16);
  g.fillRect(9,80,11,120);
  g.fillPoly([9,60,19,80,0,80]);
  g.setColor(1,1,1);
  g.drawString("N",2,40); 
  g.drawString("Track"+fn.toString()+" - Loading",10,220);
  var plots = getLength(fn);
  g.setColor(0,0,0);
  g.fillRect(0,220,239,239);
  g.setColor(1,1,1);
  g.drawString(mins(duration),10,220);
  var f = require("Storage").open(".gpsrc"+fn.toString(36),"r");
  if (f===undefined) return;
  var l = f.readLine(f);
  var ox=0;
  var oy=0;
  var olat,olong,dist=0;
  var first = true;
  for(var i = 0; i<plots; ++i){
    var c = l.split(",");
    var lat = parseFloat(c[1]);
    var long = parseFloat(c[2]);
    var x = xcoord(long);
    var y = ycoord(lat);
    if (first) {
      g.moveTo(x,y);
      g.setColor(0,1,0);
      g.fillCircle(x,y,5);
      g.setColor(1,1,1);
      first = false;
    } else if (x!=ox || y!=oy) {
      g.lineTo(x,y);
    }
    if (!first) {
       var d = distance(olat,olong,lat,long);
       if (!isNaN(d)) dist+=d;
    }
    olat = lat;
    olong = long;
    ox = x;
    oy = y;
    l = f.readLine(f);
  }
  g.setColor(1,0,0);
  g.fillCircle(ox,oy,5);
  g.setColor(1,1,1);
  g.drawString(Math.round(dist).toString()+"m",120,220);
}

function viewTracks() {
  const menu = {
    '': { 'title': 'GPS Tracks' }
  };
  var found = false;
  for (var n=0;n<36;n++) {
    var f = require("Storage").open(".gpsrc"+n.toString(36),"r");
    if (f.readLine()!==undefined) {
      menu["Track "+n] = drawTrack.bind(null,n);
      found = true;
    }
  }
  if (!found)
    menu["No Tracks found"] = function(){};
  menu['< Back'] = function(){load();};
  return E.showMenu(menu);
}

viewTracks();


  
