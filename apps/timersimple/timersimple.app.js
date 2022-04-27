Modules.addCached("Layout",function(){function Layout(d,b){function e(a){a.id&&(h[a.id]=a),a.type||(a.type=''),a.c&&a.c.forEach(e)}this._l=this.l=d,this.physBtns=process.env.HWVERSION==2?1:3,b=b||{},this.lazy=b.lazy||!1;var c,f;if(Bangle.setUI(),process.env.HWVERSION!=2){c=[];function a(b){b.type=='btn'&&c.push(b),b.c&&b.c.forEach(a)}a(d),c.length&&(this.physBtns=0,this.buttons=c,this.selectedButton=-1,Bangle.setUI({mode:'updown',back:b.back},c=>{var a=this.selectedButton,b=this.buttons.length;if(c===undefined&&this.buttons[a])return this.buttons[a].cb();this.buttons[a]&&(delete this.buttons[a].selected,this.render(this.buttons[a])),a=(a+b+c)%b,this.buttons[a]&&(this.buttons[a].selected=1,this.render(this.buttons[a])),this.selectedButton=a}),f=!0)}if(b.back&&!f&&Bangle.setUI({mode:'custom',back:b.back}),b.btns){var a=b.btns;if(this.b=a,this.physBtns>=a.length){function b(a,b){b.time-b.lastTime>.75&&this.b[a].cbl?this.b[a].cbl(b):this.b[a].cb&&this.b[a].cb(b)}let c=Math.floor(Bangle.appRect.h/this.physBtns);Bangle.btnWatches&&Bangle.btnWatches.forEach(clearWatch),Bangle.btnWatches=[],this.physBtns>2&&a.length==1&&a.unshift({label:''});while(this.physBtns>a.length)a.push({label:''});a[0]&&Bangle.btnWatches.push(setWatch(b.bind(this,0),BTN1,{repeat:!0,edge:-1})),a[1]&&Bangle.btnWatches.push(setWatch(b.bind(this,1),BTN2,{repeat:!0,edge:-1})),a[2]&&Bangle.btnWatches.push(setWatch(b.bind(this,2),BTN3,{repeat:!0,edge:-1})),this._l.width=g.getWidth()-8,this._l={type:'h',filly:1,c:[this._l,{type:'v',pad:1,filly:1,c:a.map(a=>(a.type='txt',a.font='6x8',a.height=c,a.r=1,a))}]}}else this._l.width=g.getWidth()-32,this._l={type:'h',c:[this._l,{type:'v',c:a.map(a=>(a.type='btn',a.filly=1,a.width=32,a.r=1,a))}]},c&&c.push.apply(c,this._l.c[1].c)}if(process.env.HWVERSION==2){function a(b,c){b.cb&&c.x>=b.x&&c.y>=b.y&&c.x<=b.x+b.w&&c.y<=b.y+b.h&&(c.type==2&&b.cbl?b.cbl(c):b.cb&&b.cb(c)),b.c&&b.c.forEach(b=>a(b,c))}Bangle.touchHandler=(c,b)=>a(this._l,b),Bangle.on('touch',Bangle.touchHandler)}var h=this;e(this._l),this.updateNeeded=!0}function prepareLazyRender(a,h,b,i,c){var d=a.bgCol==null?c:g.toColor(a.bgCol);if(d!=c||a.type=='txt'||a.type=='btn'||a.type=='img'||a.type=='custom'){var e=a.c;delete a.c;var f='H'+E.CRC32(E.toJS(a));if(e&&(a.c=e),!delete h[f]){var j=i[f]=[a.x,a.y,a.x+a.w-1,a.y+a.h-1];j.bg=c==null?g.theme.bg:c,b&&(b.push(a),b=null)}}if(a.c)for(var k of a.c)prepareLazyRender(k,h,b,i,d)}Layout.prototype.remove=function(a){Bangle.btnWatches&&(Bangle.btnWatches.forEach(clearWatch),delete Bangle.btnWatches),Bangle.touchHandler&&(Bangle.removeListener('touch',Bangle.touchHandler),delete Bangle.touchHandler)},Layout.prototype.render=function(b){function c(a){"ram";g.reset(),a.col!==undefined&&g.setColor(a.col),a.bgCol!==undefined&&g.setBgColor(a.bgCol).clearRect(a.x,a.y,a.x+a.w-1,a.y+a.h-1),f[a.type](a)}b||(b=this._l),this.updateNeeded&&this.update();var f={'':function(){},txt:function(a){if(a.wrap){g.setFont(a.font).setFontAlign(0,-1);var b=g.wrapString(a.label,a.w),c=a.y+(a.h-g.getFontHeight()*b.length>>1);b.forEach((b,d)=>g.drawString(b,a.x+(a.w>>1),c+g.getFontHeight()*d))}else g.setFont(a.font).setFontAlign(0,0,a.r).drawString(a.label,a.x+(a.w>>1),a.y+(a.h>>1))},btn:function(a){var b=a.x+(0|a.pad),c=a.y+(0|a.pad),d=a.w-(a.pad<<1),e=a.h-(a.pad<<1),f=[b,c+4,b+4,c,b+d-5,c,b+d-1,c+4,b+d-1,c+e-5,b+d-5,c+e-1,b+4,c+e-1,b,c+e-5,b,c+4],h=a.selected?g.theme.bgH:g.theme.bg2;g.setColor(h).fillPoly(f).setColor(a.selected?g.theme.fgH:g.theme.fg2).drawPoly(f),a.col!==undefined&&g.setColor(a.col),a.src?g.setBgColor(h).drawImage('f'==(typeof a.src)[0]?a.src():a.src,a.x+10+(0|a.pad),a.y+8+(0|a.pad)):g.setFont('6x8',2).setFontAlign(0,0,a.r).drawString(a.label,a.x+a.w/2,a.y+a.h/2)},img:function(a){g.drawImage('f'==(typeof a.src)[0]?a.src():a.src,a.x+(0|a.pad),a.y+(0|a.pad),a.scale?{scale:a.scale}:undefined)},custom:function(a){a.render(a)},h:function(a){a.c.forEach(c)},v:function(a){a.c.forEach(c)}};if(this.lazy){this.rects||(this.rects={});var a=this.rects.clone(),d=[];prepareLazyRender(b,a,d,this.rects,null);for(var h in a)delete this.rects[h];var i=Object.keys(a).map(b=>a[b]).reverse();for(var e of i)g.setBgColor(e.bg).clearRect.apply(g,e);d.forEach(c)}else c(b)},Layout.prototype.forgetLazyState=function(){this.rects={}},Layout.prototype.layout=function(a){switch(a.type){case'h':{var b=a.x+(0|a.pad),h=0,d=a.c&&a.c.reduce((a,b)=>a+(0|b.fillx),0);d||(b+=a.w-a._w>>1,d=1);var e=b;a.c.forEach(c=>{c.x=0|e,b+=c._w,h+=0|c.fillx,e=b+Math.floor(h*(a.w-a._w)/d),c.w=0|e-c.x,c.h=0|(c.filly?a.h-(a.pad<<1):c._h),c.y=0|a.y+(0|a.pad)+((1+(0|c.valign))*(a.h-(a.pad<<1)-c.h)>>1),c.c&&this.layout(c)});break}case'v':{var c=a.y+(0|a.pad),i=0,f=a.c&&a.c.reduce((a,b)=>a+(0|b.filly),0);f||(c+=a.h-a._h>>1,f=1);var g=c;a.c.forEach(b=>{b.y=0|g,c+=b._h,i+=0|b.filly,g=c+Math.floor(i*(a.h-a._h)/f),b.h=0|g-b.y,b.w=0|(b.fillx?a.w-(a.pad<<1):b._w),b.x=0|a.x+(0|a.pad)+((1+(0|b.halign))*(a.w-(a.pad<<1)-b.w)>>1),b.c&&this.layout(b)});break}}},Layout.prototype.debug=function(a,b){a||(a=this._l),b=b||1,g.setColor(b&1,b&2,b&4).drawRect(a.x+b-1,a.y+b-1,a.x+a.w-b,a.y+a.h-b),a.pad&&g.drawRect(a.x+a.pad-1,a.y+a.pad-1,a.x+a.w-a.pad,a.y+a.h-a.pad),b++,a.c&&a.c.forEach(a=>this.debug(a,b))},Layout.prototype.update=function(){function b(a){"ram";if(c[a.type](a),a.r&1){var b=a._w;a._w=a._h,a._h=b}a._w=0|Math.max(a._w+(a.pad<<1),0|a.width),a._h=0|Math.max(a._h+(a.pad<<1),0|a.height)}delete this.updateNeeded;var c={txt:function(a){if(a.font.endsWith('%')&&(a.font='Vector'+Math.round(g.getHeight()*a.font.slice(0,-1)/100)),a.wrap)a._h=a._w=0;else{var b=g.setFont(a.font).stringMetrics(a.label);a._w=b.width,a._h=b.height}},btn:function(a){var b=a.src?g.imageMetrics('f'==(typeof a.src)[0]?a.src():a.src):g.setFont('6x8',2).stringMetrics(a.label);a._h=16+b.height,a._w=20+b.width},img:function(a){var b=g.imageMetrics('f'==(typeof a.src)[0]?a.src():a.src),c=a.scale||1;a._w=b.width*c,a._h=b.height*c},'':function(a){a._w=0,a._h=0},custom:function(a){a._w=0,a._h=0},h:function(a){a.c.forEach(b),a._h=a.c.reduce((a,b)=>Math.max(a,b._h),0),a._w=a.c.reduce((a,b)=>a+b._w,0),a.fillx==null&&a.c.some(a=>a.fillx)&&(a.fillx=1),a.filly==null&&a.c.some(a=>a.filly)&&(a.filly=1)},v:function(a){a.c.forEach(b),a._h=a.c.reduce((a,b)=>a+b._h,0),a._w=a.c.reduce((a,b)=>Math.max(a,b._w),0),a.fillx==null&&a.c.some(a=>a.fillx)&&(a.fillx=1),a.filly==null&&a.c.some(a=>a.filly)&&(a.filly=1)}},a=this._l;b(a),a.fillx||a.filly?(a.w=Bangle.appRect.w,a.h=Bangle.appRect.h,a.x=Bangle.appRect.x,a.y=Bangle.appRect.y):(a.w=a._w,a.h=a._h,a.x=Bangle.appRect.w-a.w>>1,a.y=Bangle.appRect.y+(Bangle.appRect.h-a.h>>1)),this.layout(a)},Layout.prototype.clear=function(a){a||(a=this._l),g.reset(),a.bgCol!==undefined&&g.setBgColor(a.bgCol),g.clearRect(a.x,a.y,a.x+a.w-1,a.y+a.h-1)},exports=Layout});

