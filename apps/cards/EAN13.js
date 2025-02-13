// Encoding documentation:
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Binary_encoding_of_data_digits_into_EAN-13_barcode
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

const EAN = require("cards.EAN.js");

const EAN13_STRUCTURE = [
	'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
	'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
];

// Calculate the checksum digit
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Calculation_of_checksum_digit
const checksum = (number) => {
	const res = number
		.substr(0, 12)
		.split('')
		.map((n) => +n)
		.reduce((sum, a, idx) => (
			idx % 2 ? sum + a * 3 : sum + a
		), 0);

	return (10 - (res % 10)) % 10;
};

class EAN13 extends EAN {

	constructor(data, options) {
		// Add checksum if it does not exist
		if (/^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/.test(data)) {
			data += checksum(data);
		}

		super(data, options);

		// Adds a last character to the end of the barcode
		this.lastChar = options.lastChar;
	}

	valid() {
		return (
			/^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/.test(this.data) &&
			+this.data[12] === checksum(this.data)
		);
	}

	leftText() {
		return super.leftText(1, 6);
	}

	leftEncode() {
		const data = this.data.substr(1, 6);
		const structure = EAN13_STRUCTURE[this.data[0]];
		return super.leftEncode(data, structure);
	}

	rightText() {
		return super.rightText(7, 6);
	}

	rightEncode() {
		const data = this.data.substr(7, 6);
		return super.rightEncode(data, 'RRRRRR');
	}

}

module.exports = EAN13;