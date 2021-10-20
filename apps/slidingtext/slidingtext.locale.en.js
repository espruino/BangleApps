var DateFormatter = require("slidingtext.dtfmt.js");
const hoursToText = require("slidingtext.utils.en.js").hoursToText;
const numberToText = require("slidingtext.utils.en.js").numberToText;

class EnglishDateFormatter extends DateFormatter {
    constructor() { super();}
    name(){return "English";}
    formatDate(date){
        var hours_txt = hoursToText(date.getHours());
        var mins_txt = numberToText(date.getMinutes());
        return [hours_txt,mins_txt[0],mins_txt[1]];
    }
}

module.exports = EnglishDateFormatter;