const secondsToTime = (s) => new Object({h:Math.floor((s/3600) % 24), m:Math.floor((s/60) % 60), s:Math.floor(s % 60)});
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
function formatTime(s) {
  var t = secondsToTime(s);
  if (t.h) {
    return t.h + ':' + ("0" + t.m).substr(-2) + ':' + ("0" + t.s).substr(-2);
  } else {
    return t.m + ':' + ("0" + t.s).substr(-2);
  }
}

Bangle.loadWidgets();
Bangle.drawWidgets();

var Layout = require("Layout");
var seconds = 5 * 60;
var drawTimeout;
var timerLayout;
var timePickerLayout;
var imgArrowDown = Graphics.createImage(`
xxx   xxx
xxx   xxx
 xxx xxx 
 xxx xxx 
  xxxxx
  xxxxx
   xxx
   xxx
    x
`);
var imgArrowUp = Graphics.createImage(`
    x
   xxx
   xxx
  xxxxx
  xxxxx
 xxx xxx 
 xxx xxx 
xxx   xxx
xxx   xxx
`);

function onDrag(event) {
  var scale = 1;
  if (event.x < timePickerLayout.hours.w) {
    scale = 3600;
  } else if (event.x > timePickerLayout.mins.x && event.x < timePickerLayout.secs.x) {
    scale = 60;
  }
  seconds -= Math.round(event.dy/5) * scale;
  updateTimePicker();
}

