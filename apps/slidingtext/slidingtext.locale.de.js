const DateFormatter = require("slidingtext.dtfmt.js");
const germanHoursToText = require("slidingtext.utils.de.js").germanHoursToText;
const germanMinsToText = require("slidingtext.utils.de.js").germanMinsToText;

/**
 * German 12 hour clock
 */
class GermanDateFormatter extends DateFormatter {
    constructor() {
        super();
    }
    formatDate(date){
        const mins = date.getMinutes();
        const hourOfDay = date.getHours();
        const hours = germanHoursToText(hourOfDay);
        if(mins === 0){
            return [hours,"UHR", "","",""];
        } else {
            const mins_txt = germanMinsToText(mins);
            return [hours, "UHR", mins_txt[0],mins_txt[1]];
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

module.exports = GermanDateFormatter;
