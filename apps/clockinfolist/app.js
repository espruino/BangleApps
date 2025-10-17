Bangle.loadWidgets();
Bangle.drawWidgets();

var menu = {
  "": {
    title: "Clockinfo List",
    back: function() { load(); },
  }
}

function showItem(item, menu) {
  console.log(JSON.stringify(item));
  E.showPrompt(item.get().text, {
    title: item.name,
    buttons: { "Back": false, "Run": true },
    img: item.get().img
  }).then((v) => {
    if (v) {
      item.run();
      showItem(item, menu);
    } else {
      E.showMenu(menu);
    }
  });
}

var ci = require("clock_info").load()
for (let i = 0; i < ci.length; i++) {
  let n = ci[i].name;
  menu[n] = function(n, i) {
    let ci_s = ci[i].items;
    let menu_s = {}
    for (let ii = 0; ii < ci_s.length; ii++) {
      let i_s = ci_s[ii];
      menu_s[i_s.name] = showItem.bind(this, i_s, menu_s)
    }
    menu_s[""] = {
      back: function() { E.showMenu(menu); },
      title: n
    };
    E.showMenu(menu_s)
  }.bind(this, n, i);
}
E.showMenu(menu)