function onTouch(button, xy) {
  var touchMidpoint = timePickerLayout.hours.y + timePickerLayout.hours.h/2;
  var diff = 0;
  if (xy.y > 24 && xy.y < touchMidpoint - 10) {
    diff = 1;
  } else if (xy.y > touchMidpoint + 10 && xy.y < timePickerLayout.btnStart.y) {
    diff = -1;
  } else if (xy.y > timePickerLayout.btnStart.y) {
    runTimer();
    return;
  }
  if (xy.x < timePickerLayout.hours.w) {
    diff *= 3600;
  } else if (xy.x > timePickerLayout.mins.x && xy.x < timePickerLayout.secs.x) {
    diff *= 60;
  }
  seconds += diff;
  updateTimePicker();
}

function updateTimePicker() {
  seconds = clamp(seconds, 0, 24 * 3600 - 1);
  var set_time = secondsToTime(seconds);
  updateLayoutField(timePickerLayout, 'hours', set_time.h);
  updateLayoutField(timePickerLayout, 'mins', set_time.m); 
  updateLayoutField(timePickerLayout, 'secs', set_time.s); 
}

function updateLayoutField(layout, field, value) {
  layout.clear(layout[field]);
  layout[field].label = value;
  layout.render(layout[field]);
}

function updateTimer() {
  var timeToNext = require("sched").getTimeToAlarm(require("sched").getAlarm("simpletimer"));
  var d = new Date();
  updateLayoutField(timerLayout, 'timer', formatTime(timeToNext / 1000)); 
  updateLayoutField(timerLayout, 'time', require("locale").time(d,1)); 
  queueDraw(1000);
}

