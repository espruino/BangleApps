/**
 * Formats a number string with common prefixes like K, M, B, T.
 * For negative numbers, it returns "Negative".
 * For numbers between 0 and 1, it rounds up to two decimal places.
 *
 * @param {string} input - The input string containing numerals.
 * @returns {string} The formatted string.
 */
exports.formatPriceString = function(input) {
    // Ensure input is a number
    let number = typeof input === 'string' ? parseFloat(input) : input;

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

exports.myLog10 = function(value) {
    return Math.log(value) / Math.LN10;
}

exports.calculateOptimalYAxisSpacing = function(data) {
    // Check if data is empty
    if (data.length === 0) {
        return { min: 0, max: 1, interval: 1 };
    }

    // Find the minimum and maximum values in the data
    const bounds = exports.findMinMax(data);
    let minY = bounds.min;
    let maxY = bounds.max;

    // Calculate the range of the data
    let range = maxY - minY;

    // If all values are the same, set a small range to avoid division by zero
    if (range === 0) {
        range = 1;
    }

    // Determine the number of ticks (e.g., 5 to 10 ticks)
    let numTicks = 7; // You can adjust this value based on your preference

    // Calculate the interval
    let interval = range / (numTicks - 1);

    // Round the interval to a nice number (e.g., 1, 2, 5, 10)
    let roundedInterval = Math.pow(10, Math.floor(exports.myLog10(interval)));
    if (interval / roundedInterval > 5) {
        roundedInterval *= 5;
    } else if (interval / roundedInterval > 2) {
        roundedInterval *= 2;
    }

    // Adjust min and max to ensure they are on the rounded interval
    let adjustedMin = Math.floor(minY / roundedInterval) * roundedInterval;
    let adjustedMax = Math.ceil(maxY / roundedInterval) * roundedInterval;

    let first = data[0];
    let last = data[data.length - 1];
    return {
        min: adjustedMin,
        max: adjustedMax,
        interval: roundedInterval,
        first: first,
        last: last,
        rawMin: minY,
        rawMax: maxY
    };
}


