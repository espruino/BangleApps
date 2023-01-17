// Temperature monitor that saves a log of measures
// standalone ver for  developer, to remove testing lines
// delimiter ; (excel) or , (oldscool)
{
var v_mode_debug=0; //, 0=no, 1 min, 2 prone detail
//var required for drawing with dynamic screen
var rect = Bangle.appRect;
var history = [];
var readFreq=5000; //ms //PEND add to settings
var saveFreq=60000; //ms 1min
var v_saveToFile= new Boolean(true); //true save //false 
//with upload file º is not displayed properly
//with upload RAM º is  displayed
var v_t_symbol="";//ºC
var v_saved_entries=0;
var filename ="temphistory.csv";
var lastMeasure = new String();
var v_model=process.env.BOARD;

//EMSCRIPTEN,EMSCRIPTEN2
if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') {
     v_font_size1=16;
     v_font_size2=60;
     //g.setColor("#0ff"); //light color
  }else{
    v_font_size1=11;
    v_font_size2=40;
    //g.setColor("#000"); //black or dark
  }

function onTemperature(v_temp) {
  if (v_mode_debug>1) console.log("v_temp in "+v_temp);
  ClearBox();
  //g.setFont("6x8",2).setFontAlign(0,0);
  g.setFontVector(v_font_size1).setFontAlign(0,0);
  var x = (rect.x+rect.x2)/2;
  var y = (rect.y+rect.y2)/2 + 20;
  g.drawString("Records: "+v_saved_entries, x, rect.y+35);
  g.drawString("Temperature:", x, rect.y+37+v_font_size1);
  //dynamic font (g.getWidth() > 200 ? 60 : 40)
  g.setFontVector(v_font_size2).setFontAlign(0,0);
  // Avg of temperature readings
  while (history.length>4) history.shift();
  history.push(v_temp);
  var avrTemp = E.sum(history) / history.length;
  //var t = require('locale').temp(avrTemp);
  //.replace("'","°");
  lastMeasure=avrTemp.toString();
  if (lastMeasure.length>4) lastMeasure=lastMeasure.substr(0,4);
  //DRAW temperature in the center
  g.drawString("     ", x-20, y);
  g.drawString(v_temp+v_t_symbol, x-20, y);
  g.flip();
}
// from: BJS2 pressure sensor,  BJS1 inbuilt thermistor
function drawTemperature() {
  if(v_model.substr(0,10)!='EMSCRIPTEN'){
    if (Bangle.getPressure) {
      Bangle.getPressure().then(p =>{if (p) onTemperature(p);});
    } else onTemperature(E.getTemperature());
  }
  else  onTemperature(11);//fake temp for emulators
}

function saveToFile() {
  //input global vars: lastMeasure
  var a=new Date();
  var strlastSaveTime=new String();
  strlastSaveTime=a.toISOString();
  //strlastSaveTime=strlastSaveTime.concat(a.getFullYear(),a.getMonth()+1,a.getDate(),a.getHours(),a.getMinutes());;
  if (v_mode_debug==1) console.log("saving="+strlastSaveTime+";"+a.getHours()+":"+a.getMinutes()+";"+lastMeasure);
  if (v_saveToFile==true){
    //write(strlastSaveTime+";"+
    require("Storage").open(filename,"a").write((a.getMonth()+1)+";"+a.getDate()+";"+a.getHours()+":"+a.getMinutes()+";"+lastMeasure+"\n");
    //(getTime()+",");
    v_saved_entries=v_saved_entries+1;
  }
}

function drawGraph(){
    var img_obj_thermo =   {
      width : 36, height : 36, bpp : 3,
      transparent : 0,
      buffer : require("heatshrink").decompress(atob("AEFt2AMKm3bsAMJjdt23ABhEB+/7tgaJ///DRUP//7tuADRP923YDRXbDRfymwaJhu/koaK7eyiwaK3cLDRlWDRY1NKBY1Ztu5kjmJg3cyVI7YMHgdu5Mkyu2fxHkyVJjdgDRFJkmRDRPsDQNbDQ5QBGoONKBJrBoxQIQwO2eRcbtu24AMIFIQLJAH4AMA=="))
    };
    g.drawImage(img_obj_thermo,rect.x2-50,rect.y2/2);
    g.flip();
}
function ClearScreen(){
  //avoid widget areas
  g.reset(1).clearRect(rect.x, rect.y+24, rect.x2, rect.y2-24);
  g.flip();
}
function ClearBox(){
  //custom boxarea , left space for static graph at right
  g.reset(1).clearRect(rect.x, rect.y+24, rect.x2-50, rect.y2-24);
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
    g.drawString("Read freq(ms): "+readFreq, x, y );
    g.drawString("Save to file: "+v_saveToFile, x, y+ ((v_font_size1*1)+2) );
    g.drawString("Save freq(ms):"+saveFreq, x, y+((v_font_size1*2)+2) );
    fr=require("Storage").read(filename+"\1");//suffix required
    if (fr)  g.drawString("Current filesize:"+fr.length.toString()+"kb", x, y+((v_font_size1*3)+2) );
     else g.drawString("File not exist", x, y+((v_font_size1*3)+2));
}
//MAIN
Bangle.loadWidgets();
Bangle.setUI({
  mode : "custom",
  back : function() {load();}
});

ClearScreen();
introPage();

setInterval(function() {
  drawTemperature();
}, readFreq); //ms

if (v_saveToFile==true) {
    setInterval(function() {
      saveToFile();
    }, saveFreq); //ms
}
setTimeout(ClearScreen, 3500);
setTimeout(drawGraph,4000);
setTimeout(drawTemperature,4500);
}