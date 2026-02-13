//MODERN CLOCK
{
//Initialize Bold Font
Graphics.prototype.setFontBold = function(scale) {
  // Actual height 69 (68 - 0)
  g.setFontCustom(E.toString(require('heatshrink').decompress(atob('AB/4Aon/Aok/8AFDh4SEg4SEgP/4AGDv4YKgf+FYl/AokCJRcP+AFDj/8JQg+Ev4+DIYP/DAUDAoIYCKoIFDh4REEQP/KwQiBEYYFCwA6C/5bDEYJBDGoJtEv5TFQokHEQQAPJQIsDHAJKDAoQ/CLgRRCNARACOgQABboQSEMYQSCEgQlCEgZxBDwJRBMAQFCg5FBfgRzBcYl/4DjDj4YCGgMPDAQxEKAYoBZYRqDCQYeBIgYeBCQYuCCQbfEZAbOFPoSwRXRTaEga/DPIbtEc4kfZYQeCf4iJDAARODKwh8CYIYbBNIYbBcAgbBSorgLVxgYFAA0DJQkHCoMPAQMDI4QCBMYQCCFYIuCDYN/CoLgDCoN/JQQVBn5KDwBTBDYXgd4IbC+AFBDAM/+AUBDAKhBPwWAHQJlCDAWAMYc/8H//oYCQIV/DAJ1CZQR8Cw6VE4KVE8AYBVwXwDAU/F4J8CCQP4gLjCv/8AQIYBh4FBfgoYCABEBB4YbBDQK0Dn4IBWgUP+AVBWgh2CAQPAOwSSCHQIYCMYQYCVweH+CVD8P+CoQeBv+D/6uCLYN/4A0BA4QrB/+D/0HKIKuCwIYC/l/+AYCWgYYBVwTHCVwTgCVwTgCVwQABMYQFCDwISB+4eCCQP5/6PCj/8j6CCgP8HQKoEnyzJXQ7GERYIFFIYIACIYQFDHoT0CDAgFBDAYFBDAZkBDAZqCAoSDB34YCAoPPDAQFB4YYCh4pBDASVFVwQABcASuETYaJBDwIYWGIqABDAgABgZ8EEIIFEn6VEABkPVokDOwSUB8DgCAoP4EoSCB/0PKAJKCwY4BJQXgWoQYB/k/CQIYB/8PMYgYBMYfgn5jBv+H+EHMgMf8P8fQUH/F/B4PAgP+j/gj5RBDAP8h4YDSogYBSoYYBSoYYBVwYjBAoIeBDAK2BDwIYBKQWADAOAAoJ8CHgIFCWgauQv42BVwYYDAoTaDdgYFEYIhKCcgIMCD4MPCQhVCCQUDAoQlCCAV/PgR6BSof9/yuD/gDBVwX/YoKuC/+P/DHCn/j/40BHoP4GIcD/xLCGIIYBVwc/4KuEIQIGBOwReCOwSJFOIQkBAAI2BQQQMCBYYAKcAIFDcAK/FGgQABcAIDBgQYEgeADAcDSoQYBgYPBDAUHB4IYCJYIYDAoIYDAoIYDAoIYDOwYYBAoQYCSoRwBj/vBYbmDAoKNCRAagCSgUfAogYCAoQYCO4YYBAoYYBSogFEDAKVEvyxNABVwW4n/wJXDQwL/CIgRGDeIJ8DQ4QSCPgaVCAoaVCAoSuBDwZaBDwXwPwMDVwP4j4rB/+D/0HFYM/8BLCDAP4v/gv4YBDwP+v4YCIgiuCcAZKLMYoSDDwISB/IeCEoP8CgK1C/g6BTok/Vx8/dgSiCUwSoDBgYvBRoLzDGAaPCYwR2CPwPAMYaVCVwXHSoQFB+KVCVAP8v+AVwIaBUoKVBwE/57HC8EP+Z2BVwMD/YPBG4IzCKQKbDG4KuDDwKbDSoTsEVwmACQh3CYAglDFQK7CAoYMCCIQATggCBG4JkB8DWBAoMHAYJECGIJ5CYIXgj68Cn/4KYIeCSwRXBDA/ASQISC+EDGIUBLYM+JRAA='))), 46, atob("DhIcFhwdHRwdHR0cDg=="), 50|65536);
};

 // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let settings= Object.assign({
  // default values
  color: "#00FF00"
}, require('Storage').readJSON("modclock.settings.json", true) || {});
let drawTimeout;
let showInlineClkInfo=true;
let calcStrLength=function(str,maxLength){

    //too long
    
     // Example maximum length
    var truncatedText = str;

    if (str.length > maxLength) {
      truncatedText = str.substring(0, maxLength - 3) + "...";
    }
  
    return truncatedText;
};
  
