// pooqRoman resource maker
//
// Copyright (c) 2021, 2022 Stephen P Spackman
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

res += prepFont('y10', `
=*================================
-0--------------------------------
             xxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxxxxxx
         xxxxxxxxxxxxxxxxxxxxxxxx
         xxxxx              xxxxx
        xxxxx                xxxxx
        xxxx                  xxxx
        xxxx                  xxxx
        xxxxx                xxxxx
         xxxxx              xxxxx
         xxxxxxxxxxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxxxxxx
             xxxxxxxxxxxxxxxx
-1--------------------------------
           xxx
          xxx
         xxx
        xxx                  x
       xxx                    x
      xxxxxxxxxxxxxxxxxxxxxxxxxx
     xxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   xxx
  xxx
 xxx
xxx
-2--------------------------------
           x                xxx
          xx                 xxx
         xxxx                 xxx
        xxxxx                 xxx
       xxxxxxx                 xxx
      xxxx xxx                 xxx
     xxxx  xxxx               xxxx
    xxxx    xxxxx            xxxx
   xxxx      xxxxxxx      xxxxxx
  xxxx        xxxxxxxxxxxxxxxxx
 xxxx           xxxxxxxxxxxxxx
xxxx               xxxxxxxxx
-3--------------------------------
             xxx        x      xxx
           xxx          xx     xxx
         xxxx           xxx    xxx
        xxxx            xxxx   xxx
       xxxx             xxxxx  xxx
      xxxx              xxxxxx xxx
      xxx              xxxx xxxxxx
      xxxx            xxxxx  xxxxx
      xxxxxxx      xxxxxxx    xxxx
       xxxxxxxxxxxxxxxxxxx     xxx
        xxxxxxxxxxxxxxxxx       xx
           xxxxxxxxxxx           x
-4--------------------------------
               xxxx
              xxxxxx
             xxxxxxxx
            xxxx  xxxx
           xxxx    xxxxxx
          xxxx      xxxxxxxx
     xxxxxxxxxxxx     xxxxxxxxx
    xxxxxxxxxxxx        xxxxxxxxxx
   xxxxxxxxxxxx            xxxxxxx
      xxxx                     xxx
     xxxx
    xxxx
-5--------------------------------
             xxx     xxxxxxxxxxxxx
           xxx        xxxxxxxxxxxx
         xxxx         xxxxxxxxxxxx
        xxxx           xxx     xxx
       xxxx            xxx     xxx
      xxxx             xxx     xxx
      xxx             xxxx     xxx
      xxxx           xxxxx     xxx
      xxxxxx       xxxxxx      xxx
       xxxxxxxxxxxxxxxxxx      xxx
        xxxxxxxxxxxxxxxx       xxx
          xxxxxxxxxxxx         xxx
-6--------------------------------
              xxxxxxxxxx
           xxxxxxxxxxxxxxxx
         xxxxxxxxxxxxxxxxxxxx
        xxxxxx  xxxxxxxxxxxxxx
       xxxx        xxxx   xxxxx
      xxxx          xxxx    xxxx
      xxx            xxx     xxx
      xxxx          xxxx     xxxx
      xxxxxx      xxxxxx      xxx
       xxxxxxxxxxxxxxxx       xxxx
        xxxxxxxxxxxxxx         xxx
          xxxxxxxxxx            xx
-7--------------------------------
                               xxx
                               xxx
         xxxxxxx               xxx
        xxxxxxxxxxxxxx         xxx
       xxxxxxxxxxxxxxxxxxx     xxx
               xxxxxxxxxxxxxx  xxx
                     xxxxxxxxxxxxx
                         xxxxxxxxx
                            xxxxxx
                              xxxx
                                xx
                                 x
-8--------------------------------
             xxxxxxx
           xxxxxxxxxxxx  xxxxxx
         xxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxx    xxxxxxxxxxxxxxx
       xxxx         xxxxx     xxxx
      xxxx           xxx       xxx
      xxx            xxx       xxx
      xxxx          xxxxx     xxxx
      xxxxxx      xxxxxxxxxxxxxxx
       xxxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxxxxxx  xxxxxx
          xxxxxxxxxx
-9--------------------------------
                      xxxxxxxx
                    xxxxxxxxxxxx
         x         xxxxxxxxxxxxxx
        xx        xxxxx     xxxxxx
        xxx      xxxx         xxxx
        xxx      xxx           xxx
        xxxx     xxxx          xxx
         xxxxx    xxxx        xxxx
          xxxxxxx  xxxxx    xxxxxx
           xxxxxxxxxxxxxxxxxxxxxx
             xxxxxxxxxxxxxxxxxxx
                xxxxxxxxxxxxxx
=*================================
`);

