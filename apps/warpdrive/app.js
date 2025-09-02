const gfx = E.compiledC(`
// void init(int, int, int)
// void clear(int)
// void render(int, int)
// void setCamera(int, int, int)
// void stars()

unsigned char* fb;
int stride;
unsigned char* sint;

const int near = 5 << 8;
int f = 0;

typedef struct {
  int x, y, z;
} Point;

Point camera;
Point rotation;
Point scale;
Point position;

const unsigned char ship[] = {
0,38,25,10,3,8,6,10,7,3,6,13,3,11,5,13,1,12,3,15,3,5,8,15,1,3,7,13,12,11,3,15,5,6,8,15,6,1,7,10,5,0,6,10,0,1,6,12,5,11,4,12,12,1,2,12,2,11,12,12,10,5,4,13,5,10,0,12,2,1,9,13,9,1,0,12,4,11,2,10,19,22,21,12,4,2,10,12,10,2,9,10,13,16,15,13,10,9,0,15,21,20,19,15,15,14,13,15,19,20,22,15,13,14,16,15,21,23,20,15,15,17,14,15,22,20,23,10,22,24,21,15,16,14,17,10,16,18,15,15,24,23,21,15,18,17,15,15,22,23,24,15,16,17,18,0,0,62,236,243,244,247,0,234,0,229,194,11,0,234,21,243,246,0,234,33,193,250,20,63,249,19,249,4,3,9,4,3,7,247,222,250,247,222,240,0,22,238,13,22,226,1,20,229,7,62,225,11,20,208,27,62,19,0,20,22,12,20,33,0,18,30,5,60,34,10,18,52,26,60
};

unsigned int _rngState;
unsigned int rng() {
    _rngState ^= _rngState << 17;
    _rngState ^= _rngState >> 13;
    _rngState ^= _rngState << 5;
    return _rngState;
}

void init(unsigned char* _fb, int _stride, unsigned char* _sint) {
  fb = _fb;
  stride = _stride;
  sint = _sint;
}

int sin(int angle) {
  int a = (angle >> 7) & 0xFF;
  if (angle & (1 << 15))
    a = 0xFF - a;
  int v = sint[a];
  if (angle & (1 << 16))
    v = -v;
  return v;
}

int cos(int angle) {
  return sin(angle + 0x8000);
}

void setCamera(int x, int y, int z) {
  camera.x = x;
  camera.y = y;
  camera.z = z;
}

unsigned int solid(unsigned int c) {
  c &= 7;
  c |= c << 3;
  c |= c << 6;
  c |= c << 12;
  c |= c << 24;
  return c;
}

unsigned int alternate(unsigned int a, unsigned int b) {
  unsigned int c = (a & 7) | ((b & 7) << 3);
  c |= c << 6;
  c |= c << 12;
  c |= c << 24;
  return c;
}

void drawHLine(int x, unsigned int y, int l, unsigned int c) {
  if (x < 0) {
    l += x;
    x = 0;
  }
  if (x + l >= 176) {
    l = 176 - x;
  }
  if (l <= 0 || y >= 176)
    return;

  if (y & 1)
    c = alternate(c >> 3, c);

  int bitstart = x * 3;
  int bitend = (x + l) * 3;
  int wstart = bitstart >> 5;
  int wend = bitend >> 5;
  int padstart = bitstart & 31;
  int padend = bitend & 31;
  int maskstart = -1 << padstart;
  int maskend = unsigned(-1) >> (32 - padend);
  if (wstart == wend) {
    maskstart &= maskend;
    maskend = 0;
  }

  int* row = (int*) &fb[y * stride];
  if (maskstart) {
    row[wstart] = (row[wstart] & ~maskstart) | ((c << padstart) & maskstart);
    while (bitstart >> 5 == wstart)
        bitstart += 3;
  }
  if (maskend)
    row[wend] = (row[wend] & ~maskend) |
      (((c >> (30 - padend)) | (c >> (36 - padend))) & maskend);
  bitend -= padend;
  for (int x = bitstart; x < bitend; x += 10 * 3) {
    unsigned int R = x & 31;
    row[x >> 5] = (c << R) | (c >> (36 - R)) | (c >> (30 - R)) | (c << (R - 6));
  }
}

void fillRect(int x, unsigned int y, int w, int h, unsigned int c) {
  if (x < 0) {
    w += x;
    x = 0;
  }
  if (x + w >= 176) {
    w = 176 - x;
  }
  if (w <= 0 || y >= 176)
    return;

  if (y < 0) {
    h += y;
    y = 0;
  }
  if (y + h >= 176) {
    h = 176 - y;
  }
  if (h <= 0 || y >= 176)
    return;

  int bitstart = x * 3;
  int bitend = (x + w) * 3;
  int wstart = bitstart >> 5;
  int wend = bitend >> 5;
  int padstart = bitstart & 31;
  int padend = bitend & 31;
  int maskstart = -1 << padstart;
  int maskend = unsigned(-1) >> (32 - padend);
  if (wstart == wend) {
    maskstart &= maskend;
    maskend = 0;
  }

  int* row = (int*) &fb[y * stride];
  if (maskstart) {
    for (int i = 0; i < h; ++i)
      row[wstart + (i*stride>>2)] = (row[wstart + (i*stride>>2)] & ~maskstart) | ((c << padstart) & maskstart);
    while (bitstart >> 5 == wstart)
        bitstart += 3;
  }
  if (maskend) {
    for (int i = 0; i < h; ++i)
      row[wend + (i*stride>>2)] = (row[wend + (i*stride>>2)] & ~maskend) |
        (((c >> (30 - padend)) | (c >> (36 - padend))) & maskend);
  }
  bitend -= padend;
  for (int x = bitstart; x < bitend; x += 10 * 3) {
    unsigned int R = x & 31;
    R = (c << R) | (c >> (36 - R)) | (c >> (30 - R)) | (c << (R - 6));
    for (int i = 0; i < h; ++i)
      row[(x >> 5) + (i*stride>>2)] = R;
  }
}

void clear(int c) {
  c &= 7;
  if (!c || c==7) {
    c = solid(c);
    unsigned short* cursor = (unsigned short*) fb;
    for (int y = 0; y < 176; ++y) {
      for (int x = 0; x < 66/2; ++x)
        *cursor++ = c;
      cursor++;
    }
  } else {
    fillRect(0, 0, 176, 176, solid(c));
  }
}

void fillTriangle( int x0, int y0,
                   int x1, int y1,
                   int x2, int y2,
                   unsigned int col) {
  int a, b, y, last, tmp;

  a = 176;
  b = 176;
  if( x0 < 0 && x1 < 0 && x2 < 0 ) return;
  if( x0 >= a && x1 > a && x2 > a ) return;
  if( y0 < 0 && y1 < 0 && y2 < 0 ) return;
  if( y0 >= b && y1 > b && y2 > b ) return;

  // Sort coordinates by Y order (y2 >= y1 >= y0)
  if (y0 > y1) {
      tmp = y0; y0 = y1; y1 = tmp;
      tmp = x0; x0 = x1; x1 = tmp;
  }
  if (y1 > y2) {
      tmp = y2; y2 = y1; y1 = tmp;
      tmp = x2; x2 = x1; x1 = tmp;
  }
  if (y0 > y1) {
      tmp = y0; y0 = y1; y1 = tmp;
      tmp = x0; x0 = x1; x1 = tmp;
  }

  if (y0 == y2) { // Handle awkward all-on-same-line case as its own thing
      a = b = x0;
      if (x1 < a) a = x1;
      else if (x1 > b) b = x1;
      if (x2 < a) a = x2;
      else if (x2 > b) b = x2;
      drawHLine(a, y0, b - a + 1, col);
      return;
  }

  int dx01 = x1 - x0,
      dx02 = x2 - x0,
      dy02 = (1<<16) / (y2 - y0),
      dx12 = x2 - x1,
      sa = 0,
      sb = 0;

  // For upper part of triangle, find scanline crossings for segments
  // 0-1 and 0-2.  If y1=y2 (flat-bottomed triangle), the scanline y1
  // is included here (and second loop will be skipped, avoiding a /0
  // error there), otherwise scanline y1 is skipped here and handled
  // in the second loop...which also avoids a /0 error here if y0=y1
  // (flat-topped triangle).
  if (y1 == y2) last = y1; // Include y1 scanline
  else last = y1 - 1; // Skip it

  y = y0;

  if( y0 != y1 ){
    int dy01 = (1<<16) / (y1 - y0);
    for (y = y0; y <= last; y++) {
      a = x0 + ((sa * dy01) >> 16);
      b = x0 + ((sb * dy02) >> 16);
      sa += dx01;
      sb += dx02;
      /* longhand:
         a = x0 + (x1 - x0) * (y - y0) / (y1 - y0);
         b = x0 + (x2 - x0) * (y - y0) / (y2 - y0);
      */
      if (a > b){
          tmp = a;
          a = b;
          b = tmp;
      }
      drawHLine(a, y, b - a + 1, col);
    }
  }

  // For lower part of triangle, find scanline crossings for segments
  // 0-2 and 1-2.  This loop is skipped if y1=y2.
  if( y1 != y2 ){
    int dy12 = (1<<16) / (y2 - y1);
    sa = dx12 * (y - y1);
    sb = dx02 * (y - y0);
    for (; y <= y2; y++) {
      a = x1 + ((sa * dy12) >> 16);
      b = x0 + ((sb * dy02) >> 16);
      sa += dx12;
      sb += dx02;
      if (a > b){
        tmp = a;
        a = b;
        b = tmp;
      }
      drawHLine(a, y, b - a + 1, col);
    }
  }
}

void v_project(Point* p){
  int fovz = ((90 << 16) / ((90 << 8) + p->z)); // 16:8 / 16:8 -> 16:8
  p->x = (p->x * fovz >> 8) + (176/2 << 8); // 16:8 * 16:8 = 16:16 -> 16:8
  p->y = (176/2 << 8) - (p->y * fovz >> 8);
  p->z = fovz;
}

void stars() {
  f += 7;
  _rngState = 1013904223;

  for (int i = 0; i < 100; ++i) {
    int a = rng() + ((i & 1 ? f : -f) << 7);
    int ca = cos(a);
    int sa = sin(a);
    int r = ((rng() & 0xFF) + 0xFF);
    position.x = r*ca;
    position.y = r*sa;
    position.z = 0xFF - ((rng() + f) & 0xFF);
    position.z <<= 12;
    position.z -= 100 << 8;
    int light = position.z < (800 << 8);
    int dark =  position.z > ((800 + 500) << 8);
    scale = position;

    v_project(&position);
    int s = 32 * position.z >> 8;
    if (!s)
      continue;

    scale.z += 30 << 10;
    v_project(&scale);
    int rx = s*sa >> 8;
    int ry = s*ca >> 8;

    position.x >>= 8;
    position.y >>= 8;
    scale.x >>= 8;
    scale.y >>= 8;

    if (position.x < - 100 || position.x > 276) continue;
    if (position.y < - 100 || position.y > 276) continue;
    int color = 4 | (i & 1);
    fillTriangle(
      scale.x, scale.y,
      position.x - rx, position.y - ry,
      position.x + rx, position.y + ry,
      light ? alternate(color, 7) :
      dark ? alternate(color, 0) :
                 solid(color)
    );
  }
}

void transform(Point* p) {
  int x = p->x;
  int y = p->y;
  int z = p->z;
  int s, c;
  if (rotation.z) {
    s = sin(rotation.z);
    c = cos(rotation.z);
    p->x = (x*c>>8) - (y*s>>8);
    p->y = (x*s>>8) + (y*c>>8);
    x = p->x;
    y = p->y;
  }

  if (rotation.y) {
    s = sin(rotation.y);
    c = cos(rotation.y);
    p->x = (x*c>>8) - (z*s>>8);
    p->z = (x*s>>8) + (z*c>>8);
  }

// Scale
  p->x = p->x * scale.x >> 8;
  p->y = p->y * scale.y >> 8;
  p->z = p->z * scale.z >> 8;

// Translate
  p->x += position.x;
  p->y += position.y;
  p->z += position.z;
}

void render(int* n, const unsigned char* m){
  rotation.x = n[0];
  rotation.y = n[1];
  rotation.z = n[2];
  scale.x = n[3];
  scale.y = n[4];
  scale.z = n[5];
  position.x = n[6] - camera.x;
  position.y = n[7] - camera.y;
  position.z = n[8] - camera.z;
  unsigned char tint = n[9];

  if (position.z < near)
    return;

  if (!m)
    m = ship;

  int light = position.z < (800 << 8);
  int dark =  position.z > ((800 + 500) << 8);

  int faceCount = (((int)m[0]) << 8) + (int)m[1];
  // int vtxCount = m[2];
  const unsigned char* faceOffset = m + 3;
  const unsigned char* vtxOffset = faceOffset + faceCount*4;

  Point pointA, pointB, pointC;
  Point* A = &pointA;
  unsigned char* Ai = 0;
  Point* B = &pointB;
  unsigned char* Bi = 0;
  Point* C = &pointC;
  unsigned char* Ci = 0;
  bool Ab, Bb, Cb;

  for (int face = 0; face<faceCount; ++face) {
    Ab = Bb = Cb = false;
    int color = *faceOffset++ + tint;
    if (!color) color++;

    unsigned char* indexA = vtxOffset + ((int)*faceOffset++) * 3;
    unsigned char* indexB = vtxOffset + ((int)*faceOffset++) * 3;
    unsigned char* indexC = vtxOffset + ((int)*faceOffset++) * 3;

    if( indexA == Ai ){ Ab = true; }
    else if( indexA == Bi ){ A = &pointB; Bb = true; }
    else if( indexA == Ci ){ A = &pointC; Cb = true; }
    else A = 0;

    if (indexB == Bi) { Bb = true; }
    else if (indexB == Ai) { B = &pointA; Ab = true; }
    else if (indexB == Ci) { B = &pointC; Cb = true; }
    else B = 0;

    if (indexC == Ci) { Cb = true; }
    else if (indexC == Bi) { C = &pointB; Bb = true; }
    else if (indexC == Ai) { C = &pointA; Ab = true; }
    else C = 0;

    if (!A) {
      if (!Ab) { A = &pointA; Ab = true; }
      else if (!Bb) { A = &pointB; Bb = true; }
      else if (!Cb) { A = &pointC; Cb = true; }
      A->x = ((signed char)*indexA++) << 8;
      A->y = ((signed char)*indexA++) << 8;
      A->z = ((signed char)*indexA) << 8;
      transform(A);
      if(A->z <= near) continue;
      v_project(A);
    }

    if (!B) {
      if (!Ab) { B = &pointA; Ab = true; }
      else if (!Bb) { B = &pointB; Bb = true; }
      else if (!Cb) { B = &pointC; Cb = true; }
      B->x = ((signed char)*indexB++) << 8;
      B->y = ((signed char)*indexB++) << 8;
      B->z = ((signed char)*indexB) << 8;
      transform(B);
      if(B->z <= near) continue;
      v_project(B);
    }

    if (!C) {
      if (!Ab) { C = &pointA; Ab = true; }
      else if (!Bb) { C = &pointB; Bb = true; }
      else if (!Cb) { C = &pointC; Cb = true; }
      C->x = ((signed char)*indexC++) << 8;
      C->y = ((signed char)*indexC++) << 8;
      C->z = ((signed char)*indexC) << 8;
      transform(C);
      if(C->z <= near) continue;
      v_project(C);
    }

    if (((A->x - B->x) >> 8)*((A->y - C->y) >> 8) -
        ((A->y - B->y) >> 8)*((A->x - C->x) >> 8) < 0)
      continue;

    fillTriangle(
      A->x >> 8, A->y >> 8,
      B->x >> 8, B->y >> 8,
      C->x >> 8, C->y >> 8,
      light ? alternate(color, 7) :
      dark ? alternate(color, 0) :
                 solid(color)
    );
  }
}
`);

