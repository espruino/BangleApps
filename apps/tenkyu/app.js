/* tenkyu 0.01 (tenkyu storage) */
(function(){
  var W=g.getWidth(),H=g.getHeight();
  var Storage=require("Storage"),CFGFILE="tenkyu.json";
  /* Prefer tenkyugi data, then Orbit; never overwrite tenkyu data. */
  (function(){
    ["json","cal.json","events.json"].forEach(function(suffix){
      var target="tenkyu."+suffix;
      if(Storage.read(target)!==undefined)return;
      var legacy=Storage.read("tenkyugi."+suffix);
      if(legacy===undefined)legacy=Storage.read("orbit."+suffix);
      if(legacy!==undefined)Storage.write(target,legacy);
    });
    var system=Storage.readJSON("setting.json",1);
    if(system&&(system.clock==="orbit.app.js"||system.clock==="tenkyugi.app.js")){
      system.clock="tenkyu.app.js";Storage.writeJSON("setting.json",system);
    }
  })();

  var cfg=Storage.readJSON(CFGFILE,1)||{};
  var sysCfg=Storage.readJSON("setting.json",1)||{};
  var VIEWLIGHT_MS=isFinite(sysCfg.timeout)?Math.max(0,+sysCfg.timeout)*1000:10000;
  sysCfg=undefined;
  /* Normalize persisted settings and migrate legacy coordinates once. */
  (function(){
    var changed=false;
    function set(k,v){if(cfg[k]!==v){cfg[k]=v;changed=true;}}
    var sun=isFinite(cfg.sunSize)?(cfg.sunSize|0):8;
    var earth=isFinite(cfg.earthSize)?(cfg.earthSize|0):42;
    var moon=isFinite(cfg.moonSize)?(cfg.moonSize|0):15;
    sun=Math.max(6,Math.min(15,sun));
    earth=Math.max(40,Math.min(45,earth));
    moon=Math.max(14,Math.min(16,moon));
    var mn=earth+moon+4;
    var orb=isFinite(cfg.moonOrbit)?(cfg.moonOrbit|0):62;
    orb=Math.max(mn,Math.min(70,orb));
    set("sunSize",sun);set("earthSize",earth);set("moonSize",moon);set("moonOrbit",orb);
    set("layoutVersion",2);
    var dp=isFinite(cfg.datePos)?(cfg.datePos|0):1,tp=isFinite(cfg.timePos)?(cfg.timePos|0):2;
    var ds=isFinite(cfg.dateSize)?(cfg.dateSize|0):22,ts=isFinite(cfg.timeSize)?(cfg.timeSize|0):22;
    set("datePos",Math.max(0,Math.min(2,dp)));set("timePos",Math.max(0,Math.min(2,tp)));
    set("dateSize",Math.max(12,Math.min(30,ds)));set("timeSize",Math.max(12,Math.min(30,ts)));
    /* Bangle time remains the default. Place time is opt-in. */
    set("timeSource",(cfg.timeSource===1||cfg.timeSource==="1")?1:0);
    set("orbitHourSize",Math.max(6,Math.min(12,isFinite(cfg.orbitHourSize)?cfg.orbitHourSize|0:8)));
    set("orbitHourStep",[1,2,3,6].indexOf(cfg.orbitHourStep)>=0?cfg.orbitHourStep:1);

    var lat,lon;
    if(cfg.coordVersion!==2){
      lat=isFinite(cfg.lat)?+cfg.lat:(isFinite(cfg.manualLat)?+cfg.manualLat:35.694);
      lon=isFinite(cfg.lon)?+cfg.lon:(isFinite(cfg.manualLon)?+cfg.manualLon:139.754);
      set("coordVersion",2);
    }else{
      lat=isFinite(cfg.manualLat)?+cfg.manualLat:35.694;
      lon=isFinite(cfg.manualLon)?+cfg.manualLon:139.754;
    }
    lat=Math.max(-90,Math.min(90,lat));
    lon=Math.max(-180,Math.min(180,lon));
    set("manualLat",lat);set("manualLon",lon);
    if(cfg.lat!==undefined){delete cfg.lat;changed=true;}
    if(cfg.lon!==undefined){delete cfg.lon;changed=true;}

    /* Keep a string location source as the canonical display selector.
       Migrate older numeric locationMode values without changing coordinates. */
    var src=cfg.locationSource;
    if(src!=="place"&&src!=="manual"&&src!=="gps"){
      src=(cfg.locationMode===0||cfg.locationMode==="0")?"place":
          ((cfg.locationMode===2||cfg.locationMode==="2")?"gps":"manual");
      set("locationSource",src);
    }
    set("locationMode",src==="place"?0:(src==="gps"?2:1));

    if(changed)try{Storage.writeJSON(CFGFILE,cfg);}catch(e){}
  })();
  /* GPS is settings-only; release any stale settings-owned request. */
  try{Bangle.setGPSPower(0,"tenkyusettings");}catch(e){}
  var calModule,calendar;
  try{
    var calSource=Storage.read("tenkyu.cal.js");
    if(calSource){calModule=eval(calSource);calendar=calModule.create();}
    calSource=undefined;
  }catch(calErr){calModule=undefined;calendar=undefined;}
  var BLACK=0x0000,WHITE=0xFFFF,NAVY=0x000F,DARKBLUE=0x0008,CYAN=0x07FF,YELLOW=0xFFE0,ORANGE=0xFD20,RED=0xF800,GREEN=0x04C0;
  var busy=false,killed=false,minuteTimer,timeTimer,idleTimer,tapTimer;
  var mode="tenkyu",interactive=true,tapCount=0,resetOnWake=false;
  var selectedDayOffset=0,hasSelectedDate=false;
  var nativeDrawWidgets,widgetDrawWrapper;
  var SUNR=Math.max(6,Math.min(15,cfg.sunSize|0));
  var EARTHR=Math.max(40,Math.min(45,cfg.earthSize|0));
  var MOONR=Math.max(14,Math.min(16,cfg.moonSize|0));
  /* Keep a visible gap between Earth and Moon at every supported size. */
  var minOrbit=EARTHR+MOONR+4;
  var MOONORBIT=Math.max(minOrbit,Math.min(70,cfg.moonOrbit|0));
  var SUNRAY=4,SUNX=0,SUNY=0,EARTHX=0,EARTHY=0;
  var SUN_RAYS=[],SUN_TEX_ORANGE=[],SUN_SPOT_X=0,SUN_SPOT_Y=0;
  var SYNODIC=29.530588853,NEWMOON=947182440000;
  var MOONLIT=[],MOONFAR=[],MOONFAROUT=[];
  var MOON_LIT_MAT=[1,0,0,1,0,0],MOON_FAR_MAT=[1,0,0,1,0,0],MOON_NEAR_MAT=[1,0,0,1,0,0];
  var MOON_NATIVE=(typeof g.transformVertices==="function"),SUNANG=0;
  var MOON_CACHE_MS=1800000,MOON_CACHE_BUCKET=-1,MOON_CACHE_DATA;
  var MOON_CACHE_LIT,MOON_CACHE_FAR,MOON_CACHE_NEAR;
  var TESTLAT=Math.max(-90,Math.min(90,+cfg.manualLat));
  var TESTLON=Math.max(-180,Math.min(180,+cfg.manualLon));
  var VIEW_SOUTH=!!cfg.viewSide;
  var DATEPOS=cfg.datePos|0,TIMEPOS=cfg.timePos|0,DATESIZE=cfg.dateSize|0,TIMESIZE=cfg.timeSize|0;
  var TIMESOURCE=cfg.timeSource===1?1:0;
  var HOURSIZE=cfg.orbitHourSize|0,HOURSTEP=cfg.orbitHourStep|0;
  var ROMAN=["XII","I","II","III","IV","V","VI","VII","VIII","IX","X","XI"];
  var PLACETZ=isFinite(cfg.tzBase)?+cfg.tzBase:NaN;
  var PLACEDST=isFinite(cfg.tzRule)?(cfg.tzRule|0):0;
  /* Copy only location fields needed by the clock; place tables stay unloaded.
     The saved label is also used as a recovery cue for older/stale source flags. */
  var savedLocName=cfg.locName||"",savedLocPref=cfg.locPref||"";
  var LOCSOURCE=(savedLocName==="GPS"||savedLocPref==="GPS")?"gps":
    ((savedLocName==="Custom"||savedLocPref==="Manual")?"manual":
    ((savedLocName||savedLocPref)?"place":
    (cfg.locationSource||((cfg.locationMode===0)?"place":((cfg.locationMode===2)?"gps":"manual")))));
  var LOCMODE=LOCSOURCE==="place"?0:(LOCSOURCE==="gps"?2:1);
  var LOCNAME=(LOCMODE===0?(savedLocName||savedLocPref||"Place"):"");
  var LOCCOUNTRY=(LOCMODE===0?(cfg.countryName||"Japan"):"");
  var LOCLAT=Math.abs(TESTLAT).toFixed(3)+(TESTLAT<0?"S":"N");
  var LOCLON=Math.abs(TESTLON).toFixed(3)+(TESTLON<0?"W":"E");
  /* Drop the configuration object after extracting runtime values. */
  cfg=undefined;
  var LIGHTSPAN=[],LIGHTBX=[],LIGHTBY=[],LIGHTLIMB=[],LIGHTSTEPS=6,LUX=0,LUY=0,LVX=0,LVY=0;
  var LIGHTTERM=[],LIGHTNIGHT=[];

  /* Simplified hemisphere geometry balances recognition and redraw cost. */
  var HEMI_LAND_N=[
    /* North America incl. Alaska and Mexico.  Mexico is intentionally
       exaggerated slightly so the peninsula/waist remains visible at ~30 px radius. */
    [72,-168,65,-154,58,-143,55,-136,49,-127,39,-123,32,-117,
     29,-115,25,-112,22,-108,19,-105,16,-96,18,-90,21,-87,
     22,-91,20,-97,24,-101,27,-98,29,-90,27,-82,32,-80,
     39,-74,49,-64,59,-56,67,-72,74,-96,74,-130],
    /* Greenland */
    [59,-46,67,-57,78,-52,83,-30,75,-18,65,-31],
    /* Eurasia */
    [43,-1,54,2,63,31,71,60,72,100,67,140,59,175,47,145,40,130,32,123,
     24,117,13,106,10,95,20,82,31,63,35,37,41,21,44,11],
    /* North Africa */
    [36,-6,37,10,34,25,27,34,20,25,25,5,31,-8],
    /* Japan main islands, exaggerated slightly for the 176 px display */
    [31,129,33,131,34,134,35,137,38,141,41,142,40,139,37,136,34,133],
    /* Hokkaido */
    [41.5,140,43.5,143,45.5,145,45,142],
    /* Great Britain */
    [50,-5,53,-4,57,-4.5,58,-1,54,-1,50.5,-1]
  ];

  var HEMI_LAND_S=[
    /* South America */
    [-2,-80,-8,-79,-15,-76,-22,-71,-30,-72,-38,-73,-46,-75,
     -53,-70,-56,-66,-52,-60,-45,-55,-36,-52,-28,-49,-20,-44,
     -12,-38,-5,-35,0,-45],
    /* Southern Africa */
    [0,9,-7,12,-15,13,-23,16,-30,18,-35,20,-34,27,-29,32,
     -22,35,-15,39,-8,40,-2,35,0,29],
    /* Australia */
    [-12,113,-16,121,-20,129,-18,137,-22,145,-28,153,-35,151,
     -39,145,-38,136,-34,128,-31,116,-24,113],
    /* Madagascar */
    [-12,49,-16,50,-21,48,-26,45,-23,43,-17,44],
    /* New Zealand */
    [-34,172,-39,176,-44,170,-47,168,-43,166,-38,169]
  ];

  /* Hudson Bay is a sea cutout inside the North America polygon. */
  var HEMI_WATER_N=[
    [64,-95,62,-88,58,-80,53,-79,51,-85,54,-94,59,-97]
  ];

  var HEMI_WATER_S=[];
  var HEMI_LAND=VIEW_SOUTH?HEMI_LAND_S:HEMI_LAND_N;
  var HEMI_WATER=VIEW_SOUTH?HEMI_WATER_S:HEMI_WATER_N;
  var HEMI_XY=[],HEMI_WATER_XY=[],HEMI_SCREEN=[],HEMI_WATER_SCREEN=[],HEMI_ICE_R=0;
  /* Redraw only coastlines that remain useful at this display scale. */
  var HEMI_COAST=VIEW_SOUTH?[0,1,2,3,4]:[0,1,2,4];
  var HEMI_MAT=[1,0,0,1,0,0];
  var HEMI_NATIVE=(typeof g.transformVertices==="function");

  function clear(t){if(t)clearTimeout(t);}
  function pad(n){return n<10?"0"+n:""+n;}
  function rad(d){return d*Math.PI/180;}
  function deg(r){return r*180/Math.PI;}
  function virtualNowMs(){return Date.now()+selectedDayOffset*86400000;}
  function virtualDate(){return new Date(virtualNowMs());}

  /* Espruino's Date local getters obey the Bangle timezone/DST setting.
     Astronomical calculations must not, so UTC parts are parsed from ISO,
     whose Espruino representation is always GMT. */
  function utcParts(ms){
    var z=new Date(ms).toISOString();
    return {y:+z.substr(0,4),m:+z.substr(5,2),d:+z.substr(8,2),
      h:+z.substr(11,2),mi:+z.substr(14,2),s:+z.substr(17,2)};
  }
  function localParts(ms){
    var d=new Date(ms);
    return {y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate(),
      h:d.getHours(),mi:d.getMinutes(),s:d.getSeconds()};
  }
  function daysInMonth(y,m){
    if(m===2)return ((y%4===0&&y%100!==0)||y%400===0)?29:28;
    return [31,0,31,30,31,30,31,31,30,31,30,31][m-1];
  }
  function utcMs(y,m,d,h,mi){
    return Date.parse(y+"-"+pad(m)+"-"+pad(d)+"T"+pad(h||0)+":"+pad(mi||0)+":00Z");
  }
  function weekdayUTC(y,m,d){
    var w=(Math.floor(utcMs(y,m,d,0,0)/86400000)+4)%7;
    return w<0?w+7:w;
  }
  function nthDow(y,m,dow,n){
    return 1+((dow-weekdayUTC(y,m,1)+7)%7)+7*(n-1);
  }
  function lastDow(y,m,dow){
    var d=daysInMonth(y,m);
    return d-((weekdayUTC(y,m,d)-dow+7)%7);
  }
  function localTransition(y,m,d,h,mi,offsetMin){
    return utcMs(y,m,d,h,mi)-offsetMin*60000;
  }

  /* Compact civil-time rules used only by Place time.
     Rule ids are stored in tenkyutz; astronomy never calls this function. */
  function placeOffset(ms){
    var base=PLACETZ,rule=PLACEDST;
    if(!isFinite(base))return 0;
    if(!rule)return base;
    var y=utcParts(ms).y,start=0,end=0,day;

    if(rule===1){ /* Europe: last Sun Mar/Oct, 01:00 UTC */
      start=utcMs(y,3,lastDow(y,3,0),1,0);
      end=utcMs(y,10,lastDow(y,10,0),1,0);
    }else if(rule===2){ /* US/Canada: local 02:00 */
      start=localTransition(y,3,nthDow(y,3,0,2),2,0,base);
      end=localTransition(y,11,nthDow(y,11,0,1),2,0,base+60);
    }else if(rule===3){ /* SE Australia */
      start=localTransition(y,10,nthDow(y,10,0,1),2,0,base);
      end=localTransition(y,4,nthDow(y,4,0,1),3,0,base+60);
    }else if(rule===4){ /* New Zealand */
      start=localTransition(y,9,lastDow(y,9,0),2,0,base);
      end=localTransition(y,4,nthDow(y,4,0,1),3,0,base+60);
    }else if(rule===5){ /* Cuba */
      start=localTransition(y,3,nthDow(y,3,0,2),0,0,base);
      end=localTransition(y,11,nthDow(y,11,0,1),1,0,base+60);
    }else if(rule===6){ /* Chile: midnight after first Sat */
      day=nthDow(y,9,6,1);
      start=localTransition(y,9,day,0,0,base)+86400000;
      day=nthDow(y,4,6,1);
      end=localTransition(y,4,day,0,0,base+60)+86400000;
    }else if(rule===7){ /* Egypt: last Fri Apr to midnight after last Thu Oct */
      start=localTransition(y,4,lastDow(y,4,5),0,0,base);
      day=lastDow(y,10,4);
      end=localTransition(y,10,day,0,0,base+60)+86400000;
    }else if(rule===8){ /* Israel */
      day=lastDow(y,3,0)-2;
      start=localTransition(y,3,day,2,0,base);
      end=localTransition(y,10,lastDow(y,10,0),2,0,base+60);
    }else if(rule===9){ /* Palestine */
      start=localTransition(y,3,lastDow(y,3,6),2,0,base);
      end=localTransition(y,10,lastDow(y,10,6),2,0,base+60);
    }else if(rule===10){ /* Lebanon */
      start=localTransition(y,3,lastDow(y,3,0),0,0,base);
      end=localTransition(y,10,lastDow(y,10,0),0,0,base+60);
    }else if(rule===11){ /* Morocco: UTC+1 except Ramadan suspension.
                            tzdb-projected transition windows, 2025-2036. */
      var mr=[
        [2025,2,23,2025,4,6],[2026,2,15,2026,3,22],[2027,2,7,2027,3,14],
        [2028,1,23,2028,3,5],[2029,1,14,2029,2,18],[2029,12,30,2030,2,10],
        [2030,12,22,2031,1,26],[2031,12,14,2032,1,18],[2032,11,28,2033,1,9],
        [2033,11,20,2033,12,25],[2034,11,5,2034,12,17],
        [2035,10,28,2035,12,9],[2036,10,19,2036,11,23]
      ];
      for(var k=0;k<mr.length;k++){
        var q=mr[k],a=utcMs(q[0],q[1],q[2],2,0),b=utcMs(q[3],q[4],q[5],2,0);
        if(ms>=a&&ms<b)return 0;
      }
      return base;
    }else return base;

    /* Southern-hemisphere rules cross New Year. */
    var active=start<end?(ms>=start&&ms<end):(ms>=start||ms<end);
    return base+(active?60:0);
  }

  function displayParts(ms){
    if(TIMESOURCE===1&&LOCMODE===0&&isFinite(PLACETZ))
      return utcParts(ms+placeOffset(ms)*60000);
    return localParts(ms);
  }

  function layoutBodies(){
    /* Place the Moon envelope tangent to the left and bottom screen edges. */
    var env=MOONORBIT+MOONR;
    EARTHX=env;
    EARTHY=H-1-env;

    /* Keep the complete solar corona inside the drawable area. */
    var sunOuter=SUNR+SUNRAY;
    SUNX=W-1-sunOuter;
    SUNY=24+sunOuter;
  }

  function dayOfYearUTC(p){
    var md=[0,31,59,90,120,151,181,212,243,273,304,334];
    var n=md[p.m-1]+p.d;
    if(p.m>2&&((p.y%4===0&&p.y%100!==0)||p.y%400===0))n++;
    return n;
  }

  function solarPosition(ms,lat,lon){
    var p=utcParts(ms);
    var n=dayOfYearUTC(p);
    var hour=p.h+p.mi/60+p.s/3600;
    var g0=2*Math.PI/365*(n-1+(hour-12)/24);
    var eq=229.18*(0.000075+0.001868*Math.cos(g0)-0.032077*Math.sin(g0)
      -0.014615*Math.cos(2*g0)-0.040849*Math.sin(2*g0));
    var dec=0.006918-0.399912*Math.cos(g0)+0.070257*Math.sin(g0)
      -0.006758*Math.cos(2*g0)+0.000907*Math.sin(2*g0)
      -0.002697*Math.cos(3*g0)+0.00148*Math.sin(3*g0);
    /* UTC solar time: no Bangle timezone or DST enters this path. */
    var tst=hour*60+eq+4*lon;
    while(tst<0)tst+=1440;
    while(tst>=1440)tst-=1440;
    var ha=rad(tst/4-180),la=rad(lat);
    var sinEl=Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(ha);
    if(sinEl>1)sinEl=1;
    if(sinEl<-1)sinEl=-1;
    var el=deg(Math.asin(sinEl));
    var az=deg(Math.atan2(Math.sin(ha),Math.cos(ha)*Math.sin(la)-Math.tan(dec)*Math.cos(la)))+180;
    if(az<0)az+=360;
    if(az>=360)az-=360;
    return {az:az,el:el,ha:ha,dec:dec};
  }

  function safeSolar(){
    try{return solarPosition(virtualNowMs(),TESTLAT,TESTLON);}
    catch(e){return {az:0,el:-99,ha:0,dec:0};}
  }

  function riseSetHourAngle(lat,dec){
    /* Geometric sunrise/sunset: solar-center altitude h=0. */
    var la=rad(lat);
    var den=Math.cos(la)*Math.cos(dec);
    if(Math.abs(den)<1e-6){
      var above=Math.sin(la)*Math.sin(dec)>0;
      return {polar:true,day:above,h0:above?Math.PI:0};
    }
    var c=-(Math.sin(la)*Math.sin(dec))/den;
    if(c<=-1)return {polar:true,day:true,h0:Math.PI};
    if(c>=1)return {polar:true,day:false,h0:0};
    return {polar:false,day:false,h0:Math.acos(c)};
  }

  function buildSunCache(){
    /* Cache static Sun geometry to avoid repeated trigonometry on redraw. */
    SUN_RAYS=[];SUN_TEX_ORANGE=[];
    var i,a,ri=SUNR+1,ro=SUNR+SUNRAY;
    for(i=0;i<8;i++){
      a=i*Math.PI/4;
      SUN_RAYS.push(
        Math.round(SUNX+Math.cos(a)*ri),
        Math.round(SUNY+Math.sin(a)*ri),
        Math.round(SUNX+Math.cos(a)*ro),
        Math.round(SUNY+Math.sin(a)*ro)
      );
    }

    /* Sparse granulation remains visible without cluttering the small Sun. */
    var p=[
      -0.50,-0.17, -0.17,-0.50, 0.33,-0.33, 0.50,0.00,
       0.17,0.50, -0.33,0.33, -0.17,0.00, 0.33,0.17
    ];
    for(i=0;i<p.length;i+=2)
      SUN_TEX_ORANGE.push(Math.round(p[i]*SUNR),Math.round(p[i+1]*SUNR));

    /* Compact active region: red surround with a single dark core pixel. */
    SUN_SPOT_X=Math.round(-0.25*SUNR);
    SUN_SPOT_Y=Math.round(0.17*SUNR);
  }

  function buildLightingCache(){
    LIGHTSPAN=[];LIGHTBX=[];LIGHTBY=[];LIGHTLIMB=[];
    var a=Math.atan2(SUNY-EARTHY,SUNX-EARTHX);
    SUNANG=a;
    LUX=Math.cos(a);LUY=Math.sin(a);
    LVX=-LUY;LVY=LUX;

    for(var i=0;i<=LIGHTSTEPS;i++){
      var v=-EARTHR+2*EARTHR*i/LIGHTSTEPS;
      var span=Math.sqrt(Math.max(0,EARTHR*EARTHR-v*v));
      LIGHTSPAN.push(span);

      /* Base point on the v axis; only the declination-dependent u offset changes later. */
      LIGHTBX.push(EARTHX+LVX*v);
      LIGHTBY.push(EARTHY+LVY*v);

      /* Static anti-solar limb point used to close the night polygon. */
      LIGHTLIMB.push(
        Math.round(EARTHX-LUX*span+LVX*v),
        Math.round(EARTHY-LUY*span+LVY*v)
      );
    }

    LIGHTTERM=new Array((LIGHTSTEPS+1)*2);
    LIGHTNIGHT=new Array((LIGHTSTEPS+1)*4);
  }

  function buildEarthMapCache(){
    /* Precompute map coordinates and reuse screen buffers to limit allocation/GC. */
    HEMI_XY=[];HEMI_WATER_XY=[];HEMI_SCREEN=[];HEMI_WATER_SCREEN=[];

    function cacheSet(srcSet,dstSet,screenSet){
      for(var k=0;k<srcSet.length;k++){
        var src=srcSet[k],dst=[],scr=new Array(src.length);
        for(var i=0;i<src.length;i+=2){
          var rr=EARTHR*Math.cos(rad(src[i]));
          var da=(VIEW_SOUTH?1:-1)*rad(src[i+1]-TESTLON);
          dst.push(rr*Math.cos(da),rr*Math.sin(da));
        }
        dstSet.push(dst);
        screenSet.push(scr);
      }
    }

    cacheSet(HEMI_LAND,HEMI_XY,HEMI_SCREEN);
    cacheSet(HEMI_WATER,HEMI_WATER_XY,HEMI_WATER_SCREEN);
    HEMI_ICE_R=Math.max(2,Math.round(EARTHR*Math.cos(rad(VIEW_SOUTH?65:78))));
  }

  function mapPolyInto(src,p,ca,sa,cx,cy){
    for(var i=0;i<src.length;i+=2){
      var lx=src[i],ly=src[i+1];
      p[i]=(cx+lx*ca-ly*sa+0.5)|0;
      p[i+1]=(cy+lx*sa+ly*ca+0.5)|0;
    }
  }

  function buildLightingInto(dec,cx,cy){
    /* Reuse fixed arrays instead of allocating term/night polygons each redraw. */
    var sd=Math.sin(dec)*(VIEW_SOUTH?-1:1),i,u,x,y,j=0;
    for(i=0;i<=LIGHTSTEPS;i++){
      u=-sd*LIGHTSPAN[i];
      x=Math.round(cx+(LIGHTBX[i]-EARTHX)+LUX*u);
      y=Math.round(cy+(LIGHTBY[i]-EARTHY)+LUY*u);
      LIGHTTERM[i*2]=x;LIGHTTERM[i*2+1]=y;
      LIGHTNIGHT[i*2]=x;LIGHTNIGHT[i*2+1]=y;
    }
    j=(LIGHTSTEPS+1)*2;
    for(i=LIGHTSTEPS;i>=0;i--){
      LIGHTNIGHT[j++]=cx+(LIGHTLIMB[i*2]-EARTHX);
      LIGHTNIGHT[j++]=cy+(LIGHTLIMB[i*2+1]-EARTHY);
    }
  }

  function buildMoonCache(){
    /* Sunlight is parallel to the Earth-Sun line. */
    MOONLIT=[];MOONFAR=[];MOONFAROUT=[];
    var a=SUNANG;
    var ro=MOONR+1;
    for(var i=0;i<=8;i++){
      var q=a-Math.PI/2+i*Math.PI/8;
      MOONLIT.push(
        Math.round(Math.cos(q)*MOONR),
        Math.round(Math.sin(q)*MOONR)
      );

      /* Cache visible and erase arcs so redraws avoid per-frame scaling. */
      var t=-Math.PI/2+i*Math.PI/8;
      var ct=Math.cos(t),st=Math.sin(t);
      MOONFAR.push(ct*MOONR,st*MOONR);
      MOONFAROUT.push(ct*ro,st*ro);
    }
  }

  function moonHitsRect(m,x,y,w,h){
    if(!m)return false;
    var nx=Math.max(x,Math.min(m.x,x+w)),ny=Math.max(y,Math.min(m.y,y+h));
    var dx=m.x-nx,dy=m.y-ny,r=MOONR+2;
    return dx*dx+dy*dy<=r*r;
  }

  function topFreeGap(){
    var spans=[];
    if(typeof WIDGETS!=="undefined")Object.keys(WIDGETS).forEach(function(k){
      var wd=WIDGETS[k];
      if(!wd||!wd.width||!wd.area||wd.area.charAt(0)!=="t")return;
      if(typeof wd.x==="number")spans.push([wd.x,wd.x+wd.width-1]);
    });
    spans.sort(function(a,b){return a[0]-b[0];});
    var p=0,gaps=[];
    spans.forEach(function(s){if(s[0]>p)gaps.push([p,s[0]-1]);p=Math.max(p,s[1]+1);});
    if(p<W)gaps.push([p,W-1]);
    if(!gaps.length)return;
    gaps.sort(function(a,b){return (b[1]-b[0])-(a[1]-a[0]);});
    return gaps[0];
  }

  function drawHeaderClock(){
    if(killed||mode!=="tenkyu"||(DATEPOS!==0&&TIMEPOS!==0))return;
    var gap=topFreeGap();if(!gap)return;
    var d=displayParts(virtualNowMs()),date=pad(d.m)+pad(d.d),time=pad(d.h)+pad(d.mi);
    var size=20,showDate=DATEPOS===0,showTime=TIMEPOS===0,space=(showDate&&showTime)?" ":"";
    var txt=(showDate?date:"")+space+(showTime?time:"");
    var maxW=Math.max(1,gap[1]-gap[0]-2);
    g.setFont("Vector",size);
    while(size>8&&g.stringWidth(txt)>maxW){size--;g.setFont("Vector",size);}
    var x=gap[0]+1,y=Math.max(0,Math.floor((24-size)/2));
    var bg=g.theme.bg,fg=g.theme.fg,dim=0x8410;
    g.setColor(bg).fillRect(gap[0],0,gap[1],23);
    g.setBgColor(bg).setFont("Vector",size).setFontAlign(-1,-1);
    if(showDate){g.setColor(fg).drawString(date,x,y);x+=g.stringWidth(date+space);}
    if(showTime)g.setColor((Math.floor(Date.now()/2000)&1)?dim:fg).drawString(time,x,y);
  }

  function screenGroup(pos,m){
    var hasDate=DATEPOS===pos,hasTime=TIMEPOS===pos;
    if(!hasDate&&!hasTime)return;
    var d=displayParts(virtualNowMs()),date=pad(d.m)+pad(d.d),time=pad(d.h)+pad(d.mi);
    g.setFont("Vector",DATESIZE);var dw=hasDate?g.stringWidth(date):0;
    g.setFont("Vector",TIMESIZE);var tw=hasTime?g.stringWidth(time):0;
    var w=Math.max(dw,tw),h=(hasDate?DATESIZE+1:0)+(hasDate&&hasTime?2:0)+(hasTime?TIMESIZE+1:0);
    var right=pos===2,x=right?W-2-w:2,y=pos===2?SUNY+SUNR+SUNRAY+3:25;
    if(moonHitsRect(m,x,y,w,h)){
      if(pos===1){
        var nx=m.x+MOONR+4;
        if(nx+w<=W-2)x=nx;else y=Math.min(H-h-2,m.y+MOONR+4);
      }else y=Math.min(H-h-2,m.y+MOONR+4);
    }
    g.setColor(BLACK).fillRect(x-1,y-1,x+w+1,y+h+1);
    var yy=y;
    if(hasDate){
      g.setBgColor(BLACK).setColor(WHITE).setFont("Vector",DATESIZE).setFontAlign(right?1:-1,-1);
      g.drawString(date,right?x+w:x,yy);yy+=DATESIZE+3;
    }
    if(hasTime){
      g.setBgColor(BLACK).setColor((Math.floor(Date.now()/2000)&1)?0x8410:WHITE)
        .setFont("Vector",TIMESIZE).setFontAlign(right?1:-1,-1);
      g.drawString(time,right?x+w:x,yy);
    }
  }

  function drawDateTime(m){
    screenGroup(1,m);
    screenGroup(2,m);
  }

  function armTime(){
    clear(timeTimer);
    timeTimer=setTimeout(function(){
      timeTimer=undefined;
      if(!killed&&mode==="tenkyu"){
        if(TIMEPOS===0)drawHeaderClock();else screenGroup(TIMEPOS,MOON_CACHE_DATA);
        try{g.flip();}catch(e){}
        armTime();
      }
    },2000-(Date.now()%2000)+20);
  }

  function installWidgetRedrawHook(){
    if(widgetDrawWrapper||typeof Bangle.drawWidgets!=="function")return;
    nativeDrawWidgets=Bangle.drawWidgets;
    widgetDrawWrapper=function(){
      var r=nativeDrawWidgets.apply(Bangle,arguments);
      drawHeaderClock();
      return r;
    };
    Bangle.drawWidgets=widgetDrawWrapper;
  }

  function removeWidgetRedrawHook(){
    if(widgetDrawWrapper&&Bangle.drawWidgets===widgetDrawWrapper)Bangle.drawWidgets=nativeDrawWidgets;
    widgetDrawWrapper=undefined;nativeDrawWidgets=undefined;
  }

  function drawSun(){
    var i;
    /* Reference axis is intentionally behind both bodies. */
    g.setColor(0x8410).drawLine(EARTHX,EARTHY,SUNX,SUNY);

    /* Cached corona rays: no redraw-time trigonometry. */
    g.setColor(ORANGE);
    for(i=0;i<SUN_RAYS.length;i+=4)
      g.drawLine(SUN_RAYS[i],SUN_RAYS[i+1],SUN_RAYS[i+2],SUN_RAYS[i+3]);

    /* Photosphere: yellow disk, orange limb/granulation, small dark sunspot. */
    g.setColor(YELLOW).fillCircle(SUNX,SUNY,SUNR);
    g.setColor(ORANGE).drawCircle(SUNX,SUNY,SUNR);
    for(i=0;i<SUN_TEX_ORANGE.length;i+=2)
      g.setPixel(SUNX+SUN_TEX_ORANGE[i],SUNY+SUN_TEX_ORANGE[i+1]);

    /* Solar active region: visible red surround with a black spot core. */
    var sx=SUNX+SUN_SPOT_X,sy=SUNY+SUN_SPOT_Y;
    g.setColor(RED).fillCircle(sx,sy,1);
    g.setColor(BLACK).setPixel(sx,sy);
  }

  function drawEarth(sol){
    /* Use native vertex transforms when available; otherwise use cached JS transforms. */
    buildLightingInto(sol.dec,EARTHX,EARTHY);

    var sunAng=Math.atan2(SUNY-EARTHY,SUNX-EARTHX);
    var baseA=sunAng+(VIEW_SOUTH?sol.ha:-sol.ha);
    var ca=Math.cos(baseA),sa=Math.sin(baseA);
    var i;

    HEMI_MAT[0]=ca; HEMI_MAT[1]=sa;
    HEMI_MAT[2]=-sa; HEMI_MAT[3]=ca;
    HEMI_MAT[4]=EARTHX; HEMI_MAT[5]=EARTHY;

    if(HEMI_NATIVE){
      try{
        for(i=0;i<HEMI_XY.length;i++)
          HEMI_SCREEN[i]=g.transformVertices(HEMI_XY[i],HEMI_MAT);
        for(i=0;i<HEMI_WATER_XY.length;i++)
          HEMI_WATER_SCREEN[i]=g.transformVertices(HEMI_WATER_XY[i],HEMI_MAT);
      }catch(ex){
        HEMI_NATIVE=false;
      }
    }
    if(!HEMI_NATIVE){
      for(i=0;i<HEMI_XY.length;i++)
        mapPolyInto(HEMI_XY[i],HEMI_SCREEN[i],ca,sa,EARTHX,EARTHY);
      for(i=0;i<HEMI_WATER_XY.length;i++)
        mapPolyInto(HEMI_WATER_XY[i],HEMI_WATER_SCREEN[i],ca,sa,EARTHX,EARTHY);
    }

    g.setColor(CYAN).fillCircle(EARTHX,EARTHY,EARTHR);
    g.setColor(GREEN);
    for(i=0;i<HEMI_SCREEN.length;i++)g.fillPoly(HEMI_SCREEN[i]);

    g.setColor(CYAN);
    for(i=0;i<HEMI_WATER_SCREEN.length;i++)g.fillPoly(HEMI_WATER_SCREEN[i]);

    g.setColor(DARKBLUE).fillPoly(LIGHTNIGHT);

    g.setColor(WHITE);
    for(i=0;i<HEMI_COAST.length;i++)
      g.drawPoly(HEMI_SCREEN[HEMI_COAST[i]],true);
    if(HEMI_WATER_SCREEN.length)g.drawPoly(HEMI_WATER_SCREEN[0],true);

    g.fillCircle(EARTHX,EARTHY,HEMI_ICE_R);
    g.drawPoly(LIGHTTERM,false);
    g.drawCircle(EARTHX,EARTHY,EARTHR);
  }

  function moonData(nowMs){
    if(nowMs===undefined)nowMs=virtualNowMs();
    var age=(nowMs-NEWMOON)/86400000;
    age=age%SYNODIC;
    if(age<0)age+=SYNODIC;
    var phase=age/SYNODIC;

    /* North-side view: new Moon lies toward the Sun; phase increases CCW visually. */
    var a=SUNANG+(VIEW_SOUTH?1:-1)*phase*2*Math.PI;
    var ca=Math.cos(a),sa=Math.sin(a);
    return {
      age:age,
      phase:phase,
      x:Math.round(EARTHX+MOONORBIT*ca),
      y:Math.round(EARTHY+MOONORBIT*sa),
      ux:ca,uy:sa,vx:-sa,vy:ca
    };
  }

  function rebuildMoonGeometry(nowMs){
    var m=moonData(nowMs);
    var lit,far,near,i,j,fx,fy,nx,ny;
    var ux=m.ux,uy=m.uy,vx=m.vx,vy=m.vy;

    if(MOON_NATIVE){
      try{
        MOON_LIT_MAT[4]=m.x; MOON_LIT_MAT[5]=m.y;

        MOON_FAR_MAT[0]=ux; MOON_FAR_MAT[1]=uy;
        MOON_FAR_MAT[2]=vx; MOON_FAR_MAT[3]=vy;
        MOON_FAR_MAT[4]=m.x; MOON_FAR_MAT[5]=m.y;

        MOON_NEAR_MAT[0]=-ux; MOON_NEAR_MAT[1]=-uy;
        MOON_NEAR_MAT[2]=vx; MOON_NEAR_MAT[3]=vy;
        MOON_NEAR_MAT[4]=m.x; MOON_NEAR_MAT[5]=m.y;

        lit=g.transformVertices(MOONLIT,MOON_LIT_MAT);
        far=g.transformVertices(MOONFAROUT,MOON_FAR_MAT);
        near=g.transformVertices(MOONFAR,MOON_NEAR_MAT);
      }catch(ex){
        MOON_NATIVE=false;
      }
    }

    if(!MOON_NATIVE){
      lit=[];
      for(i=0;i<MOONLIT.length;i+=2)
        lit.push(m.x+MOONLIT[i],m.y+MOONLIT[i+1]);

      far=[];near=[];j=0;
      for(i=0;i<MOONFAR.length;i+=2,j+=2){
        fx=MOONFAROUT[i];fy=MOONFAROUT[i+1];
        nx=MOONFAR[i];ny=MOONFAR[i+1];
        far[j]=(m.x+ux*fx+vx*fy+0.5)|0;
        far[j+1]=(m.y+uy*fx+vy*fy+0.5)|0;
        near[j]=(m.x-ux*nx+vx*ny+0.5)|0;
        near[j+1]=(m.y-uy*nx+vy*ny+0.5)|0;
      }
    }

    MOON_CACHE_DATA=m;
    MOON_CACHE_LIT=lit;
    MOON_CACHE_FAR=far;
    MOON_CACHE_NEAR=near;
  }

  function drawMoon(){
    var nowMs=virtualNowMs();
    var bucket=Math.floor(nowMs/MOON_CACHE_MS);

    /* Cache lunar geometry for 30 minutes; motion stays sub-pixel at this scale. */
    if(bucket!==MOON_CACHE_BUCKET || MOON_CACHE_DATA===undefined){
      rebuildMoonGeometry(nowMs);
      MOON_CACHE_BUCKET=bucket;
    }

    var m=MOON_CACHE_DATA;
    g.setColor(0x8410).drawCircle(EARTHX,EARTHY,MOONORBIT);
    g.setColor(NAVY).fillCircle(m.x,m.y,MOONR);
    g.setColor(YELLOW).fillPoly(MOON_CACHE_LIT);
    g.setColor(BLACK).fillPoly(MOON_CACHE_FAR);
    g.setColor(WHITE).drawPoly(MOON_CACHE_NEAR,false);
    return m;
  }


  function drawOrbitHours(sol){
    /* A revolution is 24 hours. Anchor civil hours to the observer's
       zenith line, including the selected time source and DST. */
    var p=displayParts(virtualNowMs());
    var hour=p.h+p.mi/60+p.s/3600,dir=VIEW_SOUTH?1:-1;
    var base=SUNANG+dir*(sol.ha-hour*Math.PI/12);
    var radius=MOONORBIT+7;
    g.setBgColor(BLACK).setColor(WHITE).setFont("Vector",HOURSIZE).setFontAlign(0,0);
    for(var h=0;h<24;h+=HOURSTEP){
      var a=base+dir*h*Math.PI/12;
      var x=Math.round(EARTHX+radius*Math.cos(a));
      var y=Math.round(EARTHY+radius*Math.sin(a));
      g.drawString(ROMAN[h%12],x,y,true);
    }
  }

  function drawObserver(sol){
    var sunAng=Math.atan2(SUNY-EARTHY,SUNX-EARTHX);
    var rr=EARTHR*Math.cos(rad(TESTLAT));
    var a=sunAng+(VIEW_SOUTH?sol.ha:-sol.ha);
    var px=EARTHX+rr*Math.cos(a),py=EARTHY+rr*Math.sin(a);
    var rx=px-EARTHX,ry=py-EARTHY;
    var len=Math.sqrt(rx*rx+ry*ry)||1;
    var ux=rx/len,uy=ry/len;
    var x=Math.round(px),y=Math.round(py);
    var rs=riseSetHourAngle(TESTLAT,sol.dec);

    /* Draw sunrise/sunset rays at +/-H0; omit them in polar day/night. */
    if(!rs.polar){
      var ar=a-rs.h0,as=a+rs.h0;
      g.setColor(0xF81F);
      g.drawLine(EARTHX,EARTHY,
        Math.round(EARTHX+Math.cos(ar)*MOONORBIT),
        Math.round(EARTHY+Math.sin(ar)*MOONORBIT));
      g.drawLine(EARTHX,EARTHY,
        Math.round(EARTHX+Math.cos(as)*MOONORBIT),
        Math.round(EARTHY+Math.sin(as)*MOONORBIT));
    }

    /* Extend the zenith line into the lunar-orbit region. */
    var zenEndR=MOONORBIT+MOONR/2;
    var zen=Math.max(0,Math.round(zenEndR-rr));
    var zx=Math.round(px+ux*zen),zy=Math.round(py+uy*zen);

    /* Draw the 5 px-wide zenith line as one filled quadrilateral. */
    var hw=2;
    var qx=-uy*hw,qy=ux*hw;
    g.setColor(0x07E0).fillPoly([
      Math.round(x+qx),Math.round(y+qy),
      Math.round(zx+qx),Math.round(zy+qy),
      Math.round(zx-qx),Math.round(zy-qy),
      Math.round(x-qx),Math.round(y-qy)
    ]);

    g.setColor(RED).fillCircle(x,y,2);
  }


  function drawSatelliteIcon(x,y){
    g.drawRect(x,y+2,x+3,y+5);
    g.fillRect(x+5,y+2,x+7,y+5);
    g.drawRect(x+9,y+2,x+12,y+5);
    g.drawLine(x+6,y+1,x+6,y);
    g.setPixel(x+6,y);
  }

  function fitLocationLine(text,maxW){
    var size=14,min=8,t=text||"";
    maxW=Math.max(12,maxW|0);
    while(size>min){
      g.setFont("Vector",size);
      if(g.stringWidth(t)<=maxW)break;
      size--;
    }
    g.setFont("Vector",size);
    if(g.stringWidth(t)>maxW){
      while(t.length>1&&g.stringWidth(t+"~")>maxW)t=t.substr(0,t.length-1);
      if(t!==text)t+="~";
    }
    return {text:t,size:size,width:g.stringWidth(t)};
  }

  function placeLabelLayout(right,maxW){
    var country=fitLocationLine(LOCCOUNTRY,maxW);
    var place=fitLocationLine(LOCNAME,maxW);
    var yPlace=H-2-place.size;
    var yCountry=yPlace-1-country.size;
    return {right:right,country:country,place:place,yCountry:yCountry,yPlace:yPlace};
  }

  function moonHitsLabel(m,line,y,right){
    if(!m||!line)return false;
    var x=right-line.width,r=MOONR+2;
    var nx=Math.max(x,Math.min(m.x,right));
    var ny=Math.max(y,Math.min(m.y,y+line.size));
    var dx=m.x-nx,dy=m.y-ny;
    return dx*dx+dy*dy<=r*r;
  }

  function placeLabelHitsMoon(p,m){
    return moonHitsLabel(m,p.country,p.yCountry,p.right)||
           moonHitsLabel(m,p.place,p.yPlace,p.right);
  }

  function drawLocationStatus(moon){
    if(LOCMODE===0){
      /* Two-line country/place label: fit to width and shift around the Moon. */
      var right=W-2,p=placeLabelLayout(right,W-4);
      if(placeLabelHitsMoon(p,moon)){
        var moonRight=moon.x+MOONR+3;
        var rightSpace=right-moonRight;
        var pr=rightSpace>=24?placeLabelLayout(right,rightSpace):undefined;
        var leftRight=moon.x-MOONR-3;
        var leftSpace=leftRight-2;
        var pl=leftSpace>=24?placeLabelLayout(leftRight,leftSpace):undefined;
        if(pr&&pl)p=(rightSpace>=leftSpace)?pr:pl;
        else if(pr)p=pr;
        else if(pl)p=pl;
      }
      g.setBgColor(BLACK).setColor(WHITE).setFontAlign(1,-1);
      g.setFont("Vector",p.country.size);
      g.drawString(p.country.text,p.right,p.yCountry);
      g.setFont("Vector",p.place.size);
      g.drawString(p.place.text,p.right,p.yPlace);
      return;
    }

    g.setColor(BLACK).fillRect(W-61,H-19,W-1,H-1);
    g.setBgColor(BLACK).setColor(WHITE).setFont("6x8").setFontAlign(1,-1);
    g.drawString(LOCLAT,W-2,H-18);
    g.drawString(LOCLON,W-2,H-9);
    if(LOCMODE===2){
      g.setColor(CYAN);
      drawSatelliteIcon(W-60,H-17);
    }
  }

  function drawBase(){
    g.reset().setBgColor(BLACK).setColor(BLACK).clear();
    drawSun();
    var sol=safeSolar();
    drawEarth(sol);
    drawOrbitHours(sol);
    drawObserver(sol);
    var moon=drawMoon();
    drawLocationStatus(moon);
    drawDateTime(moon);
    try{Bangle.drawWidgets();}catch(e){}
    drawHeaderClock();
    try{g.flip();}catch(err){}
    busy=false;
  }

  function clearTaps(){
    clear(tapTimer);tapTimer=undefined;tapCount=0;
  }


  function civilDay(y,m,d){
    y-=m<=2?1:0;
    var era=Math.floor(y/400),yoe=y-era*400;
    var mp=m+(m>2?-3:9);
    var doy=Math.floor((153*mp+2)/5)+d-1;
    var doe=yoe*365+Math.floor(yoe/4)-Math.floor(yoe/100)+doy;
    return era*146097+doe-719468;
  }
  function dayNumber(d){
    return civilDay(d.getFullYear(),d.getMonth()+1,d.getDate());
  }

  function stopOrbitTimers(){
    clear(minuteTimer);minuteTimer=undefined;
    clear(timeTimer);timeTimer=undefined;
    clear(idleTimer);idleTimer=undefined;
    clearTaps();
  }

  function armIdle(){
    clear(idleTimer);
    if(mode!=="tenkyu"||!interactive)return;
    if(VIEWLIGHT_MS>0)idleTimer=setTimeout(goIdle,VIEWLIGHT_MS);
  }

  function startInteraction(){
    if(killed||mode!=="tenkyu")return;
    interactive=true;
    try{Bangle.setLocked(false);}catch(e){}
    try{if(!Bangle.isLCDOn())Bangle.setLCDPower(1);}catch(e){}
    try{Bangle.setBacklight(true);}catch(e){}
    armIdle();
  }

  function goIdle(){
    clear(idleTimer);idleTimer=undefined;
    clearTaps();
    interactive=false;
    /* Bangle.js 2 uses a memory-in-pixel LCD which is normally left powered.
       Only switch the backlight off here. Forcing LCD power off bypasses the
       normal Q3 wake path because lcdPowerTimeout is intentionally zero. */
    try{Bangle.setBacklight(false);}catch(e){}
  }

  function startOrbit(keepInteractive){
    if(killed)return;
    if(calendar&&calendar.isActive())calendar.stop();
    mode="tenkyu";
    busy=false;
    drawBase();
    armMinute();
    armTime();
    interactive=!!keepInteractive;
    if(interactive){
      try{Bangle.setLocked(false);}catch(e){}
      try{Bangle.setBacklight(true);}catch(e){}
      armIdle();
    }else{
      try{Bangle.setLocked(false);}catch(e){}
    }
  }

  function setDateFromCalendar(d){
    if(d){
      hasSelectedDate=true;
      selectedDayOffset=dayNumber(d)-dayNumber(new Date());
    }else{
      hasSelectedDate=false;
      selectedDayOffset=0;
    }
    MOON_CACHE_BUCKET=-1;
  }


  function openCalendar(){
    if(killed||mode!=="tenkyu")return;
    stopOrbitTimers();
    mode="calendar";
    interactive=false;
    try{Bangle.setLocked(false);}catch(e){}
    try{Bangle.setBacklight(true);}catch(e){}

    if(!calendar){
      startOrbit(true);
      return;
    }

    var focus=hasSelectedDate?virtualDate():new Date();
    try{
      calendar.start({
        focusDate:focus,
        selectedDate:hasSelectedDate?focus:undefined,
        onSelect:function(d,offset){
          if(killed)return;
          if(!d){
            setDateFromCalendar(undefined);
            return;
          }
          if(typeof offset==="number"&&isFinite(offset)){
            selectedDayOffset=offset|0;
            hasSelectedDate=true;
            MOON_CACHE_BUCKET=-1;
          }else setDateFromCalendar(d);
        },
        onReturn:function(d){
          if(killed)return;
          setDateFromCalendar(d);
          startOrbit(true);
        }
      });
    }catch(e){
      mode="tenkyu";
      busy=false;
      startOrbit(true);
    }
  }

  function openSettings(){
    if(killed||mode!=="tenkyu")return;
    stopOrbitTimers();
    var src=Storage.read("tenkyu.settings.js");
    if(!src){startOrbit(true);return;}
    cleanup();
    try{
      var fn=eval(src);
      if(typeof fn==="function")fn(function(){load("tenkyu.app.js");});
      else load("tenkyu.app.js");
    }catch(e){
      load("tenkyu.app.js");
    }
  }

  function onTouch(button,xy){
    if(killed)return;
    if(mode==="calendar"){
      if(calendar)calendar.touch(xy);
      return;
    }
    if(mode!=="tenkyu"||busy)return;
    try{if(!Bangle.isLCDOn())return;}catch(e){}

    tapCount++;
    if(tapCount===1){
      clear(tapTimer);
      tapTimer=setTimeout(function(){
        tapTimer=undefined;
        if(killed||mode!=="tenkyu")return;
        tapCount=0;
        openCalendar();
      },400);
      return;
    }
    if(tapCount>=2){
      clear(tapTimer);tapTimer=undefined;tapCount=0;
      openSettings();
    }
  }

  function onSwipe(lr,ud){
    if(killed)return;
    if(mode==="calendar"&&calendar)calendar.swipe(lr,ud);
  }

  function onFaceUp(up){
    if(up&&mode==="tenkyu")startInteraction();
  }

  function onTwist(){
    if(mode==="tenkyu")startInteraction();
  }

  function onLCD(on){
    if(!on){
      clearTaps();
      clear(idleTimer);idleTimer=undefined;
      interactive=false;

      if(mode==="calendar"&&calendar)calendar.stop();
      if(mode!=="tenkyu"){
        /* Preserve the selected calendar date across LCD power cycles. */
        resetOnWake=true;
      }
      return;
    }

    if(resetOnWake){
      resetOnWake=false;
      startOrbit(false);
    }
    if(mode==="tenkyu"){
      interactive=true;
      try{Bangle.setBacklight(true);}catch(e){}
      armIdle();
    }
  }

  function onButton(){
    if(killed)return;
    cleanup();
    Bangle.showLauncher();
  }

  function armMinute(){
    clear(minuteTimer);
    minuteTimer=setTimeout(function(){
      minuteTimer=undefined;
      if(!killed&&mode==="tenkyu"){drawBase();armMinute();}
    },60000-(Date.now()%60000)+25);
  }

  function cleanup(){
    if(killed)return;
    killed=true;
    stopOrbitTimers();
    if(calendar)calendar.stop();
    removeWidgetRedrawHook();
    try{Bangle.setUI();}catch(e){}
    try{Bangle.removeListener("faceUp",onFaceUp);}catch(e){}
    try{Bangle.removeListener("twist",onTwist);}catch(e){}
    try{Bangle.removeListener("lcdPower",onLCD);}catch(e){}
    try{E.removeListener("kill",cleanup);}catch(e){}
  }

  layoutBodies();
  buildSunCache();
  buildLightingCache();
  buildEarthMapCache();
  buildMoonCache();
  try{Bangle.setUI({mode:"custom",clock:1,touch:onTouch,swipe:onSwipe,btn:onButton});}catch(e){}
  /* Load widgets only after setUI, as required for clock/widget state tracking. */
  try{if(typeof WIDGETS==="undefined")Bangle.loadWidgets();}catch(e){}
  installWidgetRedrawHook();
  Bangle.on("faceUp",onFaceUp);
  Bangle.on("twist",onTwist);
  Bangle.on("lcdPower",onLCD);
  E.on("kill",cleanup);
  try{Bangle.setLocked(false);}catch(e){}
  drawBase();
  armMinute();
  armTime();
})();
