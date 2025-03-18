(function(back) {

  const Storage = require("Storage");
  const filename = 'dane_tcr.json';
  let settings = Storage.readJSON(filename,1)|| null;

  function getSettings(){
    return {
      highres: true,
      animation : true,
      frame : 3,
      debug: false
    };
  }
  
  function updateSettings() {
    require("Storage").writeJSON(filename, settings);
    Bangle.buzz();
  }
  
  if(!settings){
    settings = getSettings();
    updateSettings();
  }

  function saveChange(name){
    return function(v){
      settings[name] = v;
      updateSettings();
    }
  }

  E.showMenu({
    '': { 'title': 'DANE Toucher settings' },
    "Resolution" : {
      value : settings.highres,
      format : v => v?"High":"Low",
      onchange: v => {
        saveChange('highres')(!settings.highres);
      }
    },
    "Animation" : {
      value : settings.animation,
      onchange : saveChange('animation')
    },
    "Frame rate" : {
      value : settings.frame,
      min: 1, max: 10, step: 1,
      onchange : saveChange('frame')
    },
    "Debug" : {
      value : settings.debug,
      onchange : saveChange('debug')
    },
    '< Back': back
  });
})
