/* tenkyu screen-normal (Z) acceleration peak-rest recorder; MIT.
 * For every observed 5-minute interval, bar height equals the percentage
 * of local |high-pass(Z)| peaks that do not exceed the selected threshold.
 * Non-wear uses one rotation-invariant 3-axis vector-deviation threshold
 * and a periodic HRM probe; 1-second vector averages suppress sensor spikes.
 */
var SLOT_MS=300000,COUNT=288,DAY_MS=SLOT_MS*COUNT;
var NOT_WORN=254,NO_DATA=255;
var HR_PENDING=0,HR_FOUND=1,HR_ABSENT=2,HR_FAILED=3;
var MAX_GAP_MS=2500,MIN_COVERAGE_MS=270000;
var THRESHOLDS=[0.001,0.003,0.009,0.027,0.081,0.243,0.729];
function thresholdG(v){
  if(!isFinite(v)||v<=0)return 0.027;
  var best=0;
  for(var n=1;n<7;n++)if(Math.abs(Math.log(v/THRESHOLDS[n]))<Math.abs(Math.log(v/THRESHOLDS[best])))best=n;
  return THRESHOLDS[best];
}
function limit(v,lo,hi,def){return isFinite(v)?Math.max(lo,Math.min(hi,+v)):def;}
function wearConfig(s){return {enabled:s.restWearEnabled!==false,
  z:thresholdG(s.restWearThreshold===undefined?0.009:s.restWearThreshold),
  seconds:limit(s.restProbeSeconds,10,60,30),confidence:limit(s.restPulseConfidence,1,100,90),
  min:limit(s.restPulseMin,20,100,40),max:limit(s.restPulseMax,120,240,200)};}


/* Streamed five-minute Z-axis motion-peak ratio.
 * One local maximum of |high-pass(z)| counts as one peak; no arrays of samples.
 * Thresholds are in g, and history stores integer percentages (0..100).
 */
