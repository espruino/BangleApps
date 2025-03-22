{
  let timeout;
  let onMusicVolume = (volPercent)=>{
    if (timeout) {clearTimeout(timeout); timeout=undefined;}

    if (Bangle.CLOCK) {
      let barWidth = g.getWidth()*volPercent/100;
      g.
        setColor(0x0000).fillRect(0,0,g.getWidth(),24).
        setColor(0xF800).fillRect(0,0,barWidth,19).
        setColor(0xFFFF).setFont("12x20").setFontAlign(1,-1).
        drawString("volume",barWidth,1);

      let goAway = ()=>{
        let isAllWidgetsHidden = true;
        if (global.WIDGETS) {
          for (var w of global.WIDGETS) {
            if (!w._draw) {
              isAllWidgetsHidden = false;
              break;
            }
          }
        }
        if (!isAllWidgetsHidden) {
          Bangle.drawWidgets();
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
  //GB({t:"audio",v:10});
}
