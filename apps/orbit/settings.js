/* orbit 0.04 stable: settings and editable event data. */
(function(back){
  var Storage=require("Storage");
  var C,P,JPI;
  var JPFILE="orbitjp.dat",jpPrefCache=-1,jpMunicipalities;
  var CFG="orbit.json",CAL="orbit.cal.json",EVENTS="orbit.events.json";
  var GPS_ID="orbitsettings";
  var COLORS=["red","yellow","green","blue","cyan","magenta","orange","white","gray","black"];
  var TYPES=["holiday","family","birthday","custom"];
  var TYPE_NAMES=["Holiday","Anniversary","Birthday","Other"];
  var REGIONS=["all","jp","ew","sc","ni"];
  var REGION_NAMES=["All","Japan","England/Wales","Scotland","N. Ireland"];
  var gpsHandler,gpsActive=false,gpsStarted=0,gpsLastDraw=0,gpsLastSats=-1,gpsLastHdop=-1,gpsLastFix;

  function readJSON(name,def){return Storage.readJSON(name,1)||def;}
  function write(name,obj){Storage.writeJSON(name,obj);}

  /* Load place tables lazily and release them when location editing ends. */
  function loadPlaceIndex(){
    if(C&&P)return;
    var d=require("orbitloc");
    C=d.countries;P=d.prefs;JPI=d.jpidx||[];
    d=undefined;
  }
  function releaseMunicipalities(){
    jpPrefCache=-1;
    jpMunicipalities=undefined;
  }
  function releasePlaceData(){
    releaseMunicipalities();
    C=undefined;P=undefined;JPI=undefined;
    try{
      if(typeof Modules!=="undefined"&&Modules.getCached&&
         Modules.getCached().includes("orbitloc"))Modules.removeCached("orbitloc");
    }catch(e){}
  }
  function countryIndex(name){
    for(var i=0;C&&i<C.length;i++)if(C[i][0]===name)return i;
    return -1;
  }
  function prefIndex(name){
    for(var i=0;P&&i<P.length;i++)if(P[i][0]===name)return i;
    return -1;
  }
  function loadMunicipalities(pi){
    loadPlaceIndex();
    pi=Math.max(0,Math.min(P.length-1,pi|0));
    if(jpPrefCache===pi&&jpMunicipalities)return jpMunicipalities;
    releaseMunicipalities();
    var list;
    try{
      var q=JPI[pi];
      if(q)list=JSON.parse(Storage.read(JPFILE,q[0],q[1])||"[]");
    }catch(e){list=undefined;}
    if(!list||!list.length)list=P[pi][1]||[];
    jpPrefCache=pi;jpMunicipalities=list;
    return list;
  }

  function appCfg(){
    var s=readJSON(CFG,{}),changed=false;
    function set(k,v){if(s[k]!==v){s[k]=v;changed=true;}}

    if(!isFinite(s.sunSize))s.sunSize=8;
    if(!isFinite(s.earthSize))s.earthSize=42;
    if(!isFinite(s.moonSize))s.moonSize=15;
    if(!isFinite(s.moonOrbit))s.moonOrbit=62;
    s.sunSize=Math.max(6,Math.min(15,s.sunSize|0));
    s.earthSize=Math.max(40,Math.min(45,s.earthSize|0));
    s.moonSize=Math.max(14,Math.min(16,s.moonSize|0));
    var minOrbit=s.earthSize+s.moonSize+4;
    s.moonOrbit=Math.max(minOrbit,Math.min(70,s.moonOrbit|0));
    s.layoutVersion=2;

    var lat,lon;
    if(s.coordVersion!==2){
      lat=isFinite(s.lat)?+s.lat:(isFinite(s.manualLat)?+s.manualLat:35.694);
      lon=isFinite(s.lon)?+s.lon:(isFinite(s.manualLon)?+s.manualLon:139.754);
      set("coordVersion",2);
    }else{
      lat=isFinite(s.manualLat)?+s.manualLat:35.694;
      lon=isFinite(s.manualLon)?+s.manualLon:139.754;
    }
    set("manualLat",Math.max(-90,Math.min(90,lat)));
    set("manualLon",Math.max(-180,Math.min(180,lon)));
    if(s.lat!==undefined){delete s.lat;changed=true;}
    if(s.lon!==undefined){delete s.lon;changed=true;}

    if(s.locationMode<0||s.locationMode>2||s.locationMode===undefined)s.locationMode=1;
    if(s.viewSide!==0&&s.viewSide!==1)s.viewSide=0;
    if(!s.countryName)s.countryName="Japan";
    if(!isFinite(s.pref))s.pref=12;
    s.pref=Math.max(0,Math.min(46,s.pref|0));
    if(!isFinite(s.municipality))s.municipality=0;
    if(!isFinite(s.place))s.place=0;

    if(changed)write(CFG,s);
    return s;
  }

  function normalizePlaceState(s){
    loadPlaceIndex();
    if(countryIndex(s.countryName)<0)s.countryName="Japan";
    var pi=prefIndex(s.locPref);
    if(pi>=0&&s.countryName==="Japan")s.pref=pi;
    s.pref=Math.max(0,Math.min(P.length-1,s.pref|0));

    if(s.countryName==="Japan"){
      var ml=loadMunicipalities(s.pref),found=-1;
      if(s.placeStateVersion!==1&&s.locName)
        for(var i=0;i<ml.length;i++)if(ml[i][0]===s.locName){found=i;break;}
      if(found>=0)s.municipality=found;
      s.municipality=Math.max(0,Math.min(Math.max(0,ml.length-1),s.municipality|0));
    }else{
      var ci=countryIndex(s.countryName),list=C[ci][1]||[],f=-1;
      if(s.placeStateVersion!==1&&s.locName)
        for(var j=0;j<list.length;j++)if(list[j][0]===s.locName){f=j;break;}
      if(f>=0)s.place=f;
      s.place=Math.max(0,Math.min(Math.max(0,list.length-1),s.place|0));
    }
    s.placeStateVersion=1;
  }

  function calCfg(){
    var c=readJSON(CAL,{});
    if(c.lang!=="ja"&&c.lang!=="en")c.lang="ja";
    if(c.ukRegion!=="ew"&&c.ukRegion!=="sc"&&c.ukRegion!=="ni")c.ukRegion="ew";
    if(!(c.timeout>=15&&c.timeout<=120))c.timeout=30;
    return c;
  }
  function eventDoc(){
    var d=readJSON(EVENTS,{version:1,events:[]});
    if(!Array.isArray(d.events))d={version:1,events:[]};
    return d;
  }
  function pad2(n){return (n<10?"0":"")+n;}
  function dim(y,m){return m===2?(((y%4===0&&y%100!==0)||y%400===0)?29:28):[31,0,31,30,31,30,31,31,30,31,30,31][m-1];}
  function clampDay(y,m,d){return Math.max(1,Math.min(dim(y,m),d|0));}
  function calRegion(c){if(c.lang==="ja")return 0;if(c.ukRegion==="sc")return 2;if(c.ukRegion==="ni")return 3;return 1;}
  function activeRegion(c){return c.lang==="ja"?"jp":c.ukRegion;}
  function setCalRegion(c,v){
    if(v===0)c.lang="ja";
    else{c.lang="en";c.ukRegion=v===2?"sc":(v===3?"ni":"ew");}
    write(CAL,c);
  }
  function colorIndex(v){var i=COLORS.indexOf(v);return i<0?1:i;}
  function typeIndex(v){var i=TYPES.indexOf(v);return i<0?3:i;}
  function regionIndex(v){var i=REGIONS.indexOf(v);return i<0?0:i;}
  function defaultColor(type){return type==="holiday"?"red":type==="birthday"?"magenta":type==="family"?"yellow":"yellow";}

  // ---------- Location ----------
  function selectedPlace(s){
    normalizePlaceState(s);
    var ci=countryIndex(s.countryName);
    if(s.countryName==="Japan"){
      var jl=loadMunicipalities(s.pref);
      return {group:P[s.pref][0],place:jl[s.municipality]};
    }
    var list=C[ci][1]||[];
    return {group:C[ci][0],place:list[s.place]};
  }
  function commitPlace(s){
    var q=selectedPlace(s),p=q.place;
    if(!p)return;
    s.locationMode=0;s.locPref=q.group;s.locName=p[0];
    s.manualLat=p[1];s.manualLon=p[2];
    write(CFG,s);
    var msg=q.group+" / "+p[0]+"\nLat "+Number(s.manualLat).toFixed(3)+"\nLon "+Number(s.manualLon).toFixed(3);
    releasePlaceData();
    E.showAlert(msg,"Location saved").then(main);
  }
  function applyManual(s){
    s.locationMode=1;s.locPref="Manual";s.locName="Custom";
    write(CFG,s);
  }
  function applyGPS(s,fix){
    s.locationMode=2;s.locPref="GPS";s.locName="GPS";
    s.manualLat=Math.max(-90,Math.min(90,+fix.lat));
    s.manualLon=Math.max(-180,Math.min(180,+fix.lon));
    write(CFG,s);
  }
  function stopGPS(){
    if(gpsHandler){try{Bangle.removeListener("GPS",gpsHandler);}catch(e){}gpsHandler=undefined;}
    gpsActive=false;gpsLastFix=undefined;
    try{Bangle.setGPSPower(0,GPS_ID);}catch(e){}
  }
  function gpsBar(sats){
    var n=Math.max(0,Math.min(8,sats|0)),t="[",i;
    for(i=0;i<8;i++)t+=i<n?"#":"-";
    return t+"]";
  }
  function gpsStateText(fix){
    var sats=fix&&isFinite(fix.satellites)?fix.satellites|0:0;
    if(fix&&fix.fix)return "FIX";
    if(sats===0)return "NO SATS";
    if(sats<3)return "SEARCHING";
    if(sats<4)return "ACQUIRING";
    return "LOCKING";
  }
  function gpsElapsed(){
    var sec=Math.max(0,Math.round((Date.now()-gpsStarted)/1000)),m=Math.floor(sec/60),ss=sec%60;
    return (m<10?"0":"")+m+":"+(ss<10?"0":"")+ss;
  }
  function gpsLocationText(s){
    return "Lat "+Number(s.manualLat).toFixed(4)+"\nLon "+Number(s.manualLon).toFixed(4);
  }
  function showGPSProgress(s,force){
    if(!gpsActive)return;
    var fix=gpsLastFix||{},sats=isFinite(fix.satellites)?fix.satellites|0:0;
    var hdop=isFinite(fix.hdop)&&fix.hdop>0?fix.hdop:0,now=Date.now();
    var hdChanged=(hdop&&gpsLastHdop>0)?Math.abs(hdop-gpsLastHdop)>=0.5:(hdop!==gpsLastHdop);
    if(!force&&sats===gpsLastSats&&!hdChanged&&now-gpsLastDraw<10000)return;
    gpsLastSats=sats;gpsLastHdop=hdop;gpsLastDraw=now;
    E.showMenu({
      "":{title:"GPS input"},
      "< Cancel":function(){stopGPS();gpsMenu(s);},
      "State":{value:0,min:0,max:0,format:function(){return gpsStateText(fix);}},
      "Satellites":{value:0,min:0,max:0,format:function(){return sats+" "+gpsBar(sats);}},
      "HDOP":{value:0,min:0,max:0,format:function(){return hdop?hdop.toFixed(1):"--";}},
      "Elapsed":{value:0,min:0,max:0,format:function(){return gpsElapsed();}}
    });
  }
  function startGPS(s){
    stopGPS();releasePlaceData();
    /* Keep the saved location source unchanged until a valid GPS fix arrives. */
    gpsStarted=Date.now();gpsLastDraw=0;gpsLastSats=-1;gpsLastHdop=-1;gpsLastFix={};
    gpsHandler=function(fix){
      if(!gpsActive||!fix)return;
      gpsLastFix=fix;
      if(fix.fix&&isFinite(fix.lat)&&isFinite(fix.lon)){
        applyGPS(s,fix);stopGPS();
        try{Bangle.buzz(300);}catch(e){}
        E.showAlert("GPS location saved\n"+gpsLocationText(s),"orbit GPS").then(main);
        return;
      }
      showGPSProgress(s,false);
    };
    Bangle.on("GPS",gpsHandler);gpsActive=true;
    try{Bangle.setGPSPower(1,GPS_ID);}
    catch(e){
      stopGPS();
      E.showAlert("Could not start GPS","orbit GPS").then(function(){gpsMenu(s);});
      return;
    }
    showGPSProgress(s,true);
  }
  function locationInfo(s,next){
    var prefix=s.locationMode===0?(s.locPref||"Place"):(s.locationMode===2?"GPS":"Manual");
    E.showAlert(prefix+" / "+(s.locName||"")+
      "\nLat "+Number(s.manualLat).toFixed(3)+
      "\nLon "+Number(s.manualLon).toFixed(3),"orbit location")
      .then(next||function(){locationMenu(s);});
  }

  function placeMenu(s){
    stopGPS();
    normalizePlaceState(s);
    var ci=countryIndex(s.countryName);
    var m={"":{title:"Place name"},"< Back":function(){releasePlaceData();locationMenu(s);},
      "Country":{value:ci,min:0,max:C.length-1,step:1,
        format:function(v){return C[v][0];},
        onchange:function(v){
          s.countryName=C[v][0];s.place=0;s.municipality=0;
          releaseMunicipalities();
          setTimeout(function(){placeMenu(s);},10);
        }
      }
    };

    if(s.countryName==="Japan"){
      m["Prefecture"]={value:s.pref,min:0,max:P.length-1,step:1,
        format:function(v){return P[v][0];},
        onchange:function(v){
          s.pref=v;s.municipality=0;releaseMunicipalities();
          setTimeout(function(){placeMenu(s);},10);
        }
      };
      var ml=loadMunicipalities(s.pref);
      s.municipality=Math.max(0,Math.min(ml.length-1,s.municipality|0));
      m["Municipality"]={value:s.municipality,min:0,max:ml.length-1,step:1,
        format:function(v){return ml[v][0];},
        onchange:function(v){s.municipality=v;}
      };
    }else{
      var list=C[ci][1]||[];
      if(list.length>1){
        s.place=Math.max(0,Math.min(list.length-1,s.place|0));
        m["City"]={value:s.place,min:0,max:list.length-1,step:1,
          format:function(v){return list[v][0];},
          onchange:function(v){s.place=v;}
        };
      }else{
        s.place=0;
        m["Capital"]={value:0,min:0,max:0,format:function(){return list[0][0];}};
      }
    }

    m["Use place"]=function(){commitPlace(s);};
    E.showMenu(m);
  }

  function manualMenu(s){
    stopGPS();releasePlaceData();
    var m={"":{title:"Manual"},"< Back":function(){locationMenu(s);},
      "Latitude":{value:s.manualLat,min:-90,max:90,step:0.001,
        format:function(v){return v.toFixed(3);},
        onchange:function(v){s.manualLat=v;applyManual(s);}
      },
      "Longitude":{value:s.manualLon,min:-180,max:180,step:0.001,
        format:function(v){return v.toFixed(3);},
        onchange:function(v){s.manualLon=v;applyManual(s);}
      },
      "Current coords":function(){locationInfo(s,function(){manualMenu(s);});}
    };
    E.showMenu(m);
  }

  function gpsMenu(s){
    releasePlaceData();
    var m={"":{title:"GPS"},"< Back":function(){stopGPS();locationMenu(s);},
      "Get GPS fix":function(){startGPS(s);},
      "Current coords":function(){locationInfo(s,function(){gpsMenu(s);});},
      "GPS power":{value:0,min:0,max:0,format:function(){return gpsActive?"On":"Off";}}
    };
    E.showMenu(m);
  }

  function locationMenu(s){
    stopGPS();releasePlaceData();
    if(!s)s=appCfg();
    var m={"":{title:"Location"},"< Back":main,
      "Place name":function(){placeMenu(s);},
      "Manual":function(){manualMenu(s);},
      "GPS":function(){gpsMenu(s);},
      "Current coords":function(){locationInfo(s,function(){locationMenu(s);});}
    };
    E.showMenu(m);
  }


  // ---------- Holiday cache ----------
  function cacheInfo(){
    var out={jp:0,ew:0,sc:0,ni:0,total:0};
    Storage.list(/^orh[0-9]+(jp|ew|sc|ni)[0-9][0-9][0-9][0-9]$/).forEach(function(f){
      var m=/^orh[0-9]+(jp|ew|sc|ni)[0-9][0-9][0-9][0-9]$/.exec(f);
      if(m){out[m[1]]++;out.total++;}
    });
    return out;
  }
  function clearCache(region,cb){
    var n=0;
    Storage.list(/^orh[0-9]+(jp|ew|sc|ni)[0-9][0-9][0-9][0-9]$/).forEach(function(f){
      var m=/^orh[0-9]+(jp|ew|sc|ni)[0-9][0-9][0-9][0-9]$/.exec(f);
      if(m&&(!region||m[1]===region)){Storage.erase(f);n++;}
    });
    E.showAlert("Deleted "+n,"Holiday cache").then(cb);
  }
  function cacheMenu(){
    var n=cacheInfo(),m={"":{title:"Holiday cache"},"< Back":main};
    [["jp","Japan",n.jp],["ew","England/Wales",n.ew],["sc","Scotland",n.sc],["ni","N. Ireland",n.ni]].forEach(function(x){
      m[x[1]+" ("+x[2]+")"]=function(){E.showPrompt("Delete "+x[1]+" cache?").then(function(ok){if(ok)clearCache(x[0],cacheMenu);else cacheMenu();});};
    });
    m["All ("+n.total+")"]=function(){E.showPrompt("Delete all holiday cache?").then(function(ok){if(ok)clearCache(undefined,cacheMenu);else cacheMenu();});};
    E.showMenu(m);
  }

  // ---------- Personal/exceptional events ----------
  function parseEventDate(e){
    var now=new Date(),y=now.getFullYear(),m=now.getMonth()+1,d=now.getDate();
    if(typeof e.date==="string"){
      var p=e.date.split("-");
      if(p.length===3){y=parseInt(p[0],10)||y;m=parseInt(p[1],10)||m;d=parseInt(p[2],10)||d;}
      else if(p.length===2){m=parseInt(p[0],10)||m;d=parseInt(p[1],10)||d;}
    }
    d=clampDay(y,m,d);return {y:y,m:m,d:d};
  }
  function writeEventDate(e,p){
    p.d=clampDay(p.y,p.m,p.d);
    e.date=e.repeat==="yearly"?(pad2(p.m)+"-"+pad2(p.d)):(p.y+"-"+pad2(p.m)+"-"+pad2(p.d));
  }
  function eventTitle(e,i){
    var label=e.label||TYPE_NAMES[typeIndex(e.type)],date=e.date||"range";
    return (i+1)+" "+date+" "+label;
  }
  function hasTextInput(){try{return !!require("textinput");}catch(e){return false;}}
  function editEvent(i){
    var doc=eventDoc(),e=doc.events[i];
    if(!e){eventsMenu();return;}
    if(!e.type)e.type="custom";if(!e.region)e.region="all";if(!e.color)e.color=defaultColor(e.type);
    if(e.blink===undefined)e.blink=false;
    var isRange=!!(e.from&&e.to),p=parseEventDate(e);
    var menu={"":{title:e.label||TYPE_NAMES[typeIndex(e.type)]},"< Back":function(){write(EVENTS,doc);eventsMenu();}};
    if(!isRange){
      menu["Repeat"]={value:e.repeat==="yearly",format:function(v){return v?"Yearly":"Once";},onchange:function(v){
        e.repeat=v?"yearly":undefined;writeEventDate(e,p);write(EVENTS,doc);setTimeout(function(){editEvent(i);},10);
      }};
      if(e.repeat!=="yearly")menu["Year"]={value:p.y,min:2020,max:2100,step:1,onchange:function(v){p.y=v;writeEventDate(e,p);write(EVENTS,doc);}};
      menu["Month"]={value:p.m,min:1,max:12,step:1,wrap:true,onchange:function(v){p.m=v;p.d=clampDay(p.y,p.m,p.d);writeEventDate(e,p);write(EVENTS,doc);}};
      menu["Day"]={value:p.d,min:1,max:31,step:1,wrap:true,onchange:function(v){p.d=clampDay(p.y,p.m,v);writeEventDate(e,p);write(EVENTS,doc);}};
    }else menu["Range"]={value:0,min:0,max:0,format:function(){return String(e.from)+".."+String(e.to);}};
    menu["Type"]={value:typeIndex(e.type),min:0,max:TYPES.length-1,step:1,format:function(v){return TYPE_NAMES[v];},onchange:function(v){
      e.type=TYPES[v];e.color=defaultColor(e.type);write(EVENTS,doc);setTimeout(function(){editEvent(i);},10);
    }};
    menu["Region"]={value:regionIndex(e.region),min:0,max:REGIONS.length-1,step:1,format:function(v){return REGION_NAMES[v];},onchange:function(v){e.region=REGIONS[v];write(EVENTS,doc);}};
    menu["Color"]={value:colorIndex(e.color),min:0,max:COLORS.length-1,step:1,format:function(v){return COLORS[v];},onchange:function(v){e.color=COLORS[v];write(EVENTS,doc);}};
    menu["Blink"]={value:!!e.blink,format:function(v){return v?"On":"Off";},onchange:function(v){e.blink=!!v;write(EVENTS,doc);}};
    if(hasTextInput())menu["Label"]=function(){
      require("textinput").input({text:e.label||""}).then(function(t){if(t!==undefined)e.label=t;write(EVENTS,doc);editEvent(i);},function(){editEvent(i);});
    };
    menu["Delete"]=function(){
      E.showPrompt("Delete "+(e.label||"event")+"?").then(function(ok){if(ok){doc.events.splice(i,1);write(EVENTS,doc);eventsMenu();}else editEvent(i);});
    };
    E.showMenu(menu);
  }
  function addEvent(kind){
    var doc=eventDoc(),now=new Date(),c=calCfg();
    var e={
      date:kind==="holiday"?(now.getFullYear()+"-"+pad2(now.getMonth()+1)+"-"+pad2(now.getDate())):(pad2(now.getMonth()+1)+"-"+pad2(now.getDate())),
      repeat:kind==="holiday"?undefined:"yearly",
      type:kind==="holiday"?"holiday":"family",
      label:kind==="holiday"?"Holiday":"Anniversary",
      region:kind==="holiday"?activeRegion(c):"all",
      color:kind==="holiday"?"red":"yellow",
      blink:kind==="holiday"?false:true
    };
    doc.events.push(e);write(EVENTS,doc);editEvent(doc.events.length-1);
  }
  function eventsMenu(){
    var doc=eventDoc(),m={"":{title:"Events"},"< Back":main,
      "Add anniversary":function(){addEvent("family");},
      "Add holiday":function(){addEvent("holiday");}
    };
    for(var i=0;i<doc.events.length;i++)(function(idx){
      var key=eventTitle(doc.events[idx],idx);m[key]=function(){editEvent(idx);};
    })(i);
    E.showMenu(m);
  }

  function leave(){
    stopGPS();releasePlaceData();
    try{E.removeListener("kill",onKill);}catch(e){}
    back();
  }
  function exitToOrbit(){
    stopGPS();releasePlaceData();
    try{E.removeListener("kill",onKill);}catch(e){}
    load("orbit.app.js");
  }
  function onKill(){stopGPS();releasePlaceData();}

  function main(){
    stopGPS();releasePlaceData();
    var s=appCfg(),c=calCfg();
    var minOrbit=s.earthSize+s.moonSize+4;
    if(s.moonOrbit<minOrbit){s.moonOrbit=minOrbit;write(CFG,s);}
    var m={"":{title:"orbit"},"< Back":leave,
      "Exit to orbit":exitToOrbit,
      "Location":locationMenu,
      "View side":{value:s.viewSide,min:0,max:1,step:1,
        format:function(v){return v?"South":"North";},
        onchange:function(v){s.viewSide=v?1:0;write(CFG,s);}
      },
      "Sun size":{value:s.sunSize,min:6,max:15,step:1,onchange:function(v){s.sunSize=v;write(CFG,s);}},
      "Earth size":{value:s.earthSize,min:40,max:45,step:1,onchange:function(v){
        s.earthSize=v;var mn=s.earthSize+s.moonSize+4;if(s.moonOrbit<mn)s.moonOrbit=mn;
        write(CFG,s);setTimeout(main,10);
      }},
      "Moon size":{value:s.moonSize,min:14,max:16,step:1,onchange:function(v){
        s.moonSize=v;var mn=s.earthSize+s.moonSize+4;if(s.moonOrbit<mn)s.moonOrbit=mn;
        write(CFG,s);setTimeout(main,10);
      }},
      "Moon orbit":{value:s.moonOrbit,min:minOrbit,max:70,step:1,onchange:function(v){s.moonOrbit=v;write(CFG,s);}},
      "Calendar region":{value:calRegion(c),min:0,max:3,step:1,format:function(v){return ["Japan","England/Wales","Scotland","N. Ireland"][v];},onchange:function(v){setCalRegion(c,v);}},
      "Auto return":{value:c.timeout,min:15,max:120,step:15,format:function(v){return v+" s";},onchange:function(v){c.timeout=v;write(CAL,c);}},
      "Events":eventsMenu,
      "Holiday cache":cacheMenu
    };
    E.showMenu(m);
  }

  // Release any stale settings-owned GPS request on entry.
  try{Bangle.setGPSPower(0,GPS_ID);}catch(e){}
  E.on("kill",onKill);
  main();
})