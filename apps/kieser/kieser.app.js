var machineArray = require("Storage").readJSON("kieser-trainingplan.json", false);
var resultFile = require("Storage").readJSON("kieser-results.json", false);

var startDate = new Date().toUTCString();

var trainingTimes = new Array(machineArray.length);
var resultObject = {};
var currentIndex = 0;
// Array 
//array to temporary skip machine
var tempArray = machineArray.slice();

function showSettings(machine) {
  clearWatch();

  var settingY = 100;
  console.log("Show Setting for " + machine.machine);
  g.clear();
  g.setFontAlign(0, 0); // center font
  g.setFont("Vector", 200); // vector font, 80px  
  // draw the current counter value
  E.showMessage("", machine.machine);

  g.drawString("Weight: " + machine.weight, 100, 70);
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

  setWatch(function () {
    showMenu();
  }, BTN1, { repeat: true });


  setWatch(function () {
    startTraining(machine);
  }, BTN2, { repeat: true });

  // optional - this keeps the watch LCD lit up
  g.flip();
}

function startTraining(machine) {
  clearWatch();
  var time = 0;
  console.log("start training for " + machine.machine);

  function draw() {
    g.clear();
    g.setFontAlign(0, 0); // center font
    g.setFont("Vector", 100); // vector font, 80px
    if (time < 90) {
      g.setColor(0xF800); //red
    }
    if (time > 120) {
      g.setColor(0x07E0); //green
    }
    g.drawString(time, 120, 120);

    g.setColor(0xFFFF); //white
    g.setFont("6x8", 2);
    g.setFontAlign(0, 0, 3);
    g.drawString("Buzz", 230, 50);
    g.drawString("Stop", 230, 110);
    g.setFont("Vector", 35);
    g.setFontAlign(-1, -1);
  }

  setInterval(function () {
    time++;
    draw();
  }, 1000);


  setWatch(function () {
    vibrate();
  }, BTN1, { repeat: true });


  setWatch(function () {
    clearInterval();
    showTime(machine, time);
  }, BTN2, { repeat: true });

}

function vibrate() {
  Bangle.beep()
    .then(() => new Promise(resolve => setTimeout(resolve, 2000)))
    .then(() => Bangle.buzz())
    .then(() => new Promise(resolve => setTimeout(resolve, 4000)))
    .then(() => Bangle.buzz())
    .then(() => new Promise(resolve => setTimeout(resolve, 2000)))
    .then(() => Bangle.buzz())
    .then(() => new Promise(resolve => setTimeout(resolve, 4000)))
    .then(() => Bangle.buzz())
    .then(() => new Promise(resolve => setTimeout(resolve, 2000)))
    .then(() => Bangle.buzz())
    .then(() => new Promise(resolve => setTimeout(resolve, 4000)))
    .then(() => Bangle.buzz());
}

function showTime(machine, time) {
  clearWatch();

  function draw() {
    g.clear();
    g.setFontAlign(0, 0); // center font
    g.setFont("Vector", 200); // vector font, 80px  
    // draw the current counter value
    E.showMessage("Training finished for ", machine.machine);
    E.showMessage("Time was " + time);

    g.setFont("6x8", 2);
    g.setFontAlign(0, 0, 3);
    g.drawString("+10", 230, 50);
    g.drawString("Next", 230, 110);
    g.drawString("-10", 230, 170);
    g.setFont("Vector", 35);
    g.setFontAlign(-1, -1);
  }
  draw();

  setWatch(function () {
    time += 10;
    draw();
  }, BTN1, { repeat: true });


  setWatch(function () {
    setFinished(machine, time);
  }, BTN2, { repeat: true });

  setWatch(function () {
    if (time - 10 >= 0) {
      time -= 10;
      draw();
    }
  }, BTN3, { repeat: true });

  setWatch(function () {
    if (time - 5 >= 0) {
      time -= 5;
      draw();
    }
  }, BTN4, { repeat: true });

  setWatch(function () {
    time += 5;
    draw();
  }, BTN5, { repeat: true });

}

