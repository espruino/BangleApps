const gfx = E.compiledC(`
// void init(int, int, int)
// void tick(int)
// void render(int)
// void setCamera(int, int, int)
// void bubble(int, int, int, int)

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
Point speed;

const unsigned char ship[] = {
0,38,25,10,3,8,6,10,7,3,6,13,3,11,5,13,1,12,3,15,3,5,8,15,1,3,7,13,12,11,3,15,5,6,8,15,6,1,7,10,5,0,6,10,0,1,6,12,5,11,4,12,12,1,2,12,2,11,12,12,10,5,4,13,5,10,0,12,2,1,9,13,9,1,0,12,4,11,2,10,19,22,21,12,4,2,10,12,10,2,9,10,13,16,15,13,10,9,0,15,21,20,19,15,15,14,13,15,19,20,22,15,13,14,16,15,21,23,20,15,15,17,14,15,22,20,23,10,22,24,21,15,16,14,17,10,16,18,15,15,24,23,21,15,18,17,15,15,22,23,24,15,16,17,18,0,0,62,236,243,244,247,0,234,0,229,194,11,0,234,21,243,246,0,234,33,193,250,20,63,249,19,249,4,3,9,4,3,7,247,222,250,247,222,240,0,22,238,13,22,226,1,20,229,7,62,225,11,20,208,27,62,19,0,20,22,12,20,33,0,18,30,5,60,34,10,18,52,26,60
};

const unsigned int terrainLength = 12;
const unsigned int terrainWidth = 12;
unsigned char terrain[terrainLength][terrainWidth];
unsigned int _rngState;
unsigned int rng() {
    _rngState ^= _rngState << 17;
    _rngState ^= _rngState >> 13;
    _rngState ^= _rngState << 5;
    return _rngState;
}

void shiftTerrain() {
  for (int i = terrainLength - 1; i > 0; --i) {
    for (int x = 0; x < terrainWidth; ++x)
      terrain[i][x] = terrain[i-1][x];
  }

  for (int x = 0; x < terrainWidth; ++x)
    terrain[0][x] = (int(terrain[0][x]) + ((rng() & 0x7F) + 0x7)) >> 1;
  int mid = terrainWidth >> 1;
  terrain[0][mid-1] >>= 1;
  terrain[0][mid  ] = 0;
  terrain[0][mid+1] = 0;
  terrain[0][mid+2] = 0;
  terrain[0][mid+3] >>= 1;
}

void init(unsigned char* _fb, int _stride, unsigned char* _sint) {
  fb = _fb;
  stride = _stride;
  sint = _sint;
  _rngState = 1013904223;
  for (int i = 0; i < terrainLength; ++i)
    shiftTerrain();
  speed.x = 0;
  speed.y = 0;
  speed.z = 0;
  position.x = 100 << 8;
  position.y = -150 << 8;
  position.z = 100 << 8;
  rotation.x = 0;
  rotation.y = 256 << 8;
  rotation.z = 0;
  scale.x = 1 << 8;
  scale.y = 1 << 8;
  scale.z = 1 << 8;
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
  int fovz = ((90 << 16) / ((90 << 8) + p->z)); // 16:16 / 16:8 -> 16:8
  p->x = (p->x * fovz >> 8) + (176/2 << 8); // 16:8 * 16:8 = 16:16 -> 16:8
  p->y = (176/2 << 8) - (p->y * fovz >> 8);
  p->z = fovz;
}

void drawTerrain() {
  const int tileSize = 40 << 8;
  camera.x = (terrainWidth + 2) * tileSize / 2;
  camera.y = 60 << 8;
  camera.z += 6 << 8;
  if (camera.z > tileSize * 3) {
    camera.z -= tileSize;
    shiftTerrain();
  }

  int dist[] = {
    solid(7),
    solid(7),
    alternate(5, 7),
    alternate(5, 7),
    solid(5),
    solid(5),
    alternate(5, 0),
    solid(0)
  };
  int line = solid(5);

  int fovz, fz;
  int pz = (terrainLength) * tileSize - camera.z;
  int prvz = ((90 << 16) / ((90 << 8) + pz)); // 16:16 / 16:8 = 16:8
  for (int i = 0; i < terrainLength - 1; ++i, prvz = fovz, pz = fz) {
    fz = (terrainLength - (i + 1)) * tileSize - camera.z;
    fovz = ((90 << 16) / ((90 << 8) + fz)); // 16:16 / 16:8 = 16:8
    int lum = i < 7 ? i : 7;
    for (int x = 0; x < terrainWidth - 1; ++x) {
      int ax = ((x    ) * tileSize - camera.x) >> 8;
      int bx = ((x + 1) * tileSize - camera.x) >> 8;
      int cx = ((x    ) * tileSize - camera.x) >> 8;
      int dx = ((x + 1) * tileSize - camera.x) >> 8;

      int ay = ((terrain[i    ][x    ] << 8) - camera.y) >> 8;
      int by = ((terrain[i    ][x + 1] << 8) - camera.y) >> 8;
      int cy = ((terrain[i + 1][x    ] << 8) - camera.y) >> 8;
      int dy = ((terrain[i + 1][x + 1] << 8) - camera.y) >> 8;

      int na = ((ax - bx)*(ay - cy) - (ay - by)*(ax - cx)) >> 8;
      int nb = ((bx - dx)*(by - cy) - (by - dy)*(bx - cx)) >> 8;
      int ca = lum - na;
      int cb = lum - nb;

      ax = 88 + (ax * prvz >> 8);
      bx = 88 + (bx * prvz >> 8);
      cx = 88 + (cx * fovz >> 8);
      dx = 88 + (dx * fovz >> 8);
      ay = 88 - (ay * prvz >> 8);
      by = 88 - (by * prvz >> 8);
      cy = 88 - (cy * fovz >> 8);
      dy = 88 - (dy * fovz >> 8);

      int av = (ax - bx)*(ay - cy) - (ay - by)*(ax - cx);
      int bv = (bx - dx)*(by - cy) - (by - dy)*(bx - cx);

      if (av > 0) {
        if (ca < 0) ca = 0;
        else if (ca >= 7) ca = 7;
        if (ca >= 6 && x >= terrainWidth/2 && x < terrainWidth/2+2) ca = 6;
        ca = dist[ca];
        fillTriangle(ax, ay, bx, by, cx, cy, ca);
      }

      if (bv > 0) {
        int hasLine = false;
        if (cb < 0) cb = 0;
        else if (cb >= 7) {
          cb = 7;
          hasLine = true;
        }
        if (cb >= 6 && x >= terrainWidth/2 && x < terrainWidth/2+2) {
          cb = 6;
          hasLine = true;
        }
        cb = dist[cb];
        fillTriangle(bx, by, cx, cy, dx, dy, cb);
        if (hasLine) {
          fillTriangle(ax, ay, bx, by, bx, by - 1, line);
          fillTriangle(ax, ay, cx, cy, cx, cy - 1, line);
        }
      }
    }
  }
}

void transform(Point* p) {
  int x = p->x;
  int y = p->y;
  int z = p->z;
  int s, c;

  if (rotation.x) {
    s = sin(rotation.x);
    c = cos(rotation.x);
    p->y = (y*c>>8) - (z*s>>8);
    p->z = (y*s>>8) + (z*c>>8);
    y = p->y;
    z = p->z;
  }

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

void fillCircleInternal(int xc, int yc, int x, int y, int c) {
    drawHLine(xc - x, yc - y, x * 2, c);
    drawHLine(xc - x, yc + y, x * 2, c);
    drawHLine(xc - y, yc - x, y * 2, c);
    drawHLine(xc - y, yc + x, y * 2, c);
}

void fillCircle(int xc, int yc, int r, int color) {
  if (r < 1 || xc + r < 0 || xc - r >= 176 || yc + r < 0 || yc - r >= 176)
    return;
  int x = 0, y = r;
  int d = 3 - 2 * r;
  fillCircleInternal(xc, yc, x, y, color);
  while (y >= x) {
    x++;
    if (d > 0) {
      y--;
      d = d + 4 * (x - y) + 10;
    } else {
      d = d + 4 * x + 6;
    }
    fillCircleInternal(xc, yc, x, y, color);
  }
}

void bubble(int x, int y, int r, int c) {
  fillCircle(x, y, r + 3, alternate(7, 4));
  fillCircle(x, y, r, alternate(c, 0));
  int rs = r * 0xE666 >> 16;
  int off = (r - rs) * 0x9696 >> 16;
  fillCircle(x + off, y - off, rs, solid(c));
  rs = r * 0x4CCC >> 16;
  off = (r - rs) * 0x9696 >> 16;
  fillCircle(x + off, y - off, rs, alternate(c, 7));
  rs = r * 0x1999 >> 16;
  off = (r - rs) * 0x8E38 >> 16;
  fillCircle(x + off, y - off, rs, solid(7));
}

void render(const unsigned char* m){
  if (position.z < near)
    return;

  if (!m)
    m = ship;

  int faceCount = (((int)m[0]) << 8) + (int)m[1];
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
    int color = *faceOffset++ & ~2;
    color ^= (color >> 2) & 1;

    const unsigned char* indexA = vtxOffset + ((int)*faceOffset++) * 3;
    const unsigned char* indexB = vtxOffset + ((int)*faceOffset++) * 3;
    const unsigned char* indexC = vtxOffset + ((int)*faceOffset++) * 3;

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

    int cross = (A->x - B->x)*(A->y - C->y) - (A->y - B->y)*(A->x - C->x);
    if (cross < 0)
      continue;

    cross >>= 8;
    int light = cross > (20000 << 3);
    int dark = cross < (5000 << 2);

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

void tick(int c) {
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


  fillCircle(88, 110, 35, alternate(5,0));
  fillCircle(88, 110, 27, alternate(5,7));
  fillCircle(88, 110, 20, solid(7));
  drawTerrain();

  speed.x += ((position.x < 0) ? 1 : -1) << 8;
  speed.y += ((position.y < (-80 << 8)) ? 1 : -1) << 8;
  rotation.x = speed.y;
  rotation.z = speed.x;
  position.y += speed.y >> 1;
  position.x += speed.x >> 1;

  render(ship);
}


`);

