declare var Bangle: any;
declare var g: any;
declare var E: any;
declare var require: any;

g.clear();

let now = new Date();
import { hebrewDate } from "./hebrewDate";

let today = hebrewDate(now);

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
