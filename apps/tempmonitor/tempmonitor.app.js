// Temperature monitor that saves a log of measures
// standalone ver for  developer, to remove testing lines
// delimiter ; (excel) or , (oldscool)
/* REFACTOR and remove commented code related to
SetUI, Layout, and setWatch( function(b) { }, BTN1, { repeat: true, edge:'falling' })
*/
{
var v_mode_debug=0; //, 0=no, 1 min, 2 prone detail
//var required for drawing with dynamic screen
var rect = Bangle.appRect;
var history = [];
var readFreq=4000; //ms //PEND add to settings
if (v_mode_debug>0) var saveFreq=6000; //ms for testin 6sec
else var saveFreq=60000; //ms  1min
var v_saveToFile= new Boolean(true); //true save //false
//with upload file º is not displayed properly
//with upload RAM º is  displayed
var v_t_symbol="";//ºC
var v_saved_entries=0;
var v_filename ="temphistory.csv";
var lastMeasure = new String();
var v_model=process.env.BOARD;
var v_color_erase=g.getBgColor(); //original BG color overwritten on SetVariables
var v_color=g.getColor();//original FG color
var id_rec_intv; //var for the recording interval
var v_t_max=-50; //preset with an opposite and impossible record measure
var v_t_min=70;

if (readFreq>saveFreq) console.log("Read refresh freq should be higher than saving");
if (v_mode_debug>0) console.log("original BG/FG color="+v_color_erase+" / "+v_color);


let v_font_size1;
let v_font_size2;
function SetVariables(){
//EMSCRIPTEN,EMSCRIPTEN2
if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') {
v_font_size1=16;
v_font_size2=50;
}else{
//Banglejs2 or others
v_font_size1=11; //too small?
v_font_size2=40;
}
//overwriting default BG, is better detect?
if (g.theme.dark==1)  v_color_erase=0x0000; //dynamic; //bg black
else if (g.theme.dark==0)  v_color_erase=0xFFFF; //dynamic; //bg white
}

//print result
function printTemperature(v_temp) {
if (v_mode_debug>1) console.log("v_temp in "+v_temp+" entries "+v_saved_entries);

// Avg of temperature readings
while (history.length>4) history.shift();
history.push(v_temp);
var avrTemp = E.sum(history) / history.length;
//var t = require('locale').temp(avrTemp);
//.replace("'","°");
lastMeasure=avrTemp.toString();
if (lastMeasure.length>4) lastMeasure=lastMeasure.substr(0,4);


ClearBox();
//g.setFont("6x8",2).setFontAlign(0,0);
g.setFontVector(v_font_size1).setFontAlign(0,0);
var x = (rect.x+(rect.x2-60))/2;//-60 space for graph and layout buttons
var y = (rect.y+rect.y2)/2 + 20;

if (v_saveToFile==true) {
// if (v_mode_debug>0) console.log("prev color="+v_color);
printInfo("Recording : "+v_saved_entries, '#CC3333',x,rect.y+30);
//g.setColor('#CC3333');    //red
// g.drawString("Recording : "+v_saved_entries, x, rect.y+35);
//g.setColor(v_color);//restore default color
}
else printInfo("Rec paused : "+v_saved_entries, v_color,x,rect.y+30);
//else g.drawString("Rec paused : "+v_saved_entries, x, rect.y+35);
//space for printing info
g.drawString("Temperature:", x, rect.y+45+(v_font_size1*2));

if (v_temp>v_t_max) {
g.setColor(v_color_erase);
g.drawString(v_t_max.toString().substr(0,5), rect.x2-40,(rect.y2/2)-30);
v_t_max=v_temp;
g.setColor(v_color);
}
g.drawString(v_t_max.toString().substr(0,5), rect.x2-40,(rect.y2/2)-30);
if (v_temp<v_t_min) {
g.setColor(v_color_erase);
g.drawString(v_t_min.toString().substr(0,5), rect.x2-40,(rect.y2/2)+50);
v_t_min=v_temp;
g.setColor(v_color);
}
g.drawString(v_t_min.toString().substr(0,5), rect.x2-40,(rect.y2/2)+50);



//dynamic font (g.getWidth() > 200 ? 60 : 40)
g.setFontVector(v_font_size2).setFontAlign(0,0);

//DRAW temperature in the center
//5 char required for negative degrees
g.drawString((v_temp.toString().substr(0,5))+v_t_symbol, x, y);
g.flip();
}
// from: BJS2 pressure sensor,  BJS1 inbuilt thermistor
function getTemperature() {
if(v_model.substr(0,10)!='EMSCRIPTEN'){
  /*//supposed more aqcurate and it works but sometimes promise fails
  //Uncaught Error: Unhandled promise rejection: undefined    
    if (Bangle.getPressure) {
   if (v_mode_debug>1) console.log("getpressure supported but..");
    //v_pressure=Bangle.getPressure().then(print);
    //wait for premise
    Bangle.getPressure().then(p =>{if (p)  v_pressureTemp=p.temperature; v_pressurePress=p.pressure;
     if (v_mode_debug>1) console.log("getpressure t, p: "+v_pressureTemp+" , "+v_pressurePress);
     if ((v_pressureTemp) && (v_pressureTemp!="")) printTemperature(v_pressureTemp)
      else  printTemperature(E.getTemperature());
    });  
  } else printTemperature(E.getTemperature());
}*/
 printTemperature(E.getTemperature());
}
else  printTemperature(-11.2+Math.random());//fake temperature medition for emulators
}

