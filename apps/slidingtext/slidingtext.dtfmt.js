class DateFormatter {
    /**
     * A pure virtual class which all the other date formatters will
     * inherit from.
     * The name will be used to declare the date format when selected
     * and the date formatDate method will return the time formated
     * to the lines of text on the screen
     */
    formatDate(date){ return ["no","date","defined"]; }

    /**
     * returns a map of the different row types
     */
    defaultRowTypes(){}

    /**
     * returns a list of row definitions (1 definition can cover m
     */
    defaultRowDefs(){ return [];}
}

module.exports = DateFormatter;