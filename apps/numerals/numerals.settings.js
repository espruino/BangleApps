(function(back) {
  function updateSettings() {
    storage.write('numerals.json', numeralsSettings);
  }
  function resetSettings() {
    numeralsSettings = {
      color:0,
      drawMode:"fill",
      showDate:0
    };
    updateSettings();
  }
  let numeralsSettings = storage.readJSON('numerals.json',1);
  if (!numeralsSettings) resetSettings();
  let dm = ["fill","frame","framefill","thickframe"];
  let col = ["rnd","r/g","y/w","o/c","b/y"];
  let btn = [[24,"BTN1"],[22,"BTN2"],[23,"BTN3"],[11,"BTN4"],[16,"BTN5"]];
  var menu={
    "" : { "title":"Numerals"},
    "Colors": {
      value: 0|numeralsSettings.color,
      min:0,max:col.length-1,
      format: v=>col[v],
      onchange: v=> { numeralsSettings.color=v; updateSettings();}
    },
    "Draw": {
      value: 0|dm.indexOf(numeralsSettings.drawMode),
      min:0,max:dm.length-1,
      format: v=>dm[v],
      onchange: v=> { numeralsSettings.drawMode=dm[v]; updateSettings();}
    },
    "Date on touch": {
      value: 0|numeralsSettings.showDate,
      min:0,max:1,
      format: v=>v?"On":"Off",
      onchange: v=> { numeralsSettings.showDate=v; updateSettings();}
    },
    "< back": back
  };
  E.showMenu(menu);
})
