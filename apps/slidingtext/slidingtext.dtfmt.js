class DateFormatter {
    /**
     * A pure virtual class which all the other date formatters will
     * inherit from.
     * The name will be used to declare the date format when selected
     * and the date formatDate method will return the time formated
     * to the lines of text on the screen
     */
    name(){ return "no name";}
    shortName(){ return "no short name" }
    formatDate(date){ return ["no","date","defined"]; }
    rowProperties(row_no){
        return (row_no === 0)?
            {major_minor: 'major', info_type: 'time'} :
            {major_minor: 'minor', info_type: 'time'};
    }
    formatProperties(){
        return {
            default_style: {}
        };
    }
}

module.exports = DateFormatter;