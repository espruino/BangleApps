// Encoding documentation:
// https://en.wikipedia.org/wiki/EAN_2#Encoding

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
