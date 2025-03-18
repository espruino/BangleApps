{ // wrap app in scope to prevent minifier from removing the class definition completely
  class TwoK {
    constructor() {
      this.b = Array(4).fill().map(() => Array(4).fill(0));
      this.score = 0;
      this.cmap = {0: "#caa", 2:"#ccc", 4: "#bcc", 8: "#ba6", 16: "#e61", 32: "#d20", 64: "#d00", 128: "#da0", 256: "#ec0", 512: "#dd0"};
    }
    drawBRect(x1, y1, x2, y2, th, c, cf, fill) {
      g.setColor(c);
      for (i=0; i<th; ++i) g.drawRect(x1+i, y1+i, x2-i, y2-i);
      if (fill) g.setColor(cf).fillRect(x1+th, y1+th, x2-th, y2-th);
    }
    render() {
      const yo = 20;
      const xo = yo/2;
      h = g.getHeight()-yo;
      w = g.getWidth()-yo;
      bh = Math.floor(h/4);
      bw = Math.floor(w/4);
      g.clearRect(0, 0, g.getWidth()-1, yo).setFontAlign(0, 0, 0);
      g.setFont("Vector", 16).setColor(g.theme.fg).drawString("Score:"+this.score.toString(), g.getWidth()/2, 8);
      this.drawBRect(xo-3, yo-3, xo+w+2, yo+h+2, 4, "#a88", "#caa", false);
      for (y=0; y<4; ++y)
        for (x=0; x<4; ++x) {
          b = this.b[y][x];
          this.drawBRect(xo+x*bw, yo+y*bh-1, xo+(x+1)*bh-1, yo+(y+1)*bh-2, 4, "#a88", this.cmap[b], true);
          if (b > 4) g.setColor(1, 1, 1);
          else g.setColor(0, 0, 0);
          g.setFont("Vector", bh*(b>8 ? (b>64 ? (b>512 ? 0.32 : 0.4) : 0.6) : 0.7)); 
          if (b>0) g.drawString(b.toString(), xo+(x+0.5)*bw+1, yo+(y+0.5)*bh);
        }
    }
    shift(d) { // +/-1: shift x, +/- 2: shift y
      var crc = E.CRC32(this.b.toString());
      if (d==-1) { // shift x left
        for (y=0; y<4; ++y) {
          for (x=2; x>=0; x--)
            if (this.b[y][x]==0) {
              for (i=x; i<3; i++) this.b[y][i] = this.b[y][i+1];
              this.b[y][3] = 0;
            }
          for (x=0; x<3; ++x)
            if (this.b[y][x]==this.b[y][x+1]) {
                this.score += 2*this.b[y][x];
                this.b[y][x] += this.b[y][x+1];
                for (j=x+1; j<3; ++j) this.b[y][j] = this.b[y][j+1];
                this.b[y][3] = 0;
            }
        }
      }
      else if (d==1) { // shift x right
        for (y=0; y<4; ++y) {
          for (x=1; x<4; x++)
            if (this.b[y][x]==0) {
              for (i=x; i>0; i--) this.b[y][i] = this.b[y][i-1];
              this.b[y][0] = 0;
            }
          for (x=3; x>0; --x)
            if (this.b[y][x]==this.b[y][x-1]) {
              this.score += 2*this.b[y][x];
              this.b[y][x] += this.b[y][x-1] ;
              for (j=x-1; j>0; j--) this.b[y][j] = this.b[y][j-1];
              this.b[y][0] = 0;
            }
        }
      }
      else if (d==-2) { // shift y down
        for (x=0; x<4; ++x) {
          for (y=1; y<4; y++)
            if (this.b[y][x]==0) {
              for (i=y; i>0; i--) this.b[i][x] = this.b[i-1][x];
              this.b[0][x] = 0;
            }
          for (y=3; y>0; y--)
            if (this.b[y][x]==this.b[y-1][x] || this.b[y][x]==0) {
              this.score += 2*this.b[y][x];
              this.b[y][x] += this.b[y-1][x];
              for (j=y-1; j>0; j--) this.b[j][x] = this.b[j-1][x];
              this.b[0][x] = 0;
            }
        }
      }
      else if (d==2) { // shift y up
        for (x=0; x<4; ++x) {
          for (y=2; y>=0; y--) 
            if (this.b[y][x]==0) {
              for (i=y; i<3; i++) this.b[i][x] = this.b[i+1][x];
              this.b[3][x] = 0;
            }
          for (y=0; y<3; ++y)
            if (this.b[y][x]==this.b[y+1][x] || this.b[y][x]==0) {
              this.score += 2*this.b[y][x];
              this.b[y][x] += this.b[y+1][x];
              for (j=y+1; j<3; ++j) this.b[j][x] = this.b[j+1][x];
              this.b[3][x] = 0;
            }
        }
      }
      return (E.CRC32(this.b.toString())!=crc);
    }
    addDigit() {
      var d = Math.random()>0.9 ? 4 : 2;
      var id = Math.floor(Math.random()*16);
      while (this.b[Math.floor(id/4)][id%4] > 0) id = Math.floor(Math.random()*16);
      this.b[Math.floor(id/4)][id%4] = d;
    }
  }

  function dragHandler(e) {
    if (e.b && (Math.abs(e.dx)>7 || Math.abs(e.dy)>7)) {
      var res = false;
      if (Math.abs(e.dx)>Math.abs(e.dy)) {
        if (e.dx>0) res = twok.shift(1);
        if (e.dx<0) res = twok.shift(-1);
      }
      else {
        if (e.dy>0) res = twok.shift(-2);
        if (e.dy<0) res = twok.shift(2);
      }
      if (res) twok.addDigit();
      twok.render();
    }
  }

  /*function swipeHandler() {
    
  }*/

  /*function buttonHandler() {
    
  }*/

  var twok = new TwoK();
  twok.addDigit(); twok.addDigit();
  twok.render();
  if (process.env.HWVERSION==2) Bangle.on("drag", dragHandler);
  if (process.env.HWVERSION==1) {
    Bangle.on("swipe", (e) => { res = twok.shift(e); if (res) twok.addDigit(); twok.render(); });
    setWatch(() => { res = twok.shift(2); if (res) twok.addDigit(); twok.render(); }, BTN1, {repeat: true});
    setWatch(() => { res = twok.shift(-2); if (res) twok.addDigit(); twok.render(); }, BTN3, {repeat: true});
  }
}