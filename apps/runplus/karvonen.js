(function karvonen(hrmSettings, exsHrmStats) {
  //This app is an extra feature implementation for the Run.app of the bangle.js. It's called run+
  //The calculation of the Heart Rate Zones is based on the Karvonen method. It requires to know maximum and minimum heart rates. More precise calculation methods require a lab.
  //Other methods are even more approximative.
  let wu = require("widget_utils");
  wu.hide();
  let R = Bangle.appRect;

  
  g.reset().clearRect(R).setFontAlign(0,0,0);
    
  const x = "x"; const y = "y";
  function Rdiv(axis, divisor) { // Used when placing things on the screen
    return axis=="x" ? (R.x + (R.w-1)/divisor):(R.y + (R.h-1)/divisor);
  }
  let linePoints = { //Not lists of points, but used to update points in the drawArrows function.
    x: [
  175/40,
  2,
  175/135,
    ],
    y: [
  175/64,
  175/52,
  175/110,
  175/122,
    ],
  
  };
  
  function drawArrows() {
    g.setColor(g.theme.fg);
    // Upper
    g.drawLine(Rdiv(x,linePoints.x[0]), Rdiv(y,linePoints.y[0]), Rdiv(x,linePoints.x[1]), Rdiv(y,linePoints.y[1]));
    g.drawLine(Rdiv(x,linePoints.x[1]), Rdiv(y,linePoints.y[1]), Rdiv(x,linePoints.x[2]), Rdiv(y,linePoints.y[0]));
    // Lower
    g.drawLine(Rdiv(x,linePoints.x[0]), Rdiv(y,linePoints.y[2]), Rdiv(x,linePoints.x[1]), Rdiv(y,linePoints.y[3]));
    g.drawLine(Rdiv(x,linePoints.x[1]), Rdiv(y,linePoints.y[3]), Rdiv(x,linePoints.x[2]), Rdiv(y,linePoints.y[2]));
  }
  
  //To calculate Heart rate zones, we need to know the heart rate reserve (HRR)
  // HRR = maximum HR - Minimum HR. minhr is minimum hr, maxhr is maximum hr.
  //get the hrr (heart rate reserve).
  // I put random data here, but this has to come as a menu in the settings section so that users can change it.
  let minhr = hrmSettings.min;
  let maxhr = hrmSettings.max;
  
  function calculatehrr(minhr, maxhr) {
    return maxhr - minhr;}
  
  //test input for hrr (it works).
  let hrr = calculatehrr(minhr, maxhr);
  console.log(hrr);
  
  //Test input to verify the zones work. The following value for "hr" has to be deleted and replaced with the Heart Rate Monitor input.
  let hr = exsHrmStats.getValue();
  let hr1 = hr;
  // These letiables display next and previous HR zone.
  //get the hrzones right. The calculation of the Heart rate zones here is based on the Karvonen method
  //60-70% of HRR+minHR = zone2. //70-80% of HRR+minHR = zone3. //80-90% of HRR+minHR = zone4. //90-99% of HRR+minHR = zone5. //=>99% of HRR+minHR = serious risk of heart attack
  let minzone2 = hrr * 0.6 + minhr;
  let maxzone2 = hrr * 0.7 + minhr;
  let maxzone3 = hrr * 0.8 + minhr;
  let maxzone4 = hrr * 0.9 + minhr;
  let maxzone5 = hrr * 0.99 + minhr;

  // HR data: large, readable, in the middle of the screen
  function drawHR() {
    g.setFontAlign(-1,0,0);
    g.clearRect(Rdiv(x,11/4),Rdiv(y,2)-25,Rdiv(x,11/4)+50*2-14,Rdiv(y,2)+25);
    g.setColor(g.theme.fg);
    g.setFont("Vector",50);
    g.drawString(hr, Rdiv(x,11/4), Rdiv(y,2)+4);
  }

  function drawWaitHR() {
    g.setColor(g.theme.fg);
    // Waiting for HRM
    g.setFontAlign(0,0,0);
    g.setFont("Vector",50);
    g.drawString("--", Rdiv(x,2)+4, Rdiv(y,2)+4);

    // Waiting for current Zone
    g.setFont("Vector",24);
    g.drawString("Z-", Rdiv(x,4.3)-3, Rdiv(y,2)+2);

    // waiting for upper and lower limit of current zone
    g.setFont("Vector",20);
    g.drawString("--", Rdiv(x,2)+2, Rdiv(y,9/2));
    g.drawString("--", Rdiv(x,2)+2, Rdiv(y,9/7));
  }
  
  //These functions call arcs to show different HR zones.
  
  //To shorten the code, I'll reference some letiables and reuse them.
  let centreX = R.x + 0.5 * R.w;
  let centreY = R.y + 0.5 * R.h;
  let minRadius = 0.38 * R.h;
  let maxRadius = 0.50 * R.h;
  
  //draw background image (dithered green zones)(I should draw different zones in different dithered colors)
  const HRzones= require("graphics_utils");
  let minRadiusz = 0.44 * R.h;
  let startAngle = HRzones.degreesToRadians(-88.5);
  let endAngle = HRzones.degreesToRadians(268.5);

  function drawBgArc() {
    g.setColor(g.theme.dark==false?0xC618:"#002200");
    HRzones.fillArc(g, centreX, centreY, minRadiusz, maxRadius, startAngle, endAngle);
  }
  
  const zones = require("graphics_utils");
  //####### A function to simplify a bit the code ######
  function simplify (sA, eA, Z, currentZone, lastZone) {
    let startAngle = zones.degreesToRadians(sA);
    let endAngle = zones.degreesToRadians(eA);
    if (currentZone == lastZone) zones.fillArc(g, centreX, centreY, minRadius, maxRadius, startAngle, endAngle);
    else zones.fillArc(g, centreX, centreY, minRadiusz, maxRadius, startAngle, endAngle);
    g.setFont("Vector",24);
    g.clearRect(Rdiv(x,4.3)-12, Rdiv(y,2)+2-12,Rdiv(x,4.3)+12, Rdiv(y,2)+2+12);
    g.setFontAlign(0,0,0);
    g.drawString(Z, Rdiv(x,4.3), Rdiv(y,2)+2);
  }

  function zoning (max, min) { // draw values of upper and lower limit of current zone
    g.setFont("Vector",20);
    g.setColor(g.theme.fg);
    g.clearRect(Rdiv(x,2)-20*2, Rdiv(y,9/2)-10,Rdiv(x,2)+20*2, Rdiv(y,9/2)+10);
    g.clearRect(Rdiv(x,2)-20*2, Rdiv(y,9/7)-10,Rdiv(x,2)+20*2, Rdiv(y,9/7)+10);
    g.setFontAlign(0,0,0);
    g.drawString(max, Rdiv(x,2), Rdiv(y,9/2));
    g.drawString(min, Rdiv(x,2), Rdiv(y,9/7));
  }

  function clearCurrentZone() { // Clears the extension of the current zone by painting the extension area in background color
    g.setColor(g.theme.bg);
    HRzones.fillArc(g, centreX, centreY, minRadius-1, minRadiusz, startAngle, endAngle);
  }
  
  function getZone(zone) {
    drawBgArc();
    clearCurrentZone();
    if (zone >= 0)  {zoning(minzone2, minhr);g.setColor("#00ffff");simplify(-88.5, -45, "Z1", 0, zone);}
    if (zone >= 1)  {zoning(maxzone2, minzone2);g.setColor("#00ff00");simplify(-43.5, -21.5, "Z2", 1, zone);}
    if (zone >= 2)  {zoning(maxzone2, minzone2);g.setColor("#00ff00");simplify(-20, 1.5, "Z2", 2, zone);}
    if (zone >= 3)  {zoning(maxzone2, minzone2);g.setColor("#00ff00");simplify(3, 24, "Z2", 3, zone);}
    if (zone >= 4)  {zoning(maxzone3, maxzone2);g.setColor("#ffff00");simplify(25.5, 46.5, "Z3", 4, zone);}
    if (zone >= 5)  {zoning(maxzone3, maxzone2);g.setColor("#ffff00");simplify(48, 69, "Z3", 5, zone);}
    if (zone >= 6)  {zoning(maxzone3, maxzone2);g.setColor("#ffff00");simplify(70.5, 91.5, "Z3", 6, zone);}
    if (zone >= 7)  {zoning(maxzone4, maxzone3);g.setColor("#ff8000");simplify(93, 114.5, "Z4", 7, zone);}
    if (zone >= 8)  {zoning(maxzone4, maxzone3);g.setColor("#ff8000");simplify(116, 137.5, "Z4", 8, zone);}
    if (zone >= 9)  {zoning(maxzone4, maxzone3);g.setColor("#ff8000");simplify(139, 160, "Z4", 9, zone);}
    if (zone >= 10) {zoning(maxzone5, maxzone4);g.setColor("#ff0000");simplify(161.5, 182.5, "Z5", 10, zone);}
    if (zone >= 11) {zoning(maxzone5, maxzone4);g.setColor("#ff0000");simplify(184, 205, "Z5", 11, zone);}
    if (zone == 12) {zoning(maxzone5, maxzone4);g.setColor("#ff0000");simplify(206.5, 227.5, "Z5", 12, zone);}
   }

  function getZoneAlert() {
   const HRzonemax = require("graphics_utils");
   let centreX1,centreY1,maxRadius1 = 1;
   let minRadius = 0.40 * R.h;
   let startAngle1 = HRzonemax.degreesToRadians(-90);
   let endAngle1 = HRzonemax.degreesToRadians(270);
   g.setFont("Vector",38);g.setColor("#ff0000");
   HRzonemax.fillArc(g, centreX, centreY, minRadius, maxRadius, startAngle1, endAngle1);
   g.drawString("ALERT", 26,66);
  }
  
  //Subdivided zones for better readability of zones when calling the images. //Changing HR zones will trigger the function with the image and previous&next HR zones.
  let subZoneLast;
  function drawZones() {
    if ((hr < maxhr - 2) && subZoneLast==13) {g.clear(); drawArrows(); drawHR();} // Reset UI when coming down from zone alert.
    if (hr <= hrr * 0.6 + minhr) {if (subZoneLast!=0) {subZoneLast=0; getZone(subZoneLast);}} // Z1
    else if (hr <= hrr * 0.64 + minhr) {if (subZoneLast!=1) {subZoneLast=1; getZone(subZoneLast);}} // Z2a
    else if (hr <= hrr * 0.67 + minhr) {if (subZoneLast!=2) {subZoneLast=2; getZone(subZoneLast);}} // Z2b
    else if (hr <= hrr * 0.70 + minhr) {if (subZoneLast!=3) {subZoneLast=3; getZone(subZoneLast);}} // Z2c
    else if (hr <= hrr * 0.74 + minhr) {if (subZoneLast!=4) {subZoneLast=4; getZone(subZoneLast);}} // Z3a
    else if (hr <= hrr * 0.77 + minhr) {if (subZoneLast!=5) {subZoneLast=5; getZone(subZoneLast);}} // Z3b
    else if (hr <= hrr * 0.80 + minhr) {if (subZoneLast!=6) {subZoneLast=6; getZone(subZoneLast);}} // Z3c
    else if (hr <= hrr * 0.84 + minhr) {if (subZoneLast!=7) {subZoneLast=7; getZone(subZoneLast);}} // Z4a
    else if (hr <= hrr * 0.87 + minhr) {if (subZoneLast!=8) {subZoneLast=8; getZone(subZoneLast);}} // Z4b
    else if (hr <= hrr * 0.90 + minhr) {if (subZoneLast!=9) {subZoneLast=9; getZone(subZoneLast);}} // Z4c
    else if (hr <= hrr * 0.94 + minhr) {if (subZoneLast!=10) {subZoneLast=10; getZone(subZoneLast);}} // Z5a
    else if (hr <= hrr * 0.96 + minhr) {if (subZoneLast!=11) {subZoneLast=11; getZone(subZoneLast);}} // Z5b
    else if (hr <= hrr * 0.98 + minhr) {if (subZoneLast!=12) {subZoneLast=12; getZone(subZoneLast);}} // Z5c
    else if (hr >= maxhr - 2) {subZoneLast=13; g.clear();getZoneAlert();} // Alert
  }
  
  function initDraw() {
    drawArrows();
    if (hr!=0) updateUI(true); else {drawWaitHR(); drawBgArc();}
    //drawZones();
  }

  let hrLast;
  //h = 0; // Used to force hr update via web ui console field to trigger draws, together with `if (h!=0) hr = h;` below.
  function updateUI(resetHrLast) { // Update UI, only draw if warranted by change in HR.
    hrLast = resetHrLast?0:hr; // Handles correct updating on init depending on if we've got HRM readings yet or not.
    hr = exsHrmStats.getValue();
    //if (h!=0) hr = h;
    if (hr!=hrLast) {
      drawHR();
      drawZones();
    } //g.setColor(g.theme.fg).drawLine(175/2,0,175/2,175).drawLine(0,175/2,175,175/2); // Used to align UI elements.
  }
  
  initDraw();

  // check for updates every second.
  karvonenInterval = setInterval(function() {
    if (!isMenuDisplayed && karvonenActive) updateUI();
  }, 1000);

  return karvonenInterval;
})