//ROUNDED RECT FUNCTION
let bRoundedRectangle= function(x1,y1,x2,y2,r) {
    var f = 1 - r;
    var ddF_x = 0;
    var ddF_y = -2 * r;
    var x = 0;
    var y = r;
    g.drawLine(x1+r,y1,x2-r,y1);
    g.drawLine(x1+r,y2,x2-r,y2);
    g.drawLine(x1,y1+r,x1,y2-r);
    g.drawLine(x2,y1+r,x2,y2-r);
    var cx1=x1+r;
    var cx2=x2-r;
    var cy1=y1+r;
    var cy2=y2-r;
    while(x < y)
    {
      if(f >= 0)
      {
        y--;
        ddF_y += 2;
        f += ddF_y;
      }
      x++;
      ddF_x += 2;
      f += ddF_x + 1;
      g.setPixel(cx2 + x, cy2 + y);
      g.setPixel(cx1 - x, cy2 + y);
      g.setPixel(cx2 + x, cy1 - y);
      g.setPixel(cx1 - x, cy1 - y);
      g.setPixel(cx2 + y, cy2 + x);
      g.setPixel(cx1 - y, cy2 + x);
      g.setPixel(cx2 + y, cy1 - x);
      g.setPixel(cx1 - y, cy1 - x);
    }
  };
  
  
//CLOCK INFO
let clockInfoItems = require("clock_info").load();

  

//CLOCK INFO 1 DIMENSIONS: 13,103,w:66,h:65  

let clockInfoMenuLeft = require("clock_info").addInteractive(clockInfoItems, {
    // Add the dimensions we're rendering to here - these are used to detect taps on the clock info area
    x : 7, y: 100, w: 76, h:70,
  // You can add other information here you want to be passed into 'options' in 'draw'
  // This function draws the info
  draw : (itm, info, options) => {
    // itm: the item containing name/hasRange/etc
    // info: data returned from itm.get() containing text/img/etc
    // options: options passed into addInteractive
    // Clear the background
    g.reset().clearRect(options.x-5, options.y-5, options.x+options.w+5, options.y+options.h+5);
    // indicate focus - we're using a border, but you could change color?
    if (options.focus){
      // show if focused
      g.setColor(settings.color);
      bRoundedRectangle(options.x,options.y,options.x+options.w,options.y+options.h,8); 
    }else{
      g.setColor(g.theme.fg);
      bRoundedRectangle(options.x,options.y,options.x+options.w,options.y+options.h,8); 
    }
    // we're drawing center-aligned here
    var midx = options.x+options.w/2;
    var midy=options.y+options.h/2;
    if (info.img){
      g.drawImage(info.img, midx-12,midy-21);
    }// draw the image
    g.setFont("Vector",16).setFontAlign(0,1).drawString(calcStrLength(info.text,8), midx,midy+23); // draw the text
  }
});