function setFinished(machine, time) {
  console.log("finished " + machine.machine);
  clearWatch();
  tempArray[currentIndex].finished = true;
  oldWeight = machine.weight;
  fiveProcent = Math.ceil(oldWeight / 100 * 5);

  console.log("old " + oldWeight);
  console.log("prozent" + fiveProcent);
  console.log(currentIndex);
  if (time < 90) {
    newWeight = oldWeight - fiveProcent;
  } else if (time > 120) {
    newWeight = oldWeight + fiveProcent;
  } else {
    newWeight = oldWeight;
  }
  if (newWeight % 2 != 0) {
    newWeight++;
  }
  console.log("new " + newWeight);
  machine.weight = newWeight;


  function draw() {
    g.clear();
    // g.setFontAlign(0,0); // center font
    g.setFont("Vector", 20); // vector font  
    // draw the current counter value
    g.drawString("Training for\nmachine " + machine.machine + "\nfinished.", 50, 50);
    if (time < 90) {
      g.drawString("The weight has\nbeen decreased\nto: " + newWeight, 50, 110);
    } else if (time > 120) {
      g.drawString("The weight has\nbeen increased\nto: " + newWeight, 50, 110);
    } else {
      g.drawString("The weight\nremains at:\n" + newWeight, 50, 110);
    }
    drawButtons();
  }

  function drawButtons() {
    g.setFont("6x8", 2);
    g.setFontAlign(0, 0, 3);
    g.drawString("+4", 230, 50);
    g.drawString("Next", 230, 110);
    g.drawString("-4", 230, 170);
    g.setFont("Vector", 35);
    g.setFontAlign(-1, -1);
  }

  draw();
  setWatch(function () {
    newWeight += 4;
    console.log("new " + newWeight);
    E.showMessage("New Weight is " + newWeight);
    drawButtons();

    machine.weight = newWeight;
  }, BTN1, { repeat: true });


  setWatch(function () {
    console.log(currentIndex);
    weightTimeObject = {};
    weightTimeObject.weight = oldWeight;
    weightTimeObject.time = time;
    var machineName = machine.machine;
    trainingTime = {};
    trainingTime[machineName] = weightTimeObject;
    trainingTimes[currentIndex] = trainingTime;
    showNext();
  }, BTN2, { repeat: true });

  setWatch(function () {
    newWeight -= 4;
    console.log("new " + newWeight);
    E.showMessage("New Weight is " + newWeight);
    drawButtons();

    machine.weight = newWeight;
  }, BTN3, { repeat: true });
}

function showNext() {
  var nextMachine;
  console.log(currentIndex);
  for (let i = 0; i < tempArray.length; i++) {
    currentIndex = i;
    if (tempArray[i].finished == false) {
      nextMachine = machineArray[i];
      break;
    }
  }

  if (nextMachine == undefined) {
    allFinished();
    return;
  }
  console.log(nextMachine);
  console.log(currentIndex);
  showSettings(nextMachine);
}

function allFinished() {
  clearWatch();
  var dateString = (new Date()).toISOString().substr(0, 16).replace("T", "_");
  resultObject.date = dateString;
  resultObject.machines = trainingTimes;
  resultFile.push(resultObject);
  require("Storage").writeJSON("kieser-results.json", resultFile);
  require("Storage").writeJSON("kieser-trainingplan.json", machineArray);

  g.clear();
  g.setFontAlign(0, 0); // center font
  g.setFont("Vector", 200); // vector font, 80px  
  // draw the current counter value
  E.showMessage("Training finished");

  g.setFont("6x8", 2);
  g.setFontAlign(0, 0, 3);
  g.drawString("Close", 230, 110);
  g.setFont("Vector", 35);
  g.setFontAlign(-1, -1);

  setWatch(function () {
  }, BTN1, { repeat: true });


  setWatch(Bangle.showLauncher, BTN2, { repeat: false });

}

function showMenu() {
  clearWatch();

  function createMenuItems() {
    menuObjekt = {};
    menuObjekt[""] = { "title": "machines left" };

    tempArray.forEach(function (m, i) {
      currentIndex = i;
      if (m.finished == false) {
        menuObjekt[m.machine] = function () { showSettings(m); };
      }
    });

    menuObjekt.Exit = function () { E.showMenu(); };
    return menuObjekt;
  }

  var mainmenu = createMenuItems();
  console.log(mainmenu);
  E.showMenu(mainmenu);
}


function init() {
  for (let machine of tempArray) {
    var finished = false;
    machine.finished = finished;
  }
  console.log(startDate);
  g.clear();
  g.setFontAlign(0, 0); // center font
  g.setFont("Vector", 200); // vector font, 80px  
  // draw the current counter value
  E.showMessage("Start training", "Welcome");

  g.setFont("6x8", 2);
  g.setFontAlign(0, 0, 3);
  g.drawString("Menu", 230, 50);
  g.drawString("Start", 230, 110);
  g.setFont("Vector", 35);
  g.setFontAlign(-1, -1);

  setWatch(function () {
    showMenu();
  }, BTN1, { repeat: false });


  setWatch(function () {
    showNext();
  }, BTN2, { repeat: false });
}


init();
