(function() {
  let config = require("Storage").readJSON("worldclkinfo.config.json") || {};

  // Read settings
  var settings = Object.assign({
    // Default values
    shorten: true,
    showMeridians: true,
    shortenMeridians:false,
  }, require("Storage").readJSON("worldclkinfo.settings.json", true) || {});

  let clocks = {
    name: "World Clocks",
    items: []
  };

  if (config.rows) {
    config.rows.forEach((row, id) => {
      clocks.items.push({
        // Use the short name if the user hasn't set a long name
        name: "WC " + (row.name || row.shortname),
        show: function() {
          this.interval = setTimeout(() => {
            // Request a re-draw
            this.emit("redraw");
            // Call ourself to request again in a minute
            this.show();
          // Time between now and the next minute mark
          }, 60000 - (Date.now() % 60000));
        },
        hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        },
        run: function() {
          // Default to mode 1, and wrap when going past mode 5
          if ( config.rows[id].mode === 5 || config.rows[id].mode == null) {
             config.rows[id].mode = 1;
          } else {
             config.rows[id].mode += 1;
          }
          // Request a re-draw when tapped to display the new mode
          this.emit("redraw");
          require("Storage").writeJSON("worldclkinfo.config.json", config);
        },
        get: () => {
          let d = new Date();
          // Get UTC/GMT by adding our current offset.
          let gmt = new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
          // Add the row's offset
          let dx = new Date(gmt.getTime() + row.offset * 60 * 60 * 1000);
          // Get the meridian if our locale has it (24h locales won't)
          var meridian = require("locale").meridian(dx);
          // Strip the extra spaces
          let odx = require("locale").time(dx, 1).replace(" ", "");

          // If the setting is enabled and our locale has a meridian text
          if(settings.showMeridians && meridian){
            if(settings.shortenMeridians){
              //get A - am, or P - pm
              odx = odx + meridian[0]
            } else {
              odx = odx + " " + meridian
            }
          }

          // Day of week
          let odd = require('locale').dow(dx, 1);
          // If we should shorten the cityname and a short version exists, or if only a short version exists,
          //   show the short version.
          let ln = ((settings.shorten && row.shortname) || (row.shortname && !row.name)) ? row.shortname : row.name;
          let txt = "";
          switch ( config.rows[id].mode) {
            case 2:
              txt = odx + " " + odd;
              break;
            case 3:
              txt = ln + " " + odx;
              break;
            case 4:
              txt = ln + " " + odx + " " + odd;
              break;
            case 5:
              txt = ln;
              break;
            default:
              txt = odx;
          }
          return {
            text: txt,
            short: odx,
            img: atob("GBiBAAD/AAPnwAbDYBiBGBEAiD///H///kMAwsIAQ4IAQYIAQf///////4IAQYIAQcIAQ0MAwn///j///BEAiBiBGAbDYAPnwAD/AA==")
          };
        }
      });
    });
  }

  return clocks;
})
