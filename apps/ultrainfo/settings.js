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
  
  function showMainMenu(){
  // Show the menu
    E.showMenu({
      "" : { "title" : "Ultra Info" },
      "< Back" : () => back(),
      'Main Color': function(){
        require("colorpicker").show({
          onSelect:function(color){
            settings.mainColor=color;
            writeSettings();
          },
          showPreview:true,
          back:function(){
            showMainMenu()
          }

        });
       },
      'Accent Color': function(){
        require("colorpicker").show({
          onSelect:function(color){
            settings.accentColor=color;
            writeSettings();
          },
          showPreview:true,
          back:function(){
            showMainMenu()
          }

        });
       },
    });
  }
  showMainMenu()
})
