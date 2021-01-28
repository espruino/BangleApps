var fontsize = 3;
var locale = require("locale");
var marginTop = 40;
var flag = false;
var WeekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];


const NONE_MODE = "none";
const ID_MODE = "id";
const VER_MODE = "ver";
const BATT_MODE = "batt";
const MEM_MODE = "mem";
let infoMode = NONE_MODE;

function drawAll(){
  updateTime();
  updateRest(new Date());
}

function updateRest(now){
  let date = locale.date(now,false);
  writeLine(WeekDays[now.getDay()],1);
  writeLine(date,2);
  drawInfo(5);
}
function updateTime(){
  if (!Bangle.isLCDOn()) return;
  let now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  h = h>=10?h:"0"+h;
  m = m>=10?m:"0"+m;
  writeLine(h+":"+m,0);
  writeLine(flag?" ":"_",3);
  flag = !flag;
  if(now.getMinutes() == 0)
    updateRest(now);
}
function writeLineStart(line){
  g.drawString(">",4,marginTop+line*30);
}
function writeLine(str,line){
  g.setFont("6x8",fontsize);
  //g.setColor(0,1,0);
  g.setColor(0,0x07E0,0);
  g.setFontAlign(-1,-1);
  g.clearRect(0,marginTop+line*30,((str.length+1)*20),marginTop+25+line*30);
  writeLineStart(line);
  g.drawString(str,25,marginTop+line*30);
} 

function drawInfo(line) {
  let val;
  let str = "";
  let col = 0x07E0; // green

  switch(infoMode) {
  case NONE_MODE:
    col = 0x0000;
    str = "";
    break;
  case ID_MODE:
    val = NRF.getAddress().split(":");
    str = "Id: " + val[4] + val[5];
    break;
  case VER_MODE:
    str = "Fw: " + process.env.VERSION;
    break;
  case MEM_MODE:
    val = process.memory();
    str = "Memory: " + Math.round(val.usage*100/val.total) + "%";
    break;
  case BATT_MODE:
  default:
    str = "Battery: " + E.getBattery() + "%";
  }

  g.setColor(col);
  g.fillRect(0, marginTop-3+line*30, 239, marginTop+25+line*30);
  g.setColor(0,0,0);
  g.setFontAlign(0, -1);
  g.drawString(str, g.getWidth()/2, marginTop+line*30);
}

function changeInfoMode() {
  switch(infoMode) {
  case NONE_MODE:
    infoMode = ID_MODE;
    break;
  case ID_MODE:
    infoMode = VER_MODE;
    break;
  case VER_MODE:
    infoMode = BATT_MODE;
    break;
  case BATT_MODE:
    infoMode = MEM_MODE;
    break;
  case MEM_MODE:
  default:
    infoMode = NONE_MODE;
  }
}

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawAll();
Bangle.on('lcdPower',function(on) {
  if (on)
    drawAll();
});
var click = setInterval(updateTime, 1000);
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
setWatch(() => { changeInfoMode(); drawAll(); }, BTN1, {repeat: true});
