/* Packed with Google Closure
 *
 * Ported to JavaScript by Lazar Laszlo 2011
 * lazarsoft@gmail.com, www.lazarsoft.info
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var qrcode = (function () {
  "use strict";
  function a(h, b) {
    this.count = h;
    this.dataCodewords = b;
    this.__defineGetter__("Count", function () {
      return this.count;
    });
    this.__defineGetter__("DataCodewords", function () {
      return this.dataCodewords;
    });
  }
  function f(h, b, e) {
    this.ecCodewordsPerBlock = h;
    this.ecBlocks = e ? [b, e] : Array(b);
    this.__defineGetter__("ECCodewordsPerBlock", function () {
      return this.ecCodewordsPerBlock;
    });
    this.__defineGetter__("TotalECCodewords", function () {
      return this.ecCodewordsPerBlock * this.NumBlocks;
    });
    this.__defineGetter__("NumBlocks", function () {
      for (var d = 0, c = 0; c < this.ecBlocks.length; c++)
        d += this.ecBlocks[c].length;
      return d;
    });
    this.getECBlocks = function () {
      return this.ecBlocks;
    };
  }
  function k(h, b, e, d, c, a) {
    this.versionNumber = h;
    this.alignmentPatternCenters = b;
    this.ecBlocks = [e, d, c, a];
    h = 0;
    b = e.ECCodewordsPerBlock;
    e = e.getECBlocks();
    for (d = 0; d < e.length; d++)
      (c = e[d]), (h += c.Count * (c.DataCodewords + b));
    this.totalCodewords = h;
    this.__defineGetter__("VersionNumber", function () {
      return this.versionNumber;
    });
    this.__defineGetter__("AlignmentPatternCenters", function () {
      return this.alignmentPatternCenters;
    });
    this.__defineGetter__("TotalCodewords", function () {
      return this.totalCodewords;
    });
    this.__defineGetter__("DimensionForVersion", function () {
      return 17 + 4 * this.versionNumber;
    });
    this.buildFunctionPattern = function () {
      var d = this.DimensionForVersion,
        c = new I(d);
      c.setRegion(0, 0, 9, 9);
      c.setRegion(d - 8, 0, 8, 9);
      c.setRegion(0, d - 8, 9, 8);
      for (var e = this.alignmentPatternCenters.length, b = 0; b < e; b++)
        for (var a = this.alignmentPatternCenters[b] - 2, h = 0; h < e; h++)
          (0 == b && (0 == h || h == e - 1)) ||
            (b == e - 1 && 0 == h) ||
            c.setRegion(this.alignmentPatternCenters[h] - 2, a, 5, 5);
      c.setRegion(6, 9, 1, d - 17);
      c.setRegion(9, 6, d - 17, 1);
      6 < this.versionNumber &&
        (c.setRegion(d - 11, 0, 3, 6), c.setRegion(0, d - 11, 6, 3));
      return c;
    };
    this.getECBlocksForLevel = function (c) {
      return this.ecBlocks[c.ordinal()];
    };
  }
  function z(h, b, e, d, c, a, l, m, f) {
    this.a11 = h;
    this.a12 = d;
    this.a13 = l;
    this.a21 = b;
    this.a22 = c;
    this.a23 = m;
    this.a31 = e;
    this.a32 = a;
    this.a33 = f;
    this.transformPoints1 = function (c) {
      for (
        var d = c.length,
          e = this.a11,
          b = this.a12,
          h = this.a13,
          a = this.a21,
          l = this.a22,
          p = this.a23,
          m = this.a31,
          f = this.a32,
          g = this.a33,
          y = 0;
        y < d;
        y += 2
      ) {
        var q = c[y],
          k = c[y + 1],
          n = h * q + p * k + g;
        c[y] = (e * q + a * k + m) / n;
        c[y + 1] = (b * q + l * k + f) / n;
      }
    };
    this.transformPoints2 = function (c, d) {
      for (var e = c.length, b = 0; b < e; b++) {
        var h = c[b],
          a = d[b],
          l = this.a13 * h + this.a23 * a + this.a33;
        c[b] = (this.a11 * h + this.a21 * a + this.a31) / l;
        d[b] = (this.a12 * h + this.a22 * a + this.a32) / l;
      }
    };
    this.buildAdjoint = function () {
      return new z(
        this.a22 * this.a33 - this.a23 * this.a32,
        this.a23 * this.a31 - this.a21 * this.a33,
        this.a21 * this.a32 - this.a22 * this.a31,
        this.a13 * this.a32 - this.a12 * this.a33,
        this.a11 * this.a33 - this.a13 * this.a31,
        this.a12 * this.a31 - this.a11 * this.a32,
        this.a12 * this.a23 - this.a13 * this.a22,
        this.a13 * this.a21 - this.a11 * this.a23,
        this.a11 * this.a22 - this.a12 * this.a21
      );
    };
    this.times = function (c) {
      return new z(
        this.a11 * c.a11 + this.a21 * c.a12 + this.a31 * c.a13,
        this.a11 * c.a21 + this.a21 * c.a22 + this.a31 * c.a23,
        this.a11 * c.a31 + this.a21 * c.a32 + this.a31 * c.a33,
        this.a12 * c.a11 + this.a22 * c.a12 + this.a32 * c.a13,
        this.a12 * c.a21 + this.a22 * c.a22 + this.a32 * c.a23,
        this.a12 * c.a31 + this.a22 * c.a32 + this.a32 * c.a33,
        this.a13 * c.a11 + this.a23 * c.a12 + this.a33 * c.a13,
        this.a13 * c.a21 + this.a23 * c.a22 + this.a33 * c.a23,
        this.a13 * c.a31 + this.a23 * c.a32 + this.a33 * c.a33
      );
    };
  }
  function P(h, b) {
    this.bits = h;
    this.points = b;
  }
  function Q(h) {
    this.image = h;
    this.resultPointCallback = null;
    this.sizeOfBlackWhiteBlackRun = function (b, e, d, c) {
      var h = Math.abs(c - e) > Math.abs(d - b);
      if (h) {
        var a = b;
        b = e;
        e = a;
        a = d;
        d = c;
        c = a;
      }
      for (
        var m = Math.abs(d - b),
          f = Math.abs(c - e),
          q = -m >> 1,
          k = e < c ? 1 : -1,
          x = b < d ? 1 : -1,
          v = 0,
          t = b,
          a = e;
        t != d;
        t += x
      ) {
        var J = h ? a : t,
          n = h ? t : a;
        1 == v
          ? this.image[J + n * g.width] && v++
          : this.image[J + n * g.width] || v++;
        if (3 == v) return (c = t - b), (e = a - e), Math.sqrt(c * c + e * e);
        q += f;
        if (0 < q) {
          if (a == c) break;
          a += k;
          q -= m;
        }
      }
      b = d - b;
      e = c - e;
      return Math.sqrt(b * b + e * e);
    };
    this.sizeOfBlackWhiteBlackRunBothWays = function (b, e, d, c) {
      var a = this.sizeOfBlackWhiteBlackRun(b, e, d, c),
        h = 1;
      d = b - (d - b);
      0 > d
        ? ((h = b / (b - d)), (d = 0))
        : d >= g.width &&
          ((h = (g.width - 1 - b) / (d - b)), (d = g.width - 1));
      c = Math.floor(e - (c - e) * h);
      h = 1;
      0 > c
        ? ((h = e / (e - c)), (c = 0))
        : c >= g.height &&
          ((h = (g.height - 1 - e) / (c - e)), (c = g.height - 1));
      d = Math.floor(b + (d - b) * h);
      a += this.sizeOfBlackWhiteBlackRun(b, e, d, c);
      return a - 1;
    };
    this.calculateModuleSizeOneWay = function (b, e) {
      var d = this.sizeOfBlackWhiteBlackRunBothWays(
          Math.floor(b.X),
          Math.floor(b.Y),
          Math.floor(e.X),
          Math.floor(e.Y)
        ),
        c = this.sizeOfBlackWhiteBlackRunBothWays(
          Math.floor(e.X),
          Math.floor(e.Y),
          Math.floor(b.X),
          Math.floor(b.Y)
        );
      return isNaN(d) ? c / 7 : isNaN(c) ? d / 7 : (d + c) / 14;
    };
    this.calculateModuleSize = function (b, e, d) {
      return (
        (this.calculateModuleSizeOneWay(b, e) +
          this.calculateModuleSizeOneWay(b, d)) /
        2
      );
    };
    this.distance = function (b, e) {
      var d = b.X - e.X,
        c = b.Y - e.Y;
      return Math.sqrt(d * d + c * c);
    };
    this.computeDimension = function (b, e, d, c) {
      e = Math.round(this.distance(b, e) / c);
      b = Math.round(this.distance(b, d) / c);
      b = ((e + b) >> 1) + 7;
      switch (b & 3) {
        case 0:
          b++;
          break;
        case 2:
          b--;
          break;
        case 3:
          throw "Error";
      }
      return b;
    };
    this.findAlignmentInRegion = function (b, e, d, c) {
      c = Math.floor(c * b);
      var h = Math.max(0, e - c);
      e = Math.min(g.width - 1, e + c);
      if (e - h < 3 * b) throw "Error";
      var a = Math.max(0, d - c);
      return new R(
        this.image,
        h,
        a,
        e - h,
        Math.min(g.height - 1, d + c) - a,
        b,
        this.resultPointCallback
      ).find();
    };
    this.createTransform = function (b, e, d, c, h) {
      h -= 3.5;
      var a;
      if (null != c) {
        var p = c.X;
        c = c.Y;
        var f = (a = h - 3);
      } else (p = e.X - b.X + d.X), (c = e.Y - b.Y + d.Y), (f = a = h);
      return z.quadrilateralToQuadrilateral(
        3.5,
        3.5,
        h,
        3.5,
        f,
        a,
        3.5,
        h,
        b.X,
        b.Y,
        e.X,
        e.Y,
        p,
        c,
        d.X,
        d.Y
      );
    };
    this.sampleGrid = function (b, e, d) {
      return F.sampleGrid3(b, d, e);
    };
    this.processFinderPatternInfo = function (b) {
      var e = b.TopLeft,
        d = b.TopRight;
      b = b.BottomLeft;
      var c = this.calculateModuleSize(e, d, b);
      if (1 > c) throw "Error";
      var h = this.computeDimension(e, d, b, c),
        a = k.getProvisionalVersionForDimension(h),
        m = a.DimensionForVersion - 7,
        f = null;
      if (0 < a.AlignmentPatternCenters.length)
        for (
          a = 1 - 3 / m,
            f = Math.floor(e.X + a * (d.X - e.X + b.X - e.X)),
            a = Math.floor(e.Y + a * (d.Y - e.Y + b.Y - e.Y));
          ;

        ) {
          f = this.findAlignmentInRegion(c, f, a, 4);
          break;
        }
      c = this.createTransform(e, d, b, f, h);
      h = this.sampleGrid(this.image, c, h);
      return new P(h, null == f ? [b, e, d] : [b, e, d, f]);
    };
    this.detect = function () {
      var b = new S().findFinderPattern(this.image);
      return this.processFinderPatternInfo(b);
    };
  }
  function r(h) {
    this.errorCorrectionLevel = C.forBits((h >> 3) & 3);
    this.dataMask = h & 7;
    this.__defineGetter__("ErrorCorrectionLevel", function () {
      return this.errorCorrectionLevel;
    });
    this.__defineGetter__("DataMask", function () {
      return this.dataMask;
    });
    this.GetHashCode = function () {
      return (this.errorCorrectionLevel.ordinal() << 3) | this.dataMask;
    };
    this.Equals = function (b) {
      return (
        this.errorCorrectionLevel == b.errorCorrectionLevel &&
        this.dataMask == b.dataMask
      );
    };
  }
  function C(h, b, e) {
    this.ordinal_Renamed_Field = h;
    this.bits = b;
    this.name = e;
    this.__defineGetter__("Bits", function () {
      return this.bits;
    });
    this.__defineGetter__("Name", function () {
      return this.name;
    });
    this.ordinal = function () {
      return this.ordinal_Renamed_Field;
    };
  }
  function I(h, b) {
    b || (b = h);
    if (1 > h || 1 > b) throw "Both dimensions must be greater than 0";
    this.width = h;
    this.height = b;
    var e = h >> 5;
    0 != (h & 31) && e++;
    this.rowSize = e;
    this.bits = Array(e * b);
    for (e = 0; e < this.bits.length; e++) this.bits[e] = 0;
    this.__defineGetter__("Width", function () {
      return this.width;
    });
    this.__defineGetter__("Height", function () {
      return this.height;
    });
    this.__defineGetter__("Dimension", function () {
      if (this.width != this.height)
        throw "Can't call getDimension() on a non-square matrix";
      return this.width;
    });
    this.get_Renamed = function (d, c) {
      return 0 != (u(this.bits[c * this.rowSize + (d >> 5)], d & 31) & 1);
    };
    this.set_Renamed = function (d, c) {
      this.bits[c * this.rowSize + (d >> 5)] |= 1 << (d & 31);
    };
    this.flip = function (d, c) {
      this.bits[c * this.rowSize + (d >> 5)] ^= 1 << (d & 31);
    };
    this.clear = function () {
      for (var d = this.bits.length, c = 0; c < d; c++) this.bits[c] = 0;
    };
    this.setRegion = function (d, c, e, b) {
      if (0 > c || 0 > d) throw "Left and top must be nonnegative";
      if (1 > b || 1 > e) throw "Height and width must be at least 1";
      e = d + e;
      b = c + b;
      if (b > this.height || e > this.width)
        throw "The region must fit inside the matrix";
      for (; c < b; c++)
        for (var h = c * this.rowSize, a = d; a < e; a++)
          this.bits[h + (a >> 5)] |= 1 << (a & 31);
    };
  }
  function G(a, b) {
    this.numDataCodewords = a;
    this.codewords = b;
    this.__defineGetter__("NumDataCodewords", function () {
      return this.numDataCodewords;
    });
    this.__defineGetter__("Codewords", function () {
      return this.codewords;
    });
  }
  function T(a) {
    var b = a.Dimension;
    if (21 > b || 1 != (b & 3)) throw "Error BitMatrixParser";
    this.bitMatrix = a;
    this.parsedFormatInfo = this.parsedVersion = null;
    this.copyBit = function (e, d, c) {
      return this.bitMatrix.get_Renamed(e, d) ? (c << 1) | 1 : c << 1;
    };
    this.readFormatInformation = function () {
      if (null != this.parsedFormatInfo) return this.parsedFormatInfo;
      for (var e = 0, d = 0; 6 > d; d++) e = this.copyBit(d, 8, e);
      e = this.copyBit(7, 8, e);
      e = this.copyBit(8, 8, e);
      e = this.copyBit(8, 7, e);
      for (d = 5; 0 <= d; d--) e = this.copyBit(8, d, e);
      this.parsedFormatInfo = r.decodeFormatInformation(e);
      if (null != this.parsedFormatInfo) return this.parsedFormatInfo;
      for (
        var c = this.bitMatrix.Dimension, e = 0, b = c - 8, d = c - 1;
        d >= b;
        d--
      )
        e = this.copyBit(d, 8, e);
      for (d = c - 7; d < c; d++) e = this.copyBit(8, d, e);
      this.parsedFormatInfo = r.decodeFormatInformation(e);
      if (null != this.parsedFormatInfo) return this.parsedFormatInfo;
      throw "Error readFormatInformation";
    };
    this.readVersion = function () {
      if (null != this.parsedVersion) return this.parsedVersion;
      var e = this.bitMatrix.Dimension,
        d = (e - 17) >> 2;
      if (6 >= d) return k.getVersionForNumber(d);
      for (var d = 0, c = e - 11, b = 5; 0 <= b; b--)
        for (var a = e - 9; a >= c; a--) d = this.copyBit(a, b, d);
      this.parsedVersion = k.decodeVersionInformation(d);
      if (
        null != this.parsedVersion &&
        this.parsedVersion.DimensionForVersion == e
      )
        return this.parsedVersion;
      d = 0;
      for (a = 5; 0 <= a; a--)
        for (b = e - 9; b >= c; b--) d = this.copyBit(a, b, d);
      this.parsedVersion = k.decodeVersionInformation(d);
      if (
        null != this.parsedVersion &&
        this.parsedVersion.DimensionForVersion == e
      )
        return this.parsedVersion;
      throw "Error readVersion";
    };
    this.readCodewords = function () {
      var b = this.readFormatInformation(),
        d = this.readVersion(),
        c = H.forReference(b.DataMask),
        b = this.bitMatrix.Dimension;
      c.unmaskBitMatrix(this.bitMatrix, b);
      for (
        var c = d.buildFunctionPattern(),
          a = !0,
          h = Array(d.TotalCodewords),
          m = 0,
          f = 0,
          g = 0,
          k = b - 1;
        0 < k;
        k -= 2
      ) {
        6 == k && k--;
        for (var x = 0; x < b; x++)
          for (var v = a ? b - 1 - x : x, t = 0; 2 > t; t++)
            c.get_Renamed(k - t, v) ||
              (g++,
              (f <<= 1),
              this.bitMatrix.get_Renamed(k - t, v) && (f |= 1),
              8 == g && ((h[m++] = f), (f = g = 0)));
        a ^= 1;
      }
      if (m != d.TotalCodewords) throw "Error readCodewords";
      return h;
    };
  }
  function w(a, b) {
    if (null == b || 0 == b.length) throw "System.ArgumentException";
    this.field = a;
    var e = b.length;
    if (1 < e && 0 == b[0]) {
      for (var d = 1; d < e && 0 == b[d]; ) d++;
      if (d == e) this.coefficients = a.Zero.coefficients;
      else {
        this.coefficients = Array(e - d);
        for (e = 0; e < this.coefficients.length; e++) this.coefficients[e] = 0;
        for (e = 0; e < this.coefficients.length; e++)
          this.coefficients[e] = b[d + e];
      }
    } else this.coefficients = b;
    this.__defineGetter__("Zero", function () {
      return 0 == this.coefficients[0];
    });
    this.__defineGetter__("Degree", function () {
      return this.coefficients.length - 1;
    });
    this.__defineGetter__("Coefficients", function () {
      return this.coefficients;
    });
    this.getCoefficient = function (c) {
      return this.coefficients[this.coefficients.length - 1 - c];
    };
    this.evaluateAt = function (c) {
      if (0 == c) return this.getCoefficient(0);
      var d = this.coefficients.length;
      if (1 == c) {
        for (var b = (c = 0); b < d; b++)
          c = n.addOrSubtract(c, this.coefficients[b]);
        return c;
      }
      for (var e = this.coefficients[0], b = 1; b < d; b++)
        e = n.addOrSubtract(this.field.multiply(c, e), this.coefficients[b]);
      return e;
    };
    this.addOrSubtract = function (c) {
      if (this.field != c.field)
        throw "GF256Polys do not have same GF256 field";
      if (this.Zero) return c;
      if (c.Zero) return this;
      var d = this.coefficients;
      c = c.coefficients;
      if (d.length > c.length) {
        var b = d,
          d = c;
        c = b;
      }
      for (var b = Array(c.length), e = c.length - d.length, h = 0; h < e; h++)
        b[h] = c[h];
      for (h = e; h < c.length; h++) b[h] = n.addOrSubtract(d[h - e], c[h]);
      return new w(a, b);
    };
    this.multiply1 = function (c) {
      if (this.field != c.field)
        throw "GF256Polys do not have same GF256 field";
      if (this.Zero || c.Zero) return this.field.Zero;
      var d = this.coefficients,
        b = d.length;
      c = c.coefficients;
      for (var e = c.length, a = Array(b + e - 1), h = 0; h < b; h++)
        for (var f = d[h], g = 0; g < e; g++)
          a[h + g] = n.addOrSubtract(a[h + g], this.field.multiply(f, c[g]));
      return new w(this.field, a);
    };
    this.multiply2 = function (c) {
      if (0 == c) return this.field.Zero;
      if (1 == c) return this;
      for (var d = this.coefficients.length, b = Array(d), e = 0; e < d; e++)
        b[e] = this.field.multiply(this.coefficients[e], c);
      return new w(this.field, b);
    };
    this.multiplyByMonomial = function (c, d) {
      if (0 > c) throw "System.ArgumentException";
      if (0 == d) return this.field.Zero;
      for (
        var b = this.coefficients.length, e = Array(b + c), a = 0;
        a < e.length;
        a++
      )
        e[a] = 0;
      for (a = 0; a < b; a++)
        e[a] = this.field.multiply(this.coefficients[a], d);
      return new w(this.field, e);
    };
    this.divide = function (c) {
      if (this.field != c.field)
        throw "GF256Polys do not have same GF256 field";
      if (c.Zero) throw "Divide by 0";
      for (
        var d = this.field.Zero,
          b = this,
          e = c.getCoefficient(c.Degree),
          e = this.field.inverse(e);
        b.Degree >= c.Degree && !b.Zero;

      )
        var a = b.Degree - c.Degree,
          h = this.field.multiply(b.getCoefficient(b.Degree), e),
          f = c.multiplyByMonomial(a, h),
          a = this.field.buildMonomial(a, h),
          d = d.addOrSubtract(a),
          b = b.addOrSubtract(f);
      return [d, b];
    };
  }
  function n(a) {
    this.expTable = Array(256);
    this.logTable = Array(256);
    for (var b = 1, e = 0; 256 > e; e++)
      (this.expTable[e] = b), (b <<= 1), 256 <= b && (b ^= a);
    for (e = 0; 255 > e; e++) this.logTable[this.expTable[e]] = e;
    a = Array(1);
    a[0] = 0;
    this.zero = new w(this, Array(a));
    a = Array(1);
    a[0] = 1;
    this.one = new w(this, Array(a));
    this.__defineGetter__("Zero", function () {
      return this.zero;
    });
    this.__defineGetter__("One", function () {
      return this.one;
    });
    this.buildMonomial = function (d, c) {
      if (0 > d) throw "System.ArgumentException";
      if (0 == c) return this.zero;
      for (var b = Array(d + 1), e = 0; e < b.length; e++) b[e] = 0;
      b[0] = c;
      return new w(this, b);
    };
    this.exp = function (d) {
      return this.expTable[d];
    };
    this.log = function (d) {
      if (0 == d) throw "System.ArgumentException";
      return this.logTable[d];
    };
    this.inverse = function (d) {
      if (0 == d) throw "System.ArithmeticException";
      return this.expTable[255 - this.logTable[d]];
    };
    this.multiply = function (d, c) {
      return 0 == d || 0 == c
        ? 0
        : 1 == d
        ? c
        : 1 == c
        ? d
        : this.expTable[(this.logTable[d] + this.logTable[c]) % 255];
    };
  }
  function u(a, b) {
    return 0 <= a ? a >> b : (a >> b) + (2 << ~b);
  }
  function U(a, b, e) {
    this.x = a;
    this.y = b;
    this.count = 1;
    this.estimatedModuleSize = e;
    this.__defineGetter__("EstimatedModuleSize", function () {
      return this.estimatedModuleSize;
    });
    this.__defineGetter__("Count", function () {
      return this.count;
    });
    this.__defineGetter__("X", function () {
      return this.x;
    });
    this.__defineGetter__("Y", function () {
      return this.y;
    });
    this.incrementCount = function () {
      this.count++;
    };
    this.aboutEquals = function (d, c, b) {
      return Math.abs(c - this.y) <= d && Math.abs(b - this.x) <= d
        ? ((d = Math.abs(d - this.estimatedModuleSize)),
          1 >= d || 1 >= d / this.estimatedModuleSize)
        : !1;
    };
  }
  function V(a) {
    this.bottomLeft = a[0];
    this.topLeft = a[1];
    this.topRight = a[2];
    this.__defineGetter__("BottomLeft", function () {
      return this.bottomLeft;
    });
    this.__defineGetter__("TopLeft", function () {
      return this.topLeft;
    });
    this.__defineGetter__("TopRight", function () {
      return this.topRight;
    });
  }
  function S() {
    this.image = null;
    this.possibleCenters = [];
    this.hasSkipped = !1;
    this.crossCheckStateCount = [0, 0, 0, 0, 0];
    this.resultPointCallback = null;
    this.__defineGetter__("CrossCheckStateCount", function () {
      this.crossCheckStateCount[0] = 0;
      this.crossCheckStateCount[1] = 0;
      this.crossCheckStateCount[2] = 0;
      this.crossCheckStateCount[3] = 0;
      this.crossCheckStateCount[4] = 0;
      return this.crossCheckStateCount;
    });
    this.foundPatternCross = function (a) {
      for (var b = 0, e = 0; 5 > e; e++) {
        var d = a[e];
        if (0 == d) return !1;
        b += d;
      }
      if (7 > b) return !1;
      b = Math.floor((b << D) / 7);
      e = Math.floor(b / 2);
      return (
        Math.abs(b - (a[0] << D)) < e &&
        Math.abs(b - (a[1] << D)) < e &&
        Math.abs(3 * b - (a[2] << D)) < 3 * e &&
        Math.abs(b - (a[3] << D)) < e &&
        Math.abs(b - (a[4] << D)) < e
      );
    };
    this.centerFromEnd = function (a, b) {
      return b - a[4] - a[3] - a[2] / 2;
    };
    this.crossCheckVertical = function (a, b, e, d) {
      for (
        var c = this.image, h = g.height, l = this.CrossCheckStateCount, m = a;
        0 <= m && c[b + m * g.width];

      )
        l[2]++, m--;
      if (0 > m) return NaN;
      for (; 0 <= m && !c[b + m * g.width] && l[1] <= e; ) l[1]++, m--;
      if (0 > m || l[1] > e) return NaN;
      for (; 0 <= m && c[b + m * g.width] && l[0] <= e; ) l[0]++, m--;
      if (l[0] > e) return NaN;
      for (m = a + 1; m < h && c[b + m * g.width]; ) l[2]++, m++;
      if (m == h) return NaN;
      for (; m < h && !c[b + m * g.width] && l[3] < e; ) l[3]++, m++;
      if (m == h || l[3] >= e) return NaN;
      for (; m < h && c[b + m * g.width] && l[4] < e; ) l[4]++, m++;
      return l[4] >= e ||
        5 * Math.abs(l[0] + l[1] + l[2] + l[3] + l[4] - d) >= 2 * d
        ? NaN
        : this.foundPatternCross(l)
        ? this.centerFromEnd(l, m)
        : NaN;
    };
    this.crossCheckHorizontal = function (a, b, e, d) {
      for (
        var c = this.image, h = g.width, l = this.CrossCheckStateCount, m = a;
        0 <= m && c[m + b * g.width];

      )
        l[2]++, m--;
      if (0 > m) return NaN;
      for (; 0 <= m && !c[m + b * g.width] && l[1] <= e; ) l[1]++, m--;
      if (0 > m || l[1] > e) return NaN;
      for (; 0 <= m && c[m + b * g.width] && l[0] <= e; ) l[0]++, m--;
      if (l[0] > e) return NaN;
      for (m = a + 1; m < h && c[m + b * g.width]; ) l[2]++, m++;
      if (m == h) return NaN;
      for (; m < h && !c[m + b * g.width] && l[3] < e; ) l[3]++, m++;
      if (m == h || l[3] >= e) return NaN;
      for (; m < h && c[m + b * g.width] && l[4] < e; ) l[4]++, m++;
      return l[4] >= e ||
        5 * Math.abs(l[0] + l[1] + l[2] + l[3] + l[4] - d) >= d
        ? NaN
        : this.foundPatternCross(l)
        ? this.centerFromEnd(l, m)
        : NaN;
    };
    this.handlePossibleCenter = function (a, b, e) {
      var d = a[0] + a[1] + a[2] + a[3] + a[4];
      e = this.centerFromEnd(a, e);
      b = this.crossCheckVertical(b, Math.floor(e), a[2], d);
      if (
        !isNaN(b) &&
        ((e = this.crossCheckHorizontal(Math.floor(e), Math.floor(b), a[2], d)),
        !isNaN(e))
      ) {
        a = d / 7;
        for (var d = !1, c = this.possibleCenters.length, h = 0; h < c; h++) {
          var l = this.possibleCenters[h];
          if (l.aboutEquals(a, b, e)) {
            l.incrementCount();
            d = !0;
            break;
          }
        }
        d ||
          ((e = new U(e, b, a)),
          this.possibleCenters.push(e),
          null != this.resultPointCallback &&
            this.resultPointCallback.foundPossibleResultPoint(e));
        return !0;
      }
      return !1;
    };
    this.selectBestPatterns = function () {
      var a = this.possibleCenters.length;
      if (3 > a) throw "Couldn't find enough finder patterns (found " + a + ")";
      if (3 < a) {
        for (var b = 0, e = 0, d = 0; d < a; d++)
          var c = this.possibleCenters[d].EstimatedModuleSize,
            b = b + c,
            e = e + c * c;
        var p = b / a;
        this.possibleCenters.sort(function (c, d) {
          var b = Math.abs(d.EstimatedModuleSize - p),
            e = Math.abs(c.EstimatedModuleSize - p);
          return b < e ? -1 : b == e ? 0 : 1;
        });
        a = Math.max(0.2 * p, Math.sqrt(e / a - p * p));
        for (d = this.possibleCenters.length - 1; 0 <= d; d--)
          Math.abs(this.possibleCenters[d].EstimatedModuleSize - p) > a &&
            this.possibleCenters.splice(d, 1);
      }
      3 < this.possibleCenters.length &&
        this.possibleCenters.sort(function (c, d) {
          return c.count > d.count ? -1 : c.count < d.count ? 1 : 0;
        });
      return [
        this.possibleCenters[0],
        this.possibleCenters[1],
        this.possibleCenters[2],
      ];
    };
    this.findRowSkip = function () {
      var a = this.possibleCenters.length;
      if (1 >= a) return 0;
      for (var b = null, e = 0; e < a; e++) {
        var d = this.possibleCenters[e];
        if (d.Count >= K)
          if (null == b) b = d;
          else
            return (
              (this.hasSkipped = !0),
              Math.floor((Math.abs(b.X - d.X) - Math.abs(b.Y - d.Y)) / 2)
            );
      }
      return 0;
    };
    this.haveMultiplyConfirmedCenters = function () {
      for (
        var a, b = 0, e = 0, d = this.possibleCenters.length, c = 0;
        c < d;
        c++
      )
        (a = this.possibleCenters[c]),
          a.Count >= K && (b++, (e += a.EstimatedModuleSize));
      if (3 > b) return !1;
      for (var b = e / d, p = 0, c = 0; c < d; c++)
        (a = this.possibleCenters[c]),
          (p += Math.abs(a.EstimatedModuleSize - b));
      return p <= 0.05 * e;
    };
    this.findFinderPattern = function (a) {
      var b;
      this.image = a;
      var e = g.height,
        d = g.width,
        c = Math.floor((3 * e) / (4 * W));
      c < L && (c = L);
      for (var h = !1, l = Array(5), m = c - 1; m < e && !h; m += c) {
        l[0] = 0;
        l[1] = 0;
        l[2] = 0;
        l[3] = 0;
        for (var f = (b = l[4] = 0); f < d; f++)
          if (a[f + m * g.width]) 1 == (b & 1) && b++, l[b]++;
          else if (0 == (b & 1))
            if (4 == b)
              if (this.foundPatternCross(l)) {
                if ((b = this.handlePossibleCenter(l, m, f)))
                  (c = 2),
                    this.hasSkipped
                      ? (h = this.haveMultiplyConfirmedCenters())
                      : ((b = this.findRowSkip()),
                        b > l[2] && ((m += b - l[2] - c), (f = d - 1)));
                else {
                  do f++;
                  while (f < d && !a[f + m * g.width]);
                  f--;
                }
                b = 0;
                l[0] = 0;
                l[1] = 0;
                l[2] = 0;
                l[3] = 0;
                l[4] = 0;
              } else
                (l[0] = l[2]),
                  (l[1] = l[3]),
                  (l[2] = l[4]),
                  (l[3] = 1),
                  (l[4] = 0),
                  (b = 3);
            else l[++b]++;
          else l[b]++;
        this.foundPatternCross(l) &&
          (b = this.handlePossibleCenter(l, m, d)) &&
          ((c = l[0]),
          this.hasSkipped && (h = this.haveMultiplyConfirmedCenters()));
      }
      a = this.selectBestPatterns();
      g.orderBestPatterns(a);
      return new V(a);
    };
  }
  function M(a, b, e) {
    this.x = a;
    this.y = b;
    this.count = 1;
    this.estimatedModuleSize = e;
    this.__defineGetter__("EstimatedModuleSize", function () {
      return this.estimatedModuleSize;
    });
    this.__defineGetter__("Count", function () {
      return this.count;
    });
    this.__defineGetter__("X", function () {
      return Math.floor(this.x);
    });
    this.__defineGetter__("Y", function () {
      return Math.floor(this.y);
    });
    this.incrementCount = function () {
      this.count++;
    };
    this.aboutEquals = function (d, c, b) {
      return Math.abs(c - this.y) <= d && Math.abs(b - this.x) <= d
        ? ((d = Math.abs(d - this.estimatedModuleSize)),
          1 >= d || 1 >= d / this.estimatedModuleSize)
        : !1;
    };
  }
  function R(a, b, e, d, c, f, l) {
    this.image = a;
    this.possibleCenters = [];
    this.startX = b;
    this.startY = e;
    this.width = d;
    this.height = c;
    this.moduleSize = f;
    this.crossCheckStateCount = [0, 0, 0];
    this.resultPointCallback = l;
    this.centerFromEnd = function (c, d) {
      return d - c[2] - c[1] / 2;
    };
    this.foundPatternCross = function (c) {
      for (var d = this.moduleSize, b = d / 2, a = 0; 3 > a; a++)
        if (Math.abs(d - c[a]) >= b) return !1;
      return !0;
    };
    this.crossCheckVertical = function (c, d, b, a) {
      var e = this.image,
        h = g.height,
        f = this.crossCheckStateCount;
      f[0] = 0;
      f[1] = 0;
      f[2] = 0;
      for (var l = c; 0 <= l && e[d + l * g.width] && f[1] <= b; ) f[1]++, l--;
      if (0 > l || f[1] > b) return NaN;
      for (; 0 <= l && !e[d + l * g.width] && f[0] <= b; ) f[0]++, l--;
      if (f[0] > b) return NaN;
      for (l = c + 1; l < h && e[d + l * g.width] && f[1] <= b; ) f[1]++, l++;
      if (l == h || f[1] > b) return NaN;
      for (; l < h && !e[d + l * g.width] && f[2] <= b; ) f[2]++, l++;
      return f[2] > b || 5 * Math.abs(f[0] + f[1] + f[2] - a) >= 2 * a
        ? NaN
        : this.foundPatternCross(f)
        ? this.centerFromEnd(f, l)
        : NaN;
    };
    this.handlePossibleCenter = function (c, d, b) {
      var a = c[0] + c[1] + c[2];
      b = this.centerFromEnd(c, b);
      d = this.crossCheckVertical(d, Math.floor(b), 2 * c[1], a);
      if (!isNaN(d)) {
        c = (c[0] + c[1] + c[2]) / 3;
        for (var a = this.possibleCenters.length, e = 0; e < a; e++)
          if (this.possibleCenters[e].aboutEquals(c, d, b))
            return new M(b, d, c);
        b = new M(b, d, c);
        this.possibleCenters.push(b);
        null != this.resultPointCallback &&
          this.resultPointCallback.foundPossibleResultPoint(b);
      }
      return null;
    };
    this.find = function () {
      for (
        var c,
          b = this.startX,
          h = this.height,
          f = b + d,
          l = e + (h >> 1),
          p = [0, 0, 0],
          k = 0;
        k < h;
        k++
      ) {
        var n = l + (0 == (k & 1) ? (k + 1) >> 1 : -((k + 1) >> 1));
        p[0] = 0;
        p[1] = 0;
        p[2] = 0;
        for (var A = b; A < f && !a[A + g.width * n]; ) A++;
        for (c = 0; A < f; ) {
          if (a[A + n * g.width])
            if (1 == c) p[c]++;
            else if (2 == c) {
              if (
                this.foundPatternCross(p) &&
                ((c = this.handlePossibleCenter(p, n, A)), null != c)
              )
                return c;
              p[0] = p[2];
              p[1] = 1;
              p[2] = 0;
              c = 1;
            } else p[++c]++;
          else 1 == c && c++, p[c]++;
          A++;
        }
        if (
          this.foundPatternCross(p) &&
          ((c = this.handlePossibleCenter(p, n, f)), null != c)
        )
          return c;
      }
      if (0 != this.possibleCenters.length) return this.possibleCenters[0];
      throw "Couldn't find enough alignment patterns";
    };
  }
  function X(a, b, e) {
    this.blockPointer = 0;
    this.bitPointer = 7;
    this.dataLength = 0;
    this.blocks = a;
    this.numErrorCorrectionCode = e;
    9 >= b
      ? (this.dataLengthMode = 0)
      : 10 <= b && 26 >= b
      ? (this.dataLengthMode = 1)
      : 27 <= b && 40 >= b && (this.dataLengthMode = 2);
    this.getNextBits = function (b) {
      var c, d;
      if (b < this.bitPointer + 1) {
        var a = 0;
        for (d = 0; d < b; d++) a += 1 << d;
        a <<= this.bitPointer - b + 1;
        d = (this.blocks[this.blockPointer] & a) >> (this.bitPointer - b + 1);
        this.bitPointer -= b;
        return d;
      }
      if (b < this.bitPointer + 1 + 8) {
        for (d = c = 0; d < this.bitPointer + 1; d++) c += 1 << d;
        d = (this.blocks[this.blockPointer] & c) << (b - (this.bitPointer + 1));
        this.blockPointer++;
        d +=
          this.blocks[this.blockPointer] >> (8 - (b - (this.bitPointer + 1)));
        this.bitPointer -= b % 8;
        0 > this.bitPointer && (this.bitPointer = 8 + this.bitPointer);
        return d;
      }
      if (b < this.bitPointer + 1 + 16) {
        for (d = a = c = 0; d < this.bitPointer + 1; d++) c += 1 << d;
        c = (this.blocks[this.blockPointer] & c) << (b - (this.bitPointer + 1));
        this.blockPointer++;
        var e =
          this.blocks[this.blockPointer] << (b - (this.bitPointer + 1 + 8));
        this.blockPointer++;
        for (d = 0; d < b - (this.bitPointer + 1 + 8); d++) a += 1 << d;
        a <<= 8 - (b - (this.bitPointer + 1 + 8));
        d =
          (this.blocks[this.blockPointer] & a) >>
          (8 - (b - (this.bitPointer + 1 + 8)));
        this.bitPointer -= (b - 8) % 8;
        0 > this.bitPointer && (this.bitPointer = 8 + this.bitPointer);
        return c + e + d;
      }
      return 0;
    };
    this.NextMode = function () {
      return this.blockPointer >
        this.blocks.length - this.numErrorCorrectionCode - 2
        ? 0
        : this.getNextBits(4);
    };
    this.getDataLength = function (b) {
      for (var c = 0; 1 != b >> c; ) c++;
      return this.getNextBits(g.sizeOfDataLengthInfo[this.dataLengthMode][c]);
    };
    this.getRomanAndFigureString = function (b) {
      var c = "",
        d = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".split("");
      do
        if (1 < b) {
          var a = this.getNextBits(11);
          var e = a % 45,
            c = c + d[Math.floor(a / 45)],
            c = c + d[e];
          b -= 2;
        } else 1 == b && ((a = this.getNextBits(6)), (c += d[a]), --b);
      while (0 < b);
      return c;
    };
    this.getFigureString = function (b) {
      var c = 0,
        d = "";
      do
        3 <= b
          ? ((c = this.getNextBits(10)),
            100 > c && (d += "0"),
            10 > c && (d += "0"),
            (b -= 3))
          : 2 == b
          ? ((c = this.getNextBits(7)), 10 > c && (d += "0"), (b -= 2))
          : 1 == b && ((c = this.getNextBits(4)), --b),
          (d += c);
      while (0 < b);
      return d;
    };
    this.get8bitByteArray = function (b) {
      var c = [];
      do {
        var d = this.getNextBits(8);
        c.push(d);
        b--;
      } while (0 < b);
      return c;
    };
    this.getKanjiString = function (b) {
      var c = "";
      do {
        var d = this.getNextBits(13);
        d = ((d / 192) << 8) + (d % 192);
        c += String.fromCharCode(40956 >= d + 33088 ? d + 33088 : d + 49472);
        b--;
      } while (0 < b);
      return c;
    };
    this.parseECIValue = function () {
      var b = 0,
        c = this.getNextBits(8);
      0 == (c & 128) && (b = c & 127);
      128 == (c & 192) && ((b = this.getNextBits(8)), (b |= (c & 63) << 8));
      192 == (c & 224) && ((b = this.getNextBits(8)), (b |= (c & 31) << 16));
      return b;
    };
    this.__defineGetter__("DataByte", function () {
      var b = [];
      do {
        var c = this.NextMode();
        if (0 == c)
          if (0 < b.length) break;
          else throw "Empty data block";
        if (1 != c && 2 != c && 4 != c && 8 != c && 7 != c)
          throw (
            "Invalid mode: " +
            c +
            " in (block:" +
            this.blockPointer +
            " bit:" +
            this.bitPointer +
            ")"
          );
        if (7 == c) this.parseECIValue();
        else {
          var a = this.getDataLength(c);
          if (1 > a) throw "Invalid data length: " + a;
          switch (c) {
            case 1:
              c = this.getFigureString(a);
              for (var a = Array(c.length), e = 0; e < c.length; e++)
                a[e] = c.charCodeAt(e);
              b.push(a);
              break;
            case 2:
              c = this.getRomanAndFigureString(a);
              a = Array(c.length);
              for (e = 0; e < c.length; e++) a[e] = c.charCodeAt(e);
              b.push(a);
              break;
            case 4:
              c = this.get8bitByteArray(a);
              b.push(c);
              break;
            case 8:
              (c = this.getKanjiString(a)), b.push(c);
          }
        }
      } while (1);
      return b;
    });
  }
  var F = {
    checkAndNudgePoints: function (a, b) {
      for (
        var e, d, c = g.width, h = g.height, f = !0, m = 0;
        m < b.length && f;
        m += 2
      ) {
        d = Math.floor(b[m]);
        e = Math.floor(b[m + 1]);
        if (-1 > d || d > c || -1 > e || e > h)
          throw "Error.checkAndNudgePoints ";
        f = !1;
        -1 == d ? ((b[m] = 0), (f = !0)) : d == c && ((b[m] = c - 1), (f = !0));
        -1 == e
          ? ((b[m + 1] = 0), (f = !0))
          : e == h && ((b[m + 1] = h - 1), (f = !0));
      }
      f = !0;
      for (m = b.length - 2; 0 <= m && f; m -= 2) {
        d = Math.floor(b[m]);
        e = Math.floor(b[m + 1]);
        if (-1 > d || d > c || -1 > e || e > h)
          throw "Error.checkAndNudgePoints ";
        f = !1;
        -1 == d ? ((b[m] = 0), (f = !0)) : d == c && ((b[m] = c - 1), (f = !0));
        -1 == e
          ? ((b[m + 1] = 0), (f = !0))
          : e == h && ((b[m + 1] = h - 1), (f = !0));
      }
    },
    sampleGrid3: function (a, b, e) {
      for (var d = new I(b), c = Array(b << 1), h = 0; h < b; h++) {
        for (var f = c.length, m = h + 0.5, k = 0; k < f; k += 2)
          (c[k] = (k >> 1) + 0.5), (c[k + 1] = m);
        e.transformPoints1(c);
        F.checkAndNudgePoints(a, c);
        try {
          for (k = 0; k < f; k += 2)
            a[Math.floor(c[k]) + g.width * Math.floor(c[k + 1])] &&
              d.set_Renamed(k >> 1, h);
        } catch (q) {
          throw "Error.checkAndNudgePoints";
        }
      }
      return d;
    },
    sampleGridx: function (
      a,
      b,
      e,
      d,
      c,
      f,
      l,
      g,
      k,
      q,
      n,
      x,
      v,
      t,
      r,
      A,
      u,
      w
    ) {
      e = z.quadrilateralToQuadrilateral(
        e,
        d,
        c,
        f,
        l,
        g,
        k,
        q,
        n,
        x,
        v,
        t,
        r,
        A,
        u,
        w
      );
      return F.sampleGrid3(a, b, e);
    },
  };
  k.VERSION_DECODE_INFO = [
    31892, 34236, 39577, 42195, 48118, 51042, 55367, 58893, 63784, 68472, 70749,
    76311, 79154, 84390, 87683, 92361, 96236, 102084, 102881, 110507, 110734,
    117786, 119615, 126325, 127568, 133589, 136944, 141498, 145311, 150283,
    152622, 158308, 161089, 167017,
  ];
  k.VERSIONS = [
    new k(
      1,
      [],
      new f(7, new a(1, 19)),
      new f(10, new a(1, 16)),
      new f(13, new a(1, 13)),
      new f(17, new a(1, 9))
    ),
    new k(
      2,
      [6, 18],
      new f(10, new a(1, 34)),
      new f(16, new a(1, 28)),
      new f(22, new a(1, 22)),
      new f(28, new a(1, 16))
    ),
    new k(
      3,
      [6, 22],
      new f(15, new a(1, 55)),
      new f(26, new a(1, 44)),
      new f(18, new a(2, 17)),
      new f(22, new a(2, 13))
    ),
    new k(
      4,
      [6, 26],
      new f(20, new a(1, 80)),
      new f(18, new a(2, 32)),
      new f(26, new a(2, 24)),
      new f(16, new a(4, 9))
    ),
    new k(
      5,
      [6, 30],
      new f(26, new a(1, 108)),
      new f(24, new a(2, 43)),
      new f(18, new a(2, 15), new a(2, 16)),
      new f(22, new a(2, 11), new a(2, 12))
    ),
    new k(
      6,
      [6, 34],
      new f(18, new a(2, 68)),
      new f(16, new a(4, 27)),
      new f(24, new a(4, 19)),
      new f(28, new a(4, 15))
    ),
    new k(
      7,
      [6, 22, 38],
      new f(20, new a(2, 78)),
      new f(18, new a(4, 31)),
      new f(18, new a(2, 14), new a(4, 15)),
      new f(26, new a(4, 13), new a(1, 14))
    ),
    new k(
      8,
      [6, 24, 42],
      new f(24, new a(2, 97)),
      new f(22, new a(2, 38), new a(2, 39)),
      new f(22, new a(4, 18), new a(2, 19)),
      new f(26, new a(4, 14), new a(2, 15))
    ),
    new k(
      9,
      [6, 26, 46],
      new f(30, new a(2, 116)),
      new f(22, new a(3, 36), new a(2, 37)),
      new f(20, new a(4, 16), new a(4, 17)),
      new f(24, new a(4, 12), new a(4, 13))
    ),
    new k(
      10,
      [6, 28, 50],
      new f(18, new a(2, 68), new a(2, 69)),
      new f(26, new a(4, 43), new a(1, 44)),
      new f(24, new a(6, 19), new a(2, 20)),
      new f(28, new a(6, 15), new a(2, 16))
    ),
    new k(
      11,
      [6, 30, 54],
      new f(20, new a(4, 81)),
      new f(30, new a(1, 50), new a(4, 51)),
      new f(28, new a(4, 22), new a(4, 23)),
      new f(24, new a(3, 12), new a(8, 13))
    ),
    new k(
      12,
      [6, 32, 58],
      new f(24, new a(2, 92), new a(2, 93)),
      new f(22, new a(6, 36), new a(2, 37)),
      new f(26, new a(4, 20), new a(6, 21)),
      new f(28, new a(7, 14), new a(4, 15))
    ),
    new k(
      13,
      [6, 34, 62],
      new f(26, new a(4, 107)),
      new f(22, new a(8, 37), new a(1, 38)),
      new f(24, new a(8, 20), new a(4, 21)),
      new f(22, new a(12, 11), new a(4, 12))
    ),
    new k(
      14,
      [6, 26, 46, 66],
      new f(30, new a(3, 115), new a(1, 116)),
      new f(24, new a(4, 40), new a(5, 41)),
      new f(20, new a(11, 16), new a(5, 17)),
      new f(24, new a(11, 12), new a(5, 13))
    ),
    new k(
      15,
      [6, 26, 48, 70],
      new f(22, new a(5, 87), new a(1, 88)),
      new f(24, new a(5, 41), new a(5, 42)),
      new f(30, new a(5, 24), new a(7, 25)),
      new f(24, new a(11, 12), new a(7, 13))
    ),
    new k(
      16,
      [6, 26, 50, 74],
      new f(24, new a(5, 98), new a(1, 99)),
      new f(28, new a(7, 45), new a(3, 46)),
      new f(24, new a(15, 19), new a(2, 20)),
      new f(30, new a(3, 15), new a(13, 16))
    ),
    new k(
      17,
      [6, 30, 54, 78],
      new f(28, new a(1, 107), new a(5, 108)),
      new f(28, new a(10, 46), new a(1, 47)),
      new f(28, new a(1, 22), new a(15, 23)),
      new f(28, new a(2, 14), new a(17, 15))
    ),
    new k(
      18,
      [6, 30, 56, 82],
      new f(30, new a(5, 120), new a(1, 121)),
      new f(26, new a(9, 43), new a(4, 44)),
      new f(28, new a(17, 22), new a(1, 23)),
      new f(28, new a(2, 14), new a(19, 15))
    ),
    new k(
      19,
      [6, 30, 58, 86],
      new f(28, new a(3, 113), new a(4, 114)),
      new f(26, new a(3, 44), new a(11, 45)),
      new f(26, new a(17, 21), new a(4, 22)),
      new f(26, new a(9, 13), new a(16, 14))
    ),
    new k(
      20,
      [6, 34, 62, 90],
      new f(28, new a(3, 107), new a(5, 108)),
      new f(26, new a(3, 41), new a(13, 42)),
      new f(30, new a(15, 24), new a(5, 25)),
      new f(28, new a(15, 15), new a(10, 16))
    ),
    new k(
      21,
      [6, 28, 50, 72, 94],
      new f(28, new a(4, 116), new a(4, 117)),
      new f(26, new a(17, 42)),
      new f(28, new a(17, 22), new a(6, 23)),
      new f(30, new a(19, 16), new a(6, 17))
    ),
    new k(
      22,
      [6, 26, 50, 74, 98],
      new f(28, new a(2, 111), new a(7, 112)),
      new f(28, new a(17, 46)),
      new f(30, new a(7, 24), new a(16, 25)),
      new f(24, new a(34, 13))
    ),
    new k(
      23,
      [6, 30, 54, 74, 102],
      new f(30, new a(4, 121), new a(5, 122)),
      new f(28, new a(4, 47), new a(14, 48)),
      new f(30, new a(11, 24), new a(14, 25)),
      new f(30, new a(16, 15), new a(14, 16))
    ),
    new k(
      24,
      [6, 28, 54, 80, 106],
      new f(30, new a(6, 117), new a(4, 118)),
      new f(28, new a(6, 45), new a(14, 46)),
      new f(30, new a(11, 24), new a(16, 25)),
      new f(30, new a(30, 16), new a(2, 17))
    ),
    new k(
      25,
      [6, 32, 58, 84, 110],
      new f(26, new a(8, 106), new a(4, 107)),
      new f(28, new a(8, 47), new a(13, 48)),
      new f(30, new a(7, 24), new a(22, 25)),
      new f(30, new a(22, 15), new a(13, 16))
    ),
    new k(
      26,
      [6, 30, 58, 86, 114],
      new f(28, new a(10, 114), new a(2, 115)),
      new f(28, new a(19, 46), new a(4, 47)),
      new f(28, new a(28, 22), new a(6, 23)),
      new f(30, new a(33, 16), new a(4, 17))
    ),
    new k(
      27,
      [6, 34, 62, 90, 118],
      new f(30, new a(8, 122), new a(4, 123)),
      new f(28, new a(22, 45), new a(3, 46)),
      new f(30, new a(8, 23), new a(26, 24)),
      new f(30, new a(12, 15), new a(28, 16))
    ),
    new k(
      28,
      [6, 26, 50, 74, 98, 122],
      new f(30, new a(3, 117), new a(10, 118)),
      new f(28, new a(3, 45), new a(23, 46)),
      new f(30, new a(4, 24), new a(31, 25)),
      new f(30, new a(11, 15), new a(31, 16))
    ),
    new k(
      29,
      [6, 30, 54, 78, 102, 126],
      new f(30, new a(7, 116), new a(7, 117)),
      new f(28, new a(21, 45), new a(7, 46)),
      new f(30, new a(1, 23), new a(37, 24)),
      new f(30, new a(19, 15), new a(26, 16))
    ),
    new k(
      30,
      [6, 26, 52, 78, 104, 130],
      new f(30, new a(5, 115), new a(10, 116)),
      new f(28, new a(19, 47), new a(10, 48)),
      new f(30, new a(15, 24), new a(25, 25)),
      new f(30, new a(23, 15), new a(25, 16))
    ),
    new k(
      31,
      [6, 30, 56, 82, 108, 134],
      new f(30, new a(13, 115), new a(3, 116)),
      new f(28, new a(2, 46), new a(29, 47)),
      new f(30, new a(42, 24), new a(1, 25)),
      new f(30, new a(23, 15), new a(28, 16))
    ),
    new k(
      32,
      [6, 34, 60, 86, 112, 138],
      new f(30, new a(17, 115)),
      new f(28, new a(10, 46), new a(23, 47)),
      new f(30, new a(10, 24), new a(35, 25)),
      new f(30, new a(19, 15), new a(35, 16))
    ),
    new k(
      33,
      [6, 30, 58, 86, 114, 142],
      new f(30, new a(17, 115), new a(1, 116)),
      new f(28, new a(14, 46), new a(21, 47)),
      new f(30, new a(29, 24), new a(19, 25)),
      new f(30, new a(11, 15), new a(46, 16))
    ),
    new k(
      34,
      [6, 34, 62, 90, 118, 146],
      new f(30, new a(13, 115), new a(6, 116)),
      new f(28, new a(14, 46), new a(23, 47)),
      new f(30, new a(44, 24), new a(7, 25)),
      new f(30, new a(59, 16), new a(1, 17))
    ),
    new k(
      35,
      [6, 30, 54, 78, 102, 126, 150],
      new f(30, new a(12, 121), new a(7, 122)),
      new f(28, new a(12, 47), new a(26, 48)),
      new f(30, new a(39, 24), new a(14, 25)),
      new f(30, new a(22, 15), new a(41, 16))
    ),
    new k(
      36,
      [6, 24, 50, 76, 102, 128, 154],
      new f(30, new a(6, 121), new a(14, 122)),
      new f(28, new a(6, 47), new a(34, 48)),
      new f(30, new a(46, 24), new a(10, 25)),
      new f(30, new a(2, 15), new a(64, 16))
    ),
    new k(
      37,
      [6, 28, 54, 80, 106, 132, 158],
      new f(30, new a(17, 122), new a(4, 123)),
      new f(28, new a(29, 46), new a(14, 47)),
      new f(30, new a(49, 24), new a(10, 25)),
      new f(30, new a(24, 15), new a(46, 16))
    ),
    new k(
      38,
      [6, 32, 58, 84, 110, 136, 162],
      new f(30, new a(4, 122), new a(18, 123)),
      new f(28, new a(13, 46), new a(32, 47)),
      new f(30, new a(48, 24), new a(14, 25)),
      new f(30, new a(42, 15), new a(32, 16))
    ),
    new k(
      39,
      [6, 26, 54, 82, 110, 138, 166],
      new f(30, new a(20, 117), new a(4, 118)),
      new f(28, new a(40, 47), new a(7, 48)),
      new f(30, new a(43, 24), new a(22, 25)),
      new f(30, new a(10, 15), new a(67, 16))
    ),
    new k(
      40,
      [6, 30, 58, 86, 114, 142, 170],
      new f(30, new a(19, 118), new a(6, 119)),
      new f(28, new a(18, 47), new a(31, 48)),
      new f(30, new a(34, 24), new a(34, 25)),
      new f(30, new a(20, 15), new a(61, 16))
    ),
  ];
  k.getVersionForNumber = function (a) {
    if (1 > a || 40 < a) throw "ArgumentException";
    return k.VERSIONS[a - 1];
  };
  k.getProvisionalVersionForDimension = function (a) {
    if (1 != a % 4) throw "Error getProvisionalVersionForDimension";
    try {
      return k.getVersionForNumber((a - 17) >> 2);
    } catch (b) {
      throw "Error getVersionForNumber";
    }
  };
  k.decodeVersionInformation = function (a) {
    for (
      var b = 4294967295, e = 0, d = 0;
      d < k.VERSION_DECODE_INFO.length;
      d++
    ) {
      var c = k.VERSION_DECODE_INFO[d];
      if (c == a) return this.getVersionForNumber(d + 7);
      c = r.numBitsDiffering(a, c);
      c < b && ((e = d + 7), (b = c));
    }
    return 3 >= b ? this.getVersionForNumber(e) : null;
  };
  z.quadrilateralToQuadrilateral = function (
    a,
    b,
    e,
    d,
    c,
    f,
    g,
    m,
    k,
    q,
    n,
    x,
    v,
    t,
    r,
    u
  ) {
    a = this.quadrilateralToSquare(a, b, e, d, c, f, g, m);
    return this.squareToQuadrilateral(k, q, n, x, v, t, r, u).times(a);
  };
  z.squareToQuadrilateral = function (a, b, e, d, c, f, g, m) {
    var h = m - f,
      l = b - d + f - m;
    if (0 == h && 0 == l)
      return new z(e - a, c - e, a, d - b, f - d, b, 0, 0, 1);
    var p = e - c,
      k = g - c;
    c = a - e + c - g;
    f = d - f;
    var n = p * h - k * f,
      h = (c * h - k * l) / n,
      l = (p * l - c * f) / n;
    return new z(
      e - a + h * e,
      g - a + l * g,
      a,
      d - b + h * d,
      m - b + l * m,
      b,
      h,
      l,
      1
    );
  };
  z.quadrilateralToSquare = function (a, b, e, d, c, f, g, m) {
    return this.squareToQuadrilateral(a, b, e, d, c, f, g, m).buildAdjoint();
  };
  var N = [
      [21522, 0],
      [20773, 1],
      [24188, 2],
      [23371, 3],
      [17913, 4],
      [16590, 5],
      [20375, 6],
      [19104, 7],
      [30660, 8],
      [29427, 9],
      [32170, 10],
      [30877, 11],
      [26159, 12],
      [25368, 13],
      [27713, 14],
      [26998, 15],
      [5769, 16],
      [5054, 17],
      [7399, 18],
      [6608, 19],
      [1890, 20],
      [597, 21],
      [3340, 22],
      [2107, 23],
      [13663, 24],
      [12392, 25],
      [16177, 26],
      [14854, 27],
      [9396, 28],
      [8579, 29],
      [11994, 30],
      [11245, 31],
    ],
    B = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
  r.numBitsDiffering = function (a, b) {
    a ^= b;
    return (
      B[a & 15] +
      B[u(a, 4) & 15] +
      B[u(a, 8) & 15] +
      B[u(a, 12) & 15] +
      B[u(a, 16) & 15] +
      B[u(a, 20) & 15] +
      B[u(a, 24) & 15] +
      B[u(a, 28) & 15]
    );
  };
  r.decodeFormatInformation = function (a) {
    var b = r.doDecodeFormatInformation(a);
    return null != b ? b : r.doDecodeFormatInformation(a ^ 21522);
  };
  r.doDecodeFormatInformation = function (a) {
    for (var b = 4294967295, e = 0, d = 0; d < N.length; d++) {
      var c = N[d],
        h = c[0];
      if (h == a) return new r(c[1]);
      h = this.numBitsDiffering(a, h);
      h < b && ((e = c[1]), (b = h));
    }
    return 3 >= b ? new r(e) : null;
  };
  C.forBits = function (a) {
    if (0 > a || a >= O.length) throw "ArgumentException";
    return O[a];
  };
  var Y = new C(0, 1, "L"),
    Z = new C(1, 0, "M"),
    aa = new C(2, 3, "Q"),
    ba = new C(3, 2, "H"),
    O = [Z, Y, ba, aa];
  G.getDataBlocks = function (a, b, e) {
    if (a.length != b.TotalCodewords) throw "ArgumentException";
    var d = b.getECBlocksForLevel(e);
    e = 0;
    var c = d.getECBlocks();
    for (b = 0; b < c.length; b++) e += c[b].Count;
    e = Array(e);
    for (var h = 0, f = 0; f < c.length; f++) {
      var g = c[f];
      for (b = 0; b < g.Count; b++) {
        var k = g.DataCodewords,
          q = d.ECCodewordsPerBlock + k;
        e[h++] = new G(k, Array(q));
      }
    }
    b = e[0].codewords.length;
    for (c = e.length - 1; 0 <= c && e[c].codewords.length != b; ) c--;
    c++;
    d = b - d.ECCodewordsPerBlock;
    for (b = g = 0; b < d; b++)
      for (f = 0; f < h; f++) e[f].codewords[b] = a[g++];
    for (f = c; f < h; f++) e[f].codewords[d] = a[g++];
    k = e[0].codewords.length;
    for (b = d; b < k; b++)
      for (f = 0; f < h; f++) e[f].codewords[f < c ? b : b + 1] = a[g++];
    return e;
  };
  var H = {
    forReference: function (a) {
      if (0 > a || 7 < a) throw "System.ArgumentException";
      return H.DATA_MASKS[a];
    },
  };
  H.DATA_MASKS = [
    new (function () {
      this.unmaskBitMatrix = function (a, b) {
        for (var e = 0; e < b; e++)
          for (var d = 0; d < b; d++) this.isMasked(e, d) && a.flip(d, e);
      };
      this.isMasked = function (a, b) {
        return 0 == ((a + b) & 1);
      };
    })(),
    new (function () {
      this.unmaskBitMatrix = function (a, b) {
        for (var e = 0; e < b; e++)
          for (var d = 0; d < b; d++) this.isMasked(e, d) && a.flip(d, e);
      };
      this.isMasked = function (a, b) {
        return 0 == (a & 1);
      };
    })(),
    new (function () {
      this.unmaskBitMatrix = function (a, b) {
        for (var e = 0; e < b; e++)
          for (var d = 0; d < b; d++) this.isMasked(e, d) && a.flip(d, e);
      };
      this.isMasked = function (a, b) {
        return 0 == b % 3;
      };
    })(),
    new (function () {
      this.unmaskBitMatrix = function (a, b) {
        for (var e = 0; e < b; e++)
          for (var d = 0; d < b; d++) this.isMasked(e, d) && a.flip(d, e);
      };
      this.isMasked = function (a, b) {
        return 0 == (a + b) % 3;
      };
    })(),
    new (function () {
      this.unmaskBitMatrix = function (a, b) {
        for (var e = 0; e < b; e++)
          for (var d = 0; d < b; d++) this.isMasked(e, d) && a.flip(d, e);
      };
      this.isMasked = function (a, b) {
        return 0 == ((u(a, 1) + b / 3) & 1);
      };
    })(),
    new (function () {
      this.unmaskBitMatrix = function (a, b) {
        for (var e = 0; e < b; e++)
          for (var d = 0; d < b; d++) this.isMasked(e, d) && a.flip(d, e);
      };
      this.isMasked = function (a, b) {
        var e = a * b;
        return 0 == (e & 1) + (e % 3);
      };
    })(),
    new (function () {
      this.unmaskBitMatrix = function (a, b) {
        for (var e = 0; e < b; e++)
          for (var d = 0; d < b; d++) this.isMasked(e, d) && a.flip(d, e);
      };
      this.isMasked = function (a, b) {
        var e = a * b;
        return 0 == (((e & 1) + (e % 3)) & 1);
      };
    })(),
    new (function () {
      this.unmaskBitMatrix = function (a, b) {
        for (var e = 0; e < b; e++)
          for (var d = 0; d < b; d++) this.isMasked(e, d) && a.flip(d, e);
      };
      this.isMasked = function (a, b) {
        return 0 == ((((a + b) & 1) + ((a * b) % 3)) & 1);
      };
    })(),
  ];
  n.QR_CODE_FIELD = new n(285);
  n.DATA_MATRIX_FIELD = new n(301);
  n.addOrSubtract = function (a, b) {
    return a ^ b;
  };
  var E = {};
  E.rsDecoder = new (function (a) {
    this.field = a;
    this.decode = function (a, e) {
      for (var b = new w(this.field, a), c = Array(e), f = 0; f < c.length; f++)
        c[f] = 0;
      for (var h = !0, f = 0; f < e; f++) {
        var g = b.evaluateAt(this.field.exp(f));
        c[c.length - 1 - f] = g;
        0 != g && (h = !1);
      }
      if (!h)
        for (
          f = new w(this.field, c),
            b = this.runEuclideanAlgorithm(
              this.field.buildMonomial(e, 1),
              f,
              e
            ),
            f = b[1],
            b = this.findErrorLocations(b[0]),
            c = this.findErrorMagnitudes(f, b, !1),
            f = 0;
          f < b.length;
          f++
        ) {
          h = a.length - 1 - this.field.log(b[f]);
          if (0 > h) throw "ReedSolomonException Bad error location";
          a[h] = n.addOrSubtract(a[h], c[f]);
        }
    };
    this.runEuclideanAlgorithm = function (a, e, d) {
      if (a.Degree < e.Degree) {
        var b = a;
        a = e;
        e = b;
      }
      for (
        var b = this.field.One,
          f = this.field.Zero,
          h = this.field.Zero,
          g = this.field.One;
        e.Degree >= Math.floor(d / 2);

      ) {
        var k = a,
          q = b,
          n = h;
        a = e;
        b = f;
        h = g;
        if (a.Zero) throw "r_{i-1} was zero";
        e = k;
        g = this.field.Zero;
        f = a.getCoefficient(a.Degree);
        for (f = this.field.inverse(f); e.Degree >= a.Degree && !e.Zero; ) {
          var k = e.Degree - a.Degree,
            r = this.field.multiply(e.getCoefficient(e.Degree), f),
            g = g.addOrSubtract(this.field.buildMonomial(k, r));
          e = e.addOrSubtract(a.multiplyByMonomial(k, r));
        }
        f = g.multiply1(b).addOrSubtract(q);
        g = g.multiply1(h).addOrSubtract(n);
      }
      d = g.getCoefficient(0);
      if (0 == d) throw "ReedSolomonException sigmaTilde(0) was zero";
      d = this.field.inverse(d);
      a = g.multiply2(d);
      d = e.multiply2(d);
      return [a, d];
    };
    this.findErrorLocations = function (a) {
      var b = a.Degree;
      if (1 == b) return Array(a.getCoefficient(1));
      for (var d = Array(b), c = 0, f = 1; 256 > f && c < b; f++)
        0 == a.evaluateAt(f) && ((d[c] = this.field.inverse(f)), c++);
      if (c != b) throw "Error locator degree does not match number of roots";
      return d;
    };
    this.findErrorMagnitudes = function (a, e, d) {
      for (var b = e.length, f = Array(b), h = 0; h < b; h++) {
        for (var g = this.field.inverse(e[h]), k = 1, q = 0; q < b; q++)
          h != q &&
            (k = this.field.multiply(
              k,
              n.addOrSubtract(1, this.field.multiply(e[q], g))
            ));
        f[h] = this.field.multiply(a.evaluateAt(g), this.field.inverse(k));
        d && (f[h] = this.field.multiply(f[h], g));
      }
      return f;
    };
  })(n.QR_CODE_FIELD);
  E.correctErrors = function (a, b) {
    for (var e = a.length, d = Array(e), c = 0; c < e; c++) d[c] = a[c] & 255;
    e = a.length - b;
    try {
      E.rsDecoder.decode(d, e);
    } catch (p) {
      throw p;
    }
    for (c = 0; c < b; c++) a[c] = d[c];
  };
  E.decode = function (a) {
    var b = new T(a);
    a = b.readVersion();
    for (
      var e = b.readFormatInformation().ErrorCorrectionLevel,
        b = b.readCodewords(),
        b = G.getDataBlocks(b, a, e),
        d = 0,
        c = 0;
      c < b.length;
      c++
    )
      d += b[c].NumDataCodewords;
    for (var d = Array(d), f = 0, h = 0; h < b.length; h++) {
      var c = b[h],
        g = c.Codewords,
        k = c.NumDataCodewords;
      E.correctErrors(g, k);
      for (c = 0; c < k; c++) d[f++] = g[c];
    }
    return new X(d, a.VersionNumber, e.Bits);
  };
  var g = {
      imagedata: null,
      width: 0,
      height: 0,
      qrCodeSymbol: null,
      debug: !1,
      maxImgSize: 1048576,
      sizeOfDataLengthInfo: [
        [10, 9, 8, 8],
        [12, 11, 16, 10],
        [14, 13, 16, 12],
      ],
      callback: null,
      vidSuccess: function (a) {
        g.localstream = a;
        g.webkit
          ? (g.video.src = window.webkitURL.createObjectURL(a))
          : g.moz
          ? ((g.video.mozSrcObject = a), g.video.play())
          : (g.video.src = a);
        g.gUM = !0;
        g.canvas_qr2 = document.createElement("canvas");
        g.canvas_qr2.id = "qr-canvas";
        g.qrcontext2 = g.canvas_qr2.getContext("2d");
        g.canvas_qr2.width = g.video.videoWidth;
        g.canvas_qr2.height = g.video.videoHeight;
        setTimeout(g.captureToCanvas, 500);
      },
      vidError: function (a) {
        g.gUM = !1;
      },
      captureToCanvas: function () {
        if (g.gUM)
          try {
            if (0 == g.video.videoWidth) setTimeout(g.captureToCanvas, 500);
            else {
              g.canvas_qr2.width = g.video.videoWidth;
              g.canvas_qr2.height = g.video.videoHeight;
              g.qrcontext2.drawImage(g.video, 0, 0);
              try {
                g.decode();
              } catch (h) {
                console.log(h), setTimeout(g.captureToCanvas, 500);
              }
            }
          } catch (h) {
            console.log(h), setTimeout(g.captureToCanvas, 500);
          }
      },
      setWebcam: function (a) {
        var b = navigator;
        g.video = document.getElementById(a);
        var e = !0;
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)
          try {
            navigator.mediaDevices.enumerateDevices().then(function (a) {
              a.forEach(function (a) {
                console.log("deb1");
                "videoinput" === a.kind &&
                  -1 < a.label.toLowerCase().search("back") &&
                  (e = [{ sourceId: a.deviceId }]);
                console.log(a.kind + ": " + a.label + " id = " + a.deviceId);
              });
            });
          } catch (d) {
            console.log(d);
          }
        else console.log("no navigator.mediaDevices.enumerateDevices");
        b.getUserMedia
          ? b.getUserMedia({ video: e, audio: !1 }, g.vidSuccess, g.vidError)
          : b.webkitGetUserMedia
          ? ((g.webkit = !0),
            b.webkitGetUserMedia(
              { video: e, audio: !1 },
              g.vidSuccess,
              g.vidError
            ))
          : b.mozGetUserMedia &&
            ((g.moz = !0),
            b.mozGetUserMedia(
              { video: e, audio: !1 },
              g.vidSuccess,
              g.vidError
            ));
      },
      decode: function (a) {
        if (0 == arguments.length) {
          if (g.canvas_qr2) {
            var b = g.canvas_qr2;
            var e = g.qrcontext2;
          } else
            (b = document.getElementById("qr-canvas")),
              (e = b.getContext("2d"));
          g.width = b.width;
          g.height = b.height;
          g.imagedata = e.getImageData(0, 0, g.width, g.height);
          g.result = g.process(e);
          null != g.callback && g.callback(g.result);
          return g.result;
        }
        var d = new Image();
        d.crossOrigin = "Anonymous";
        d.onload = function () {
          var a = document.getElementById("out-canvas");
          null != a &&
            ((a = a.getContext("2d")),
            a.clearRect(0, 0, 320, 240),
            a.drawImage(d, 0, 0, 320, 240));
          var a = document.createElement("canvas"),
            b = a.getContext("2d"),
            e = d.height,
            f = d.width;
          d.width * d.height > g.maxImgSize &&
            ((f = d.width / d.height),
            (e = Math.sqrt(g.maxImgSize / f)),
            (f *= e));
          a.width = f;
          a.height = e;
          b.drawImage(d, 0, 0, a.width, a.height);
          g.width = a.width;
          g.height = a.height;
          try {
            g.imagedata = b.getImageData(0, 0, a.width, a.height);
          } catch (y) {
            g.result = Error(
              "Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!"
            );
            null != g.callback && g.callback(g.result);
            return;
          }
          try {
            g.result = g.process(b);
          } catch (y) {
            console.log(y), (g.result = Error("error decoding QR Code"));
          }
          null != g.callback && g.callback(g.result);
        };
        d.onerror = function () {
          null != g.callback && g.callback(Error("Failed to load the image"));
        };
        d.src = a;
      },
      isUrl: function (a) {
        return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(
          a
        );
      },
      decode_url: function (a) {
        var b = "";
        try {
          b = escape(a);
        } catch (e) {
          console.log(e), (b = a);
        }
        a = "";
        try {
          a = decodeURIComponent(b);
        } catch (e) {
          console.log(e), (a = b);
        }
        return a;
      },
      decode_utf8: function (a) {
        return g.isUrl(a) ? g.decode_url(a) : a;
      },
      process: function (a) {
        var b = new Date().getTime(),
          e = g.grayScaleToBitmap(g.grayscale());
        if (g.debug) {
          for (var d = 0; d < g.height; d++)
            for (var c = 0; c < g.width; c++) {
              var f = 4 * c + d * g.width * 4;
              g.imagedata.data[f] = 0;
              g.imagedata.data[f + 1] = 0;
              g.imagedata.data[f + 2] = e[c + d * g.width] ? 255 : 0;
            }
          a.putImageData(g.imagedata, 0, 0);
        }
        e = new Q(e).detect();
        if (g.debug) {
          for (d = 0; d < e.bits.Height; d++)
            for (c = 0; c < e.bits.Width; c++)
              (f = 8 * c + 2 * d * g.width * 4),
                (g.imagedata.data[f] = (e.bits.get_Renamed(c, d), 0)),
                (g.imagedata.data[f + 1] = (e.bits.get_Renamed(c, d), 0)),
                (g.imagedata.data[f + 2] = e.bits.get_Renamed(c, d) ? 255 : 0);
          a.putImageData(g.imagedata, 0, 0);
        }
        f = E.decode(e.bits).DataByte;
        a = "";
        for (d = 0; d < f.length; d++)
          for (c = 0; c < f[d].length; c++) a += String.fromCharCode(f[d][c]);
        f = new Date().getTime();
        console.log(f - b);
        return g.decode_utf8(a);
      },
      getPixel: function (a, b) {
        if (g.width < a) throw "point error";
        if (g.height < b) throw "point error";
        var e = 4 * a + b * g.width * 4;
        return (
          (33 * g.imagedata.data[e] +
            34 * g.imagedata.data[e + 1] +
            33 * g.imagedata.data[e + 2]) /
          100
        );
      },
      binarize: function (a) {
        for (var b = Array(g.width * g.height), e = 0; e < g.height; e++)
          for (var d = 0; d < g.width; d++) {
            var c = g.getPixel(d, e);
            b[d + e * g.width] = c <= a ? !0 : !1;
          }
        return b;
      },
      getMiddleBrightnessPerArea: function (a) {
        for (
          var b = Math.floor(g.width / 4),
            e = Math.floor(g.height / 4),
            d = Array(4),
            c = 0;
          4 > c;
          c++
        ) {
          d[c] = Array(4);
          for (var f = 0; 4 > f; f++) d[c][f] = [0, 0];
        }
        for (c = 0; 4 > c; c++)
          for (f = 0; 4 > f; f++) {
            d[f][c][0] = 255;
            for (var h = 0; h < e; h++)
              for (var m = 0; m < b; m++) {
                var k = a[b * f + m + (e * c + h) * g.width];
                k < d[f][c][0] && (d[f][c][0] = k);
                k > d[f][c][1] && (d[f][c][1] = k);
              }
          }
        a = Array(4);
        for (b = 0; 4 > b; b++) a[b] = Array(4);
        for (c = 0; 4 > c; c++)
          for (f = 0; 4 > f; f++)
            a[f][c] = Math.floor((d[f][c][0] + d[f][c][1]) / 2);
        return a;
      },
      grayScaleToBitmap: function (a) {
        for (
          var b = g.getMiddleBrightnessPerArea(a),
            e = b.length,
            d = Math.floor(g.width / e),
            c = Math.floor(g.height / e),
            f = new ArrayBuffer(g.width * g.height),
            f = new Uint8Array(f),
            h = 0;
          h < e;
          h++
        )
          for (var m = 0; m < e; m++)
            for (var k = 0; k < c; k++)
              for (var n = 0; n < d; n++)
                f[d * m + n + (c * h + k) * g.width] =
                  a[d * m + n + (c * h + k) * g.width] < b[m][h] ? !0 : !1;
        return f;
      },
      grayscale: function () {
        for (
          var a = new ArrayBuffer(g.width * g.height),
            a = new Uint8Array(a),
            b = 0;
          b < g.height;
          b++
        )
          for (var e = 0; e < g.width; e++) {
            var d = g.getPixel(e, b);
            a[e + b * g.width] = d;
          }
        return a;
      },
    },
    L = 3,
    W = 57,
    D = 8,
    K = 2;
  g.orderBestPatterns = function (a) {
    function b(a, b) {
      var c = a.X - b.X,
        d = a.Y - b.Y;
      return Math.sqrt(c * c + d * d);
    }
    var e = b(a[0], a[1]),
      d = b(a[1], a[2]),
      c = b(a[0], a[2]);
    d >= e && d >= c
      ? ((d = a[0]), (e = a[1]), (c = a[2]))
      : c >= d && c >= e
      ? ((d = a[1]), (e = a[0]), (c = a[2]))
      : ((d = a[2]), (e = a[0]), (c = a[1]));
    if (
      0 >
      (function (a, b, c) {
        var d = b.x;
        b = b.y;
        return (c.x - d) * (a.y - b) - (c.y - b) * (a.x - d);
      })(e, d, c)
    )
      var f = e,
        e = c,
        c = f;
    a[0] = e;
    a[1] = d;
    a[2] = c;
  };
  return g;
})();
