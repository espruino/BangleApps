Bangle.setLCDMode("120x120");
g.clear();
g.flip();

const Storage = require("Storage");

function getApps(){
  return Storage.list(/\.info$/).map(app=>{var a=Storage.readJSON(app,1);return a&&{name:a.name,type:a.type,icon:a.icon,sortorder:a.sortorder,src:a.src,version:a.version}})
    .filter(app=>app && (app.type=="app" || app.type=="clock" || !app.type))
    .sort((a,b)=>{
    var n=(0|a.sortorder)-(0|b.sortorder);
    if (n) return n; // do sortorder first
    if (a.name<b.name) return -1;
    if (a.name>b.name) return 1;
    return 0;
  });
}

const HEIGHT = g.getHeight();
const WIDTH = g.getWidth();
const HALF = WIDTH/2;
const ANIMATION_FRAME = 4;
const ANIMATION_STEP = HALF / ANIMATION_FRAME;

function getPosition(index){
  return (index*HALF);
}

let current_app = 0;
let target = 0;
let slideOffset = 0;

const back = {
  name: 'BACK',
  back: true
};

let icons = {};

const apps = [back].concat(getApps());
apps.push(back);

function noIcon(x, y, size){
  const half = size/2;
  g.setColor(1,1,1);
  g.setFontAlign(-0,0);
  const fontSize = Math.floor(size / 30 * 2);
  g.setFont('6x8', fontSize);
  if(fontSize) g.drawString('-?-', x+1.5, y);
  g.drawRect(x-half, y-half, x+half, y+half);
}

function drawIcons(offset){
  apps.forEach((app, i) => {
    const x = getPosition(i) + HALF - offset;
    const y = HALF - (HALF*0.3);//-(HALF*0.7);
    let diff = (x - HALF);
    if(diff < 0) diff *=-1;

    const dontRender = x+(HALF/2)<0 || x-(HALF/2)>120;
    if(dontRender) {
      delete icons[app.name];
      return;
    }
    let size = 30;
    if((diff*0.5) < size) size -= (diff*0.5);
    else size = 0;

    const scale = size / 30;
    if(size){
      let c = size / 30 * 2;
      c = c -1;
      if(c < 0) c = 0;

      if(app.back){
        g.setFont('6x8', 1);
        g.setFontAlign(0, -1);
        g.setColor(c,c,c);
        g.drawString('Back', HALF, HALF);
        return;
      }
      // icon

      const icon = app.icon ?
                    icons[app.name] ? icons[app.name] :  Storage.read(app.icon)
                  : null;
      if(icon){
        icons[app.name] = icon;
        try {
          g.drawImage(icon, x-(scale*24), y-(scale*24), { scale: scale });
        } catch(e){
          noIcon(x, y, size);
        }
      }else{
        noIcon(x, y, size);
      }
      //text
      g.setFont('6x8', 1);
      g.setFontAlign(0, -1);
      g.setColor(c,c,c);
      g.drawString(app.name, HALF, HEIGHT - (HALF*0.7));

      const type = app.type ? app.type : 'App';
      const version = app.version ? app.version : '0.00';
      const info = type+' v'+version;
      g.setFontAlign(0,1);
      g.setFont('4x6', 0.25);
      g.setColor(c,c,c);
      g.drawString(info, HALF, 110, { scale: scale });
    }
  });
}

function draw(ignoreLoop){
  g.setColor(0,0,0);
  g.fillRect(0,0,WIDTH,HEIGHT);
  drawIcons(slideOffset);
  g.flip();
  if(slideOffset == target) return;
  if(slideOffset < target) slideOffset+= ANIMATION_STEP;
  else if(slideOffset > target) slideOffset -= ANIMATION_STEP;
  if(!ignoreLoop) draw();
}

function animateTo(index){
  target = getPosition(index);
  draw();
}
function goTo(index){
  current_app = index;
  target = getPosition(index);
  slideOffset = target;
  draw(true);
}

goTo(1);

function prev(){
  if(current_app == 0) goTo(apps.length-1);
  current_app -= 1;
  if(current_app < 0) current_app = 0;
  animateTo(current_app);
}

function next(){
  if(current_app == apps.length-1) goTo(0);
  current_app += 1;
  if(current_app > apps.length-1) current_app = apps.length-1;
  animateTo(current_app);
}

function run() {
  const app = apps[current_app];
  if(app.back) return load();
  if (Storage.read(app.src)===undefined) {
    E.showMessage("App Source\nNot found");
    setTimeout(draw, 2000);
  } else {
    Bangle.setLCDMode();
    g.clear();
    g.flip();
    E.showMessage("Loading...");
    load(app.src);
  }
}


setWatch(prev, BTN1, { repeat: true });
setWatch(next, BTN3, { repeat: true });
setWatch(run, BTN2, {repeat:true,edge:"falling"});

// Screen event
Bangle.on('touch', function(button){
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
  if(dir == 1) prev();
  else next();
});

// close launcher when lcd is off
Bangle.on('lcdPower', on => {
  if(!on) return load();
});
