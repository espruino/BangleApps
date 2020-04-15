(() => {
  var stepTimeDiff = 9999; //Time difference between two steps
  var startTimeStep = new Date(); //set start time
  var stopTimeStep = 0; //Time after one step
  var timerResetActive = 0; //timer to reset active
  var steps = 0; //steps taken
  var stepsCounted = 0; //active steps counted
  var active = 0; //x steps in y seconds achieved
  var stepGoalPercent = 0; //percentage of step goal
  var stepGoalBarLength = 0; //length og progress bar   
  var lastUpdate = new Date();
  var width = 45;

  var stepsTooShort = 0;
  var stepsTooLong = 0;
  var stepsOutsideTime = 0;

  //define default settings
  const DEFAULTS = {
    'cMaxTime' : 1100,
    'cMinTime' : 240,
    'stepThreshold' : 30,
    'intervalResetActive' : 30000,
    'stepSensitivity' : 80,
    'stepGoal' : 10000,
  };
  const SETTINGS_FILE = 'activepedom.settings.json';
  const PEDOMFILE = "activepedom.steps.json";
  
  let settings;
    //load settings
  function loadSettings() {
    settings = require('Storage').readJSON(SETTINGS_FILE, 1) || {};
  }
  //return setting
  function setting(key) {
    if (!settings) { loadSettings(); }
    return (key in settings) ? settings[key] : DEFAULTS[key];
  }

  function setStepSensitivity(s) {
    function sqr(x) { return x*x; }
    var X=sqr(8192-s);
    var Y=sqr(8192+s);
    Bangle.setOptions({stepCounterThresholdLow:X,stepCounterThresholdHigh:Y});
  }

  //format number to make them shorter
  function kFormatter(num) {
    if (num <= 999) return num; //smaller 1.000, return 600 as 600
    if (num >= 1000 && num < 10000) { //between 1.000 and 10.000
      num = Math.floor(num/100)*100;
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; //return 1600 as 1.6k
    }
    if (num >= 10000) { //greater 10.000
      num = Math.floor(num/1000)*1000;
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; //return 10.600 as 10k
    }
  }

  //Set Active to 0
  function resetActive() {
    active = 0;
    steps = 0;
    if (Bangle.isLCDOn()) WIDGETS["activepedom"].draw();
  }

  function calcSteps() {
    stopTimeStep = new Date(); //stop time after each step
    stepTimeDiff = stopTimeStep - startTimeStep; //time between steps in milliseconds
    startTimeStep = new Date(); //start time again

    //Remove step if time between first and second step is too long
    if (stepTimeDiff >= setting('cMaxTime')) { //milliseconds
      stepsTooLong++; //count steps which are note counted, because time too long
      steps--;
    }

    //Remove step if time between first and second step is too short
    if (stepTimeDiff <= setting('cMinTime')) { //milliseconds
      stepsTooShort++; //count steps which are note counted, because time too short
      steps--;
    }

    if (steps >= setting('stepThreshold')) {
      if (active == 0) {
        stepsCounted = stepsCounted + (setting('stepThreshold') -1) ; //count steps needed to reach active status, last step is counted anyway, so treshold -1
        stepsOutsideTime = stepsOutsideTime - 10; //substract steps needed to reac active status
      }
      active = 1;
      clearInterval(timerResetActive); //stop timer which resets active
      timerResetActive = setInterval(resetActive, setting('intervalResetActive')); //reset active after timer runs out
      steps = 0;
    }

    if (active == 1) {
      stepsCounted++; //count steps
    }
    else {
      stepsOutsideTime++;
    }
  }

  function draw() {
    var height = 23; //width is deined globally
    var stepsDisplayLarge = kFormatter(stepsCounted);
    
    //Check if same day
    let date = new Date();
    if (lastUpdate.getDate() == date.getDate()){ //if same day
    }
    else {
      stepsCounted = 1; //set stepcount to 1
    }
    lastUpdate = date;
    
    g.reset();
    g.clearRect(this.x, this.y, this.x+width, this.y+height);
    
    //draw numbers
    if (active == 1) g.setColor(0x07E0); //green
    else g.setColor(0xFFFF); //white
    g.setFont("6x8", 2);
    g.drawString(stepsDisplayLarge,this.x+1,this.y);  //first line, big number
    g.setFont("6x8", 1);
    g.setColor(0xFFFF); //white
    g.drawString(stepsCounted,this.x+1,this.y+14); //second line, small number
    
    //draw step goal bar
    stepGoalPercent = (stepsCounted / setting('stepGoal')) * 100;
    stepGoalBarLength = width / 100 * stepGoalPercent;
    if (stepGoalBarLength > width) stepGoalBarLength = width; //do not draw across width of widget
    g.setColor(0x7BEF); //grey
    g.fillRect(this.x, this.y+height, this.x+width, this.y+height); // draw background bar
    g.setColor(0xFFFF); //white
    g.fillRect(this.x, this.y+height, this.x+1, this.y+height-1); //draw start of bar
    g.fillRect(this.x+width, this.y+height, this.x+width-1, this.y+height-1); //draw end of bar
    g.fillRect(this.x, this.y+height, this.x+stepGoalBarLength, this.y+height); // draw progress bar
  }

  //This event is called just before the device shuts down for commands such as reset(), load(), save(), E.reboot() or Bangle.off()
  E.on('kill', () => {
    let d = { //define array to write to file
      lastUpdate : lastUpdate.toISOString(),
      stepsToday : stepsCounted,
      stepsTooShort : stepsTooShort,
      stepsTooLong : stepsTooLong,
      stepsOutsideTime : stepsOutsideTime
    };
    require("Storage").write(PEDOMFILE,d); //write array to file
  });

  //When Step is registered by firmware
  Bangle.on('step', (up) => {
    steps++; //increase step count
    calcSteps();
    if (Bangle.isLCDOn()) WIDGETS["activepedom"].draw();
  });

  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) WIDGETS["activepedom"].draw();
  });

  //Read data from file and set variables
  let pedomData = require("Storage").readJSON(PEDOMFILE,1);
  if (pedomData) {
    if (pedomData.lastUpdate) lastUpdate = new Date(pedomData.lastUpdate);
    stepsCounted = pedomData.stepsToday|0;
    stepsTooShort = pedomData.stepsTooShort;
    stepsTooLong = pedomData.stepsTooLong;
    stepsOutsideTime = pedomData.stepsOutsideTime;
  }

  setStepSensitivity(setting('stepSensitivity')); //set step sensitivity (80 is standard, 400 is muss less sensitive)

  //Add widget
  WIDGETS["activepedom"]={area:"tl",width:width,draw:draw};

})();