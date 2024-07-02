// Encoding documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#Encoding
//
// UPC-E documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#UPC-E
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
const upc = require("cards.UPC.js");

const EXPANSIONS = [
	"XX00000XXX",
	"XX10000XXX",
	"XX20000XXX",
	"XXX00000XX",
	"XXXX00000X",
	"XXXXX00005",
	"XXXXX00006",
	"XXXXX00007",
	"XXXXX00008",
	"XXXXX00009"
];

const PARITIES = [
	["EEEOOO", "OOOEEE"],
	["EEOEOO", "OOEOEE"],
	["EEOOEO", "OOEEOE"],
	["EEOOOE", "OOEEEO"],
	["EOEEOO", "OEOOEE"],
	["EOOEEO", "OEEOOE"],
	["EOOOEE", "OEEEOO"],
	["EOEOEO", "OEOEOE"],
	["EOEOOE", "OEOEEO"],
	["EOOEOE", "OEEOEO"]
];

class UPCE extends Barcode{
	constructor(data, options){
		// Code may be 6 or 8 digits;
		// A 7 digit code is ambiguous as to whether the extra digit
		// is a UPC-A check or number system digit.
		super(data, options);
		this.isValid = false;
		if(/^[0-9][0-9][0-9][0-9][0-9][0-9]$/.test(data)){
			this.middleDigits = data;
			this.upcA = expandToUPCA(data, "0");
			this.text = options.text ||
				`${this.upcA[0]}${data}${this.upcA[this.upcA.length - 1]}`;
			this.isValid = true;
		}
		else if(/^[01][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/.test(data)){
			this.middleDigits = data.substring(1, data.length - 1);
			this.upcA = expandToUPCA(this.middleDigits, data[0]);

			if(this.upcA[this.upcA.length - 1] === data[data.length - 1]){
				this.isValid = true;
			}
			else{
				// checksum mismatch
				return;
			}
		}
	}

	valid(){
		return this.isValid;
	}

	encode(){
		var result = "";

		result += "101";
		result += this.encodeMiddleDigits();
		result += "010101";

		return {
			data: result,
			text: this.text
		};
	}

	encodeMiddleDigits() {
		const numberSystem = this.upcA[0];
		const checkDigit = this.upcA[this.upcA.length - 1];
		const parity = PARITIES[parseInt(checkDigit)][parseInt(numberSystem)];
		return encode(this.middleDigits, parity);
	}
}

function expandToUPCA(middleDigits, numberSystem) {
	const lastUpcE = parseInt(middleDigits[middleDigits.length - 1]);
	const expansion = EXPANSIONS[lastUpcE];

	let result = "";
	let digitIndex = 0;
	for(let i = 0; i < expansion.length; i++) {
		let c = expansion[i];
		if (c === 'X') {
			result += middleDigits[digitIndex++];
		} else {
			result += c;
		}
	}

	result = `${numberSystem}${result}`;
	return `${result}${upc.checksum(result)}`;
}

module.exports = UPCE;