//CLOCK INFO RIGHT DIMENSIONS: 97,113, w:66, h: 55
let clockInfoMenuRight = require("clock_info").addInteractive(clockInfoItems, {
  // Add the dimensions we're rendering to here - these are used to detect taps on the clock info area
  x : 91, y: 100, w: 76, h:70,
  // You can add other information here you want to be passed into 'options' in 'draw'
  // This function draws the info
  draw : (itm, info, options) => {
    // itm: the item containing name/hasRange/etc
    // info: data returned from itm.get() containing text/img/etc
    // options: options passed into addInteractive
    // Clear the background
    g.reset().clearRect(options.x-5, options.y-5, options.x+options.w+5, options.y+options.h+5);
    // indicate focus - we're using a border, but you could change color?
    if (options.focus){
      // show if focused
      g.setColor(settings.color);
      bRoundedRectangle(options.x,options.y,options.x+options.w,options.y+options.h,8);  
    }else{
      g.setColor(g.theme.fg);
      bRoundedRectangle(options.x,options.y,options.x+options.w,options.y+options.h,8);     
    }
    // we're drawing center-aligned here
    var midx = options.x+options.w/2;
    var midy=options.y+options.h/2;
    if (info.img){
      g.drawImage(info.img, midx-12,midy-21);
    }// draw the image
    g.setFont("Vector",16).setFontAlign(0,1).drawString(calcStrLength(info.text,8), midx,midy+23); // draw the text
  }
});
let clockInfoMenuInline;

if(showInlineClkInfo){
    clockInfoMenuInline = require("clock_info").addInteractive(clockInfoItems, {
      // Add the dimensions we're rendering to here - these are used to detect taps on the clock info area
      x : g.getWidth()/2+6, y: 69, w: 95, h:25,
    // You can add other information here you want to be passed into 'options' in 'draw'
    // This function draws the info
    draw : (itm, info, options) => {
      // itm: the item containing name/hasRange/etc
      // info: data returned from itm.get() containing text/img/etc
      // options: options passed into addInteractive
      // Clear the background
      g.reset().clearRect(options.x, options.y, options.x+options.w, options.y+options.h);
      // indicate focus - we're using a border, but you could change color?
      if (options.focus){
        // show if focused
        g.setColor(settings.color);
       
      }
      // we're drawing center-aligned here
      //var midx = options.x+options.w/2;
      var midy=options.y+options.h/2;
      if (info.img){
        g.drawImage(info.img, options.x+4,midy-7.2,{scale: 0.63});
      }// draw the image
      g.setFont("Vector",15).setFontAlign(-1,0).drawString(calcStrLength(info.text,6), options.x+22,midy+1); // draw the text
    }
  }); 

}



// DRAW FACE
let draw = function() {
  var X = g.getWidth() / 2;
  var Y = (g.getHeight() / 2)-15;
  g.reset();
  var d = new Date();
  var clock = require("locale").time(d, 1 /*omit seconds*/);
  var meridian = require("locale").meridian(d);
  // draw the current time (4x size 7 segment)

   // align bottom right
  
  g.setFontBold();
  
  if(meridian!=""){
    //calculate alignment
    g.setFontBold();
    //padding in px
    var padding=7;
    var clkStrWidth= g.stringWidth(clock);
    g.setFont("Vector",18);
    var meridianStrWidth=g.stringWidth(meridian);
    var totalStrWidth=meridianStrWidth+padding+clkStrWidth;
    var startX = ((g.getWidth() - totalStrWidth) / 2)+6;
    g.clearRect(0,0,g.getWidth(),64);
    g.setFontBold();
    g.setFontAlign(-1,1);
    g.drawString(clock, startX, Y+4);
    g.setFont("Vector",20);
    g.setFontAlign(-1,1);
    g.drawString(meridian, startX + clkStrWidth + padding, Y-9, true);
    
  }else{
    
    g.setFontBold();
    g.setFontAlign(0,1);
    g.drawString("  "+clock+"  ", X, Y+4,true);
    
  }
  
  // draw the date, in a normal font
  g.setFont("Vector",16);
  g.setFontAlign(1,0); // align center bottom
  // pad the date - this clears the background if the date were to change length
  var dateStr = "  "+require("locale").dow(new Date(), 1)+", " +new Date().getDate();
  //print(g.stringHeight(dateStr));
  g.drawString(" "+dateStr+" ", g.getWidth()/2+6, Y+9, true /*clear background*/);
  
  Bangle.drawWidgets();
  g.setColor("#ffffff");

  
  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};

  

  
// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Graphics.prototype.setFontBold;
    clockInfoMenuRight.remove();
    clockInfoMenuLeft.remove();
    if(showInlineClkInfo) clockInfoMenuInline.remove();
    
  }});
  
g.clear();
// Load widgets
Bangle.loadWidgets();
draw();

  
}
