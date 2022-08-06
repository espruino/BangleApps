var DateFormatter = require("slidingtext.dtfmt.js");
const hoursToText = require("slidingtext.utils.en.js").hoursToText;
const numberToText = require("slidingtext.utils.en.js").numberToText;

class EnglishDateFormatter extends DateFormatter {
    constructor() {
        super();
        this.row_props = [
            {major_minor: 'major', info_type: 'time'},
            {major_minor: 'minor', info_type: 'time'},
            {major_minor: 'minor', info_type: 'time'}
        ];
        this.format_props = {
            default_style: {
                y_init: 'q1',
            }
        }
    }
    name(){return "English";}
    shortName(){return "en"}
    formatDate(date){
        var hours_txt = hoursToText(date.getHours());
        var mins_txt = numberToText(date.getMinutes());
        return [hours_txt,mins_txt[0],mins_txt[1]];
    }
    rowProperties(row_no) {
        return this.row_props[row_no];
    }
    formatProperties(){
        return this.format_props;
    }
}

module.exports = EnglishDateFormatter;