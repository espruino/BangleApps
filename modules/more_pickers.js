/* see more_pickers.md for more information */

exports.doublePicker = function (options) {
  var menuIcon = "\0\f\f\x81\0\xFF\xFF\xFF\0\0\0\0\x0F\xFF\xFF\xF0\0\0\0\0\xFF\xFF\xFF";

  var R = Bangle.appRect;
  g.reset().clearRect(R);
  g.setFont("12x20").setFontAlign(0, 0).drawString(menuIcon + " " + options.title, R.x + R.w / 2, R.y + 12);

  var v_1 = options.value_1;
  var v_2 = options.value_2;

  function draw1() {
    var txt_1 = options.format_1 ? options.format_1(v_1) : v_1;

    g.setColor(g.theme.bg2)
      .fillRect(14, 60, 81, 166)
      .setColor(g.theme.fg2)
      .fillPoly([47.5, 68, 62.5, 83, 32.5, 83])
      .fillPoly([47.5, 158, 62.5, 143, 32.5, 143])
      .setFontAlign(0, 0)
      .setFontVector(Math.min(30, (R.w - 110) * 100 / g.setFontVector(100).stringWidth(txt_1)))
      .drawString(txt_1, 47.5, 113);
  }
  function draw2() {
    var txt_2 = options.format_2 ? options.format_2(v_2) : v_2;

    g.setColor(g.theme.bg2)
      .fillRect(95, 60, 162, 166)
      .setColor(g.theme.fg2)
      .fillPoly([128.5, 68, 143.5, 83, 113.5, 83])
      .fillPoly([128.5, 158, 143.5, 143, 113.5, 143])
      .setFontAlign(0, 0)
      .setFontVector(Math.min(30, (R.w - 110) * 100 / g.setFontVector(100).stringWidth(txt_2)))
      .drawString(txt_2, 128.5, 113);
  }
  function drawSeparator(){
    g.setFontVector(30).drawString(options.separator ?? "", 88, 110);
  }
  function drawAll() {
      draw1();
      draw2();
      drawSeparator()
  }
  function cb(dir, x_part) {
    if (dir) {
      if (x_part == -1) {
        v_1 -= (dir || 1) * (options.step_1 || 1);
        if (options.min_1 !== undefined && v_1 < options.min_1) v_1 = options.wrap_1 ? options.max_1 : options.min_1;
        if (options.max_1 !== undefined && v_1 > options.max_1) v_1 = options.wrap_1 ? options.min_1 : options.max_1;
        draw1();
      } else {
        v_2 -= (dir || 1) * (options.step_2 || 1);
        if (options.min_2 !== undefined && v_2 < options.min_2) v_2 = options.wrap_2 ? options.max_2 : options.min_2;
        if (options.max_2 !== undefined && v_2 > options.max_2) v_2 = options.wrap_2 ? options.min_2 : options.max_2;
        draw2();
      }
      drawSeparator();
    } else { // actually selected
      options.value_1 = v_1;
      options.value_2 = v_2;
      if (options.onchange) options.onchange(options.value_1, options.value_2);
      options.back(); // redraw original menu
    }
  }

  drawAll();
  var dy = 0;

  Bangle.setUI({
    mode: "custom",
    back: options.back,
    remove: options.remove,
    redraw: drawAll,
    drag: e => {
      dy += e.dy; // after a certain amount of dragging up/down fire cb
      if (!e.b) dy = 0;
      var x_part;
      if (e.x <= 88) {
        x_part = -1;
      } else {
        x_part = 1;
      }
      while (Math.abs(dy) > 32) {
        if (dy > 0) { dy -= 32; cb(1, x_part); }
        else { dy += 32; cb(-1, x_part); }
        Bangle.buzz(20);
      }
    },
    touch: (_, e) => {
      Bangle.buzz(20);
      var x_part;
      if (e.x <= 88) {
        x_part = -1;
      } else {
        x_part = 1;
      }
      if (e.y < 82) cb(-1, x_part); // top third
      else if (e.y > 142) cb(1, x_part); // bottom third
      else cb(); // middle = accept
    }
  });
}