function percentFor(quietPeaks,peakCount,coveredMs){
  if(coveredMs<MIN_COVERAGE_MS)return 0; // missing coverage
  if(peakCount===0)return 100; // no movement peaks in an observed, worn interval
  return Math.max(0,Math.min(100,Math.round(100*quietPeaks/peakCount)));
}
function create(options){
  options=options||{};
  var levels=new Uint8Array(COUNT),stamps=new Uint32Array(COUNT);
  var threshold=thresholdG(options.thresholdG),save=options.onCommit;
  var wearG=thresholdG(options.wearThresholdG===undefined?0.009:options.wearThresholdG);
  var vecFirst,vecLast,vecBad=false;
  var vecSX=0,vecSY=0,vecSZ=0,vecCount=0,vecSecond=-1;
  var vecRefX,vecRefY,vecRefZ,vecMaxD2=0;
  var closedBucket=-1,closedStill=false,closedVectorOK=false,
    closedPercent=0,closedPulse=HR_PENDING,closedMotion=false;
  var current=-1,covered=0,peaks=0,quietPeaks=0,lastMs,lastValid=false;
  var wearEnabled=!!options.wearEnabled,pulseState=HR_PENDING;
  var diag=options.saved&&options.saved.diag instanceof Array?
    options.saved.diag.slice(-12):[];
  var zBase,ampOlder,ampPrevious;
  var old=options.saved,i,b,v;
  if(old&&(old.v===2||old.v===3)&&isFinite(old.end)&&typeof old.levels==="string"&&old.levels.length===COUNT*2){
    for(i=0;i<COUNT;i++){
      b=old.end-COUNT+1+i;v=parseInt(old.levels.substr(2*i,2),16);
      if(b>=0&&isFinite(v)&&v>=0&&v<=255){
        stamps[b%COUNT]=b;
        levels[b%COUNT]=old.v===2&&v===0?NO_DATA:v;
      }
    }
    if(old.active&&old.active.bucket===Math.floor(options.nowMs/SLOT_MS)){
      current=old.active.bucket;
      covered=Math.max(0,Math.min(SLOT_MS,+old.active.covered||0));
      peaks=Math.max(0,+old.active.peaks||0);
      quietPeaks=Math.max(0,Math.min(peaks,+old.active.quietPeaks||0));
    }
  }
  function resetPeak(){zBase=undefined;ampOlder=undefined;ampPrevious=undefined;}
  function flushVector(){
    if(!vecCount)return;
    var x=vecSX/vecCount,y=vecSY/vecCount,z=vecSZ/vecCount;
    if(vecRefX===undefined){vecRefX=x;vecRefY=y;vecRefZ=z;}
    else{
      // Full 3D deviation from the starting acceleration vector in g.
      // At ~1g, direction change theta gives 2*sin(theta/2) g deviation.
      // Unlike unit-vector direction alone, translational motion counts too.
      var dx=x-vecRefX,dy=y-vecRefY,dz=z-vecRefZ;
      var d2=dx*dx+dy*dy+dz*dz;
      if(d2>vecMaxD2)vecMaxD2=d2;
    }
    vecSX=0;vecSY=0;vecSZ=0;vecCount=0;
  }
  function resetVector(){
    vecSX=0;vecSY=0;vecSZ=0;vecCount=0;vecSecond=-1;
    vecRefX=undefined;vecRefY=undefined;vecRefZ=undefined;vecMaxD2=0;
  }
  function addVector(a,ms){
    var second=Math.floor(ms/1000);
    if(second!==vecSecond){flushVector();vecSecond=second;}
    vecSX+=a.x;vecSY+=a.y;vecSZ+=a.z;vecCount++;
  }
  // Motion is enough evidence to plot the rest level; HRM is only needed
  // to distinguish a motionless worn watch from one lying on a table.
  function chooseLevel(ok,still,motion,hr,percent){
    if(!ok)return NO_DATA;
    if(!wearEnabled||motion)return percent;
    if(still)return hr===HR_FOUND?100:NOT_WORN;
    return NO_DATA;
  }
  function makeReason(ok,still,motion,hr){
    if(!ok)return "accel_missing";
    if(!wearEnabled)return "nonwear_disabled";
    if(motion)return "motion";
    if(still){
      if(hr===HR_FOUND)return "pulse_detected_still";
      if(hr===HR_FAILED)return "nonwear_hrm_failed";
      if(hr===HR_PENDING)return "nonwear_hrm_unknown";
      return "nonwear";
    }
    return "accel_uncertain";
  }
  function updateClosed(){
    if(closedBucket<0||stamps[closedBucket%COUNT]!==closedBucket)return;
    var v=chooseLevel(closedVectorOK,closedStill,closedMotion,closedPulse,closedPercent);
    levels[closedBucket%COUNT]=v;
    for(var j=diag.length-1;j>=0;j--)if(diag[j].bucket===closedBucket){
      diag[j].pulse=closedPulse;diag[j].result=v;
      diag[j].reason=makeReason(closedVectorOK,closedStill,closedMotion,closedPulse);
      break;
    }
    if(save)save();
  }
  function markProbe(bucket,status){
    if(bucket===current){
      pulseState=status;
    }else if(bucket===closedBucket){
      closedPulse=status;
      updateClosed();
    }
  }
  function roll(ms){
    var target=Math.floor(ms/SLOT_MS),changed=false;
    if(target===current)return false;
    if(current>=0&&target>current){
      flushVector();
      closedBucket=current;
      closedVectorOK=!vecBad&&vecRefX!==undefined&&covered>=MIN_COVERAGE_MS;
      closedMotion=closedVectorOK&&vecMaxD2>wearG*wearG;
      closedStill=closedVectorOK&&!closedMotion;
      closedPercent=percentFor(quietPeaks,peaks,covered);
      closedPulse=pulseState;
      i=current%COUNT;stamps[i]=current;
      levels[i]=chooseLevel(closedVectorOK,closedStill,closedMotion,closedPulse,closedPercent);
      diag.push({bucket:current,coverageSec:Math.round(covered/1000),
        driftG:Math.round(Math.sqrt(vecMaxD2)*10000)/10000,
        valid:closedVectorOK,pulse:closedPulse,result:levels[i],
        reason:makeReason(closedVectorOK,closedStill,closedMotion,closedPulse)});
      if(diag.length>12)diag.shift();
      changed=true;
    }else if(current>=0&&target<current){
      for(i=0;i<COUNT;i++)if(stamps[i]>=target){stamps[i]=0;levels[i]=0;}
      closedBucket=-1;changed=true;
    }
    current=target;covered=0;peaks=0;quietPeaks=0;resetPeak();resetVector();
    vecFirst=undefined;vecLast=undefined;vecBad=false;
    pulseState=HR_PENDING;
    if(changed&&save)save();
    return changed;
  }
  function detectPeak(z,dt){
    // IIR removes gravity and changes of orientation without extra sensor reads.
    if(zBase===undefined)zBase=z;
    else zBase+=(dt/(2000+dt))*(z-zBase);
    var amp=Math.abs(z-zBase);
    // Detect a positive local maximum. Flat tops count once, negative Z included.
    if(ampOlder!==undefined&&ampPrevious!==undefined&&
       ampPrevious>ampOlder&&ampPrevious>=amp&&ampPrevious>0){
      peaks++;
      if(ampPrevious<=threshold)quietPeaks++;
    }
    ampOlder=ampPrevious;ampPrevious=amp;
  }
  function sample(a,ms){
    if(!isFinite(ms)||ms<0)return;
    var z=a&&a.z,valid=!!a&&isFinite(a.x)&&isFinite(a.y)&&isFinite(z),
      dt=lastMs===undefined?0:ms-lastMs;
    var continuous=lastValid&&valid&&dt>0&&dt<=MAX_GAP_MS;
    var target=Math.floor(ms/SLOT_MS);
    if(!continuous){
      if(target!==current)roll(ms);
      resetPeak();
    }else if(target===current){
      covered+=dt; // Common case: no rollover or extra loop per sensor event.
    }else{
      // A valid interval can cross only one 5-minute boundary (dt<=2.5 s).
      var boundary=target*SLOT_MS;
      if(current>=0&&target===current+1)covered+=boundary-lastMs;
      roll(ms);
      covered+=ms-boundary;
    }
    if(!valid)vecBad=true;
    else{
      if(vecFirst===undefined)vecFirst=ms;
      if(vecLast!==undefined&&(ms-vecLast>MAX_GAP_MS||ms<=vecLast))vecBad=true;
      vecLast=ms;
      addVector(a,ms);
      detectPeak(z,continuous?dt:0);
    }
    lastMs=ms;lastValid=!!valid;
  }
  function sync(ms){
    if(Math.floor(ms/SLOT_MS)!==current){
      roll(ms);lastMs=ms;lastValid=false;
    }
  }
  function absentPulse(bucket){markProbe(bucket,HR_ABSENT);}
  function detectedPulse(bucket){markProbe(bucket,HR_FOUND);}
  function failedProbe(bucket){markProbe(bucket,HR_FAILED);}
  function level(bucket){return stamps[bucket%COUNT]===bucket?
    (levels[bucket%COUNT]>100?0:levels[bucket%COUNT]):0;}
  function visit(ms,fn){
    var end=Math.floor(ms/SLOT_MS)-1,b,v;
    for(b=end-COUNT+1;b<=end;b++)if(b>=0&&stamps[b%COUNT]===b){
      v=levels[b%COUNT];
      if(v<=100)fn(b,v); // 0%-quiet is a visible stage-1 bar.
    }
  }
  function snapshot(){
    var end=current-1,out="",b,v;
    for(b=end-COUNT+1;b<=end;b++){
      v=b>=0?level(b):0;
      if(stamps[b%COUNT]!==b)v=NO_DATA;
      else v=levels[b%COUNT];
      out+=("0"+v.toString(16)).slice(-2);
    }
    return {v:3,end:end,levels:out,diag:diag,
      active:{bucket:current,covered:covered,peaks:peaks,quietPeaks:quietPeaks}};
  }
  return {sample:sample,sync:sync,absentPulse:absentPulse,detectedPulse:detectedPulse,
    failedProbe:failedProbe,visit:visit,snapshot:snapshot,level:level,
    getDiagnostics:function(){return {bucket:current,coverageSec:Math.round(covered/1000),
      driftG:Math.round(Math.sqrt(vecMaxD2)*10000)/10000,vectorValid:!vecBad,
      pulse:pulseState,probeStatus:"0=pending,1=detected,2=absent,3=failed",
      recent:diag.slice()};},
    getLive:function(){return {bucket:current,covered:covered,peaks:peaks,
      quietPeaks:quietPeaks,rate:percentFor(quietPeaks,peaks,covered)};}};
}
function install(bangle,storage,events,clock){
  clock=clock||function(){return Date.now();};
  if(bangle.orbitRest)return bangle.orbitRest;
  var engine,enabled=false,configKey,api,wear,probe,timer;
  var HR_ID="orbitrest";
  function persist(){if(engine)try{storage.writeJSON("orbit.rest.json",engine.snapshot());}catch(e){}}
  function onAccel(a){engine.sample(a,clock());}
  function onHRM(h){
    if(probe&&h&&isFinite(h.bpm)&&h.bpm>=wear.min&&h.bpm<=wear.max&&
      isFinite(h.confidence)&&h.confidence>=wear.confidence){
      var bucket=probe.bucket;
      engine.detectedPulse(bucket);
      // Stop immediately and do not start a second probe in the same slot.
      stopProbe();scheduleProbe(bucket+1);
    }
  }
  function stopProbe(){
    if(timer!==undefined){clearTimeout(timer);timer=undefined;}
    if(probe){bangle.removeListener("HRM",onHRM);
      try{bangle.setHRMPower(0,HR_ID);}catch(e){}probe=undefined;}
  }
  function scheduleProbe(minBucket){
    if(!enabled||!wear.enabled)return;
    var now=clock(),bucket=Math.max(Math.floor(now/SLOT_MS),minBucket||0);
    var start=(bucket+1)*SLOT_MS-wear.seconds*1000;
    if(start<now){bucket++;start+=SLOT_MS;}
    if(typeof bangle.setHRMPower!=="function"){
      engine.failedProbe(bucket);return;
    }
    timer=setTimeout(function(){
      timer=undefined;
      var begin=clock(),end=(bucket+1)*SLOT_MS;
      // A late start is acceptable if at least 10 seconds remain.
      if(begin<start||begin>end-10000){
        engine.failedProbe(bucket);scheduleProbe(bucket+1);return;
      }
      probe={bucket:bucket,start:begin,end:end};
      bangle.on("HRM",onHRM);
      try{
        if(bangle.setHRMPower(1,HR_ID)===false)throw new Error("HRM unavailable");
      }catch(e){
        stopProbe();engine.failedProbe(bucket);scheduleProbe(bucket+1);return;
      }
      timer=setTimeout(function(){
        timer=undefined;
        var p=probe,done=clock();stopProbe();
        // Scheduled callback lateness must not discard a completed no-pulse test.
        if(p){
          engine.absentPulse(p.bucket);
          engine.sync(done);
        }
        scheduleProbe(bucket+1);
      },Math.max(1,end-clock()));
    },Math.max(1,start-now));
  }
  function configure(s){
    var on=s.restEnabled!==false,t=thresholdG(s.restThreshold),w=wearConfig(s);
    var key=JSON.stringify([t,w]);
    if(on===enabled&&(!on||key===configKey))return;
    stopProbe();
    if(enabled){bangle.removeListener("accel",onAccel);persist();}
    enabled=on;configKey=key;wear=w;
    if(on){
      engine=create({thresholdG:t,wearThresholdG:w.z,wearEnabled:w.enabled,
        nowMs:clock(),saved:storage.readJSON("orbit.rest.json",1),onCommit:persist});
      bangle.on("accel",onAccel);scheduleProbe();
    }else engine=undefined;
  }
  api={configure:configure,save:persist,isEnabled:function(){return enabled;},
    draw:function(graphics,map){draw(graphics,engine,map);},
    getDiagnostics:function(){return engine?engine.getDiagnostics():{disabled:true};},
    getEngine:function(){return engine;},sync:function(ms){if(engine)engine.sync(ms);}};
  bangle.orbitRest=api;
  if(events)events.on("kill",function(){stopProbe();persist();});
  configure(storage.readJSON("orbit.json",1)||{});
  return api;
}
function stageFor(percent){
  // Five visible lengths for worn records. No-data / non-wear are not visited.
  return Math.max(1,Math.min(5,1+Math.floor(Math.min(99,percent)/20)));
}
function draw(graphics,engine,map){
  if(!engine)return;
  // The selected maximum is now the stage-5 height.
  var r=map.radiusPx,height=Math.max(1,Math.min(map.maxHeightPx,14));
  var dir=map.south?1:-1,now=map.nowMs;
  engine.visit(now,function(bucket,value){
    // Plot at the interval END: a completed bar expires exactly 24 h later.
    var endMs=(bucket+1)*SLOT_MS,age=now-endMs;
    var a=map.currentAngleRad-dir*age*2*Math.PI/DAY_MS;
    var ca=Math.cos(a),sa=Math.sin(a),outer=r+height*stageFor(value)/5;
    // Match the observer ray's geometric sunrise/sunset at this bar's time.
    graphics.setColor(map.isDayAt&&map.isDayAt(endMs)?0x07E0:0xFFE0);
    graphics.drawLine(Math.round(map.cx+r*ca),Math.round(map.cy+r*sa),
      Math.round(map.cx+outer*ca),Math.round(map.cy+outer*sa));
  });
}
exports.create=create;
exports.install=install;
exports.draw=draw;
exports.percentFor=percentFor;
exports.stageFor=stageFor;
exports.constants={slotMs:SLOT_MS,count:COUNT,maxGapMs:MAX_GAP_MS,minCoverageMs:MIN_COVERAGE_MS};


exports.thresholdG=thresholdG;
exports.thresholds=THRESHOLDS;