res += prepFont('y1', `
=*==============================================
-0----------------------------------------------
             xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
         xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
         xxxxx                            xxxxx
        xxxx                                xxxx
        xxx                                  xxx
        xxx                                  xxx
        xxxx                                xxxx
         xxxxx                            xxxxx
         xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
             xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-1----------------------------------------------
           xxx
          xxx                            x
         xxx                             xx
        xxx                               xx
       xxx                                xxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   xxx
  xxx
 xxx
xxx
-2----------------------------------------------
           x                              xxx
          xx                               xxx
         xxxx                               xxx
        xxxxxx                              xxx
       xxxxxxxx                              xxx
      xxxx xxxxx                             xxx
     xxxx   xxxxxx                          xxxx
    xxxx     xxxxxxxx                      xxxx
   xxxx       xxxxxxxxxxx             xxxxxxxx
  xxxx          xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 xxxx              xxxxxxxxxxxxxxxxxxxxxxxxx
xxxx                   xxxxxxxxxxxxxxxxx
-3----------------------------------------------
             xxx                  x          xxx
           xxx                    xx         xxx
         xxxx                     xxxx       xxx
        xxxx                      xxxxx      xxx
       xxxx                       xxxxxxx    xxx
      xxxx                        xxxxxxxx   xxx
      xxx                        xxxx  xxxxx xxx
      xxxxx                   xxxxxxx   xxxxxxxx
      xxxxxxxxxx          xxxxxxxxxx      xxxxxx
       xxxxxxxxxxxxxxxxxxxxxxxxxxxx        xxxxx
         xxxxxxxxxxxxxxxxxxxxxxxx            xxx
              xxxxxxxxxxxxxxx                 xx
-4----------------------------------------------
               xxxx
              xxxxxxx
             xxxxxxxxxxx
            xxxx   xxxxxxxx
           xxxx      xxxxxxxxx
          xxxx         xxxxxxxxxxxxx
     xxxxxxxxxxxx         xxxxxxxxxxxxxxxx
    xxxxxxxxxxxx             xxxxxxxxxxxxxxxxxxx
   xxxxxxxxxxxx                     xxxxxxxxxxxx
      xxxx                                xxxxxx
     xxxx
    xxxx
-5----------------------------------------------
             xxx            xxxxxxxxxxxxxxxxxxxx
           xxx               xxxxxxxxxxxxxxxxxxx
         xxxx                xxxxxxxxxxxxxxxxxxx
        xxxx                  xxx            xxx
       xxxx                   xxx            xxx
      xxxx                    xxx            xxx
      xxx                    xxxx            xxx
      xxxx                 xxxxxx            xxx
      xxxxxxxxx         xxxxxxxx             xxx
       xxxxxxxxxxxxxxxxxxxxxxxxx             xxx
         xxxxxxxxxxxxxxxxxxxxx               xxx
             xxxxxxxxxxxxxx                  xxx
-6----------------------------------------------
             xxxxxxxxxxxxxxxxxxx
           xxxxxxxxxxxxxxxxxxxxxxxxxx
         xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxx      xxxxxxxxxxxxxxxxxxxxx
       xxxxxx             xxxx      xxxxxxxx
       xxxx                xxxx         xxxxx
       xxx                  xxx           xxxx
       xxxx                xxxx            xxx
       xxxxxxxx        xxxxxxxx            xxxx
       xxxxxxxxxxxxxxxxxxxxxxx              xxx
         xxxxxxxxxxxxxxxxxxxxx               xxx
            xxxxxxxxxxxxxxx                   xx
-7----------------------------------------------
                                             xxx
                                             xxx
         xxxxxxxxxx                          xxx
        xxxxxxxxxxxxxxxxxxx                  xxx
       xxxxxxxxxxxxxxxxxxxxxxxxxxxx          xxx
                  xxxxxxxxxxxxxxxxxxxxxxx    xxx
                          xxxxxxxxxxxxxxxxxxxxxx
                                  xxxxxxxxxxxxxx
                                        xxxxxxxx
                                            xxxx
                                              xx
                                               x
-8----------------------------------------------
             xxxxxxxxxxxxx
           xxxxxxxxxxxxxxxxxxx   xxxxxxxxxxxx
         xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxx          xxxxxxxxxxxxxxxxxxxxxxx
       xxxx                 xxxxxx          xxxx
      xxxx                   xxx             xxx
      xxx                    xxx             xxx
      xxxx                  xxxxxx          xxxx
      xxxxxx            xxxxxxxxxxxxxxxxxxxxxxx
       xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxxxxxxxxxxxxx   xxxxxxxxxxxx
          xxxxxxxxxxxxxxxx
-9----------------------------------------------
                                xxxxxxxxxx
          x                  xxxxxxxxxxxxxxxx
         xx                 xxxxxxxxxxxxxxxxxxx
        xxxx               xxxxxxx      xxxxxxxx
        xxxx              xxxxx            xxxxx
        xxxxx             xxx                xxx
         xxxxxx           xxxx               xxx
          xxxxxxx          xxxx            xxxxx
           xxxxxxxxxxx      xxxxxx      xxxxxxxx
             xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
               xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                   xxxxxxxxxxxxxxxxxxxxxxx
=*==============================================
`);

