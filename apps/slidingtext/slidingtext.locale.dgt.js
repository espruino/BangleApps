const Locale = require('locale');

class DigitDateTimeFormatter {
    constructor() {
        this.row_types = {
            large: {
                scroll_off: ['down'],
                scroll_in: ['up'],
                size: 'large',
                speed: 'vslow'
            },
            small: {
                angle_to_horizontal: 0,
                scroll_off: ['left'],
                scroll_in: ['right'],
            }
        };

        this.row_defs = [
            {
                type: 'large',
                row_direction: [0.8,0.0],
                init_coords: [0.1,0.35],
                rows: 5
            },
            {
                type: 'small',
                row_direction: [0.0,1.0],
                init_coords: [0.1,0.05],
                rows: 1
            }
        ];
    }

    format00(num){
        var value = (num | 0);
        if(value > 99 || value < 0)
            throw "must be between in range 0-99";
        if(value < 10)
            return "0" + value.toString();
        else
            return value.toString();
    }

    formatDate(now){
        var hours = now.getHours() ;
        var time_txt = this.format00(hours) + ":" + this.format00(now.getMinutes());
        var date_txt = Locale.dow(now,1) + " " + this.format00(now.getDate());
        return [time_txt[0], time_txt[1],time_txt[2], time_txt[3],time_txt[4],date_txt];
    }

    defaultRowTypes(){ return this.row_types; }

    defaultRowDefs() { return this.row_defs; }
}

module.exports = DigitDateTimeFormatter;