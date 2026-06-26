exports.show = function(options) {
  var colors;
  var isPicking=true;
  var isClosing=false;
  var previewTimeout;
  if (!options.colors||options.colors.length==0) {
    colors = [
      "#000", "#888", "#AAA", "#FFF",
      "#F99", "#FC9", "#FF9", "#9F9", "#9FF", "#99F", "#F9F",
      "#F00", "#F80", "#FF0", "#0F0", "#0FF", "#00F", "#F0F",
      "#800", "#840", "#880", "#080", "#088", "#008", "#808"
    ];
    if (options.multiSelect) colors.splice(19,1); // remove smeary brown to leave room for back button
  } else {
    colors = options.colors.slice(); // clone array
  }
  if (options.multiSelect) colors.push("BACK"); // need a back button for multiselect
  if(colors.length>36) throw new Error("More than 36 colors provided, cannot display");
  if(!options.onSelect) throw new Error("No onSelect function provided");
  if(!options.back) throw new Error("No back function provided");

  var rect = Bangle.appRect;
  var W = rect.w;
  var H = rect.h;
  var n = colors.length;
  var COLS = Math.round(Math.sqrt(n));
  var ROWS = Math.ceil(n / COLS);
  var CW = (W / COLS) | 0;
  var CH = (H / ROWS) | 0;
  var selectedColors=options.startingSelection?options.startingSelection:[];
  var highlightIdx = -1; // if using buttons, this is the currently highlighted button
  function draw() {
    g.reset().clearRect(rect).setFontAlign(0,0).setFont("6x8:2");
    for (var i = 0; i < n; i++) {
      var col = i % COLS, row = (i / COLS) | 0;
      var x = rect.x + col * CW, y = rect.y + row * CH;
      var b = 2; // border
      var selectedColorsIdx = options.multiSelect && (1+selectedColors.indexOf(colors[i]));
      if (selectedColorsIdx) b = 2; // in selectedColors list
      if (i==highlightIdx) { // highlight selected
        b = 4;
        g.fillRect(x, y, x + CW, y + CH);
      }
      if (colors[i] == "BACK")
        g.clearRect(x + b, y + b, x + CW - b, y + CH - b)
        .drawImage("\r\x0E\1\0\x18\0\xC0\6\x000\x81\x8C\f\xE0o\3\xFF\xFF\xFF\xDE\0p\1\x80\4\0", x-8+CW/2,y-8+CH/2);
      else
        g.setColor(colors[i]).fillRect(x + b, y + b, x + CW - b, y + CH - b).setColor(g.theme.fg);
      if (selectedColorsIdx) {
        let mx = x+CW/2, my = y+CW/2;
        g.drawRect(x+1, y+1, x + CW - 1, y + CH - 1).setColor(g.theme.fg).clearRect(mx-6,my-8,mx+8,my+8)
         .drawString(selectedColorsIdx, mx+2, my);
      }
    }
  }

  function colorAt(x, y) {
    if(y<rect.y) return null;
    var col = ((x - rect.x) / CW) | 0;
    var row = ((y - rect.y) / CH) | 0;
    var i = row * COLS + col;
    if (i < 0 || i >= n) return null;
    return colors[i];
  }

  function cleanup() {
    if(previewTimeout){
      clearTimeout(previewTimeout);
      previewTimeout=null;
    }
  }

  function closePicker() {
    if (isClosing) return;
    isClosing = true;
    Bangle.setUI();
    options.back();
  }

  function onSelect(col) {
    if (col === null) return;
    if (col === "BACK") return closePicker();
    if (!options.multiSelect) {
      isPicking=false;
      if (Bangle.haptic) Bangle.haptic();
      options.onSelect(col);
      if (options.showPreview === undefined || options.showPreview) {
        g.setColor(col)
        .fillRect(rect);
        if(previewTimeout){
          clearTimeout(previewTimeout);
          previewTimeout=null;
        }
        previewTimeout=setTimeout(closePicker, 0.7 * 1000);
      } else {
        closePicker();
      }
    } else {
      if(Bangle.haptic) Bangle.haptic();
      if(selectedColors.includes(col)){
        //unselect
        selectedColors=selectedColors.filter(color => color !== col);
      } else {
        selectedColors.push(col);
      }
      options.onSelect(selectedColors);
      draw();
    }
  }

  function onTouch(side, xy) {
    if (!isPicking) return;
    if(xy) // On Bangle.js 1, xy is undefined
      onSelect(colorAt(xy.x, xy.y));
    else if (side==1) onButton(1); // Bangle.js 1, touch left
    else if (side==2) onButton(3); // Bangle.js 1, touch right
  }

  function onButton(b) {
    if (b==1) { // scroll back
      highlightIdx = (highlightIdx+colors.length-1) % colors.length;
      draw();
    } else if (b==2) { // select
      onSelect(colors[highlightIdx]);
    } else if (b==3) { // scroll forward
      highlightIdx = (highlightIdx+1) % colors.length;
      draw();
    } else closePicker();
  }

  Bangle.setUI({
    mode: "custom",
    touch: onTouch,
    btn: onButton,
    back: closePicker,
    remove: cleanup,
    redraw: draw
  });

  draw();
};