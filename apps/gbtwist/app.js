//   just a watch, to fill an empty screen

function drwClock() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var time = ("0"+h).substr(-2) + ":" + ("0"+m).substr(-2);
  g.reset();
  g.setFont('6x8',7);
  g.setFontAlign(-1,-1);
  g.drawString(time,20,80);
}

g.clear();
drwClock();
Bangle.loadWidgets();
Bangle.drawWidgets();

/////////////////////////////////////////////////////////////
//   control music by twist/buttons

var counter = 0; //stores your counted your twists
var tstate = false; //are you ready to count the twists?

function playx() {
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify({t:"music", n:"play"}));
}

function volup() {
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify({t:"music", n:"volumeup"}));
}

function voldn() {
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify({t:"music", n:"volumedown"}));
}

function sendCmd() {
  print (counter);
  Bangle.beep(200,3000);
  if (tstate==false && counter>0){
  do {playx(); counter--;}
  while (counter >= 1);
  }
}

function twistctrl() {
  if (tstate==false){
    tstate=true;
    setTimeout('tstate=false',4000);
    setTimeout(sendCmd,4100);
    Bangle.beep(200,3000);
  }
  else{
  g.clearRect(10,140,230,200);
  if (tstate==true){
  if (counter < 5){
    counter++;
    drwCmd();
    Bangle.buzz(100,2);
    }
  else {
    counter = 0;
    Bangle.buzz(400);
       }
  }
  }
}

function drwCmd() {
  g.setFont('6x8',6);
  g.setColor(0.3,1,0.3);
  g.clearRect(10,140,230,200);
switch (counter){
  case 1:
  g.drawString('play',50,150);
  break;
  case 2:
  g.drawString('next',50,150);
  break;
  case 3:
  g.drawString('prev',50,150);
  break;
  case 4:
  g.drawString('nx f',50,150);
  break;
  case 5:
  g.drawString('pr f',50,150);
  break;
  case 0:
  g.clearRect(10,140,230,200);
  break;
}
}

setWatch(volup,BTN1,{repeat:true});
setWatch(voldn,BTN3,{repeat:true});
Bangle.on('twist',twistctrl);
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});