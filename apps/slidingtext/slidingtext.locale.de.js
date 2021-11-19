var DateFormatter = require("slidingtext.dtfmt.js");

const germanNumberStr = [ ["NULL",""], // 0
    ["EINS",""], // 1
    ["ZWEI",""], //2
    ["DREI",''], //3
    ["VIER",''], //4
    ["FÜNF",''], //5
    ["SECHS",''], //6
    ["SIEBEN",''], //7
    ["ACHT",''], //8
    ["NEUN",''], // 9,
    ["ZEHN",''], // 10
    ["ELF",''], // 11,
    ["ZWÖLF",''], // 12
    ["DREI",'ZEHN'], // 13
    ["VIER",'ZEHN'], // 14
    ["FÜNF",'ZEHN'], // 15
    ["SECH",'ZEHN'], // 16
    ["SIEB",'ZEHN'], // 17
    ["ACHT",'ZEHN'], // 18
    ["NEUN",'ZEHN'], // 19
];

const germanTensStr = ["NULL",//0
    "ZEHN",//10
    "ZWANZIG",//20
    "DREIßIG",//30
    "VIERZIG",//40
    "FÜNFZIG",//50
    "SECHZIG"//60
]

const germanUnit = ["",//0
    "EINUND",//1
    "ZWEIUND",//2
    "DREIUND",//3
    "VIERUND", //4
    "FÜNFUND", //5
    "SECHSUND", //6
    "SIEBENUND", //7
    "ACHTUND", //8
    "NEUNUND" //9
]

function germanHoursToText(hours){
    hours = hours % 12;
    if(hours == 0){
        hours = 12;
    }
    return germanNumberStr[hours][0];
}

function germanMinsToText(mins) {
    if (mins < 20) {
        return germanNumberStr[mins];
    } else {
        var tens = (mins / 10 | 0);
        var word1 = germanTensStr[tens];
        var remainder = mins - tens * 10;
        var word2 = germanUnit[remainder];
        return [word2, word1];
    }
}

class GermanDateFormatter extends DateFormatter {
    constructor() { super();}
    name(){return "German";}
    formatDate(date){
        var mins = date.getMinutes();
        var hourOfDay = date.getHours();
        var hours = germanHoursToText(hourOfDay);
        //console.log('hourOfDay->' + hourOfDay + ' hours text->' + hours)
        // Deal with the special times first
        if(mins == 0){
            var hours = germanHoursToText(hourOfDay);
            return [hours,"UHR", "","",""];
        } /*else if(mins == 30){
            var hours = germanHoursToText(hourOfDay+1);
            return ["", "", "HALB","", hours];
        } else if(mins == 15){
            var hours = germanHoursToText(hourOfDay);
            return ["", "", "VIERTEL", "NACH",hours];
        } else if(mins == 45) {
            var hours = germanHoursToText(hourOfDay+1);
            return ["", "", "VIERTEL", "VOR",hours];
        } */ else {
            var mins_txt = germanMinsToText(mins);
            return [hours, "UHR", mins_txt[0],mins_txt[1]];
        }
    }
}

module.exports = GermanDateFormatter;
