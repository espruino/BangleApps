(function(back) {
  let settings = Object.assign({
    style : "randomcolor",
    colors : ["#F00","#0F0","#00F"]
  },require("Storage").readJSON("clockbg.json",1)||{});

  function saveSettings() {
    if (settings.style!="image")
      delete settings.fn;
    if (settings.style!="color")
      delete settings.color;
    if (!["randomcolor","squares","plasma","rings","tris"].includes(settings.style))
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
          ["#FF0","#F0F","#0FF"],
          ["#00f","#0bf","#0f7","#3f0","#ff0","#f30","#f07","#b0f"],
          ["#66f","#6df","#6fb","#8f6","#ff6","#f86","#f6b","#d6f"],
          ["#007","#057","#073","#170","#770","#710","#703","#507"]
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
        var cols = [ // list of color palettes used as possible square colours - either 4 or 16 entries
          ["#00f","#05f","#0bf","#0fd","#0f7","#0f1","#3f0","#9f0","#ff0","#f90","#f30","#f01","#f07","#f0d","#b0f","#50f"],
          ["#44f","#48f","#4df","#4fe","#4fa","#4f6","#7f4","#bf4","#ff4","#fb4","#f74","#f46","#f4a","#f4e","#d4f","#84f"],
          ["#009","#039","#079","#098","#094","#091","#290","#590","#990","#950","#920","#901","#904","#908","#709","#309"],
          ["#0FF","#0CC","#088","#044"],
          ["#FFF","#FBB","#F66","#F44"],
          ["#FFF","#BBB","#666","#000"],
          ["#fff","#bbf","#77f","#33f"],
          ["#fff","#bff","#7fe","#3fd"]
          // Please add some more! 4 or 16 only!
        ];
        var menu =  {"":{title:/*LANG*/"Squares", back:showModeMenu}};
        cols.forEach(col => {
          menu[getColorsImage(col)] = () => {
            settings.style = "squares";
            settings.colors = col;
            saveSettings();
            showMainMenu();
          };
        });
        E.showMenu(menu);
      },
      /*LANG*/"Plasma" : function() {
        var cols = [ // list of color palettes used as possible square colours - 16 entries
          ["#00f","#05f","#0bf","#0fd","#0f7","#0f1","#3f0","#9f0","#ff0","#f90","#f30","#f01","#f07","#f0d","#b0f","#50f"],
          ["#44f","#48f","#4df","#4fe","#4fa","#4f6","#7f4","#bf4","#ff4","#fb4","#f74","#f46","#f4a","#f4e","#d4f","#84f"],
          ["#009","#039","#079","#098","#094","#091","#290","#590","#990","#950","#920","#901","#904","#908","#709","#309"],
          ["#fff","#fef","#fdf","#fcf","#fbf","#fae","#f9e","#f8e","#f7e","#f6e","#f5d","#f4d","#f3d","#f2d","#f1d","#f0c"],
          ["#fff","#eff","#dff","#cef","#bef","#adf","#9df","#8df","#7cf","#6cf","#5bf","#4bf","#3bf","#2af","#1af","#09f"],
          ["#000","#010","#020","#130","#140","#250","#260","#270","#380","#390","#4a0","#4b0","#5c0","#5d0","#5e0","#6f0"]
          // Please add some more!
        ];
        var menu =  {"":{title:/*LANG*/"Plasma", back:showModeMenu}};
        cols.forEach(col => {
          menu[getColorsImage(col)] = () => {
            settings.style = "plasma";
            settings.colors = col;
            saveSettings();
            showMainMenu();
          };
        });
        E.showMenu(menu);
      },
      /*LANG*/"Rings" : function() {
        var cols = [ // list of color palettes used as possible square colours - 2 entries
          ["#ff0","#f00"], // yellow/red
          ["#0ff","#000"], // cyan/blue
          ["#888","#000"], // grey/black
          ["#888","#fff"], // grey/white
          ["#444","#0f0"], // grey/green
          ["#444","#f0f"], // grey/purple
          // Please add some more!
        ];
        var menu =  {"":{title:/*LANG*/"Rings", back:showModeMenu}};
        cols.forEach(col => {
          menu[getColorsImage(col)] = () => {
            settings.style = "rings";
            settings.colors = col;
            saveSettings();
            showMainMenu();
          };
        });
        E.showMenu(menu);
      },
      /*LANG*/"Tris" : function() {
        var cols = [ // 2/4/8/16 (8/16 both use 4bpp)
          ["#00f","#05f","#0bf","#0fd","#0f7","#0f1","#3f0","#9f0","#ff0","#f90","#f30","#f01","#f07","#f0d","#b0f","#50f"],
          ["#00f","#0bf","#0f7","#3f0","#ff0","#f30","#f07","#b0f"],
          ["#0ef","#6f0","#f10","#90f"],
          ["#09f","#1f0","#f60","#e0f"],
          ["#000","#444","#888","#fff"]
          // Please add some more!
        ];
        var menu =  {"":{title:/*LANG*/"Colors", back:showModeMenu}};
        cols.forEach(col => {
          menu[getColorsImage(col)] = () => {
            settings.style = "tris";
            settings.colors = col;
            saveSettings();
            showMainMenu();
          };
        });
        E.showMenu(menu);
      },
    });
  }

  function showMainMenu() {
    E.showMenu({
      "" : {title:/*LANG*/"Clock Background", back:back},
      /*LANG*/"Mode" : {
        value : settings.style,
        onchange : showModeMenu
      },
      /*LANG*/"View" : () => {
        Bangle.setUI({mode:"custom",touch:showMainMenu,btn:showMainMenu});
        require("clockbg").reload();
        require("clockbg").fillRect(Bangle.appRect);
      }
    });
  }

  /* Scripts for generating colors. Change the values in HSBtoRGB to generate different effects


  a = new Array(16);
  a.fill(0);
  g.clear();
  w = Math.floor(g.getWidth()/a.length);
  print(a.map((n,i)=>{
    var j = i/(a.length-1); // 0..1
    var c = E.HSBtoRGB(j,1,1,24); // rainbow
    var c = E.HSBtoRGB(j,0.6,1,24); // faded rainbow
    var c = E.HSBtoRGB(0.8, j,1,24); // purple->white
    var c = E.HSBtoRGB(0.1, j,1,24); // blue->white
    var c = E.HSBtoRGB(0.4, 1,j,24); // black->green
    var col = c.toString(16).padStart(6,0).replace(/(.).(.).(.)./,"\"#$1$2$3\"");
    g.setColor(eval(col)).fillRect(i*w,0, i*w+w-1,31);
    return col;
  }).join(","))

  */

  showMainMenu();
  })