const DateFormatter = require("slidingtext.dtfmt.js");

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
    if(hours === 0){
        hours = 12;
    }
    return japaneseHourStr[hours];
}

function japaneseMinsToText(mins){
    if(mins === 0){
        return ["",""];
    } else if(mins === 30)
        return ["HAN",""];
    else {
        const units = mins % 10;
        const mins_txt = japaneseMinuteStr[units];
        const tens = mins /10 | 0;
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
    constructor() {
        super();
    }
    formatDate(date){
        const hours_txt = japaneseHoursToText(date.getHours());
        const mins_txt = japaneseMinsToText(date.getMinutes());
        return [hours_txt,"JI", mins_txt[0], mins_txt[1] ];
    }
    defaultRowTypes(){ return {}; }

    defaultRowDefs(){
        return [
            {
                type: 'large',
                init_coords: [0.05,0.1],
                row_direction: [0.0,1.0],
                rows: 1
            },
            {
                type: 'medium',
                init_coords: [0.05,0.4],
                row_direction: [0.0,1.0],
                rows: 3
            }
        ];
    }
}

module.exports = JapaneseDateFormatter;