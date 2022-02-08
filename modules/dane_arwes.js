/* Copyright (c) 2020 OmegaRogue. See the file LICENSE for copying permission. */
/*
Graphics Functions based on the React Sci-Fi UI Framework Arwes

Take a look at README.md for hints on developing with this library.
*/

var C = {
  cornerSize: 14,    // description
  cornerOffset: 3,   // description
  borderWidth: 1     // description
};

function Arwes(cornerSize, cornerOffset) {
  this.cornerSize = cornerSize;
  this.cornerOffset = cornerOffset;
}


/** 'public' constants here */
Arwes.prototype.C = {
  color: {
    primary: {
      base: "#26dafd",
      light: "#8bebfe",
      dark: "#029dbb"
    },
    secondary: {
      base: "#df9527",
      light: "#ecc180",
      dark: "#8b5c15"
    },
    header: {
      base: "#a1ecfb",
      light: "#fff",
      dark: "#3fd8f7"
    },
    control: {
      base: "#acf9fb",
      light: "#fff",
      dark: "#4bf2f6"
    },
    success: {
      base: "#00ff00",
      light: "#6f6",
      dark: "#090"
    },
    alert: {
      base: "#ff0000",
      light: "#f66",
      dark: "#900"
    },
    disabled: {
      base: "#999999",
      light: "#ccc",
      dark: "#666"
    }
  }
};


function drawCorner(obj, x, y, n) {
  g.setColor(obj.C.color.primary.base);
  let s1 = (n&1)?1:-1, s2 = (n&2)?1:-1;
  const x1 = x + obj.cornerOffset * s1;
  const y1 = y + obj.cornerOffset * s2;
  g.fillRect(x1, y1, x - obj.cornerSize*s1 + obj.cornerOffset*s1, y);
  g.fillRect(x1, y1, x, y - obj.cornerSize*s2 + obj.cornerOffset*s2);

}

Arwes.prototype.drawFrameNoCorners = function (x1, y1, x2, y2) {
  g.setColor(this.C.color.primary.dark);
  g.drawRect(x1, y1, x2, y2);
}

Arwes.prototype.drawFrame = function (x1, y1, x2, y2) {
  drawCorner(this, x1, y1, 0);
  drawCorner(this, x2, y1, 1);
  drawCorner(this, x1, y2, 2);
  drawCorner(this, x2, y2, 3);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameBottomCorners = function (x1, y1, x2, y2) {
  drawCorner(this, x1, y2, 2);
  drawCorner(this, x2, y2, 3);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameTopCorners = function (x1, y1, x2, y2) {
  drawCorner(this, x1, y1, 0);
  drawCorner(this, x2, y1, 1);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameLeftCorners = function (x1, y1, x2, y2) {
  drawCorner(this, x1, y1, 0);
  drawCorner(this, x1, y2, 2);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameRightCorners = function (x1, y1, x2, y2) {
  drawCorner(this, x2, y1, 1);
  drawCorner(this, x2, y2, 3);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}




exports.create = function (cornerSize, cornerOffset) {
  return new Arwes(cornerSize, cornerOffset);
};

exports.default = function () {
  return new Arwes(C.cornerSize, C.cornerOffset);
};
