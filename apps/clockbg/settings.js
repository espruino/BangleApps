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
  if (settings.style!="randomcolor" && settings.style!="squares")
    delete settings.colors;
  require("Storage").writeJSON("clockbg.json", settings);
}

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
        // Please add some more!
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
    /*LANG*/"Squares" : function() {
      /*
      a = new Array(16);
      a.fill(0);
      print(a.map((n,i)=>E.HSBtoRGB(0 + i/16,1,1,24).toString(16).padStart(6,0).replace(/(.).(.).(.)./,"\"#$1$2$3\"")).join(","))
      */
      var cols = [ // list of color palettes used as possible square colours - either 4 or 16 entries
        ["#00f","#05f","#0bf","#0fd","#0f7","#0f1","#3f0","#9f0","#ff0","#f90","#f30","#f01","#f07","#f0d","#b0f","#50f"],
        ["#0FF","#0CC","#088","#044"],
        ["#FFF","#FBB","#F66","#F44"],
        ["#FFF","#BBB","#666","#000"]
        // Please add some more!
      ];
      var menu =  {"":{title:/*LANG*/"Squares", back:showModeMenu}};
      cols.forEach(col => {
        menu[getColorsImage(col)] = () => {
          settings.style = "squares";
          settings.colors = col;
          console.log(settings);
          saveSettings();
          showMainMenu();
        };
      });
      E.showMenu(menu);
    }
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