const nodeCount = 4;
const nodes = new Array(nodeCount);
const sintable = new Uint8Array(256);
const translation = new Uint32Array(10);
let bgColor = 0;
const BLACK = g.setColor.bind(g, 0);
let lcdBuffer = 0;
let locked = false;
let charging = false;
let stopped = true;
let timeout;

function setupInterval(force) {
  if (timeout)
    clearTimeout(timeout);
  let stop = locked && !charging;
  timeout = setTimeout(setupInterval, stop ? 60000 : 60);
  tick(stop && !force);
  if (stop != stopped) {
    stopped = stop;
    let widget_utils = require("widget_utils");
    if (stop) widget_utils.show();
    else if (widget_utils.hide) widget_utils.hide();
  }
}

function init() {
  bgColor = g.theme.bg & 0x8410;
  bgColor = ((bgColor >> 15) | (bgColor >> 9) | (bgColor >> 2));

  g.clear();
  g.setFont('6x8', 2);
  g.setFontAlign(0, 0.5);
  g.drawString("[LOADING]", 90, 66);

  // setup sin/cos table
  for (let i = 0; i < sintable.length; ++i)
    sintable[i] = Math.sin((i * Math.PI * 0.5) / sintable.length) * ((1 << 8) - 1);

  // setup nodes
  for (let i = 0; i < nodeCount; ++i) {
    nodes[i] = {
      rx: 0,
      ry: 256,
      rz: 0,
      sx: 4,
      sy: 4,
      sz: 4,
      vx: Math.random() * 20 - 10,
      vy: Math.random() * 20 - 10,
      vz: Math.random() * 5 - 2.5,
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 2000 - 1000,
      z: i * 500 + 500,
      c: i
    };
  }
  lcdBuffer = Bangle.getOptions().lcdBufferPtr;
  if (!lcdBuffer) {
    E.showMessage("Needs firmwave 2v21 or newer");
    return;
  }
  let stride = 68;
  //print('Found lcdBuffer at ' + lcdBuffer.toString(16) + ' stride=' + stride);
  var sintablePtr = E.getAddressOf(sintable, true);
  if (!sintablePtr) {
    lcdBuffer = 0;
    E.showMessage("Not enough memory");
    return;
  }
  gfx.init(lcdBuffer, stride, sintablePtr);
  gfx.setCamera(0, 0, -300 << 8);
  setupInterval(true);
}

