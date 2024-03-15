// place your const, vars, functions or classes here
var s=require("Storage");
let stid;
let hour = -1;
let minute = -1;
const resetFace = ()=>{
	Bangle.setLCDMode();
	g.setClipRect(0,24,239,239)
	g.clear();
};
const readImage =(img) =>{
	return (s.read(img));
};
const drawFace = ()=>{
	resetFace();
	g.drawImages([
     {image:readImage("pipe.img"),x:180,y:160,scale:2},
     {image:readImage("flower_b.img"),x:180,y:128,scale:2},
     {image:readImage("mario_wh.img"),x:100,y:132,scale:2},
     {image:readImage("enemy.img"),x:20,y:165,scale:2},
	]).drawImages([
     {image:readImage("brick2.img"),x:0,y:196,repeat:true,scale:2}
	]);
	drawBanner();
};

const resetTimer =()=>{
  if (stid) {
    clearInterval(stid);
    stid = undefined;
  }
}
const startTimer =() =>{
  hour = -1;
  minute = -1;
  stid = setInterval(onHalfSecond,500);
}
const drawBanner = (h) =>{
    if(h == undefined) h=24;
	g.drawImages([
     {image:readImage("banner-up.img"),x:g.getWidth()/2-100,y:50},
     {image:readImage("banner-down.img"),x:g.getWidth()/2-100,y:(50+24+h)}
	])
};

const updateTimeBanner = (h,m)=>{
    m = (m<10?'0':'')+m;
    h = (h<10?'0':'')+h;
    const bx1=g.getWidth()/2-90;
    const by1=50+10;
    const bx2=g.getWidth()/2+90;
    const by2=50+62;
  
    g.setFontCustom(eval(s.read("supmario30x24.bin")), 48, eval(s.read("supmario30x24.wdt")), 24);
    g.setClipRect(bx1,by1,bx2,by2).clearRect(bx1,by1,bx2,by2);
    g.drawString(h,bx1+35,75).drawString(":",g.getWidth()/2,75).drawString(m,bx1+110,75).flip();
};
let om = 0;
const onHalfSecond =()=>{
	var d = new Date();
	var sec =  d.getSeconds();
	hour = d.getHours();
	minute = d.getMinutes();
	if(minute>om)updateTimeBanner(hour,minute);
	let im, pos;
	if(sec%2 == 0){im = "flower_b.img";pos = 20;}
	else{im = "flower.img";pos = 25;}
	g.setClipRect(180,128,180+32,128+32).clearRect(180,128,180+32,128+32).drawImage(readImage(im),180,128,{scale:2});
	g.setClipRect(20,165,25+32,165+32).clearRect(20,165,25+32,165+32).drawImage(readImage("enemy.img"),pos,165,{scale:2});
	om = minute;
};


Bangle.on('lcdPower', (on) => {
  resetTimer();
  if (on) {
    om=-1;
    startTimer();
    drawFace();
  }	else {
		resetTimer();
	}
});
resetTimer();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawFace();
startTimer();
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
