/**
 *
 * A module of Geo functions for use with gps fixes
 *
 * let geo = require("geotools");
 * let os = geo.gpsToOSGrid(fix);
 * let ref = geo.gpsToOSMapRef(fix);
 *
 */

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
  var lat0 = (49).toRad(), lon0 = (-2).toRad();  // NatGrid true origin is 49Ã¯Â¿Â½N,2Ã¯Â¿Â½W
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

/*
 * converts northing, easting to standard OS grid reference.
 *
 * [digits=10] - precision (10 digits = metres)
 *   to_map_ref(8, 651409, 313177); => 'TG 5140 1317'
 *   to_map_ref(0, 651409, 313177); => '651409,313177'
 *
 */
function to_map_ref(digits, easting, northing) {
  if (![ 0,2,4,6,8,10,12,14,16 ].includes(Number(digits))) throw new RangeError(`invalid precision '${digits}'`);

  let e = easting;
  let n = northing;

  // use digits = 0 to return numeric format (in metres) - note northing may be >= 1e7
  if (digits == 0) {
    const format = { useGrouping: false,  minimumIntegerDigits: 6, maximumFractionDigits: 3 };
    const ePad = e.toLocaleString('en', format);
    const nPad = n.toLocaleString('en', format);
    return `${ePad},${nPad}`;
  }

  // get the 100km-grid indices
  const e100km = Math.floor(e / 100000), n100km = Math.floor(n / 100000);

  // translate those into numeric equivalents of the grid letters
  let l1 = (19 - n100km) - (19 - n100km) % 5 + Math.floor((e100km + 10) / 5);
  let l2 = (19 - n100km) * 5 % 25 + e100km % 5;

  // compensate for skipped 'I' and build grid letter-pairs
  if (l1 > 7) l1++;
  if (l2 > 7) l2++;
  const letterPair = String.fromCharCode(l1 + 'A'.charCodeAt(0), l2 + 'A'.charCodeAt(0));

  // strip 100km-grid indices from easting & northing, and reduce precision
  e = Math.floor((e % 100000) / Math.pow(10, 5 - digits / 2));
  n = Math.floor((n % 100000) / Math.pow(10, 5 - digits / 2));

  // pad eastings & northings with leading zeros
  e = e.toString().padStart(digits/2, '0');
  n = n.toString().padStart(digits/2, '0');

  return `${letterPair} ${e} ${n}`;
}

/**
 *
 * Module exports section, example code below
 *
 * let geo = require("geotools");
 * let os = geo.gpsToOSGrid(fix);
 * let ref = geo.gpsToOSMapRef(fix);
 */

// get easting and northings
exports.gpsToOSGrid = function(gps_fix) {
  return OsGridRef.latLongToOsGrid(gps_fix);
}

// string with an OS Map grid reference
exports.gpsToOSMapRef = function(gps_fix) {
  let os = OsGridRef.latLongToOsGrid(last_fix);
  return to_map_ref(6, os.easting, os.northing);
}
