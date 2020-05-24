(function(back) {

  const SETTINGS_FILE = 'berlinc.json'

  // initialize structure
  let s = {
    'showdate' : false
  }

  const storage = require('Storage')
  const savedsettings = storage.readJSON(SETTINGS_FILE,1) || {}
  // read values from storage (if any)
  for (const key in savedsettings) {
    s[key]=savedsettings[key]
  }

  function save (key) {
    return function(value) {
      s[key]=value;
      storage.write(SETTINGS_FILE,s);
    }
  }

  const booleanFormat = b => ( b ? 'on':'off' )

  const menu =  {
    '' : { 'title' : 'Berlin Clock Settings'} ,
    '< Back' : back,
    'Show Date' : {
      value : s.showdate,
      format: booleanFormat,
      onChange: save('showdate')
    }
  }
  digitalWrite(LED1,0);
  E.showMenu(menu)
})