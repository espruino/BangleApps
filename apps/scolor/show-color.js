/* jshint esversion: 6 */
(function() {

  const colors = {
    0: { value: 0x0000, name: "Black" },
    1: { value: 0x000F, name: "Navy" },
    2: { value: 0x03E0, name: "DarkGreen" },
    3: { value: 0x03EF, name: "DarkCyan" },
    4: { value: 0x7800, name: "Maroon" },
    5: { value: 0x780F, name: "Purple" },
    6: { value: 0x7BE0, name: "Olive" },
    7: { value: 0xC618, name: "LightGray" },
    8: { value: 0x7BEF, name: "DarkGrey" },
    9: { value: 0x001F, name: "Blue" },
    10: { value: 0x07E0, name: "Green" },
    11: { value: 0x07FF, name: "Cyan" },
    12: { value: 0xF800, name: "Red" },
    13: { value: 0xF81F, name: "Magenta" },
    14: { value: 0xFFE0, name: "Yellow" },
    15: { value: 0xFFFF, name: "White" },
    16: { value: 0xFD20, name: "Orange" },
    17: { value: 0xAFE5, name: "GreenYellow" },
    18: { value: 0xF81F, name: "Pink" },
  };

  const maxColors = 19;
  var index = 0;

  function drawColor() {

    // draw filled rectangle
    g.setColor(colors[index % maxColors].value);
    g.fillRect(0, 24, g.getWidth(), g.getHeight());

    // draw value name of color
    g.setFontAlign(0, 0);
    g.setColor(0xFFFF);
    if (colors[index % maxColors].name == "White")
      g.setColor(0);
    g.setFont("6x8", 4);
    g.drawString('0x' + colors[index % maxColors].value.toString(16), 120, 80);
    g.setFont("6x8", 3);
    g.drawString(colors[index % maxColors].name, 120, 160);

    // draw next button info
    g.setFont("6x8", 2);
    g.setFontAlign(0, 0, 3);
    g.drawString("Next", 230, 60);

    // set watches for button 1 
    index++;
    setWatch(drawColor, BTN1, { repeate: true });

  }

  g.clear();
  setWatch(drawColor, BTN1, { repeate: false });
  E.showMessage("Press BTN1\nto start");

})();