res += prepFont('y10s', `
=*====================
-0--------------------
       xxxxxxxxxxxx
     xxxxxxxxxxxxxxxx
    xxxx          xxxx
    xx              xx
    xxxx          xxxx
     xxxxxxxxxxxxxxxx
       xxxxxxxxxxxx

-1--------------------
      xx
     xx           x
    xx            xx
   xxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxx
 xx
xx

-2--------------------
      xxx          x
     xxxxx         xx
    xx xxx          xx
   xx   xxx         xx
  xx     xxxx     xxxx
 xx       xxxxxxxxxxx
xx           xxxxx

-3--------------------
      x             xx
     xx      x      xx
    xx       xxx    xx
    xx       xxxxx  xx
    xxx     xxx xxxxxx
     xxxxxxxxx    xxxx
       xxxxxx       xx

-4--------------------
         xxxxx
        xxxxxxx
       xxx  xxxxxx
   xxxxxxxx   xxxxxx
  xxxxxxxxxx    xxxxxx
    xxx
   xxx

-5--------------------
      x     xxxxxxxxxx
     xx      xxxxxxxxx
    xx        xx    xx
   xx         xx    xx
   xxxx      xxx    xx
    xxxxxxxxxxx     xx
      xxxxxxxx

-6--------------------
      xxxxxxxxx
     xxxxxxxxxxxxx
    xxxx   xxxxxxxxx
    xx       xx  xxxx
    xxxx   xxxx    xxx
     xxxxxxxxx      xx
      xxxxxxx        x

-7--------------------
                    xx
     xxxxx          xx
    xxxxxxxxx       xx
         xxxxxxx    xx
             xxxxx  xx
                xxxxxx
                   xxx

-8--------------------
      xxxxxx   xxxxx
     xxxxxxxx xxxxxxx
    xxx    xxxxx   xxx
    xx      xxx     xx
    xxx    xxxxx   xxx
     xxxxxxxxxxxxxxxx
      xxxxxx   xxxxx

-9--------------------
               xxxx
     x       xxxxxxxx
    xxx     xxxx  xxxx
    xxxx    xx      xx
     xxxxx  xxxx  xxxx
       xxxxxxxxxxxxxx
         xxxxxxxxxx

=*====================
`);

res += prepFont('y1s', `
=*=============================
-0-----------------------------
        xxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxx
     xxxx                  xxxx
     xx                      xx
     xx                      xx
     xxxx                  xxxx
      xxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxxxxxxxxxxx
-1-----------------------------
       xx
      xx                   x
     xx                    xx
    xxxxxxxxxxxxxxxxxxxxxxxxxx
   xxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xx
 xx
-2-----------------------------
       xxx                  x
      xxxxx                 xx
     xx  xxx                 xx
    xx    xxx                xx
   xx      xxxx           xxxxx
  xx        xxxxxx      xxxxxx
 xx           xxxxxxxxxxxxxx
xx               xxxxxxxx
-3-----------------------------
       x                     xx
      xx           x         xx
     xx            xxx       xx
     xx            xxxxx     xx
     xx            xx xxxx   xx
     xxxx        xxxx   xxxx xx
      xxxxxxxxxxxxxx      xxxxx
        xxxxxxxxxx          xxx
-4-----------------------------
          xxxx
         xxxxxxxx
        xxx xxxxxxxxx
       xxx     xxxxxxxxxx
   xxxxxxxx         xxxxxxxxxxx
  xxxxxxxxxx
    xxx
   xxx
-5-----------------------------
       x          xxxxxxxxxxxxx
      xx           xxxxxxxxxxxx
     xx            xx        xx
    xx             xx        xx
    xxx            xx        xx
     xxxx        xxxx        xx
      xxxxxxxxxxxxxx         xx
        xxxxxxxxxx
-6-----------------------------
       xxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxx
     xxxx      xxxx  xxxxxxxx
     xx          xx      xxxxx
     xx          xx        xxxx
     xxxx      xxxx          xx
      xxxxxxxxxxxx            x
        xxxxxxxx
-7-----------------------------
                             xx
      xxxxxxx                xx
     xxxxxxxxxxxxxxx         xx
            xxxxxxxxxxxx     xx
                  xxxxxxxxx  xx
                      xxxxxxxxx
                         xxxxxx
                            xxx
-8-----------------------------
        xxxxxxx       xxxxxxx
      xxxxxxxxxxx   xxxxxxxxxx
     xxxx     xxxx xxxx     xxx
     xx         xxxxx        xx
     xx         xxxxx        xx
     xxxx     xxxx xxxx     xxx
      xxxxxxxxxxx   xxxxxxxxxx
        xxxxxxx       xxxxxxx
-9-----------------------------
                     xxxxxxx
      x            xxxxxxxxxxx
     xxx          xxxx     xxxx
     xxxx         xx         xx
      xxxxxx      xx         xx
        xxxxxxxx  xxxx     xxxx
           xxxxxxxxxxxxxxxxxxx
               xxxxxxxxxxxxx
=*=============================
`);

res += prepFont('d10', `
=*=========================
-1-------------------------
xxx
xxx              xx
xxx              xxx
xxx               xxx
xxx               xxxx
xxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxx
xxx
xxx
xxx
-2-------------------------
xxx            xx
xxxx           xxx
xxxxx           xxx
xxxxxx           xx
xxxxxxx          xxx
xxx xxxx         xxx
xxx  xxxx        xxx
xxx   xxxx       xxx
xxx    xxxxx   xxxx
xxx     xxxxxxxxxxx
xxx      xxxxxxxxx
xxx        xxxx
-3-------------------------
   xx        xxxx
  xxx         xxxx
 xxx           xxxx
xxxx      xx    xxxx
xxx       xxxx   xxxx
xxx       xxxxxx  xxxx
xxx      xxxxxxxxx xxxx
xxxx    xxxx   xxxxxxxxx
 xxxxxxxxxx       xxxxxxx
  xxxxxxxx           xxxxx
   xxxxxx               xxx
=*=========================
`);

