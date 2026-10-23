/* tenkyu eclipse engine. MIT; independent implementation of published formulas.
 * Meeus, Astronomical Algorithms, 2nd ed.: ch.7 Julian date, ch.12 sidereal
 * time, ch.13 coordinate conversion, ch.22 nutation/obliquity, ch.25 Sun,
 * ch.47 Moon (Tables 47.A/B in eclipse-terms.js).
 * Delta T: Espenak/Meeus, Five Millennium Canon of Solar Eclipses,
 * NASA https://eclipse.gsfc.nasa.gov/SEhelp/deltatpoly2004.html .
 * Geometry: analytic ray / WGS84 ellipsoid and overlapping angular disks.
 * No runtime ephemeris or networking library. All vectors are geocentric km
 * in the true equator/equinox of date; angles explicitly suffixed Deg/Rad.
 * Approximation: UTC=UT1; uniform solar disk; no lunar limb relief,
 * differential aberration/light-time refinements or atmospheric scattering.
 */
var D2R=Math.PI/180,A_KM=6378.137,F=1/298.257223563;
var B_KM=A_KM*(1-F),E2=F*(2-F),AU_KM=149597870.7,SUN_KM=695700;
var MOON_TERMS=60; // cap EACH lunar table in published order, 1..60
var tables,sunTables;
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function wrapDeg(x){return ((x%360)+360)%360;}
function sinDeg(x){return Math.sin(wrapDeg(x)*D2R);}
function cosDeg(x){return Math.cos(wrapDeg(x)*D2R);}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function norm(a){return Math.sqrt(dot(a,a));}
function poly(t,c){var v=c[c.length-1];for(var i=c.length-2;i>=0;i--)v=v*t+c[i];return v;}
function julianDateUTC(date){return date.getTime()/86400000+2440587.5;}
function deltaTSeconds(date){
  var s=date.toISOString(),y=+s.substr(0,4)+(+s.substr(5,2)-0.5)/12,t,u;
  if(y< -500||y>=2150){u=(y-1820)/100;return -20+32*u*u;}
  if(y<500)return poly(y/100,[10583.6,-1014.41,33.78311,-5.952053,-0.1798452,0.022174192,0.0090316521]);
  if(y<1600)return poly((y-1000)/100,[1574.2,-556.01,71.23472,0.319781,-0.8503463,-0.005050998,0.0083572073]);
  if(y<1700)return poly(y-1600,[120,-0.9808,-0.01532,1/7129]);
  if(y<1800)return poly(y-1700,[8.83,0.1603,-0.0059285,0.00013336,-1/1174000]);
  if(y<1860)return poly(y-1800,[13.72,-0.332447,0.0068612,0.0041116,-0.00037436,0.0000121272,-0.0000001699,0.000000000875]);
  if(y<1900)return poly(y-1860,[7.62,0.5737,-0.251754,0.01680668,-0.0004473624,1/233174]);
  if(y<1920)return poly(y-1900,[-2.79,1.494119,-0.0598939,0.0061966,-0.000197]);
  if(y<1941)return poly(y-1920,[21.20,0.84493,-0.076100,0.0020936]);
  if(y<1961){t=y-1950;return 29.07+0.407*t-t*t/233+t*t*t/2547;}
  if(y<1986){t=y-1975;return 45.45+1.067*t-t*t/260-t*t*t/718;}
  if(y<2005)return poly(y-2000,[63.86,0.3345,-0.060374,0.0017275,0.000651814,0.00002373599]);
  if(y<2050)return poly(y-2000,[62.92,0.32217,0.005589]);
  u=(y-1820)/100;return -20+32*u*u-0.5628*(2150-y);
}
function timeScales(date,options){
  var jd=julianDateUTC(date);
  if(!isFinite(jd))throw new Error("Invalid eclipse Date");
  var dt=options&&options.deltaT!==undefined?+options.deltaT:deltaTSeconds(date);
  if(!isFinite(dt))throw new Error("Invalid deltaT seconds");
  return {jdUTC:jd,jdTT:jd+dt/86400,t:(jd+dt/86400-2451545)/36525,deltaT:dt};
}
function nutationRad(t){
  // Ch.22 short four-term nutation (arcseconds -> radians), mean obliquity.
  var om=125.04-1934.136*t,l=280.47+36000.77*t,lp=218.316+481267.881*t;
  var psi=(-17.20*sinDeg(om)-1.32*sinDeg(2*l)-0.23*sinDeg(2*lp)+0.21*sinDeg(2*om))*D2R/3600;
  var de=(9.20*cosDeg(om)+0.57*cosDeg(2*l)+0.10*cosDeg(2*lp)-0.09*cosDeg(2*om))*D2R/3600;
  var eps=(23+26/60+(21.448-46.815*t-0.00059*t*t+0.001813*t*t*t)/3600)*D2R;
  return {psi:psi,eps:eps+de};
}
function sunEclipticKm(t,n){
  // Ch.25 low-precision apparent Sun; longitude radians, distance km.
  var l=280.46646+36000.76983*t+0.0003032*t*t;
  var m=357.52911+35999.05029*t-0.0001537*t*t;
  var e=0.016708634-0.000042037*t-0.0000001267*t*t;
  var c=(1.914602-0.004817*t-0.000014*t*t)*sinDeg(m)+
    (0.019993-0.000101*t)*sinDeg(2*m)+0.000289*sinDeg(3*m);
  var r=1.000001018*(1-e*e)/(1+e*cosDeg(m+c));
  return {lonRad:wrapDeg(l+c)*D2R+n.psi-20.4898*D2R/(3600*r),latRad:0,distanceKm:r*AU_KM};
}
function getSunTables(){
  if(!sunTables){
    if(typeof process!=="undefined"&&process.versions&&process.versions.node)sunTables=require("./eclipse-sun-terms.js");
    else{
      var src=require("Storage").read("orbit.eclsun");
      if(!src)throw new Error("Missing orbit.eclsun");
      var out={};(new Function("exports",src))(out);sunTables=out;
    }
  }
  return sunTables;
}
function vsopSeries(tau,orders){
  var result=0,power=1,i,j,sum,row;
  for(i=0;i<orders.length;i++){
    row=orders[i];sum=0;
    for(j=0;j<row.length;j+=3)sum+=row[j]*Math.cos(row[j+1]+row[j+2]*tau);
    result+=sum*power;power*=tau;
  }
  return result/1e8;
}
function sunVSOPKm(t,n){
  // Ch.32 short VSOP87D Earth -> ch.25 apparent Sun. Tau is millennia TT.
  // Ch.25 FK5 correction: longitude -0.09033", latitude small rotation.
  var tau=t/10,q=getSunTables(),lon=vsopSeries(tau,q.l)+Math.PI;
  var lat=-vsopSeries(tau,q.b),r=vsopSeries(tau,q.r);
  var lp=lon-(1.397*t+0.00031*t*t)*D2R;
  lat+=0.03916*(Math.cos(lp)-Math.sin(lp))*D2R/3600;
  lon+=n.psi-(0.09033+20.4898/r)*D2R/3600;
  return {lonRad:lon,latRad:lat,distanceKm:r*AU_KM};
}
function moonArgumentsDeg(t){
  return [
    poly(t,[218.3164477,481267.88123421,-0.0015786,1/538841,-1/65194000]),
    poly(t,[297.8501921,445267.1114034,-0.0018819,1/545868,-1/113065000]),
    poly(t,[357.5291092,35999.0502909,-0.0001536,1/24490000]),
    poly(t,[134.9633964,477198.8675055,0.0087414,1/69699,-1/14712000]),
    poly(t,[93.2720950,483202.0175233,-0.0036539,-1/3526000,1/863310000])
  ];
}
function nearNewMoon(date){
  // Conservative SCREEN only (1900..2100), not an eclipse classification:
  // lunar mean elongation within 30 degrees. Safe margin for periodic terms.
  var jd=julianDateUTC(date),t=(jd-2451545)/36525;
  if(t< -1||t>1)return true;
  var d=wrapDeg(297.8501921+445267.1114034*t);
  return Math.min(d,360-d)<30;
}
function shadowPossible(date){
  // Cheap conservative 12-term lunar + low-Sun gate, valid near modern era.
  // Threshold 3 deg exceeds Earth parallax + both disks + truncated series
  // error; renderer rechecks this gate every 10 min, full model every 30 s.
  if(!nearNewMoon(date))return false;
  var time=timeScales(date),n={psi:0},s=sunEclipticKm(time.t,n),m=moonEclipticKm(time.t,n,12);
  var c=Math.cos(m.latRad)*Math.cos(m.lonRad-s.lonRad);
  return c>Math.cos(3*D2R);
}
function getTables(){
  if(!tables){
    if(typeof process!=="undefined"&&process.versions&&process.versions.node)tables=require("./eclipse-terms.js");
    else{
      var src=require("Storage").read("orbit.ecldata");
      if(!src)throw new Error("Missing orbit.ecldata");
      var e={};(new Function("exports",src))(e);tables=e;
    }
  }
  return tables;
}
function moonEclipticKm(t,n,terms){
  var a=moonArgumentsDeg(t),tab=getTables(),e=1-0.002516*t-0.0000074*t*t;
  var count=clamp(terms===undefined?MOON_TERMS:terms|0,1,60);
  var sl=0,sr=0,sb=0,i,k,arg,f;
  for(i=0;i<count;i++){
    k=i*6;arg=tab.lr[k]*a[1]+tab.lr[k+1]*a[2]+tab.lr[k+2]*a[3]+tab.lr[k+3]*a[4];
    f=Math.abs(tab.lr[k+1]);f=f===2?e*e:(f===1?e:1);
    sl+=tab.lr[k+4]*f*sinDeg(arg);sr+=tab.lr[k+5]*f*cosDeg(arg);
    k=i*5;arg=tab.b[k]*a[1]+tab.b[k+1]*a[2]+tab.b[k+2]*a[3]+tab.b[k+3]*a[4];
    f=Math.abs(tab.b[k+1]);f=f===2?e*e:(f===1?e:1);
    sb+=tab.b[k+4]*f*sinDeg(arg);
  }
  var a1=119.75+131.849*t,a2=53.09+479264.290*t,a3=313.45+481266.484*t;
  sl+=3958*sinDeg(a1)+1962*sinDeg(a[0]-a[4])+318*sinDeg(a2);
  sb+=-2235*sinDeg(a[0])+382*sinDeg(a3)+175*sinDeg(a1-a[4])+175*sinDeg(a1+a[4])+
    127*sinDeg(a[0]-a[3])-115*sinDeg(a[0]+a[3]);
  return {lonRad:wrapDeg(a[0]+sl/1e6)*D2R+n.psi,latRad:sb/1e6*D2R,distanceKm:385000.56+sr/1000};
}
function equatorialVectorKm(p,eps){
  var cl=Math.cos(p.lonRad),sl=Math.sin(p.lonRad),cb=Math.cos(p.latRad),sb=Math.sin(p.latRad),r=p.distanceKm;
  return [r*cb*cl,r*(cb*sl*Math.cos(eps)-sb*Math.sin(eps)),r*(cb*sl*Math.sin(eps)+sb*Math.cos(eps))];
}
function gastRad(jdUTC,n){
  var t=(jdUTC-2451545)/36525;
  // Ch.12 GMST + equation of equinoxes for true-equator vectors.
  return wrapDeg(280.46061837+360.98564736629*(jdUTC-2451545)+0.000387933*t*t-t*t*t/38710000)*D2R+n.psi*Math.cos(n.eps);
}
function rotateZKm(v,angleRad){
  var c=Math.cos(angleRad),s=Math.sin(angleRad);
  return [c*v[0]-s*v[1],s*v[0]+c*v[1],v[2]];
}
function shadowAxisKm(sun,moon){
  var u=[moon[0]-sun[0],moon[1]-sun[1],moon[2]-sun[2]],length=norm(u);
  for(var i=0;i<3;i++)u[i]/=length;
  var mu=dot(moon,u),c=[moon[0]-mu*u[0],moon[1]-mu*u[1],moon[2]-mu*u[2]];
  return {u:u,c:c,mu:mu,distanceKm:length,gamma:norm(c)/A_KM};
}
function intersectWGS84Km(axis){
  // Use closest-axis point c, avoiding cancellation at lunar distances.
  // p=c+h*u. Ray from Moon requires h>=mu; choose FIRST forward root.
  var c=axis.c,u=axis.u,ia=1/(A_KM*A_KM),ib=1/(B_KM*B_KM);
  var aa=(u[0]*u[0]+u[1]*u[1])*ia+u[2]*u[2]*ib;
  var bb=2*((c[0]*u[0]+c[1]*u[1])*ia+c[2]*u[2]*ib);
  var cc=(c[0]*c[0]+c[1]*c[1])*ia+c[2]*c[2]*ib-1;
  var disc=bb*bb-4*aa*cc;
  if(disc<0)return null;
  var h=(-bb-Math.sqrt(disc))/(2*aa);
  if(h<axis.mu)h=(-bb+Math.sqrt(disc))/(2*aa);
  if(h<axis.mu)return null;
  return [c[0]+h*u[0],c[1]+h*u[1],c[2]+h*u[2]];
}
function geographicDeg(p){
  return {lat:Math.atan2(p[2],(1-E2)*Math.sqrt(p[0]*p[0]+p[1]*p[1]))/D2R,
    lon:(wrapDeg(Math.atan2(p[1],p[0])/D2R+180)-180)};
}
function prepare(date,options){
  options=options||{};
  var time=timeScales(date,options),n=nutationRad(time.t);
  var sun=options.sunMethod==="low"?sunEclipticKm(time.t,n):sunVSOPKm(time.t,n);
  var s=equatorialVectorKm(sun,n.eps);
  var m=equatorialVectorKm(moonEclipticKm(time.t,n,options.moonTerms),n.eps);
  var theta=gastRad(time.jdUTC,n);
  s=rotateZKm(s,-theta);m=rotateZKm(m,-theta);
  var ax=shadowAxisKm(s,m),k=options.moonK===undefined?0.272281:+options.moonK;
  if(!(k>0&&k<1))throw new Error("Invalid moonK Earth-radius ratio");
  var p=intersectWGS84Km(ax),result={axisHitsEarth:!!p,lat:null,lon:null,gamma:ax.gamma,type:"none"};
  if(p){
    var geo=geographicDeg(p);result.lat=geo.lat;result.lon=geo.lon;
    var dm=norm([m[0]-p[0],m[1]-p[1],m[2]-p[2]]);
    var ds=norm([s[0]-p[0],s[1]-p[1],s[2]-p[2]]);
    result.type=k*A_KM/dm>=SUN_KM/ds?"total":"annular";
  }
  ax.sun=s;ax.moon=m;ax.moonRadiusKm=k*A_KM;ax.result=result;
  // Conservative penumbra bound. Covers partial-only eclipses with no axis hit.
  var pen=ax.moonRadiusKm+(Math.abs(ax.mu)+A_KM)*(SUN_KM+ax.moonRadiusKm)/ax.distanceKm;
  ax.active=ax.mu<0&&norm(ax.c)<A_KM+pen;
  ax.time=time;return ax;
}
function calculate(date,options){return prepare(date,options).result;}
function diskObscuration(d,rs,rm){
  // Fraction of a uniform solar disk occulted, analytic circle overlap.
  if(d>=rs+rm)return 0;
  if(d<=Math.abs(rm-rs))return rm>=rs?1:rm*rm/(rs*rs);
  var a=Math.acos(clamp((d*d+rs*rs-rm*rm)/(2*d*rs),-1,1));
  var b=Math.acos(clamp((d*d+rm*rm-rs*rs)/(2*d*rm),-1,1));
  var h=Math.sqrt(Math.max(0,(-d+rs+rm)*(d+rs-rm)*(d-rs+rm)*(d+rs+rm)));
  return clamp((rs*rs*a+rm*rm*b-h/2)/(Math.PI*rs*rs),0,1);
}
function obscurationKm(ax,x,y,z){
  // Horizon using WGS84 surface normal; no shadows on Earth's night side.
  var nz=z/(1-E2);
  if(x*ax.sun[0]+y*ax.sun[1]+nz*ax.sun[2]<=x*x+y*y+nz*z)return 0;
  var h=x*ax.u[0]+y*ax.u[1]+z*ax.u[2],t=h-ax.mu;
  if(t<=0)return 0;
  var dx=x-ax.c[0]-h*ax.u[0],dy=y-ax.c[1]-h*ax.u[1],dz=z-ax.c[2]-h*ax.u[2];
  var q2=dx*dx+dy*dy+dz*dz;
  var pen=ax.moonRadiusKm+t*(SUN_KM+ax.moonRadiusKm)/ax.distanceKm;
  if(q2>=pen*pen)return 0;
  var umb=ax.moonRadiusKm-t*(SUN_KM-ax.moonRadiusKm)/ax.distanceKm;
  if(umb>=0&&q2<=umb*umb)return 1;
  var ratio=ax.distanceKm/(ax.distanceKm+t);
  return diskObscuration(Math.sqrt(q2)*ratio,SUN_KM*t/(ax.distanceKm+t),ax.moonRadiusKm);
}
function geodeticVectorKm(latDeg,lonDeg){
  var s=sinDeg(latDeg),c=cosDeg(latDeg),n=A_KM/Math.sqrt(1-E2*s*s);
  return [n*c*cosDeg(lonDeg),n*c*sinDeg(lonDeg),n*(1-E2)*s];
}
exports.calculate=calculate;
exports.prepare=prepare;
exports.nearNewMoon=nearNewMoon;
exports.shadowPossible=shadowPossible;
exports.obscurationKm=obscurationKm;
exports.geodeticVectorKm=geodeticVectorKm;
exports.timeScales=timeScales;
exports.moonEclipticKm=moonEclipticKm;
exports.nutationRad=nutationRad;
exports.shadowAxisKm=shadowAxisKm;
exports.intersectWGS84Km=intersectWGS84Km;
exports.diskObscuration=diskObscuration;
exports.constants={equatorialRadiusKm:A_KM,eccentricitySquared:E2,moonTerms:MOON_TERMS};
