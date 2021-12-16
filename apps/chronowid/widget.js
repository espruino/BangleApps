(() => {
  var settingsChronowid;
  var interval =  0; //used for the 1 second interval timer
  var diff;

  //Convert ms to time
  function getTime(t)  {
    var milliseconds = parseInt((t % 1000) / 100),
      seconds = Math.floor((t / 1000) % 60),
      minutes = Math.floor((t / (1000 * 60)) % 60),
      hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    return hours.toString().padStart(2,0) + ":" + minutes.toString().padStart(2,0) + ":" + seconds.toString().padStart(2,0);
  }

  /*function printDebug() {
    print ("Goaltime: " + getTime(settingsChronowid.goal));
    print ("Goal: " + settingsChronowid.goal);
    print("Difftime: " + getTime(diff));
    print("Diff: " + diff);
    print ("Started: " + settingsChronowid.started);
    print ("----");
  }*/

  //counts down, calculates and displays
  function countDown() {
    var now = new Date();
    diff = settingsChronowid.goal - now; //calculate difference
    // time is up
    if (settingsChronowid.started && diff < 1000) {
      Bangle.buzz(1500);
      //write timer off to file
      settingsChronowid.started = false;
      require('Storage').writeJSON('chronowid.json', settingsChronowid);
      clearInterval(interval); //stop interval
      interval = undefined;
    }
    // calculates width and redraws accordingly
    WIDGETS["chronowid"].redraw();
  }

  // add the widget
  WIDGETS["chronowid"]={area:"tl",width:0,draw:function() {
    if (!this.width) return;
    g.reset().setFontAlign(0,0).clearRect(this.x,this.y,this.x+this.width,this.y+23);
    //g.drawRect(this.x,this.y,this.x+this.width-1, this.y+23);
    var scale;
    var timeStr;
    if (diff < 3600000) { //less than 1 hour left
      width = 58;
      scale = 2;
      timeStr = getTime(diff).substring(3); // remove hour part 00:00:00 -> 00:00
    } else { //one hour or more left
      width = 48;
      scale = 1;
      timeStr = getTime(diff); //display hour 00:00:00 but small
    }
    // Font5x9Numeric7Seg - just build this in as it's tiny
    g.setFontCustom(atob("AAAAAAAAAAIAAAQCAQAAAd0BgMBdwAAAAAAAdwAB0RiMRcAAAERiMRdwAcAQCAQdwAcERiMRBwAd0RiMRBwAAEAgEAdwAd0RiMRdwAcERiMRdwAFAAd0QiEQdwAdwRCIRBwAd0BgMBAAABwRCIRdwAd0RiMRAAAd0QiEQAAAAAAAAAA="), 32, atob("BgAAAAAAAAAAAAAAAAYCAAYGBgYGBgYGBgYCAAAAAAAABgYGBgYG"), 9 + (scale<<8));
    g.drawString(timeStr, this.x+this.width/2, this.y+12);
  }, redraw:function() {
    var last = this.width;
    if (!settingsChronowid.started) this.width = 0;
    else this.width = (diff < 3600000) ? 58 : 48;
    if (last != this.width) Bangle.drawWidgets();
    else this.draw();
  }, reload:function() {
    settingsChronowid = require('Storage').readJSON("chronowid.json",1)||{};
    if (interval) clearInterval(interval);
    interval = undefined;
    // start countdown each second
    if (settingsChronowid.started) interval = setInterval(countDown, 1000);
    // reset everything
    countDown();
  }};

  //printDebug();
  // set width correctly, start countdown each second
  WIDGETS["chronowid"].reload();
})();
