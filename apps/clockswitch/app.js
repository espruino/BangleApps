const storage = require('Storage');
const clocks = storage.list(/\.info$/)
    .map(app => {
        const a=storage.readJSON(app, 1);
        return (a && a.type == "clock") ? a : undefined;
    })
    .filter(app => app) // filter out any undefined apps
    .sort((a, b) => a.sortorder - b.sortorder)
  .map(app => app.src);
if (clocks.length<1) {
  E.showAlert(/*LANG*/"No clocks found!", "Clock Switcher")
    .then(load);
} else if (clocks.length<2) {
  E.showAlert(/*LANG*/"Nothing to do:\nOnly one clock installed!", "Clock Switcher")
    .then(load);
} else {
  let settings = storage.readJSON('setting.json',true)||{clock:null};
  const old = clocks.indexOf(settings.clock),
        next = (old+1)%clocks.length;
  settings.clock = clocks[next];
  storage.writeJSON('setting.json', settings);
  setTimeout(load, 100); // storage.writeJSON needs some time to complete
}
