/* Image filtering code that helps to transform the OSM tile
into something that's usable on a 3bpp screen.

Stick this in a file so we can
*/


function imageFilterFor3BPP(srcData, dstData, options) {
  options = options || {};
  if (options.colLo === undefined)
    options.colLo = 140; // when adding contrast/saturation, this is the max saturaton we add
  if (options.colHi === undefined)
    options.colHi = 250;
  if (options.sharpen === undefined)
    options.sharpen = true;
  if (options.dither === undefined)
    options.dither = false;

  const width = srcData.width;
  const height = srcData.height;
  var rgbaSrc = srcData.data;
  var rgbaDst = dstData.data;
  function getPixel(x,y) {
    if (x<0) x=0;
    if (y<0) y=0;
    if (x>=width) x=width-1;
    if (y>=height) y=height-1;
    var i = (x + y*width)*4;
    return [
      rgbaSrc[i+0], rgbaSrc[i+1], rgbaSrc[i+2]
    ];
  }
  function dmul(a, mul) { return a.map(a => a.map(n=>n*mul)); }
  const KS = 5; // kernel size
  const KO = 2; // kernel offset
  const K = dmul([ // 5x5 sharpening kernel
    [ 1,4,6,4,1 ],
    [4,16,24,16,4],
    [6,24,-476,24,6],
    [4,16,24,16,4],
    [ 1,4,6,4,1 ],
  ], -1/256);
  /*const KS = 7; // kernel size
  const KO = 3; // kernel offset
  const K = dmul([ // 7x7 sharpening (gaussian -  2x middle pixel)
    [ 0, 0, 1, 2, 1, 0, 0 ],
    [ 0, 3,13,22,13, 3, 0 ],
    [ 1,13,59,97,59,13, 1 ],
    [ 2,22,97,159-2006,97,22,2 ],
    [ 1,13,59,97,59,13, 1 ],
    [ 0, 3,13,22,13, 3, 0 ],
    [ 0, 0, 1, 2, 1, 0, 0 ],
  ], -1/1003);*/
  const DITHERM = 3; // dither width -1 (dither must be power 2)
  const DITHER = dmul([ // dithering matrix
    [ 0,1,2,3 ],
    [ 1,2,3,0 ],
    [ 2,3,2,1 ],
    [ 3,2,1,0 ],
  ], 256/4);


  var idx=0;
  for (var y=0;y<height;y++) {
    for (var x=0;x<width;x++) {
      var col;
      if (options.sharpen) {
        // Apply a sharpening filter
        var col = [0,0,0];
        for (var ky=0;ky<KS;ky++)
          for (var kx=0;kx<KS;kx++) {
            var c = getPixel(x+kx-KO, y+ky-KO);
            col[0] += c[0] * K[kx][ky];
            col[1] += c[1] * K[kx][ky];
            col[2] += c[2] * K[kx][ky];
          }
        for (var n=0;n<3;n++) {
          col[n] = Math.round(col[n]);
          if (col[n]<0) col[n]=0;
          if (col[n]>255) col[n]=255;
        }
      } else { // if not sharpening, just get pixel
        col = getPixel(x,y);
      }
      // increase saturation / contrast
      var min = Math.min(col[0], col[1], col[2]);
      var max = Math.max(col[0], col[1], col[2]);
      var d = max-min;
      if (min>options.colLo) min=options.colLo;
      if (max<options.colHi) max=options.colHi;
      d = max-min;
      for (var n=0;n<3;n++) {
        col[n] = (col[n]-min) * 256 / d;
        if (options.dither) { //  && col[n]<192 is more pleasant
          if (col[n] > DITHER[x&DITHERM][y&DITHERM]) // dither
            col[n] = 255;
          else
            col[n] = 0;
        }
        rgbaDst[idx+n] = col[n];
      }
      rgbaDst[idx+3] = 255;
      idx+=4;
    }
  }
}
