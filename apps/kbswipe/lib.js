exports.INPUT_MODE_ALPHA = 0;
exports.INPUT_MODE_NUM = 1;

/* To make your own strokes, type:

Bangle.on('stroke',print)

on the left of the IDE, then do a stroke and copy out the Uint8Array line
*/
exports.getStrokes = function(mode, cb) {
  if (mode === exports.INPUT_MODE_ALPHA) {
    cb("a", new Uint8Array([58, 159, 58, 155, 62, 144, 69, 127, 77, 106, 86, 90, 94, 77, 101, 68, 108, 62, 114, 59, 121, 59, 133, 61, 146, 70, 158, 88, 169, 107, 176, 124, 180, 135, 183, 144, 185, 152]));
    cb("b", new Uint8Array([51, 47, 51, 77, 56, 123, 60, 151, 65, 163, 68, 164, 68, 144, 67, 108, 67, 76, 72, 43, 104, 51, 121, 74, 110, 87, 109, 95, 131, 117, 131, 140, 109, 152, 88, 157]));
    cb("c", new Uint8Array([153, 62, 150, 62, 145, 62, 136, 62, 123, 62, 106, 65, 85, 70, 65, 75, 50, 82, 42, 93, 37, 106, 36, 119, 36, 130, 40, 140, 49, 147, 61, 153, 72, 156, 85, 157, 106, 158, 116, 158]));
    cb("d", new Uint8Array([57, 178, 57, 176, 55, 171, 52, 163, 50, 154, 49, 146, 47, 135, 45, 121, 44, 108, 44, 97, 44, 85, 44, 75, 44, 66, 44, 58, 44, 48, 44, 38, 46, 31, 48, 26, 58, 21, 75, 20, 99, 26, 120, 35, 136, 51, 144, 70, 144, 88, 137, 110, 124, 131, 106, 145, 88, 153]));
    cb("e", new Uint8Array([150, 72, 141, 69, 114, 68, 79, 69, 48, 77, 32, 81, 31, 85, 46, 91, 73, 95, 107, 100, 114, 103, 83, 117, 58, 134, 66, 143, 105, 148, 133, 148, 144, 148]));
    cb("f", new Uint8Array([157, 52, 155, 52, 148, 52, 137, 52, 124, 52, 110, 52, 96, 52, 83, 52, 74, 52, 67, 52, 61, 52, 57, 52, 55, 52, 52, 52, 52, 54, 52, 58, 52, 64, 54, 75, 58, 97, 59, 117, 60, 130]));
    cb("g", new Uint8Array([160, 66, 153, 62, 129, 58, 90, 56, 58, 57, 38, 65, 31, 86, 43, 125, 69, 152, 116, 166, 145, 154, 146, 134, 112, 116, 85, 108, 97, 106, 140, 106, 164, 106]));
    cb("h", new Uint8Array([58, 50, 58, 55, 58, 64, 58, 80, 58, 102, 58, 122, 58, 139, 58, 153, 58, 164, 58, 171, 58, 177, 58, 179, 58, 181, 58, 180, 58, 173, 58, 163, 59, 154, 61, 138, 64, 114, 68, 95, 72, 84, 80, 79, 91, 79, 107, 82, 123, 93, 137, 111, 145, 130, 149, 147, 150, 154, 150, 159]));
    cb("i", new Uint8Array([89, 48, 89, 49, 89, 51, 89, 55, 89, 60, 89, 68, 89, 78, 89, 91, 89, 103, 89, 114, 89, 124, 89, 132, 89, 138, 89, 144, 89, 148, 89, 151, 89, 154, 89, 156, 89, 157, 89, 158]));
    cb("j", new Uint8Array([130, 57, 130, 61, 130, 73, 130, 91, 130, 113, 130, 133, 130, 147, 130, 156, 130, 161, 130, 164, 130, 166, 129, 168, 127, 168, 120, 168, 110, 168, 91, 167, 81, 167, 68, 167]));
    cb("k", new Uint8Array([149, 63, 147, 68, 143, 76, 136, 89, 126, 106, 114, 123, 100, 136, 86, 147, 72, 153, 57, 155, 45, 152, 36, 145, 29, 131, 26, 117, 26, 104, 27, 93, 30, 86, 35, 80, 45, 77, 62, 80, 88, 96, 113, 116, 130, 131, 140, 142, 145, 149, 148, 153]));
    cb("l", new Uint8Array([42, 55, 42, 59, 42, 69, 44, 87, 44, 107, 44, 128, 44, 143, 44, 156, 44, 163, 44, 167, 44, 169, 45, 170, 49, 170, 59, 169, 76, 167, 100, 164, 119, 162, 139, 160, 163, 159]));
    cb("m", new Uint8Array([49, 165, 48, 162, 46, 156, 44, 148, 42, 138, 42, 126, 42, 113, 43, 101, 45, 91, 47, 82, 49, 75, 51, 71, 54, 70, 57, 70, 61, 74, 69, 81, 75, 91, 84, 104, 94, 121, 101, 132, 103, 137, 106, 130, 110, 114, 116, 92, 125, 75, 134, 65, 139, 62, 144, 66, 148, 83, 151, 108, 155, 132, 157, 149]));
    cb("n", new Uint8Array([50, 165, 50, 160, 50, 153, 50, 140, 50, 122, 50, 103, 50, 83, 50, 65, 50, 52, 50, 45, 50, 43, 52, 52, 57, 67, 66, 90, 78, 112, 93, 131, 104, 143, 116, 152, 127, 159, 135, 160, 141, 150, 148, 125, 154, 96, 158, 71, 161, 56, 162, 49]));
    cb("o", new Uint8Array([107, 58, 104, 58, 97, 61, 87, 68, 75, 77, 65, 88, 58, 103, 54, 116, 53, 126, 55, 135, 61, 143, 75, 149, 91, 150, 106, 148, 119, 141, 137, 125, 143, 115, 146, 104, 146, 89, 142, 78, 130, 70, 116, 65, 104, 62]));
    cb("p", new Uint8Array([29, 47, 29, 55, 29, 75, 29, 110, 29, 145, 29, 165, 29, 172, 29, 164, 30, 149, 37, 120, 50, 91, 61, 74, 72, 65, 85, 61, 103, 61, 118, 63, 126, 69, 129, 76, 130, 87, 126, 98, 112, 108, 97, 114, 87, 116]));
    cb("q", new Uint8Array([95, 59, 93, 59, 88, 59, 79, 59, 68, 61, 57, 67, 50, 77, 48, 89, 48, 103, 50, 117, 55, 130, 65, 140, 76, 145, 85, 146, 94, 144, 101, 140, 105, 136, 106, 127, 106, 113, 100, 98, 92, 86, 86, 79, 84, 75, 84, 72, 91, 69, 106, 67, 126, 67, 144, 67, 158, 67, 168, 67, 173, 67, 177, 67]));
    cb("r", new Uint8Array([53, 49, 53, 62, 53, 91, 53, 127, 53, 146, 53, 147, 53, 128, 53, 94, 53, 69, 62, 44, 82, 42, 94, 50, 92, 68, 82, 85, 77, 93, 80, 102, 95, 119, 114, 134, 129, 145, 137, 150]));
    cb("s", new Uint8Array([159, 72, 157, 70, 155, 68, 151, 66, 145, 63, 134, 60, 121, 58, 108, 56, 96, 55, 83, 55, 73, 55, 64, 56, 57, 60, 52, 65, 49, 71, 49, 76, 50, 81, 55, 87, 71, 94, 94, 100, 116, 104, 131, 108, 141, 114, 145, 124, 142, 135, 124, 146, 97, 153, 70, 157, 52, 158]));
    cb("t", new Uint8Array([45, 55, 48, 55, 55, 55, 72, 55, 96, 55, 120, 55, 136, 55, 147, 55, 152, 55, 155, 55, 157, 55, 158, 56, 158, 60, 156, 70, 154, 86, 151, 102, 150, 114, 148, 125, 148, 138, 148, 146]));
    cb("u", new Uint8Array([35, 52, 35, 59, 35, 73, 35, 90, 36, 114, 38, 133, 42, 146, 49, 153, 60, 157, 73, 158, 86, 156, 100, 152, 112, 144, 121, 131, 127, 114, 132, 97, 134, 85, 135, 73, 136, 61, 136, 56]));
    cb("v", new Uint8Array([36, 55, 37, 59, 40, 68, 45, 83, 51, 100, 58, 118, 64, 132, 69, 142, 71, 149, 73, 156, 76, 158, 77, 160, 77, 159, 80, 151, 82, 137, 84, 122, 86, 111, 90, 91, 91, 78, 91, 68, 91, 63, 92, 61, 97, 61, 111, 61, 132, 61, 150, 61, 162, 61]));
    cb("w", new Uint8Array([25, 46, 25, 82, 25, 119, 33, 143, 43, 153, 60, 147, 73, 118, 75, 91, 76, 88, 85, 109, 96, 134, 107, 143, 118, 137, 129, 112, 134, 81, 134, 64, 134, 55]));
    cb("x", new Uint8Array([56, 63, 56, 67, 57, 74, 60, 89, 66, 109, 74, 129, 85, 145, 96, 158, 107, 164, 117, 167, 128, 164, 141, 155, 151, 140, 159, 122, 166, 105, 168, 89, 170, 81, 170, 73, 169, 66, 161, 63, 141, 68, 110, 83, 77, 110, 55, 134, 47, 145]));
    cb("y", new Uint8Array([30, 41, 30, 46, 30, 52, 30, 63, 30, 79, 33, 92, 38, 100, 47, 104, 54, 107, 66, 105, 79, 94, 88, 82, 92, 74, 94, 77, 96, 98, 96, 131, 94, 151, 91, 164, 85, 171, 75, 171, 71, 162, 74, 146, 84, 130, 95, 119, 106, 113]));
    cb("z", new Uint8Array([29, 62, 35, 62, 43, 62, 63, 62, 87, 62, 110, 62, 125, 62, 134, 62, 138, 62, 136, 63, 122, 68, 103, 77, 85, 91, 70, 107, 59, 120, 50, 132, 47, 138, 43, 143, 41, 148, 42, 151, 53, 155, 80, 157, 116, 158, 146, 158, 163, 158]));
    cb("SHIFT", new Uint8Array([100, 160, 100, 50]));
  } else if (mode === exports.INPUT_MODE_NUM) {
    cb("0", new Uint8Array([82, 50, 76, 50, 67, 50, 59, 50, 50, 51, 43, 57, 38, 68, 34, 83, 33, 95, 33, 108, 34, 121, 42, 136, 57, 148, 72, 155, 85, 157, 98, 155, 110, 149, 120, 139, 128, 127, 134, 119, 137, 114, 138, 107, 138, 98, 138, 88, 138, 77, 137, 71, 134, 65, 128, 60, 123, 58]));
    cb("1", new Uint8Array([100, 50, 100, 160]));
    cb("2", new Uint8Array([40, 79, 46, 74, 56, 66, 68, 58, 77, 49, 87, 45, 100, 45, 111, 46, 119, 50, 128, 58, 133, 71, 130, 88, 120, 106, 98, 128, 69, 150, 50, 162, 42, 167, 43, 168, 58, 169, 78, 170, 93, 170, 103, 170, 109, 170]));
    cb("3", new Uint8Array([47, 65, 51, 60, 57, 56, 65, 51, 74, 47, 84, 45, 93, 45, 102, 45, 109, 46, 122, 51, 129, 58, 130, 65, 127, 74, 120, 85, 112, 92, 107, 96, 112, 101, 117, 105, 125, 113, 128, 123, 127, 134, 122, 145, 108, 156, 91, 161, 70, 163, 55, 163]));
    cb("4", new Uint8Array([37, 58, 37, 60, 37, 64, 37, 69, 37, 75, 37, 86, 37, 96, 37, 105, 37, 112, 37, 117, 37, 122, 37, 126, 37, 128, 38, 129, 40, 129, 45, 129, 48, 129, 53, 129, 67, 129, 85, 129, 104, 129, 119, 129, 129, 129, 136, 129]));
    cb("5", new Uint8Array([142, 60, 119, 60, 79, 60, 45, 60, 37, 64, 37, 86, 37, 103, 47, 107, 66, 106, 81, 103, 97, 103, 116, 103, 129, 108, 131, 130, 122, 152, 101, 168, 85, 172, 70, 172, 59, 172]));
    cb("6", new Uint8Array([136, 54, 135, 49, 129, 47, 114, 47, 89, 54, 66, 66, 50, 81, 39, 95, 35, 109, 34, 128, 38, 145, 52, 158, 81, 164, 114, 157, 133, 139, 136, 125, 132, 118, 120, 115, 102, 117, 85, 123]));
    cb("7", new Uint8Array([47, 38, 48, 38, 53, 38, 66, 38, 85, 38, 103, 38, 117, 38, 125, 38, 129, 38, 134, 41, 135, 47, 135, 54, 135, 66, 131, 93, 124, 126, 116, 149, 109, 161, 105, 168]));
    cb("8", new Uint8Array([122, 61, 102, 61, 83, 61, 60, 61, 47, 62, 45, 78, 58, 99, 84, 112, 105, 122, 118, 134, 121, 149, 113, 165, 86, 171, 59, 171, 47, 164, 45, 144, 50, 132, 57, 125, 67, 117, 78, 109, 87, 102, 96, 94, 105, 86, 113, 85]));
    cb("9", new Uint8Array([122, 58, 117, 55, 112, 51, 104, 51, 95, 51, 86, 51, 77, 51, 68, 51, 60, 51, 54, 56, 47, 64, 46, 77, 46, 89, 46, 96, 51, 103, 64, 109, 74, 110, 83, 110, 94, 107, 106, 102, 116, 94, 124, 84, 127, 79, 128, 78, 128, 94, 128, 123, 128, 161, 128, 175]));
  }
  cb("\b", new Uint8Array([183, 103, 182, 103, 180, 103, 176, 103, 169, 103, 159, 103, 147, 103, 133, 103, 116, 103, 101, 103, 85, 103, 73, 103, 61, 103, 52, 103, 38, 103, 34, 103, 29, 103, 27, 103, 26, 103, 25, 103, 24, 103]));
  cb(" ", new Uint8Array([39, 118, 40, 118, 41, 118, 44, 118, 47, 118, 52, 118, 58, 118, 66, 118, 74, 118, 84, 118, 94, 118, 104, 117, 114, 116, 123, 116, 130, 116, 144, 116, 149, 116, 154, 116, 158, 116, 161, 116, 163, 116]));
};