exports.triplePicker = function (options) {
  var menuIcon = "\0\f\f\x81\0\xFF\xFF\xFF\0\0\0\0\x0F\xFF\xFF\xF0\0\0\0\0\xFF\xFF\xFF";

  var R = Bangle.appRect;
  g.reset().clearRect(R);
  g.setFont("12x20").setFontAlign(0, 0).drawString(menuIcon + " " + options.title, R.x + R.w / 2, R.y + 12);

  var v_1 = options.value_1;
  var v_2 = options.value_2;
  var v_3 = options.value_3;

  function draw1() {
    var txt_1 = options.format_1 ? options.format_1(v_1) : v_1;

    g.setColor(g.theme.bg2)
      .fillRect(8, 60, 56, 166)
      .setColor(g.theme.fg2)
      .fillPoly([32, 68, 47, 83, 17, 83])
      .fillPoly([32, 158, 47, 143, 17, 143])
      .setFontAlign(0, 0)
      .setFontVector(Math.min(30, (R.w - 130) * 100 / g.setFontVector(100).stringWidth(txt_1)))
      .drawString(txt_1, 32, 113);
  }
  function draw2() {
    var txt_2 = options.format_2 ? options.format_2(v_2) : v_2;

    g.setColor(g.theme.bg2)
      .fillRect(64, 60, 112, 166)
      .setColor(g.theme.fg2)
      .fillPoly([88, 68, 103, 83, 73, 83])
      .fillPoly([88, 158, 103, 143, 73, 143])
      .setFontAlign(0, 0)
      .setFontVector(Math.min(30, (R.w - 130) * 100 / g.setFontVector(100).stringWidth(txt_2)))
      .drawString(txt_2, 88, 113);
  }
  function draw3() {
    var txt_3 = options.format_3 ? options.format_3(v_3) : v_3;
    
    g.setColor(g.theme.bg2)
      .fillRect(120, 60, 168, 166)
      .setColor(g.theme.fg2)
      .fillPoly([144, 68, 159, 83, 129, 83])
      .fillPoly([144, 158, 159, 143, 129, 143])
      .setFontAlign(0, 0)
      .setFontVector(Math.min(30, (R.w - 130) * 100 / g.setFontVector(100).stringWidth(txt_3)))
      .drawString(txt_3, 144, 113);
  }
  function drawSeparators(){
    g.setFontVector(30)
      .drawString(options.separator_1 ?? "", 60, 113)
      .drawString(options.separator_2 ?? "", 116, 113);
  }
  function drawAll() {
      draw1();
      draw2();
      draw3();
      drawSeparators();
  }
  function cb(dir, x_part) {
    if (dir) {
      if (x_part == -1) {
        v_1 -= (dir || 1) * (options.step_1 || 1);
        if (options.min_1 !== undefined && v_1 < options.min_1) v_1 = options.wrap_1 ? options.max_1 : options.min_1;
        if (options.max_1 !== undefined && v_1 > options.max_1) v_1 = options.wrap_1 ? options.min_1 : options.max_1;
        draw1();
      } else if (x_part == 0) {
        v_2 -= (dir || 1) * (options.step_2 || 1);
        if (options.min_2 !== undefined && v_2 < options.min_2) v_2 = options.wrap_2 ? options.max_2 : options.min_3;
        if (options.max_2 !== undefined && v_2 > options.max_2) v_2 = options.wrap_2 ? options.min_2 : options.max_3;
        draw2();
      } else {
        v_3 -= (dir || 1) * (options.step_3 || 1);
        if (options.min_3 !== undefined && v_3 < options.min_3) v_3 = options.wrap_3 ? options.max_3 : options.min_3;
        if (options.max_3 !== undefined && v_3 > options.max_3) v_3 = options.wrap_3 ? options.min_3 : options.max_3;
        draw3();
      }
      drawSeparators();
    } else { // actually selected
      options.value_1 = v_1;
      options.value_2 = v_2;
      options.value_3 = v_3;
      if (options.onchange) options.onchange(options.value_1, options.value_2, options.value_3);
      options.back(); // redraw original menu
    }
  }

  drawAll();
  var dy = 0;

  Bangle.setUI({
    mode: "custom",
    back: options.back,
    remove: options.remove,
    redraw: drawAll,
    drag: e => {
      dy += e.dy; // after a certain amount of dragging up/down fire cb
      if (!e.b) dy = 0;
      var x_part;
      if (e.x <= 58) {
        x_part = -1;
      } else if (58 < e.x && e.x <= 116) {
        x_part = 0;
      } else {
        x_part = 1;
      }
      while (Math.abs(dy) > 32) {
        if (dy > 0) { dy -= 32; cb(1, x_part); }
        else { dy += 32; cb(-1, x_part); }
        Bangle.buzz(20);
      }
    },
    touch: (_, e) => {
      Bangle.buzz(20);
      var x_part;
      if (e.x <= 58) {
        x_part = -1;
      } else if (58 < e.x && e.x <= 116) {
        x_part = 0;
      } else {
        x_part = 1;
      }
      if (e.y < 82) cb(-1, x_part); // top third
      else if (e.y > 142) cb(1, x_part); // bottom third
      else cb(); // middle = accept
    }
  });
}