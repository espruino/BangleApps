const constants = require("cards.constants.js");

const encode = require("cards.encode.js");
const Barcode = require("cards.Barcode.js");

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
			constants.SIDE_BIN,
			this.leftEncode(),
			constants.MIDDLE_BIN,
			this.rightEncode(),
			constants.SIDE_BIN
		];

		return {
			data: data.join(''),
			text: this.text
		};
	}

}

module.exports = EAN;