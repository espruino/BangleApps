WIDGETS = {};

(() => {
  var settings = {};
  var batChartFile; // file for battery percentage recording
  const recordingInterval10Min = 60*10*1000;
  const recordingInterval10S = 10*1000; //For testing 
  var recordingInterval = null;

  // draw your widget
  function draw() {
    if (!settings.isRecording) return;
    g.reset();
    g.drawString("BC", this.x, this.y);
  }

  // Called by the heart app to reload settings and decide what's
  function reload() {
      WIDGETS["batchart"].width = 24;
      batChartFile = require("Storage").open(".batchart","a");
      recordingInterval = setInterval(()=>{
        if (batChartFile)
          console.log ([getTime().toFixed(0),E.getBattery()].join(","));
          //batChartfile.write([getTime().toFixed(0),E.getBattery].join(",")+"\n");
      }, recordingInterval10S)
  }

  // add the widget
  WIDGETS["batchart"]={area:"tl",width:24,draw:draw,reload:function() {
    reload();
    Bangle.drawWidgets(); // relayout all widgets
  }};
  // load settings, set correct widget width
  reload();
})()