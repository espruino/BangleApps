
var aux = new Float32Array(8);
var p_aux = E.getAddressOf(aux, true);
aux[0] = -2;
aux[1] = -1.5;
aux[2] = 1;
aux[3] = 1.5;

var buf_height = 40;

var frameX1=0, frameX2=239, frameY1=0, frameY2=239;
var frameCorner = 0;

var imbuf = Graphics.createArrayBuffer(240, buf_height, 16);
var imbufaddr = E.getAddressOf(imbuf.buffer, true);
var mimg = {
  width :imbuf.getWidth(),
  height:imbuf.getHeight(),
  bpp   :16,
  buffer:imbuf.buffer
};

var c = E.compiledC(`
// void mandel(int, int)
union shortbytes {
  short s;
  char b[2];
};
void mandel(float *p, short *ib) {
  float mincx = p[0];
  float mincy = p[1];
  float maxcx = p[2];
  float maxcy = p[3];
  int minx = (int)p[4];
  int miny = (int)p[5];
  int maxx = (int)p[6];
  int maxy = (int)p[7];
  int pib = 0;
  for (int y=miny; y<maxy; ++y) 
    for (int x=minx; x<maxx; ++x) {
      float cr = mincx+(maxcx-mincx)*x/240.0;
      float ci = mincy+(maxcy-mincy)*y/240.0;
      float zr=0, zi=0;
      char niter = 31;
      while (--niter && zr>-2 && zr<1 && zi>-1.5 && zi<1.5) {
        float nr = zr*zr-zi*zi + cr;
        zi = 2*zr*zi + ci;
        zr = nr;
      }
      union shortbytes c, d;
      c.s = niter | (niter << 7)&0x7ff | (niter<<13)&0xffff;
      d.b[0] = c.b[1];
      d.b[1] = c.b[0];
      ib[pib++] = d.s;
    }
}
`);

function drawRectangle(x1, y1, x2, y2) {
  if (frameCorner==1) g.setColor(1, 0, 0);
  else g.setColor(1, 1, 1);
  g.drawLine(x1, y1, x2, y1).drawLine(x1, y1, x1, y2);
  if (frameCorner==2) g.setColor(1, 0, 0);
  else g.setColor(1, 1, 1);
  g.drawLine(x1, y2, x2, y2).drawLine(x2, y1, x2, y2);
}

function restoreRow(y) {
  mimg.width = 240;
  mimg.height = 1;
  aux[4] = 0;
  aux[5] = y;
  aux[6] = 240;
  aux[7] = y+1;
  c.mandel(p_aux, imbufaddr);
  g.drawImage(mimg, 0, y);
}

function restoreCol(x) {
  mimg.width = 1;
  mimg.height = 240;
  aux[4] = x;
  aux[5] = 0;
  aux[6] = x+1;
  aux[7] = 240;
  c.mandel(p_aux, imbufaddr);
  g.drawImage(mimg, x, 0);
}

function moveUp() {
  restoreCol(frameX1);
  restoreCol(frameX2);
  if (frameCorner==1 && frameY1>3) {
    restoreRow(frameY1);
    frameY1 -= 4;
  }
  if (frameCorner==2 && frameY2>3) {
    restoreRow(frameY2);
    frameY2 -= 4;
  }
  drawRectangle(frameX1, frameY1, frameX2, frameY2);
}

function moveDown() {
  restoreCol(frameX1);
  restoreCol(frameX2);
  if (frameCorner==1 && frameY1<235) {
    restoreRow(frameY1);
    frameY1 += 4;
  }
  if (frameCorner==2 && frameY2<235) {
    restoreRow(frameY2);
    frameY2 += 4;
  }
  drawRectangle(frameX1, frameY1, frameX2, frameY2);
}

function moveRight() {
  restoreRow(frameY1);
  restoreRow(frameY2);
  if (frameCorner==1 && frameX1<235) {
    restoreCol(frameX1);
    frameX1 += 4;
  }
  if (frameCorner==2 && frameX2<235) {
    restoreCol(frameX2);
    frameX2 += 4;
  }
  drawRectangle(frameX1, frameY1, frameX2, frameY2);
}

function moveLeft() {
  restoreRow(frameY1);
  restoreRow(frameY2);
  if (frameCorner==1 && frameX1>3) {
    restoreCol(frameX1);
    frameX1 -= 4;
  }
  if (frameCorner==2 && frameX2>3) {
    restoreCol(frameX2);
    frameX2 -= 4;
  }
  drawRectangle(frameX1, frameY1, frameX2, frameY2);
}


function toggleFrame() {
  if (frameCorner<2) {
    frameCorner++;
    drawRectangle(frameX1, frameY1, frameX2, frameY2);
  }
  else {
    frameCorner = 0;
    var mincx = aux[0] + (aux[2]-aux[0])*frameX1/240.0;
    var maxcx = aux[0] + (aux[2]-aux[0])*frameX2/240.0;
    var mincy = aux[1] + (aux[3]-aux[1])*frameY1/240.0;
    var maxcy = aux[1] + (aux[3]-aux[1])*frameY2/240.0;
    aux[0] = mincx;
    aux[1] = mincy;
    aux[2] = maxcx;
    aux[3] = maxcy;
    drawIt();
  }
}

setWatch(toggleFrame, BTN2, {repeat: true});
setWatch(moveUp, BTN1, {repeat: true});
setWatch(moveDown, BTN3, {repeat: true});
Bangle.on('touch', function(button) {
  switch(button) {
    case 1: moveLeft(); break;
    case 2: moveRight(); break;
  }
});


function drawIt() {
  aux[4] = 0;
  aux[5] = 0;
  aux[6] = 240;
  aux[7] = buf_height;
  mimg.width = 240;
  mimg.height = buf_height;
  for (var y=0; y<240/buf_height; ++y) {
    c.mandel(p_aux, imbufaddr);
    aux[5] += buf_height;
    aux[7] += buf_height;
    g.drawImage(mimg, 0, y*buf_height);
  }
}

setTimeout(drawIt, 50);
