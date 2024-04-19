(function(back) {
let settings = Object.assign({
  style : "randomcolor",
  colors : ["#F00","#0F0","#00F"]
},require("Storage").readJSON("clockbg.json")||{});

function saveSettings() {
  if (settings.style!="image")
    delete settings.fn;
  if (settings.style!="color")
    delete settings.color;
  if (settings.style!="randomcolor")
    delete settings.colors;
  require("Storage").writeJSON("clockbg.json", settings);
}

function getColorsImage(cols) {
  var bpp = 1;
  if (cols.length>4) bpp=4;
  else if (cols.length>2) bpp=2;
  var b = Graphics.createArrayBuffer(16*cols.length,16,bpp);
  b.palette = new Uint16Array(1<<bpp);
  cols.forEach((c,i)=>{
    b.setColor(i).fillRect(i*16,0,i*16+15,15);
    b.palette[i] = g.toColor(c);
  });
  return "\0"+b.asImage("string");
}

function showModeMenu() {
  E.showMenu({
    "" : {title:/*LANG*/"Background", back:showMainMenu},
    /*LANG*/"Solid Color" : function() {
      var cols = ["#F00","#0F0","#FF0",
                  "#00F","#F0F","#0FF",
                  "#000","#888","#fff",];
      var menu =  {"":{title:/*LANG*/"Colors", back:showModeMenu}};
      cols.forEach(col => {
        menu["-"+getColorsImage([col])] = () => {
          settings.style = "color";
          settings.color = col;
          saveSettings();
          showMainMenu();
        };
      });
      E.showMenu(menu);
    },
    /*LANG*/"Random Color" : function() {
      var cols = [
        ["#F00","#0F0","#FF0","#00F","#F0F","#0FF"],
        ["#F00","#0F0","#00F"],
      ];
      var menu =  {"":{title:/*LANG*/"Colors", back:showModeMenu}};
      cols.forEach(col => {
        menu[getColorsImage(col)] = () => {
          settings.style = "randomcolor";
          settings.colors = col;
          saveSettings();
          showMainMenu();
        };
      });
      E.showMenu(menu);
    },
    /*LANG*/"Image" : function() {
      let images = require("Storage").list(/clockbg\..*\.img/);
      if (images.length) {
        var menu =  {"":{title:/*LANG*/"Images", back:showModeMenu}};
        images.forEach(im => {
          menu[im.slice(8,-4)] = () => {
            settings.style = "image";
            settings.fn = im;
            saveSettings();
            showMainMenu();
          };
        });
        E.showMenu(menu);
      } else {
        E.showAlert("Please use App Loader to upload images").then(showModeMenu);
      }
    },
  });
}

function showMainMenu() {
  E.showMenu({
    "" : {title:/*LANG*/"Clock Background", back:back},
    /*LANG*/"Mode" : {
      value : settings.style,
      onchange : showModeMenu
    }
  });
}

showMainMenu();
})