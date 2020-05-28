var coordScale = 0.6068;
var coords = new Int32Array([-807016,6918514,-807057,6918544,-807135,6918582,-807238,6918630,-807289,6918646,-807308,6918663,-807376,6918755,-807413,6918852,-807454,6919002,-807482,6919080,-807509,6919158,-807523,6919221,-807538,6919256,-807578,6919336,-807628,6919447,-807634,6919485,-807640,6919505,-807671,6919531,-807703,6919558,-807760,6919613,-807752,6919623,-807772,6919643,-807802,6919665,-807807,6919670,-807811,6919685,-807919,6919656,-807919,6919645,-807890,6919584,-807858,6919533,-807897,6919503,-807951,6919463,-807929,6919430,-807916,6919412,-807907,6919382,-807901,6919347,-807893,6919322,-807878,6919292,-807858,6919274,-807890,6919232,-807909,6919217,-807938,6919206,-807988,6919180,-807940,6919127,-807921,6919100,-807908,6919072,-807903,6919039,-807899,6919006,-807911,6918947,-807907,6918936,-807898,6918905,-807881,6918911,-807874,6918843,-807870,6918821,-807854,6918775,-807811,6918684,-807768,6918593,-807767,6918593,-807729,6918516,-807726,6918505,-807726,6918498,-807739,6918481,-807718,6918465,-807697,6918443,-807616,6918355,-807518,6918263,-807459,6918191,-807492,6918162,-807494,6918147,-807499,6918142,-807500,6918142,-807622,6918041,-807558,6917962,-807520,6917901,-807475,6917933,-807402,6917995,-807381,6918024,-807361,6918068,-807323,6918028,-807262,6918061,-807263,6918061,-807159,6918116,-807148,6918056,-807028,6918063,-807030,6918063,-806979,6918068,-806892,6918090,-806760,6918115,-806628,6918140,-806556,6918162,-806545,6918175,-806531,6918173,-806477,6918169,-806424,6918180,-806425,6918180,-806367,6918195,-806339,6918197,-806309,6918191,-806282,6918182,-806248,6918160,-806225,6918136,-806204,6918107,-806190,6918076,-806169,6917968,-806167,6917953,-806157,6917925,-806140,6917896,-806087,6917839,-806071,6917824,-805969,6917904,-805867,6917983,-805765,6918063,-805659,6918096,-805677,6918131,-805676,6918131,-805717,6918212,-805757,6918294,-805798,6918397,-805827,6918459,-805877,6918557,-805930,6918608,-805965,6918619,-806037,6918646,-806149,6918676,-806196,6918685,-806324,6918703,-806480,6918735,-806528,6918738,-806644,6918712,-806792,6918667,-806846,6918659,-806914,6918654,-806945,6918661,-806971,6918676,-806993,6918689,-806992,6918692,-807065,6918753,-807086,6918786,-807094,6918788,-807102,6918795,-807104,6918793,-807107,6918799,-807102,6918802,-807112,6918812,-807106,6918815,-807115,6918826,-807120,6918823,-807132,6918841,-807141,6918850,-807151,6918841,-807170,6918832,-807193,6918813,-807222,6918775,-807246,6918718,-807250,6918694,-807264,6918637,-807238,6918630,-807148,6918587,-807057,6918544,-806948,6918463]);

var min = {"x":-807988,"y":6917824};
var max = {"x":-805659,"y":6919685};
var gcoords = new Uint8Array(coords.length);
var coordDistance = new Uint16Array(coords.length/2);

var PT_DISTANCE = 30; // distance to a point before we consider it complete

function toScr(p) {
  return {
    x : 10 + (p.x-min.x)*100/(max.x-min.x),
    y : 230 - (p.y-min.y)*100/(max.y-min.y)
  };
}

