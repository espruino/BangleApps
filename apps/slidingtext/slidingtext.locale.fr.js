var DateFormatter = require("slidingtext.dtfmt.js");

/**
 * French date formatting
 */
const frenchNumberStr = [ "ZERO", "UNE", "DEUX", "TROIS", "QUATRE",
    "CINQ", "SIX", "SEPT", "HUIT", "NEUF", "DIX",
    "ONZE", "DOUZE", "TREIZE", "QUATORZE","QUINZE",
    "SEIZE", "DIX SEPT", "DIX HUIT","DIX NEUF", "VINGT",
    "VINGT ET UN", "VINGT DEUX", "VINGT TROIS",
    "VINGT QUATRE", "VINGT CINQ", "VINGT SIX",
    "VINGT SEPT", "VINGT HUIT", "VINGT NEUF"
];

function frenchHoursToText(hours){
    hours = hours % 12;
    if(hours === 0){
        hours = 12;
    }
    return frenchNumberStr[hours];
}

function frenchHeures(hours){
    if(hours % 12 === 1){
        return 'HEURE';
    } else {
        return 'HEURES';
    }
}

class FrenchDateFormatter extends DateFormatter {
    constructor() {
        super();
    }
    formatDate(date){
        var hours = frenchHoursToText(date.getHours());
        var heures = frenchHeures(date.getHours());
        const mins = date.getMinutes();
        if(mins === 0){
            if(hours === 0){
                return ["MINUIT", "",""];
            } else if(hours === 12){
                return ["MIDI", "",""];
            } else {
                return [hours, heures,""];
            }
        } else if(mins === 30){
            return [hours, heures,'ET DEMIE'];
        } else if(mins === 15){
            return [hours, heures,'ET QUART'];
        } else if(mins === 45){
            var next_hour = date.getHours()  + 1;
            hours = frenchHoursToText(next_hour);
            heures = frenchHeures(next_hour);
            return [hours, heures,"MOINS",'LET QUART'];
        }
        if(mins > 30){
            const to_mins = 60-mins;
            var mins_txt = frenchNumberStr[to_mins];
            next_hour = date.getHours()  + 1;
            hours = frenchHoursToText(next_hour);
            heures = frenchHeures(next_hour);
            return [ hours, heures , "MOINS", mins_txt ];
        } else {
            mins_txt = frenchNumberStr[mins];
            return [ hours, heures , mins_txt ];
        }
    }
    defaultRowTypes(){
        return {
            small: {
                speed: 'vslow'
            }
        };
    }

    defaultRowDefs(){
        return [
            {
                type: 'large',
                init_coords: [0.05,0.1],
                row_direction: [0.0,1.0],
                rows: 1
            },
            {
                type: 'small',
                init_coords: [0.05,0.4],
                row_direction: [0.0,1.0],
                rows: 3
            }
        ];
    }
}

module.exports = FrenchDateFormatter;