function updateNode(index) {
  let o = nodes[index];
  let x = o.x;
  let y = o.y;
  let z = o.z;
  let tz = index * 500 + 500;
  o.vx += (x < 0) * 10 - 5;
  o.vy += (y < 0) * 10 - 5;
  o.vz += (z < tz) * 1 - 0.5;
  // lean into the curve
  o.rz = o.vx * 0.5;

  x += o.vx;
  y += o.vy;
  z += o.vz;

  o.x = x;
  o.y = y;
  o.z = z;

  // iterative bubble sort
  let p = nodes[index - 1];
  if (p && z > p.z) {
    nodes[index - 1] = o;
    nodes[index] = p;
  }
}

function drawNode(index) {
  let o = nodes[index];
  let i = 0;
  // float to 23.8 fixed
  translation[i++] = o.rx * 256;
  translation[i++] = o.ry * 256;
  translation[i++] = o.rz * 256;
  translation[i++] = o.sx * 256;
  translation[i++] = o.sy * 256;
  translation[i++] = o.sz * 256;
  translation[i++] = o.x * 256;
  translation[i++] = o.y * 256;
  translation[i++] = o.z * 256;
  translation[i++] = o.c;
  let translationPtr = E.getAddressOf(translation, true);
  if (!translationPtr) {
    lcdBuffer = 0;
    E.showMessage("Not enough memory");
    return;
  }
  gfx.render(translationPtr);
}

function tick(locked) {
  g.reset();
  if (lcdBuffer && !locked) {
    BLACK().drawRect(-1, -1, 0, 177); // dirty all the rows
    gfx.clear(bgColor);
    gfx.stars();
    for (let i = 0; i < nodeCount; ++i)
      updateNode(i);
    for (let i = 0; i < nodeCount; ++i)
      drawNode(i);
  }

  var d = new Date();
  var h = d.getHours(),
    m = d.getMinutes();
  var time = (" " + h).substr(-2) + ":" + m.toString().padStart(2, 0);
  g.setColor(g.theme.fg)
    .setBgColor(g.theme.bg)
    .setFontAlign(0, 0.5)
    .setFont('6x8', 2)
    .drawString(time, 176 / 2, 176 - 16, true);
}

Bangle.setUI("clock");
Bangle.loadWidgets();

Bangle.on("lock", l => {
  locked = l;
  setupInterval();
});

Bangle.on('charging', c => {
  charging = c;
  setupInterval();
});

init();
