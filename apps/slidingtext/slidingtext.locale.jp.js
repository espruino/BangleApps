var DateFormatter = require("slidingtext.dtfmt.js");

/**
 * Japanese date formatting
 */
const japaneseHourStr = [ "ZERO", "ICHII", "NI", "SAN", "YO",
    "GO", "ROKU", "SHICHI", "HACHI", "KU", "JUU",
    'JUU ICHI', 'JUU NI'];
const tensPrefixStr = [ "",
    "JUU",
    'NIJUU',
    'SAN JUU',
    'YON JUU',
    'GO JUU'];

const japaneseMinuteStr = [ ["", "PUN"],
    ["IP","PUN" ],
    ["NI", "FUN"],
    ["SAN", "PUN"],
    ["YON","FUN"],
    ["GO", "HUN"],
    ["RO", "PUN"],
    ["NANA", "FUN"],
    ["HAP", "PUN"],
    ["KYU","FUN"],
    ["JUP", "PUN"]
];

function japaneseHoursToText(hours){
    hours = hours % 12;
    if(hours == 0){
        hours = 12;
    }
    return japaneseHourStr[hours];
}

function japaneseMinsToText(mins){
    if(mins == 0){
        return ["",""];
    } else if(mins == 30)
        return ["HAN",""];
    else {
        var units = mins % 10;
        var mins_txt = japaneseMinuteStr[units];
        var tens = mins /10 | 0;
        if(tens > 0){
            var tens_txt = tensPrefixStr[tens];
            var minutes_txt;
            if(mins_txt[0] != ''){
                minutes_txt = mins_txt[0] + ' ' +  mins_txt[1];
            } else {
                minutes_txt = mins_txt[1];
            }
            return [tens_txt, minutes_txt];
        } else {
            return [mins_txt[0],  mins_txt[1]];
        }
    }
}

class JapaneseDateFormatter extends DateFormatter {
    constructor() { super(); }
    name(){return "Japanese (Romanji)";}
    formatDate(date){
        var hours_txt = japaneseHoursToText(date.getHours());
        var mins_txt = japaneseMinsToText(date.getMinutes());
        return [hours_txt,"JI", mins_txt[0], mins_txt[1] ];
    }
}

module.exports = JapaneseDateFormatter;