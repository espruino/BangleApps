//Binary LED Clock (BLC) by aeMKai

{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
  let drawTimeout;

  // Actually draw the watch face
  let draw = function()
  {
    // Bangle.js2 -> 176x176
    var x_rgt = g.getWidth();
    var y_bot = g.getHeight();
    //var x_cntr = x_rgt / 2;
    var y_cntr = y_bot / 18*7; // not to high because of widget-field (1/3 is to high)
    g.reset().clearRect(Bangle.appRect); // clear whole background (w/o widgets)
 
    let white = [1,1,1];
    let red = [1,0,0];
    let green = [0,1,0];
    //let blue = [0,0,1];
    let yellow = [1,1,0];
    //let magenta = [1,0,1];
    //let cyan = [0,1,1];
    let black = [0,0,0];
    let bord_col = white;
    let col_off = black;

    var col = new Array(red, green, yellow, yellow);  // [R,G,B]

    let pot_2 = [1, 2, 4, 8, 16, 32];  // array with powers of two, because power-op (**)
                                       // doesn't work -> maybe also faster
  
    
    var nr_lines = 4;  // 4 rows: hour (hr), minute (min), day (day), month (mon)
    
    // Arrays: [hr, min, day, mon]
    //No of Bits: 5  6  5  4   
    let msbits = [4, 5, 4, 3];  // MSB = No bits - 1
    let rad = [12, 12, 8, 8];                    // radiuses for each row
    var x_dist = 28;
    let y_dist = [0, 30, 60, 85];    // y-position from y_centr for each row from top
                                     // don't calc. automatic as for x, because of different spaces
    var x_offs_rgt = 16;             // distance from right border (layout)

    // Date-Time-Array: 4x6 Bit
    //var idx_hr = 0;
    //var idx_min = 1;
    //var idx_day = 2;
    //var idx_mon = 3;
    var dt_bit_arr = [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]];

    var date_time = new Date();
    var hr = date_time.getHours();      // 0..23
    var min = date_time.getMinutes();    // 0..59
    var day = date_time.getDate();       // 1..31
    var mon = date_time.getMonth() + 1;  // GetMonth() -> 0..11

    let dt_array = [hr, min, day, mon];
    

////////////////////////////////////////
// compute bit-pattern from time/date and draw leds
////////////////////////////////////////  
    var line_cnt = 0;
    var cnt = 0;
    var bit_cnt = 0;
    
    while (line_cnt < nr_lines)
      {
        
        ////////////////////////////////////////
        // compute bit-pattern
        bit_cnt = msbits[line_cnt];

        while (bit_cnt >= 0)
        {
          if (dt_array[line_cnt] >= pot_2[bit_cnt])
          {
            dt_array[line_cnt] -= pot_2[bit_cnt];
            dt_bit_arr[line_cnt][bit_cnt] = 1;
          }
          else
          {
            dt_bit_arr[line_cnt][bit_cnt] = 0;
          }
          bit_cnt--;
        }
        
        ////////////////////////////////////////
        // draw leds (first white border for black screen, then led itself)
        cnt = 0;

        while (cnt <= msbits[line_cnt])
        {
          g.setColor(bord_col[0], bord_col[1], bord_col[2]);
          g.drawCircle(x_rgt-x_offs_rgt-cnt*x_dist, y_cntr-20+y_dist[line_cnt], rad[line_cnt]);
          
          if (dt_bit_arr[line_cnt][cnt] == 1)
          {
            g.setColor(col[line_cnt][0], col[line_cnt][1], col[line_cnt][2]);
          }
          else
          {
            g.setColor(col_off[0], col_off[1], col_off[2]);
          }
          g.fillCircle(x_rgt-x_offs_rgt-cnt*x_dist, y_cntr-20+y_dist[line_cnt], rad[line_cnt]-1);
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
  };

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
