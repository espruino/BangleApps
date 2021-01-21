var machineArray = require("Storage").readJSON("kieser-trainingplan.json", false);

//array to temporary skip machine
var tempArray = machineArray;

function showSettings(machine){
  var settingY = 100;
  g.clear();
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",200); // vector font, 80px  
  // draw the current counter value
  E.showMessage("", machine.machine);
  
  g.drawString("Weight: "+ machine.weight, 100, 70);
  for (let setting of machine.settings) {
    g.drawString(setting, 100, settingY);
    settingY += 30;
  };
  
  g.setFont("6x8", 2);
    g.setFontAlign(0, 0, 3);
    g.drawString("Menu", 230, 50);
    g.drawString("Start", 230, 110);
    g.setFont("Vector", 35);
    g.setFontAlign(-1, -1);
  
  setWatch(function() {
    showMenu();
  }, BTN1, {repeat:true,debounce:50,edge:"rising"});


  setWatch(function() {
    startTraining(machineArray[1]);
  }, BTN2, {repeat:true,debounce:50,edge:"rising"});
  
  // optional - this keeps the watch LCD lit up
  g.flip();
  //setWatch(showSettings(f[1]) , BTN2);
};

function startTraining(machine){
  g.clear();
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",200); // vector font, 80px  
  // draw the current counter value
  E.showMessage("Training für diese Maschine ist gestartet", machine.machine);
}

function showMenu(){
  g.clear();
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",200); // vector font, 80px  
  // draw the current counter value
  E.showMessage("hier steht das menu", "Menu");

}



function init(){
  g.clear();
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",200); // vector font, 80px  
  // draw the current counter value
  E.showMessage("Start training", "Welcome");

  g.setFont("6x8", 2);
    g.setFontAlign(0, 0, 3);
    g.drawString("Menu", 230, 50);
    g.drawString("Start", 230, 110);
    g.setFont("Vector", 35);
    g.setFontAlign(-1, -1);
  
  setWatch(function() {
    showMenu();
  }, BTN1, {repeat:true,debounce:50,edge:"rising"});


  setWatch(function() {
    showSettings(machineArray[1]);
  }, BTN2, {repeat:true,debounce:50,edge:"rising"});
}


init();
