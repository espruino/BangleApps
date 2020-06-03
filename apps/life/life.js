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
var start=Date.now();
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
  var now = Date.now();
  const duration = Math.floor(now-start);
  start=now;
  ++generation;
  g.setFont("6x8",2);
  g.setFontAlign(-1,-1,0);
  g.drawString('Gen:'+generation+'  '+duration+'ms  ',20,220,true);
}

function next(){
    "ram";
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
    if (y==16){
      flip();
      var tmp = genA; genA=genB; genB=tmp;
      howlong();
      currentY=1;
    } else ++currentY;
}

function reset(){
  g.setColor(1,1,1);
  initDraw(genA);
  currentY=1;
  generation = 0;
}

var intervalRef = null;

function stopdraw() {
    if(intervalRef) {clearInterval(intervalRef);}
  }
  
function startdraw() {
    g.clear();
    Bangle.drawWidgets();
    g.reset();
    g.setColor(1,1,1);
    g.setFont("6x8",2);
    g.setFontAlign(0,0,3);
    g.drawString("Reset",230,200);
    intervalRef = setInterval(next,60);
  }
  
  function setButtons(){
    setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
    setWatch(reset, BTN3, {repeat:true,edge:"rising"});
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
  startdraw();
  setButtons();
  reset();
  