/**
 * Maps the Espruino datetime format to min and max character lengths.
 * Used when determining if a format can produce outputs that are too short or long.
 */
const datetime_length_map = {
	// %A, %a, %B, %b vary depending on the locale, so they are calculated later
	"%Y": [4, 4],
	"%y": [2, 2],
	"%m": [2, 2],
	"%-m": [1, 2],
	"%d": [2, 2],
	"%-d": [1, 2],
	"%HH": [2, 2],
	"%MM": [2, 2],
	"%SS": [2, 2],
};

/**
 * Takes an Espruino datetime format string and returns the minumum and maximum possible length of characters that the format could use.
 *
 * @param {string} datetimeEspruino - The datetime Espruino format
 * @returns first the minimum possible length, second the maximum possible length.
 */
function getLengthOfDatetimeFormat(name, datetimeEspruino, locale, errors) {

	// Generate the length_map based on the actual names in the locale
	const length_map = {...datetime_length_map};
	for(const [symbol, values] of [
		["%A", locale.day],
		["%a", locale.abday],
		["%B", locale.month],
		["%b", locale.abmonth],
	]){
		const length = [Infinity, 0];
		for(const value of values.split(",")){
			if(length[0] > value.length) length[0] = value.length;
			if(length[1] < value.length) length[1] = value.length;
		}
		length_map[symbol] = length;
	}

	// Find the length of the output
	let formatLength = [0, 0];
	let i = 0;
	while (i < datetimeEspruino.length) {
		if (datetimeEspruino[i] === "%") {
			let match;
			for(const symbolLength of [2, 3]){
				const length = length_map[datetimeEspruino.substring(i, i+symbolLength)];
				if(length){
					match = {
						length,
						symbolLength,
					}
				}
			}
			if(match){
				formatLength[0] += match.length[0];
				formatLength[1] += match.length[1];
				i += match.symbolLength;
			}else{
				errors.push({name, value: datetimeEspruino, lang: locale.lang, error: `uses an unsupported format symbol: ${datetimeEspruino.substring(i, i+3)}`});
				formatLength[0]++;
				formatLength[1]++;
				i++;
			}
		} else {
			formatLength[0]++;
			formatLength[1]++;
			i++;
		}
	}
	return formatLength;
}

/**
 * Checks that a locale conforms to some basic standards.
 *
 * @param {object} locale - The locale to test.
 * @param {object} meta - Meta information that is needed to check if locales are supported.
 * @param {object} meta.speedUnits - The table of speed units.
 * @param {object} meta.distanceUnits - The table of distance units.
 * @param {object} meta.codePages - Custom codepoint mappings.
 * @param {object} meta.CODEPAGE_CONVERSIONS - The table of custom codepoint conversions.
 * @returns an object with an array of errors and warnings.
 */
