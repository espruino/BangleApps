Graphics.prototype.setFont7Seg = function() {
  return this.setFontCustom(atob("AAAAAAAAAAAACAQCAAAAAAIAd0BgMBdwAAAAAAAADuAAAB0RiMRcAAAAAiMRiLuAAAcAQCAQdwAADgiMRiIOAAAd0RiMRBwAAAAgEAgDuAAAd0RiMRdwAADgiMRiLuAAAABsAAAd0QiEQdwAADuCIRCIOAAAd0BgMBAAAAAOCIRCLuAAAd0RiMRAAAADuiEQiAAAAAd0BgMBBwAADuCAQCDuAAAdwAAAAAAAAAAAIBALuAAAdwQCAQdwAADuAIBAIAAAAd0AgEAcEAgEAdwAd0AgEAdwAADugMBgLuAAAd0QiEQcAAADgiEQiDuAAAd0AgEAAAAADgiMRiIOAAAAEAgEAdwAADuAIBALuAAAdwBAIBdwAADuAIBAIOAIBALuADuCAQCDuAAAcAQCAQdwAAAOiMRiLgAAAA=="), 32, atob("BwAAAAAAAAAAAAAAAAcCAAcHBwcHBwcHBwcEAAAAAAAABwcHBwcHBwcHBwcHCgcHBwcHBwcHBwoHBwc="), 9);
};


