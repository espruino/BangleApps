(function() {
    var agendaItems = {
        name: "Agenda",
        img: atob("GBiBAf////////85z/AAAPAAAPgAAP////AAAPAAAPAAAPAAAOAAAeAAAeAAAcAAA8AAAoAABgAADP//+P//8PAAAPAAAPgAAf///w=="),
        items: []
      };

      var now = new Date();
      var agenda = storage.readJSON("android.calendar.json")
              .filter(ev=>ev.timestamp + ev.durationInSeconds > now/1000)
              .sort((a,b)=>a.timestamp - b.timestamp);

      agenda.forEach((entry, i) => {

        var title = entry.title.slice(0,18);
        var date = new Date(entry.timestamp*1000);
        var dateStr = locale.date(date).replace(/\d\d\d\d/,"");
        dateStr += entry.durationInSeconds < 86400 ? "/ " + locale.time(date,1) : "";

        agendaItems.items.push({
          name: "agendaEntry-" + i,
          get: () => ({ text: title + "\n" + dateStr, img: null}),
          show: function() { agendaItems.items[i].emit("redraw"); },
          hide: function () {}
        });
      });

    return agendaItems;
})