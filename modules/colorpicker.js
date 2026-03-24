exports.show = function(options) {
  var colors;
  var isPicking=true;
  var previewTimeout;
  if (!options.colors||options.colors.length==0) {
    colors = [
      "#000000", "#808080", "#AAAAAA", "#FFFFFF",
      "#FF9999", "#FFCC99", "#FFFF99", "#99FF99", "#99FFFF", "#9999FF", "#FF99FF",
      "#FF0000", "#FF8800", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF",
      "#880000", "#884400", "#888800", "#008800", "#008888", "#000088", "#880088"
    ];
  } else {
    colors = options.colors;
  }
  if(colors.length>36){
    throw new Error("More than 36 colors provided, cannot display")
  }
  var rect = Bangle.appRect;
  var W = rect.w;
  var H = rect.h;
  var n = colors.length;
  var COLS = Math.round(Math.sqrt(n));
  var ROWS = Math.ceil(n / COLS);
  var CW = (W / COLS) | 0;
  var CH = (H / ROWS) | 0;
  var selectedColors=options.startingSelection?options.startingSelection:[];
  
  function draw() {
    g.clearRect(rect);
    for (var i = 0; i < n; i++) {
      var col = i % COLS;
      var row = (i / COLS) | 0;
      var x = rect.x + col * CW;
      var y = rect.y + row * CH;
      var oldCH=CH;
      var oldCW=CW;
      if(options.multiSelect){
        if(selectedColors.includes(colors[i])){
          //selected
          x+=4
          y+=4
          CH-=8
          CW-=8
        }
      }
      g.setColor(colors[i])
       .fillRect(x + 1, y + 1, x + CW - 1, y + CH - 1)
       .setColor(g.theme.fg)
       .drawRect(x, y, x + CW, y + CH);
      CH=oldCH;
      CW=oldCW;
    }
    
  }

  function colorAt(x, y) {
    if(y<rect.y)return null;
    var col = ((x - rect.x) / CW) | 0;
    var row = ((y - rect.y) / CH) | 0;
    var i = row * COLS + col;
    if (i < 0 || i >= n) return null;
    return colors[i];
  }

  function remove() {
    if(previewTimeout)clearTimeout(previewTimeout);
    if(options.back){
      options.back();
    }else{
      throw new Error("No back function provided");
    }
  }

  function onTouch(btn, xy) {
    if(isPicking){
      var col = colorAt(xy.x, xy.y);
      if (!col) return;
      if(!options.multiSelect){
        isPicking=false;
        Bangle.haptic();
        if(options.onSelect) options.onSelect(col);
        else throw new Error("No onSelect function provided")
        if (options.showPreview === undefined || options.showPreview) {
          g.setColor(col);
          g.fillRect(rect);
          previewTimeout=setTimeout(remove, 0.7 * 1000);
        } else {
          remove();
        }
      }else{
        Bangle.haptic()
        options.onSelect(selectedColors);
        if(selectedColors.includes(col)){
          //unselect
          selectedColors=selectedColors.filter(color => color !== col);
        }else{
          selectedColors.push(col)
        }
        draw()
      }
    }
  }

  Bangle.setUI({
    mode: "custom",
    touch: function(n, e) { onTouch(n, e); },
    btn: function(n) { remove(); }
  });

  draw();
};
