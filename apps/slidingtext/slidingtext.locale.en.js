var DateFormatter = require("slidingtext.dtfmt.js");
const hoursToText = require("slidingtext.utils.en.js").hoursToText;
const numberToText = require("slidingtext.utils.en.js").numberToText;

/**
 * Alternative layouts
 *
 {
    row_types: {
      large:{
        angle_to_horizontal: 90
      }
    },
    row_defs: [
      {
        type: 'large',
        init_coords: [0.05,0.95],
        row_direction: [1.0,0.0],
        rows: 1
      },
      {
        type: 'medium',
        init_coords: [0.3,0.1],
        row_direction: [0.0,1.0],
        rows: 2
      },
      {
        type: 'small',
        init_coords: [0.3,0.9],
        row_direction: [0.0,1.0],
        rows: 1
      }
    ]
 }
 */
class EnglishDateFormatter extends DateFormatter {
    constructor() {
        super();
        this.row_types = {
            small: {size: 'vsmall'}
        };
        this.row_defs = [
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
                rows: 2
            },
            {
                type: 'small',
                init_coords: [0.05,0.9],
                row_direction: [0.0,1.0],
                rows: 1
            }
        ];
    }
    formatDate(date){
        var hours_txt = hoursToText(date.getHours());
        var mins_txt = numberToText(date.getMinutes());
        var date_txt = Locale.dow(date,1).toUpperCase() + " " + numberToText(date.getDate());
        return [hours_txt,mins_txt[0],mins_txt[1],date_txt];
    }
    defaultRowTypes(){ return this.row_types;}

    defaultRowDefs(){ return this.row_defs; }
}

module.exports = EnglishDateFormatter;