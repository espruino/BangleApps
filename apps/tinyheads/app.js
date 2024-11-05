{
  // Shared library for face drawing and settings loading.
  let lib = require('tinyheads.lib.js');

  // Read 12/24 from system settings
  const is12Hour=(require("Storage").readJSON("setting.json",1)||{})["12hour"] || false;

  const scale=lib.appScale;

  const closedEyes = 25;
  const scaredEyes = 26;
  const scaredMouth = 4;
  const disconnectedEyes = 3;
  const glassesEyes = [18, 23, 24];

  let drawTimeout, blinkTimeout, tapTimeout;
  let activeEyesNum = lib.settings.eyesNum;
  let eyesNum = activeEyesNum;
  let activeMouthNum = lib.settings.mouthNum;
  let mouthNum = activeMouthNum;
  let helpShown = false;
  let tapCount = 0;
  let centerX, centerY, minuteHandLength, hourHandLength, handOutline;
  let originalTheme = Object.assign({}, g.theme);
  
  // Open the eyes and schedule the next blink
  let blinkOpen = function blinkOpen() {
    if (blinkTimeout) clearTimeout(blinkTimeout);
    blinkTimeout = setTimeout(function() {
      blinkTimeout = undefined;
      blinkClose();
    }, 3000 + (Math.random() * 10000));
    eyesNum = activeEyesNum;
    mouthNum = activeMouthNum;
    drawTinyhead();
  };

  // Close the eyes and schedule the next open
  let blinkClose = function blinkClose() {
    if (!glassesEyes.includes(activeEyesNum)) {
      if (blinkTimeout) clearTimeout(blinkTimeout);
      if (!Bangle.isCharging()) { // Keep eyes shut while charging
        blinkTimeout = setTimeout(function() {
          blinkTimeout = undefined;
          blinkOpen();
        }, E.getBattery() < 10 ? 6000 + (Math.random() * 6000) : 150); // Doze if battery low, otherwise quick blink
      }
      eyesNum = closedEyes; // Closed eyes
      drawTinyhead();
    }
  };

  // Tinyhead is scared
  let scared = function scared() {
    if (!glassesEyes.includes(activeEyesNum)) {
      if (blinkTimeout) clearTimeout(blinkTimeout);
      blinkTimeout = setTimeout(function() {
        blinkTimeout = undefined;
        peek();
      }, 4000); // Terrified for 4 seconds
      eyesNum = scaredEyes;
    }
    if (mouthNum < 10) {
      mouthNum = scaredMouth;
    }
    drawTinyhead();
  };

  // See if it's safe to open eyes
  let peek = function peek() {
    if (blinkTimeout) clearTimeout(blinkTimeout);
    blinkTimeout = setTimeout(function() {
      blinkTimeout = undefined;
      blinkOpen();
    }, 3000); // Peek for 3 seconds
    drawTinyhead(true);
  };

  // Draw the tinyhead
  let drawTinyhead = function drawTinyhead(peek) {
    // Set background to black, the tinyhead is slightly narrower than the banglejs2 screen
    g.setBgColor(0, 0, 0);
    g.clearRect(Bangle.appRect);

    let offset = 0;
    if (shouldDrawDigital()) {
      offset = 30; // Move the head by half the clock height to keep more of the features in view
      if (lib.settings.digitalPosition == 'bottom') {
        offset = offset * -1; // Move the head up if clock is at the bottom
      }
    }

    lib.drawFace(scale, eyesNum, mouthNum, peek, offset);
    // Draw widgets again as the face will have been drawn above them

    drawClocks();
  };

  // Draw analog and digital clocks
  let drawClocks = function drawClocks() {
    if (shouldDrawAnalog()) {
      drawAnalog();
    }
    if (shouldDrawDigital()) {
      drawDigital();
    }
    queueClocksDraw();
  };

  // Draw digital clock
  let drawDigital = function drawDigital() {
    let width = lib.faceW * scale; // Set width to face width, which is slightly narrower than screen width
    let height = 60;
    let yOffset = Bangle.appRect.y;
    let xOffset = (Bangle.appRect.w - width) / 2;
    if (lib.settings.digitalPosition == 'bottom') {
      yOffset = g.getHeight() - height;
    }

    g.setColor(0, 0, 0);
    g.fillRect(xOffset, yOffset, width+xOffset, height+yOffset);
    g.setColor(1, 1, 1);
    g.fillRect(xOffset+10, yOffset+10, width-10+xOffset, height-10+yOffset);

    let d = new Date();
    let h = d.getHours(), m = ("0"+d.getMinutes()).substr(-2);
    if (is12Hour){
      h = h - 12;
    }
    h = ("0"+h).substr(-2);

    g.setColor(0, 0, 0);
    g.setFont("6x8:4x6");
    g.drawString(h+":"+m, 22+xOffset, 7+yOffset);
  };

  // Draw analog clock hands
  let drawAnalog = function drawAnalog() {
    let thickness = 4;

    let d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    let hRot = (h + m/60) * Math.PI / 6; // Angle of hour hand
    let mRot = m * Math.PI / 30; // Angle of minute hand
    let offset = 0;

    if (shouldDrawDigital()) {
      offset = 30; // Adjust the analog center to match head position
      if (lib.settings.digitalPosition == 'bottom') {
        offset = offset * -1;
      }
    }

    g.setColor(lib.settings.analogColour);
    g.fillPolyAA(g.transformVertices([-thickness, 0, thickness, 0, thickness, -minuteHandLength, -thickness, -minuteHandLength ], {x: centerX, y: centerY+offset, rotate: mRot}));
    g.setColor(handOutline);
    g.drawPolyAA(g.transformVertices([-thickness, 0, thickness, 0, thickness, -minuteHandLength, -thickness, -minuteHandLength ], {x: centerX, y: centerY+offset, rotate: mRot}), true);
    g.setColor(lib.settings.analogColour);
    g.fillPolyAA(g.transformVertices([-thickness, 0, thickness, 0, thickness, -hourHandLength, -thickness, -hourHandLength ], {x: centerX, y: centerY+offset, rotate: hRot}));
    g.setColor(handOutline);
    g.drawPolyAA(g.transformVertices([-thickness, 0, thickness, 0, thickness, -hourHandLength, -thickness, -hourHandLength ], {x: centerX, y: centerY+offset, rotate: hRot}), true);
  };

  // Schedule a redraw of the clocks
  let queueClocksDraw = function queueClocksDraw() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      drawTinyhead();
    }, (60000) - (Date.now() % (60000)));
  };

  // Show clocks on unlock
  let lockHandler = (on, reason) => {
    if (lib.settings.showWidgets == 'unlock' && !on) {
        require("widget_utils").show();
        Bangle.drawWidgets();
    }
    if (lib.settings.showWidgets == 'unlock' && on) {
      require("widget_utils").hide();
    }
    if (lib.settings.analogClock == 'unlock' || lib.settings.digitalClock == 'unlock' || lib.settings.showWidgets == 'unlock') {
      drawTinyhead();
    }
  };

  // Sleep while charging
  let chargingHandler = charging => {
    if (charging) {
      blinkClose();
    } else {
      blinkOpen();
    }
  };

  // Status eyes on bt disconnect
  let btDisconnectHandler = () => {
    activeEyesNum = disconnectedEyes;
    blinkOpen();
  };

  // reset eyes to normal
  let btConnectHandler = () => { 
    activeEyesNum = lib.settings.eyesNum;
    blinkOpen();
  };

  let shouldDrawAnalog = function() {
    return lib.settings.analogClock == 'on' || (lib.settings.analogClock == 'unlock' && !Bangle.isLocked());
  };
  let shouldDrawDigital = function() {
    return lib.settings.digitalClock == 'on' || (lib.settings.digitalClock == 'unlock' && !Bangle.isLocked());
  };

  let init = function init() {
    // change the system theme, so that the widget bar blends in with the clock face
    g.setTheme({bg:lib.settings.hairColour,fg:lib.settings.faceColour,dark:true}).clear();

    Bangle.on('lock', lockHandler);
    Bangle.on('charging', chargingHandler);
    if (lib.settings.btStatusEyes) {
      NRF.on('connect', btConnectHandler);
      NRF.on('disconnect', btDisconnectHandler);
    }

    activeEyesNum = lib.settings.eyesNum;
    activeMouthNum = lib.settings.mouthNum;
    if (!NRF.getSecurityStatus().connected && lib.settings.btStatusEyes) {
      activeEyesNum = disconnectedEyes;
    }

    Bangle.setUI({
      mode:"custom",
      clock: true,
      touch: (button, xy) => {
        // Go direct to feature select in settings on long screen press
        if (xy.type == 2) {
          eval(require("Storage").read("tinyheads.settings.js"))(()=> {
            g.setTheme(originalTheme);
            E.showMenu();
            init();
          }, true, helpShown);
          helpShown = true; // Only trigger the help screen once per run
        } else {
          if (tapTimeout) clearTimeout(tapTimeout);
          tapTimeout = setTimeout(function() {
            tapTimeout = undefined;
            tapCount = 0;
          }, 1500);
          tapCount++;
          if (tapCount == 3) {
            scared();
          }
        }
      },
      remove: function() {
        g.setTheme(originalTheme);
        // Clear timeouts and listeners for fast loading
        if (drawTimeout) clearTimeout(drawTimeout);
        if (blinkTimeout) clearTimeout(blinkTimeout);
        Bangle.removeListener("charging", chargingHandler);
        Bangle.removeListener("lock", lockHandler);
        if (lib.settings.btStatusEyes) {
          NRF.removeListener('connect', btConnectHandler);
          NRF.removeListener('disconnect', btDisconnectHandler);
        }
        require("widget_utils").show();
        Bangle.drawWidgets();
      }
    });

    // Always load widgets (needed for fast loading) and display if option selected
    Bangle.loadWidgets();
    if (lib.settings.showWidgets == 'on' || (lib.settings.showWidgets == 'unlock' && !Bangle.isLocked())) {
      Bangle.drawWidgets();
    } else {
      require("widget_utils").hide();
    }

    centerX = (Bangle.appRect.w / 2) + Bangle.appRect.x;
    centerY = (Bangle.appRect.h / 2) + Bangle.appRect.y;

    minuteHandLength = Math.floor(Math.min(Bangle.appRect.w, Bangle.appRect.h) * 0.45);
    hourHandLength = Math.floor(Math.min(Bangle.appRect.w, Bangle.appRect.h) * 0.30);

    handOutline = g.toColor( // Calculate a contrasting colour for the hands edge
      lib.settings.analogColour.substring(1,2)=='f' ? 0 : 1,
      lib.settings.analogColour.substring(2,3)=='f' ? 0 : 1,
      lib.settings.analogColour.substring(3,4)=='f' ? 0 : 1
    );

    // Opening the eyes triggers a face redraw and also starts the blink and clock timers
    blinkOpen();

  };

  init();

}
