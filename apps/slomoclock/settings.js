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
    //,'Widget Space Top' : {value : settings.widTop, format : v => v?"On":"Off",onchange : () => { settings.widTop = !settings.widTop; writeSettings(); }
    //,'Widget Space Bottom' : {value : settings.widBot, format : v => v?"On":"Off",onchange : () => { settings.widBot = !settings.widBot; writeSettings(); }
  };
  
  const colMenu = {
    '': {'title': 'Colours'},
    '< Back': function() { E.showMenu(appMenu); },
    'Surprise' : function() { setColour(0); },
    'Red' : function() { setColour(1); },
    'Orange' : function() { setColour(2); },
    'Yellow' : function() { setColour(3); },
    'Green' : function() { setColour(4); },
    'Blue' : function() { setColour(5); },
    'Violet' : function() { setColour(6); }
  };
  
  E.showMenu(appMenu);

});
