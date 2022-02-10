const Storage = require("Storage");
const filename = 'toucher.json';
let settings = Storage.readJSON(filename,1) || {
  hightres: true,
  animation : true,
  frame : 3,
  debug: false
};

// this means that setFont('6x8',1) is actually setFont('6x8',3)
if (process.env.HWVERSION == 1) {
  if(!settings.highres) Bangle.setLCDMode("80x80");
  else Bangle.setLCDMode();
}

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
  target: g.getWidth(),
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
  g.setColor(g.theme.fg);
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
  const visibleApps = APPS.filter(app => app.x >= STATE.offset-HALF && app.x <= STATE.offset+WIDTH-HALF );

  let cycle = 0;
  let lastCycle = visibleApps.length;
  
  visibleApps.forEach(app => {
    cycle++;
    const x = app.x + HALF - STATE.offset;
    const y = HALF;

    let dist = HALF - x;
    if(dist < 0) dist *= -1;
    const scale = 1 - (dist / HALF);

    if(!scale) return;

    if(app.special){
      const fontSize = (process.env.HWVERSION == 2) ? 4 : (settings.highres ? 6 : 2);
      g.setFont('6x8', fontSize);
      g.setColor(g.theme.fg);
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
        let rescale;
        let imageScale;

        if (process.env.HWVERSION == 1) {
          // on a bangle 1 !highres means 80x80
          rescale = settings.highres ? scale*ORIGINAL_ICON_SIZE : (scale*(ORIGINAL_ICON_SIZE/2));
          imageScale = settings.highres ? scale*2 : scale;
        } else {
          // !highres mode is meaningless on a bangle 2 at present
          rescale = 1.25*scale*ORIGINAL_ICON_SIZE;
          imageScale = 2.5*scale;
        }

        g.drawImage(icon, x-rescale, y-rescale, { scale: imageScale });
      } catch(e) {
        noIcon(x, y, scale);
      }
    } else {
      noIcon(x, y, scale);
    }

    //draw text
    g.setColor(g.theme.fg);

    if (cycle == 2 && scale > 0.1) {
      let fontSize = (process.env.HWVERSION == 2) ? 2 : 1;
      if (process.env.HWVERSION == 1) {
        fontSize = (settings.highres) ? 3 : 1;
      }
      
      if (app.name.length <= 12) {
        g.setFont("6x8", fontSize);
        g.setFontAlign(0,1);
        g.drawString(app.name, HALF, HEIGHT);
      } else {
        // some app names are too long for one line
        var name = app.name;
        var first = name.substring(0, name.indexOf(" "));
        var last = name.substring(name.indexOf(" ") + 1, name.length);

        // all this to handle long names like
        // Simple 7 Segment Clock
        if (last.length > 12 && process.env.HWVERSION == 1) {
          g.setFont((settings.highres ? "6x8" : "4x6"),(settings.highres ? 2 : 1) ); 
        } else {
          g.setFont("6x8", fontSize);
        }
        
        g.setFontAlign(0,-1);
        g.drawString(first, HALF, 0);

        if (last.length > 12 && process.env.HWVERSION == 1) {
          g.setFont((settings.highres ? "6x8" : "4x6"),(settings.highres ? 2 : 1) );
        } else {
          g.setFont("6x8", fontSize);
        }

        g.setFontAlign(0,1);
        g.drawString(last, HALF, HEIGHT);
      }
    }
    
    /*
    if(settings.highres){
      const type = app.type ? app.type : 'App';
      const version = app.version ? app.version : '0.00';
      const info = type+' v'+version;
      g.setFontAlign(0,1);
      g.setFont('6x8', 1.5);
      g.setColor(scale,scale,scale);
      g.drawString(info, HALF, HEIGHT/8*7, { scale: scale });
    }
    */

  });

  const duration = Math.floor(Date.now()-start);
  if(settings.debug){
    g.setFontAlign(0,1);
    g.setColor(g.theme.fgH);   
    const fontSize = (process.env.HWVERSION == 2) ? 2 : (settings.highres ? 2 : 1);
    g.setFont(((process.env.HWVERSION == 2) ? '6x8' : (settings.highres ? '6x8' :'4x6')), fontSize);
    // steal the bottom line, and print the duration
    g.clearRect(0, HEIGHT - (process.env.HWVERSION == 1 && !settings.highres ? 8 : 24), WIDTH, HEIGHT);
    g.drawString('Render: '+duration+' ms', HALF, HEIGHT);
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
    if (process.env.HWVERSION == 1) Bangle.setLCDMode();
    g.clear();
    g.flip();
    E.showMessage("Loading...");
    load(app.src);
  }

}

if (process.env.HWVERSION == 1) {
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
}

if (process.env.HWVERSION == 2) {
  // tap at top 1/3 of screen to launch app
  Bangle.on('touch', function(button, xy) {
    if (xy.y < HEIGHT / 3)
      run();
  });
}

Bangle.on('swipe', dir => {
  if(STATE.settings_open) return;
  if(dir == 1) prev();
  else next();
});

// close launcher when screen is locked
Bangle.on('lock', on => {
  if(on) return load();
});

if (process.env.HWVERSION == 1) {
  setWatch(prev, BTN1, { repeat: true });
  setWatch(next, BTN3, { repeat: true });
  setWatch(run, BTN2, { repeat:true });
} else {
  setWatch(run, BTN1, { repeat:true });
}

jumpTo(1);
