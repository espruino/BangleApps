// Encoding documentation:
// http://www.barcodeisland.com/ean8.phtml
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

// Calculate the checksum digit
const checksum = (number) => {
	const res = number
		.substr(0, 7)
		.split('')
		.map((n) => +n)
		.reduce((sum, a, idx) => (
			idx % 2 ? sum + a : sum + a * 3
		), 0);

	return (10 - (res % 10)) % 10;
};

class EAN8 extends EAN {

	constructor(data, options) {
		// Add checksum if it does not exist
		if (/^[0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/.test(data)) {
			data += checksum(data);
		}

		super(data, options);
	}

	valid() {
		return (
			/^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/.test(this.data) &&
			+this.data[7] === checksum(this.data)
		);
	}

	leftText() {
		return super.leftText(0, 4);
	}

	leftEncode() {
		const data = this.data.substr(0, 4);
		return super.leftEncode(data, 'LLLL');
	}

	rightText() {
		return super.rightText(4, 4);
	}

	rightEncode() {
		const data = this.data.substr(4, 4);
		return super.rightEncode(data, 'RRRR');
	}

}

module.exports = EAN8;