function checkLocale(locale, {speedUnits, distanceUnits, codePages, CODEPAGE_CONVERSIONS}){
	const errors = [];
	const warnings = [];

	const speeds = Object.keys(speedUnits);
	const distances = Object.keys(distanceUnits);

	checkLength("lang", locale.lang, 4, undefined);
	checkLength("decimal point", locale.decimal_point, 1, 1);
	checkLength("thousands separator", locale.thousands_sep, 1, 1);
	checkLength("speed", locale.speed, 2, 4);
	checkIsIn("speed", locale.speed, "speedUnits", speeds);
	checkLength("distance", locale.distance["0"], 1, 3);
	checkLength("distance", locale.distance["1"], 1, 3);
	checkIsIn("distance", locale.distance["0"], "distanceUnits", distances);
	checkIsIn("distance", locale.distance["1"], "distanceUnits", distances);
	checkLength("temperature", locale.temperature, 1, 2);
	checkLength("meridian", locale.ampm["0"], 1, 3);
	checkLength("meridian", locale.ampm["1"], 1, 3);
	warnIfNot("long time format", locale.timePattern["0"], "%HH:%MM:%SS");
	warnIfNot("short time format", locale.timePattern["1"], "%HH:%MM");
	checkFormatLength("long time", locale.timePattern["0"], 8, 8);
	checkFormatLength("short time", locale.timePattern["1"], 5, 5);
	checkFormatLength("long date", locale.datePattern["0"], 6, 14);
	checkFormatLength("short date", locale.datePattern["1"], 6, 11);
	checkArrayLength("short months", locale.abmonth.split(","), 12, 12);
	checkArrayLength("long months", locale.month.split(","), 12, 12);
	checkArrayLength("short days", locale.abday.split(","), 7, 7);
	checkArrayLength("long days", locale.day.split(","), 7, 7);
	for (const abmonth of locale.abmonth.split(",")) {
		checkLength("short month", abmonth, 2, 4);
	}
	for (const month of locale.month.split(",")) {
		checkLength("month", month, 3, 11);
	}
	for (const abday of locale.abday.split(",")) {
		checkLength("short day", abday, 2, 4);
	}
	for (const day of locale.day.split(",")) {
		checkLength("day", day, 3, 13);
	}
	checkEncoding(locale);

	function checkLength(name, value, min, max) {
		if(typeof value !== "string"){
			errors.push({name, value, lang: locale.lang, error: `must be defined and must be a string`});
			return;
		}
		if (min && value.length < min) {
			errors.push({name, value, lang: locale.lang, error: `must be longer than ${min-1} characters`});
		}
		if (max && value.length > max) {
			errors.push({name, value, lang: locale.lang, error: `must be shorter than ${max+1} characters`});
		}
	}
	function checkArrayLength(name, value, min, max){
		if(!Array.isArray(value)){
			errors.push({name, value, lang: locale.lang, error: `must be defined and must be an array`});
			return;
		}
		if (min && value.length < min) {
			errors.push({name, value, lang: locale.lang, error: `array must be longer than ${min-1} entries`});
		}
		if (max && value.length > max) {
			errors.push({name, value, lang: locale.lang, error: `array must be shorter than ${max+1} entries`});
		}
	}
	function checkFormatLength(name, value, min, max) {
		const length = getLengthOfDatetimeFormat(name, value, locale, errors);
		if (min && length[0] < min) {
			errors.push({name, value, lang: locale.lang, error: `output must be longer than ${min-1} characters`});
		}
		if (max && length[1] > max) {
			errors.push({name, value, lang: locale.lang, error: `output must be shorter than ${max+1} characters`});
		}
	}
	function checkIsIn(name, value, listName, list) {
		if (!list.includes(value)) {
			errors.push({name, value, lang: locale.lang, error: `must be included in the ${listName} map`});
		}
	}
	function warnIfNot(name, value, expected) {
		if (value !== expected) {
			warnings.push({name, value, lang: locale.lang, error: `might not work in some apps if it is not "${expected}"`});
		}
	}
	function checkEncoding(object) {
		if(!object){
			return;
		}else if(typeof object === "string"){
			for(const char of object){
				const charCode = char.charCodeAt();
				if (charCode >= 32 && charCode < 128) {
					// ASCII - fully supported
					continue;
				} else if (codePages["ISO8859-1"].map.indexOf(char) >= 0) {
					// At upload time, the char can be converted to a custom codepage
					continue;
				} else if (CODEPAGE_CONVERSIONS[char]) {
					// At upload time, the char can be converted to a similar supported char
					continue;
				}
				errors.push({name: `character ${char}`, value: char, lang: locale.lang, error: `is not supported by BangleJS`});
			}
		}else{
			for(const [key, value] of Object.entries(object)){
				if(key === "icon") continue;
				checkEncoding(value);
			}
		}
	}

	return {errors, warnings};
}

/**
 * Checks that an array of locales conform to some basic standards.
 *
 * @param {object[]} locales - The locales to test.
 * @param {object} meta.speedUnits - The table of speed units.
 * @param {object} meta.distanceUnits - The table of distance units.
 * @param {object} meta.codePages - Custom codepoint mappings.
 * @param {object} meta.CODEPAGE_CONVERSIONS - The table of custom codepoint conversions.
 * @returns an object with an array of errors and warnings.
 */
function checkLocales(locales, meta){
	let errors = [];
	let warnings = [];

	for(const locale of Object.values(locales)){
		const result = checkLocale(locale, meta);
		errors = [...errors, ...result.errors];
		warnings = [...warnings, ...result.warnings];
	}

	return {errors, warnings};
}

if(typeof module !== "undefined"){
	module.exports = {
		checkLocale,
		checkLocales,
	};
}else{
	globalThis.checkLocale = checkLocale;
	globalThis.checkLocales = checkLocales;
}
