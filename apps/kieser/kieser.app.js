var machineArray = require("Storage").readJSON("kieser-trainingplan.json", false);

//array to temporary skip machine
var tempArray = machineArray.slice();

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
  }
  
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
}

function startTraining(machine){
  g.clear();
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",200); // vector font, 80px  
  // draw the current counter value
  E.showMessage("Timer starten", machine.machine);
}

function showMenu(){
  function createMenuItems(){
    menuObjekt = {};
    menuObjekt[""] = {"title" : "machines left"};
    for (var i = 0; i < tempArray.length; i++){
      if (tempArray[i].finished == false){
        key = tempArray[i].machine;
                
        menuObjekt[key] = function(){showSettings(tempArray[i])};
      }
      
    }
    menuObjekt.Exit = function() { E.showMenu();};
    return menuObjekt;
  }
  
  var mainmenu = createMenuItems();
  console.log(mainmenu);
  E.showMenu(mainmenu);
}



function init(){
  for (let machine of tempArray){
   var finished = false;
   machine.finished = finished;
  }
  
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
    showSettings(tempArray[0]);
  }, BTN2, {repeat:true,debounce:50,edge:"rising"});
}


init();
