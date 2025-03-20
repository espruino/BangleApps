{
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

  let isWeHidingTheWidgets = false;
  let timeout;
  let onMusicVolume = (volPercent)=>{
    if (timeout) {clearTimeout(timeout);}

    if (Bangle.CLOCK) {

      let isAllWidgetsHidden = true;
      if (!timeout) { // No need to do this if we already did it before and it wasn't undone. I.e. the timout to execute `goAway` never ran out.
        if (global.WIDGETS) {
          for (var w of global.WIDGETS) {
            if (!w._draw) {
              isAllWidgetsHidden = false;
              break;
            }
          }
        }
        if (!isAllWidgetsHidden) {
          WIDGET_UTILS_HIDE();
          isWeHidingTheWidgets = true; // Remember if it was we who hid the widgets between draws of the volume bar.
        }
      }
      let barWidth = g.getWidth()*volPercent/100;
      g.
        setColor(0x0000).fillRect(0,0,g.getWidth(),24).
        setColor(0xF800).fillRect(0,0,barWidth,19).
        setColor(0xFFFF).setFont("12x20").setFontAlign(1,-1).
        drawString("volume",barWidth,1);

      let goAway = ()=>{
        if (isWeHidingTheWidgets) {
          g.reset().clearRect(0,0,g.getWidth(),24);
          WIDGET_UTILS_SHOW();
          isWeHidingTheWidgets = false;
        } else if (Bangle.uiRedraw) {
          Bangle.uiRedraw();
        } else {
          Bangle.load();
        }
        timeout = undefined;
      };
      timeout = setTimeout(goAway, 3*1000);
    }
  };
  Bangle.on("musicVolume", onMusicVolume);
  //GB({t:"audio",v:66});
}