/* Note that it changes BG and also FG to an opposite*/
function changeBGcolor(){
//pend to refactor
if (v_mode_debug>1) console.log("before BG/FG  "+v_color_erase+" /"+v_color);
v_color_erase=0xFFFF-v_color_erase;
v_color=0xFFFF-v_color;
if (v_mode_debug>1) console.log("after result BG/FG "+v_color_erase+" /"+v_color);
//g.setColor(color_result);
g.setBgColor(v_color_erase);// 0 white, 1 black
g.setColor(v_color);
//move to event?
ClearScreen();
ClearBox();//?
getTemperature();
drawGraph();
//setDrawLayout(); //uncomment if layout can work with setUI
//g.clear();//impact on widgets
}

function saveToFile(){
//input global vars: lastMeasure
var a=new Date();
var strlastSaveTime=new String();
strlastSaveTime=a.toISOString();
//strlastSaveTime=strlastSaveTime.concat(a.getFullYear(),a.getMonth()+1,a.getDate(),a.getHours(),a.getMinutes());;
if (v_mode_debug>1) console.log("saving="+strlastSaveTime+";"+a.getHours()+":"+a.getMinutes()+";"+lastMeasure);
if (v_saveToFile==true){
//write(strlastSaveTime+";"+
//var f = require("Storage").open(v_filename,"r");
// f=require("Storage").read(v_filename+"\1");//suffix required  load completely!!
//note that .read uses Storage Class  .open uses StorageFile Class , difference in file chunks
// if (v_mode_debug>0)  console.log("f  "+f);
var f = require("Storage").open(v_filename,"r");
if ((v_mode_debug>0) && (v_saved_entries==0)) console.log("file info:"+f);
if (f.len>0) {
if (!f) {
require("Storage").open(v_filename,"w").write("Month;Day;Time;Temp"+"\n");
if (v_mode_debug>0)  console.log("not exist but created "+f);
}
else{
require("Storage").open(v_filename,"a").write((a.getMonth()+1)+";"+a.getDate()+";"+a.getHours()+":"+a.getMinutes()+";"+lastMeasure+"\n");
//(getTime()+",");
v_saved_entries=v_saved_entries+1;
if (v_mode_debug>1) console.log("append to already exist "+f.name+" , "+v_saved_entries);
}
}
}
else if (v_mode_debug>0) console.log("recording mode stopped");
}

function drawGraph(){
if (v_mode_debug>1) console.log("drawGraph");
var img_obj_thermo =   {
width : 36, height : 36, bpp : 3,
transparent : 0,
buffer : require("heatshrink").decompress(atob("AEFt2AMKm3bsAMJjdt23ABhEB+/7tgaJ///DRUP//7tuADRP923YDRXbDRfymwaJhu/koaK7eyiwaK3cLDRlWDRY1NKBY1Ztu5kjmJg3cyVI7YMHgdu5Mkyu2fxHkyVJjdgDRFJkmRDRPsDQNbDQ5QBGoONKBJrBoxQIQwO2eRcbtu24AMIFIQLJAH4AMA=="))
};
g.drawImage(img_obj_thermo,rect.x2-60,rect.y2/2);
g.flip();
}
function ClearScreen(){
//avoid widget areas
g.setBgColor(v_color_erase);
g.clearRect(rect.x, rect.y+24, rect.x2, rect.y2-24);
g.flip();
}
function ClearBox(){
//custom boxarea , left space for static graph at right
g.setBgColor(v_color_erase);
g.clearRect(rect.x, rect.y+24, rect.x2-60, rect.y2-24);
g.flip();
}
function introPage(){
//g.setFont("6x8",2).setFontAlign(0,0);
g.setFontVector(v_font_size1).setFontAlign(-1,0);
//x alignment. -1=left (default), 0=center, 1=right
var x=3;
//dynamic positions as height for BJS1 is double than BJS2
var y = (rect.y+rect.y2)/2 + 10;
g.drawString("   Default values  ", x, y - ((v_font_size1*3)+2));
g.drawString("--------------------", x, y - ((v_font_size1*2)+2));
g.drawString("Mode debug: "+v_mode_debug, x, y - ((v_font_size1*1)+2));
g.drawString("Read frq(ms): "+readFreq, x, y );
g.drawString("Save file: "+v_saveToFile, x, y+ ((v_font_size1*1)+2) );
g.drawString("Save frq(ms):"+saveFreq, x, y+((v_font_size1*2)+2) );
const fr=require("Storage").read(v_filename+"\1");//suffix required
if (fr)  g.drawString("Filesize:"+fr.length.toString()+"kb", x, y+((v_font_size1*3)+2) );
else g.drawString("File not exist", x, y+((v_font_size1*3)+2));
}
function printInfo(pmsg, pcolor,px,py){
g.setColor(pcolor);
g.setFontVector(v_font_size1).setFontAlign(0,0);
g.drawString(pmsg, px,py+v_font_size1);
g.setColor(v_color);//restore default color
}
function toggleRecMode(duration, exectime){
//bydefault float, standard epoch requires *1000
if (v_mode_debug>0)  console.log("duration"+duration);
if (duration>2) {      //delete file
var x = (rect.x+(rect.x2-60))/2;
printInfo("Deleting file",'#CC3333',x, rect.y+32+v_font_size1);
//  g.setColor('#CC3333');    //red

//too long "Deleting file: "+v_filename,
// for  StorageFiles created with require("Storage").open(filename, ...)
//require("Storage").erase(v_filename);
//TODO refactor in a new function
//var mifile = require("Storage").open(v_filename,"w");
var mifile = require("Storage").open("temphistory.csv","w");
var v_output=mifile.erase();
//mifile.StorageFile.erase();
if (v_mode_debug>0) console.log("output"+v_output);
setTimeout(function() { if (v_mode_debug>0) console.log("pause for 1 sec");},1000);
return; //leave this function
}
if (v_saveToFile) v_saveToFile=false;
else v_saveToFile=true;
if (v_mode_debug>0)  console.log("recording? "+v_saveToFile);
setRecordingFreq();
}

