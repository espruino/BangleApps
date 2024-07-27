(function(back) {

  var dows = require("date_utils").dows(0,1);
  var months = require("date_utils").months(1);

  var settings = Object.assign({
    has_dst: false,
    show_icon: true,
    tz: 0,
    dst_size: 1,
    dst_start: {
      dow_number: 4, // "1st", "2nd", "3rd", "4th", "last"
      dow: 0,        // "Sun", "Mon", ...
      month: 2,
      day_offset: 0,
      at: 1
    },
    dst_end: {
      dow_number: 4,
      dow: 0,
      month: 9,
      day_offset: 0,
      at: 2
    }
  }, require("Storage").readJSON("widdst.json", true) || {});

  var dst_start_end = {
    is_start: true,
    day_offset: 0,
    dow_number: 0,
    dow: 0,
    month: 0,
    at: 0
  };

  var writtenSettings = false;

  function writeSettings() {
    require('Storage').writeJSON("widdst.json", settings);
    writtenSettings = true;
  }

  function writeSubMenuSettings() {
    if (dst_start_end.is_start) {
      settings.dst_start.day_offset = dst_start_end.day_offset;
      settings.dst_start.dow_number = dst_start_end.dow_number;
      settings.dst_start.dow = dst_start_end.dow;
      settings.dst_start.month = dst_start_end.month;
      settings.dst_start.at = dst_start_end.at;
    } else {
      settings.dst_end.day_offset = dst_start_end.day_offset;
      settings.dst_end.dow_number = dst_start_end.dow_number;
      settings.dst_end.dow = dst_start_end.dow;
      settings.dst_end.month = dst_start_end.month;
      settings.dst_end.at = dst_start_end.at;
    }
    writeSettings();
  }

  function hoursToString(h) {
    return (h|0) + ':' + (((6*h)%6)|0) + (((60*h)%10)|0);
  }

  function getDSTStartEndMenu(start) {
    dst_start_end.is_start = start;
    if (start) {
      dst_start_end.day_offset = settings.dst_start.day_offset;
      dst_start_end.dow_number = settings.dst_start.dow_number;
      dst_start_end.dow = settings.dst_start.dow;
      dst_start_end.month = settings.dst_start.month;
      dst_start_end.at = settings.dst_start.at;
    } else {
      dst_start_end.day_offset = settings.dst_end.day_offset;
      dst_start_end.dow_number = settings.dst_end.dow_number;
      dst_start_end.dow = settings.dst_end.dow;
      dst_start_end.month = settings.dst_end.month;
      dst_start_end.at = settings.dst_end.at;
    }
    return {
      "": {
        "Title": start ? /*LANG*/"DST Start" : /*LANG*/"DST End"
      },
      "< Back": () => E.showMenu(dstMenu),
      /*LANG*/"The" : {
        value: dst_start_end.dow_number,
        format: v => [/*LANG*/"1st",/*LANG*/"2nd",/*LANG*/"3rd",/*LANG*/"4th",/*LANG*/"last"][v],
        min: 0,
        max: 4,
        onchange: v => {
          dst_start_end.dow_number = v;
          writeSubMenuSettings();
        }
      },
      " -" : {
        value: dst_start_end.dow,
        format: v => dows[v],
        min:0,
        max:6,
        onchange: v => {
          dst_start_end.dow = v;
          writeSubMenuSettings();
        }
      },
      /*LANG*/"of": {
        value: dst_start_end.month,
        format: v => months[v],
        min: 0,
        max: 11,
        onchange: v => {
          dst_start_end.month = v;
          writeSubMenuSettings();
        }
      },
      /*LANG*/"minus" : {
        value: dst_start_end.day_offset,
        format: v => v + ((v == 1) ? /*LANG*/" day" : /*LANG*/" days"),
        min: 0,
        max: 7,
        onchange: v => {
          dst_start_end.day_offset = v;
          writeSubMenuSettings();
        }
      },
      /*LANG*/"at": {
        value: dst_start_end.at,
        format: v => hoursToString(v),
        min: 0,
        max: 23,
        // step: 0.05, // every 3 minutes - FOR DEVELOPMENT PURPOSES
        onchange: v => {
          dst_start_end.at = v;
          writeSubMenuSettings();
        }
      }
    }
  }

  var dstMenu = {
    "": {
      "Title": /*LANG*/"Daylight Saving"
    },
    "< Back": () => {
      if(writtenSettings && global._load){
        // disable fastload to ensure settings are applied
        // when we exit the settings app
        global.load = global._load;
        delete global._load;
      }
      back();
    },
    /*LANG*/"Enabled": {
      value: !!settings.has_dst,
      onchange: v => {
        settings.has_dst = v;
        writeSettings();
      }
    },
    /*LANG*/"Icon": {
      value: !!settings.show_icon,
      onchange: v => {
        settings.show_icon = v;
        writeSettings();
      }
    },
    /*LANG*/"Base TZ": {
      value: settings.tz,
      format: v => (v >= 0 ? '+' + hoursToString(v) : '-' + hoursToString(-v)),
      onchange: v => {
        settings.tz = v;
        writeSettings();
      },
      min: -13,
      max: 13,
      step: 0.25
    },
    /*LANG*/"Change": {
      value: settings.dst_size,
      format: v => (v >= 0 ? '+' + hoursToString(v): '-' + hoursToString(-v)),
      min: -1,
      max: 1,
      step: 0.5,
      onchange: v=> {
        settings.dst_size = v;
        writeSettings();
      }
    },
    /*LANG*/"DST Start": () => E.showMenu(getDSTStartEndMenu(true)),
    /*LANG*/"DST End": () => E.showMenu(getDSTStartEndMenu(false))
  };

  E.showMenu(dstMenu);

});