{
  const SETTINGS_FILE = "pxl_clk.json";
  let settings;
  let drawTimeout;
  let loadSettings = function() {
    settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'bg': '#0ff', 'color': 'Cyan', 'showlock':true};
  };
  // Load fonts
  //require("Font7x11Numeric7Seg").add(Graphics);
  let offset = 0, offsetb = offset+5, off_x = 0, offset_poly=offset+10;
  let X = 30, Y = offset+97;
  let poly =   [35,offset_poly+63,103,offset_poly+63,106,offset_poly+66,106,offset_poly+89,103,offset_poly+92,35,offset_poly+92,32,offset_poly+89,32,offset_poly+66];
  let lock_poly = [0, offset_poly+63,26,offset_poly+63,29,offset_poly+66,29,offset_poly+89,26,offset_poly+92,0,offset_poly+92];

  let min_lista = [[off_x+1, offsetb+147],
                    [off_x+7, offsetb+146],
                    [off_x+13, offsetb+145],
                    [off_x+19, offsetb+142],
                    [off_x+25, offsetb+139],
                    [off_x+30, offsetb+136],
                    [off_x+35, offsetb+132],
                    [off_x+39, offsetb+128],
                    [off_x+43, offsetb+123],
                    [off_x+46, offsetb+118],
                    [off_x+49, offsetb+112],
                    [off_x+52, offsetb+106],
                    [off_x+53, offsetb+100],
                    [off_x+54, offsetb+94],
                    [off_x+55, offsetb+88],
                    [off_x+54, offsetb+81],
                    [off_x+53, offsetb+75],
                    [off_x+52, offsetb+69],
                    [off_x+49, offsetb+63],
                    [off_x+46, offsetb+58],
                    [off_x+43, offsetb+52],
                    [off_x+39, offsetb+47],
                    [off_x+35, offsetb+43],
                    [off_x+30, offsetb+39],
                    [off_x+25, offsetb+36],
                    [off_x+19, offsetb+33],
                    [off_x+13, offsetb+30],
                    [off_x+7, offsetb+29],
                    [off_x+1, offsetb+28]];

  let sec_lista = [[off_x+33, offsetb+174],
                    [off_x+42, offsetb+170],
                    [off_x+50, offsetb+164],
                    [off_x+58, offsetb+158],
                    [off_x+65, offsetb+151],
                    [off_x+71, offsetb+143],
                    [off_x+77, offsetb+135],
                    [off_x+81, offsetb+126],
                    [off_x+85, offsetb+117],
                    [off_x+87, offsetb+107],
                    [off_x+89, offsetb+97],
                    [off_x+90, offsetb+88],
                    [off_x+89, offsetb+78],
                    [off_x+87, offsetb+68],
                    [off_x+85, offsetb+58],
                    [off_x+81, offsetb+49],
                    [off_x+77, offsetb+40],
                    [off_x+71, offsetb+32],
                    [off_x+65, offsetb+24],
                    [off_x+58, offsetb+17],
                    [off_x+50, offsetb+11],
                    [off_x+42, offsetb+5],
                    [off_x+33, offsetb+1]];

  let minute_dots =[[off_x+2, offset+157, 1],
                    [off_x+9, offset+156, 1],
                    [off_x+16, offset+154, 1],
                    [off_x+23, offset+151, 1],
                    [off_x+30, offset+148, 1],
                    [off_x+36, offset+144, 1],
                    [off_x+41, offset+140, 1],
                    [off_x+47, offset+134, 1],
                    [off_x+51, offset+129, 1],
                    [off_x+55, offset+123, 1],
                    [off_x+58, offset+116, 1],
                    [off_x+61, offset+109, 1],
                    [off_x+63, offset+102, 1],
                    [off_x+64, offset+95, 1],
                    [off_x+65, offset+88, 1],
                    [off_x+64, offset+80, 1],
                    [off_x+63, offset+73, 1],
                    [off_x+61, offset+66, 1],
                    [off_x+58, offset+59, 1],
                    [off_x+55, offset+53, 1],
                    [off_x+51, offset+46, 1],
                    [off_x+47, offset+41, 1],
                    [off_x+41, offset+35, 1],
                    [off_x+36, offset+31, 1],
                    [off_x+30, offset+27, 1],
                    [off_x+23, offset+24, 1],
                    [off_x+16, offset+21, 1],
                    [off_x+9, offset+19, 1],
                    [off_x+2, offset+18, 1]];

  let sec_dots = [[off_x+56,  offset+172, 0],
                    [off_x+65,  offset+166, 0],
                    [off_x+73,  offset+158, 0],
                    [off_x+79,  offset+149, 0],
                    [off_x+85,  offset+140, 0],
                    [off_x+90,  offset+130, 0],
                    [off_x+94,  offset+120, 0],
                    [off_x+97,  offset+109, 0],
                    [off_x+99,  offset+98, 0],
                    [off_x+100,  offset+88, 0],
                    [off_x+99,  offset+77, 0],
                    [off_x+97,  offset+66, 0],
                    [off_x+94,  offset+55, 0],
                    [off_x+90,  offset+45, 0],
                    [off_x+85,  offset+35, 0],
                    [off_x+79,  offset+26, 0],
                    [off_x+73,  offset+17, 0],
                    [off_x+65,  offset+9, 0],
                    [off_x+56,  offset+3, 0]];

  let first_sec_dot = 0;
  let first_min_dot = 0;

  let draw = function() {
    // work out how to display the current time
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes(); 
    var s = d.getSeconds();
    //var h = 10, m = 10, s = 12;
    var h_only = ("0"+h).substr(-2);
    var m_only = m.toString().padStart(2,0);
    var s_only = ("0"+s).substr(-2);
    // Reset the state of the graphics library
    g.reset();
    g.clearRect(0,0,100,59);
    g.clearRect(31,59,107,117);
    g.clearRect(0,117,100,175);

    var min_time = m%5;
    var sec_time = s%5;
    var licz = 1;

    first_sec_dot = -11;
    first_min_dot = -14;

    for (let i of min_lista){
      if (licz%5 == min_time) {
        minutka = (m-first_min_dot);
        if(minutka == -5){
          minutka = 55;
        } else if (minutka == -10){
          minutka = 50;
        } else if (minutka == 60){
          minutka = 0;
        } else if (minutka == 65){
          minutka = 5;
        } else if (minutka ==70){
          minutka = 10;
        }
        g.setFontAlign(1,1).setFont("7Seg").drawString(("0"+minutka).substr(-2),i[0],i[1]);
      }
      licz+=1;
      first_min_dot+=1;
    }

    licz =9;
    for (let i of sec_lista){
      if (licz%5 == sec_time) {
        secundka = (s-first_sec_dot);
        if(secundka == -10){
          secundka = 50;
        } else if(secundka == -5){
          secundka = 55;
        } else if (secundka == 60){
          secundka = 0;
        } else if (secundka == 65){
          secundka = 5;
        } else if (secundka == 70){
          secundka = 10;
        }
        g.setFontAlign(1,1).setFont("7Seg").drawString(("0"+secundka).substr(-2),i[0],i[1]);
      }
      licz+=1;
      first_sec_dot+=1;
    }

    g.clearRect(35,offset+74,69,offset+101);
    g.setFontAlign(1,1).setFont("7Seg",2);
    g.drawString(h_only, X, Y, true /*clear background*/);
    g.drawString(m_only, X+32, Y, true /*clear background*/);
    //g.drawString(s_only, X+68, Y, true /*clear background*/);

    licz = 1;
    for (let i of minute_dots){
      if (licz%5 == min_time) {
        g.drawCircle(i[0],i[1],3);
      } else {
        g.drawCircle(i[0],i[1],i[2]);
      }
      licz+=1;
    }

    licz = 6;
    for (let i of sec_dots){
      if (licz%5 == sec_time) {
        g.drawCircle(i[0],i[1],2);
      } else {
        g.drawCircle(i[0],i[1],i[2]);
      }
      licz+=1;
    }

    g.drawPoly(poly,true);

    // queue next draw
    queueDraw();
  };
  
  // schedule a draw for the next second / minute
  let queueDraw = function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, Bangle.isLocked() ? (60000 - (Date.now() % 60000)) : (1000 - (Date.now() % 1000)));
  };

  let clockInfoDraw = (itm, info, options) => {
    //let texty = options.y+41;
    g.reset().setFont("7Seg");//.setColor(g.theme.bg).setBgColor(g.theme.fg);
    if (options.focus) g.setBgColor(settings.bg);
    g.clearRect({x:options.x,y:options.y,w:options.w,h:options.h,r:8});
    if (itm.hasRange){
      var proc = info.v/info.max;
      drawGauge(options.x+options.w/2,options.y+options.h/2,proc);
    }
    if (info.img) {
      g.drawImage(info.img, options.x+24,options.y+6);
    }
    var text = info.text.toString().toUpperCase();
    if (g.setFont("7Seg:2").stringWidth(text)+20>options.w) g.setFont("7Seg");
    g.setFontAlign(-1,-1).drawString(text, options.x+5+options.w/4, options.y+33);
  };

  let drawGauge = function(cx, cy, percent) {
    let end = 360;
    let radius = 27;

    if (percent <= 0) return; // no gauge needed
    if (percent > 1) percent = 1;

    let startRotation = 180;
    let endRotation = startRotation - (end * percent);

    color = settings.bg;
    g.setColor(color);
    // convert to radians
    startRotation *= Math.PI / 180;
    let amt = Math.PI / 10;
    endRotation = (endRotation * Math.PI / 180) - amt;
    // all we need to draw is an arc, because we'll fill the center
    let poly = [cx,cy];
    for (let r = startRotation; r > endRotation; r -= amt)
      poly.push(
        cx + radius * Math.sin(r),
        cy + radius * Math.cos(r)
    );
    g.fillPoly(poly);
    g.setColor(g.theme.bg);
    g.fillCircle(cx,cy,23);
    g.reset();
  };

  let drawLock = function(){
    if(settings.showlock){
      var color = "#ff0000";
      g.setColor(g.theme.bg);
      g.drawPoly(lock_poly,false);
      var c = Bangle.isLocked() ? color : g.theme.bg;
      g.setColor(c);
      g.drawPoly(lock_poly,false);
    } else {
      g.setColor(g.theme.bg);
      g.drawPoly(lock_poly,false);
    }
  };

  // Clear the screen once, at startup
  g.clear();
  loadSettings();
  // draw immediately at first
  draw();
  drawLock();
  
  let isLockedw = on => {
    draw();
    drawLock();
  };
  
  Bangle.on('lock', isLockedw);

  /* Show launcher when middle button pressed
  This should be done *before* Bangle.loadWidgets so that
  widgets know if they're being loaded into a clock app or not */
  Bangle.setUI({
    mode : "clock",
    remove : function() {
      // Called to unload all of the clock app
      if (drawTimeout) clearTimeout(drawTimeout);
      delete Graphics.prototype.setFont7Seg;
      Bangle.removeListener('lock',isLockedw);
      // remove info menu
      clockInfoMenu.remove();
      delete clockInfoMenu;
      clockInfoMenu2.remove();
      delete clockInfoMenu2;
      clockInfoMenu3.remove();
      delete clockInfoMenu3;
      require("widget_utils").show();
    }});

  // Load widgets
  Bangle.loadWidgets();
  //Bangle.drawWidgets();
  require("widget_utils").hide();

  let clockInfoItems = require("clock_info").load();
  let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, { app:"lcdclock", x:100, y:1, w:74, h:58, draw : clockInfoDraw});
  let clockInfoMenu2 = require("clock_info").addInteractive(clockInfoItems, {  app:"lcdclock", x:107, y:59, w:68, h:58, draw : clockInfoDraw});
  let clockInfoMenu3 = require("clock_info").addInteractive(clockInfoItems, {  app:"lcdclock", x:100, y:117, w:74, h:58, draw : clockInfoDraw});
}
