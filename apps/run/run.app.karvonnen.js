//The calculation of the Heart Rate Zones is based on the Karvonnen method. It requires to know maximum and minimum heart rates. More precise calculation methods require a lab.
//Other methods are even more approximative.
g.clear();
// ########### The settings section ? How does this work ? #############
let settings = Object.assign({
  minhr: {
    value: 0}
  maxhr: {
    value: 0}
}, require("Storage").readJSON("run.json", 1) || {});
// ######## end of settings section

// ########## listening to swipes ? How does this work ? #########
//to go back and forth between Run and karvonnen
Bangle.on('swipe', function(directionLR, directionUD) { ... });

// ###### The app itself ############
g.drawLine(40,64,88,52,136,64);
g.drawLine(88,52,136,64);
g.drawLine(40,112,88,124);
g.drawLine(88,124,132,112);
g.setFont("Vector",20);

//To calculate Heart rate zones, we need to know the heart rate reserve (HRR)
// HRR = maximum HR - Minimum HR. minhr is minimum hr, maxhr is maximum hr.
//get the hrr (heart rate reserve).
// I put random data here, but this has to come as a menu in the settings section so that users can change it.
let minhr = 48;
let maxhr = 187;

function calculatehrr(minhr, maxhr) {
  return maxhr - minhr;}

//test input for hrr (it works).
let hrr = calculatehrr(minhr, maxhr);
console.log(hrr);

//Test input to verify the zones work. The following value for "hr" has to be deleted and replaced with the Heart Rate Monitor input.
let hr = 174;
var hr1 = hr;
// These variables display next and previous HR zone.
//get the hrzones right. The calculation of the Heart rate zones here is based on the Karvonnen method
//60-70% of HRR+minHR = zone2. //70-80% of HRR+minHR = zone3. //80-90% of HRR+minHR = zone4. //90-99% of HRR+minHR = zone5. //=>99% of HRR+minHR = serious risk of heart attack
var minzone2 = hrr * 0.6 + minhr;
var maxzone2 = hrr * 0.7 + minhr;
var maxzone3 = hrr * 0.8 + minhr;
var maxzone4 = hrr * 0.9 + minhr;
var maxzone5 = hrr * 0.99 + minhr;

// HR data: large, readable, in the middle of the screen
g.setFont("Vector",50);
g.drawString(hr1, 62,66);

//To shorten the code, I'll reference some variables and reuse them.
let centreX = 0.5 * g.getWidth();
let centreY = 0.5 * g.getWidth();
let minRadius = 0.38 * g.getWidth();
let maxRadius = 0.50 * g.getWidth();

//####### A function to simplify a bit the code ######
function simplify (sA, eA, Z) {
const zone= require("graphics_utils");
let startAngle = zone.degreesToRadians(sA);
let endAngle = zone.degreesToRadians(eA);
zone.fillArc(g, centreX, centreY, minRadius, maxRadius, startAngle, endAngle);
g.drawString(Z, 29,80);}

//####### A function to simplify next&previous zones ######
function zoning (max, min) {
g.drawString(max, 56,28);g.drawString(min, 60,128);}

//Thenext functions call arcs to display different HR zones.
//draw background image (dithered green zones)(I will draw different zones in different dithered colors)
 const HRzones= require("graphics_utils");
 let minRadiusz = 0.44 * g.getWidth();
 let startAngle = HRzones.degreesToRadians(-88.5);
 let endAngle = HRzones.degreesToRadians(268.5);
 g.setColor("#002200");
 HRzones.fillArc(g, centreX, centreY, minRadiusz, maxRadius, startAngle, endAngle);
 g.setFont("Vector",24);

function getzone1() {g.setColor("#00ffff");{(simplify (-88.5, -20, "Z1"));}zoning(minzone2, minhr);}
function getzone2a() {g.setColor("#00ff00");{(simplify (-43.5, -21.5, "Z2"));}zoning(maxzone2, minzone2);}
function getzone2b() {g.setColor("#00ff00");{(simplify (-20, 1.5, "Z2"));}zoning(maxzone2, minzone2);}
function getzone2c() {g.setColor("#00ff00");{(simplify (3, 24, "Z2"));}zoning(maxzone2, minzone2);}
function getzone3a() {g.setColor("#ffff00");{(simplify (25.5, 46.5, "Z3"));}zoning(maxzone3, maxzone2);}
function getzone3b() {g.setColor("#ffff00");{(simplify (48, 69, "Z3"));}zoning(maxzone3, maxzone2);}
function getzone3c() {g.setColor("#ffff00");{(simplify (70.5, 91.5, "Z3"));}zoning(maxzone3, maxzone2);}
function getzone4a() {g.setColor("#ff8000");{(simplify (91, 114.5, "Z4"));}zoning(maxzone4, maxzone3);}
function getzone4b() {g.setColor("#ff8000");{(simplify (116, 137.5, "Z4"));}zoning(maxzone4, maxzone3);}
function getzone4c() {g.setColor("#ff8000");{(simplify (139, 160, "Z4"));}zoning(maxzone4, maxzone3);}
function getzone5a() {g.setColor("#ff0000");{(simplify (161.5, 182.5, "Z5"));}zoning(maxzone5, maxzone4);}
function getzone5b() {g.setColor("#ff0000");{(simplify (184, 205, "Z5"));}zoning(maxzone5, maxzone4);}
function getzone5c() {g.setColor("#ff0000");{(simplify (206.5, 227.5, "Z5"));}zoning(maxzone5, maxzone4);}

function getzonealert() {
 const HRzonemax = require("graphics_utils");
 var centreX1,centreY1,maxRadius1 = 1;
 let minRadius = 0.40 * g.getWidth();
 let startAngle1 = HRzonemax.degreesToRadians(-90);
 let endAngle1 = HRzonemax.degreesToRadians(270);
 g.setFont("Vector",38);g.setColor("#ff0000");
 HRzonemax.fillArc(g, centreX, centreY, minRadius, maxRadius, startAngle1, endAngle1);
 g.drawString("ALERT", 26,66);}
//Subdivided zones for better readability of zones when calling the images. //Changing HR zones will trigger the function with the image and previous&next HR zones.

  if (hr <= hrr*0.6 + minhr) {(getzone1());
} else if (hr <= hrr*0.64 + minhr) {(getzone2a());
} else if (hr <= hrr*0.67+minhr) {(getzone2b());
} else if (hr <= hrr * 0.7 + minhr) {(getzone2c());
} else if (hr <= hrr * 0.74 + minhr) {(getzone3a());
} else if (hr <= hrr * 0.77 + minhr) {(getzone3b());
} else if (hr <= hrr * 0.8 + minhr) {(getzone3c());
} else if (hr <= hrr * 0.84 + minhr) {(getzone4a());
} else if (hr <= hrr * 0.87 + minhr) {(getzone4b());
} else if (hr <= hrr * 0.9 + minhr) {(getzone4c());
} else if (hr <= hrr * 0.94 + minhr) {(getzone5a());
} else if (hr <= hrr * 0.96 + minhr) {(getzone5b());
} else if (hr <= hrr * 0.98 + minhr) {(getzone5c());
} else if (hr >= maxhr - 2) {g.clear();(getzonealert());}
