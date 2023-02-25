WIDGETS["lockunlock"] = {
  area: (() => {
    const settings = require("Storage")
      .readJSON("lockunlock.settings.json", true) || {};
    return settings.location ?? "tl";
  })(),
  sortorder: 10,
  width: 14,
  draw: w => {
    g.reset()
      .drawImage(
        atob(Bangle.isLocked()
        ? "DBGBAAAA8DnDDCBCBP////////n/n/n//////z/A"
        : "DBGBAAAA8BnDDCBABP///8A8A8Y8Y8Y8A8A//z/A"),
        w.x! + 1,
        w.y! + 3
      );
  },
};

Bangle.on("lock", () => Bangle.drawWidgets());

Bangle.on("touch", (_btn, e) => {
  const oversize = 5;

  if (!e) return;
  const { x, y } = e;

  const w = WIDGETS["lockunlock"]!;

  if(w.x! - oversize <= x && x < w.x! + 14 + oversize
  && w.y! - oversize <= y && y < w.y! + 24 + oversize)
  {
    Bangle.setLocked(true);

    const { backlightTimeout } = Bangle.getOptions(); // ms

    // seems to be a race/if we don't give the firmware enough time,
    // it won't timeout the backlight and we'll restore it in our setTimeout below
    Bangle.setOptions({ backlightTimeout: 100 });

    setTimeout(() => {
      Bangle.setOptions({ backlightTimeout });
    }, 300);
  }
});