res += prepFont('d1', `
=*==============================================
-0----------------------------------------------


            xxxxxxxxxxx
        xxxxxxxxxxxxxxxxxxxxx
     xxxxxxxxxxxxxxxxxxxxxxxxxxx
   xxxxxxxxxxxx       xxxxxxxxxxxx
  xxxxxxxx                 xxxxxxxx
 xxxxx                         xxxxx
 xxx                             xxx
xxxx                             xxxx
xxx                               xxx
xxx                               xxx
xxxx                             xxxx
 xxx                             xxx
 xxxxx                         xxxxx
  xxxxxxxx                 xxxxxxxx
   xxxxxxxxxxxx       xxxxxxxxxxxx
     xxxxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxxxxxxxxxxxx
             xxxxxxxxxxx
-1----------------------------------------------


xxx
xxx                            x
xxx                            xx
xxx                             xx
xxx                             xxx
xxx                              xxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxx
xxx
xxx
xxx
-2----------------------------------------------


xxxxxx                    xx
xxxxxxx                   xxxxx
xxxxxxxx                  xxxxxxx
xxx xxxxx                   xxxxxx
xxx  xxxxx                     xxxx
xxx   xxxxx                     xxx
xxx    xxxxx                     xxx
xxx     xxxxx                    xxx
xxx      xxxxx                   xxx
xxx       xxxxx                  xxx
xxx        xxxxx                 xxx
xxx         xxxxx               xxxx
xxx          xxxxx             xxxx
xxx           xxxxxx         xxxxxx
xxx            xxxxxxxx    xxxxxxx
xxx              xxxxxxxxxxxxxxxx
xxx                xxxxxxxxxxxx
xxx                   xxxxxx
-3----------------------------------------------


      xxx                  xxxx
    xxxxx                   xxxx
  xxxxxxx                    xxxx
  xxxxx             x         xxxx
 xxxx               xxx        xxxx
 xxx                 xxxx       xxxx
xxxx                 xxxxxx      xxxx
xxx                   xxxxxxx     xxxx
xxx                   xxxxxxxxx    xxxx
xxx                   xxx  xxxxxxx  xxxx
xxx                   xxx     xxxxxx xxxx
xxxx                 xxxx       xxxxxxxxxx
 xxx                 xxx          xxxxxxxxx
 xxxx               xxxx            xxxxxxxx
  xxxxx           xxxxx               xxxxxxx
  xxxxxxxxxxxxxxxxxxxxx                 xxxxxx
    xxxxxxxxxxxxxxxxx                     xxxxx
      xxxxxxxxxxxxx                         xxxx
-4----------------------------------------------


         xxxxx
         xxxxxxx
         xxxxxxxxx
         xxx xxxxxxx
         xxx   xxxxxxxx
         xxx     xxxxxxxxx
         xxx       xxxxxxxxxx
         xxx          xxxxxxxxxx
         xxx             xxxxxxxxxx
         xxx                xxxxxxxxxxx
xxxxxxxxxxxxxxx                 xxxxxxxxx
xxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx
         xxx
         xxx
         xxx
         xxx
         xxx
-5----------------------------------------------


   xxx           xxxxxxxxxxxxxx
  xxx             xxxxxxxxxxxxxx
 xxxx             xxxxxxxxxxxxxxx
 xxx               xxx        xxxx
xxxx               xxxx        xxxx
xxx                 xxx         xxxx
xxx                 xxx          xxxx
xxx                 xxx           xxxx
xxx                 xxx            xxxx
xxxx               xxxx             xxxx
 xxx               xxx               xxxx
 xxxx             xxxx                xxxx
  xxxx           xxxx                  xxxx
   xxxx         xxxx                    xxxx
    xxxxx     xxxxx                      xxxx
     xxxxxxxxxxxxx                        xxxx
       xxxxxxxxx                           xxxx
        xxxxxxx                             xxxx
-6----------------------------------------------


       xxxxxxxxx
    xxxxxxxxxxxxxxxx
   xxxxxxxxxxxxxxxxxxxx
  xxxxxx     xxxxxxxxxxxxx
 xxxx           xxxxxxxxxxxxx
 xxx            xxxx xxxxxxxxxxx
xxxx             xxxx    xxxxxxxxx
xxx               xxx       xxxxxxxx
xxx               xxx          xxxxxxx
xxx               xxx            xxxxxxx
xxx               xxx              xxxxxx
xxxx             xxxx                xxxxx
 xxx             xxx                   xxxx
 xxxx           xxxx
  xxxxxx     xxxxxx
   xxxxxxxxxxxxxxx
    xxxxxxxxxxxxx
       xxxxxxx
-7----------------------------------------------
                         xxxx
                          xxxx
                           xxxx
                            xxxx
                             xxxx
                              xxxx
                               xxxx
                                xxxx
xxxxxxxxxxxxx                    xxxx
xxxxxxxxxxxxxxxxxxxxx             xxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx        xxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     xxxx
                   xxxxxxxxxxxxxxxx  xxxx
                         xxxxxxxxxxxx xxxx
                              xxxxxxxxxxxxx
                                  xxxxxxxxxx
                                     xxxxxxxx
                                        xxxxxx
                                          xxxxx
                                            xxxx
-8----------------------------------------------


       xxxxxxx
    xxxxxxxxxxxxx       xxxxxxx
   xxxxxxxxxxxxxxx    xxxxxxxxxxx
  xxxxxx     xxxxxx  xxxxxxxxxxxxx
 xxxx           xxx xxxxx      xxxx
 xxx            xxxxxxx         xxxx
xxxx             xxxxx           xxx
xxx               xxxx           xxxx
xxx               xxx             xxx
xxx               xxx             xxx
xxx               xxxx           xxxx
xxxx             xxxxx           xxx
 xxx            xxxxxxx         xxxx
 xxxx           xxx xxxxx      xxxx
  xxxxxx     xxxxxx  xxxxxxxxxxxxx
   xxxxxxxxxxxxxxx    xxxxxxxxxxx
    xxxxxxxxxxxxx       xxxxxxx
       xxxxxxx
-9----------------------------------------------

                        xxxx
xxx                   xxxxxxxx
xxx                 xxxxxxxxxxxx
xxx                xxxxxx  xxxxxx
xxx               xxxxx      xxxxx
xxxx              xxx          xxx
xxxx             xxxx          xxxx
 xxxx            xxx            xxx
 xxxx           xxxx            xxxx
  xxxx          xxx              xxx
  xxxxx         xxxx            xxxx
   xxxxx         xxx            xxx
    xxxxx        xxxx          xxxx
     xxxxx        xxx          xxx
      xxxxxx      xxxxx      xxxxx
        xxxxxxxx   xxxxxx  xxxxxx
          xxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxx
                xxxxxxxxxxxx
=*==============================================
`);

