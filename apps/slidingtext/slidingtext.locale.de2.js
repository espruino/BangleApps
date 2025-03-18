const DateFormatter = require("slidingtext.dtfmt.js");
const german24HoursToText = require("slidingtext.utils.de.js").german24HoursToText;
const germanMinsToText = require("slidingtext.utils.de.js").germanMinsToText;

/**
 * German 24 hour clock
 */
class German24HourDateFormatter extends DateFormatter {
    constructor() {
        super();
    }
    formatDate(date){
        const mins = date.getMinutes();
        const hourOfDay = date.getHours();
        const hours = german24HoursToText(hourOfDay);
        const display_hours = (hours[1] === '')? ["", hours[0]] : hours;
        if(mins === 0){
            return [display_hours[0],display_hours[1],"UHR", "","",""];
        } else {
            const mins_txt = germanMinsToText(mins);

            return [display_hours[0],display_hours[1], "UHR", mins_txt[0],mins_txt[1]];
        }
    }
    defaultRowTypes(){ return {
        large:{
            size: 'mlarge'
        }
    };}

    defaultRowDefs(){
        return [
            {
                type: 'large',
                init_coords: [0.05,0.06],
                row_direction: [0.0,1.0],
                rows: 2
            },
            {
                type: 'medium',
                init_coords: [0.05,0.5],
                row_direction: [0.0,1.0],
                rows: 3
            }
        ];
    }
}

module.exports = German24HourDateFormatter;
