// pooqRoman resource maker
//
// Copyright (c) 2021 Stephen P Spackman
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// Notes:
//
//////////////////////////////////////////////////////////////////////////////
/*                              ==ASSETS==                                  */


const enc = x => {
    const d = btoa(require("heatshrink").compress(x));
    var r = "'" + d.substr(0, 64);
    for (let i = 64; i < d.length; i += 64) r += "' +\n    '" + d.substr(i, 64);
    return r + "'";
};

const prepBitmap = (name, data) => {
    const image = Graphics.createImage(data);
    const raw = String.fromCharCode(image.width, image.height, 0x81, 0) + image.buffer;
    const x = `
const ${name}I = dec(${enc(raw)});
`;
    return x;
};

const prepFont = (name, data) => {
    const image = Graphics.createImage(data);
    const lengths = Uint8Array(256);
    const offsets = Uint16Array(256);
    const adjustments = Uint16Array(256);
    let min = Infinity, max = -Infinity;
    const lines = data.split('\n');
    let m;
    // This regexp is clearly suboptimal, but Espruino's regexp engine is really wonky
    // and doesn't process nested parentheses or alternation correctly.
    for (let i = 0; i < 5 && !(m = /^(<*)=([*\d]+)(=*)(>*)$/.exec(lines[i])); i++);
    if (!m) throw new Error('Missing or incorrect header');
    const desc = m[1].length, body = 1 + m[2].length + m[3].length, asc = m[4].length;
    const h = desc + body + asc;
    let width = m[2] == '*' ? null : +m[2];
    let c = null, o = 0;
    lines.forEach((line, l) => {
      m = /^(<*)(=)([*\d]*)(=*)(>*)$/.exec(line) || /^(<*)(-)(.)(-*)(>*)$/.exec(line);
      if (m) {
        const h = m[2] == '=';
        if (m[1].length > desc || h && m[1].length != desc)
          throw new Error('Invalid descender height at ' + l);
        if (m[2].length + m[3].length + m[4].length != body)
          throw new Error('Invalid body height at ' + l);
        if (m[5].length > asc || h && m[5].length != asc)
          throw new Error('Invalid ascender height at ' + l);
        if (c != null) {
          lengths[c] = l - o;
          if (width !== null && width !== lengths[c])
            throw new Error(
              `Character has width ${lengths[c]} != ${width} at ${offsets[c]}`
            );
          c = null
        }
        if (!h) {
          c = m[3].charCodeAt(0);
          if (c < min) min = c;
          if (c > max) max = c;
          o = l + 1;
          offsets[c] = l;
          adjustments[c] = m[1].length
        }
      }
    });
    const xoffs = Uint8Array(lines.length);
    const ypos = Uint16Array(lines.length);
    ypos.fill(0xffff);
    //const w0 = lengths[min];
    let widths = '';
    for (c = min, o = 0; c <= max; c++) {
        for (let i = 0, j = offsets[c]; i < lengths[c]; i++) {
            xoffs[j] = asc + body + adjustments[c] - 1;
            ypos[j++] = o++;
        }
        widths += String.fromCharCode(lengths[c]);
    }
    const raster = Graphics.createArrayBuffer(h, o, 1, {msb: true});
    const writer = Graphics.createCallback(
        image.width, image.height, 1,
        (x, y, col) => raster.setPixel(xoffs[y] - x, ypos[y], col)
    );
    writer.drawImage(image);
    if (width === null) width = `dec(${enc(widths)})`;
    const x = `const ${name}F = [
  dec(
    ${enc(raster.buffer)}
  ), ${min}, ${width}, ${h}
];`;
    return x;
};

let res = `
const heatshrink = require('heatshrink');
const dec = x => E.toString(heatshrink.decompress(atob(x)));
`;

res += prepFont('romanParts', `
<=*==============
-a--------------
x              x
xx            xx
-b--------------
xxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxx
-c--------------
xx            xx
x              x
-d--------------
xx            xx
xx            xx
xx            xx
xxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxx
-e--------------
xx            xx
x           xxxx
<-f--------------
         xxxxxxxx
      xxxxxxxxxxx
   xxxxxxx     xx
 xxxxxx         x
xxxxx
 xxxxxx         x
   xxxxxxx     xx
      xxxxxxxxxxx
         xxxxxxxx
-g--------------
            xxxx
              xx
               x
-h--------------
               x
              xx
            xxxx
-i--------------
x           xxxx
xx            xx
-j--------------
xx            xx
xxx          xxx
xxxx        xxxx
xxxxxx    xxxxxx
xx xxxx  xxxx xx
x    xxxxxx    x
      xxxx
x    xxxxxx    x
xx xxxx  xxxx xx
xxxxxx    xxxxxx
xxxx        xxxx
xxx          xxx
xx            xx
-k--------------
x              x
<-l--------------
        xx      x
     xxxxxx    xx
   xxxx xxxx  xxx
 xxxx   xx xxxx x
xxx         xx
 xxxx   xx xxxx x
   xxxx xxxx  xxx
     xxxxxx    xx
        xx      x
-m--------------
x      xx      x
xx    xxxx    xx
xxx  xxxxxx  xxx
x xxxx xx xxxx x
   xx      xx
x xxxx xx xxxx x
xxx  xxxxxx  xxx
xx    xxxx    xx
x      xx      x
-n--------------
    xxxxxxxx
  xxxxxxxxxxxx
 xxxx      xxxx
xxxx        xxxx
xxx          xxx
xx    xxxx    xx
xx    xxxx    xx
xxx          xxx
xxxx        xxxx
 xxxx      xxxx
  xxxxxxxxxxxx
    xxxxxxxx
<=*==============
`);