function setRecordingFreq(){
if (v_saveToFile==true) { //TODO now start on false btn will no enable
id_rec_intv=setInterval(function() {
saveToFile();
}, saveFreq); //ms
if (v_mode_debug>0) console.log("interval id / frq"+id_rec_intv+" / "+saveFreq);
}
else if (id_rec_intv){
clearInterval(id_rec_intv);
if (v_mode_debug>0)  console.log("rec interval removed, id "+id_rec_intv);
id_rec_intv=0; // to reset var
}
}

function UserInput(){
//theoretically incompatible with Layout
Bangle.setUI({
mode : "custom",
//adds a back icon on top widget area
back : function() {load();},
//touch : function(n,e) {}, // optional - handler for 'touch' events
// righ/Left 1/-1 , updown
swipe : function(dir_rl,dir_ud) {
if(dir_rl == 1) {
if (v_mode_debug>0)  console.log("swipe right: ");
getFileInfo(v_filename);
}
else if (dir_rl == -1){
if (v_mode_debug>0)  console.log("swipe left: ");
changeBGcolor();
}
},
touch : function(tzone,tobj){
if ((process.env.HWVERSION == 2)&&(v_mode_debug>0)){
console.log("tobj x,y,type : "+tobj.x+" "+tobj.y+" "+tobj.type);
}
switch(tzone){
//case 1: //left , back managed by setUI
case 2: // right disable/enable recording
toggleRecMode(0);  //toggleRecMode(duration, exectime)
break;
// case 3: console.log("Touch 3 aka 1+2 not for BJS1 emul");//center 1+2
//   break;
}
},
//inferior to
btn : function(btn) {
if(btn == 1) {
if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') toggleRecMode(1); //console.log("btn1 BJS1");
else mainBtnShortcut(); //console.log("btn1 BJS2");
}
else if (btn == 2) mainBtnShortcut(); //console.log("btn2 BJS1");
else if (btn == 3) changeBGcolor(); //console.log("btn3 BJS1");
}
});  //endof setUI

}

function mainBtnShortcut() {
//if messages app installed shortcut otherwise default access to launcher
if  (require("Storage").read("messagegui.app.js")===undefined)
{
if (require("Storage").read("messagelist.app.js")===undefined)  Bangle.showLauncher(); // implies btn2(js1)  btn(js2)- launcher
else if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') load("messagelist.app.js");
else load("messagelist.app.js");
}
else if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') load("messagegui.app.js");
else load("messagegui.app.js");
}


// Show file size
function getFileInfo(v_filename) {
var f = require("Storage").open(v_filename,"r");
//todo refactor and reuse common code
g.setFontVector(v_font_size1).setFontAlign(0,0);
var x = (rect.x+(rect.x2-60))/2;
printInfo("file size:"+f.len,v_color,x, rect.y+32+v_font_size1);
// g.drawString("file size:"+f.len, x, rect.y+37+v_font_size1);
if (v_mode_debug>0)  console.log("file "+v_filename+" size: "+f.len);
}// not used


//MAIN
SetVariables();
Bangle.loadWidgets();
ClearScreen();
introPage();
//setDrawLayout(); //uncomment if layout can work with setUI

UserInput(); //inc SetUI and back icon

setInterval(function() {
getTemperature();
}, readFreq); //ms
//??need
drawGraph();
setRecordingFreq();

}