var machineArray = require("Storage").readJSON("kieser-trainingplan.json", false);

//array to temporary skip machine
var tempArray = machineArray.slice();

function showSettings(machine){
  clearWatch();

  var settingY = 100;
  console.log("Show Setting for " + machine.machine);
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
  }, BTN1, {repeat:true});


  setWatch(function() {
    startTraining(machine);
  }, BTN2, {repeat:true});
  
  // optional - this keeps the watch LCD lit up
  g.flip();
}

function startTraining(machine){
  clearWatch();

  console.log("start training for " + machine.machine);

  g.clear();
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",200); // vector font, 80px  
  // draw the current counter value
  E.showMessage("Timer starten", machine.machine);
  
  setWatch(function() {
  }, BTN1, {repeat:true});


  setWatch(function() {
  }, BTN2, {repeat:true});
  
}

function showMenu(){

  function createMenuItems(){
    menuObjekt = {};
    menuObjekt[""] = {"title" : "machines left"};
    /* for (var i = 0; i < tempArray.length; i++){
      if (tempArray[i].finished == false){
        key = tempArray[i].machine;
                
        menuObjekt[key] = function(){showSettings(tempArray[i])};
      }
      
    } */
    tempArray.forEach(function(m, i) {
       if (m.finished == false){
          menuObjekt[m.machine] = function(){showSettings(m)};
          }
    });
    
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
  }, BTN1, {repeat:false});


  setWatch(function() {
    showSettings(tempArray[0]);
  }, BTN2, {repeat:false});
}


init();
