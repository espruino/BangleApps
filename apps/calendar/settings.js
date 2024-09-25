(function (back) {
  const FILE = "calendar.json";
  const HOLIDAY_FILE = "calendar.days.json";
  const settings = require('Storage').readJSON(FILE, true) || {};
  if (settings.ndColors === undefined) {
    if (process.env.HWVERSION == 2) {
      settings.ndColors = true;
    } else {
      settings.ndColors = false;
    }
  }
  const holidays = (require("Storage").readJSON(HOLIDAY_FILE,1)||[]).sort((a,b) => new Date(a.date) - new Date(b.date)) || [];

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  function writeHolidays() {
    holidays.sort((a,b) => new Date(a.date) - new Date(b.date));
    require('Storage').writeJSON(HOLIDAY_FILE, holidays);
  }

  function formatDate(d) {
    return d.getFullYear() + "-" + (d.getMonth() + 1).toString().padStart(2, '0') + "-" + d.getDate().toString().padStart(2, '0');
  }

  const editdate = (i) => {
    const holiday = holidays[i];
    const date = new Date(holiday.date);
    //const dateStr = require("locale").date(date, 1);
    const menu = {
      "": { "title" : holiday.name},
      "< Back": () => {
        writeHolidays();
        editdates();
      },
      /*LANG*/"Day": {
        value: date ? date.getDate() : null,
        min: 1,
        max: 31,
        wrap: true,
        onchange: v => {
          date.setDate(v);
          holiday.date = formatDate(date);
        }
      },
      /*LANG*/"Month": {
        value: date ? date.getMonth() + 1 : null,
        format: v => require("date_utils").month(v),
        onchange: v => {
          date.setMonth((v+11)%12);
          holiday.date = formatDate(date);
        }
      },
      /*LANG*/"Year": {
        value: date ? date.getFullYear() : null,
        min: 1900,
        max: 2100,
        onchange: v => {
          date.setFullYear(v);
          holiday.date = formatDate(date);
        }
      },
      /*LANG*/"Name": () => {
        require("textinput").input({text:holiday.name}).then(result => {
          holiday.name = result;
          editdate(i);
        });
      },
      /*LANG*/"Type": {
        value: function() {
          switch(holiday.type) {
            case 'h': return 0;
            case 'o': return 1;
          }
          return 0;
        }(),
        min: 0, max: 1,
        format: v => [/*LANG*/"Holiday", /*LANG*/"Other"][v],
        onchange: v => {
          holiday.type = function() {
            switch(v) {
              case 0: return 'h';
              case 1: return 'o';
            }
          }();
        }
      },
      /*LANG*/"Repeat": {
        value: !!holiday.repeat,
        format: v => v ? /*LANG*/"Yearly" : /*LANG*/"Never",
        onchange: v => {
          holiday.repeat = v ? 'y' : undefined;
        }
      },
      /*LANG*/"Delete": () => E.showPrompt(/*LANG*/"Delete" + " " + menu[""].title + "?").then(function(v) {
          if (v) {
            holidays.splice(i, 1);
            writeHolidays();
            editdates();
          } else {
            editday(i);
          }
        }
      ),
    };
    try {
      require("textinput");
    } catch(e) {
      // textinput not installed
      delete menu[/*LANG*/"Name"];
    }

    E.showMenu(menu);
  };

  const editdates = () => {
    const menu = holidays.map((holiday,i) => {
      const date = new Date(holiday.date);
      const dateStr = require("locale").date(date, 1);
      return {
        title: dateStr + ' ' + holiday.name,
        onchange: v => setTimeout(() => editdate(i), 10),
      };
    });

    menu[''] = { 'title': 'Holidays' };
    menu['< Back'] = ()=>settingsmenu();
    E.showMenu(menu);
  };

  const settingsmenu = () => {
    E.showMenu({
      "": { "title": "Calendar" },
      "< Back": () => back(),
      'B2 Colors': {
        value: settings.ndColors,
        onchange: v => {
          settings.ndColors = v;
          writeSettings();
        }
      },
      /*LANG*/"Edit Holidays": () => editdates(),
      /*LANG*/"Add Holiday": () => {
        holidays.push({
          "date":formatDate(new Date()),
          "name":/*LANG*/"New",
          "type":'h',
        });
        editdate(holidays.length-1);
      },
    });
  };
  settingsmenu();
})
