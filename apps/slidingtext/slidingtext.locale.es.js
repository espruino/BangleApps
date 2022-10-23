var DateFormatter = require("slidingtext.dtfmt.js");

const spanishNumberStr = [ ["ZERO"], // 0
    ["UNA",""], // 1
    ["DOS",""], //2
    ["TRES",''], //3
    ["CUATRO",''], //4
    ["CINCO",''], //5
    ["SEIS",''], //6
    ["SIETE",''], //7
    ["OCHO",''], //8
    ["NUEVE",''], // 9,
    ["DIEZ",''], // 10
    ["ONCE",''], // 11,
    ["DOCE",''], // 12
    ["TRECE",''], // 13
    ["CATORCE",''], // 14
    ["QUINCE",''], // 15
    ["DIECI",'SEIS'], // 16
    ["DIECI",'SIETE'], // 17
    ["DIECI",'OCHO'], // 18
    ["DIECI",'NEUVE'], // 19
    ["VEINTE",''], // 20
    ["VEINTI",'UNO'], // 21
    ["VEINTI",'DOS'], // 22
    ["VEINTI",'TRES'], // 23
    ["VEINTI",'CUATRO'], // 24
    ["VEINTI",'CINCO'], // 25
    ["VEINTI",'SEIS'], // 26
    ["VEINTI",'SIETE'], // 27
    ["VEINTI",'OCHO'], // 28
    ["VEINTI",'NUEVE'] // 29
    ];

function spanishHoursToText(hours){
    hours = hours % 12;
    if(hours === 0){
        hours = 12;
    }
    return spanishNumberStr[hours][0];
}

function spanishMinsToText(mins){
    return spanishNumberStr[mins];
}

class SpanishDateFormatter extends DateFormatter {
    constructor() {
        super();
    }
    formatDate(date){
        const mins = date.getMinutes();
        var hourOfDay = date.getHours();
        if(mins > 30){
            hourOfDay += 1;
        }
        const hours = spanishHoursToText(hourOfDay);
        //console.log('hourOfDay->' + hourOfDay + ' hours text->' + hours)
        // Deal with the special times first
        if(mins === 0){
            return [hours,"", "","",""];
        } else if(mins === 30){
            return [hours, "Y", "MEDIA",""];
        } else if(mins === 15){
            return [hours, "Y", "CUARTO",""];
        } else if(mins === 45) {
            return [hours, "MENOS", "CUARTO",""];
        } else if(mins > 30){
            const mins_txt = spanishMinsToText(60-mins);
            return [hours, "MENOS", mins_txt[0],mins_txt[1]];
        } else {
            const mins_txt = spanishMinsToText(mins);
            return [hours, "Y", mins_txt[0],mins_txt[1]];
        }
    }
    defaultRowTypes(){ return {};}

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

module.exports = SpanishDateFormatter;
