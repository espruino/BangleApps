var DateFormatter = require("slidingtext.dtfmt.js");
const hoursToText = require("slidingtext.utils.en.js").hoursToText;
const numberToText = require("slidingtext.utils.en.js").numberToText;

class EnglishTraditionalDateFormatter extends DateFormatter {
    constructor() {
        super();
    }
    name(){return "English (Traditional)";}
    formatDate(date){
        var mins = date.getMinutes();
        var hourOfDay = date.getHours();
        if(mins > 30){
            hourOfDay += 1;
        }
        var hours = hoursToText(hourOfDay);
        // Deal with the special times first
        if(mins == 0){
            return [hours,"", "O'","CLOCK"];
        } else if(mins == 30){
            return ["","HALF", "PAST", "", hours];
        } else if(mins == 15){
            return ["","QUARTER", "PAST", "", hours];
        } else if(mins == 45) {
            return ["", "QUARTER", "TO", "", hours];
        }
        var mins_txt;
        var from_to;
        var mins_value;
        if(mins > 30){
            mins_value = 60-mins;
            from_to = "TO";
            mins_txt = numberToText(mins_value);
        } else {
            mins_value = mins;
            from_to = "PAST";
            mins_txt = numberToText(mins_value);
        }
        if(mins_txt[1] != '') {
            return ['', mins_txt[0], mins_txt[1], from_to, hours];
        } else {
            if(mins_value % 5 == 0) {
                return ['', mins_txt[0], from_to, '', hours];
            } else if(mins_value == 1){
                return ['', mins_txt[0], 'MINUTE', from_to, hours];
            } else {
                return ['', mins_txt[0], 'MINUTES', from_to, hours];
            }
        }
    }
}

module.exports = EnglishTraditionalDateFormatter;