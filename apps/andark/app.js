const c={"x":g.getWidth()/2,"y":g.getHeight()/2};
let zahlpos=[];
let unlock = false;

function zeiger(len,dia,tim){
  const x =c.x+ Math.cos(tim)*len/2,
        y =c.y + Math.sin(tim)*len/2,
        d={"d":3,"x":dia/2*Math.cos(tim+Math.PI/2),"y":dia/2*Math.sin(tim+Math.PI/2)},
        pol=[c.x-d.x,c.y-d.y,c.x+d.x,c.y+d.y,x+d.x,y+d.y,x-d.x,y-d.y];
  return pol;

}

function draw(){
  const d=new Date();
  let m=d.getMinutes(), h=d.getHours(), s=d.getSeconds();
  //draw black rectangle in the middle to clear screen from scale and hands
  g.setColor(0,0,0);
  g.fillRect(10,10,2*c.x-10,2*c.x-10);
  g.setColor(1,1,1);

  if(h>12){
    h=h-12;
  }
  //calculates the position of the minute, second and hour hand
  h=2*Math.PI/12*(h+m/60)-Math.PI/2;
  //more accurate
  //m=2*Math.PI/60*(m+s/60)-Math.PI/2;
  m=2*Math.PI/60*(m)-Math.PI/2;

  s=2*Math.PI/60*s-Math.PI/2;
  g.setFontAlign(0,0);
  g.setFont("Vector",10);
  let dateStr = "    "+require("locale").date(d)+"    ";
  g.drawString(dateStr, c.x, c.y+20, true);
 // g.drawString(d.getDate(),1.4*c.x,c.y,true);
  g.drawString(Math.round(E.getBattery()/5)*5+"%",c.x,c.y+40,true);
  drawlet();
  //g.setColor(1,0,0);
  const hz = zeiger(100,5,h);
  g.fillPoly(hz,true);
 // g.setColor(1,1,1);
  const minz = zeiger(150,5,m);
  g.fillPoly(minz,true);
  if (unlock){
  const sekz = zeiger(150,2,s);
  g.fillPoly(sekz,true);
  }
  g.fillCircle(c.x,c.y,4);



}
//draws the scale once the app is startet
function drawScale(){
  for(let i=-14;i<47;i++){
    const win=i*2*Math.PI/60;
    let d=2;
    if(i%5==0){d=5;}
    g.fillPoly(zeiger(300,d,win),true);
    g.setColor(0,0,0);
    g.fillRect(10,10,2*c.x-10,2*c.x-10);
    g.setColor(1,1,1);
  }
}

//draws the numbers on the screen

function drawlet(){
  g.setFont("Vector",20);
  for(let i = 0;i<12;i++){
     g.drawString(zahlpos[i][0],zahlpos[i][1],zahlpos[i][2]);
  }
}
//calcultes the Position of the numbers when app starts and saves them in an array
function setlet(){
  let sk=1;
  for(let i=-10;i<50;i+=5){
     let win=i*2*Math.PI/60;
     let xsk =c.x+2+Math.cos(win)*(c.x-10),
         ysk =c.y+2+Math.sin(win)*(c.x-10);
    if(sk==3){xsk-=10;}
    if(sk==6){ysk-=10;}
    if(sk==9){xsk+=10;}
    if(sk==12){ysk+=10;}
    if(sk==10){xsk+=3;}
    zahlpos.push([sk,xsk,ysk]);
    sk+=1;
  }
}
setlet();
// Clear the screen once, at startup
g.setBgColor(0,0,0);
g.clear();
drawScale();
draw();

let secondInterval= setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on

Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
      secondInterval = setInterval(draw, 1000);
      draw(); // draw immediately
  }else{
  }
});
Bangle.on('lock',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (!on) {
      secondInterval = setInterval(draw, 1000);
      unlock = true;
      draw(); // draw immediately
  }else{
     secondInterval = setInterval(draw, 60000);
     unlock = false;
     draw();
  }
 });

// Show launcher when middle button pressed
Bangle.setUI("clock");
