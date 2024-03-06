var d = require("dane_arwes");
var Arwes = d.default();

const Storage = require("Storage");
const filename = 'dane_tcr.json';
let settings = Storage.readJSON(filename,1) || {
  hightres: true,
  animation : true,
  frame : 3,
  debug: false
};

if(!settings.highres) Bangle.setLCDMode("80x80");
else Bangle.setLCDMode();

g.clear();
g.flip();

let icons = {};

const HEIGHT = g.getHeight();
const WIDTH = g.getWidth();
const HALF = WIDTH/2;
const ORIGINAL_ICON_SIZE = 48;

const STATE = {
  settings_open: false,
  index: 0,
  target: 240,
  offset: 0
};

function getPosition(index){
  return (index*HALF);
}

function getApps(){
  const exit_app = {
    name: 'Exit',
    special: true
  };
  const raw_apps = Storage.list(/\.info$/).filter(app => app.endsWith('.info')).map(app => Storage.readJSON(app,1) || { name: "DEAD: "+app.substr(1) })
      .filter(app=>app.type=="app" || app.type=="clock" || !app.type)
      .sort((a,b)=>{
        var n=(0|a.sortorder)-(0|b.sortorder);
        if (n) return n; // do sortorder first
        if (a.name<b.name) return -1;
        if (a.name>b.name) return 1;
        return 0;
      }).map(raw => ({
        name: raw.name,
        src: raw.src,
        icon: raw.icon,
        version: raw.version
      }));

  const apps = [Object.assign({}, exit_app)].concat(raw_apps);
  apps.push(exit_app);
  return apps.map((app, i) => {
    app.x = getPosition(i);
    return app;
  });
}

const APPS = getApps();

function noIcon(x, y, scale){
  if(scale < 0.2) return;
  g.setColor(Arwes.C.color.alert.base);
  g.setFontAlign(0,0);
  g.setFont('6x8',settings.highres ? 6:3);
  g.drawString('x_x', x+1.5, y);
  const h = (ORIGINAL_ICON_SIZE/3);
  g.drawRect(x-h, y-h, x+h, y+h);
}