res += prepFont('font', `
<<<<=*======>>>>
- ------

-.------
xx
xx
-0------>>>>
  xxxxxxxx
 xxxxxxxxxx
xxx      xxx
xx        xx
xx        xx
xxx      xxx
 xxxxxxxxxx
  xxxxxxxx

-1------>>>>
xx       x
xx       xx
xxxxxxxxxxxx
xxxxxxxxxxxx
xx
xx

-2------>>>>
x        x
xx       xx
xxx      xxx
xxxx      xx
xxxxx     xx
xx xxx   xxx
xx  xxxxxxx
xx   xxxxx

-3------>>>>
  x       xx
 xx   x   xx
xxx   xx  xx
xx    xxx xx
xx    xxxxxx
xxx  xxx xxx
 xxxxxx   xx
  xxx      x

-4------>>>>
   x
   xx
   xxxx
   xxxxxxxxx
xxxxx  xxxxx
xxxxx
   xx
   xx

-5------>>>>
  x   xxxxxx
 xx   xxxxxx
xxx   xx  xx
xx    xx  xx
xx    xx  xx
xxx  xxx  xx
 xxxxxx   xx
  xxxx

-6------>>>>
  xxxx
 xxxxxxx
xxx  xxxxx
xx    xxxxx
xx    xx xxx
xxx  xxx  xx
 xxxxxx    x
  xxxx

-7------>>>>
          xx
          xx
xxxx      xx
xxxxxx    xx
    xxxx  xx
      xxxxxx
        xxxx
           x

-8------>>>>
  xxx  xxx
 xxxxxxxxxx
xxx xxxx xxx
xx   xx   xx
xx   xx   xx
xxx xxxx xxx
 xxxxxxxxxx
  xxx  xxx

-9------>>>>
      xxxx
x    xxxxxx
xx  xxx  xxx
xxx xx    xx
 xxxxx    xx
  xxxxx  xxx
    xxxxxxx
      xxx

-A------>>>>
xx
xxxxx
 xxxxxxx
   xxxxxxx
   xx   xxxx
   xxxxxxx
 xxxxxxx
xxxxx
xx

-D------>>>>
xx        xx
xxxxxxxxxxxx
xxxxxxxxxxxx
xx        xx
xx        xx
xxx      xxx
 xxxxxxxxxx
  xxxxxxxx

-F------>>>>
xxxxxxxxxxxx
xxxxxxxxxxxx
     xx   xx
     xx   xx
     xx   xx
          xx
-I------>>>>
xxxxxxxxxxxx
xxxxxxxxxxxx

-J------>>>>
  xx
 xxx      xx
xxx       xx
xx        xx
xxx       xx
 xxxxxxxxxxx
  xxxxxxxxxx
          xx
-M------>>>>
xxxxxxxxxxxx
xxxxxxxxxxx
       xxx
     xxxx
     xxxx
       xxx
xxxxxxxxxxx
xxxxxxxxxxxx

-N------>>>>
xxxxxxxxxxxx
xxxxxxxxxxx
       xxx
     xxx
    xxx
  xxx
 xxxxxxxxxxx
xxxxxxxxxxxx

-O------>>>>
  xxxxxxxx
 xxxxxxxxxx
xxx      xxx
xx        xx
xx        xx
xxx      xxx
 xxxxxxxxxx
  xxxxxxxx

-S------>>>>
  x    xxx
 xx   xxxxx
xxx   xx xxx
xx   xx   xx
xx   xx   xx
xxx xx   xxx
 xxxxx   xx
  xxx    x

-T------>>>>
          xx
          xx
          xx
xxxxxxxxxxxx
xxxxxxxxxxxx
          xx
          xx
          xx
-V------>>>>
         xxx
      xxxxxx
   xxxxx
xxxxx
   xxxxx
      xxxxxx
         xxx

-W------>>>>
        xxxx
    xxxxxxxx
xxxxxxxx
  xxxx
    xxxx
  xxxx
xxxxxxxx
    xxxxxxxx
        xxxx
-X------>>>>
xx        xx
xxx      xxx
  xxx  xxx
    xxxx
    xxxx
  xxx  xxx
xxx      xxx
xx        xx

-a------
 xxx
xxxxx x
xx xx xx
xx xx xx
xx xx xx
 xxxxxx
xxxxxx

-b------>>>>
xxxxxxxxxxxx
 xxxxxxxxxxx
xx    xx
xx    xx
xxx  xxx
 xxxxxx
  xxxx

-c------
  xxxx
 xxxxxx
xxx  xxx
xx    xx
xx    xx
 xx  xx
  x  x

-d------>>>>
  xxxx
 xxxxxx
xxx  xxx
xx    xx
xx    xx
 xxxxxxxxxxx
xxxxxxxxxxxx

-e------
  xxxx
 xxxxxx
xx xx xx
xx xx xx
xx xx xx
 x xxxx
   xxx

<<<<-g------
  x   xxxx
 xx  xxxxxx
xx  xxx  xxx
xx  xx    xx
xxx xx   xxx
 xxxxxxxxxx
   xxxxxxxxx

-h------>>>>
xxxxxxxxxxxx
xxxxxxxxxxxx
     xx
      xx
     xxx
xxxxxxx
xxxxxx

-i------>>>>
xxxxxxxx xx
xxxxxxxx xx

-l------>>>>
xxxxxxxxxxxx
xxxxxxxxxxxx

-m------
xxxxxxxx
xxxxxxx
     xxx
     xxx
xxxxxxx
xxxxxxx
     xxx
     xxx
xxxxxxx
xxxxxx

-n------
xxxxxxxx
xxxxxxx
     xxx
      xx
     xxx
xxxxxxx
xxxxxx

-o------
  xxxx
 xxxxxx
xxx  xxx
xx    xx
xxx  xxx
 xxxxxx
  xxxx

<<<<-p------
xxxxxxxxxxxx
xxxxxxxxxxx
    xx    xx
    xx    xx
    xxx  xxx
     xxxxxx
      xxxx

-r------
xxxxxxxx
xxxxxxx
     xxx
      xx
      xx
     xx

-s------
 x  xxx
xx xxxxx
xx xx xx
xx xx xx
xxxxx xx
 xxx  x

-t------>>>>
      xx
  xxxxxxxxx
 xxxxxxxxxx
xxx   xx
xx    xx
xx    xx
 xx

-u------
  xxxxxx
 xxxxxxx
xxx
xx
xxx
 xxxxxxx
xxxxxxxx

-v------
      xx
    xxxx
  xxxx
xxxx
  xxxx
    xxxx
      xx

<<<<-y------
  x   xxxxxx
 xx  xxxxxxx
xx  xxx
xx  xx
xxx xxx
 xxxxxxxxxxx
   xxxxxxxxx

<<<<=*======>>>>
`);

