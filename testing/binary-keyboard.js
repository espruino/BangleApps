/*
Binary search keyboard for typing with
the touchscreen
*/

function showChars(x,chars) {
  var lines = Math.round(Math.sqrt(chars.length)*2);
  g.setFontAlign(0,0);
  var sy = Math.round(200/lines);
  var sx = sy;
  g.setFont("Vector", sy-2);
  var y = (240 - lines*sy);
  var last = 0;
  for (var i=0;i<lines;i++) {
    var n = Math.round(chars.length*(i+1)/lines);
    var xo = x + (120 - sx*(n-last-1))/2;
    for (var j=last;j<n;j++)
      g.drawString(chars[j], xo + (j-last)*sx, y + sy*i)
    last = n;
  }
}

function show(chars,callback) {
  g.clear();
  if (chars.length==1) {
    callback(chars);
    return;
  }
  var m = chars.length/2;
  charl=chars.slice(0,m);
  charr=chars.slice(m);
  showChars(0,charl);
  showChars(120,charr);
  setWatch(() => {
    clearWatch();
    show(charl,callback);
  }, BTN4);
  setWatch(() => {
    clearWatch();
    show(charr,callback);
  }, BTN5);
}

function getCharacter() {
  return new Promise(resolve => {
    show("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",resolve);
  });
}

getCharacter().then(print)