(function(back) {
  const FILE = "ultrainfo.json";
  // Load settings
  var settings = Object.assign({
    accentColor: "#f00",
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }
  
  // same as in clock_bg
  function getColorsImage(cols) {
    var bpp = 1;
    if (cols.length>4) bpp=4;
    else if (cols.length>2) bpp=2;
    var w = (cols.length>8)?8:16;
    var b = Graphics.createArrayBuffer(w*cols.length,16,bpp);
    b.palette = new Uint16Array(1<<bpp);
    cols.forEach((c,i)=>{
      b.setColor(i).fillRect(i*w,0,i*w+w-1,15);
      b.palette[i] = g.toColor(c);
    });
    return "\0"+b.asImage("string");
  }
  function showAccentColor(){
    var menu={
    "" : { "title" : "Accent Color" },
    "< Back" : showMainMenu,

    }
    var cols = ["#F00","#0F0","#FF0",
                    "#00F","#F0F","#0FF",
                    "#000","#888","#fff",];
    cols.forEach(col => {
        menu[" "+getColorsImage([col])] = () => {
          settings.accentColor=col;
          writeSettings();
          showMainMenu();
        };
      });
    E.showMenu(menu);
  }
  function showMainMenu(){
  // Show the menu
    E.showMenu({
      "" : { "title" : "Ultra Info" },
      "< Back" : () => back(),
      'Accent Color': showAccentColor

    });
  }
  showMainMenu()
})