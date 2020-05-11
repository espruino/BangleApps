// make sure to enclose the function in parentheses
(function (back) {
    let settings = require('Storage').readJSON('app.json',1)||{};
    let colours = ["green","red","blue"];
    let widgets = ["on","off"];
    function save(key, value) {
      settings[key] = value;
      require('Storage').write('app.json',settings);
    }
    const appMenu = {
      '': {'title': 'Clock Settings'},
      '< Back': back,
      'Colour': {
        value: 0|settings.colour,
        min:0,max:2,
        format: m=>colours[m],
        onchange: (m) => {save('colour', m)}
      'Widgets': {
        value: 0|settings.widgets,
        min:0,max:1,
        format: m=>widgets[m],
        onchange: (m) => {save('widgets', m)}
      }   
    };
    E.showMenu(appMenu)
  })