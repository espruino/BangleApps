function getLogo() {
  return require("heatshrink").decompress(atob("mUcggHE1QADCY3L3cA5gCBAAoXEDI0M3YVChe8BYmgDAwZE4AYDAAOwAYUKDAMKC4mgBgUL2AYFAgYQBDA4yC3e8MYRhIhQYFAoJ6DhYYHCoQRCDApMC3fA5gwHDAxqBG4R7BGQJ3DDA8KGIY7BAYUMO4pJDDAgXDQQYYBhmw5bgBDBY6EMgMLPYIxBQAPADAimDDYIhDPogYC3hOCLwT5D0ASCDAhIBcobMCCgYRDVwg6ChnLMIPA3cMDAgqEfIgxCCIIzB2BLBToIYMKAW7JYSYC4GwH4YYGJYJfCLoLHFDAIVBMY5hCSowWBgG8BYI/CCoY5EFYcLDAIXBPoYaCAgTNBAQQYEGgfMhYxBOIYwEJoRkDM4vLDAYJBDAj4FJghLBcIRYCCQRhCPogAEMAO8fgIuCDAg2EDAz5BS4YWBCQZgDJIUMB4TDCDAJiBAAT1FZwQLCCAm8DAIgEGIZNFDI27hhTGDIQYCPA28FgIvBGAQ"));
}

g.clear(1);
g.drawImage(getLogo(),g.getWidth()-50, g.getHeight()-(28+24));
Bangle.loadWidgets();
Bangle.drawWidgets();

function onGPS(fix) {
  var os = {northing:"---", easting:"---"}
  var state = "";
  if (fix.fix) {
    os = OsGridRef.latLongToOsGrid(fix);
    state = "GPS Fix";
  } else {
    state = "No Fix ";
  }
  var y = 30, h=48, d1 = 18, d2 = 80;
  g.reset();
  g.setFont("6x8",2).setFontAlign(-1,-1);
  g.drawString("Northing", 10,y);
  g.drawString("Easting", 10,y+d2);
  g.drawString(state,10,g.getHeight()-48,true/*erase bg*/)
  g.setFont("6x8",1);
  g.drawString(fix.satellites+" Satellites ",10,g.getHeight()-32,true/*erase bg*/)
  g.setFont("Vector",h).setFontAlign(1,-1);
  g.clearRect(0,y+d1,g.getWidth()-1,y+d1+h);
  g.drawString(os.northing, g.getWidth()-1,y+d1);
  g.clearRect(0,y+d1+d2,g.getWidth()-1,y+d1+d2+h);
  g.drawString(os.easting, g.getWidth()-1,y+d1+d2);
}

Bangle.setGPSPower(1);
Bangle.on('GPS', onGPS);

Number.prototype.toRad = function() { return this*Math.PI/180; };
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Ordnance Survey Grid Reference functions  (c) Chris Veness 2005-2014                          */
/*   - www.movable-type.co.uk/scripts/gridref.js                                                  */
/*   - www.movable-type.co.uk/scripts/latlon-gridref.html                                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
function OsGridRef(easting, northing) {
  this.easting = 0|easting;
  this.northing = 0|northing;
}
OsGridRef.latLongToOsGrid = function(point) {
  var lat = point.lat.toRad();
  var lon = point.lon.toRad();

  var a = 6377563.396, b = 6356256.909;          // Airy 1830 major & minor semi-axes
  var F0 = 0.9996012717;                         // NatGrid scale factor on central meridian
  var lat0 = (49).toRad(), lon0 = (-2).toRad();  // NatGrid true origin is 49�N,2�W
  var N0 = -100000, E0 = 400000;                 // northing & easting of true origin, metres
  var e2 = 1 - (b*b)/(a*a);                      // eccentricity squared
  var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;

  var cosLat = Math.cos(lat), sinLat = Math.sin(lat);
  var nu = a*F0/Math.sqrt(1-e2*sinLat*sinLat);              // transverse radius of curvature
  var rho = a*F0*(1-e2)/Math.pow(1-e2*sinLat*sinLat, 1.5);  // meridional radius of curvature
  var eta2 = nu/rho-1;

  var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (lat-lat0);
  var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(lat-lat0) * Math.cos(lat+lat0);
  var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(lat-lat0)) * Math.cos(2*(lat+lat0));
  var Md = (35/24)*n3 * Math.sin(3*(lat-lat0)) * Math.cos(3*(lat+lat0));
  var M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

  var cos3lat = cosLat*cosLat*cosLat;
  var cos5lat = cos3lat*cosLat*cosLat;
  var tan2lat = Math.tan(lat)*Math.tan(lat);
  var tan4lat = tan2lat*tan2lat;

  var I = M + N0;
  var II = (nu/2)*sinLat*cosLat;
  var III = (nu/24)*sinLat*cos3lat*(5-tan2lat+9*eta2);
  var IIIA = (nu/720)*sinLat*cos5lat*(61-58*tan2lat+tan4lat);
  var IV = nu*cosLat;
  var V = (nu/6)*cos3lat*(nu/rho-tan2lat);
  var VI = (nu/120) * cos5lat * (5 - 18*tan2lat + tan4lat + 14*eta2 - 58*tan2lat*eta2);

  var dLon = lon-lon0;
  var dLon2 = dLon*dLon, dLon3 = dLon2*dLon, dLon4 = dLon3*dLon, dLon5 = dLon4*dLon, dLon6 = dLon5*dLon;

  var N = I + II*dLon2 + III*dLon4 + IIIA*dLon6;
  var E = E0 + IV*dLon + V*dLon3 + VI*dLon5;

  return new OsGridRef(E, N);
};
