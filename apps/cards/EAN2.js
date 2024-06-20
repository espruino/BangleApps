// Encoding documentation:
// https://en.wikipedia.org/wiki/EAN_2#Encoding
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

const constants = require("cards.constants.js");
const encode = require("cards.encode.js");
const Barcode = require("cards.Barcode.js");

class EAN2 extends Barcode {

	constructor(data, options) {
		super(data, options);
	}

	valid() {
		return /^[0-9][0-9]$/.test(this.data);
	}

	encode(){
		// Choose the structure based on the number mod 4
		const structure = constants.EAN2_STRUCTURE[parseInt(this.data) % 4];
		return {
			// Start bits + Encode the two digits with 01 in between
			data: '1011' + encode(this.data, structure, '01'),
			text: this.text
		};
	}

}

module.exports = EAN2;
