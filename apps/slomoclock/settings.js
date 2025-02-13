(function(back) {

  let settings = require('Storage').readJSON('slomoclock.json',1)||{};

  function writeSettings() {
    require('Storage').write('slomoclock.json',settings);
  }

  function setColour(c) {
    settings.colour = c;
    writeSettings();
  }

  const appMenu = {
    '': {'title': 'SloMo Clock'},
    '< Back': back,
    'Colours' : function() { E.showMenu(colMenu); }
    //,'Widget Space Top' : {value : settings.widTop, onchange : () => { settings.widTop = !settings.widTop; writeSettings(); }
    //,'Widget Space Bottom' : {value : settings.widBot, onchange : () => { settings.widBot = !settings.widBot; writeSettings(); }
  };

  const colMenu = {
    '': {'title': 'Colours'},
    '< Back': function() { E.showMenu(appMenu); },
    'Mysterion' : function() { setColour(0); },
    'Surprise' : function() { setColour(1); },
    'Red' : function() { setColour(2); },
    'Orange' : function() { setColour(3); },
    'Yellow' : function() { setColour(4); },
    'Green' : function() { setColour(5); },
    'Blue' : function() { setColour(6); },
    'Violet' : function() { setColour(7); },
    'White' : function() { setColour(8); }
  };

  E.showMenu(appMenu);

})
