// make sure to enclose the function in parentheses
(function (back) {
  let settings = require('Storage').readJSON('gallifr.json',1)||{};
  let colours = ["green","red","blue","80s"];
  let onoff = ["on","off"];
  function save(key, value) {
    settings[key] = value;
    require('Storage').writeJSON('gallifr.json',settings);
  }
  const appMenu = {
    '': {'title': 'Clock Settings'},
    '< Back': back,
    'Colour': {
      value: 0|settings['colour'],
      min:0,max:3,
      format: m => colours[m],
      onchange: m => {save('colour', m)}
    },
    'Widgets': {
      value: 0|settings['widgets'],
      min:0,max:1,
      format: m => onoff[m],
      onchange: m => {save('widgets', m)}
    },
    'Decoration': {
      value: 0|settings['decoration'],
      min:0,max:1,
      format: m => onoff[m],
      onchange: m => {save('decoration', m)}
    }
  };
  E.showMenu(appMenu)
})
