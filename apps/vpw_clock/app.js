Graphics.prototype.setFontMadeSunflower = function () {
  // Actual height 46 (45 - 0)
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    46,
    atob("DxMiFyAgIiAgICEgDw=="),
    60 | 65536
  );
};

{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
  require("FontVGA8").add(Graphics);

  const COLOUR_BLACK = 0x0;
  const COLOUR_WHITE = 0xffff;
  const COLOUR_RED = "#FF0000";
  const COLOUR_VPW_GREEN = 0xf0f;
  const COLOUR_PURPLE = "#8000FF";
  //const COLOUR_DARK_GREY = "#3F3F3F";
  //const COLOUR_GREY = "#7F7F7F";
  //const COLOUR_LIGHT_GREY = "#BFBFBF";
  //const COLOUR_BLUE = "#0000FF";
  //const COLOUR_YELLOW = "#FFFF00";
  //const COLOUR_LIGHT_CYAN = "#7FFFFF";
  //const COLOUR_DARK_YELLOW = "#7F7F00";
  //const COLOUR_DARK_CYAN = "#007F7F";
  //const COLOUR_ORANGE = "#FF7F00";
  //const COLOUR_MAGENTA = "#ff00ff";

  const sun_img = require("heatshrink").decompress(atob("2GwwZC/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AUjdt23btuAH/MNHwQCD7CA8AQlsIGsGHwwCD2BAzgI+IAQfAIOVp22bARZAxjaAKAQdsIOGatOmARuAIF02QBgCEIFsBQBwCDQlsNQB4CC7BBsQCACDIFcDQCACDsBBqjSDUtBBq6dtmwCTIFMGQCQCD0BBognTps0AScwINEmQa2mIE8BmmTpICVwBBnQCoCCIM8NknSpoCV6BBmhKDYzRBmfyACJIMyAXQdECpMkyQCXoBBlQbVgIMkSQbVIIMkaQbVoQf6DmyVpkwCZIMqDapJB/IP5BnghB/IL0gIP5B/IP5B/IP5B/IP5B/IP5B/IP5B4gBB/ILxAjIP5B/IP4AGiRBapBB/IP5BogRBaoBB/IP4CCIEgABIP5B/AAcJILGQIM0BILGAIP5BogBBYIE8AghBWkBB/INUAIKxApgESIKlIINUCIKlAINUAIKhArgEJIKWQINkBIKWAINkAIKRAtAAJBQIF8AiRBOpBBwgBBOIGMAhJBMyBBygEEIJUgIGYABiRBIpBA1ZBLC0QxSA4AH4A/AH4A/AGA"));

  let settings = Object.assign({
    // default values
    foregroundColor: 0
  }, require('Storage').readJSON("vpw_clock.settings.json", true) || {});
  settings.is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"] || false;

  let foregroundColor;

  switch (settings.foregroundColor) {
    case 0:
      foregroundColor = COLOUR_RED;
      break;

    case 1:
      foregroundColor = COLOUR_PURPLE;
      break;

    case 2:
      foregroundColor = COLOUR_WHITE;
      break;

    case 3:
      foregroundColor = COLOUR_BLACK;
      break;

    default:
      foregroundColor = COLOUR_BLACK; // to detect problems
      break;
  }

  let drawPolygonWithGrid = function (x1, y1, x2, y2, x3, y3, x4, y4, M, N) {
    // Draw the polygon
    g.drawLine(x1, y1, x2, y2);
    g.drawLine(x2, y2, x3, y3);
    g.drawLine(x3, y3, x4, y4);
    g.drawLine(x4, y4, x1, y1);

    for (let i = 1; i < N; i++) {
      let xi1 = x1 + i * ((x2 - x1) / N);
      let yi1 = y1 + i * ((y2 - y1) / N);

      let xi2 = x4 - i * ((x4 - x3) / N);
      let yi2 = y4 - i * ((y4 - y3) / N);

      g.drawLine(xi1, yi1, xi2, yi2);
    }

    for (let j = 1; j < M; j++) {
      let xi1 = x1 + j * ((x4 - x1) / M);
      let yi1 = y1 + j * ((y4 - y1) / M);

      let xi2 = x2 - j * ((x2 - x3) / M);
      let yi2 = y2 - j * ((y2 - y3) / M);

      g.drawLine(xi1, yi1, xi2, yi2);
    }
  };

  const SCREEN_WIDTH = 176;
  const SCREEN_HEIGHT = 176;
  const GROUND_HEIGHT = 176 - 45;

  const GRID_BASE_OFFSET = 100;

  // timeout used to update every minute
  let drawTimeout;

  // schedule a draw for the next minute
  let queueDraw = function () {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function () {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
  };

  let getTimeStr = function(date) {
    var hours = date.getHours();
    const minutes = date.getMinutes();
    if (settings.is12Hour) {
      hours = hours % 12;
      if (hours === 0) hours = 12;
    }
    return (" " + hours).slice(-2) + ":" + ("0" + minutes).slice(-2);
  };

  let draw = function () {
    var x = g.getWidth() / 2;
    var y = 24 + 20;

    g.reset().clearRect(0, 24, g.getWidth(), g.getHeight());

    //sky
    g.setColor(COLOUR_VPW_GREEN);
    g.fillRect(0, 24, SCREEN_WIDTH, GROUND_HEIGHT - 1);

    g.drawImage(sun_img, 0, 0);

    //ground
    g.setColor("#8000FF");
    g.fillRect(0, GROUND_HEIGHT, 176, SCREEN_HEIGHT);

    //lines
    g.setColor(COLOUR_WHITE);
    drawPolygonWithGrid(0, GROUND_HEIGHT,
      SCREEN_WIDTH, GROUND_HEIGHT,
      SCREEN_WIDTH + GRID_BASE_OFFSET, SCREEN_HEIGHT - 1,
      0 - GRID_BASE_OFFSET, SCREEN_HEIGHT - 1,
      7, //vertical
      15); //horizontal

    // work out locale-friendly date/time
    var date = new Date();
    var timeStr = getTimeStr(date);                            
    var dateStr = require("locale").date(date).toUpperCase();
    var dowStr = require("locale").dow(date).toUpperCase();
    // draw time
    g.setFontAlign(0, 0).setFontMadeSunflower().setColor(foregroundColor);
    g.drawString(timeStr, x, y + 20);
    // draw date
    y += 35;
    g.setFontAlign(0, 0, 1).setFont("VGA8");
    g.drawString(dateStr, g.getWidth() - 8, g.getHeight() / 2 - 10);
    // draw the day of the week
    g.setFontAlign(0, 0, 3).setFont("VGA8");
    g.drawString(dowStr, 8, g.getHeight() / 2 - 10);
    // queue draw in one minute
    queueDraw();
  };

  // store the theme before drawing
  let originalTheme = g.theme;

  // Clear the screen once, at startup
  g.setTheme({ bg: COLOUR_VPW_GREEN, fg: foregroundColor, dark: false }).clear();

  // draw immediately at first, queue update
  draw();

  // Show launcher when middle button pressed
  // handle fast loading
  Bangle.setUI({
    mode: "clock",
    remove: function () {
      // clear timeout
      if (drawTimeout) clearTimeout(drawTimeout);
      // remove custom font
      delete Graphics.prototype.setFontMadeSunflower;
      // revert theme to how it was before
      g.setTheme(originalTheme);
    }
  });

  // Load widgets
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
