// Encoding documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#Encoding

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