res += prepFont('dow', `
=*==============================================
-1----------------------------------------------
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                    xxxxxx
                                  xxxxxx
                                xxxxxx
                              xxxxxx
                            xxxxxx
                          xxxxxx
                        xxxxxx
                          xxxxxx
                            xxxxxx
                              xxxxxx
                                xxxxxx
                                  xxxxxx
                                    xxxxxx
                xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                 xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


                                     xxxxxx
                                   xxxxxxxxxx
                                  xxxxxxxxxxxx
                                 xxxxx    xxxxx
                                 xxx        xxx
                                xxxx        xxxx
                                xxx          xxx
                                xxx          xxx
                                xxx          xxx
                                xxx          xxx
                                xxxx        xxxx
                                 xxx        xxx
                                 xxxxx    xxxxx
                                  xxxxxxxxxxxx
                                   xxxxxxxxxx
                                     xxxxxx
-2----------------------------------------------
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
         xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx

                                     xxxxxxxxxxx
                                   xxxxxxxxxxxxx
                                  xxxxxxxxxxxxxx
                                 xxxx
                                xxxx
                                xxx
                                xxx
                                xxx
                                xxxx
                                 xxxx
                                 xxxxxxxxxxxxxxx
                                xxxxxxxxxxxxxxxx
                                xxxxxxxxxxxxxxxx
-3----------------------------------------------
                                        xxxxxxxx
                                xxxxxxxxxxxxxxxx
                        xxxxxxxxxxxxxxxxxxxxxx
                xxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxxxxxxxxxxxxxx
     xxxxxxxxxxxxxxxxxx
         xxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxx
                   xxxxxxxxxxxxxxx
                        xxxxxxxxxxxxxxx
                            xxxxxxxxxx
                        xxxxxxxxxx
                     xxxxxxxxx
                 xxxxxxxxx
              xxxxxxxxxxxxxxxxx
                 xxxxxxxxxxxxxxxxxxxxxx
                         xxxxxxxxxxxxxxxxxxxxx
                                 xxxxxxxxxxxxxxx
                                         xxxxxxx


                                     xxxxxx
                                   xxxxxxxxxx
                                  xxxxxxxxxxxx
                                 xxxxx xxxxxxxx
                                 xxx   xxx  xxx
                                xxxx   xxx  xxxx
                                xxx    xxx   xxx
                                xxx    xxx   xxx
                                xxx    xxx   xxx
                                xxx    xxx   xxx
                                xxxx   xxx  xxxx
                                 xxx   xxx  xxx
                                 xxxx  xxxxxxxx
                                  xxx  xxxxxxx
                                   xx  xxxxxx
                                       xxxx
-4----------------------------------------------
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
         xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                xxxx
                                  xxxx
                                    xxx
                                     xxx
                                      xxx
                                      xxxx
                                      xxxx
                          xxxxxxxxxxxxxxxx
                           xxxxxxxxxxxxxx
                            xxxxxxxxxxx
-5----------------------------------------------
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                         xxx                 xxx
                         xxxx                xxx
                          xxx                xxx
                          xxxx               xxx
                           xxx               xxx
                           xxxx              xxx
                            xxx              xxx
                            xxxx             xxx
                             xxx             xxx
                             xxx             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx


                            xxxxxxxxxxxxxxxxxxxx
                            xxxxxxxxxxxxxxxxxxxx
                            xxxxxxxxxxxxxxxxxxx
                                          xxxx
                                           xxxx
                                            xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                             xxx
                                            xxxx
                                            xxx
                                           xxxx
                                          xxx
                                          x
-6----------------------------------------------
            xxx                   xxxxxxxx
           xxxx                 xxxxxxxxxxxx
          xxxx                 xxxxxxxxxxxxxx
         xxxx                 xxxxx      xxxxx
         xxxx                xxxx          xxxx
         xxx                 xxx            xxx
         xxx                 xxx            xxxx
         xxx                 xxxx            xxx
         xxx                  xxx            xxx
         xxxx                 xxx            xxx
          xxxx                xxxx           xxx
           xxxx                xxx           xxx
            xxxx               xxx          xxxx
             xxxx             xxxx          xxx
              xxxxx           xxx           xxx
                xxxxxx      xxxxx          xxx
                 xxxxxxxxxxxxxxx           xx
                   xxxxxxxxxxxx   xxxx
                      xxxxxx    xxxxxxxx
                               xxxxxxxxxx  xx
                               xxxx  xxxx  xxx
                              xxxx    xxxx  xxx
                              xxx      xxx   xxx
                              xxx      xxx   xxx
                              xxx      xxx   xxx
                              xxxx    xxxx  xxxx
                               xxxx  xxxx  xxxxx
                               xxxxxxxxxxxxxxxx
                              xxxxxxxxxxxxxxxx
                              xxxxxxxxxxxxxx
-0----------------------------------------------
            xxx                   xxxxxxxx
           xxxx                 xxxxxxxxxxxx
          xxxx                 xxxxxxxxxxxxxx
         xxxx                 xxxxx      xxxxx
         xxxx                xxxx          xxxx
         xxx                 xxx            xxx
         xxx                 xxx            xxxx
         xxx                 xxxx            xxx
         xxx                  xxx            xxx
         xxxx                 xxx            xxx
          xxxx                xxxx           xxx
           xxxx                xxx           xxx
            xxxx               xxx          xxxx
             xxxx             xxxx          xxx
              xxxxx           xxx           xxx
                xxxxxx      xxxxx          xxx
                 xxxxxxxxxxxxxxx           xx
                   xxxxxxxxxxxx
                      xxxxxx
                                     xxxxxxxxxxx
                                   xxxxxxxxxxxxx
                                  xxxxxxxxxxxxxx
                                 xxxx
                                xxxx
                                xxx
                                xxx
                                xxx
                                xxxx
                                 xxxx
                                 xxxxxxxxxxxxxxx
                                xxxxxxxxxxxxxxxx
                                xxxxxxxxxxxxxxxx
=*==============================================
`);

