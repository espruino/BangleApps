//
// Time Travellers Watch
// Written May 2020 by Richard Hopkins
// based on a skeleton app by Gordon Williams
//
const locale = require('locale');
const widgetHeight=24;
let timer = null;
let currentDate = new Date();
const centerX = Math.round(g.getWidth() / 2);
const centerY = widgetHeight + Math.round((g.getHeight()-widgetHeight) / 2);
const radius = Math.round(Math.min(g.getWidth()/2,(g.getHeight()-widgetHeight) / 2));
const cirRad = 2*Math.PI;
const proportion = 0.3; // relative size of hour hand
const thickness = 4; // thickness of decorative lines
const settings = require("Storage").readJSON("app.json", 1);
const decoration = settings['decoration']

const drawSegment = (params) => {
  angle1 = params.start/360*cirRad;
  angle2 = (params.start + params.arc)/360*cirRad;
  segRadius = Math.round(params.radius*radius);
  x = centerX + (params.x * radius);
  y = centerY - (params.y *radius);
  g.setColor(0,0,0);
  incr = cirRad/60;
  for (i = angle1; i < angle2; i=i+incr) {
    brush = thickness * (angle2-angle1) /angle2;
    points = [
    x + Math.sin(i) * (segRadius+brush),
    y - Math.cos(i) * (segRadius+brush),
    x + Math.sin(i+incr) * (segRadius+brush),
    y - Math.cos(i+incr) * (segRadius+brush),
    x + Math.sin(i+incr) * (segRadius-brush),
    y - Math.cos(i+incr) * (segRadius-brush),
    x + Math.sin(i) * (segRadius-brush),
    y - Math.cos(i) * (segRadius-brush)
    ];
    g.fillPoly(points);
  }
};

const drawThickLine = (params) => {
  g.setColor(0,0,0);
  from = {
    x: centerX + (params.fromX * radius),
    y: centerY - (params.fromY * radius)
  };
  to = {
    x: centerX + (params.toX * radius),
    y: centerY - (params.toY * radius)
  };
  vec = {};
  vec.x = to.x - from.x;
  vec.y = to.y - from.y;
  pVec = {};
  pVec.x = vec.y;
  pVec.y = -vec.x;
  length = Math.sqrt(pVec.x * pVec.x + pVec.y * pVec.y);
  nVec = {};
  nVec.x = pVec.x / length;
  nVec.y = pVec.y / length;
  array = [
    from.x + nVec.x * thickness,
    from.y + nVec.y * thickness,
    from.x - nVec.x * thickness,
    from.y - nVec.y * thickness,
    to.x + nVec.x * thickness,
    to.y + nVec.y * thickness,
    to.x - nVec.x * thickness,
    to.y - nVec.y * thickness
  ];
  g.fillPoly(array);
};



const drawHands = () => {
  drawMinuteHand();
  drawHourHand();
  if (decoration) {drawDecoration()};
};

const drawDecoration = () => {
  params = {
    start: 210,
    arc: 295,
    radius: 0.7,
    x: 0,
    y: 0
  };
  drawSegment(params);
  params = {
    start: 290,
    arc: 135,
    radius: 0.4,
    x: 0,
    y: -0.7
  };
  drawSegment(params);
  params = {
    start: 0,
    arc: 360,
    radius: 0.4,
    x: 0,
    y: 0.3
  };
  drawSegment(params);
    params = {
    start: 0,
    arc: 360,
    radius: 0.15,
    x: 0,
    y: 0.3
  };
  drawSegment(params);
  params = {
    start: 0,
    arc: 360,
    radius: 0.15,
    x: 0.7,
    y: 0
  };
  drawSegment(params);
  params = {
    fromX: 0.4,
    fromY: 0.2, 
    toX: 0.6,
    toY: 0.1
  };
  drawThickLine(params);
    params = {
    fromX: -0.2,
    fromY: -0.05, 
    toX: -0.7,
    toY: -0.7
  };
  drawThickLine(params);
  params = {
    fromX: -0.3,
    fromY: 0.05, 
    toX: -0.95,
    toY: -0.3
  };
  drawThickLine(params);
};

const drawMinuteHand = () => {
  angle = currentDate.getMinutes()/60 * cirRad;
  //angle = currentDate.getSeconds()/60 * cirRad;
  g.setColor(0,1,0);
  var points = [centerX,centerY];
  for (i = 0; i < angle; i=i+cirRad/60) {
    points.push(Math.round(centerX + Math.sin(i) * radius),
                Math.round(centerY - Math.cos(i) * radius));
  }
  g.fillPoly(points);
};

const drawHourHand = () => {
  g.setColor(0,0,0);
  //angle = currentDate.getMinutes()/60 * cirRad;
  angle = currentDate.getHours()/12 * cirRad;
  g.fillCircle(
    Math.round(centerX + Math.sin(angle) * radius * (1-proportion)),
    Math.round(centerY - Math.cos(angle) * radius * (1-proportion)),
    radius * proportion
  );
};

const drawClockFace = () => {
    g.setColor(0.1,0.7,0);
    g.fillCircle(centerX,centerY,radius*0.98);
  };

const drawAll = () => {
  currentDate = new Date();
  g.clear();
  Bangle.drawWidgets();
  drawClockFace();
  drawHands();
};


const startTimers = () => {
  //timer = setInterval(drawAll, 1000);
  timer = setInterval(drawAll, 1000*20);
};

Bangle.on('lcdPower', (on) => {
  if (on) {
    startTimers();
    drawAll();
  } else {
    if (timer) {
      clearInterval(timer);
    }
  }
});

g.clear();
startTimers();
Bangle.loadWidgets();
drawAll();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
