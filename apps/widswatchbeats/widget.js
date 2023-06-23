(function() {
  const WIDTH = 50;
  const SEC_PER_BEAT = 86.4;

  let drawTimeout;

  function getSecondsSinceMidnight() {
    const now = new Date();
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  }

  function queueDraw() {
    if (drawTimeout) clearTimeout(drawTimeout);
    const nextSecond = SEC_PER_BEAT - (getSecondsSinceMidnight() % SEC_PER_BEAT);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      WIDGETS.widswatchbeats.draw();
    }, nextSecond * 1000 + 1); // Add one ms to ensure we're past the beat
  }

  function draw() {
    const now = new Date();
    const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const beats = Math.floor(seconds / SEC_PER_BEAT);
    const beatsString = '@' + beats.toString().padStart(3, '0');

    g.reset();
    g.setFontAlign(0, 0);
    g.clearRect(this.x, this.y, this.x + WIDTH, this.y+22);
    g.setFont("6x8", 2);
    g.drawString(beatsString, this.x+WIDTH/2, this.y+12);
    queueDraw();
  }

  WIDGETS.widswatchbeats = {
    area: "tl",
    width: WIDTH,
    draw
  };

})();
