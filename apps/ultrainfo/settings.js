(function(back) {
  const FILE = "ultrainfo.json";
  // Load settings
  var settings = Object.assign({
    accentColor: "#f00",
    mainColor:"#000"
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }
  function showClMenu(settingsKey){
    require("colorpicker").show({
        onSelect:function(color){
          settings[settingsKey]=color;
          writeSettings();
        },
        showPreview:true,
        back:function(){
          showMainMenu()
        }

      });
  }
  function showMainMenu(){
  // Show the menu
    E.showMenu({
      "" : { "title" : "Ultra Info" },
      "< Back" : () => back(),
      'Main Color': function(){
          showClMenu("mainColor")
       },
      'Accent Color': function(){
          showClMenu("accentColor")
       },
    });
  }
  showMainMenu()
})
