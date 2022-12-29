(function(back) {
  let settings = require('Storage').readJSON('dragboard.json',1)||{};
  const colors = {
      4095: /*LANG*/"White",
      4080: /*LANG*/"Yellow",
      3840: /*LANG*/"Red",
      3855: /*LANG*/"Magenta",
      255: /*LANG*/"Cyan",
      240: /*LANG*/"Green",
      15: /*LANG*/"Blue",
      0: /*LANG*/"Black",
      null: /*LANG*/"Default"
  };

  const save = () => require('Storage').write('dragboard.json', settings);
  function colorMenu(key) {
    let menu = {'': {title: key}, '< Back': () => E.showMenu(appMenu)};
    Object.keys(colors).forEach(color => {
      var label = colors[color] + " Color";
      menu[label] = {
        value: settings[key] == color,
        onchange: () => {
          if (color) {
            settings[key] = color;
          } else {
            delete settings[key];
          }
          save();
          setTimeout(E.showMenu, 10, appMenu);
        }
      };
    });
    return menu;
  }

  const appMenu = {
      '': {title: 'Dragboard'}, '< Back': back,
      'CAPS LOCK': {
        value: !!settings.uppercase,
        onchange: v => {settings.uppercase = v; save();}
      },
      'ABC': () => E.showMenu(colorMenu("ABC")),
      'Num': () => E.showMenu(colorMenu("Num")),
      'Highlight': () => E.showMenu(colorMenu("Highlight"))
  };

  E.showMenu(appMenu);
});