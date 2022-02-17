/*
7x7DotsClock

by Peter Kuppelwieser

*/

let settings = Object.assign({ swupApp: "",swdownApp: "", swleftApp: "", swrightApp: ""}, require("Storage").readJSON("7x7dotsclock.json", true) || {});

// position on screen
var Xs = 0, Ys = 30,Xe = 175, Ye=175;
//const Xs = 0, Ys = 0,Xe = 175, Ye=175;
var SegH = (Ye-Ys)/2,SegW = (Xe-Xs)/2;
var Dx = SegW/14, Dy = SegH/16;

const hColor = [1,1,1];
const mColor = [0.3,0.3,1];
const bColor = [0.2,0.2,0.2];

const Font = [
              [
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1],
               [1,1,0,0,0,1,1],
               [1,1,0,0,0,1,1],
               [1,1,0,0,0,1,1],
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1]
              ],
              [
               [0,0,0,1,1,0,0],
               [0,0,0,1,1,0,0],
               [0,0,0,1,1,0,0],
               [0,0,0,1,1,0,0],
               [0,0,0,1,1,0,0],
               [0,0,0,1,1,0,0],
               [0,0,0,1,1,0,0],
              ],
              [
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1],
               [0,0,0,0,0,1,1],
               [1,1,1,1,1,1,1],
               [1,1,0,0,0,0,0],
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1]
              ],
              [
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1],
               [0,0,0,0,0,1,1],
               [0,0,0,1,1,1,1],
               [0,0,0,0,0,1,1],
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1]
              ],
              [
               [1,1,0,0,0,0,0],
               [1,1,0,0,0,0,0],
               [1,1,0,1,1,0,0],
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1],
               [0,0,0,1,1,0,0],
               [0,0,0,1,1,0,0]
              ],
              [
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1],
               [1,1,0,0,0,0,0],
               [1,1,1,1,1,1,1],
               [0,0,0,0,0,1,1],
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1]
              ],
              [
               [1,1,0,0,0,0,0],
               [1,1,0,0,0,0,0],
               [1,1,0,0,0,0,0],
               [1,1,1,1,1,1,1],
               [1,1,0,0,0,1,1],
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1]
              ],
              [
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1],
               [0,0,0,0,0,1,1],
               [0,0,0,0,0,1,1],
               [0,0,0,0,0,1,1],
               [0,0,0,0,0,1,1],
               [0,0,0,0,0,1,1]
              ],
              [
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1],
               [1,1,0,0,0,1,1],
               [1,1,1,1,1,1,1],
               [1,1,0,0,0,1,1],
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1]
              ],
              [
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1],
               [1,1,0,0,0,1,1],
               [1,1,1,1,1,1,1],
               [1,1,1,1,1,1,1],
               [0,0,0,0,0,1,1],
               [0,0,0,0,0,1,1]
              ],
             ];

// Global Vars
var dho = -1, eho = -1, dmo = -1, emo = -1;


function drawHSeg(x1,y1,x2,y2,Num,dColor,Size) {
  g.setColor(0,0,0);
  g.fillRect(x1, y1, x2, y2);
  for (let i = 1; i < 8; i++) {
    for (let j = 1; j < 8; j++) {
      if (Font[Num][j-1][i-1] == 1) {
        g.setColor(dColor[0],dColor[1],dColor[2]);
        g.fillCircle(x1+Dx+(i-1)*(x2-x1)/7,y1+Dy+(j-1)*(y2-y1)/7,Size);
      } else {
        g.setColor(bColor[0],bColor[1],bColor[2]);
        g.fillCircle(x1+Dx+(i-1)*(x2-x1)/7,y1+Dy+(j-1)*(y2-y1)/7,1);
      }
    }
  }
}


function drawSSeg(x1,y1,x2,y2,Num,dColor,Size) {
  for (let i = 1; i < 8; i++) {
    for (let j = 1; j < 8; j++) {
      if (Font[Num][j-1][i-1] == 1) {
        g.setColor(dColor[0],dColor[1],dColor[2]);
        g.fillCircle(x1+(i-1)*(x2-x1)/7,y1+(j-1)*(y2-y1)/7,Size);
      }
    }
  }
}


function ShowSecons() {
  g.setColor(1,1,1);
  g.fillRect((Xe-Xs) / 2 - 14 + Xs -3,
            (Ye-Ys) / 2 - 7 + Ys  -3,
            (Xe-Xs) / 2 + 14 + Xs +1,
            (Ye-Ys) / 2 + 7 + Ys  +1);


  drawSSeg(  (Xe-Xs) / 2 - 14 + Xs -1,
            (Ye-Ys) / 2 - 7 + Ys  ,
            (Xe-Xs) / 2     + Xs -1,
            (Ye-Ys) / 2 + 7 + Ys,
            ds,mColor,1);

  drawSSeg(  (Xe-Xs) / 2     + Xs +1,
            (Ye-Ys) / 2 - 7 + Ys,
            (Xe-Xs) / 2 + 14 + Xs +1,
            (Ye-Ys) / 2 + 7 + Ys,
            es,mColor,1);

}