function render(){
  const start = Date.now();


  const ANIMATION_FRAME = settings.frame;
  const ANIMATION_STEP = Math.floor(HALF / ANIMATION_FRAME);
  const THRESHOLD = ANIMATION_STEP - 1;

  g.clear();
  // drawFrame(3, 3, width - 3, height - 3);
  // drawFrame(3, 10, width - 3, height - 3);


  const visibleApps = APPS.filter(app => app.x >= STATE.offset-HALF && app.x <= STATE.offset+WIDTH-HALF );

  visibleApps.forEach(app => {



    const x = app.x+HALF-STATE.offset;
    const y = HALF - (HALF*0.3);

    let dist = HALF - x;
    if(dist < 0) dist *= -1;

    const scale = 1 - (dist / HALF);

    if(!scale) return;

    if(app.special){
      const font = settings.highres ? '6x8' : '4x6';
      const fontSize = settings.highres ? 2 : 1;
      const h = (settings.highres ?8:6)*fontSize
      const w = ((settings.highres ?6:2)*fontSize)*app.name.length
      if(settings.hightres)
        Arwes.drawFrame(HALF-w, HALF-h, HALF+w, HALF+h);
      else
        Arwes.drawFrame(HALF-w-2, HALF-h, HALF+w, HALF+h);
      g.setFont(font, fontSize);
      g.setColor(Arwes.C.color.alert.base);
      g.setFontAlign(0,0);
      g.drawString(app.name, HALF, HALF);
      return;
    }

    //draw icon
    const icon = app.icon ?
        icons[app.name] ? icons[app.name] :  Storage.read(app.icon)
        : null;

    if(icon){
      icons[app.name] = icon;
      try {
        const rescale = settings.highres ? scale*ORIGINAL_ICON_SIZE : (scale*(ORIGINAL_ICON_SIZE/2));
        const imageScale = settings.highres ? scale*2 : scale;

        if(settings.hightres)
          Arwes.drawFrame(x-rescale-5, y-rescale-5, x+rescale+5, y+rescale+5);
        else
          Arwes.drawFrame(x-rescale-2-2, y-rescale-1, x+rescale+2, y+rescale+1);



        g.drawImage(icon, x-rescale, y-rescale, { scale: imageScale });

      } catch(e){
        noIcon(x, y, scale);
      }
    }else{
      noIcon(x, y, scale);
    }

    //draw text

    if(scale > 0.1){
      const font = settings.highres ? '6x8': '4x6';
      const fontSize = settings.highres ? 2 : 1;
      const h = (settings.highres ?8:6)*fontSize
      const w = ((settings.highres ?6:2)*fontSize)*10//app.name.length
      if(settings.highres)
        Arwes.drawFrame(36, HEIGHT/4*3-(fontSize*8), 204, HEIGHT/4*3+(fontSize*8));
      else
        Arwes.drawFrameBottomCorners(HALF-w-2, HEIGHT/4*3-h, HALF+w, HEIGHT/4*3+h);
      g.setColor(Arwes.C.color.primary.base);
      g.setFont(font, fontSize);
      g.setFontAlign(0,0);
      g.drawString(app.name, HALF, HEIGHT/4*3);
    }

    if(settings.highres){
      const type = app.type ? app.type : 'App';
      const version = app.version ? app.version : '0.00';
      const info = type+' v'+version;
      const textWidth = (info.length*(6*1.5))
      Arwes.drawFrameBottomCorners(HALF-textWidth/2, 210-(1.5*8)-2, HALF+textWidth/2, 210+(1.5*8)-2);
      g.setFontAlign(0,1);
      g.setFont('6x8', 1.5);
      g.setColor(Arwes.C.color.secondary.base);
      g.drawString(info, HALF, 210, { scale: scale });
    }

  });

  const duration = Math.floor(Date.now()-start);
  if(settings.debug){
    g.setFontAlign(0,1);
    g.setColor(0, 1, 0);
    const fontSize = settings.highres ? 2 : 1;
    g.setFont('4x6',fontSize);
    g.drawString('Render: '+duration+'ms', HALF, HEIGHT);
  }
  g.flip();
  if(STATE.offset == STATE.target) return;

  if(STATE.offset < STATE.target) STATE.offset += ANIMATION_STEP;
  else if(STATE.offset > STATE.target) STATE.offset -= ANIMATION_STEP;

  if(STATE.offset >= STATE.target-THRESHOLD && STATE.offset < STATE.target) STATE.offset = STATE.target;
  if(STATE.offset <= STATE.target+THRESHOLD && STATE.offset > STATE.target) STATE.offset = STATE.target;
  setTimeout(render, 0);
}

function animateTo(index){
  STATE.index = index;
  STATE.target = getPosition(index);
  render();
}

function jumpTo(index){
  STATE.index = index;
  STATE.target = getPosition(index);
  STATE.offset = STATE.target;
  render();
}

function prev(){
  if(STATE.settings_open) return;
  if(STATE.index == 0) jumpTo(APPS.length-1);
  setTimeout(() => {
    if(!settings.animation) jumpTo(STATE.index-1);
    else animateTo(STATE.index-1);
  },1);
}

function next(){
  if(STATE.settings_open) return;
  if(STATE.index == APPS.length-1) jumpTo(0);
  setTimeout(() => {
    if(!settings.animation) jumpTo(STATE.index+1);
    else animateTo(STATE.index+1);
  },1);
}

function run(){

  const app = APPS[STATE.index];
  if(app.name == 'Exit') return load();

  if (Storage.read(app.src)===undefined) {
    E.showMessage("App Source\nNot found");
    setTimeout(render, 2000);
  } else {
    Bangle.setLCDMode();
    g.clear();
    g.flip();
    E.showMessage(/*LANG*/"Loading...");
    load(app.src);
  }

}

// Screen event
Bangle.on('touch', function(button){
  if(STATE.settings_open) return;
  switch(button){
    case 1:
      prev();
      break;
    case 2:
      next();
      break;
    case 3:
      run();
      break;
  }
});

Bangle.on('swipe', dir => {
  if(STATE.settings_open) return;
  if(dir == 1) prev();
  else next();
});

// close launcher when lcd is off
Bangle.on('lcdPower', on => {
  if(!on) return load();
});


setWatch(prev, BTN1, { repeat: true });
setWatch(next, BTN3, { repeat: true });
setWatch(run, BTN2, { repeat:true });

jumpTo(1);