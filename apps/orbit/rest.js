/* tenkyu 3-axis high-pass peak-excess rest recorder; MIT.
 * Each valid 5-minute bin sums (|3D HPF peak| - noise threshold) for
 * suprathreshold local maxima, then maps that sum into five rest stages.
 * Non-wear retains 1-second XYZ mean-vector drift and periodic HRM probing.
 */
var SLOT_MS=300000,COUNT=288,DAY_MS=SLOT_MS*COUNT;
var HRM_FAILED=253,NOT_WORN=254,NO_DATA=255;
var HR_PENDING=0,HR_FOUND=1,HR_ABSENT=2,HR_FAILED=3;
var MAX_GAP_MS=2500,MIN_COVERAGE_MS=270000;
var THRESHOLDS=[0.001,0.003,0.009,0.027,0.081,0.243,0.729];
var ACTIVITY_DEFAULTS=[0.5,2,6,18],HP_TAU_MS=1600; // ~0.1Hz at 12.5Hz
function activityThresholds(v){
  var a=[],prev=0;
  for(var i=0;i<4;i++){
    var n=v&&v[i];
    if(!isFinite(n)||n<=prev)n=ACTIVITY_DEFAULTS[i];
    if(n<=prev)n=prev+0.1;
    a.push(n);prev=n;
  }
  return a;
}
function activityLevel(sum,cuts){
  return sum>=cuts[3]?0:sum>=cuts[2]?20:
    sum>=cuts[1]?40:sum>=cuts[0]?60:100;
}
// Extrapolate a valid >=270s observation to one full five-minute window.
// Lower coverage is UNKNOWN, never a reliable extrapolation.
function activity300(sum,coveredMs){
  return coveredMs>=MIN_COVERAGE_MS&&coveredMs<SLOT_MS?
    sum*SLOT_MS/coveredMs:sum;
}
function thresholdG(v){
  if(!isFinite(v)||v<=0)return 0.027;
  var best=0;
  for(var n=1;n<7;n++)if(Math.abs(Math.log(v/THRESHOLDS[n]))<Math.abs(Math.log(v/THRESHOLDS[best])))best=n;
  return THRESHOLDS[best];
}
function limit(v,lo,hi,def){return isFinite(v)?Math.max(lo,Math.min(hi,+v)):def;}
function wearConfig(s){return {enabled:s.restWearEnabled!==false,
  z:thresholdG(s.restWearThreshold===undefined?0.009:s.restWearThreshold),
  seconds:limit(s.restProbeSeconds,10,60,30),
  hold:s.restWearHold!==false,
  confidence:limit(s.restPulseConfidence,1,100,90)};}


/* Rest history retains 0..100 presentation codes for v2/v3 compatibility.
 * New results are quantized into 0,20,40,60,100 (stages 1..5).
 * 253=HRM failed (white); 254=unworn (red); 255=missing XYZ (blank).
 * Old percentages keep their displayed stages.
 */
