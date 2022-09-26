(function () {
  // load variable before defining functions cause it can trigger a ReferenceError
  const activityreminder = require("activityreminder");
  let activityreminder_data = activityreminder.loadData();
  let W = g.getWidth();
  // let H = g.getHeight();

  function getHoursMins(date){
    var h = date.getHours();
    var m = date.getMinutes();
    return (""+h).substr(-2) + ":" + ("0"+m).substr(-2);
  }

  function drawData(name, value, y){
    g.drawString(name, 10, y);
    g.drawString(value, 100, y);
  }
  
  function drawInfo() {
    var h=18, y = h;
    g.setColor(g.theme.fg);
    g.setFont("Vector",h).setFontAlign(-1,-1);

    // Header
    g.drawLine(0,25,W,25);
    g.drawLine(0,26,W,26);
  
    g.drawString("Current Cycle", 10, y+=h);
    drawData("Start", getHoursMins(activityreminder_data.stepsDate), y+=h);
    drawData("Steps", getCurrentSteps(), y+=h);

    /*
    g.drawString("Button Press", 10, y+=h*2);
    drawData("Ok", getHoursMins(activityreminder_data.okDate), y+=h);
    drawData("Dismiss", getHoursMins(activityreminder_data.dismissDate), y+=h);
    drawData("Pause", getHoursMins(activityreminder_data.pauseDate), y+=h);
    */
  }

  function getCurrentSteps(){
    let health = Bangle.getHealthStatus("day");
    return health.steps - activityreminder_data.stepsOnDate;
  }

  function run() {
    g.clear();
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    drawInfo();
    Bangle.setUI({
      mode : "custom",
      back : load
    })
  }

  run();

})();