// font from 93dub
var fontNum = atob("AAAAAAAAAAAAAA//8D//g//8P/+I//8//44//w//j4//A/+P4/8A/4/4AAAAD/4AAAAP/wAAAAf/gAAAA//AAAAB/+AAAAD/8AAAAH/4AAAAP/wAAAAf/gAAAA//AAAAB/+AAAAD/8AAAAH/wAAAAH/H/gH/H8f/gf/Hx//h//HH//n//Ef/+H//B//4H//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wB/4AP/4H/4A//4f/4D//5//4P//h//4//+B//4AAAAAAAAAAAAAAAAAf/+AAAB//4gAAD//jgAAD/+PgABj/4/gAHj/j/gAfgAP/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/AA/AAf8f88AAfx/8wAAfH/8AAAcf/8AAAR//4AAAH//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAA4AAAAAD4AAYAAP4AD8AA/4AH4AD/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/wAHgAH/H/GH/H8f/gf/Hx//h//HH//n//Ef/+H//B//4H//AAAAAAAAAAAAAAP//AAAAP//AAAAP//AAAAP/8AAAAP/2AAAAP/eAAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB+AAAAAD8AAAB/7x/4AH/7H/4Af/4f/4B//5//4H//h//4f/+B//4AAAAAAAAAAAAAD//wAAAD//wAAAj//gAADj/+AAAPj/5gAA/j/ngAD/gAfgAP/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/AA/AAf8AA8f8fwAAx/8fAAAH/8cAAAf/8QAAA//8AAAA//8AAAAAAAAAAAAAA//8D//g//8P/+I//8//44//0//j4//Y/+P4/94/4/4AH4AD/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/wAPwAH/AAPH/H8AAMf/HwAAB//HAAAH//EAAAH//AAAAH//AAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAGAAAAAAOAAAAAAeAAAAAA+AAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB8AAAAADx/4B/4HH/4H/4Mf/4f/4R//5//4H//h//4f/+B//4AAAAAAAAAAAAAD//wP/+D//w//4j//z//jj//T/+Pj/9j/4/j/3j/j/gAfgAP/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/AA/AAf8f+8f8fx/+x/8fH/+H/8cf/+f/8R//4f/8H//gf/8AAAAAAAAAAAAAA//8AAAA//8AAAI//8AAA4//0AAD4//YAAP4/94AA/4AH4AD/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/wAPwAH/H/vH/H8f/sf/Hx//h//HH//n//Ef/+H//B//4H//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

const sintable = new Uint8Array(256);
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
  require("Font5x9Numeric7Seg").add(Graphics);
  g.setFont("5x9Numeric7Seg");
  bgColor = g.theme.bg & 0x8410;
  bgColor = ((bgColor >> 15) | (bgColor >> 9) | (bgColor >> 2));

  g.clear();
  g.setFontAlign(0, 0.5);
  g.drawString("[LOADING]", 90, 66);

  // setup sin/cos table
  for (let i = 0; i < sintable.length; ++i)
      sintable[i] = Math.sin((i * Math.PI * 0.5) / sintable.length) * ((1 << 8) - 1);

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
  gfx.setCamera(0, 0, 0);
  setupInterval(true);
}

function tick(locked) {
  g.reset();

  if (lcdBuffer && !locked) {
    BLACK().drawRect(-1, -1, 0, 177); // dirty all the rows
    gfx.tick(bgColor);
  }

  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
    g.setColor(locked ? g.theme.fg : g.toColor(1,0,1))
     .setBgColor(g.theme.bg)
     .setFontCustom(fontNum, 48, 28, 41)
     .setFontAlign(-1, -1)
     .drawString(("0" + h).substr(-2) + ("0"+m).substr(-2), 30, 30, true);
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