function create(options){
  options=options||{};
  var levels=new Uint8Array(COUNT),stamps=new Uint32Array(COUNT);
  var threshold=thresholdG(options.thresholdG),threshold2=threshold*threshold;
  var cuts=activityThresholds(options.activityThresholds),save=options.onCommit;
  var wearG=thresholdG(options.wearThresholdG===undefined?0.009:options.wearThresholdG);
  var vecMotionRun=0,vecWornMotion=false;
  var vecSX=0,vecSY=0,vecSZ=0,vecCount=0,vecSecond=-1;
  var vecRefX,vecRefY,vecRefZ,vecMaxD2=0;
  var closedBucket=-1,closedStill=false,closedVectorOK=false,
    closedPercent=0,closedPulse=HR_PENDING,closedMotion=false;
  var current=-1,covered=0,activity=0,peakCount=0,lastMs,lastValid=false;
  var wearEnabled=!!options.wearEnabled,holdEnabled=!!options.holdEnabled,pulseState=HR_PENDING;
  var holdPulse=HR_PENDING,holdX,holdY,holdZ,lastX,lastY,lastZ,holdRun=0;
  var pulseConfidence=-1,closedConfidence=-1;
  var diag=options.saved&&options.saved.diag instanceof Array?
    options.saved.diag.slice(-12):[];
  var lpX,lpY,lpZ,qOld,qPrev;
  var old=options.saved,i,b,v;
  if(old&&(old.v===2||old.v===3)&&isFinite(old.end)&&typeof old.levels==="string"&&old.levels.length===COUNT*2){
    for(i=0;i<COUNT;i++){
      b=old.end-COUNT+1+i;v=parseInt(old.levels.substr(2*i,2),16);
      if(b>=0&&isFinite(v)&&v>=0&&v<=255){
        stamps[b%COUNT]=b;
        levels[b%COUNT]=old.v===2&&v===0?NO_DATA:v;
      }
    }
    if(old.active&&old.active.metric===2&&
       old.active.bucket===Math.floor(options.nowMs/SLOT_MS)&&
       old.active.gate===threshold&&
       JSON.stringify(old.active.cuts)===JSON.stringify(cuts)){
      current=old.active.bucket;
      covered=Math.max(0,Math.min(SLOT_MS,+old.active.covered||0));
      activity=Math.max(0,+old.active.activity||0);
      peakCount=Math.max(0,+old.active.peakCount||0);
    }
  }
  function resetPeak(){
    lpX=undefined;lpY=undefined;lpZ=undefined;qOld=undefined;qPrev=undefined;
  }
  function clearHold(){holdPulse=HR_PENDING;holdX=undefined;holdRun=0;}
  function establishHold(hr){
    if(!wearEnabled||!holdEnabled||lastX===undefined)return;
    if(hr!==HR_FOUND&&hr!==HR_ABSENT&&hr!==HR_FAILED)return;
    holdPulse=hr;holdX=lastX;holdY=lastY;holdZ=lastZ;holdRun=0;
  }
  function checkHeldMotion(x,y,z){
    if(holdPulse===HR_PENDING)return;
    var dx=x-holdX,dy=y-holdY,dz=z-holdZ;
    var d2=dx*dx+dy*dy+dz*dz,z2=wearG*wearG;
    if(d2>z2)holdRun++;else holdRun=0;
    if(holdRun>=2||d2>9*z2){clearHold();vecWornMotion=true;}
  }
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
      // Reject isolated noise in a motionless watch. Any large deviation
      // (>3x) or two consecutive above-threshold seconds proves motion.
      if(d2>wearG*wearG)vecMotionRun++;
      else vecMotionRun=0;
      if(vecMotionRun>=2||d2>9*wearG*wearG)vecWornMotion=true;
    }
    checkHeldMotion(x,y,z);
    lastX=x;lastY=y;lastZ=z;
    vecSX=0;vecSY=0;vecSZ=0;vecCount=0;
  }
  function resetVector(){
    vecSX=0;vecSY=0;vecSZ=0;vecCount=0;vecSecond=-1;
    vecRefX=undefined;vecRefY=undefined;vecRefZ=undefined;vecMaxD2=0;
    vecMotionRun=0;vecWornMotion=false;
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
    if(still){
      if(hr===HR_FOUND||hr===HR_PENDING&&holdPulse===HR_FOUND)return 100;
      if(hr===HR_FAILED||hr===HR_PENDING&&holdPulse===HR_FAILED)return HRM_FAILED;
      return NOT_WORN;
    }
    return NO_DATA;
  }
  function makeReason(ok,still,motion,hr){
    if(!ok)return "accel_missing";
    if(!wearEnabled)return "nonwear_disabled";
    if(motion)return "motion";
    if(still){
      if(hr===HR_FOUND)return "pulse_detected_still";
      if(hr===HR_FAILED)return "nonwear_hrm_failed";
      if(hr===HR_PENDING&&holdPulse===HR_FOUND)return "pulse_held_still";
      if(hr===HR_PENDING&&holdPulse===HR_ABSENT)return "nonwear_held";
      if(hr===HR_PENDING&&holdPulse===HR_FAILED)return "hrm_retry_wait";
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
      diag[j].pulse=closedPulse;diag[j].confidence=closedConfidence;diag[j].result=v;
      diag[j].reason=makeReason(closedVectorOK,closedStill,closedMotion,closedPulse);
      break;
    }
    if(closedVectorOK&&closedStill&&closedPulse!==HR_PENDING)
      establishHold(closedPulse);
    if(save)save();
  }
  function markProbe(bucket,status,confidence){
    if(bucket===current){
      pulseState=status;
      if(status===HR_FAILED&&!vecWornMotion&&covered>=MIN_COVERAGE_MS)
        establishHold(HR_FAILED);
      if(isFinite(confidence)&&confidence>=0)pulseConfidence=confidence;
    }else if(bucket===closedBucket){
      closedPulse=status;
      if(isFinite(confidence)&&confidence>=0)closedConfidence=confidence;
      updateClosed();
    }
  }
  function roll(ms){
    var target=Math.floor(ms/SLOT_MS),changed=false;
    if(target===current)return false;
    if(current>=0&&target>current){
      flushVector();
      closedBucket=current;
      // One skipped accelerometer event must not invalidate 270+ seconds
      // of observed data. Missing major portions still yield NO_DATA.
      closedVectorOK=vecRefX!==undefined&&covered>=MIN_COVERAGE_MS;
      closedMotion=closedVectorOK&&vecWornMotion;
      closedStill=closedVectorOK&&!closedMotion;
      var corrected=closedVectorOK?activity300(activity,covered):undefined;
      closedPercent=activityLevel(corrected===undefined?activity:corrected,cuts);
      closedPulse=pulseState;closedConfidence=pulseConfidence;
      i=current%COUNT;stamps[i]=current;
      levels[i]=chooseLevel(closedVectorOK,closedStill,closedMotion,closedPulse,closedPercent);
      diag.push({bucket:current,coverageSec:Math.round(covered/1000),
        driftG:Math.round(Math.sqrt(vecMaxD2)*10000)/10000,
        motion:closedMotion,
        activity:Math.round(activity*1000)/1000,
        activity300:corrected===undefined?null:Math.round(corrected*1000)/1000,
        peaks:peakCount,valid:closedVectorOK,pulse:closedPulse,confidence:closedConfidence,
        result:levels[i],
        reason:makeReason(closedVectorOK,closedStill,closedMotion,closedPulse)});
      if(diag.length>12)diag.shift();
      if(closedVectorOK&&closedStill&&closedPulse!==HR_PENDING)
        establishHold(closedPulse);
      changed=true;
    }else if(current>=0&&target<current){
      for(i=0;i<COUNT;i++)if(stamps[i]>=target){stamps[i]=0;levels[i]=0;}
      clearHold();closedBucket=-1;changed=true;
    }
    current=target;covered=0;activity=0;peakCount=0;resetPeak();resetVector();
    // No persistent gap-failure flag: covered duration is authoritative.
    pulseState=HR_PENDING;pulseConfidence=-1;
    if(changed&&save)save();
    return changed;
  }
  function detectPeak(a,dt){
    // Three 1st-order HPFs, streaming; one adaptive coefficient per XYZ event.
    if(lpX===undefined){
      lpX=a.x;lpY=a.y;lpZ=a.z;qOld=undefined;qPrev=undefined;
      return;
    }
    var alpha=dt/(HP_TAU_MS+dt);
    lpX+=alpha*(a.x-lpX);lpY+=alpha*(a.y-lpY);lpZ+=alpha*(a.z-lpZ);
    var x=a.x-lpX,y=a.y-lpY,z=a.z-lpZ,q=x*x+y*y+z*z;
    // Detect brief displacements even if the one-second mean returns to rest.
    if(holdPulse!==HR_PENDING&&q>9*wearG*wearG){
      clearHold();vecWornMotion=true;
    }
    // Gate on squared threshold BEFORE looking for a local maximum.
    // Only accepted peaks compute sqrt; subthreshold peaks never do.
    if(qOld!==undefined&&qPrev>=threshold2&&qPrev>qOld&&qPrev>=q){
      activity+=Math.sqrt(qPrev)-threshold;peakCount++;
    }
    qOld=qPrev;qPrev=q;
  }
  function sample(a,ms){
    if(!isFinite(ms)||ms<0)return;
    var z=a&&a.z,valid=!!a&&isFinite(a.x)&&isFinite(a.y)&&isFinite(z),
      dt=lastMs===undefined?0:ms-lastMs;
    var continuous=lastValid&&valid&&dt>0&&dt<=MAX_GAP_MS;
    var target=Math.floor(ms/SLOT_MS);
    if(!continuous){
      // Equal timestamps are possible when a boundary timer and accelerometer
      // event coincide; only a genuine gap/rewind invalidates the held state.
      if(lastMs!==undefined&&(!valid||dt>MAX_GAP_MS||dt<0))clearHold();
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
    if(valid){
      addVector(a,ms);
      detectPeak(a,continuous?dt:0);
    }
    lastMs=ms;lastValid=!!valid;
  }
  function sync(ms){
    if(Math.floor(ms/SLOT_MS)!==current){
      roll(ms);lastMs=ms;lastValid=false;
    }
  }
  function absentPulse(bucket,confidence){markProbe(bucket,HR_ABSENT,confidence);}
  function detectedPulse(bucket,confidence){markProbe(bucket,HR_FOUND,confidence);}
  function failedProbe(bucket){markProbe(bucket,HR_FAILED);}
  function level(bucket){return stamps[bucket%COUNT]===bucket?
    (levels[bucket%COUNT]>100?0:levels[bucket%COUNT]):0;}
  function visit(ms,fn,onNonWear,onFailure){
    var end=Math.floor(ms/SLOT_MS)-1,b,v;
    for(b=end-COUNT+1;b<=end;b++)if(b>=0&&stamps[b%COUNT]===b){
      v=levels[b%COUNT];
      if(v<=100)fn(b,v);
      else if(v===NOT_WORN&&onNonWear)onNonWear(b);
      else if(v===HRM_FAILED&&onFailure)onFailure(b);
      // Missing XYZ coverage (255) is always transparent.
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
      active:{metric:2,bucket:current,gate:threshold,cuts:cuts,
        covered:covered,activity:activity,peakCount:peakCount}};
  }
  return {sample:sample,sync:sync,absentPulse:absentPulse,detectedPulse:detectedPulse,
    failedProbe:failedProbe,visit:visit,snapshot:snapshot,level:level,
    getDiagnostics:function(){return {bucket:current,coverageSec:Math.round(covered/1000),
      driftG:Math.round(Math.sqrt(vecMaxD2)*10000)/10000,
      motion:vecWornMotion,vectorValid:vecRefX!==undefined,
      pulse:pulseState,confidence:pulseConfidence,holdState:holdPulse,
      probeStatus:"0=pending,1=detected,2=absent,3=failed",
      recent:diag.slice()};},
    hasMotion:function(bucket){return bucket===current&&vecWornMotion;},
    hasPulse:function(bucket){return bucket===current&&pulseState===HR_FOUND;},
    hasRecentAccel:function(ms){return lastValid&&lastMs!==undefined&&
      ms>=lastMs&&ms-lastMs<=MAX_GAP_MS;},
    getWearHold:function(){return holdPulse;},
    getLive:function(){return {bucket:current,covered:covered,peaks:peakCount,
      activity:activity,level:activityLevel(activity,cuts)};}};
}
function install(bangle,storage,events,clock){
  clock=clock||function(){return Date.now();};
  if(bangle.orbitRest)return bangle.orbitRest;
  var engine,enabled=false,configKey,api,wear,probe,timer,failedAttempts=0;
  var sampleMs=0,nextSampleAt=0,sharedPulseCount=0;
  var HR_ID="orbitrest";
  function persist(){if(engine)try{storage.writeJSON("orbit.rest.json",engine.snapshot());}catch(e){}}
  function onAccel(a){
    var now=clock();
    if(sampleMs){
      // Phase-locked 200 ms slots: alternating 160/240 ms hardware samples
      // average 5 Hz without altering the accelerometer for other apps.
      if(now<nextSampleAt)return;
      nextSampleAt=nextSampleAt&&now-nextSampleAt<=sampleMs?
        nextSampleAt+sampleMs:now+sampleMs;
    }
    var wasFailed=engine.getWearHold()===HR_FAILED;
    engine.sample(a,now);
    if(wasFailed&&engine.getWearHold()!==HR_FAILED){
      // Motion or a sensor-data gap invalidates the prior failure verdict.
      failedAttempts=0;stopProbe();scheduleProbe(Math.floor(now/SLOT_MS)+1);
    }else if(probe&&engine.hasMotion(probe.bucket)){
      var bucket=probe.bucket;
      failedAttempts=0;stopProbe();scheduleProbe(bucket+1);
    }
  }
  function onHRM(h){
    // Subscribe once for the lifetime of the boot-owned recorder.
    // Events from another HRM user are accepted without powering the
    // optical sensor on. An existing, good pulse avoids a new probe.
    if(!enabled||!wear.enabled||!h||!isFinite(h.bpm)||h.bpm<0||
       !isFinite(h.confidence))return;
    if(probe){
      probe.hasData=true;
      if(h.confidence>probe.maxConfidence)probe.maxConfidence=h.confidence;
    }
    if(h.bpm<=0||h.confidence<=wear.confidence)return;
    var now=clock(),bucket=Math.floor(now/SLOT_MS);
    if(!engine.hasRecentAccel(now)||engine.hasMotion(bucket))return;
    if(engine.getWearHold()===HR_FOUND||engine.hasPulse(bucket))return;
    // Only live, sufficiently reliable readings count. Never reuse
    // the firmware's older heart-rate history for wear detection.
    if(!probe||!probe.ownsPower)sharedPulseCount++;
    failedAttempts=0;
    engine.detectedPulse(bucket,h.confidence);
    stopProbe();scheduleProbe(bucket+1);
  }
  function stopProbe(){
    if(timer!==undefined){clearTimeout(timer);timer=undefined;}
    if(probe){
      var own=probe.ownsPower;
      probe=undefined;
      // Release only this application's request; leave other apps alone.
      if(own)try{bangle.setHRMPower(0,HR_ID);}catch(e){}
    }
  }
  // First real HRM failure: retry in 60 seconds. Further failures:
  // retry every 900 seconds. Timing starts at failure, not bin boundary.
  function failProbe(bucket){
    engine.failedProbe(bucket);
    failedAttempts++;
    if(!enabled||!wear.enabled)return;
    var delay=failedAttempts===1?60000:900000;
    timer=setTimeout(function(){
      timer=undefined;
      if(engine.getWearHold()===HR_FOUND||engine.getWearHold()===HR_ABSENT){
        failedAttempts=0;scheduleProbe();return;
      }
      var now=clock(),b=Math.floor(now/SLOT_MS);
      if(!engine.hasRecentAccel(now)||engine.hasMotion(b)){
        failedAttempts=0;scheduleProbe(b+1);return;
      }
      beginProbe(b,now+wear.seconds*1000);
    },delay);
  }
  function beginProbe(bucket,end){
    var begin=clock();
    if(!engine.hasRecentAccel(begin)||engine.hasMotion(Math.floor(begin/SLOT_MS))){
      failedAttempts=0;scheduleProbe(Math.floor(begin/SLOT_MS)+1);return;
    }
    probe={bucket:bucket,maxConfidence:-1,hasData:false,ownsPower:false};
    // If another app/widget already powers HRM, observe its event
    // stream for this window without requesting additional sensor power.
    var alreadyOn=false;
    try{alreadyOn=typeof bangle.isHRMOn==="function"&&bangle.isHRMOn();}
    catch(e){}
    if(!alreadyOn){
      probe.ownsPower=true;
      try{
        if(bangle.setHRMPower(1,HR_ID)===false)throw new Error("HRM unavailable");
      }catch(e){
        stopProbe();failProbe(bucket);return;
      }
    }
    timer=setTimeout(function(){
      timer=undefined;
      var p=probe,done=clock();stopProbe();
      if(p){
        if(p.hasData){
          failedAttempts=0;engine.absentPulse(p.bucket,p.maxConfidence);
          engine.sync(done);scheduleProbe(p.bucket+1);
        }else{
          failProbe(p.bucket);engine.sync(done);
        }
      }
    },Math.max(1,end-clock()));
  }
  function scheduleProbe(minBucket){
    if(!enabled||!wear.enabled)return;
    var now=clock(),bucket=Math.max(Math.floor(now/SLOT_MS),minBucket||0);
    var start=(bucket+1)*SLOT_MS-wear.seconds*1000;
    if(start<now){bucket++;start+=SLOT_MS;}
    if(typeof bangle.setHRMPower!=="function"){
      failProbe(bucket);return;
    }
    timer=setTimeout(function(){
      timer=undefined;
      var begin=clock(),end=(bucket+1)*SLOT_MS;
      if(begin<start||begin>end-10000){failProbe(bucket);return;}
      if(engine.getWearHold()===HR_FOUND||engine.getWearHold()===HR_ABSENT||
        engine.hasPulse(bucket)||engine.hasMotion(bucket)||!engine.hasRecentAccel(begin)){
        scheduleProbe(bucket+1);return;
      }
      beginProbe(bucket,end);
    },Math.max(1,start-now));
  }
  function configure(s){
    var on=s.restEnabled!==false,t=thresholdG(s.restThreshold),w=wearConfig(s);
    var stages=activityThresholds([
      s.restActivityT1,s.restActivityT2,s.restActivityT3,s.restActivityT4]);
    var eco=s.restEco===true;
    var key=JSON.stringify([t,w,stages,eco]);
    if(on===enabled&&(!on||key===configKey))return;
    stopProbe();
    if(enabled){
      bangle.removeListener("accel",onAccel);
      bangle.removeListener("HRM",onHRM);
      persist();
    }
    enabled=on;configKey=key;wear=w;failedAttempts=0;sharedPulseCount=0;
    sampleMs=eco?200:0;nextSampleAt=0;
    if(on){
      engine=create({thresholdG:t,activityThresholds:stages,
        wearThresholdG:w.z,wearEnabled:w.enabled,holdEnabled:w.hold,
        nowMs:clock(),saved:storage.readJSON("orbit.rest.json",1),onCommit:persist});
      bangle.on("accel",onAccel);
      if(w.enabled)bangle.on("HRM",onHRM);
      scheduleProbe();
    }else engine=undefined;
  }
  api={configure:configure,save:persist,isEnabled:function(){return enabled;},
    draw:function(graphics,map){draw(graphics,engine,map);},
    getDiagnostics:function(){
      var d=engine?engine.getDiagnostics():{disabled:true};
      d.sharedPulseCount=sharedPulseCount;return d;
    },
    getEngine:function(){return engine;},
    isProbing:function(){return !!probe;},
    sync:function(ms){if(engine)engine.sync(ms);}};
  bangle.orbitRest=api;
  if(events)events.on("kill",function(){
    stopProbe();
    bangle.removeListener("HRM",onHRM);
    persist();
  });
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
  var dir=map.south?1:-1,now=map.nowMs,scale=2*Math.PI/DAY_MS;
  // One five-minute slot spans 1.25 degrees around the lunar orbit.
  // Rotate each arc endpoint using constants to avoid extra trig calls.
  var step=dir*2*Math.PI/COUNT,cs=Math.cos(step),ss=Math.sin(step);
  var lastBucket=-2,ca=0,sa=0;
  function pointAt(bucket){
    // When bins are contiguous, reuse a single rotation rather than
    // recomputing sine/cosine twice for each of up to 288 bars.
    if(bucket===lastBucket+1){
      var nc=ca*cs-sa*ss;
      sa=sa*cs+ca*ss;ca=nc;
    }else if(bucket!==lastBucket){
      var a=map.currentAngleRad-dir*(now-(bucket+1)*SLOT_MS)*scale;
      ca=Math.cos(a);sa=Math.sin(a);
    }
    lastBucket=bucket;
  }
  function drawArc(bucket,color){
    pointAt(bucket);
    graphics.setColor(color);
    graphics.drawLine(
      Math.round(map.cx+r*(ca*cs+sa*ss)),
      Math.round(map.cy+r*(sa*cs-ca*ss)),
      Math.round(map.cx+r*ca),Math.round(map.cy+r*sa));
  }
  engine.visit(now,function(bucket,value){
    // Plot at the interval END: a completed bar expires exactly 24 h later.
    pointAt(bucket);
    var endMs=(bucket+1)*SLOT_MS,outer=r+height*stageFor(value)/5;
    // Match the observer ray's geometric sunrise/sunset at this bar's time.
    graphics.setColor(map.isDayAt&&map.isDayAt(endMs)?0x07E0:0xFFE0);
    graphics.drawLine(Math.round(map.cx+r*ca),Math.round(map.cy+r*sa),
      Math.round(map.cx+outer*ca),Math.round(map.cy+outer*sa));
  },function(bucket){
    drawArc(bucket,0xF800); // Confirmed no pulse: red.
  },function(bucket){
    drawArc(bucket,0xFFFF); // HRM failed: white.
  });
}
exports.create=create;
exports.install=install;
exports.draw=draw;
exports.activityLevel=activityLevel;
exports.activity300=activity300;
exports.activityThresholds=activityThresholds;
exports.stageFor=stageFor;
exports.constants={slotMs:SLOT_MS,count:COUNT,maxGapMs:MAX_GAP_MS,minCoverageMs:MIN_COVERAGE_MS,
  hrmFailed:HRM_FAILED,unworn:NOT_WORN,noData:NO_DATA};


exports.thresholdG=thresholdG;
exports.thresholds=THRESHOLDS;
exports.activityDefaults=ACTIVITY_DEFAULTS;
