(() => {
  const storage = require('Storage');
  settingsChronowid = storage.readJSON("chronowid.json",1)||{}; //read settingsChronowid from file
  var height = 23;
  var width = 58;
  var interval =  0; //used for the 1 second interval timer
  var now = new Date();

  var time = 0;
  var diff = settingsChronowid.goal - now;
    
  //Convert ms to time
  function getTime(t)  {
    var milliseconds = parseInt((t % 1000) / 100),
      seconds = Math.floor((t / 1000) % 60),
      minutes = Math.floor((t / (1000 * 60)) % 60),
      hours = Math.floor((t / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
      
    return hours + ":" + minutes + ":" + seconds;
  }

  function printDebug() {
    print ("Nowtime: " + getTime(now));
    print ("Now: " + now);
    print ("Goaltime: " + getTime(settingsChronowid.goal));
    print ("Goal: " + settingsChronowid.goal);
    print("Difftime: " + getTime(diff));
    print("Diff: " + diff);
    print ("Started: " + settingsChronowid.started);
    print ("----");
  }

  //counts down, calculates and displays
  function countDown() {
    now = new Date();
    diff = settingsChronowid.goal - now; //calculate difference
    WIDGETS["chronowid"].draw();
    //time is up
    if (settingsChronowid.started && diff < 1000) {
      Bangle.buzz(1500);
      //write timer off to file
      settingsChronowid.started = false;
      storage.writeJSON('chronowid.json', settingsChronowid);
      clearInterval(interval); //stop interval
    }
    //printDebug();
  }

  // draw your widget
  function draw() {
    if (!settingsChronowid.started) {
      width = 0;
      return; //do not draw anything if timer is not started
    }
    g.reset();
    if (diff >= 0) {
      if (diff < 3600000) { //less than 1 hour left
        width = 58;
        g.clearRect(this.x,this.y,this.x+width,this.y+height);
        g.setFont("6x8", 2);
        g.drawString(getTime(diff).substring(3), this.x+1, this.y+5); //remove hour part 00:00:00 -> 00:00
      }
      if (diff >= 3600000) { //one hour or more left
        width = 48;
        g.clearRect(this.x,this.y,this.x+width,this.y+height);
        g.setFont("6x8", 1);
        g.drawString(getTime(diff), this.x+1, this.y+((height/2)-4)); //display hour 00:00:00
      }
    }
    // not needed anymoe, because we check if diff < 1000 now, so 00:00 is displayed.
    // else {
    //     width = 58;
    //     g.clearRect(this.x,this.y,this.x+width,this.y+height);
    //     g.setFont("6x8", 2);
    //     g.drawString("END", this.x+15, this.y+5);
    // }
  }

  if (settingsChronowid.started) interval = setInterval(countDown, 1000); //start countdown each second

  // add the widget
  WIDGETS["chronowid"]={area:"bl",width:width,draw:draw,reload:function() {
    reload();
    Bangle.drawWidgets(); // relayout all widgets
  }};

  //printDebug();
  countDown();
})();