res += prepFont('m', `
<<<<=*==============================================
-1----------------------------------------------
   xxxx                                    xxxxx
  xxx                                     xxxxx
 xxx                                     xxxxx
 xxx                                    xxxxx
xxx                                    xxxxx
xxx                                   xxxxx
xxx                                  xxxxx
xxxx                                xxxxx
 xxx                               xxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                               xxxxx
                              xxxxx
   xxx                       xxxxx
  xxxxx   xx                xxxxx
 xxxxxxx  xxx              xxxxx
 xxx xxx  xxxx            xxxxx
xxx   xxx  xxx           xxxxx
xxx   xxx  xxx
xxx   xxx  xxx
 xx   xxx xxxx
 xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxx


xxxxxxxxxxxxxx
xxxxxxxxxxxxxx
xxxxxxxxxxxxx
         xxxx
           xxx
           xxx
           xxx
         xxxx
xxxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxx
-2----------------------------------------------
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                       xxx               xxxx
                      xxxx              xxxx
                      xxx              xxxx
                     xxxx             xxxx
                     xxx             xxxx
    xxxxxx          xxxx            xxxx
  xxxxxxxxxx        xxx            xxxx
 xxxxxxxxxxxx      xxxx           xxxx
 xxxx xxxxxxx      xxx           xxxx
xxxx  xxx xxxx    xxxx          xxxx
xxx   xxx  xxx                 xxxx
xxx   xxx  xxx                xxxx
xxx   xxx  xxx               xxxx
xxxx  xxx xxxx              xxxx
 xxx  xxxxxxx              xxxx
 xxxx xxxxxxx
  xxx xxxxxx
    x  xxx


xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxxxxxx
 xxx      xxx
xxxx      xxxx
xxx        xxx
xxxx      xxxx
 xxx      xxx
 xxxxx  xxxxx
  xxxxxxxxxx
   xxxxxxxx
     xxxx
-3----------------------------------------------
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          xxxxxxxxxx
                     xxxxxxxxxxx
                 xxxxxxxxxxx
             xxxxxxxxxxxxx
                 xxxxxxxxxxxx
                      xxxxxxxxxx
                           xxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


   xxx
  xxxxx   xx
 xxxxxxx  xxx
 xxx xxx  xxx
xxx   xxx  xxx
xxx   xxx  xxx
xxx   xxx  xxx
 xx   xxx xxxx
 xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxx


xxxxxxxxxxxxxx
xxxxxxxxxxxxxx
xxxxxxxxxxxxx
         xxxx
          xxxx
           xxx
          xxxx
         xxxx
         xxx
         xx
<<<<-4----------------------------------------------
    xxxxxx
    xxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxx
              xxx     xxxxxxxxxxxxxxxxxx
              xxx           xxxxxxxxxxxxxxxxx
              xxx     xxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxx
    xxxxxx

xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx
     xxx      xxx
    xxxx      xxxx
    xxx        xxx
    xxxx      xxxx
     xxx      xxx
     xxxxx  xxxxx
      xxxxxxxxxx
       xxxxxxxx
         xxxx


    xxxxxxxxxxxxxx
    xxxxxxxxxxxxxx
    xxxxxxxxxxxxx
             xxxx
              xxxx
               xxx
              xxxx
             xxxx
<<<<-5----------------------------------------------
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                              xxxxxxxxxx
                         xxxxxxxxxxx
                     xxxxxxxxxxx
                 xxxxxxxxxxxxx
                     xxxxxxxxxxxx
                          xxxxxxxxxx
                               xxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
x   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
x   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xx
xx
xx     xxx
 x    xxxxx   xx
 x   xxxxxxx  xxx
 xx  xxx xxx  xxxx
 xx xxx   xxx  xxx
 xx xxx   xxx  xxx
 xx xxx   xxx  xxx
 xx  xx   xxx xxxx
 xx  xxxxxxxxxxxx
 xx xxxxxxxxxxxx
 x  xxxxxxxxxxx
 x
xx
xx     xxxxxxxxxxx
xx   xxxxxxxxxxxxx
xx   xxxxxxxxxxxxx
xxx xxxxx
xxx xxx
xxxxxxxxx
 xxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxx
     xxxxxxxxxxx
-6----------------------------------------------
   xxxx                                    xxxxx
  xxx                                     xxxxx
 xxx                                     xxxxx
 xxx                                    xxxxx
xxx                                    xxxxx
xxx                                   xxxxx
xxx                                  xxxxx
xxxx                                xxxxx
 xxx                               xxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                               xxxxx
                              xxxxx
   xxxxxxxxxxx               xxxxx
  xxxxxxxxxxxx              xxxxx
 xxxxxxxxxxxxx             xxxxx
 xxxx                     xxxxx
xxx                      xxxxx
xxx
xxx
xxxx
 xxxxxxxxxxxxx
xxxxxxxxxxxxxx
xxxxxxxxxxxxxx


xxxxxxxxxxxxxx
xxxxxxxxxxxxxx
xxxxxxxxxxxxx
         xxxx
           xxx
           xxx
           xxx
         xxxx
xxxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxx
-7----------------------------------------------
   xxxx                                    xxxxx
  xxx                                     xxxxx
 xxx                                     xxxxx
 xxx                                    xxxxx
xxx                                    xxxxx
xxx                                   xxxxx
xxx                                  xxxxx
xxxx                                xxxxx
 xxx                               xxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                               xxxxx
                              xxxxx
   xxxxxxxxxxx               xxxxx
  xxxxxxxxxxxx              xxxxx
 xxxxxxxxxxxxx             xxxxx
 xxxx                     xxxxx
xxx                      xxxxx
xxx
xxx
 xxxx
 xxxxxxxxxxxxx
xxxxxxxxxxxxxx
xxxxxxxxxxxxxx


xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx
<<<<-8----------------------------------------------
    xxxxxx
    xxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxx
              xxx     xxxxxxxxxxxxxxxxxx
              xxx           xxxxxxxxxxxxxxxxx
              xxx     xxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxx
          xxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxx
x   xxxxxxxxxxxx
x   xxxxxx
xx
xx
xx     xxxxxxxxxxx
 x    xxxxxxxxxxxx
 x   xxxxxxxxxxxxx
 x   xxxx
 xx xxx
 xx xxx
 xx  xxxx
 xx  xxxxxxxxxxxxx
 xx xxxxxxxxxxxxxx
 xx xxxxxxxxxxxxxx
 x
 x
xx     xxxxxxxx
xx   xxxxxxxxxxxx
xx   xxxxxxxxxxxx
xx  xxxxx    xxxxx
xxx xxx        xxx
xxx xxx        xxx
xxxxxxxxx    xxxxx
 xxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxx
   xxxxxxxxxxxxx
<<<<-9----------------------------------------------
        xxxxx                 xxxxxxxxxxxx
      xxxxx                xxxxxxxxxxxxxxxxxx
     xxxx                xxxxxxxxxxxxxxxxxxxxxx
     xxx                xxxxxxxxx        xxxxxxx
    xxxx               xxxxxx              xxxxx
    xxx                xxxx                xxxx
    xxxx              xxxx                xxxx
     xxxxx         xxxxxx                xxxx
     xxxxxxxxxxxxxxxxxxxx               xxxx
      xxxxxxxxxxxxxxxxxx              xxxxx
        xxxxxxxxxxxxxx             xxxxxx
           xxxxxxx

        xxxxxx
      xxxxxxxxxx
     xxxxxxxxxxxx
     xxxx xxxxxxx
    xxxx  xxx xxxx
    xxx   xxx  xxx
    xxx   xxx  xxx
    xxxx  xxx xxxx
     xxx  xxxxxxx
     xxxx xxxxxxx
      xxx xxxxxx
        x  xxx


xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx
     xxx      xxx
    xxxx      xxxx
    xxx        xxx
    xxxx      xxxx
     xxx      xxx
     xxxxx  xxxxx
      xxxxxxxxxx
       xxxxxxxx
         xxxx
-:----------------------------------------------
     xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 xxxxx                            xxxxx
xxxx                                xxxx
xxx                                  xxx
xxx                                  xxx
xxxx                                xxxx
 xxxxx                            xxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


    xxxxxx
  xxxxxxxxxx
 xxxxxxxxxxxx
 xxxx    xxxx
xxx        xxx
xxx        xxx
xxx        xxx
xxx        xxx
 xxx      xxx
 xxx      xxx
  xx      xx


   xxxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxx
xxxx       xxx
xxx        xxx
xxx        xxx
xxx        xxx
 xxx
 xxx
  xx
-;----------------------------------------------
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                            xxxxxxxxxx
                        xxxxxxxxxxx
                     xxxxxxxxxx
                 xxxxxxxxxxx
              xxxxxxxxxx
          xxxxxxxxxxx
       xxxxxxxxxx
   xxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


    xxxxxx
  xxxxxxxxxx
 xxxxxxxxxxxx
xxxxx    xxxxx
xxx        xxx
xxx        xxx
xxxxx    xxxxx
 xxxxxxxxxxxx
  xxxxxxxxxx
    xxxxxx
             x
          xxxx
       xxxxxxx
     xxxxxxxx
  xxxxxxxx
xxxxxxxx
  xxxxxxxx
     xxxxxxxx
       xxxxxxx
          xxx
-<----------------------------------------------
xxx                                         xxxx
xxx                                        xxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxx                                   xxxxx
xxxx                               xxxxxxx
 xxxxx                         xxxxxxxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxx


    xxxxxx
  xxxxxxxxxx
 xxxxxxxxxxxx
 xxxx xxxxxxx
xxxx  xxx xxxx
xxx   xxx  xxx
xxx   xxx  xxx
xxxx  xxx xxxx
 xxx  xxxxxxx
 xxxx xxxxxxx
  xxx xxxxxx
    x  xxx


    xxxxxx
  xxxxxxxxxx
 xxxxxxxxxxxx
 xxxx    xxxx
xxx        xxx
xxx        xxx
xxx        xxx
 xxx      xxx
 xxx      xxx
  xx      xx
<<<<=*==============================================
`);

