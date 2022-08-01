var DateFormatter = require("slidingtext.dtfmt.js");
const hoursToText = require("slidingtext.utils.en.js").hoursToText;
const numberToText = require("slidingtext.utils.en.js").numberToText;
const monthToText = require("slidingtext.utils.en.js").monthToText;

class EnglishDateFormatter extends DateFormatter {
    constructor() {
        super();
        this.row_props = [
            {major_minor: 'major', info_type: 'time'},
            {major_minor: 'minor', info_type: 'time'},
            {major_minor: 'minor', info_type: 'time'},
            {major_minor: 'minor', info_type: 'date'},
        ];
        this.format_props = {
            default_style: {
                time_slide: 'in_right_out_right',
                time_speed: 'slow',
                date_speed: 'superslow',
                date_placing: 'left.up',
                date_text_size: 'vsmall'
            }
        }
    }
    name(){return "English";}
    shortName(){return "en3"}
    formatDate(date){
        var hours_txt = hoursToText(date.getHours());
        var mins_txt = numberToText(date.getMinutes());
        var date_txt = monthToText(date.getMonth()) + ' ' + numberToText(date.getDate());
        return [hours_txt,mins_txt[0],mins_txt[1],date_txt];
    }
    rowProperties(row_no) {
        return this.row_props[row_no];
    }
    formatProperties(){
        return this.format_props;
    }
}

module.exports = EnglishDateFormatter;