/*
 * Degrees to radians
 */
function toRadians(degrees)
{
    return Math.PI * degrees / 180;
}

/*
 * Julian day number
 * Assumes a proleptic gregorian calendar where the year 1 is preceded by the
 * year 0.
 */
function toJulianDay(year, month, day, hours, minutes, seconds)
{
    day += hours / 24 + minutes / 1440 + seconds / 86400;
    
    if(month <= 2)
    {
        year -= 1;
        month += 12;
    }
    
    var A = Math.floor(year / 100);
    var B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

/*
 * Sidereal time in Greenwich
 */
function siderealTime(julianDay)
{
    var T = (julianDay - 2451545.0) / 36525;
    return toRadians(280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000);
}

/*
* Draws a single star in the sky. 
* starPositions is a dictionary that gets modified and it is used later for ploting the constelations
*/
function drawStar(zeta,theta,z,julianDay,latitude,longitude,starInfo,starNumber,starPositions){
  let starRA = parseFloat(starInfo[0]);
  let starDE = parseFloat(starInfo[1]);
  let starMag = parseFloat(starInfo[2]);
  var dec = Math.asin(Math.sin(theta) * Math.cos(starDE) * Math.cos(starRA + zeta) + Math.cos(theta) * Math.sin(starDE));
  var ascen = Math.atan2(Math.cos(starDE) * Math.sin(starRA + zeta), Math.cos(theta) * Math.cos(starDE) * Math.cos(starRA + zeta) - Math.sin(theta) * Math.sin(starDE)) + z;
  var H = siderealTime(julianDay) - longitude - ascen;
  //Compute altitude
  var alt = Math.asin(Math.sin(latitude) * Math.sin(dec) + Math.cos(latitude) * Math.cos(dec) * Math.cos(H));
  if(alt >= 0)
  {
    //Compute azimuth  
    var azi = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(latitude) - Math.tan(dec) * Math.cos(latitude));
    var x = size / 2 + size / 2 * Math.cos(alt) * Math.sin(azi);
    var y = size / 2 + size / 2 * Math.cos(alt) * Math.cos(azi);
    starPositions[starNumber] = [x,y];
    var magnitude = starMag<1?2:1;
    //Stars between 1.5 and 4 magnitude should get a different colour
    var col=1;
    if (starMag<=1.5)
      col=1;
    else if (starMag>1.5 && starMag<2)
      col=0.9;
    else if (starMag>=2 && starMag<3)
      col=0.7;
    else if (starMag>=3 && starMag<3.5)
      col=0.5;
    else
      col=0.3;

    g.setColor(col,col,col);
    g.fillCircle(x, y, magnitude);
    if (starMag<1 && settings.starnames)
      g.drawString(starInfo[3],x,y+2);
    g.flip();

  }
}



function plotSky(lat,lon,date){
  var longitude = toRadians(-lon);
  var latitude = toRadians(lat);

  var julianDay = toJulianDay(date.getFullYear(), date.getMonth()+1,date.getDate(),
                              date.getHours() + date.getTimezoneOffset() / 60,
                              date.getMinutes(), date.getSeconds());
  

  storage = require('Storage');
  f=storage.read("planetarium.data.csv","r");
  g.clear();

  //Common calculations based only on time
  var t = (julianDay - 2451545.0) / 36525;
  var zeta = toRadians((2306.2181 * t + 0.30188 * t * t + 0.017998 * t * t * t) / 3600);
  var theta = toRadians((2004.3109 * t - 0.42665 * t * t - 0.041833 * t * t * t) / 3600);
  var z = toRadians((2306.2181 * t + 1.09468 * t * t + 0.018203 * t * t * t) / 3600);


  let starNumber = 0;
  var starPositions = {};

  var line,linestart = 0;
  lineend = f.indexOf("\n");
  while (lineend>=0) {
    line = f.substring(linestart,lineend);
    starNumber++;
    //Process the star
    starInfo = line.split(',');
    drawStar(zeta,theta,z,julianDay,latitude,longitude,starInfo,starNumber,starPositions);
    linestart = lineend+1;
    lineend = f.indexOf("\n",linestart);
  }
  

  if (settings.constellations){
    //First plot the extra stars for the constellations
    fe=storage.read("planetarium.extra.csv","r");
    linenum=linestart = 0;
    lineend = fe.indexOf("\n");
    let starNumber = 0;
    while (lineend>=0) {
      line = fe.substring(linestart,lineend);
      starNumber++;
      starInfo = line.split(',');
      drawStar(zeta,theta,z,julianDay,latitude,longitude,starInfo,"e_"+starNumber,starPositions);
      linestart = lineend+1;
      lineend = fe.indexOf("\n",linestart);
    }
    //End of ploting extra stars
    
    linenum=linestart = 0;
    fc=storage.read("planetarium.const.csv","r");
    lineend = fc.indexOf("\n");
    while (lineend>=0) {
      linenum++;
      //In this file, each constelation are two lines. The first one the name, the second the lines joining stars
      var name = fc.substring(linestart,lineend);
      linestart = lineend+1;
      lineend = fc.indexOf("\n",linestart);
      var lines = fc.substring(linestart,lineend).split(',');
      linestart = lineend+1;
      lineend = fc.indexOf("\n",linestart);
      g.setColor(0,255,0);
      
      constelationShowing=false;
      
      for (j=0;j<lines.length;j++){
        positions = lines[j].split(' ');            
        positionStar1=starPositions[positions[0]];
        positionStar2=starPositions[positions[1]];
        //Both stars need to be visible
        if (positionStar1 && positionStar2)
        {
          g.drawLine(positionStar1[0],positionStar1[1],positionStar2[0],positionStar2[1]);
          constelationShowing=true;
        }
        else
          constelationShowing=false;
        g.flip();
      }
      
      //Write the name
      if (constelationShowing && settings.consnames)
        g.drawString(name,positionStar2[0]+10,positionStar2[1]);
    }
  }
}

const size = 240; //Bangle size screen

Bangle.setGPSPower(1);

//var gps = { fix : 0};
var prevSats = 0;
g.clear();

var settings = require('Storage').readJSON('planetarium.json',1)||
      { starnames:false,constellations:true,consnames:false};

g.setFontAlign(0,0);

Bangle.on('GPS',function(gp) {
  date = new Date();
  //gps = gp;
  if (gp.fix) {
    lat = gp.lat;
    lon = gp.lon;
    Bangle.setGPSPower(0);
    setTimeout(function() {
      plotSky(lat,lon,new Date());},0);
  } else {
    g.setFont("Vector",20); 
    g.drawString("Waiting for position",120,120);
    g.setFont("Vector",15); 
    if (gp.satellites>prevSats || prevSats===0){
      prevSats = gp.satellites;
      g.clearRect(0,150,240,180);
      g.drawString("Got "+gp.satellites+" satellites",120,160);
    }
    g.clearRect(0,180,240,220);
    g.drawString("GMT:"+(date.getHours()+date.getTimezoneOffset() / 60)+":"+date.getMinutes()+":"+date.getSeconds(),120,200);
    g.drawString(date.getDate()+'/'+date.getMonth()+1+"/"+date.getFullYear(),120,215);
    g.flip();
  }
});