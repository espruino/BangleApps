Bangle.setLCDTimeout(30);

var buf = Graphics.createArrayBuffer(160,160,1,{msb:true});

function flip() {
 g.setColor(1,1,1);
 g.drawImage({width:160,height:160,bpp:1,buffer:buf.buffer},40,40);
 buf.clear();
}

var genA = new Uint8Array(324);
var genB = new Uint8Array(324);
var generation=0;
var gentime=0;
var currentY=1;

function initDraw(gen){
    for (let y = 1; y<17; ++y)
    for (let x = 1; x<17; ++x) {
        var r = Math.random()<0.5?1:0;
        gen[x+y*18] = r;
        if (r==1){
            var Xr=10*(x-1);
            var Yr=10*(y-1);
            buf.fillRect(Xr,Yr, Xr+7,Yr+7);
        } 
    } 
    flip();
}

function howlong(){
  ++generation;
  g.setFont("6x8",2);
  g.setFontAlign(-1,-1,0);
  gentime = Math.floor(gentime);
  g.drawString('Gen:'+generation+'  '+gentime+'ms  ',20,220,true);
  gentime=0;
}

function next(){
    "ram";
    var start = Date.now();
    var cur=genA, fut=genB, y=currentY;
    var count=(p)=>{return cur[p-19]+cur[p-18]+cur[p-17]+cur[p-1]+cur[p+1]+cur[p+17]+cur[p+18]+cur[p+19];};
    for (let x = 1; x<17; ++x){
        var ind = x+y*18;
        var nc = count(ind);
        var r = (cur[ind]==1 && nc==2 || nc==3)?1:0;
        fut[ind]=r;
        if (r==1){
        var Xr=10*(x-1);
        var Yr=10*(y-1);
        buf.fillRect(Xr,Yr, Xr+7,Yr+7);
        }
    }
    gentime+=(Date.now()-start);
    if (y==16){
      flip();
      var tmp = genA; genA=genB; genB=tmp;
      howlong();
      currentY=1;
    } else ++currentY;
}


var intervalRef = null;

function stopdraw() {
    if(intervalRef) {clearInterval(intervalRef);}
  }
  
function startdraw(init) {
    if (init===undefined) init=false;
    if(!init) g.clear();
    Bangle.drawWidgets();
    g.reset();
    g.setColor(1,1,1);
    g.setFont("6x8",1);
    g.setFontAlign(0,0,3);
    g.drawString("RESET",230,200);
    g.drawString("LAUNCH",230,130);
    g.drawString("CLOCK",230,60);
    if(!init) intervalRef = setInterval(next,65);
  }

function regen(){
  stopdraw();
  g.setColor(1,1,1);
  initDraw(genA);
  currentY=1;
  generation = 0;
  gentime=0;
  intervalRef = setInterval(next,65);
}
  
  function setButtons(){
    setWatch(()=>{load();}, BTN1, {repeat:false,edge:"falling"});
    setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
    setWatch(regen, BTN3, {repeat:true,edge:"rising"});
  }
  
  var SCREENACCESS = {
        withApp:true,
        request:function(){
          this.withApp=false;
          stopdraw();
          clearWatch();
        },
        release:function(){
          this.withApp=true;
          startdraw(); 
          setButtons();
        }
  }; 
  
  Bangle.on('lcdPower',function(on) {
    if (!SCREENACCESS.withApp) return;
    if (on) {
      startdraw();
    } else {
      stopdraw();
    }
  });
  
  g.clear();
  Bangle.loadWidgets();
  regen();
  startdraw(true);
  setButtons();
  