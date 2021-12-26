// annexed code that might be worth keeping

/*****************************************************************************

Screen Buffer Object that can be shared between faces

Making into a Class like this means we allocate the memory once
and avoid fragmenting the memory when we switch in and out of faces

******************************************************************************/

function BUF() {
  this.pal4color = new Uint16Array([0x0000, 0xffff, 0x7bef, 0xafe5], 0, 2); // b,w,grey,greenyellow
  this.pal4red = new Uint16Array([0x0000, 0xffff, 0xf800, 0xafe5], 0, 2); // b,w,red,greenyellow
  this.buf = Graphics.createArrayBuffer(120, 120, 2, { msb: true });
}

BUF.prototype.flip = function (x, y) {
  g.drawImage(
    {
      width: 120,
      height: 120,
      bpp: 2,
      buffer: this.buf.buffer,
      palette: this.pal4color,
    },
    x,
    y
  );
  this.buf.clear();
};

BUF.prototype.flip_red = function (x, y) {
  g.drawImage(
    {
      width: 120,
      height: 120,
      bpp: 2,
      buffer: this.buf.buffer,
      palette: this.pal4red,
    },
    x,
    y
  );
  this.buf.clear();
};

let bufObj = new BUF();
