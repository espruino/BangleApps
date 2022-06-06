(function(back) {

  var settings = Object.assign({
    "12hour": false,
  }, require('Storage').readJSON("bigdclock.json", true) || {});

  function set12hour(val) {
    settings["12hour"]=val;
    require('Storage').writeJSON("bigdclock.json", settings);
  }

  var mainmenu = {
    "": {
      "title": "BigDClock"
    },
    "< Back": () => back(),
    "Clock type": {
      value: (settings["12hour"] !== undefined ? settings["12hour"] : false),
      format: v => v ? "12 hr" : "24 hr",
      onchange: v=> { set12hour(v) }
    }
  };

  E.showMenu(mainmenu);

});
