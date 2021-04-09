var DateFormatter = require("slidingtext.dtfmt.js");

const numberStr = ["ZERO","ONE", "TWO", "THREE", "FOUR", "FIVE",
    "SIX", "SEVEN","EIGHT", "NINE", "TEN",
    "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN",
    "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN",
    "NINETEEN", "TWENTY"];
const tensStr = ["ZERO", "TEN", "TWENTY", "THIRTY", "FOURTY",
    "FIFTY"];

function hoursToText(hours){
    hours = hours % 12;
    if(hours == 0){
        hours = 12;
    }
    return numberStr[hours];
}

function numberToText(value){
    var word1 = '';
    var word2 = '';
    if(value > 20){
        var tens = (value / 10 | 0);
        word1 = tensStr[tens];
        var remainder = value - tens * 10;
        if(remainder > 0){
            word2 = numberStr[remainder];
        }
    } else if(value > 0) {
        word1 = numberStr[value];
    }
    return [word1,word2];
}

class EnglishTraditionalDateFormatter extends DateFormatter {
    constructor() {
        super();
    }
    name(){return "English Traditional";}
    formatDate(date){
        var hours = hoursToText(date.getHours());
        var mins = date.getMinutes();
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
        if(mins > 30){
            from_to = "TO";
            mins_txt = numberToText(60-mins);
        } else {
            from_to = "PAST";
            mins_txt = numberToText(mins);
        }
        if(mins_txt[1] != '') {
            return ['', mins_txt[0], mins_txt[1], from_to, hours];
        } else {
            return ['', mins_txt[0], from_to, '', hours];
        }
    }
}

module.exports = EnglishTraditionalDateFormatter;