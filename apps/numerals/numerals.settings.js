(function(back) {  
  function updateSettings() {  
    storage.write('numerals.json', numeralsSettings);
  };
  function resetSettings() {
    numeralsSettings = {
      color: 0,
      drawMode: "fill"
    };
    updateSettings();
  }
  let numeralsSettings = storage.readJSON('numerals.json',1);
  if (!numeralsSettings) resetSettings();  
  let dm = ["fill","frame"];
  let col = ["rnd","r/g","y/w","o/c","b/y"]
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
    "< back": back
  };
  E.showMenu(menu);
})