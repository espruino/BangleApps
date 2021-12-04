g.clear();

let now = new Date();
let today = require("hebrewDate")(now);

var mainmenu = {
  "" : {
    "title" : "Hebrew Date"
  },
  cal: {
    value: require('locale').date(now,1),
    onchange : () => {}
  },
  date: {
    value : today.date,
    onchange : () => {}
  },
  month: {
    value : today.month_name,
    onchange : () => {}
  },
  year: {
    value : today.year,
    onchange : () => {}
  }
};
E.showMenu(mainmenu);
