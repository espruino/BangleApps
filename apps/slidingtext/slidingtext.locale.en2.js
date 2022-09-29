var DateFormatter = require("slidingtext.dtfmt.js");
const hoursToText = require("slidingtext.utils.en.js").hoursToText;
const numberToText = require("slidingtext.utils.en.js").numberToText;

/**
 alternatives:
 row_types: {
                 vsmall: {
                    scroll_off: ['right'],
                    scroll_in: ['right'],
                    angle_to_horizontal: 0
                  },
                  large: {
                    size: 'vlarge',
                    angle_to_horizontal: 90,
                    speed: 'slow',
                    color: 'major',
                    scroll_off: ['down'],
                    scroll_in: ['up']
                  }
                },
 row_defs: [
 {
                    type: 'large',
                    init_coords: [0.7,0.9],
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
                    init_coords: [0.7,0.9],
                    row_direction: [0.0,1.0],
                  rows: 1
                  },
 {
                    type: 'vsmall',
                    init_coords: [0.05,0.1],
                    row_direction: [0.0,1.0],
                    rows: 1
                  },
 ]

 */
class EnglishTraditionalDateFormatter extends DateFormatter {
    constructor() {
        super();
        this.row_types = {
            vsmall: {
                color: 'minor',
                speed: 'superslow',
                scroll_off: ['down'],
                scroll_in: ['up'],
                size: 'vsmall',
                angle_to_horizontal: 90
            },
            small: {
                speed: 'medium',
                scroll_off: ['left'],
                scroll_in: ['left'],
            },
            large: {
                speed: 'medium',
                color: 'major',
                scroll_off: ['left'],
                scroll_in: ['left'],
                angle_to_horizontal: 0
            }
        };
        this.row_defs = [
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
            },
            {
                type: 'vsmall',
                init_coords: [0.9,0.9],
                row_direction: [0.0,1.0],
                rows: 1
            },
        ];
    }
    formatDate(date){
        var date_txt = Locale.dow(date,1).toUpperCase() + " " + numberToText(date.getDate());
        var mins = date.getMinutes();
        var hourOfDay = date.getHours();
        if(mins > 30){
            hourOfDay += 1;
        }
        var hours = hoursToText(hourOfDay);
        // Deal with the special times first
        if(mins === 0){
            return [hours,"", "O'","CLOCK", date_txt];
        } else if(mins === 30){
            return ["","HALF", "PAST", "", hours];
        } else if(mins === 15){
            return ["","QUARTER", "PAST", "", hours];
        } else if(mins === 45) {
            return ["", "QUARTER", "TO", "", hours];
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

        if(mins_txt[1] != '') {
            return ['', mins_txt[0], mins_txt[1], from_to, hours, date_txt];
        } else {
            if(mins_value % 5 == 0) {
                return ['', mins_txt[0], from_to, '', hours, date_txt];
            } else if(mins_value == 1){
                return ['', mins_txt[0], 'MINUTE', from_to, hours, date_txt];
            } else {
                return ['', mins_txt[0], 'MINUTES', from_to, hours, date_txt];
            }
        }
    }
    defaultRowTypes(){ return this.row_types;}

    defaultRowDefs(){ return this.row_defs; }
}

module.exports = EnglishTraditionalDateFormatter;