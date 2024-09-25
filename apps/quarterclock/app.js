{
  const minute_boxes = [
    {x:0.5, y:0},
    {x:0.5, y:0.5},
    {x:0, y:0.5},
    {x:0, y:0},
  ];

  const hour_boxes = [
    {x:0.5, y:0},
    {x:0.75, y:0},
    {x:0.75, y:0.25},
    {x:0.75, y:0.5},
    {x:0.75, y:0.75},
    {x:0.5, y:0.75},
    {x:0.25, y:0.75},
    {x:0, y:0.75},
    {x:0, y:0.5},
    {x:0, y:0.25},
    {x:0, y:0},
    {x:0.25, y:0},
  ];

  let drawTimeout;

  // schedule a draw for the next 15 minute period
  let queueDraw = function queueDraw() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, (60000 * 15) - (Date.now() % (60000 * 15)));
  };

  // Main draw function
  let draw = function draw() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();

    g.setBgColor(settings.backgroundColour);
    g.clearRect(Bangle.appRect);

    if (settings.showBattery) {
      drawBattery();
    }

    // Draw minute box
    drawBox(Math.floor(m/15), minute_boxes, Bangle.appRect.h/2, settings.minuteColour);
    
    // Draw an hour box or write the number
    if (settings.digital) {
      g.setColor(settings.hourColour);
      g.setFont("Vector:60");
      g.setFontAlign(0,0);
      g.drawString(h, Bangle.appRect.x + Bangle.appRect.w/2, Bangle.appRect.y + Bangle.appRect.h/2); 
    } else {
      drawBox(h % 12, hour_boxes, Bangle.appRect.h/4, settings.hourColour);
    }

    queueDraw();
  };

  // Draw battery box
  let drawBattery = function drawBattery() {
    // Round battery up to 10% interval
    let battery = Math.min((Math.floor(E.getBattery()/10)+1)/10, 1);

    // Maximum battery box
    let batterySize = 30;

    // Draw outer box at full brightness
    g.setColor(settings.batteryColour);
    g.drawRect(
      (Bangle.appRect.w / 2) - batterySize,
      (Bangle.appRect.h / 2) - batterySize + Bangle.appRect.y,
      (Bangle.appRect.w / 2) + batterySize,
      (Bangle.appRect.h / 2) + batterySize + Bangle.appRect.y
    );

    // Fade battery colour and draw inner box
    g.setColor(settings.batteryColour.split('').map((c) => {
      return c=='f' ? Math.ceil(15 * battery).toString(16) : c;
    }).join(''));
    g.fillRect(
      (Bangle.appRect.w / 2) - (batterySize * battery),
      (Bangle.appRect.h / 2) - (batterySize * battery) + Bangle.appRect.y,
      (Bangle.appRect.w / 2) + (batterySize * battery),
      (Bangle.appRect.h / 2) + (batterySize * battery) + Bangle.appRect.y
    );
  };

  // Draw hour or minute boxes
  let drawBox = function drawBox(current, boxes, size, colour) {
    let x1 = (boxes[current].x * Bangle.appRect.h) + (Bangle.appRect.y/2);
    let y1 = (boxes[current].y * Bangle.appRect.h) + Bangle.appRect.y;
    let x2 = x1 + size;
    let y2 = y1 + size;
    g.setColor(colour);
    g.fillRect(x1, y1, x2, y2);
  };

  let settings = Object.assign({
    // Default values
    minuteColour: '#f00',
    hourColour: '#ff0',
    backgroundColour: 'theme',
    showWidgets: true,
    showBattery: true,
    digital: false,
    batteryColour: '#0f0'
  }, require('Storage').readJSON('quarterclock.json', true) || {});

  if (settings.backgroundColour == 'theme') {
    settings.backgroundColour = g.theme.bg;
  }

  // Set minuteColour to a darker shade if same as hourColour
  if (settings.minuteColour == settings.hourColour) {
    settings.minuteColour = settings.minuteColour.split('').map((c) => {
      return c=='f' ? '7' : c;
    }).join('');
  }

  // Show launcher when middle button pressed
  // Remove handler to allow fast loading
  Bangle.setUI({mode:"clock", remove:function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    require("widget_utils").show();
  }});

  // Load and display widgets
  Bangle.loadWidgets();
  if (settings.showWidgets) {
    require("widget_utils").show();
  } else {
    require("widget_utils").hide();
  }

  // draw initial boxes and queue subsequent redraws
  draw();
}

