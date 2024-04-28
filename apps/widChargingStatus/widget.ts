(() => {
  const icon = require('heatshrink').decompress(
    atob(
      'ikggMAiEAgYIBmEAg4EB+EAh0AgPggEeCAIEBnwQBAgP+gEP//x///j//8f//k///H//4BYOP/4lBv4bDvwEB4EAvAEBwEAuA7DCAI7BgAQBhEAA'
    )
  );
  const iconWidth = 18;

  function draw(this: { x?: number; y?: number }) {
    g.reset();
    if (Bangle.isCharging()) {
      g.setColor('#FD0');
      g.drawImage(icon, this.x! + 1, this.y! + 1, {
        scale: 0.6875,
      });
    }
  }

  // @ts-ignore
  WIDGETS.chargingStatus = {
    area: 'tr',
    width: Bangle.isCharging() ? iconWidth : 0,
    draw: draw,
  };

  Bangle.on('charging', (charging) => {
    // @ts-ignore
    const widget = WIDGETS.chargingStatus;
    if (widget) {
      if (charging) {
        Bangle.buzz();
        widget.width = iconWidth;
      } else {
        Promise.resolve().then(() => require("buzz").pattern("..;"));
        widget.width = 0;
      }
      Bangle.drawWidgets(); // re-layout widgets
      g.flip();
    }
  });
})();