var last;
var totalDistance = 0;
for (var i=0;i<coords.length;i+=2) {
  var c = {x:coords[i],y:coords[i+1]};
  var s = toScr(c);
  gcoords[i  ] = s.x;
  gcoords[i+1] = s.y;
  if (last) {
    var dx = c.x-last.x;
    var dy = c.y-last.y;
    totalDistance += Math.sqrt(dx*dx+dy*dy)*coordScale;
    coordDistance[i/2] = totalDistance;
  }
  last = c;
}
var fix, lastFix;
var nextPtIdx = 0; // 2x the number of points
var nextPt = {x:coords[nextPtIdx], y:coords[nextPtIdx+1]};
var nextAngle = 0;
var nextDist = 0;
var currentDist = 0;



function drawMap() {
  g.clearRect(0,0,239,120);
  g.setFontAlign(0,0);
  g.setColor(1,0,0);
  g.setFontVector(40);
  g.drawString((currentDist===undefined)?"?":(Math.round(currentDist)+"m"), 160, 30);
  g.setColor(1,1,1);
  g.setFont("6x8",2);
  g.drawString(Math.round(totalDistance)+"m", 160, 70);
  g.drawString((nextPtIdx/2)+"/"+coordDistance.length, 50, 20);
  if (!fix.fix) {
    g.setColor(1,0,0);
    g.drawString("No GPS", 50, 50);
    g.setFont("6x8",1);
    g.drawString(fix.satellites+" Sats", 50, 70);
  }

  if (lastFix && lastFix.fix) {
    g.setColor(0,0,0);
    g.drawCircle(lastFix.s.x,lastFix.s.y,10);
  }
  for (var i=0;i<gcoords.length;i+=2) {
    g.setColor((i<=nextPtIdx) ? 63488 : 46486); // red/grey
    g.fillRect(gcoords[i]-2,gcoords[i+1]-2,gcoords[i]+2,gcoords[i+1]+2);
  }
  g.setColor(1,0,0); // first part of path
  g.drawPoly(new Uint8Array(gcoords.buffer, 0, nextPtIdx+2));
  g.setColor(1,1,1); // remaining part of path
  g.drawPoly(new Uint8Array(gcoords.buffer, nextPtIdx));

  if (fix && fix.fix) {
    g.setColor(1,0,0);
    g.drawCircle(fix.s.x,fix.s.y,10);
  }
  lastFix = fix;
}

function getNextPtInfo() {
  var dx = nextPt.x - fix.p.x;
  var dy = nextPt.y - fix.p.y;
  nextAngle = Math.atan2(dx,dy)*180/Math.PI;
  nextDist = Math.sqrt(dx*dx+dy*dy)*coordScale;
}

function onGPS(f) {
  fix = f;
  fix.p = Bangle.project(fix);
  fix.s = toScr(fix.p);
  getNextPtInfo();
  if ((nextDist < PT_DISTANCE) &&
      (nextPtIdx < coords.length)) {
    nextPtIdx+=2;
    nextPt = {x:coords[nextPtIdx], y:coords[nextPtIdx+1]};
    getNextPtInfo();
  }
  // work out how far we are (based on distance to next point)
  if (!fix.fix) {
    currentDist = undefined
  } else if (nextPtIdx+2 < coordDistance.length) {
    currentDist = coordDistance[1+(nextPtIdx/2)] - nextDist;
  } else if (nextPtIdx+2 == coordDistance.length) {
    currentDist = totalDistance - nextDist;
  } else {
    currentDist = totalDistance;
  }

  if (!Bangle.isLCDOn()) return;
  drawMap();
}

function arrow(r,c) {
  r=r*Math.PI/180;
  var p = Math.PI*3/4;
  g.setColor(c);
  g.fillPoly([
    180+40*Math.sin(r), 180-40*Math.cos(r),
    180+20*Math.sin(r+p), 180-20*Math.cos(r+p),
    180-10*Math.sin(r), 180+10*Math.cos(r),
    180+20*Math.sin(r+-p), 180-20*Math.cos(r-p),
  ]);
}

function onCompass(m) {
  if (!Bangle.isLCDOn()) return;

  arrow(oldHeading,0);
  var heading = m.heading + nextAngle;
  arrow(heading,0xF800);
  oldHeading = heading;
}


// draw the heading
var oldHeading = 0;
Bangle.on('GPS', onGPS);
Bangle.on('mag', onCompass);
Bangle.setGPSPower(1);
Bangle.setCompassPower(1);
g.clear();
