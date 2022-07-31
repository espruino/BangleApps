var DateFormatter = require("slidingtext.dtfmt.js");
const hoursToText = require("slidingtext.utils.en.js").hoursToText;
const numberToText = require("slidingtext.utils.en.js").numberToText;
const monthToText = require("slidingtext.utils.en.js").monthToText;

class EnglishDateFormatter extends DateFormatter {
    constructor() {
        super();
        this.row_props =[
            {major_minor: 'major', info_type: 'time'},
            {major_minor: 'minor', info_type: 'time'},
            {major_minor: 'minor', info_type: 'time'},
            {major_minor: 'minor', info_type: 'date'},
        ];
    }
    name(){return "English";}
    shortName(){return "en"}
    formatDate(date){
        var hours_txt = hoursToText(date.getHours());
        var mins_txt = numberToText(date.getMinutes());
        var date_txt = monthToText(date.getMonth() + 1) + ' ' + numberToText(date.getDate());
        return [hours_txt,mins_txt[0],mins_txt[1],date_txt];
    }
    rowProperties(row_no) {
        return this.row_props[row_no];
    }


}

module.exports = EnglishDateFormatter;