const numberStr = ["ZERO","ONE", "TWO", "THREE", "FOUR", "FIVE",
    "SIX", "SEVEN","EIGHT", "NINE", "TEN",
    "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN",
    "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN",
    "NINETEEN", "TWENTY"];
const tensStr = ["ZERO", "TEN", "TWENTY", "THIRTY", "FOURTY",
    "FIFTY"];

const hoursToText = (hours)=>{
    hours = hours % 12;
    if(hours == 0){
        hours = 12;
    }
    return numberStr[hours];
}

const numberToText = (value)=> {
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

exports.hoursToText = hoursToText;
exports.numberToText = numberToText;