(function() {
  let config = require("Storage").readJSON("offsetclockinfo.settings.json") || {};

  let clocks = {
    name: "Offset Clocks",
    items: []
  };

  if (config.rows) {
    config.rows.forEach((row, id) => {
      clocks.items.push({
        name: "OC " + row.name,
        show: () => {},
        hide: () => {},
        run: function() {
          if ( config.rows[id].mode === 5 || config.rows[id].mode == null) {
             config.rows[id].mode = 1;
          } else {
             config.rows[id].mode += 1;
          }
          this.emit("redraw");
          require("Storage").writeJSON("offsetclockinfo.settings.json", config);
        },
        get: () => {
          let d = new Date();
          let gmt = new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
          let dx = new Date(gmt.getTime() + row.offset * 60 * 60 * 1000);
          let odx = require("locale").time(dx, 1).replace(" ", "");
          let odd = require('locale').dow(dx, 1);
          let txt = "";
          switch ( config.rows[id].mode) {
            case 2:
              txt = odx + " " + odd;
              break;
            case 3:
              txt = row.name + " " + odx;
              break;
            case 4:
              txt = row.name + " " + odx + " " + odd;
              break;
            case 5:
              txt = row.name;
              break;
            default:
              txt = odx;
          }
          return {
            text: txt,
            short: odx,
            img: atob("GBiBAP///8AYEYB8MYA8IYA8IYA8QYA8IYA8HYO8A8J8A6I/85K/+ZO/+ZE/8bDAgZAwgYgQgYQQQYQQMYJgCYEgDYFABYDABf///w==")
          };
        }
      });
    });
  }

  return clocks;
})
