/*
 * SnepWatch - Bangle JS 2 Port
 * JoppyFurr 2023
 */

{
  Graphics.prototype.setFontTerminus_14 = function (scale) {
    g.setFontCustom (atob ("AB/oJhGIZBf4AAAAAgUB/8AQBAAAGDgWCYRiFwQAABhoBiGIYhd4AAABgKBIIhCP/AAAPiiGIYhiGHgAAA/khiGIYhB4AAAgCAIHhiYOAAAAHeiGIYhiF3gAAB4IRhGEYSfwAEAoOjEyMXBQCAA="), 48, 8, 10);
  };

  Graphics.prototype.setFontTerminus_18 = function (scale) {
    /* TODO: Strip out unused characters - Eg, encode zero-width */
    g.setFontCustom (E.toString (require ("heatshrink").decompress (atob ("AH4A/AH4AnoEHBpcgB4MAwEBgECgEEgEIItf/4UEokQxFBiMCkkEn/wCY0CgMIgU//hHCiAQGh0GkEUoFIwMRgkiiFD4GACQkwmGAiMIBwNEkA7Bh98EoqPBiUAog6BgkQiEgv/4CIvjhFBiGCkMEoUIwkRg/ACQv8IoIODHYVAj43FuC4EgfEjEI4EeOA334RZEHYc9SosD8EIkMQoUgwlBhGCkH/QQoA/AH6VD/+IkDHBkGAoMAwUA//gEq8/+GAiMAkUAokAxEBhkMCIkB//iBwkQgUQhEfG7Ef/0hgFCgGEgMIgUAgip/AAM4gEIgEQQwVH/4HBAFEH/+EgEGcwIDCmEAwDtB4CVERgIBGDoOAcB8P/jgHhEEbYMgiFAkGAnylrnkwwkRhEiiFEkGIoMMvhKFgD+Dh//XYMggFAJVd//AxBgOAhkAjEAAYMEn6XFAH4A/AE8PgMhgVCgmEhMIiUQj/gCIkf/0EgkIhEQiEgkFAoF/EgsH+AOFwGBgMBggSFj/ABwkCgQsBfwQAEv8BiMCkUEokIxERiEeoBvXJQUSkEkoFIwGRgMj/+ACIcB//gFoOAgMAgUALQMHJQwACLIM3/kAhC6bO4I0DhUAkUAwQsBCpBEBx//CwQAagbgBLAUQgEggB3Bv6CEcBh1BAAk//jgIDoJKZQQJMBJQpJFACodCh/+JQbRHUQLwFQ4U/8BKFH4PAgFggEwgOAhkACIoAmJQUggVAgmAhMAiU//AiVO4MEiEEoEFgFEoFBAYMAqCOCgE+gC6BAIkH/Ef8E/wAOBAAI="))), 32, 10, 15);
  };

  Graphics.prototype.setFontDigits = function (scale) {
    g.setFontCustom (E.toString (require ("heatshrink").decompress (atob ("AEE//4AC4EDAof8Bid8EQMB+ED8/AAwMfgE+BisD8AMEnwIBBisHBAQMCCoYMUh+ABgn4AoIMUTbIMGAH4AhdoKOC8DtBAwTYBBiQHBBgbtCBi1/VAf/84FE/wMSFYZNDAAY4EBmoA7n7PCg/+gf/BQV/8AMSvgLCh+D8/AAwX4nwMWj6OBBgUB+EDBiysBBgasCBiwIDAYMHCoQMTRwP4dIc//+ABiz/8AAbpD//AewcP/gMTdIaOEAAT2EBiLCdBn7pDeQKOC/+D/6bDBiIA/YwbyCAATyDBikH4IMEvkfBi0PwAME/EBBiwDBBgYDCBi0+BAZrB8AMXv7tBAAXnAon+BiQrBAH0HIYP8AgPAJoXAbAIMTvgDCSYPnCASTCBn4M2gE/RQIQDS4QMSf/gAEgJLBeQcfAoRNBBiUD8BwD8E+RwgMSdP4MhUgTpFewYMVAHprCAAZrCBnf//wMDh//WoQMTn/waYn/GYgMRh7GDBgLTDBid/FQQMC/4qBBioA/QoX/wf/OAKSB/AIBOAIMSRwKxDZ4SxCnwM/BmibZBgwA/JoREDJoJRBBiqFDRwkD8CbDBn4MWeQIMEvj6DBh6OCAAOARwQAB/CbDBiAA/AH4ACh/8gEH/wGB/6xBv7YBBiYA/AH4A=="))), 48, 40, 52);
  };

  Graphics.prototype.setFontOutline = function (scale) {
    g.setFontCustom (E.toString (require ("heatshrink").decompress (atob ("ADMD/4AC/kAoALDkEEAocCBhkH4AGDn2DEgP+h/8jEgC4WAoOCC4UIggMJnwMEgkfgAMDoIIBBgcQBhV8BgkInwMECoYMCEQQMI/AMEiF8BgcBOwQMDQYQMHn/wv59B4IdCVoXgVDEAn7JDVogA/ACEB+AECXwLtBRwUQfQIMCbAIMLSwIMEoImDoL6CBgg4DBg0X4KbD4IkCAAUYKQoMSi4lDEwILEHAhnDBmKoBAGUD/4ECv/goDPChEBgkASAWAiAMLi/ABgX4gODEwUQvkYkCzCglBwQyCiFEBhMB+AMEkH4BgcChEEBgmABhMD8AMEoPwBgasCBggIBBhEHfQIMDwfgBgcICoQMCEQYMGn//Bgd8EwPAF4VAgABBBgKbBAIIMPEwKvCnz/vAAcDbgUP/hLBdIMBW4L2DiECBhh4BBgc+wYmEbgabEAATpEBgibDWpoM/BhrcBPoP/4N8M4cD8D0BogZBTYUEBAKoCBhYmEEQIA1n/waYjyCAAT/CBh59BBgcInwMEwUgBgkiBhX4BgkQvgMDgMEgQMEoAMJgPwBgkg/AMDAYQMEwAMJa4IMEoKFBBgUEiAVDBgIiDBg0H4LaB8H//yQEgEYAokBBiUXEoIAC/z/ygF/G4PAcoKQDbAKdEbAIMSn2D//4BgN8jAQCUAQDBDoKgBBn4MqPoP/4IMBg6oBgfoCASXCDoVAS4IdDBhAdDZYYAzj44B//8c4QACKQIBBeQYMMnwMDn0Ej/4n4mBiFBTYkEiB9DBg18BgkYEwLp/BjWDUQPBvkAcofgCwL2DSQT2CAoQMMgYmBEQIAyLQIADNYQADPAQM0h//9AMCgIBBBgcQgC1CBhibBBglAEwi1BwAzDoEIcAgMEXIIMDiAmCBgI3BHgQMCaYYMGn/wBgYoBcAYoCOgYMBAIIMOg//+D/zAAZ4B/E///8SQMAogLBkCSBggIBOAIMLg54BvgMBn2DEwjPCXwVBAYK+DBn4MoPAJ9B//BQoKKCgfgVDEAEwgiBAGUDG4pEDAAJNBKIIMOPAkAnyFDTYkEiCbDAYIM/Bh18BgkInwMEwT6DBgMgBgzcB/kf/EgvitDAgKbBTIabCUwYMMEwIAB/D/wAH4AG//AgF/8EAiECgEIgMAAIK+BwDYBBiQmGAH4A5"))), 48, 40, 52);
  };

  var snepwatch_tick_timeout;
  var snepwatch_hrm_timeout;
  var snepwatch_hrm_show_timeout;
  var heart_rate = 0;
  var heart_rate_time = 0;

  /* Load settings */
  var settings = Object.assign ({
    /* Default Values */
    outline_r: 1,
    outline_g: 0,
    outline_b: 0,
    fill_r: 0.5,
    fill_g: 0,
    fill_b: 0,
    bg_r: 0,
    bg_g: 0,
    bg_b: 0,
    text: 1,
  }, require ('Storage').readJSON ("snepwatch.json", true) || {});

  /*
   * Tick once per minute.
   */
  let snepwatch_tick_queue = function () {
    if (snepwatch_tick_timeout) {
      clearTimeout (snepwatch_tick_timeout);
    }

    snepwatch_tick_timeout = setTimeout (function () {
      snepwatch_tick_timeout = undefined;
      snepwatch_tick ();
    }, 60000 - (Date.now () % 60000));
  };


  /*
   * Draw the heart rate sensor reading.
   * The reading is only shown if it is from within the last 10 seconds.
   * Assumes the Terminus_18 font is already selected.
   */
  let draw_heart_rate = function () {
    let heart_rate_string = "--";
    let hrm_show = false;

    /* As we are about to show the heart rate,
     * previously set timers are considered invalid  */
    if (snepwatch_hrm_show_timeout) {
      clearTimeout (snepwatch_hrm_show_timeout);
    }

    /* Only show the heart rate if the measurement is recent */
    if (heart_rate_time > Date.now () - 10000) {
      hrm_show = true;
      heart_rate_string = "" + heart_rate;
    }

    g.clearRect (17, 160, 88, 175);
    g.setColor (0 + settings.text, 0 + settings.text, 0 + settings.text);
    g.drawString (heart_rate_string, 17, 160);

    /* If the heart rate was shown, check back when the reading
     * would become stale so that it can be cleared. */
    if (hrm_show) {
      snepwatch_hrm_show_timeout = setTimeout (function () {
        snepwatch_hrm_show_timeout = undefined;
        draw_heart_rate ();
      }, heart_rate_time + 10000 - Date.now ());
    }
  };


  /*
   * Called once per minute.
   *
   * Updates the time, date, and battery level.
   */
  let snepwatch_tick = function () {
    /* Data */
    let days = [ "Sun ", "Mon ", "Tue ", "Wed ", "Thu ", "Fri ", "Sat " ];
    let months = [ " Jan", " Feb", " Mar", " Apr", " May", " June", " July", " Aug", " Snep", " Oct", " Nov", " Dec"];
    let date = new Date ();
    let charge_level = E.getBattery ();

    /* Clear */
    g.reset ();
    g.setBgColor (settings.bg_r, settings.bg_g, settings.bg_b);
    g.clear ();

    /* Battery level - Note, '%' is encoded as ':' */
    let battery_text = ((charge_level < 10) ? "0" : "") + charge_level + ":";
    if (charge_level <= 16) {
      g.setColor (1, 0, 0);
    } else {
      g.setColor (0, 0 + settings.text, 1);
    }
    g.setFont ("Terminus_14");
    g.drawString (battery_text, 2, 2);

    /* Date */
    let day = days [ date.getDay () ];
    let dd = date.getDate ();
    dd = ((dd < 10) ? "0" : "") + dd;
    let month = months [ date.getMonth () ];

    let date_text = day + dd + month;
    if (date_text.length < 11) {
      date_text = " " + date_text;
    }
    g.setColor (0 + settings.text, 0 + settings.text, 0 + settings.text);
    g.setFont ("Terminus_18");
    g.drawString (date_text, 65, 2);

    /* Time */
    let hours = date.getHours ();
    let minutes = date.getMinutes ();
    let time_hh = ((hours < 10) ? "0" : "") + hours;
    let time_mm = ((minutes < 10) ? "0" : "") + minutes;
    g.setColor (settings.fill_r, settings.fill_g, settings.fill_b);
    g.setFont ("Digits");
    g.drawString (time_hh, -2, 60);
    g.drawString (":", 71, 55);
    g.drawString (time_mm, 98, 60);

    g.setColor (settings.outline_r, settings.outline_g, settings.outline_b);
    g.setFont ("Outline");
    g.drawString (time_hh, -2, 60);
    g.drawString (":", 71, 55);
    g.drawString (time_mm, 98, 60);


    /* Steps so far for the day */
    let steps = Bangle.getHealthStatus ('day').steps;
    let steps_string = "" + steps;
    if (steps >= 1000) {
      steps_string = steps_string.slice (0, -3) + "," + steps_string.slice (-3);
    }

    g.setFont("Terminus_18");
    /* With dark text, use blue for the step symbol.
       With light text, use green for the step symbol. */
    g.setColor (0, 0 + settings.text, 1 - settings.text);
    g.drawString ("{", 2, 144); /* Arrows */
    g.setColor (1, 0, 0);
    g.drawString ("|", 2, 160); /* Heart */
    g.setColor (0 + settings.text, 0 + settings.text, 0 + settings.text);
    g.drawString (steps_string, 17, 144);
    draw_heart_rate ();

    /* Queue up the next tick */
    snepwatch_tick_queue ();
  };


  /* Callback for when the backlight state changes */
  let display_cb = lock => {
    if (lock) {
      /* The backlight may not run for long enough to get a good reading.
         Wait 15 seconds with the backlight off before disabling the sensor. */
      snepwatch_hrm_timeout = setTimeout (function () {
        snepwatch_hrm_timeout = undefined;
        Bangle.setHRMPower (false, "snepwatch");
      }, 15000);
    } else {
      if (snepwatch_hrm_timeout) {
        clearTimeout (snepwatch_hrm_timeout);
        snepwatch_hrm_timeout = undefined;
      }
      Bangle.setHRMPower (true, "snepwatch");
    }
  };

  /* Callback for the heart rate monitor */
  let heart_rate_cb = hrm => {
    if (hrm.bpm > 0 && hrm.confidence > 50) {
      heart_rate = hrm.bpm;
      heart_rate_time = Date.now ();
    }

    g.setFont("Terminus_18");
    draw_heart_rate ();
  };

  let previous_theme = g.theme;
  g.setTheme ( { bg:"#000", fg:"#fff", dark:true } );

  /* Initial call, will tick once per minute */
  snepwatch_tick ();
  Bangle.on ('lock', display_cb);
  Bangle.on ('HRM', heart_rate_cb);

  /* Use a swipe to show the widgets */
  Bangle.loadWidgets ();
  require ("widget_utils").swipeOn ();

  /* Allow for Fast Loading */
  Bangle.setUI ( { mode:"clock", remove:function () {
    if (snepwatch_tick_timeout) {
      if (snepwatch_tick_timeout) {
        clearTimeout (snepwatch_tick_timeout);
      }
      if (snepwatch_hrm_timeout) {
        clearTimeout (snepwatch_hrm_timeout);
      }
      if (snepwatch_hrm_show_timeout) {
        clearTimeout (snepwatch_hrm_show_timeout);
      }
      Bangle.removeListener('lcdPower', display_cb);
      Bangle.removeListener('HRM', heart_rate_cb);
      Bangle.setHRMPower (false, "snepwatch");
      delete Graphics.prototype.setFontTerminus_14;
      delete Graphics.prototype.setFontTerminus_18;
      delete Graphics.prototype.setFontDigits;
      delete Graphics.prototype.setFontOutline;
      g.setTheme (previous_theme);
      require ("widget_utils").show();
    }
  } } );
}
