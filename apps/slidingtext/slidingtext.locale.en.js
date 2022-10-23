const DateFormatter = require("slidingtext.dtfmt.js");
const hoursToText = require("slidingtext.utils.en.js").hoursToText;
const numberToText = require("slidingtext.utils.en.js").numberToText;
const dayOfWeek = require("slidingtext.utils.en.js").dayOfWeek;
const numberToDayNumberText = require("slidingtext.utils.en.js").numberToDayNumberText;
const monthToText = require("slidingtext.utils.en.js").monthToText;

class EnglishDateFormatter extends DateFormatter {
    constructor() {
        super();
    }
    formatDate(date){
        const hours_txt = hoursToText(date.getHours());
        const mins_txt = numberToText(date.getMinutes());
        const day_of_week = dayOfWeek(date);
        const date_txt = numberToDayNumberText(date.getDate()).join(' ');
        const month = monthToText(date);
        return [hours_txt,mins_txt[0],mins_txt[1],day_of_week,date_txt,month];
    }
    defaultRowTypes() {
        return {
            small: {size: 'ssmall'}
        };
    }

    defaultRowDefs(){
        const row_defs = [
            {
                type: 'large',
                init_coords: [0.05,0.07],
                row_direction: [0.0,1.0],
                rows: 1
            },
            {
                type: 'medium',
                init_coords: [0.05,0.31],
                row_direction: [0.0,1.0],
                rows: 2
            }
        ];
        const bangleVersion = (g.getHeight()>200)? 1 : 2;
        if(bangleVersion > 1){
            row_defs.push(
                {
                    type: 'small',
                    init_coords: [0.05,0.75],
                    row_direction: [0.0,1.0],
                    rows: 2
                }
            )
        }
        return row_defs;
    }
}

module.exports = EnglishDateFormatter;