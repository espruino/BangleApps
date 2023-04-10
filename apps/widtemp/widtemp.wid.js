(() => {
  const width = 38;
  const max_temps_len = 10;
  let temps = [];

  function push_temp(temp, length) {
    temps.unshift(temp) > length ? temps.pop() : null;
  }

  function draw() {
    const temp = Math.round(E.getTemperature());
    const sum = temps.reduce((a, b) => a + b, 0);
    const avg = (sum / temps.length) || 0;

    g.reset();
    g.setFont("6x8", 2);
    g.clearRect(this.x, this.y, this.x + width, this.y + 18);

    if (temp > avg) {
      g.setColor("#ff0000");  // red
    } else if (temp < avg) {
      g.setColor("#0096ff");  // blue
    }

    push_temp(temp, max_temps_len);
    g.drawString(temp + "°", this.x + 3, this.y + 4);
  }

  setInterval(function() {
    WIDGETS["widtemp"].draw(WIDGETS["widtemp"]);
  }, 60000); // update every minute

  WIDGETS["widtemp"]={area:"tl", width: width, draw:draw};
})()
