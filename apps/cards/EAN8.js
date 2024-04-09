// Encoding documentation:
// http://www.barcodeisland.com/ean8.phtml

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
