(function() {
  var agendaItems = {
    name: "Agenda",
    img: atob("GBiBAAAAAAAAAADGMA///w///wf//wAAAA///w///w///w///x///h///h///j///D///X//+f//8wAABwAADw///w///wf//gAAAA=="),
    dynamic: true,
    items: []
  };
  var storage = require("Storage");
  var locale = require("locale");
  var now = new Date();
  var agenda = (storage.readJSON("android.calendar.json",true)||[])
    .filter(ev=>ev.timestamp + ev.durationInSeconds > now/1000)
    .sort((a,b)=>a.timestamp - b.timestamp);
  var settings = storage.readJSON("agenda.settings.json",true)||{};

  agenda.forEach((entry, i) => {
    var title = entry.title.slice(0,12);
    var date = new Date(entry.timestamp*1000);
    var dateStr = locale.date(date).replace(/\d\d\d\d/,"");
    var dateStrToday = locale.date(new Date()).replace(/\d\d\d\d/,"");
    var timeStr = locale.time(date);
    //maybe not the most efficient..
    var shortTxt = (dateStrToday == dateStr) ? timeStr : dateStr;
    dateStr += entry.durationInSeconds < 86400 ? "/ " + locale.time(date,1) : "";

    if(!settings.pastEvents && entry.timestamp + entry.durationInSeconds < (new Date())/1000)
      return;

    agendaItems.items.push({
      name: null,
      get: () => ({ text: title + "\n" + dateStr, short: shortTxt, img: null}),
      show: function() { agendaItems.items[i].emit("redraw"); },
      hide: function () {}
    });
  });

  return agendaItems;
})
