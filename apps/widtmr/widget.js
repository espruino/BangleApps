(() => {
  let storage = require('Storage');

  var settings;
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


  //counts down, calculates and displays
  function countDown() {
    var now = new Date();
    diff = settings.goal - now; //calculate difference
    // time is up
    if (settings.started && diff < 1000) {
      Bangle.buzz(1500);
      //write timer off to file
      settings.started = false;
      storage.writeJSON('widtmr.json', settings);
      clearInterval(interval); //stop interval
      interval = undefined;
    }
    // calculates width and redraws accordingly
    WIDGETS["widtmr"].redraw();
  }


  /*
   * Add the widgets and functions for other apps
   */
  WIDGETS["widtmr"]={area:"tl",width:0,draw:function() {
    if (!this.width) {
      return;
    }

    g.reset().setFontAlign(0,0).clearRect(this.x,this.y,this.x+this.width,this.y+23);

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
    if (!settings.started) {
      this.width = 0;
    } else {
      this.width = (diff < 3600000) ? 58 : 48;
    }

    if (last != this.width) {
      Bangle.drawWidgets();
    } else {
      this.draw();
    }

  }, reload:function() {
    settings = storage.readJSON("widtmr.json",1)||{};
    if (interval) {
      clearInterval(interval);
    }
    interval = undefined;

    // start countdown each second
    if (settings.started) {
      interval = setInterval(countDown, 1000);
    }

    // reset everything
    countDown();

  }, isStarted: function(){
    settings = storage.readJSON("widtmr.json",1)||{started: false};
    return settings.started;
  }

};

  // set width correctly, start countdown each second
  WIDGETS["widtmr"].reload();
})();
