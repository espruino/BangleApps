// Encoding documentation:
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Binary_encoding_of_data_digits_into_EAN-13_barcode

import { EAN13_STRUCTURE } from './constants';

const EAN = require("cards.EAN.js");


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
		if (data.search(/^[0-9]{12}$/) !== -1) {
			data += checksum(data);
		}

		super(data, options);

		// Adds a last character to the end of the barcode
		this.lastChar = options.lastChar;
	}

	valid() {
		return (
			this.data.search(/^[0-9]{13}$/) !== -1 &&
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