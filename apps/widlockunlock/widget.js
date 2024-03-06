Bangle.on("lock", () => Bangle.drawWidgets());

Bangle.on('touch', (_btn, xy) => {
  if (WIDGETS["back"]) return;

  const oversize = 5;

  const w = WIDGETS.lockunlock;

  const x = xy.x;
  const y = xy.y;

  if(w.x - oversize <= x && x < w.x + 14 + oversize
  && w.y - oversize <= y && y < w.y + 24 + oversize)
  {
    E.stopEventPropagation && E.stopEventPropagation();

    Bangle.setLocked(true);

    const backlightTimeout = Bangle.getOptions().backlightTimeout; // ms

    // seems to be a race/if we don't give the firmware enough time,
    // it won't timeout the backlight and we'll restore it in our setTimeout below
    Bangle.setOptions({ backlightTimeout: 100 });

    setTimeout(() => {
      Bangle.setOptions({ backlightTimeout });
    }, 300);
  }
});
WIDGETS["lockunlock"]={area:"tl",sortorder:10,width:14,draw:function(w) {
  g.reset().drawImage(atob(Bangle.isLocked() ? "DBGBAAAA8DnDDCBCBP////////n/n/n//////z/A" : "DBGBAAAA8BnDDCBABP///8A8A8Y8Y8Y8A8A//z/A"), w.x+1, w.y+3);
}};
