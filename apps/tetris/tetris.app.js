const block = Graphics.createImage(`
########
# # # ##
## # ###
# # ####
## #####
# ######
########
########
`);
const tcols = [ {r:0, g:0, b:1}, {r:0, g:1, b:0}, {r:0, g:1, b:1}, {r:1, g:0, b:0}, {r:1, g:0, b:1}, {r:1, g:1, b:0}, {r:1, g:0.5, b:0.5} ];
const tiles = [
  [[0, 0, 0, 0],
   [0, 0, 0, 0],
   [1, 1, 1, 1],
   [0, 0, 0, 0]],
  [[0, 0, 0],
   [0, 1, 0],
   [1, 1, 1]],
  [[0, 0, 0],
   [1, 0, 0],
   [1, 1, 1]],
  [[0, 0, 0],
   [0, 0, 1],
   [1, 1, 1]],
  [[0, 0, 0],
   [1, 1, 0],
   [0, 1, 1]],
  [[0, 0, 0],
   [0, 1, 1],
   [1, 1, 0]],
  [[1, 1],
   [1, 1]]
];

const ox = 176/2 - 5*8;
const oy = 8;

var pf = Array(23).fill().map(()=>Array(12).fill(0)); // field is really 10x20, but adding a border for collision checks
pf[20].fill(1);
pf[21].fill(1);
pf[22].fill(1);
pf.forEach((x,i) => { pf[i][0] = 1; pf[i][11] = 1; });

function rotateTile(t, r) {
  var nt = JSON.parse(JSON.stringify(t));
  if (t.length==2) return nt;
  var s = t.length;
  for (m=0; m<r; ++m) {
    tl = JSON.parse(JSON.stringify(nt));
    for (i=0; i<s; ++i)
      for (j=0; j<s; ++j)
        nt[i][j] = tl[s-1-j][i];
  }
  return nt;
}

function drawBoundingBox() {
  g.setBgColor(0, 0, 0).clear().setColor(1, 1, 1);
  g.theme.bg = 0;
  for (i=0; i<4; ++i) g.drawRect(ox-i-1, oy-i-1, ox+10*8+i, oy+20*8+i);
}

function drawTile (tile, n, x, y, qClear) {
  if (qClear) g.setColor(0);
  else g.setColor(tcols[n].r, tcols[n].g, tcols[n].b);
  for (i=0; i<tile.length; ++i)
    for (j=0; j<tile.length; ++j)
      if (tile[j][i]>0)
        if (qClear) g.fillRect(x+8*i, y+8*j, x+8*(i+1)-1, y+8*(j+1)-1);
        else g.drawImage(block, x+8*i, y+8*j);
}

function showNext(n, r) {
  var nt = rotateTile(tiles[n], r);
  g.setColor(0).fillRect(176-33, 40, 176-33+33, 82);
  drawTile(nt, ntn, 176-33, 40);
}

var time = Date.now();
var px=4, py=0;
var ctn = Math.floor(Math.random()*7); // current tile number
var ntn = Math.floor(Math.random()*7); // next tile number
var ntr = Math.floor(Math.random()*4); // next tile rotation
var ct = rotateTile(tiles[ctn], Math.floor(Math.random()*4)); // current tile (rotated)
var dropInterval = 450;
var nlines = 0;

function redrawPF(ly) {
  for (y=0; y<=ly; ++y)
    for (x=1; x<11; ++x) {
      c = pf[y][x];
      if (c>0) g.setColor(tcols[c-1].r, tcols[c-1].g, tcols[c-1].b).drawImage(block, ox+(x-1)*8, oy+y*8);
      else g.setColor(0, 0, 0).fillRect(ox+(x-1)*8, oy+y*8, ox+x*8-1, oy+(y+1)*8-1);
    }
}

function insertAndCheck() {
  for (y=0; y<ct.length; ++y) 
    for (x=0; x<ct[y].length; ++x)
      if (ct[y][x]>0) pf[py+y][px+x+1] = ctn+1;
  // check for full lines
  for (y=19; y>0; y--) {
    var qFull = true;
    for (x=1; x<11; ++x) qFull &= pf[y][x]>0;
    if (qFull) {
      nlines++;
      dropInterval -= 5;
      Bangle.buzz(30);
      for (ny=y; ny>0; ny--) pf[ny] = JSON.parse(JSON.stringify(pf[ny-1]));
      redrawPF(y);
      g.setColor(0).fillRect(5, 30, 41, 80).setColor(1, 1, 1).drawString(nlines.toString(), 22, 50);
    }
  }
  // spawn new tile
  px = 4; py = 0;
  ctn = ntn;
  ntn = Math.floor(Math.random()*7);
  ct = rotateTile(tiles[ctn], ntr);
  ntr = Math.floor(Math.random()*4);
  showNext(ntn, ntr);
}

function moveOk(t, dx, dy) {
  var ok = true;
  for (y=0; y<t.length; ++y) 
    for (x=0; x<t[y].length; ++x)
      if (t[y][x]*pf[py+dy+y][px+dx+x+1] > 0) ok = false;
  return ok;
}

function gameStep() {
  if (Date.now()-time > dropInterval) { // drop one step
    time = Date.now();
    if (moveOk(ct, 0, 1)) {
      drawTile(ct, ctn, ox+px*8, oy+py*8, true);
      py++;
    }
    else { // reached the bottom
      insertAndCheck(ct, ctn, px, py);
    }
    drawTile(ct, ctn, ox+px*8, oy+py*8, false);
  }
}

Bangle.setUI();
Bangle.on("touch", (e) => {
  t = rotateTile(ct, 3);
  if (moveOk(t, 0, 0)) {
    drawTile(ct, ctn, ox+px*8, oy+py*8, true);
    ct = t;
    drawTile(ct, ctn, ox+px*8, oy+py*8, false);
  }
});

Bangle.on("swipe", (x,y) => {
  if (y<0) y = 0;
  if (moveOk(ct, x, y)) {
    drawTile(ct, ctn, ox+px*8, oy+py*8, true);
    px += x;
    py += y;
    drawTile(ct, ctn, ox+px*8, oy+py*8, false);
  }
});

drawBoundingBox();
g.setColor(1, 1, 1).setFontAlign(0, 1, 0).setFont("6x15", 1).drawString("Lines", 22, 30).drawString("Next", 176-22, 30);
showNext(ntn, ntr);
g.setColor(0).fillRect(5, 30, 41, 80).setColor(1, 1, 1).drawString(nlines.toString(), 22, 50);
var gi = setInterval(gameStep, 20);