res += prepBitmap('lock', `
   xxxx
  xxxxxx
 xxx  xxx
 xx    xx
 xx    xx
xxxxxxxxxx
x        x
x  xxxx  x
x        x
x        x
x  xxxx  x
x        x
x        x
x  xxxx  x
x        x
x        x
xxxxxxxxxx
`);

res += prepBitmap('lockS', `
   xxx
  xxxxx
 xx   xx
 xx   xx
xxxxxxxxx
x       x
x  xxx  x
x       x
x  xxx  x
x       x
x  xxx  x
x       x
xxxxxxxxx
`);

res += prepBitmap('battery', `
   xx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
`);

res += prepBitmap('charge', `
     x
    xx
   xx
   xx
  xx
 xxx
 xxxxxx
    xxx
    xx
   xx
   xx
  xx
  x
`);

res += prepBitmap('HRM', `
   xxx    xxx
  x xxx  xxx x
 xx xxxxxxxx xx
xxx xxxxxxxx xxx
xxx xxxxxxxx xxx
xxx xxxxxxxx xxx
xxx  xxxxxxx  xx
x x  x  xx x  x
 x x  xx  x x  x
xx x xxxxxx x xx
 xxx xxxxxxxx x
  xx xxxxxxxx 
   xxxxxxxxxx
    xxxxxxxx
     xxxxxx
      xxxx
       xx
`);

res += prepBitmap('compass', `
    x
    x
   xxx
   xxx
  xxxxx
  xx xx
 xxx xxx
 xx   xx
xx     xx
`);

res += prepBitmap('y100', `
 xxxxx    xxx
xxxxxxx  xxxxx
x   xxx  xx xx
     xx xxx xxx
    xxx xx   xx
  xxxx  xx   xx
xxxxx   xx   xx
 xxx    xx   xx
  xxx   xx   xx
   xxx  xx   xx
    xxx xx   xx
     xx xx   xx
      x xx   xx
        xxx xxx
         xx xx
         xxxxx
          xxx
`);

res += prepBitmap('y100s', `
 xx    xx
x xx  xxxx
  xx xx  xx
xxx  xx  xx
 xx  xx  xx
  xx xx  xx
   x xx  xx
     xx  xx
      xxxx
       xx
`);

print(res);
