const Locale = require('locale');

class DigitDateTimeFormatter {
    constructor() {}

    format00(num){
        const value = (num | 0);
        if(value > 99 || value < 0)
            throw "must be between in range 0-99";
        if(value < 10)
            return "0" + value.toString();
        else
            return value.toString();
    }

    formatDate(now){
        const hours = now.getHours() ;
        const time_txt = this.format00(hours) + ":" + this.format00(now.getMinutes());
        const date_txt = Locale.dow(now,1) + " " + this.format00(now.getDate());
        return [time_txt[0], time_txt[1],time_txt[2], time_txt[3],time_txt[4],date_txt];
    }

    defaultRowTypes(){
        return {
            large: {
                scroll_off: ['down'],
                scroll_in: ['up'],
                size: 'vlarge',
                speed: 'medium'
            },
            small: {
                angle_to_horizontal: 0,
                scroll_off: ['left'],
                scroll_in: ['right'],
            }
        };
    }

    defaultRowDefs() {
        return [
            {
                type: 'large',
                row_direction: [0.7,0.0],
                init_coords: [0.1,0.35],
                rows: 3
            },
            {
                type: 'large',
                row_direction: [0.7,0.0],
                init_coords: [0.6,0.35],
                rows: 2
            },
            {
                type: 'small',
                row_direction: [0.0,1.0],
                init_coords: [0.1,0.05],
                rows: 1
            }
        ];
    }
}

module.exports = DigitDateTimeFormatter;