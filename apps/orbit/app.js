/* orbit 0.04 stable */
(function(){
  var W=g.getWidth(),H=g.getHeight();
  var Storage=require("Storage"),CFGFILE="orbit.json";
  var cfg=Storage.readJSON(CFGFILE,1)||{};
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
    if(changed)try{Storage.writeJSON(CFGFILE,cfg);}catch(e){}
  })();
  /* GPS is settings-only; release any stale settings-owned request. */
  try{Bangle.setGPSPower(0,"orbitsettings");}catch(e){}
  var calModule,calendar;
  try{
    var calSource=Storage.read("orbit.cal.js");
    if(calSource){calModule=eval(calSource);calendar=calModule.create();}
    calSource=undefined;
  }catch(calErr){calModule=undefined;calendar=undefined;}
  var BLACK=0x0000,WHITE=0xFFFF,NAVY=0x000F,DARKBLUE=0x0008,CYAN=0x07FF,YELLOW=0xFFE0,ORANGE=0xFD20,RED=0xF800,GREEN=0x07E0;
  var busy=false,killed=false,minuteTimer,secondTimer,idleTimer,tapTimer,unlockTimer;
  var mode="orbit",interactive=true,tapCount=0,resetOnWake=false;
  var selectedDayOffset=0,hasSelectedDate=false;
  var colonX=0,colonVisible=true,batteryCharging=false;
  var BATLEFT=138;
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
  /* Copy only location fields needed by the clock; place tables stay unloaded. */
  var LOCMODE=(cfg.locationMode===0?0:(cfg.locationMode===2?2:1));
  var LOCNAME=(LOCMODE===0?(cfg.locName||cfg.locPref||"Place"):"");
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

  function dayOfYear(d){
    var md=[0,31,59,90,120,151,181,212,243,273,304,334];
    var n=md[d.getMonth()]+d.getDate();
    var y=d.getFullYear();
    if(d.getMonth()>1 && ((y%4===0 && y%100!==0)||y%400===0))n++;
    return n;
  }

  function solarPosition(d,lat,lon){
    var n=dayOfYear(d);
    var hour=d.getHours()+d.getMinutes()/60+d.getSeconds()/3600;
    var g0=2*Math.PI/365*(n-1+(hour-12)/24);
    var eq=229.18*(0.000075+0.001868*Math.cos(g0)-0.032077*Math.sin(g0)
      -0.014615*Math.cos(2*g0)-0.040849*Math.sin(2*g0));
    var dec=0.006918-0.399912*Math.cos(g0)+0.070257*Math.sin(g0)
      -0.006758*Math.cos(2*g0)+0.000907*Math.sin(2*g0)
      -0.002697*Math.cos(3*g0)+0.00148*Math.sin(3*g0);
    var tz=0;
    try{tz=-d.getTimezoneOffset()/60;}catch(e){}
    var tst=hour*60+eq+4*lon-60*tz;
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
    try{return solarPosition(virtualDate(),TESTLAT,TESTLON);}
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

  function drawBoldSpaced(str,x,y,advance,color){
    var xx=x;
    g.setBgColor(WHITE).setColor(color).setFont("12x20").setFontAlign(-1,-1);
    for(var i=0;i<str.length;i++){
      if(str[i]===" "){xx+=7;continue;}
      g.drawString(str[i],xx,y);
      g.drawString(str[i],xx+1,y);
      xx+=advance;
    }
    return xx;
  }

  function isCharging(){
    try{return !!Bangle.isCharging();}catch(e){return false;}
  }

  function drawBattery(show){
    var bat=E.getBattery(),txt=""+bat;
    g.setColor(WHITE).fillRect(BATLEFT,0,W-1,23);
    if(!show)return;
    g.setBgColor(WHITE)
      .setColor(bat<=20?RED:GREEN)
      .setFont("12x20")
      .setFontAlign(1,-1);
    g.drawString(txt,W-1,2);
    g.drawString(txt,W-2,2);
  }

  function drawHeader(){
    var d=virtualDate();
    var pre=pad(d.getMonth()+1)+"/"+pad(d.getDate())+" "+pad(d.getHours());
    var post=pad(d.getMinutes());
    var x=1,adv=13;

    g.setColor(WHITE).fillRect(0,0,W-1,23);

    x=drawBoldSpaced(pre,x,2,adv,BLACK);
    colonX=x;
    colonVisible=(d.getSeconds()%2)===0;
    if(colonVisible){
      g.setBgColor(WHITE).setColor(BLACK).setFont("12x20").setFontAlign(-1,-1);
      g.drawString(":",colonX,2);
      g.drawString(":",colonX+1,2);
    }
    x=colonX+adv;
    drawBoldSpaced(post,x,2,adv,BLACK);

    batteryCharging=isCharging();
    drawBattery(!batteryCharging||colonVisible);
  }

  function drawColon(show){
    if(killed||busy||mode!=="orbit")return;
    g.setColor(WHITE).fillRect(colonX,2,colonX+12,21);
    if(show){
      g.setBgColor(WHITE).setColor(BLACK).setFont("12x20").setFontAlign(-1,-1);
      g.drawString(":",colonX,2);
      g.drawString(":",colonX+1,2);
    }
    colonVisible=show;

    var charging=isCharging();
    if(charging)drawBattery(show);
    else if(batteryCharging)drawBattery(true);
    batteryCharging=charging;
  }

  function armSecond(){
    clear(secondTimer);
    secondTimer=setTimeout(function(){
      secondTimer=undefined;
      if(!killed&&mode==="orbit"){
        var show=(new Date().getSeconds()%2)===0;
        if(show!==colonVisible)drawColon(show);
        armSecond();
      }
    },1000-(Date.now()%1000)+20);
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
      var plen=EARTHR+8;
      var ar=a-rs.h0,as=a+rs.h0;
      g.setColor(0xF81F);
      g.drawLine(x,y,
        Math.round(px+Math.cos(ar)*plen),
        Math.round(py+Math.sin(ar)*plen));
      g.drawLine(x,y,
        Math.round(px+Math.cos(as)*plen),
        Math.round(py+Math.sin(as)*plen));
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
    drawObserver(sol);
    var moon=drawMoon();
    drawLocationStatus(moon);
    drawHeader();
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
    clear(secondTimer);secondTimer=undefined;
    clear(idleTimer);idleTimer=undefined;
    clearTaps();
  }

  function armIdle(){
    clear(idleTimer);
    if(mode!=="orbit"||!interactive)return;
    idleTimer=setTimeout(goIdle,8000);
  }

  function startInteraction(){
    if(killed||mode!=="orbit")return;
    interactive=true;
    try{Bangle.setLocked(false);}catch(e){}
    try{Bangle.setBacklight(true);}catch(e){}
    armIdle();
  }

  function goIdle(){
    clear(idleTimer);idleTimer=undefined;
    clearTaps();
    interactive=false;
    try{Bangle.setBacklight(false);}catch(e){}
    try{Bangle.setLocked(false);}catch(e){}
  }

  function startOrbit(keepInteractive){
    if(killed)return;
    if(calendar&&calendar.isActive())calendar.stop();
    mode="orbit";
    busy=false;
    drawBase();
    armMinute();
    armSecond();
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
    if(killed||mode!=="orbit")return;
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
      mode="orbit";
      busy=false;
      startOrbit(true);
    }
  }

  function openSettings(){
    if(killed||mode!=="orbit")return;
    stopOrbitTimers();
    var src=Storage.read("orbit.settings.js");
    if(!src){startOrbit(true);return;}
    cleanup();
    try{
      var fn=eval(src);
      if(typeof fn==="function")fn(function(){load("orbit.app.js");});
      else load("orbit.app.js");
    }catch(e){
      load("orbit.app.js");
    }
  }

  function onTouch(button,xy){
    if(killed)return;
    if(mode==="calendar"){
      if(calendar)calendar.touch(xy);
      return;
    }
    if(mode!=="orbit"||busy)return;
    try{if(!Bangle.isLCDOn())return;}catch(e){}

    tapCount++;
    if(tapCount===1){
      clear(tapTimer);
      tapTimer=setTimeout(function(){
        tapTimer=undefined;
        if(killed||mode!=="orbit")return;
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
    if(up&&mode==="orbit")startInteraction();
  }

  function onLCD(on){
    if(!on){
      clearTaps();
      clear(idleTimer);idleTimer=undefined;
      interactive=false;
      try{Bangle.setLocked(false);}catch(e){}

      if(mode==="calendar"&&calendar)calendar.stop();
      if(mode!=="orbit"){
        /* Preserve the selected calendar date across LCD power cycles. */
        resetOnWake=true;
      }
      return;
    }

    if(resetOnWake){
      resetOnWake=false;
      startOrbit(false);
    }
  }

  function onLock(isLocked){
    if(!isLocked||killed)return;
    clear(unlockTimer);
    unlockTimer=setTimeout(function(){
      unlockTimer=undefined;
      if(!killed)try{Bangle.setLocked(false);}catch(e){}
    },0);
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
      if(!killed&&mode==="orbit"){drawBase();armMinute();}
    },60000-(Date.now()%60000)+25);
  }

  function cleanup(){
    if(killed)return;
    killed=true;
    stopOrbitTimers();
    clear(unlockTimer);unlockTimer=undefined;
    if(calendar)calendar.stop();
    try{Bangle.setUI();}catch(e){}
    try{Bangle.removeListener("faceUp",onFaceUp);}catch(e){}
    try{Bangle.removeListener("lcdPower",onLCD);}catch(e){}
    try{Bangle.removeListener("lock",onLock);}catch(e){}
    try{E.removeListener("kill",cleanup);}catch(e){}
  }

  layoutBodies();
  buildSunCache();
  buildLightingCache();
  buildEarthMapCache();
  buildMoonCache();
  try{Bangle.setUI({mode:"custom",touch:onTouch,swipe:onSwipe,btn:onButton});}catch(e){}
  /* Load widgets only after setUI, as required for clock/widget state tracking. */
  try{if(typeof WIDGETS==="undefined")Bangle.loadWidgets();}catch(e){}
  Bangle.on("faceUp",onFaceUp);
  Bangle.on("lcdPower",onLCD);
  Bangle.on("lock",onLock);
  E.on("kill",cleanup);
  try{Bangle.setBacklight(false);}catch(e){}
  try{Bangle.setLocked(false);}catch(e){}
  drawBase();
  armMinute();
  armSecond();
})();
