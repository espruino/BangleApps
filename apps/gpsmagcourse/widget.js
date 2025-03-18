(() => {
  const settings = Object.assign({
    compassSrc: 1, // 0 = off
    showWidget: 2, // 0 = never, 1 = when replacing GPS course with compass course, 2 = when GPS is on
  }, require("Storage").readJSON("gpsmagcourse.json", true) || {});

  function isInside(rect, e) {
    return e.x>=rect.x && e.x<rect.x+rect.w
          && e.y>=rect.y && e.y<=rect.y+rect.h;
  }

  function draw() {
    if (this.width) {
      g.clearRect(this.x, this.y, this.x+this.width-1, this.y+23);

      if (this.show) {
        this.width = 24;
        g.reset();
        g.drawImage(require("heatshrink").decompress(atob("jEYwgrohEN6EwBQ+DBYM4wALFxGA7vdB4IWFxEABYMAnAlECwMNBYPQCIQLDgALDDAI5EBYIFBBYIeBBYRBGA4QnBCAZBDA4ILLEZYLMKYR9FAgaKFNYpgCD4RBFAwQLBCwpOELAwACgeIwbLHK5ILPAAwA=")), this.x, this.y);
        if (this.show === 2) {
          // draw stroke
          g.setColor(1,0,0).fillPoly([this.x+2, 0,
                                      this.x+this.width-1,this.y+21,
                                      this.x+this.width-3, this.y+23,
                                      this.x, 2
                                     ]);
        }
      }
    }

    const newWidth = this.show ? 24 : 0;
    if (newWidth !== this.width) {
      this.width = newWidth;
      Bangle.drawWidgets();
    }
  }

  if (settings.compassSrc > 0 && settings.showWidget > 0) {
    // add your widget
    WIDGETS.gpsmagcourse={
      area:"tr", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
      width: 0, // hide by default
      draw:draw,
      show:0 // 0 = hide, 1 = show, 2 = with stroke
    };

    // show only when GPS course is replaced
    Bangle.on('GPS', function(gps) {
      if (gps.courseOrig && WIDGETS.gpsmagcourse.show !== 1 && Bangle.isGPSOn()) {
        WIDGETS.gpsmagcourse.show = 1;
        WIDGETS.gpsmagcourse.draw();
      } else if (!gps.courseOrig && WIDGETS.gpsmagcourse.show === 1) {
        WIDGETS.gpsmagcourse.show = settings.showWidget === 1 ? 0 : 2;
        WIDGETS.gpsmagcourse.draw();
      }
    });

    // hide widget if GPS is turned off
    const origSetGPSPower = Bangle.setGPSPower;
    Bangle.setGPSPower = function(on, id) {
      const isGPSon = origSetGPSPower(on, id);
      if (!isGPSon && WIDGETS.gpsmagcourse.show) {
        WIDGETS.gpsmagcourse.show = 0;
        WIDGETS.gpsmagcourse.draw();
      } else if (isGPSon && !WIDGETS.gpsmagcourse.show) {
        WIDGETS.gpsmagcourse.show = 2;
        WIDGETS.gpsmagcourse.draw();
      }
      return isGPSon;
    };

    // reset compass on click on widget
    Bangle.on('touch', function(button, touch) {
      if (touch && WIDGETS.gpsmagcourse && WIDGETS.gpsmagcourse.x && WIDGETS.gpsmagcourse.width && isInside({x: WIDGETS.gpsmagcourse.x, y: WIDGETS.gpsmagcourse.y, w: WIDGETS.gpsmagcourse.width, h: 24}, touch)) {
        Bangle.buzz(50);
        Bangle.resetCompass();
      }
    });
  } // if (settings.compassSrc > 0 && settings.showWidget)
})();
