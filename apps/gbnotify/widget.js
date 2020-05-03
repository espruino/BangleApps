(() => {

  let offset = 0;

  function store(e) {
    const s = require("Storage");
    const db = s.readJSON("gbnotify.json", true) || [];
    if (db.unshift(e) > 5) {
      db.pop();
    }
    s.writeJSON("gbnotify.json", db)
  }

  function show(e) {

    Bangle.setLCDPower(1);

    let src = e.src ? e.src : "";
    let title = e.title ? e.title : "";
    let body = e.body ? e.body : "";

    const maxChars = 35;
    let row = 1;
    let words = body.trim().replace("\n", " ").split(" ");
    body = "";
    for (var i = 0; i < words.length && row < 5; i++) {
      if (body.length + words[i].length + 1 > row * maxChars) {
        body = body + "\n " + words[i];
        row++;
      } else {
        body = body + " " + words[i];
      }
    }

    let oldMode = Bangle.getLCDMode();
    Bangle.setLCDMode("direct");
    g.setClipRect(0, 240, 239, 319);
    g.setBgColor(0x0000).clearRect(0, 240, 239, 319);

    g.setColor(0x39C7).drawLine(0, 317, 239, 317).fillRect(5, 240, 234, 264);

    g.setColor(-1).setFontAlign(1, -1, 0).setFont("6x8", 1);
    g.drawString(src.trim().substring(0, 10), 225, 244);

    g.setFontAlign(-1, -1, 0).setFont("6x8", 2);
    g.drawString(title.trim().substring(0, 13), 15, 244);
    g.setFont("6x8", 1);
    g.drawString(body, 0, 270);
    Bangle.setLCDMode(oldMode);

    function anim() {
      offset -= 7;
      if (offset < -80) offset = -80;
      Bangle.setLCDOffset(offset);
      if (offset > -80) setTimeout(anim, 15);
    }
    anim();
  }

  function hide() {
    function anim() {
      offset += 7;
      if (offset > 0) offset = 0;
      Bangle.setLCDOffset(offset);
      if (offset < 0) setTimeout(anim, 10);
    }
    anim();
  }

  Bangle.on("touch", () => {
    if (offset) hide();
  });

  var _GB = global.GB;
  global.GB = (event) => {
    if (event.t === "notify") {
      store(event);
      if (!Bangle.isLCDOn()) Bangle.buzz();
      show(event);
    }
    if(_GB)setTimeout(_GB,0,event);
  };

  WIDGETS["mywidget"] = {
    area: "tl",
    width: 24,
    draw: () => { }
  };
})()
