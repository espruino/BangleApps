//Binary LED Clock (BLC) by aeMKai

{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
  
    const SETTINGSFILE = "BinaryClk.settings.json";

    // variables defined from settings
    let HourCol;
    let MinCol;
    let DayCol;
    let MonCol;
    let RingOn;

    // color arrays
    // !!! don't change order unless change oder in BinaryClk.settings.js !!!
    // !!! order must correspond to each other between arrays !!!
    let LED_Colors =              ["#FFF", "#F00", "#0F0",  "#00F", "#FF0",    "#F0F",        "#0FF", "#000"];
    let LED_ColorNames = ["white", "red",     "green", "blue",   "yellow", "magenta", "cyan",   "black"];   

    // load settings
    let loadSettings = function()
    {
        function def (value, def) {return value !== undefined ? value : def;}

        var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
        // get name from setting, find index of name and assign corresponding color code by index
        HourCol = LED_Colors[LED_ColorNames.indexOf(def(settings.HourCol, "red"))]; 
        MinCol =  LED_Colors[LED_ColorNames.indexOf(def(settings.MinCol, "green"))]; 
        DayCol = LED_Colors[LED_ColorNames.indexOf(def(settings.DayCol, "yellow"))];
        MonCol = LED_Colors[LED_ColorNames.indexOf(def(settings.MonCol, "yellow"))];
        RingOn = def(settings.RingOn, true);
    
        delete settings;    // settings in local var -> no more required
    }

    let drawTimeout;

    // actually draw the watch face
    let draw = function()
    {
        // Bangle.js2 -> 176x176
        var x_rgt = g.getWidth();
        var y_bot = g.getHeight();
        //var x_cntr = x_rgt / 2;
        var y_cntr = y_bot / 18*7;      
        g.reset().clearRect(Bangle.appRect); // clear whole background (w/o widgets)

        var white = "#FFF";
        var black = "#000";
        var bord_col = white;
        var col_off = black;

        var col = new Array(HourCol, MinCol, DayCol, MonCol);  // each #rgb
        if (g.theme.dark)
        {
            bord_col = white;
            col_off = black;
        }
        else
        {
            bord_col = black;   
            col_off = white;
        }

        let pwr2 = [1, 2, 4, 8, 16, 32];        // array with powers of 2, because poweroperator '**' doesnt work
                                                                            // maybe also faster


        var no_lines = 4;   // 4 rows: hour (hr), minute (min), day (day), month (mon)
        var no_hour = 5;  
        var no_min = 6;
        var no_day = 5;
        var no_mon = 4; 

        // arrays: [hr, min, day, mon]
        let msbits = [no_hour-1, no_min-1, no_day-1, no_mon-1];  // MSB = No bits - 1
        let rad = [13, 13, 9, 9];                // radiuses for each row
        var x_dist = 29;
        let y_dist = [0, 35, 75, 100];     // y-position from y_centr for each row from top
                                                                        // don't calc. automatic as for x, because of different spaces
        var x_offs_rgt = 15;                        // offset from right border (layout)
        var y_offs_cntr = 25;                   // vertical offset from center

        ////////////////////////////////////////
        // compute bit-pattern from time/date and draw leds
        ////////////////////////////////////////

        // date-time-array: 4x6 bit
        //var idx_hour = 0;
        //var idx_min = 1;
        //var idx_day = 2;
        //var idx_mon = 3;
        var dt_bit_arr = [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]];

        var date_time = new Date();
        var hour = date_time.getHours();            // 0..23
        var min = date_time.getMinutes();    // 0..59
        var day = date_time.getDate();              // 1..31
        var mon = date_time.getMonth() + 1;  // GetMonth() -> 0..11

        let dt_array = [hour, min, day, mon];

        var line_cnt = 0;
        var cnt = 0;
        var bit_cnt = 0;

        while (line_cnt < no_lines)
        {
            
            ////////////////////////////////////////
             // compute bit-pattern
            bit_cnt = msbits[line_cnt];

            while (bit_cnt >= 0)
            {
              if (dt_array[line_cnt] >= pwr2[bit_cnt]) 
              {
                dt_array[line_cnt] -= pwr2[bit_cnt];
                dt_bit_arr[line_cnt][bit_cnt] = 1;
              }
              else
              {
                dt_bit_arr[line_cnt][bit_cnt] = 0;
              }
              bit_cnt--;
            }
            
            ////////////////////////////////////////
            // draw leds (and border, if enabled)
            cnt = 0;

            while (cnt <= msbits[line_cnt])
            {
                if (RingOn) // draw outer ring, if enabled
                {
                    g.setColor(bord_col);
                    g.drawCircle(x_rgt-x_offs_rgt-cnt*x_dist, y_cntr-y_offs_cntr+y_dist[line_cnt], rad[line_cnt]);
                }             
                if (dt_bit_arr[line_cnt][cnt] == 1)
                {
                    g.setColor(col[line_cnt]);
                }
                else
                {
                    g.setColor(col_off);
                }
                g.fillCircle(x_rgt-x_offs_rgt-cnt*x_dist, y_cntr-y_offs_cntr+y_dist[line_cnt], rad[line_cnt]-1);
                cnt++;
            }
            line_cnt++;
        }

        // queue next draw
        if (drawTimeout) clearTimeout(drawTimeout);
        drawTimeout = setTimeout(function()
        {
          drawTimeout = undefined;
          draw();
        }, 60000 - (Date.now() % 60000));
    }


    // Init the settings of the app
    loadSettings();

    // Show launcher when middle button pressed
    Bangle.setUI(
    {
        mode : "clock",
        remove : function()
        {
            // Called to unload all of the clock app
            if (drawTimeout) clearTimeout(drawTimeout);
            drawTimeout = undefined;
        }
    });
    // Load widgets
    Bangle.loadWidgets();
    draw();
    setTimeout(Bangle.drawWidgets,0);
}
