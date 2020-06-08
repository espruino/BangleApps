(function(back) {  
  function updateSettings() {  
    storage.write('numerals.json', numeralsSettings);
  }
  function resetSettings() {
    numeralsSettings = {
      color:0,
      drawMode:"fill",
      menuButton:22
    };
    updateSettings();
  }
  let numeralsSettings = storage.readJSON('numerals.json',1);
  if (!numeralsSettings) resetSettings();
  if (numeralsSettings.menuButton===undefined) numeralsSettings.menuButton=22;
  let dm = ["fill","frame"];
  let col = ["rnd","r/g","y/w","o/c","b/y"];
  let btn = [[24,"BTN1"],[22,"BTN2"],[23,"BTN3"],[11,"BTN4"],[16,"BTN5"]];
  var menu={
    "" : { "title":"Numerals"},
    "Colors": {
      value: 0|numeralsSettings.color,
      min:0,max:4,
      format: v=>col[v],
      onchange: v=> { numeralsSettings.color=v; updateSettings();}
    },
    "Draw mode": {
      value: 0|dm.indexOf(numeralsSettings.drawMode),
      min:0,max:1,
      format: v=>dm[v],
      onchange: v=> { numeralsSettings.drawMode=dm[v]; updateSettings();}
    },
    "Menu button": {
      value: btn.findIndex(e=>e[0]==numeralsSettings.menuButton),
      min:0,max:4,
      format: v=>btn[v][1],
      onchange: v=> { numeralsSettings.menuButton=btn[v][0]; updateSettings();}
    },
    "< back": back
  };
  E.showMenu(menu);
})