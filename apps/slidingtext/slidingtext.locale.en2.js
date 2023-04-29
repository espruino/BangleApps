const DateFormatter = require("slidingtext.dtfmt.js");
const dayOfWeekShort = require("slidingtext.utils.en.js").dayOfWeekShort;
const numberToDayNumberText = require("slidingtext.utils.en.js").numberToDayNumberText;
const hoursToText = require("slidingtext.utils.en.js").hoursToText;
const numberToText = require("slidingtext.utils.en.js").numberToText;

class EnglishTraditionalDateFormatter extends DateFormatter {
    constructor() {
        super();
    }
    formatDate(date){
        const day_of_week = dayOfWeekShort(date);
        const date_txt = numberToDayNumberText(date.getDate()).join(' ');
        const mins = date.getMinutes();
        var hourOfDay = date.getHours();
        if(mins > 30){
            hourOfDay += 1;
        }
        const hours = hoursToText(hourOfDay);
        // Deal with the special times first
        if(mins === 0){
            return [hours,"", "O'","CLOCK","", day_of_week, date_txt];
        } else if(mins === 30){
            return ["","HALF", "PAST", "", hours, day_of_week, date_txt];
        } else if(mins === 15){
            return ["","QUARTER", "PAST", "", hours, day_of_week, date_txt];
        } else if(mins === 45) {
            return ["", "QUARTER", "TO", "", hours, day_of_week, date_txt];
        }
        var mins_txt;
        var from_to;
        var mins_value;
        if(mins > 30){
            mins_value = 60-mins;
            from_to = "TO";
            mins_txt = numberToText(mins_value);
        } else {
            mins_value = mins;
            from_to = "PAST";
            mins_txt = numberToText(mins_value);
        }

        if(mins_txt[1] !== '') {
            return ['', mins_txt[0], mins_txt[1], from_to, hours, day_of_week, date_txt];
        } else {
            if(mins_value % 5 === 0) {
                return ['', mins_txt[0], from_to, '', hours, day_of_week, date_txt];
            } else if(mins_value === 1){
                return ['', mins_txt[0], 'MINUTE', from_to, hours, day_of_week, date_txt];
            } else {
                return ['', mins_txt[0], 'MINUTES', from_to, hours, day_of_week, date_txt];
            }
        }
    }
    defaultRowTypes(){
        return {
            small: {
                speed: 'medium',
                scroll_off: ['left','right'],
                scroll_in: ['left','right'],
            },
            large: {
                speed: 'medium',
                color: 'major',
                scroll_off: ['left','right'],
                scroll_in: ['left','right']
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
                init_coords: [0.05,0.35],
                row_direction: [0.0,1.0],
                rows: 3
            },
            {
                type: 'large',
                init_coords: [0.05,0.75],
                row_direction: [0.0,1.0],
                rows: 1
            }
        ];
    }
}

module.exports = EnglishTraditionalDateFormatter;