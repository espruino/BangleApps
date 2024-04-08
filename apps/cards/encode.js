//import { BINARIES } from './constants';

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