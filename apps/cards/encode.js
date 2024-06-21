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

const BINARIES = {
	'L': [ // The L (left) type of encoding
		'0001101', '0011001', '0010011', '0111101', '0100011',
		'0110001', '0101111', '0111011', '0110111', '0001011'
	],
		'G': [ // The G type of encoding
		'0100111', '0110011', '0011011', '0100001', '0011101',
		'0111001', '0000101', '0010001', '0001001', '0010111'
	],
		'R': [ // The R (right) type of encoding
		'1110010', '1100110', '1101100', '1000010', '1011100',
		'1001110', '1010000', '1000100', '1001000', '1110100'
	],
		'O': [ // The O (odd) encoding for UPC-E
		'0001101', '0011001', '0010011', '0111101', '0100011',
		'0110001', '0101111', '0111011', '0110111', '0001011'
	],
		'E': [ // The E (even) encoding for UPC-E
		'0100111', '0110011', '0011011', '0100001', '0011101',
		'0111001', '0000101', '0010001', '0001001', '0010111'
	]
};

// Encode data string
const encode = (data, structure, separator) => {
	let encoded = data
		.split('')
		.map((val, idx) => BINARIES[structure[idx]])
		.map((val, idx) => val ? val[data[idx]] : '');

	if (separator) {
		const last = data.length - 1;
		encoded = encoded.map((val, idx) => (
			idx < last ? val + separator : val
		));
	}

	return encoded.join('');
};

module.exports = encode;