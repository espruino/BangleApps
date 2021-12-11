g.clear();

let now = new Date();

let today = require('hebrewDate').hebrewDate(now);

var mainmenu = {
  "": {
    "title": "Hebrew Date"
  },
  greg: {
    // @ts-ignore
    value: require('locale').date(now, 1),
  },
  date: {
    value: today.date,
  },
  month: {
    value: today.month_name,
  },
  year: {
    value: today.year,
  }
};
// @ts-ignore
E.showMenu(mainmenu);