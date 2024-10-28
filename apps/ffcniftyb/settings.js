(function (back) {
  const settings = Object.assign({ color: 63488 }, require("Storage").readJSON("ffcniftyb.json", true));

  const colors = {
    65535: /*LANG*/"White",
    63488: /*LANG*/"Red",
    65504: /*LANG*/"Yellow",
    2047: /*LANG*/"Cyan",
    2016: /*LANG*/"Green",
    31: /*LANG*/"Blue",
    0: /*LANG*/"Black"
  }

  const menu = {};
  menu[""] = { title: "Nifty-B Clock" };
  menu["< Back"] = back;

  Object.keys(colors).forEach(color => {
    var label = colors[color];
    menu[label] = {
      value: settings.color == color,
      onchange: () => {
        settings.color = color;
        require("Storage").write("ffcniftyb.json", settings);
        setTimeout(load, 10);
      }
    };
  });

  E.showMenu(menu);
})
