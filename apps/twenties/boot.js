const buzz = _ => {
  const settings = Object.assign({
    move: 20 * 60 * 1000,
    look: 20 * 1000,
    startDay: 1,
    endDay: 5,
    startHour: 8,
    endHour: 17
  }, require('Storage').readJSON("twenties.json", true) || {});

  const date = new Date();
  const day = date.getDay();
  const hour = date.getHours();

  if (day >= settings.startDay && day <= settings.endDay &&
    hour >= settings.startHour && hour <= settings.endHour) {
    Bangle.buzz().then(_ => {
      setTimeout(Bangle.buzz, settings.look);
    });
  }
};

setInterval(buzz, settings.move);
