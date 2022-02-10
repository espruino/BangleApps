/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  // default to buzzing
  let type = (require("Storage").readJSON("widchime.json", 1) || {type: 1}).type|0
  const chimes = ["Off", "Buzz", "Beep", "Both"]
  const menu = {
    "": {"title": "Hour Chime"},
    "< Back": back,
    "Chime Type": {
      value: type,
      min: 0, max: 2, // both is just silly
      format: v => chimes[v],
      onchange: function(v) {
        type = v
        require("Storage").write("widchime.json", {type: v})
      },
    },
  }
  E.showMenu(menu)
})
