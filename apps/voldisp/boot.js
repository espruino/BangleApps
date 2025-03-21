{
  let timeout;
  let onMusicVolume = (volPercent)=>{
    if (timeout) {clearTimeout(timeout); timeout=undefined;}

    if (Bangle.CLOCK) {

      const WIDGET_UTILS_HIDE = function() {
        //exports.cleanup();
        if (!global.WIDGETS) return;
        g.reset(); // reset colors
        for (var w of global.WIDGETS) {
          if (w._draw) return; // already hidden
          w._draw = w.draw;
          w.draw = () => {};
          w._area = w.area;
          w.area = "";
          if (w.x!=undefined) g.clearRect(w.x,w.y,w.x+w.width-1,w.y+23);
        }
      };
      /// Show any hidden widgets
      const WIDGET_UTILS_SHOW = function() {
        //exports.cleanup();
        if (!global.WIDGETS) return;
        for (var w of global.WIDGETS) {
          if (!w._draw) return; // not hidden
          w.draw = w._draw;
          w.area = w._area;
          delete w._draw;
          delete w._area;
          w.draw(w);
        }
      };

      let isAllWidgetsHidden = true;
      if (global.WIDGETS) {
        for (var w of global.WIDGETS) {
          if (!w._draw) {
            isAllWidgetsHidden = false;
            break;
          }
        }
      }
      WIDGET_UTILS_HIDE();
      let barWidth = g.getWidth()*volPercent/100;
      g.
        setColor(0x0000).fillRect(0,0,g.getWidth(),24).
        setColor(0xF800).fillRect(0,0,barWidth,19).
        setColor(0xFFFF).setFont("12x20").setFontAlign(1,-1).
        drawString("volume",barWidth,1);

      let goAway = ()=>{
        if (!isAllWidgetsHidden) {
          g.reset().clearRect(0,0,g.getWidth(),24);
          WIDGET_UTILS_SHOW();
        } else if (Bangle.uiRedraw) {
          Bangle.uiRedraw();
        } else {
          Bangle.load();
        }
      };
      timeout = setTimeout(goAway, 3*1000);
    }
  };
  Bangle.on("musicVolume", onMusicVolume);
  //GB({t:"audio",v:66});
}
