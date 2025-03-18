const DateFormatter = require("slidingtext.dtfmt.js");
const numberToText = require("slidingtext.utils.en.js").numberToText;
const dayOfWeek = require("slidingtext.utils.en.js").dayOfWeekShort;

class EnglishDateFormatter extends DateFormatter {
    constructor() {
        super();
    }

    format00(num){
        const value = (num | 0);
        if(value > 99 || value < 0)
            throw "must be between in range 0-99";
        if(value < 10)
            return "0" + value.toString();
        else
            return value.toString();
    }

    formatDate(date){

        const hours_txt = this.format00(date.getHours());
        const mins_txt = numberToText(date.getMinutes());
        const day_of_week = dayOfWeek(date);
        const date_txt =  day_of_week + " " + this.format00(date.getDate());
        return [hours_txt,mins_txt[0],mins_txt[1],date_txt];
    }
    defaultRowTypes() {
        return {
            large: {
                size: 'slarge',
                scroll_off: ['left','down'],
                scroll_in: ['up','left'],
            },
            medium: {
                size: 'msmall',
                scroll_off: ['down'],
                scroll_in: ['up'],
                angle_to_horizontal: 90
            },
            small: {
                size: 'ssmall',
                scroll_off: ['left'],
                scroll_in: ['left'],
            }
        };
    }

    defaultRowDefs(){
        const row_defs = [
            {
                type: 'large',
                init_coords: [0.05,0.35],
                row_direction: [0.0,1.0],
                rows: 1
            },
            {
                type: 'medium',
                init_coords: [0.68,0.95],
                row_direction: [1.0,0.0],
                angle_to_horizontal: 90,
                rows: 2
            }];

        const bangleVersion = (g.getHeight()>200)? 1 : 2;
        if(bangleVersion > 1){
            row_defs.push(
                {
                    type: 'small',
                    init_coords: [0.05, 0.1],
                    row_direction: [0.0, 1.0],
                    rows: 1
                }
            )
        }
        return row_defs;
    }
}

module.exports = EnglishDateFormatter;