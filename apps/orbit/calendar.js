/* orbit 0.04 stable: integrated five-week calendar module. */
(function(){
  var Storage=require("Storage");
  var CFG_FILE="orbit.cal.json";
  var EVENT_FILE="orbit.events.json";
  var HOL_CACHE_VER=1,HOL_BYTES=46,HOL_RAM_MAX=2;
  function cacheFileParts(f){
    var m=/^orh([0-9]+)(jp|ew|sc|ni)([0-9][0-9][0-9][0-9])$/.exec(f);
    return m?{ver:parseInt(m[1],10),region:m[2],year:parseInt(m[3],10)}:undefined;
  }
  function listHolidayCaches(){
    var out={jp:0,ew:0,sc:0,ni:0,total:0};
    try{
      Storage.list(/^orh[0-9]+(jp|ew|sc|ni)[0-9][0-9][0-9][0-9]$/).forEach(function(f){
        var p=cacheFileParts(f);if(!p)return;
        out[p.region]++;out.total++;
      });
    }catch(e){}
    return out;
  }
  function clearHolidayCaches(region){
    var n=0;
    try{
      Storage.list(/^orh[0-9]+(jp|ew|sc|ni)[0-9][0-9][0-9][0-9]$/).forEach(function(f){
        var p=cacheFileParts(f);if(!p)return;
        if(region===undefined||p.region===region){Storage.erase(f);n++;}
      });
    }catch(e){}
    return n;
  }


  function normalizeConfig(c){
    c=c||{};
    if(c.lang!=="ja"&&c.lang!=="en")c.lang="ja";
    if(c.ukRegion!=="ew"&&c.ukRegion!=="sc"&&c.ukRegion!=="ni")c.ukRegion="ew";
    if(!(c.timeout>=15&&c.timeout<=120))c.timeout=30;
    return c;
  }
  function readConfig(){
    var c=Storage.readJSON(CFG_FILE,1);
    if(!c){
      var old=Storage.readJSON("fivewcal.json",1)||{};
      c=normalizeConfig({lang:old.lang,ukRegion:old.ukRegion,timeout:old.timeout});
      Storage.writeJSON(CFG_FILE,c);
    }
    return normalizeConfig(c);
  }
  function writeConfig(c){Storage.writeJSON(CFG_FILE,normalizeConfig(c));}
  function readExtraEventDoc(){
    var d=Storage.readJSON(EVENT_FILE,1);
    if(!d||!Array.isArray(d.events)){
      d={version:1,events:[]};
      try{Storage.writeJSON(EVENT_FILE,d);}catch(e){}
    }
    return d;
  }
  function extraEventCount(){
    var d=readExtraEventDoc();
    return d.events.length;
  }

  function create(){
    var W=g.getWidth(),H=g.getHeight();
    var BLACK=0x0000,WHITE=0xFFFF,BLUE=0x001F,RED=0xF800,GREEN=0x07E0,YELLOW=0xFFE0,CYAN=0x07FF,MAGENTA=0xF81F,ORANGE=0xFD20,GRAY=0x4208;
    var cfg,today,pageStart,selected;
    var active=false,onReturn,onSelect,startTapMs,firstTapMs;
    var tapTimer,lastXY;
    var TAP_WINDOW=400;
    var blinkTimer,blinkWhite=true,autoTimer;
    var holidayFlags=new Uint8Array(35),dayNums=new Uint8Array(35),monthNums=new Uint8Array(35),yearNums=new Uint16Array(35),doyNums=new Uint16Array(35),todayIndex=-1,lastCellPrepMs=0;
    var eventFlags=new Uint8Array(35),eventBlinkFlags=new Uint8Array(35),eventColors=new Uint16Array(35);
    var extraEvents=[],eventBlinkTimer,eventBlinkPhase=true;
    var holidayTimer,holidayToken=0,lastHolidayCalcMs=0,lastHolidayDrawMs=0;
    var holRam=[],primeTimer,primeQueue,primePos=0;
    var cellX1=new Int16Array(7),cellX2=new Int16Array(7),cellY1=new Int16Array(5),cellY2=new Int16Array(5);
    var weekdayImgs,weekdayPal;

    function midnight(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
    function copyDate(d){return d?new Date(d.getFullYear(),d.getMonth(),d.getDate()):undefined;}
    function addDays(d,n){var x=copyDate(d);x.setDate(x.getDate()+n);return x;}
    function mondayOf(d){var x=copyDate(d);x.setDate(x.getDate()-((x.getDay()+6)%7));return x;}
    function civilDay(y,m,d){
      y-=m<=2?1:0;
      var era=Math.floor(y/400),yoe=y-era*400;
      var mp=m+(m>2?-3:9);
      var doy=Math.floor((153*mp+2)/5)+d-1;
      var doe=yoe*365+Math.floor(yoe/4)-Math.floor(yoe/100)+doy;
      return era*146097+doe-719468;
    }
    function dayNumber(d){return civilDay(d.getFullYear(),d.getMonth()+1,d.getDate());}
    function dowYMD(y,m,d){var q=(civilDay(y,m,d)+4)%7;return q<0?q+7:q;}
    function leap(y){return (y%4===0&&y%100!==0)||y%400===0;}
    function dim(y,m){return m===2?(leap(y)?29:28):([31,0,31,30,31,30,31,31,30,31,30,31][m-1]);}
    function pad2(n){return (n<10?"0":"")+n;}
    function nthMonday(y,m,n){return 1+((8-dowYMD(y,m,1))%7)+7*(n-1);}
    function lastMonday(y,m){var n=dim(y,m);return n-((dowYMD(y,m,n)+6)%7);}
    function vernal(y){return Math.floor(20.8431+0.242194*(y-1980)-Math.floor((y-1980)/4));}
    function autumn(y){return Math.floor(23.2488+0.242194*(y-1980)-Math.floor((y-1980)/4));}
    var MONTH_START=[0,31,59,90,120,151,181,212,243,273,304,334];
    function doyYMD(y,m,d){return MONTH_START[m-1]+d-1+((m>2&&leap(y))?1:0);}
    function bitGet(bits,n){return !!(bits[n>>3]&(1<<(n&7)));}
    function bitSet(bits,n){bits[n>>3]|=1<<(n&7);}
    function setYMD(bits,y,m,d){bitSet(bits,doyYMD(y,m,d));}
    function shiftedYMD(y,m,d,delta){
      while(delta>0){d++;if(d>dim(y,m)){d=1;m++;if(m>12){m=1;y++;}}delta--;}
      while(delta<0){d--;if(d<1){m--;if(m<1){m=12;y--;}d=dim(y,m);}delta++;}
      return [y,m,d];
    }
    function setShifted(bits,y,m,d,delta){var q=shiftedYMD(y,m,d,delta);if(q[0]===y)setYMD(bits,y,q[1],q[2]);}
    function setObservedFixed(bits,y,m,d){
      var w=dowYMD(y,m,d);
      if(w===6)setShifted(bits,y,m,d,2);
      else if(w===0)setShifted(bits,y,m,d,1);
      else setYMD(bits,y,m,d);
    }
    function setChristmas(bits,y){
      var w25=dowYMD(y,12,25),w26=dowYMD(y,12,26);
      if(w25===6||w25===0)setYMD(bits,y,12,27);else setYMD(bits,y,12,25);
      if(w26===6||w26===0)setYMD(bits,y,12,28);else setYMD(bits,y,12,26);
    }
    /* Intentional coupling: Japanese display -> Japan holidays.
       English display -> selected UK region (EW/Scotland/Northern Ireland). */
    function holRegion(){return cfg.lang==="ja"?"jp":cfg.ukRegion;}
    function holFile(region,year){return "orh"+HOL_CACHE_VER+region+year;}
    function bitsToString(bits){
      var s="";for(var i=0;i<HOL_BYTES;i++)s+=String.fromCharCode(bits[i]);return s;
    }
    function stringToBits(s){
      if(!s||s.length!==HOL_BYTES)return undefined;
      var b=new Uint8Array(HOL_BYTES);
      for(var i=0;i<HOL_BYTES;i++)b[i]=s.charCodeAt(i)&255;
      return b;
    }
    function ramKey(region,year){return region+year;}
    function ramGet(region,year){
      var k=ramKey(region,year);
      for(var i=0;i<holRam.length;i++)if(holRam[i].k===k)return holRam[i].b;
    }
    function ramPut(region,year,bits){
      var k=ramKey(region,year),i;
      for(i=0;i<holRam.length;i++)if(holRam[i].k===k){holRam[i].b=bits;return bits;}
      holRam.push({k:k,b:bits});
      if(holRam.length>HOL_RAM_MAX)holRam.shift();
      return bits;
    }
    function loadHolidayBits(region,year){
      var b=ramGet(region,year);if(b)return b;
      b=stringToBits(Storage.read(holFile(region,year)));
      return b?ramPut(region,year,b):undefined;
    }
    function saveHolidayBits(region,year,bits){
      try{Storage.write(holFile(region,year),bitsToString(bits));}catch(e){}
      return ramPut(region,year,bits);
    }
    function setCommonUK(bits,y){
      if(y===2011)setYMD(bits,y,4,29);
      if(y===2022)setYMD(bits,y,9,19);
      if(y===2023)setYMD(bits,y,5,8);
    }
    function setEarlyMay(bits,y){
      if(y===2020)setYMD(bits,y,5,8);
      else setYMD(bits,y,5,nthMonday(y,5,1));
    }
    function setSpring(bits,y){
      if(y===2002){setYMD(bits,y,6,3);setYMD(bits,y,6,4);}
      else if(y===2012){setYMD(bits,y,6,4);setYMD(bits,y,6,5);}
      else if(y===2022){setYMD(bits,y,6,2);setYMD(bits,y,6,3);}
      else setYMD(bits,y,5,lastMonday(y,5));
    }
    function setEaster(bits,y,withMonday){
      var e=easterSunday(y),gf=addDays(e,-2);
      setYMD(bits,y,gf.getMonth()+1,gf.getDate());
      if(withMonday){var em=addDays(e,1);setYMD(bits,y,em.getMonth()+1,em.getDate());}
    }
    function generateJapanBits(y){
      var base=new Uint8Array(HOL_BYTES),bits=new Uint8Array(HOL_BYTES);
      var days=leap(y)?366:365,i;

      if(y>=1949){
        setYMD(base,y,1,1);
        if(y>=2000)setYMD(base,y,1,nthMonday(y,1,2));else setYMD(base,y,1,15);
        if(y>=1967)setYMD(base,y,2,11);
        if(y>=2020)setYMD(base,y,2,23);
        setYMD(base,y,3,vernal(y));
        setYMD(base,y,4,29);
        setYMD(base,y,5,3);
        if(y>=2007)setYMD(base,y,5,4);
        setYMD(base,y,5,5);

        if(y===2020)setYMD(base,y,7,23);
        else if(y===2021)setYMD(base,y,7,22);
        else if(y>=2003)setYMD(base,y,7,nthMonday(y,7,3));
        else if(y>=1996)setYMD(base,y,7,20);

        if(y===2020)setYMD(base,y,8,10);
        else if(y===2021)setYMD(base,y,8,8);
        else if(y>=2016)setYMD(base,y,8,11);

        if(y>=2003)setYMD(base,y,9,nthMonday(y,9,3));
        else if(y>=1966)setYMD(base,y,9,15);
        setYMD(base,y,9,autumn(y));

        if(y===2020)setYMD(base,y,7,24);
        else if(y===2021)setYMD(base,y,7,23);
        else if(y>=2000)setYMD(base,y,10,nthMonday(y,10,2));
        else if(y>=1966)setYMD(base,y,10,10);

        setYMD(base,y,11,3);
        setYMD(base,y,11,23);
        if(y>=1989&&y<=2018)setYMD(base,y,12,23);
        if(y===2019){setYMD(base,y,5,1);setYMD(base,y,10,22);}
      }

      for(i=0;i<HOL_BYTES;i++)bits[i]=base[i];

      if(y>=1986){
        for(i=1;i<days-1;i++)
          if(!bitGet(base,i)&&bitGet(base,i-1)&&bitGet(base,i+1))bitSet(bits,i);
      }
      if(y>=1973){
        var jan1=dowYMD(y,1,1);
        for(i=0;i<days;i++)if(bitGet(base,i)&&((jan1+i)%7)===0){
          var p=i+1;
          if(y<2007){if(p<days)bitSet(bits,p);}
          else{
            while(p<days&&bitGet(base,p))p++;
            if(p<days)bitSet(bits,p);
          }
        }
      }
      return bits;
    }
    function setUKNewYear(bits,y){setObservedFixed(bits,y,1,1);}
    function setScotlandNewYear(bits,y){
      var w=dowYMD(y,1,1),a,b;
      if(w===6){a=3;b=4;}else if(w===0){a=2;b=3;}else if(w===5){a=1;b=4;}else{a=1;b=2;}
      setYMD(bits,y,1,a);setYMD(bits,y,1,b);
    }
    function generateEnglandWalesBits(y){
      var b=new Uint8Array(HOL_BYTES);
      setUKNewYear(b,y);setEaster(b,y,true);setEarlyMay(b,y);setSpring(b,y);setCommonUK(b,y);
      setYMD(b,y,8,lastMonday(y,8));setChristmas(b,y);
      return b;
    }
    function generateScotlandBits(y){
      var b=new Uint8Array(HOL_BYTES);
      setScotlandNewYear(b,y);setEaster(b,y,false);setEarlyMay(b,y);setSpring(b,y);setCommonUK(b,y);
      if(y===2026)setYMD(b,y,6,15);
      setYMD(b,y,8,nthMonday(y,8,1));
      var w=dowYMD(y,11,30);
      if(w===6)setYMD(b,y,12,2);else if(w===0)setYMD(b,y,12,1);else setYMD(b,y,11,30);
      setChristmas(b,y);
      return b;
    }
    function generateNIBits(y){
      var b=new Uint8Array(HOL_BYTES);
      setUKNewYear(b,y);setObservedFixed(b,y,3,17);setEaster(b,y,true);
      setEarlyMay(b,y);setSpring(b,y);setCommonUK(b,y);
      setObservedFixed(b,y,7,12);setYMD(b,y,8,lastMonday(y,8));setChristmas(b,y);
      return b;
    }
    function generateHolidayBits(region,year){
      if(region==="jp")return generateJapanBits(year);
      if(region==="sc")return generateScotlandBits(year);
      if(region==="ni")return generateNIBits(year);
      return generateEnglandWalesBits(year);
    }
    function ensureHolidayBits(region,year){
      var b=loadHolidayBits(region,year);
      if(b)return b;
      return saveHolidayBits(region,year,generateHolidayBits(region,year));
    }
    function scheduleInitialHolidayCaches(){
      if(primeTimer)clearTimeout(primeTimer);
      cfg=readConfig();
      var region=holRegion(),y=(new Date()).getFullYear();
      primeQueue=[{r:region,y:y},{r:region,y:y+1}];
      primePos=0;

      function step(){
        primeTimer=undefined;
        /* Do not compete with live calendar interaction. If the user opens
           5wCal first, the normal on-demand path will create what it needs. */
        if(active){primeTimer=setTimeout(step,750);return;}
        if(!primeQueue||primePos>=primeQueue.length){primeQueue=undefined;return;}
        var q=primeQueue[primePos++];
        ensureHolidayBits(q.r,q.y);
        if(primePos<primeQueue.length)primeTimer=setTimeout(step,0);
        else primeQueue=undefined;
      }

      /* Module creation happens before the first Orbit draw. Deferring the
         prewarm lets the clock face appear first. */
      primeTimer=setTimeout(step,1200);
    }



    function easterSunday(y){
      var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4;
      var f=Math.floor((b+8)/25),gg=Math.floor((b-f+1)/3);
      var h=(19*a+b-d-gg+15)%30,i=Math.floor(c/4),k=c%4;
      var l=(32+2*e+2*i-h-k)%7,mm=Math.floor((a+11*h+22*l)/451);
      var q=h+l-7*mm+114,month=Math.floor(q/31),day=(q%31)+1;
      return new Date(y,month-1,day);
    }
    function topFreeGap(){
      var spans=[];
      if(typeof WIDGETS!=="undefined")Object.keys(WIDGETS).forEach(function(k){var wd=WIDGETS[k];if(!wd||!wd.width||!wd.area||wd.area.charAt(0)!=="t")return;if(typeof wd.x==="number")spans.push([wd.x,wd.x+wd.width-1]);});
      if(!spans.length&&typeof WIDGETS!=="undefined"){
        var lw=0,rw=0;Object.keys(WIDGETS).forEach(function(k){var wd=WIDGETS[k];if(!wd||!wd.width)return;if(wd.area==="tl")lw+=wd.width;else if(wd.area==="tr")rw+=wd.width;});
        if(lw)spans.push([0,lw-1]);if(rw)spans.push([W-rw,W-1]);
      }
      spans.sort(function(a,b){return a[0]-b[0];});
      var merged=[];spans.forEach(function(s){s[0]=Math.max(0,s[0]);s[1]=Math.min(W-1,s[1]);if(!merged.length||s[0]>merged[merged.length-1][1]+1)merged.push([s[0],s[1]]);else if(s[1]>merged[merged.length-1][1])merged[merged.length-1][1]=s[1];});
      var gaps=[],p=0;merged.forEach(function(s){if(s[0]>p)gaps.push([p,s[0]-1]);p=Math.max(p,s[1]+1);});if(p<W)gaps.push([p,W-1]);if(!gaps.length)return [0,W-1];
      gaps.sort(function(a,b){var aw=a[1]-a[0]+1,bw=b[1]-b[0]+1;if(aw!==bw)return bw-aw;return Math.abs(((a[0]+a[1])>>1)-(W>>1))-Math.abs(((b[0]+b[1])>>1)-(W>>1));});return gaps[0];
    }
    function drawTop(text){
      var s=text||(pageStart.getFullYear()+"/"+pad2(pageStart.getMonth()+1));
      var gap=topFreeGap(),x1=gap[0]+2,x2=gap[1]-2;if(x2<x1){x1=gap[0];x2=gap[1];}
      g.setBgColor(BLACK).setColor(BLACK).fillRect(x1,1,x2,22);
      g.setColor(WHITE).setFont("6x8",2).setFontAlign(0,0).drawString(s,(x1+x2)>>1,12);
    }
    function drawSelectionAck(d){
      drawTop("SEL "+pad2(d.getMonth()+1)+"/"+pad2(d.getDate()));
      try{g.flip();}catch(e){}
    }
    function buildWeekdayImages(){
      if(weekdayImgs)return;
      weekdayImgs=[];weekdayPal=new Uint16Array([0,WHITE]);
      function l2(q,x1,y1,x2,y2){q.drawLine(x1,y1,x2,y2);q.drawLine(x1+1,y1,x2+1,y2);}
      for(var c=0;c<7;c++){
        var q=Graphics.createArrayBuffer(16,18,1,{msb:true}),x=8,y=9;
        q.setColor(1).clear();
        if(c===0){l2(q,x-6,y-8,x-6,y+8);l2(q,x+5,y-8,x+5,y+8);l2(q,x-6,y-8,x+5,y-8);l2(q,x-6,y-2,x+5,y-2);l2(q,x-6,y+4,x+5,y+4);}
        else if(c===1){l2(q,x,y-8,x,y+2);l2(q,x-2,y-1,x-7,y-6);l2(q,x+2,y-1,x+7,y-6);l2(q,x,y+1,x-6,y+8);l2(q,x,y+1,x+7,y+8);}
        else if(c===2){l2(q,x,y-8,x,y+8);l2(q,x-2,y-1,x-7,y-4);l2(q,x-2,y-1,x-7,y+6);l2(q,x+2,y-2,x+7,y-5);l2(q,x+1,y,x+7,y+6);l2(q,x-1,y-7,x+2,y-4);}
        else if(c===3){l2(q,x,y-8,x,y+8);l2(q,x-7,y-2,x+7,y-2);l2(q,x,y-1,x-7,y+7);l2(q,x,y-1,x+7,y+7);}
        else if(c===4){l2(q,x,y-8,x-7,y-2);l2(q,x,y-8,x+7,y-2);l2(q,x-5,y-2,x+5,y-2);l2(q,x-6,y+3,x+6,y+3);l2(q,x,y-2,x,y+7);l2(q,x-7,y+8,x+7,y+8);l2(q,x-5,y+5,x-7,y+2);l2(q,x+5,y+5,x+7,y+2);}
        else if(c===5){l2(q,x,y-8,x,y+7);l2(q,x-5,y-4,x+5,y-4);l2(q,x-7,y+7,x+7,y+7);}
        else{l2(q,x-6,y-8,x+5,y-8);l2(q,x-6,y+8,x+5,y+8);l2(q,x-6,y-8,x-6,y+8);l2(q,x+5,y-8,x+5,y+8);l2(q,x-6,y,x+5,y);}
        weekdayImgs.push({width:16,height:18,bpp:1,buffer:q.buffer,transparent:0,palette:weekdayPal});
      }
    }
    function drawWeekdayLabel(c){
      var x1=cellX1[c],x2=cellX2[c],cx=(x1+x2)>>1;
      if(cfg.lang==="en"){
        g.setColor(WHITE).setFont("6x8",2).setFontAlign(0,0)
          .drawString(["M","T","W","T","F","S","S"][c],cx,35);
      }else{
        g.drawImage(weekdayImgs[c],cx-8,26);
      }
    }
    function buildGeometry(){
      var c,r,top=48,gh=H-48;
      for(c=0;c<7;c++){
        cellX1[c]=Math.floor(c*W/7);
        cellX2[c]=Math.floor((c+1)*W/7)-1;
      }
      for(r=0;r<5;r++){
        cellY1[r]=top+Math.floor(r*gh/5);
        cellY2[r]=top+Math.floor((r+1)*gh/5)-1;
      }
    }
    function cellGeometry(index){
      var c=index%7,r=(index/7)|0;
      return {x1:cellX1[c],x2:cellX2[c],y1:cellY1[r],y2:cellY2[r],c:c,r:r};
    }
    function buildBasicCellData(){
      var t0=Math.round(getTime()*1000);
      var y=pageStart.getFullYear(),m=pageStart.getMonth()+1,d=pageStart.getDate();
      var startNo=civilDay(y,m,d),todayNo=dayNumber(today);
      var ti=todayNo-startNo;
      todayIndex=(ti>=0&&ti<35)?ti:-1;
      for(var i=0;i<35;i++){
        dayNums[i]=d;monthNums[i]=m;yearNums[i]=y;doyNums[i]=doyYMD(y,m,d);holidayFlags[i]=0;
        d++;
        if(d>dim(y,m)){d=1;m++;if(m>12){m=1;y++;}}
      }
      lastCellPrepMs=Math.round(getTime()*1000)-t0;
      return lastCellPrepMs;
    }

    function parseDateToken(s){
      if(typeof s!=="string")return undefined;
      var p=s.split("-"),y,m,d;
      if(p.length===3){
        y=parseInt(p[0],10);m=parseInt(p[1],10);d=parseInt(p[2],10);
        if(y>=1900&&m>=1&&m<=12&&d>=1&&d<=31)return {full:1,ymd:y*10000+m*100+d,md:m*100+d};
      }else if(p.length===2){
        m=parseInt(p[0],10);d=parseInt(p[1],10);
        if(m>=1&&m<=12&&d>=1&&d<=31)return {full:0,md:m*100+d};
      }
    }
    function eventColorValue(color,type){
      if(typeof color==="number")return color&65535;
      var s=(color||"").toLowerCase();
      if(s==="red")return RED;if(s==="yellow")return YELLOW;if(s==="green")return GREEN;
      if(s==="blue")return BLUE;if(s==="cyan")return CYAN;if(s==="magenta")return MAGENTA;
      if(s==="orange")return ORANGE;if(s==="white")return WHITE;if(s==="gray"||s==="grey")return GRAY;
      if(s==="black")return BLACK;
      type=(type||"").toLowerCase();
      if(type==="holiday")return RED;
      if(type==="family")return YELLOW;
      if(type==="birthday")return MAGENTA;
      if(type==="work")return CYAN;
      return YELLOW;
    }
    function eventTextColor(bg){
      return (bg===YELLOW||bg===GREEN||bg===CYAN||bg===WHITE||bg===ORANGE)?BLACK:WHITE;
    }
    function loadExtraEvents(){
      var d=readExtraEventDoc(),src=d.events||[];
      extraEvents=[];
      for(var i=0;i<src.length;i++){
        var e=src[i]||{},a,b,kind;
        if(e.date){
          a=parseDateToken(e.date);
          if(!a)continue;
          if(e.repeat==="yearly"||!a.full)kind="yearly";
          else kind="date";
        }else if(e.from&&e.to){
          a=parseDateToken(e.from);b=parseDateToken(e.to);
          if(!a||!b)continue;
          if(e.repeat==="yearly"||(!a.full&&!b.full))kind="yearlyRange";
          else if(a.full&&b.full)kind="range";
          else continue;
        }else continue;
        extraEvents.push({
          kind:kind,a:a,b:b,type:e.type||"custom",label:e.label||"",
          region:e.region||"all",
          color:eventColorValue(e.color,e.type),blink:!!e.blink
        });
      }
    }
    function eventMatchesCell(e,i){
      var md=monthNums[i]*100+dayNums[i],ymd=yearNums[i]*10000+md;
      if(e.kind==="date")return ymd===e.a.ymd;
      if(e.kind==="yearly")return md===e.a.md;
      if(e.kind==="range")return ymd>=e.a.ymd&&ymd<=e.b.ymd;
      if(e.kind==="yearlyRange"){
        if(e.a.md<=e.b.md)return md>=e.a.md&&md<=e.b.md;
        return md>=e.a.md||md<=e.b.md; /* range crossing New Year */
      }
      return false;
    }
    function buildEventPage(){
      for(var i=0;i<35;i++){eventFlags[i]=0;eventBlinkFlags[i]=0;eventColors[i]=0;}
      var region=holRegion();
      for(var e=0;e<extraEvents.length;e++){
        var x=extraEvents[e];
        if(x.region!=="all"&&x.region!==region)continue;
        for(var j=0;j<35;j++)if(eventMatchesCell(x,j)){
          /* Later JSON entries intentionally override earlier entries. */
          eventFlags[j]=1;eventColors[j]=x.color;eventBlinkFlags[j]=x.blink?1:0;
        }
      }
      eventBlinkPhase=true;
    }
    function hasBlinkEvents(){
      for(var i=0;i<35;i++)if(eventFlags[i]&&eventBlinkFlags[i])return true;
      return false;
    }
    function stopEventBlink(){
      if(eventBlinkTimer)clearTimeout(eventBlinkTimer);
      eventBlinkTimer=undefined;
    }
    function eventBlinkTick(){
      eventBlinkTimer=undefined;
      if(!active)return;
      eventBlinkPhase=!eventBlinkPhase;
      var si=selectedIndex();
      for(var i=0;i<35;i++)if(eventFlags[i]&&eventBlinkFlags[i]&&i!==si)drawCell(i);
      try{g.flip();}catch(e){}
      if(active&&hasBlinkEvents())eventBlinkTimer=setTimeout(eventBlinkTick,500);
    }
    function startEventBlink(){
      stopEventBlink();
      eventBlinkPhase=true;
      if(active&&hasBlinkEvents())eventBlinkTimer=setTimeout(eventBlinkTick,500);
    }

    function preparePageHolidayState(){
      var firstYear=yearNums[0],lastYear=yearNums[34],region=holRegion();
      var b0=loadHolidayBits(region,firstYear);
      var b1=(lastYear===firstYear)?b0:loadHolidayBits(region,lastYear);
      var missing=[];

      if(!b0)missing.push(firstYear);
      if(lastYear!==firstYear&&!b1)missing.push(lastYear);

      for(var j=0;j<35;j++){
        var b=(yearNums[j]===firstYear)?b0:b1;
        holidayFlags[j]=(b&&bitGet(b,doyNums[j]))?1:0;
      }
      return {mode:"cache",region:region,years:missing};
    }
    function cancelHolidayBatch(){
      holidayToken++;
      if(holidayTimer)clearTimeout(holidayTimer);
      holidayTimer=undefined;
    }

    function startHolidayBatch(baseTotal,baseDraw,basePrep,state){
      cancelHolidayBatch();
      if(!state)return;

      if(state.mode==="cache"&&!state.years.length){
        lastHolidayCalcMs=0;lastHolidayDrawMs=0;
        report({holidayDone:1,holidayCacheHit:1,holidayCalcMs:0,holidayDrawMs:0});
        return;
      }

      var token=holidayToken;


      var region=state.region,years=state.years.slice();
      holidayTimer=setTimeout(function(){
        holidayTimer=undefined;
        if(!active||token!==holidayToken)return;

        var t0=Math.round(getTime()*1000);
        for(var k=0;k<years.length;k++){
          saveHolidayBits(region,years[k],generateHolidayBits(region,years[k]));
        }
        lastHolidayCalcMs=Math.round(getTime()*1000)-t0;
        if(!active||token!==holidayToken)return;

        preparePageHolidayState();

        var t1=Math.round(getTime()*1000),changed=0,si=selectedIndex();
        for(var i=0;i<35;i++){
          if(holidayFlags[i]&&i!==todayIndex&&(i%7)!==6&&i!==si){drawCell(i);changed++;}
        }
        try{g.flip();}catch(e){}
        lastHolidayDrawMs=Math.round(getTime()*1000)-t1;

        report({
          holidayDone:1,holidayCacheHit:0,holidayGeneratedYears:years.length,
          holidayCalcMs:lastHolidayCalcMs,holidayDrawMs:lastHolidayDrawMs,
          holidayCount:changed
        });
      },0);
    }

    function drawCell(index){
      if(index<0||index>=35)return;
      var q=cellGeometry(index),bg=BLACK,fg=WHITE;
      if(q.c===5)bg=BLUE;
      if(q.c===6||holidayFlags[index])bg=RED;
      if(index===todayIndex){bg=GREEN;fg=BLACK;}
      if(eventFlags[index]&&(!eventBlinkFlags[index]||eventBlinkPhase)){
        bg=eventColors[index];fg=eventTextColor(bg);
      }
      g.setColor(bg).fillRect(q.x1,q.y1,q.x2,q.y2);
      g.setColor(fg).setBgColor(bg).setFont("6x8",2).setFontAlign(0,0)
        .drawString(""+dayNums[index],(q.x1+q.x2)>>1,(q.y1+q.y2)>>1);
      g.setColor(GRAY).drawRect(q.x1,q.y1,q.x2,q.y2);
    }
    function selectedIndex(){if(!selected)return -1;var n=dayNumber(selected)-dayNumber(pageStart);return n>=0&&n<35?n:-1;}
    function logCalError(stage,e){try{Storage.write("orbit.err","calendar "+stage+": "+e);}catch(x){}}
    function redrawSelected(){var i=selectedIndex();if(i>=0)drawCell(i);}
    function drawSelectedCell(on){
      var i=selectedIndex();if(i<0)return;
      if(!on){drawCell(i);try{g.flip();}catch(e){}return;}

      var q=cellGeometry(i);
      g.setColor(YELLOW).fillRect(q.x1,q.y1,q.x2,q.y2);
      g.setColor(BLACK).setBgColor(YELLOW).setFont("6x8",2).setFontAlign(0,0)
        .drawString(""+dayNums[i],(q.x1+q.x2)>>1,(q.y1+q.y2)>>1);
      g.setColor(GRAY).drawRect(q.x1,q.y1,q.x2,q.y2);
      try{g.flip();}catch(e){}
    }
    function drawCalendarFast(full){
      var c,r,i,bg,fg,x,y;
      g.setBgColor(BLACK).setColor(BLACK);

      if(full){
        g.clear();
        try{Bangle.drawWidgets();}catch(e){}
      }else g.fillRect(0,24,W-1,H-1);
      g.setColor(BLACK).fillRect(0,24,W-1,47);
      g.setColor(BLUE).fillRect(cellX1[5],24,cellX2[5],47);
      g.setColor(RED).fillRect(cellX1[6],24,cellX2[6],47);
      for(c=0;c<7;c++)drawWeekdayLabel(c);
      /* Fill the body by large regions, not 35 individual cell rectangles. */
      g.setColor(BLACK).fillRect(0,48,W-1,H-1);
      g.setColor(BLUE).fillRect(cellX1[5],48,cellX2[5],H-1);
      g.setColor(RED).fillRect(cellX1[6],48,cellX2[6],H-1);
      for(i=0;i<35;i++)if(holidayFlags[i]&&i!==todayIndex&&(i%7)!==6){
        c=i%7;r=(i/7)|0;
        g.setColor(RED).fillRect(cellX1[c],cellY1[r],cellX2[c],cellY2[r]);
      }
      if(todayIndex>=0){
        c=todayIndex%7;r=(todayIndex/7)|0;
        g.setColor(GREEN).fillRect(cellX1[c],cellY1[r],cellX2[c],cellY2[r]);
      }
      for(i=0;i<35;i++)if(eventFlags[i]&&(!eventBlinkFlags[i]||eventBlinkPhase)){
        c=i%7;r=(i/7)|0;
        g.setColor(eventColors[i]).fillRect(cellX1[c],cellY1[r],cellX2[c],cellY2[r]);
      }

      /* Draw the grid once as shared lines instead of 35 drawRect calls. */
      g.setColor(GRAY);
      for(c=0;c<=7;c++){
        x=c===7?W-1:Math.floor(c*W/7);
        g.drawLine(x,48,x,H-1);
      }
      for(r=0;r<=5;r++){
        y=r===5?H-1:48+Math.floor(r*(H-48)/5);
        g.drawLine(0,y,W-1,y);
      }

      /* Built-in 6x8x2 keeps date rendering compact and fast. */
      g.setFont("6x8",2).setFontAlign(0,0);
      for(i=0;i<35;i++){
        c=i%7;r=(i/7)|0;
        bg=c===5?BLUE:((c===6||holidayFlags[i])?RED:BLACK);fg=WHITE;
        if(i===todayIndex){bg=GREEN;fg=BLACK;}
        if(eventFlags[i]&&(!eventBlinkFlags[i]||eventBlinkPhase)){bg=eventColors[i];fg=eventTextColor(bg);}
        g.setColor(fg).setBgColor(bg)
          .drawString(""+dayNums[i],(cellX1[c]+cellX2[c])>>1,(cellY1[r]+cellY2[r])>>1);
      }
      drawTop();
      try{g.flip();}catch(e){}
    }
    function drawCalendar(full){
      drawCalendarFast(full);
    }
    function report(x){}

    function clearTimer(t){if(t)clearTimeout(t);}
    function clearTaps(){clearTimer(tapTimer);tapTimer=undefined;lastXY=undefined;firstTapMs=undefined;}
    function stopBlink(){clearTimer(blinkTimer);blinkTimer=undefined;}
    function blinkTick(){
      blinkTimer=undefined;
      if(!active||!selected||selectedIndex()<0)return;
      try{
        blinkWhite=!blinkWhite;
        drawSelectedCell(blinkWhite);
      }catch(e){
        logCalError("blink",e);
        return;
      }
      if(active&&selected&&selectedIndex()>=0)blinkTimer=setTimeout(blinkTick,500);
    }
    function startBlink(){
      stopBlink();blinkWhite=true;
      if(active&&selected&&selectedIndex()>=0){
        try{drawSelectedCell(true);}catch(e){logCalError("frame",e);return;}
        blinkTimer=setTimeout(blinkTick,500);
      }
    }
    function stopAuto(){clearTimer(autoTimer);autoTimer=undefined;}
    function armAuto(){stopAuto();if(!active||!cfg||!(cfg.timeout>=15))return;autoTimer=setTimeout(function(){autoTimer=undefined;returnToOrbit();},cfg.timeout*1000);}
    function stop(){cancelHolidayBatch();stopEventBlink();stopBlink();stopAuto();clearTaps();firstTapMs=undefined;active=false;onReturn=undefined;onSelect=undefined;}
    function resetTransient(){cancelHolidayBatch();stopEventBlink();selected=undefined;clearTaps();stopBlink();stopAuto();today=midnight(new Date());pageStart=mondayOf(today);}
    function returnToOrbit(){
      if(!active)return;
      var cb=onReturn,sel=selected?copyDate(selected):undefined;
      /* Remove the visible yellow selection before leaving the calendar.
         The selected date itself is still handed to Orbit and will resume
         blinking if the calendar is opened again. */
      stopBlink();
      if(selectedIndex()>=0){redrawSelected();try{g.flip();}catch(e){}}
      stop();
      if(cb)setTimeout(function(){cb(sel);},0);
    }
    function copyXY(xy){
      if(!xy||typeof xy.x!=="number"||typeof xy.y!=="number")return undefined;
      return {x:Math.round(xy.x),y:Math.round(xy.y)};
    }
    function dateIndexAt(xy){
      if(!xy||typeof xy.x!=="number"||typeof xy.y!=="number")return -1;
      if(xy.x<0||xy.x>=W||xy.y<48||xy.y>=H)return -1;
      var c=Math.floor(xy.x*7/W),r=Math.floor((xy.y-48)*5/(H-48));
      if(c<0||c>6||r<0||r>4)return -1;
      return r*7+c;
    }
    function selectAt(xy,dt){
      var stage="IDX",idx=-1,offset=0;
      try{
        idx=dateIndexAt(xy);

        /* A deliberate double tap in the non-date area clears the current
           selection. This is not an input error. */
        if(idx<0){
          stopBlink();
          selected=undefined;
          /* Full repaint also clears any stale selection frame. */
          drawCalendar(false);
          if(onSelect)onSelect(undefined,0);
          report({selOK:1,selStage:"CLEAR",selIdx:-1,selOff:0,selDtMs:dt,buzzMs:80});
          drawTop("SEL CLEAR");
          try{g.flip();}catch(fe){}
          try{Bangle.buzz(80);}catch(be){}
          return true;
        }

        stage="DATE";
        stopBlink();
        selected=addDays(pageStart,idx);
        /* Repaint the whole calendar body before starting the new selection
           blink. This guarantees that a previously selected yellow cell is
           cleared even if an earlier partial redraw was delayed. */
        drawCalendar(false);
        stage="OFFSET";
        offset=dayNumber(selected)-dayNumber(today);
        stage="CALL";
        if(onSelect)onSelect(copyDate(selected),offset);
        stage="ACK";
        report({
          selOK:1,selStage:"OK",selIdx:idx,selOff:offset,selDtMs:dt,
          selMonth:selected.getMonth()+1,selDay:selected.getDate(),buzzMs:120
        });
        drawSelectionAck(selected);
        startBlink();
        try{Bangle.buzz(120);}catch(be2){}
        return true;
      }catch(e){
        report({selOK:0,selStage:stage,selIdx:idx,selOff:offset,selDtMs:dt,selErr:String(e),buzzMs:500});
        drawTop("SELECT ERR");
        try{g.flip();}catch(fe){}
        try{Bangle.buzz(500);}catch(be3){}
        return false;
      }
    }
    function touch(xy){
      if(!active)return;
      try{
        armAuto();
        var now=Math.round(getTime()*1000),p=copyXY(xy);

        if(tapTimer){
          var dt=firstTapMs===undefined?999999:now-firstTapMs;

          /* Count as a double tap only when the measured interval itself is
             within 400 ms. A delayed timer can no longer cause a false double. */
          if(dt<=TAP_WINDOW){
            var selectXY=lastXY||p;
            clearTimer(tapTimer);
            tapTimer=undefined;lastXY=undefined;firstTapMs=undefined;
            report({calTap2Seen:1,calTap2Ms:now,calDoubleDtMs:dt,singleOnly:0});
            selectAt(selectXY,dt);
            return;
          }

          /* The first tap already aged out. Resolve it as the intended single
             tap rather than pairing this late event into a false double. */
          clearTaps();
          report({calTap2Seen:1,calTap2Late:1,calDoubleDtMs:dt,singleOnly:1});
          if(active)returnToOrbit();
          return;
        }

        firstTapMs=now;lastXY=p;
        report({calTap1Seen:1,calTap1Ms:now,singleOnly:0});
        tapTimer=setTimeout(function(){
          tapTimer=undefined;lastXY=undefined;
          var waited=firstTapMs===undefined?TAP_WINDOW:
            Math.round(getTime()*1000)-firstTapMs;
          firstTapMs=undefined;
          report({calTap2Seen:0,calSingleTimeout:1,singleOnly:1,singleWaitMs:waited});
          if(active)returnToOrbit();
        },TAP_WINDOW);
      }catch(e){
        report({selOK:0,selStage:"TOUCH",selErr:String(e),buzzMs:0});
        clearTaps();
      }
    }
    function swipe(lr,ud){
      if(!active||!ud)return;
      clearTaps();armAuto();cancelHolidayBatch();stopBlink();
      pageStart=addDays(pageStart,ud<0?35:-35);

      stopEventBlink();
      var cMs=buildBasicCellData();
      var holidayState=preparePageHolidayState();
      buildEventPage();
      var t0=Math.round(getTime()*1000);
      drawCalendar(false);
      var dMs=Math.round(getTime()*1000)-t0;

      report({calCellMs:cMs,calDrawMs:dMs,holidayDeferred:holidayState.years.length?1:0});
      startHolidayBatch(dMs,dMs,cMs,holidayState);
      startEventBlink();
      startBlink();
    }
    function start(opts){
      opts=opts||{};stop();cfg=readConfig();active=true;
      onReturn=opts.onReturn;onSelect=opts.onSelect;startTapMs=opts.tapMs;
      var startMs=Math.round(getTime()*1000);
      today=midnight(new Date());
      var focus=opts.focusDate?midnight(opts.focusDate):(opts.selectedDate?midnight(opts.selectedDate):today);
      pageStart=mondayOf(focus);selected=opts.selectedDate?midnight(opts.selectedDate):undefined;blinkWhite=true;
      loadExtraEvents();

      /* Stage 1: build day cells, apply cached holiday data, and paint immediately. */
      var cellMs=buildBasicCellData();
      var holidayState=preparePageHolidayState();
      buildEventPage();
      var drawStartMs=Math.round(getTime()*1000);
      drawCalendar(true);
      var doneMs=Math.round(getTime()*1000);
      var total=startTapMs===undefined?0:doneMs-startTapMs;
      var drawMs=doneMs-drawStartMs;
      var preMs=startTapMs===undefined?0:startMs-startTapMs;

      report({
        calStartMs:startMs,calDrawStartMs:drawStartMs,calDoneMs:doneMs,
        calTotalMs:total,calDrawMs:drawMs,calStartDelayMs:preMs,
        calCellMs:cellMs,holidayDeferred:holidayState.mode==="cache"?holidayState.years.length:1?1:0,calReady:1
      });

      /* Stage 2: create missing yearly holiday caches after the first frame,
         then repaint affected holiday cells together. */
      startHolidayBatch(total,drawMs,cellMs,holidayState);
      startEventBlink();
      startBlink();
      armAuto();
    }
    function isActive(){return active;}
    buildGeometry();
    buildWeekdayImages();
    scheduleInitialHolidayCaches();
    return {start:start,stop:stop,resetTransient:resetTransient,touch:touch,swipe:swipe,isActive:isActive};
  }

  return {
    create:create,readConfig:readConfig,writeConfig:writeConfig,
    listHolidayCaches:listHolidayCaches,clearHolidayCaches:clearHolidayCaches,
    extraEventCount:extraEventCount
  };
})()