res += prepBitmap('lock', `
      xxxxxx
     xxxxxxxx
    xxx    xxx
   xxx      xxx
   xxx      xxx
   xxx      xxx
   xxx      xxx
 xxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxx
 xxx          xxx
 xxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxx
 xxx          xxx
 xxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxx
 xxx          xxx
 xxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxx
`);

res += prepBitmap('battery', `
       xxxx
       xxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
   xxxxxxxxxxxx
`);

res += prepBitmap('charge', `
          x
         xx
        xx
       xxx
      xxx
     xxxxxxxxx
    xxxxxxxxx
         xxx
        xxx
        xx
       xx
       x
`);

res += prepBitmap('GPS', `
    x
   x x
  x   x
   x   x
    x x  xxxx
     x  xxxxx 
       xxxxxx
        xxxxx
     x   xxx  x
   x x    x  x x
 x x  x     x   x
 x x   xx    x   x
 x  x         x x
  x  xxx       x
   x
    xxx
`);

res += prepBitmap('HRM', `
  xxxx     xxxx
 xxxxxx   xxxxxx
 xx xxxx xxx xxx
xxx xxxxxxxx xxxx
xxx xxxxxxxx xxxx
xxx xxxxxxxx xxxx
xx  xxxxxxx  xxxx
xx  xx xxxx  xx x
 xx   x    x   x
 xx xxxxxxxx xxx
  xxxxxxxxxxxxx
   xxxxxxxxxxx
    xxxxxxxxx
     xxxxxxx
      xxxxx
       xxx
        x
`);

res += prepBitmap('compass', `
      xxxxx
    xxxxxxxxx
   xxx  x  xxx
  xx    x    xx
 xx     x     xx
 xx    xxx    xx
xx     xxx     xx
xx     xxx     xx
xx     xxx     xx
xx    xx xx    xx
xx    xx xx    xx
 xx   x   x   xx
 xx   x   x   xx
  xx         xx
   xxx     xxx
    xxxxxxxxx
      xxxxx
`);

print(res);