exports.input = function(options) {
  options = options||{};
  let input_mode = exports.INPUT_MODE_ALPHA;
  var text = options.text;
  if ("string"!=typeof text) text="";

  function setupStrokes() {
    Bangle.strokes = {};
    exports.getStrokes(input_mode, (id,s) => Bangle.strokes[id] = Unistroke.new(s) );
  }
  setupStrokes();

  var flashToggle = false;
  const R = Bangle.appRect;
  var Rx1;
  var Rx2;
  var Ry1;
  var Ry2;
  let flashInterval;
  let shift = false;
  let lastDrag;

  function findMarker(strArr) {
    if (strArr.length == 0) {
      Rx1 = 4;
      Rx2 = 6*4;
      Ry1 = 8*4 + R.y;
      Ry2 = 8*4 + 3 + R.y;
    } else if (strArr.length <= 4) {
      Rx1 = (strArr[strArr.length-1].length)%7*6*4 + 4 ;
      Rx2 = (strArr[strArr.length-1].length)%7*6*4 + 6*4;
      Ry1 = (strArr.length)*(8*4) + Math.floor((strArr[strArr.length-1].length)/7)*(8*4) + R.y;
      Ry2 = (strArr.length)*(8*4) + Math.floor((strArr[strArr.length-1].length)/7)*(8*4) + 3 + R.y;
    } else {
      Rx1 = (strArr[strArr.length-1].length)%7*6*4 + 4 ;
      Rx2 = (strArr[strArr.length-1].length)%7*6*4 + 6*4;
      Ry1 = (4)*(8*4) + Math.floor((strArr[strArr.length-1].length)/7)*(8*4) + R.y;
      Ry2 = (4)*(8*4) + Math.floor((strArr[strArr.length-1].length)/7)*(8*4) + 3 + R.y;
    }
    //print(Rx1,Rx2,Ry1, Ry2);
    return {x:Rx1,y:Ry1,x2:Rx2,y2:Ry2};
  }

  function draw(noclear) {
    g.reset();
    var l = g.setFont("6x8:4").wrapString(text+' ', R.w-8);
    if (!l) l = [];
    //print(text+':');
    //print(l);
    if (!noclear) (flashToggle?(g.fillRect(findMarker(l))):(g.clearRect(findMarker(l))));
    if (l.length>4) l=l.slice(-4);
    g.drawString(l.join("\n"),R.x+4,R.y+4);
  }

  /*
  // This draws a big image to use in the README
  (function() {
    E.defrag();
    var b = Graphics.createArrayBuffer(500,420,1,{msb:true});
    var n=0;
    exports.getStrokes((id,s) => {
      var x = n%6;
      var y = (n-x)/6;
      s = b.transformVertices(s, {scale:0.55, x:x*85-20, y:y*85-20});
      b.fillCircle(s[0],s[1],3);
      b.drawPoly(s);
      n++;
    });
    b.dump();
  })()
  */

  function show() {
    if (flashInterval) clearInterval(flashInterval);
    flashInterval = undefined;

    g.reset();
    g.clearRect(R).setColor("#f00");
    var n=0;
    exports.getStrokes(input_mode, (id,s) => {
      var x = n%6;
      var y = (n-x)/6;
      s = g.transformVertices(s, {scale:0.16, x:R.x+x*30-4, y:R.y+y*30-4});
      g.fillRect(s[0]-1,s[1]-2,s[0]+1,s[1]+1);
      g.drawPoly(s);
      n++;
    });
  }

  function isInside(rect, e) {
    return e.x>=rect.x && e.x<rect.x+rect.w
          && e.y>=rect.y && e.y<=rect.y+rect.h;
  }

  function isStrokeInside(rect, stroke) {
    for(let i=0; i < stroke.length; i+=2) {
      if (!isInside(rect, {x: stroke[i], y: stroke[i+1]})) {
        return false;
      }
    }
    return true;
  }

  function strokeHandler(o) {
    //print(o);
    if (!flashInterval)
      flashInterval = setInterval(() => {
        flashToggle = !flashToggle;
        draw(false);
      }, 1000);
    if (o.stroke!==undefined && o.xy.length >= 6 && isStrokeInside(R, o.xy)) {
      var ch = o.stroke;
      if (ch=="\b") text = text.slice(0,-1);
      else if (ch==="SHIFT") { shift=!shift; Bangle.drawWidgets(); }
      else text += shift ? ch.toUpperCase() : ch;
    }
    lastDrag = undefined;
    g.clearRect(R);
    flashToggle = true;
    draw(false);
  }

  // Switches between alphabetic and numeric input
  function cycleInput() {
    input_mode++;
    if (input_mode > exports.INPUT_MODE_NUM) input_mode = 0;
    shift = false;
    setupStrokes();
    show();
    Bangle.drawWidgets();
  }

  Bangle.on('stroke',strokeHandler);
  g.reset().clearRect(R);
  show();
  draw(false);

  // Create Widget to switch between alphabetic and numeric input
  WIDGETS.kbswipe={
    area:"tl",
    width: 36, // 3 chars, 6*2 px/char
    draw: function() {
      g.reset();
      g.setFont("6x8:2x3");
      g.setColor("#f00");
      if (input_mode === exports.INPUT_MODE_ALPHA) {
        g.drawString(shift ? "ABC" : "abc", this.x, this.y);
      } else if (input_mode === exports.INPUT_MODE_NUM) {
        g.drawString("123", this.x, this.y);
      }
    }
  };

  return new Promise((resolve,reject) => {
    Bangle.setUI({mode:"custom", drag:e=>{
      "ram";
      if (isInside(R, e)) {
        if (lastDrag) g.reset().setColor("#f00").drawLine(lastDrag.x,lastDrag.y,e.x,e.y);
        lastDrag = e.b ? e : 0;
      }
    },touch:(n,e) => {
      if (WIDGETS.kbswipe && isInside({x: WIDGETS.kbswipe.x, y: WIDGETS.kbswipe.y, w: WIDGETS.kbswipe.width, h: 24}, e)) {
        // touch inside widget
        cycleInput();
      } else if (isInside(R, e)) {
        // touch inside app area
        show();
      }
    }, back:()=>{
      delete WIDGETS.kbswipe;
      Bangle.removeListener("stroke", strokeHandler);
      if (flashInterval) clearInterval(flashInterval);
      Bangle.setUI();
      g.clearRect(Bangle.appRect);
      resolve(text);
    }});
  });
};
