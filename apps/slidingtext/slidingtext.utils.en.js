const numberStr = ["ZERO","ONE", "TWO", "THREE", "FOUR", "FIVE",
    "SIX", "SEVEN","EIGHT", "NINE", "TEN",
    "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN",
    "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN",
    "NINETEEN", "TWENTY"];
const tensStr = ["ZERO", "TEN", "TWENTY", "THIRTY", "FORTY", "FIFTY"];
const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const monthStr = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JULY",
    "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
]

const dateNumberStr = ["ZEROTH", "FIRST", "SECOND", "THIRD", "FORTH", "FIFTH",
    "SIXTH","SEVENTH","EIGHTH","NINTH","TENTH","ELEVENTH","TWELFTH","THIRTEENTH",
    "FOURTEENTH", "FIFTEENTH", "SIXTEENTH", "SEVENTEENTH", "EIGHTEENTH", "NINETEENTH",
    "TWENTIETH"
]

const dayOfWeek = (date) => dayNames[date.getDay()];
const dayOfWeekShort = (date) => dayNames[date.getDay()].substring(0,3);
const monthToText = (date)=>monthStr[date.getMonth()-1];

const hoursToText = (hours)=>{
    hours = hours % 12;
    if(hours === 0){
        hours = 12;
    }
    return numberStr[hours];
}

const numberToText = (value)=> {
    var word1 = '';
    var word2 = '';
    if(value > 20){
        const tens = (value / 10 | 0);
        word1 = tensStr[tens];
        const remainder = value - tens * 10;
        if(remainder > 0){
            word2 = numberStr[remainder];
        }
    } else if(value > 0) {
        word1 = numberStr[value];
    }
    return [word1,word2];
}

const numberToDayNumberText = (value) => {
    var word1 = '';
    var word2 = '';
    if(value === 30) {
        word1 = "THIRTIETH";
    } else if(value > 20){
        const tens = (value / 10 | 0);
        word1 = tensStr[tens];
        const remainder = value - tens * 10;
        if(remainder > 0){
            word2 = dateNumberStr[remainder];
        }
    } else if(value > 0) {
        word1 = dateNumberStr[value];
    }
    return [word1,word2];
}

exports.monthToText = monthToText;
exports.hoursToText = hoursToText;
exports.numberToText = numberToText;
exports.numberToDayNumberText = numberToDayNumberText;
exports.dayOfWeek = dayOfWeek;
exports.dayOfWeekShort = dayOfWeekShort;