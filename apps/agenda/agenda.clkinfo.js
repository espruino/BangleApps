(function() {
  function getPassedSec(date) {
    var now = new Date();
    var passed = (now-date)/1000;
    if(passed<0) return 0;
    return passed;
  }
  var agendaItems = {
      name: "Agenda",
      img: atob("GBiBAAAAAAAAAADGMA///w///wf//wAAAA///w///w///w///x///h///h///j///D///X//+f//8wAABwAADw///w///wf//gAAAA=="),
      dynamic: true,
      items: []
    };
  var locale = require("locale");
  var now = new Date();
  var agenda = require("Storage").readJSON("android.calendar.json")
          .filter(ev=>ev.timestamp + ev.durationInSeconds > now/1000)
          .sort((a,b)=>a.timestamp - b.timestamp);

  agenda.forEach((entry, i) => {

    var title = entry.title.slice(0,12);
    var date = new Date(entry.timestamp*1000);
    var dateStr = locale.date(date).replace(/\d\d\d\d/,"");
    var shortStr = ((date-now) > 86400000 || entry.allDay) ? dateStr : locale.time(date,1);
    dateStr += entry.durationInSeconds < 86400 ? "/ " + locale.time(date,1) : "";

    agendaItems.items.push({
      name: "Agenda "+i,
      hasRange: true,
      get: () => ({ text: title + "\n" + dateStr,
        img: agendaItems.img, short: shortStr.trim(),
        v: getPassedSec(date), min: 0, max: entry.durationInSeconds}),
      show: function() {},
      hide: function () {}
    });
  });

  return agendaItems;
})
