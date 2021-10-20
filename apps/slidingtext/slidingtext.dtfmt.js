class DateFormatter {
    /**
     * A pure virtual class which all the other date formatters will
     * inherit from.
     * The name will be used to declare the date format when selected
     * and the date formatDate methid will return the time formated
     * to the lines of text on the screen
     */
    name(){return "no name";}
    formatDate(date){
        return ["no","date","defined"];
    }
}

module.exports = DateFormatter;