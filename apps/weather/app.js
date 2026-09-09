const Layout = require('Layout');
const locale = require('locale');
const weather = require('weather');
let current = weather.get();

Bangle.loadWidgets();


var layout = new Layout({type:"v", bgCol: g.theme.bg, c: [
  {type:"",height:1},
  {type: "h", c: [
    {fillx: 1},
       {type: "custom", fillx: 1, height: (g.getHeight()/2)-25,width: (g.getWidth()/2)-20, valign: -1, txt: "unknown", id: "icon",bgCol:g.theme.bg,
          render: l => weather.drawIcon(l, l.x+l.w/2, l.y+l.h/2, l.w/3)},
    {type:"",width: 4},
    {type: "v", filly: 0, c: [
      {type: "h", pad: 0, c: [
        {fillx: 1},
        {type: "txt", font: "17%", id: "temp", label: "---"},
        {type: "txt", font: "11%", valign: -1, id: "tempUnit", label: "°C"},
        

      ]},
      {type: "h", pad: 0, c: [    
        {fillx: 1},
        {type: "img", src: atob("FBSBAAAAAB+AA/wAf+AH/gB/4Af+AH/gA/wAH4AAYAB/4B//g//8P//H//5//+f//j//wAAA"),scale:0.6, id: "feelsLabel"},
        {type: "txt", font: "14", valign: -1, id: "feels", label: "--°C"},
        {type:"",width:3},
        {type: "img", src: atob("ExKBAAgAA4AAeAwfAcPgeHwPh4PwQH8Bj+A4+A8eAfAAfgAP4AH8AD8AA+AAMAA="),scale:0.8, id: "rainLabel"},
        {type: "txt", font: "14", valign: -1, id: "rain", label: "--%"},
        {type:"",width:4},
      
      ]},
    ]},
    
  ]},
  {filly: 1},
    {type: "txt", font: "10%",wrap: true, pad:5, fillx: 1, id: "cond", label: /*LANG*/"Weather Condition"},
    {filly: 1},
  {type:"",height: 10},
  {type: "h", filly: 0, c: [
    {type:"",width: 7},
    {type: "txt", font: "14", halign:-1, id: "hiLo", label: "H: ---° L: ---°"},
    {fillx: 1},
    
    {type: "txt", font: "14", valign: -1, id: "hum", label: "Hum: --%"},
    {type:"",width:4},
  ]},
  {filly: 1},
  {type: "h", filly: 0, c: [
    {type:"",width: 7},
    {type: "custom", fillx: 1, height: 10, id: "uvDisplay",
      render: l => {
        if (!current || current.uv === undefined) return;
        let uv = Math.min(parseInt(current.uv), 11); // Cap at 11
        // UV color thresholds: [max_value, color] based on WHO standards
        const colors = [[2,"#0F0"], [5,"#FF0"], [7,"#F80"], [10,"#F00"], [11,"#F0F"]];
        const color = colors.find(c => uv <= c[0])[1];

        // Setup and measure label
        g.setFont("14").setFontAlign(-1, 0);
        const label = "UV: ";
        const labelW = g.stringWidth(label);

        const x = l.x;
        const y = l.y + (l.h/2)-2;

        // Draw label
        g.setColor(g.theme.fg).drawString(label, x, y+2);
        g.setColor("#808080").drawRect(x+labelW,y - 5,x + labelW + 5 * 11 +2, y + 5);
        // Draw UV blocks
        g.setColor(color);
        for (let i = 0; i < uv; i++) {
          g.fillRect(x + labelW + i * 5 +2, y - 3, x + labelW + i * 5 + 3+2, y + 3);
        }
      }
    },
    {fillx: 1},
    {type: "img", src: atob("FBSBAAOAAPwADGAAgjwIJ+AGQ//MP/hDAAAx//4f/8AAAP/8D//wAAGAABgAYYAGGAA/AAHg"),scale:0.6, id: "windLabel"},
        
    {type:"",width:4},
    {type: "txt", font: "14", valign: -1, id: "wind", label: "- kph SE"},
    {type:"",width:7},
  ]},
  
  {filly: 1},
  {type: "h", height:8+4, c: [
    {type:"",width: 4},
    {type: "txt", font: "6x8", id: "loc", label: "New York"},
    {fillx: 1},
    {type: "txt", font: "6x8", id: "updateTime", label: /*LANG*/"-- minutes ago"},
    {type:"",width: 4},
  ]},
]}, {lazy: true});

