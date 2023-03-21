const germanNumberStr = [ ["NULL",""], // 0
    ["EINS",""], // 1
    ["ZWEI",""], //2
    ["DREI",""], //3
    ["VIER",""], //4
    ["FÜNF",""], //5
    ["SECHS",""], //6
    ["SIEBEN",""], //7
    ["ACHT",""], //8
    ["NEUN",""], // 9,
    ["ZEHN",""], // 10
    ["ELF",""], // 11,
    ["ZWÖLF",""], // 12
    ["DREI","ZEHN"], // 13
    ["VIER","ZEHN"], // 14
    ["FÜNF","ZEHN"], // 15
    ["SECH","ZEHN"], // 16
    ["SIEB","ZEHN"], // 17
    ["ACHT","ZEHN"], // 18
    ["NEUN","ZEHN"], // 19
    ["ZWANZIG",""], // 20
    ["EIN","UNDZWANZIG"], // 21
    ["ZWEI","UNDZWANZIG"], //22
    ["DREI","UNDZWANZIG"], // 23
    ["VIER","UNDZWANZIG"] // 24
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
    if(hours === 0){
        hours = 12;
    }
    if(hours === 1){
        return "EIN"
    } else {
        return germanNumberStr[hours][0];
    }
}
function german24HoursToText(hours){
    hours = hours % 24;
    if(hours === 0){
        return hours[24] ;
    } else if(hours === 1){
        return ["EIN",""];
    } else {
        return germanNumberStr[hours];
    }
}


function germanMinsToText(mins) {
    if (mins < 20) {
        return germanNumberStr[mins];
    } else {
        const tens = (mins / 10 | 0);
        const word1 = germanTensStr[tens];
        const remainder = mins - tens * 10;
        const word2 = germanUnit[remainder];
        return [word2, word1];
    }
}

exports.germanMinsToText = germanMinsToText;
exports.germanHoursToText = germanHoursToText;
exports.german24HoursToText = german24HoursToText;