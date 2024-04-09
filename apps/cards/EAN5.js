// Encoding documentation:
// https://en.wikipedia.org/wiki/EAN_5#Encoding

const constants = require("cards.constants.js");
const encode = require("cards.encode.js");
const Barcode = require("cards.Barcode.js");

const checksum = (data) => {
	const result = data
		.split('')
		.map(n => +n)
		.reduce((sum, a, idx) => {
			return idx % 2
				? sum + a * 9
				: sum + a * 3;
		}, 0);
	return result % 10;
};

class EAN5 extends Barcode {

	constructor(data, options) {
		super(data, options);
	}

	valid() {
		return /^[0-9][0-9][0-9][0-9][0-9]$/.test(this.data);
	}

	encode() {
		const structure = constants.EAN5_STRUCTURE[checksum(this.data)];
		return {
			data: '1011' + encode(this.data, structure, '01'),
			text: this.text
		};
	}

}

module.exports = EAN5;