function formatDuration(millis) {
  let pluralize = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  if (millis < 60000) return /*LANG*/"Now";
  if (millis < 3600000) return pluralize(Math.floor(millis/60000), /*LANG*/"minute")+/*LANG*/" ago";
  if (millis < 86400000) return pluralize(Math.floor(millis/3600000), /*LANG*/"hour")+/*LANG*/" ago";
  return pluralize(Math.floor(millis/86400000), /*LANG*/"day")+/*LANG*/" ago";
}

function draw() {
  layout.icon.txt = current.txt;
  layout.icon.code = current.code;
  const temp = locale.temp(current.temp-273.15).match(/^(\D*\d*)(.*)$/);

  const feelsLikeTemp=locale.temp(current.feels-273.15).match(/^(\D*\d*)(.*)$/);
  layout.temp.label = temp[1];
  layout.tempUnit.label = temp[2];
  if (current.feels !== undefined){
    layout.feels.label = feelsLikeTemp[1]+"°";
  }
  
  if(current.hi!==undefined && current.lo!== undefined){
    const hi=locale.temp(current.hi-273.15).match(/^(\D*\d*)(.*)$/);
    const lo=locale.temp(current.lo-273.15).match(/^(\D*\d*)(.*)$/);
    const hiLoString = `H: ${hi[1]}° L: ${lo[1]}°`;
    layout.hiLo.label = hiLoString;
  }
  if(current.rain!==undefined){
    layout.rain.label = `${current.rain}%`;
  }
  if(current.hum!== undefined){
    layout.hum.label = `Hum: ${current.hum}%`;
  }
  const wind = locale.speed(current.wind).match(/^(\D*\d*)(.*)$/);
  layout.wind.label = wind[1]+` ${wind[2]} ${(current.wrose||'').toUpperCase()}`;
  layout.cond.label = current.txt.charAt(0).toUpperCase()+(current.txt||'').slice(1);
  layout.loc.label = current.loc;
  layout.updateTime.label = `${formatDuration(Date.now() - current.time)}`; // How to autotranslate this and similar?
  layout.loc.label = current.loc;
  layout.update();
  layout.render();
  //layout.debug()
}

function drawUpdateTime() {
  if (!current || !current.time) return;
  layout.updateTime.label = `${formatDuration(Date.now() - current.time)}`;
  layout.update();
}

function update() {
  current = weather.get();
  NRF.removeListener("connect", update);
  if (current) {
    draw();
  } else {
    layout.forgetLazyState();
    if (NRF.getSecurityStatus().connected) {
      E.showMessage(/*LANG*/"Weather Data Expired");
    } else {
      E.showMessage(/*LANG*/"Weather\nunknown\n\nPhone\nnot connected");
      NRF.on("connect", update);
    }
  }
}

let interval = setInterval(drawUpdateTime, 60000);
Bangle.on('lcdPower', (on) => {
  if (interval) {
    clearInterval(interval);
    interval = undefined;
  }
  if (on) {
    drawUpdateTime();
    interval = setInterval(drawUpdateTime, 60000);
  }
});

weather.on("update", update);

update();

// We want this app to behave like a clock:
// i.e. show launcher when middle button pressed
Bangle.setUI("clock");
// But the app is not actually a clock
// This matters for widgets that hide themselves for clocks, like widclk or widclose
delete Bangle.CLOCK;

Bangle.drawWidgets();
