(() => {
  const weather = require("weather");

  var dirty = false;

  let settings;
  let buffer=Graphics.createArrayBuffer(15,15,1,{msb:true});
  function loadSettings() {
    settings = require("Storage").readJSON("weatherSetting.json", 1) || {};
  }

  function setting(key) {
    if (!settings) { loadSettings(); }
    const DEFAULTS = {
      "expiry": 2*3600000,
      "hide": false,
      "widgetData":0,
      "widgetMonochrome":false,
      "widgetUnits":true
    };
    return (key in settings) ? settings[key] : DEFAULTS[key];
  }

  weather.on("update", w => {
    if (setting("hide")) return;
    if (w) {
      if (!WIDGETS.weather.width) {
        WIDGETS.weather.width = 20;
        Bangle.drawWidgets();
      } else if (Bangle.isLCDOn()) {
        WIDGETS.weather.draw();
      } else {
        dirty = true;
      }
    }
    else {
      WIDGETS.weather.width = 0;
      Bangle.drawWidgets();
    }
  });

  Bangle.on("lcdPower", on => {
    if (on && dirty && !setting("hide")) {
      WIDGETS.weather.draw();
      dirty = false;
    }
  });

  function getText(type){
    const w = weather.get();
    let t = "N/A";
    if (!w) return t;
    if(type==0 && w.temp ){
      t = require("locale").temp(w.temp-273.15);  // applies conversion
      t = t.match(/[\d\-]*/)[0]+(setting("widgetUnits") ? "º" : "");
    }else if(type==1 && w.feels) {
      t = require("locale").temp(w.feels-273.15);  // applies conversion
      t = t.match(/[\d\-]*/)[0]+(setting("widgetUnits") ? "º" : "");
    }else if(type==2 && w.hum!==undefined) {
      t = w.hum+(setting("widgetUnits") ? "%" : "");
    }else if(type==3 && w.wind!==undefined) {
      let s=require("locale").speed(w.wind).match(/^(\D*\d*)(.*)$/);
      t = s[1]+(setting("widgetUnits") ? s[2] : "");
    }else if(type==4 && w.wrose!==undefined) {
      t = w.wrose.toUpperCase()
    }else if(type==5 && w.uv!==undefined) {
      t = w.uv;
    }else if(type==6 && w.rain!==undefined) {
      t = w.rain+(setting("widgetUnits") ? "%" : "");
    }
    return t;
  }
  function draw(){
    g.clearRect(this.x, this.y, this.x+this.width-1, this.y+23);
    const w = weather.get();
    if (setting("hide")||!w){
      WIDGETS.weather.width=0;
      return;
    }
    WIDGETS.weather.width=20;
    g.reset();
    if (w.code||w.txt) {
      if(setting("widgetMonochrome")){
        buffer.clear();
        weather.drawIcon(w,7.5,7.5,7.5,buffer,true);
        var img = buffer.asImage();
        img.transparent = 0;
        g.drawImage(img,this.x+10-7.5, this.y+8-7.5)
      }else{
        weather.drawIcon(w, this.x+10, this.y+8, 7.5);
      }
    }
    let t=getText(setting("widgetData"))
    g.reset();
    g.setFontAlign(0, 1); // center horizontally at bottom of widget
    g.setFont("6x8", 1);
    g.drawString(t, this.x+10, this.y+24);
  }
  
  WIDGETS.weather = {
    area: "tl",
    width: weather.get() && !setting("hide") ? 20 : 0,
    draw: draw,
    reload:() => {
      loadSettings();
      WIDGETS.weather.draw();
    },
  };
})();