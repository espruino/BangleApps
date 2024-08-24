//BinaryLEDClk by MK

{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
  let drawTimeout;

  // Actually draw the watch face
  let draw = function()
  {
   
    
    // Bangle.js2 -> 176x176
    var x_rgt = g.getWidth();
    var y_bot = g.getHeight();
    var x_cntr = x_rgt / 2;
    var y_cntr = y_bot / 18*7; // nicht zu hoch wg. Widget-Leiste (1/3 ist zu hoch)
    g.reset().clearRect(Bangle.appRect); // clear whole background (w/o widgets)
 
    let weiss = [1,1,1];
    let rot = [1,0,0];
    let gruen = [0,1,0];
    let blau = [0,0,1];
    let gelb = [1,1,0];
    let magenta = [1,0,1];
    let cyan = [0,1,1];
    let schwarz = [0,0,0];
    let bord_col = weiss;
    let col_off = schwarz;

    var col = new Array(rot, gruen, gelb, gelb);  // je [R,G,B]

    let pot_2 = [1, 2, 4, 8, 16, 32];    // Array mit 2er-Potenzen, da Potenzop. '**'
                                       // nicht funzt -> vmtl. auch schneller
  
    
    var nr_lines = 4;  // 4 Zeilen: Std, Min, Tag, Mon
    var nr_std = 5;  
    var nr_min = 6;
    var nr_tag = 5;
    var nr_mon = 4; 
    
    // Arrays: [Std, Min, Tag, Mon]
    let msbits = [nr_std-1, nr_min-1, nr_tag-1, nr_mon-1];  // MSB = Anzahl Bits - 1
    let rad = [12, 12, 8, 8];                    // Radien 
    var x_dist = 28;
    let y_dist = [0, 30, 60, 85];               // y-Position von oben -- nicht wie x automat. berechnen, da unterschiedliche Abstände
    var x_offs_rgt = 16;  // Abstand zum rechten Rand


        // Date-Time-Array: 4x6 Bit
    var idx_std = 0;
    var idx_min = 1;
    var idx_tag = 2;
    var idx_mon = 3;
    var dt_bit_arr = [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]];

    var date_time = new Date();
    var std = date_time.getHours();      // 0..23
    var min = date_time.getMinutes();    // 0..59
    var tag = date_time.getDate();       // 1..31
    var mon = date_time.getMonth() + 1;  // GetMonth() -> 0..11

    let dt_array = [std, min, tag, mon];

    
////////////////////////////////////////
// Zeit/Datum in Bitmuster umwandeln + zeichnen
////////////////////////////////////////    
    var line_cnt = 0;
    var cnt = 0;
    var bit_cnt = 0;
    
    while (line_cnt < nr_lines)
      {
        
        ////////////////////////////////////////
        // Bitmuster berechnen
        bit_cnt = msbits[line_cnt];

        while (bit_cnt >= 0)
        {
          //Terminal.print(dt_array[line_cnt] + ' -> ');     // Debug
          if (dt_array[line_cnt] >= pot_2[bit_cnt])  // Potenzoperator '**' funzt nicht
                                      // -> auf Array zurueckgreifen, vmtl. auch schneller
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
        // Bitmuster zeichnen
        cnt = 0;

        while (cnt <= msbits[line_cnt])
        {
          g.setColor(bord_col[0], bord_col[1], bord_col[2]);
          //g.drawCircle(x_rgt-x_offs_rgt-cnt*x_dist, y_cntr-20+line_cnt*y_dist, rad[line_cnt]);
          g.drawCircle(x_rgt-x_offs_rgt-cnt*x_dist, y_cntr-20+y_dist[line_cnt], rad[line_cnt]);
          
          if (dt_bit_arr[line_cnt][cnt] == 1)
          {
            g.setColor(col[line_cnt][0], col[line_cnt][1], col[line_cnt][2]);
          }
          else
          {
            g.setColor(col_off[0], col_off[1], col_off[2]);
          }
          //g.fillCircle(x_rgt-x_offs_rgt-cnt*x_dist, y_cntr-20+line_cnt*y_dist, rad[line_cnt]-1);
          g.fillCircle(x_rgt-x_offs_rgt-cnt*x_dist, y_cntr-20+y_dist[line_cnt], rad[line_cnt]-1);
          cnt++;
        }
        line_cnt++;
      }

    //var min1 = g.drawCircleAA(x_cntr, y_cntr, 10);
    //var min2 = g.fillCircle(x_cntr+30, y_cntr+30, 5);


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