function draw() {
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();


  dh = Math.floor(h/10);
  eh = h - dh * 10;

  dm =  Math.floor(m/10);
  em = m - dm * 10;

  ds =  Math.floor(s/10);
  es = s - ds * 10;


  // Reset the state of the graphics library
  g.reset();
  if (dh != dho) {
    g.setColor(1,1,1);
    drawHSeg(Xs, Ys, Xs+SegW, Ys+SegH,dh,hColor,4);
    dho = dh;
  }

  if (eh != eho) {
    g.setColor(1,1,1);
    drawHSeg(Xs+SegW+Dx, Ys, Xs+SegW*2, Ys+SegH,eh,hColor,4);
    eho = eh;
  }

  if (dm != dmo) {
    g.setColor(0.3,0.3,1);
    drawHSeg(Xs, Ys+SegH+Dy, Xs+SegW, Ys+SegH*2,dm,mColor,4);
    dmo = dm;
  }

  if (em != emo) {
    g.setColor(0.3,0.3,1);
    drawHSeg(Xs+SegW+Dx, Ys+SegH+Dy, Xs+SegW*2, Ys+SegH*2,em,mColor,4);
    emo = em;
  }

  if (!Bangle.isLocked()) ShowSecons();

}


function actions(v){
   if(BTN1.read() === true) {
      print("BTN pressed");
      Bangle.showLauncher();
   }        
  
   if(v==-1){
     print("up swipe event");
     if(settings.swupApp != "") load(settings.swupApp);
     print(settings.swupApp);
   } else if(v==1) {
     print("down swipe event");
     if(settings.swdownApp != "")  load(settings.swdownApp);
     print(settings.swdownApp);
   } else {
     print("touch event");
   }
}

// Get Messages status
var messages = require("Storage").readJSON("messages.json",1)||[];

//var BTconnected = NRF.getSecurityStatus().connected;
//NRF.on('connect',BTconnected = NRF.getSecurityStatus().connected);
//NRF.on('disconnect',BTconnected = NRF.getSecurityStatus().connected);


function drawWidgeds() {

  //Bluetooth
  //print(BluetoothDevice.connected);
  var x1Bt = 160;
  var y1Bt = 0;
  var x2Bt = x1Bt + 30;
  var y2Bt = y2Bt;

  if (NRF.getSecurityStatus().connected)
    g.setColor((g.getBPP()>8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
  else
    g.setColor(g.theme.dark ? "#666" : "#999");
  g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="),x1Bt,y1Bt);  

  
  //Battery
  //print(E.getBattery());
  //print(Bangle.isCharging());
  
  var x1B = 130;
  var y1B = 2;
  var x2B = x1B + 20;
  var y2B = y1B + 15;
  
  g.setColor(g.theme.bg);
  g.clearRect(x1B,y1B,x2B,y2B);
  
  g.setColor(g.theme.fg);
  g.drawRect(x1B,y1B,x2B,y2B);
  g.fillRect(x1B,y1B,x1B+(E.getBattery()*(x2B-x1B)/100),y2B);
  g.fillRect(x2B,y1B+(y2B-y1B)/2-3,x2B+4,y1B+(y2B-y1B)/2+3);

  

  //Messages

  var x1M = 100;
  var y1M = y1B;
  var x2M = x1M + 30;
  var y2M = y2B;

  if (messages.some(m=>m.new)) {
    g.setColor(g.theme.fg);
    g.fillRect(x1M,y1M,x2M,y2M);
    g.setColor(g.theme.bg);
    g.drawLine(x1M,y1M,x1M+(x2M-x1M)/2,y1M+(y2M-y1M)/2);
    g.drawLine(x1M+(x2M-x1M)/2,y1M+(y2M-y1M)/2,x2M,y1M);
  }
  
  var strDow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var d = new Date();
  var dow = d.getDay(),day = d.getDate(), month = d.getMonth() + 1, year = d.getFullYear();

  print(strDow[dow] + ' ' + day  + '.' + month  + ' ' + year);
  
  g.setFontAlign(-1, -1,0);
  g.setFont("Vector", 20);
  g.drawString(strDow[dow] + ' ' + day, 0, 0, true);
  
}




function SetFull(on) {
    dho = -1; eho = -1; dmo = -1; emo = -1;
    g.clear();

    if (on === true) {
      Ys = 0;
      Bangle.setUI("clock");
      Bangle.on('swipe', function(direction) {  });

    } else {
      Ys = 30;
      Bangle.setUI("updown",actions);
      Bangle.on('swipe', function(direction) { 
        switch (direction) {
          case 1:
            print("swipe left event");
            if(settings.swleftApp != "")  load(settings.swleftApp);
            print(settings.swleftApp);
            break;
          case -1:
            print("swipe right event");            
            if(settings.swrightApp != "")  load(settings.swrightApp);
            print(settings.swrightApp);
            break;
          default:
            print("swipe undefined event");
        }
       });
    }

    SegH = (Ye-Ys)/2;
    Dy = SegH/16;
  
    draw();

    if (on != true) {
      //Bangle.loadWidgets();
      //Bangle.drawWidgets();
      drawWidgeds();
    }
}

Bangle.on('lock', function(on) {
  SetFull(on);
});


SetFull(Bangle.isLocked());

var secondInterval = setInterval(draw, 1000);