function queueDraw(millisecs) {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    updateTimer();
  }, millisecs - (Date.now() % millisecs));
}

function timerStop() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  seconds = require("sched").getTimeToAlarm(require("sched").getAlarm("simpletimer")) / 1000;
  require("sched").setAlarm("simpletimer", undefined);
  require("sched").reload();
  runTimePicker(); 
}

var timePickerLayoutCode = {
  type:"v", c: [
    {type:undefined, height:2},
    //{type:"txt", font:"15%", label:"TIMER", id:"title"},
    {type:"h", c: [
      {type:"v", c: [
        {type:"txt", font:"6x8", label:/*LANG*/"Hours", col:g.theme.fg2},
        {type:"img", pad:8, src:imgArrowUp, col:g.theme.fg2},
        {type:"txt", font:"20%", label:"0", id:"hours", filly:1, fillx:1},
        {type:"img", pad:8, src:imgArrowDown, col:g.theme.fg2}
      ]},
      {type:"v", c: [
        {type:"txt", font:"6x8", label:/*LANG*/"Minutes", col:g.theme.fg2},
        {type:"img", pad:8, src:imgArrowUp, col:g.theme.fg2},
        {type:"txt", font:"20%", label:"0", id:"mins", filly:1, fillx:1},
        {type:"img", pad:8, src:imgArrowDown, col:g.theme.fg2}
      ]},
      {type:"v", c: [
        {type:"txt", font:"6x8", label:/*LANG*/"Seconds", col:g.theme.fg2},
        {type:"img", pad:8, src:imgArrowUp, col:g.theme.fg2},
        {type:"txt", font:"20%", label:"0", id:"secs", filly:1, fillx:1},
        {type:"img", pad:8, src:imgArrowDown, col:g.theme.fg2}
      ]},
    ]},
    {type:"btn", font:"12x20", label:"Start", id:"btnStart", fillx:1 }
  ], filly:1
};

var timerLayoutCode = {
  type:"v", c: [
    {type:undefined, height:8},
    {type:"txt", font:"6x8", label:/*LANG*/"Timer", id:"title", col:g.theme.fg2},
    {type:"txt", font:"22%", label:"0:00", id:"timer", fillx:1, filly:1 },
    {type:"h", c: [
      {type:"txt", font:"6x8", pad:8, label:/*LANG*/"Time Now:",  halign:-1, col:g.theme.fg2},
      {type:"txt", font:"6x8", label:"00:00", id:"time", halign:1, col:g.theme.fg2},
    ]},
    {type:"btn", font:"12x20", label:"Stop", cb: l=>timerStop(), fillx:1 }
  ], filly:1
};

function runTimePicker() {
  g.clearRect(Bangle.appRect);
  timePickerLayout = new Layout(timePickerLayoutCode);
  Bangle.setUI({
    mode : "custom",
    touch : function(n,e) {onTouch(n,e);},
    drag : function(e) {onDrag(e);},
    btn : function(n) {runTimer();},
  });
  timePickerLayout.render();
  updateTimePicker();
}

function runTimer() {
  require("sched").setAlarm("simpletimer", {
    //msg : "Mr Flibble is very angry!",
    vibrate : ".-.-",
    hidden: true,
    timer : seconds * 1000
  });
  require("sched").reload();
  g.clearRect(Bangle.appRect);
  timerLayout = new Layout(timerLayoutCode);
  timerLayout.render();
  updateTimer();
}

var timeToNext = require("sched").getTimeToAlarm(require("sched").getAlarm("simpletimer"));
if (timeToNext != undefined) {
  g.clearRect(Bangle.appRect);
  timerLayout = new Layout(timerLayoutCode);
  timerLayout.render();
  updateTimer();
} else {
  runTimePicker();
}
