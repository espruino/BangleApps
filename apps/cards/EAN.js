/*
 * JS source adapted from https://github.com/lindell/JsBarcode
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Johan Lindell (johan@lindell.me)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

const encode = require("cards.encode.js");
const Barcode = require("cards.Barcode.js");

// Standard start end and middle bits
const SIDE_BIN = '101';
const MIDDLE_BIN = '01010';

// Base class for EAN8 & EAN13
class EAN extends Barcode {
	constructor(data, options) {
		super(data, options);
	}

	leftText(from, to) {
		return this.text.substr(from, to);
	}

	leftEncode(data, structure) {
		return encode(data, structure);
	}

	rightText(from, to) {
		return this.text.substr(from, to);
	}

	rightEncode(data, structure) {
		return encode(data, structure);
	}

	encode() {
		const data = [
			SIDE_BIN,
			this.leftEncode(),
			MIDDLE_BIN,
			this.rightEncode(),
			SIDE_BIN
		];

		return {
			data: data.join(''),
			text: this.text
		};
	}

}

module.exports = EAN;