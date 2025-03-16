/**
 * Formats a number string with common prefixes like K, M, B, T.
 * For negative numbers, it returns "Negative".
 * For numbers between 0 and 1, it rounds up to two decimal places.
 *
 * @param {string} input - The input string containing numerals.
 * @returns {string} The formatted string.
 */
exports.formatPriceString = function(input) {
    // Convert input to a number
    let number = parseFloat(input);

    // Check if input is not a number
    if (isNaN(number)) {
        return 'Invalid input';
    }

    // Handle negative numbers
    if (number < 0) {
        return 'Negative';
    }

    // Handle zero
    if (number === 0) {
        return 'Zero';
    }

    // Handle numbers between 0 and 1
    if (number < 1) {
        return Math.ceil(number * 100) / 100;
    }

    // Define suffixes
    const suffixes = ['', 'K', 'M', 'B', 'T'];

    // Determine the suffix index
    let suffixIndex = 0;
    while (number >= 1000 && suffixIndex < suffixes.length - 1) {
        number /= 1000;
        suffixIndex++;
    }

    // Format the number with three decimal places after the comma
    const formattedNumber = number.toFixed(3) + suffixes[suffixIndex];

    return formattedNumber;
}

exports.findMinMax = function(values) {
    var min = values[0];
    var max = values[0];

    for (var i = 1; i < values.length; i++) {
        if (values[i] < min) min = values[i];
        if (values[i] > max) max = values[i];
    }

    return { min: min, max: max };
}

