// Encoding documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#Encoding
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

class UPC extends Barcode{
	constructor(data, options){
		// Add checksum if it does not exist
		if(/^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/.test(data)){
			data += checksum(data);
		}

		super(data, options);
	}

	valid(){
		return /^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/.test(this.data) &&
			this.data[11] == checksum(this.data);
	}

	encode(){
		var result = "";

		result += "101";
		result += encode(this.data.substr(0, 6), "LLLLLL");
		result += "01010";
		result += encode(this.data.substr(6, 6), "RRRRRR");
		result += "101";

		return {
			data: result,
			text: this.text
		};
	}
}

// Calulate the checksum digit
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Calculation_of_checksum_digit
function checksum(number){
	var result = 0;

	var i;
	for(i = 1; i < 11; i += 2){
		result += parseInt(number[i]);
	}
	for(i = 0; i < 11; i += 2){
		result += parseInt(number[i]) * 3;
	}

	return (10 - (result % 10)) % 10;
}

module.exports = { UPC, checksum };
