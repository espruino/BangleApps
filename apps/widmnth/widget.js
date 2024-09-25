
(() => {
  var days_left;
  var clearCode;

  function getDaysLeft(day) {
    let year = day.getMonth() == 11 ? day.getFullYear() + 1 : day.getFullYear(); // rollover if december.
    const next_month = new Date(year, (day.getMonth() + 1) % 12, 1, 0, 0, 0);
    let days_left = Math.floor((next_month - day) / 86400000); // ms left in month divided by ms in a day
    return days_left;
  }

  function getTimeTilMidnight(now) {
    let midnight = new Date(now.getTime());
    midnight.setHours(23);
    midnight.setMinutes(59);
    midnight.setSeconds(59);
    midnight.setMilliseconds(999);
    return (midnight - now) + 1;
  }

  function update() {
    let now = new Date();
    days_left = getDaysLeft(now);
    let ms_til_midnight = getTimeTilMidnight(now);
    clearCode = setTimeout(update, ms_til_midnight);
  }

  function draw() {
    g.reset();
    g.setFont("4x6", 3);
    if(!clearCode) update(); // On first run calculate days left and setup interval to update state.
    g.drawString(days_left < 10 ? "0" + days_left : days_left.toString(), this.x + 2, this.y + 4);
  }

  // add your widget
  WIDGETS.widmonthcountdown={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: 24,
    draw:draw
  };
})();