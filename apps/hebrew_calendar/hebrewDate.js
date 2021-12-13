/*!
 *      This script was taked from this page http://www.shamash.org/help/javadate.shtml and ported to Node.js by Ionică Bizău in https://github.com/IonicaBizau/hebrew-date
 *
 *      This script was adapted from C sources written by
 *      Scott E. Lee, which contain the following copyright notice:
 *
 *      Copyright 1993-1995, Scott E. Lee, all rights reserved.
 *      Permission granted to use, copy, modify, distribute and sell so long as
 *      the above copyright and this permission statement are retained in all
 *      copies.  THERE IS NO WARRANTY - USE AT YOUR OWN RISK.
 *
 *      Bill Hastings
 *      RBI Software Systems
 *      bhastings@rbi.com
 */
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
var GREG_SDN_OFFSET = 32045, DAYS_PER_5_MONTHS = 153, DAYS_PER_4_YEARS = 1461, DAYS_PER_400_YEARS = 146097;
var HALAKIM_PER_HOUR = 1080, HALAKIM_PER_DAY = 25920, HALAKIM_PER_LUNAR_CYCLE = 29 * HALAKIM_PER_DAY + 13753, HALAKIM_PER_METONIC_CYCLE = HALAKIM_PER_LUNAR_CYCLE * (12 * 19 + 7);
var HEB_SDN_OFFSET = 347997, NEW_MOON_OF_CREATION = 31524, NOON = 18 * HALAKIM_PER_HOUR, AM3_11_20 = 9 * HALAKIM_PER_HOUR + 204, AM9_32_43 = 15 * HALAKIM_PER_HOUR + 589;
var SUN = 0, MON = 1, TUES = 2, WED = 3, THUR = 4, FRI = 5, SAT = 6;
function weekdayarr(d0, d1, d2, d3, d4, d5, d6) {
    this[0] = d0;
    this[1] = d1;
    this[2] = d2;
    this[3] = d3;
    this[4] = d4;
    this[5] = d5;
    this[6] = d6;
}
function gregmontharr(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11) {
    this[0] = m0;
    this[1] = m1;
    this[2] = m2;
    this[3] = m3;
    this[4] = m4;
    this[5] = m5;
    this[6] = m6;
    this[7] = m7;
    this[8] = m8;
    this[9] = m9;
    this[10] = m10;
    this[11] = m11;
}
function hebrewmontharr(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13) {
    this[0] = m0;
    this[1] = m1;
    this[2] = m2;
    this[3] = m3;
    this[4] = m4;
    this[5] = m5;
    this[6] = m6;
    this[7] = m7;
    this[8] = m8;
    this[9] = m9;
    this[10] = m10;
    this[11] = m11;
    this[12] = m12;
    this[13] = m13;
}
function monthsperyeararr(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18) {
    this[0] = m0;
    this[1] = m1;
    this[2] = m2;
    this[3] = m3;
    this[4] = m4;
    this[5] = m5;
    this[6] = m6;
    this[7] = m7;
    this[8] = m8;
    this[9] = m9;
    this[10] = m10;
    this[11] = m11;
    this[12] = m12;
    this[13] = m13;
    this[14] = m14;
    this[15] = m15;
    this[16] = m16;
    this[17] = m17;
    this[18] = m18;
}
var gWeekday = new weekdayarr("Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"), gMonth = new gregmontharr("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"), hMonth = new hebrewmontharr("Tishri", "Heshvan", "Kislev", "Tevet", "Shevat", "AdarI", "AdarII", "Nisan", "Iyyar", "Sivan", "Tammuz", "Av", "Elul"), mpy = new monthsperyeararr(12, 12, 13, 12, 12, 13, 12, 13, 12, 12, 13, 12, 12, 13, 12, 12, 13, 12, 13);
/**
 * hebrewDate
 * Convert the Gregorian dates  into Hebrew calendar dates.
 *
 * @name hebrewDate
 * @function
 * @param {Date|Number} inputDate The date object (representing the Gregorian date) or the year.
 * @return {Object} An object containing:
 *
 *  - `year`: The Hebrew year.
 *  - `month`: The Hebrew month.
 *  - `month_name`: The Hebrew month name.
 *  - `date`: The Hebrew date.
 */
function hebrewDate(inputDateOrYear) {
    var inputMonth, inputDate;
    var hebrewMonth = 0, hebrewDate = 0, hebrewYear = 0, metonicCycle = 0, metonicYear = 0, moladDay = 0, moladHalakim = 0;
    function GregorianToSdn(inputYear, inputMonth, inputDay) {
        var year = 0, month = 0, sdn = void 0;
        // Make year a positive number
        if (inputYear < 0) {
            year = inputYear + 4801;
        }
        else {
            year = inputYear + 4800;
        }
        // Adjust the start of the year
        if (inputMonth > 2) {
            month = inputMonth - 3;
        }
        else {
            month = inputMonth + 9;
            year--;
        }
        sdn = Math.floor(Math.floor(year / 100) * DAYS_PER_400_YEARS / 4);
        sdn += Math.floor(year % 100 * DAYS_PER_4_YEARS / 4);
        sdn += Math.floor((month * DAYS_PER_5_MONTHS + 2) / 5);
        sdn += inputDay - GREG_SDN_OFFSET;
        return sdn;
    }
    function SdnToHebrew(sdn) {
        var tishri1 = 0, tishri1After = 0, yearLength = 0, inputDay = sdn - HEB_SDN_OFFSET;
        FindTishriMolad(inputDay);
        tishri1 = Tishri1(metonicYear, moladDay, moladHalakim);
        if (inputDay >= tishri1) {
            // It found Tishri 1 at the start of the year.
            hebrewYear = metonicCycle * 19 + metonicYear + 1;
            if (inputDay < tishri1 + 59) {
                if (inputDay < tishri1 + 30) {
                    hebrewMonth = 1;
                    hebrewDate = inputDay - tishri1 + 1;
                }
                else {
                    hebrewMonth = 2;
                    hebrewDate = inputDay - tishri1 - 29;
                }
                return;
            }
            // We need the length of the year to figure this out,so find Tishri 1 of the next year.
            moladHalakim += HALAKIM_PER_LUNAR_CYCLE * mpy[metonicYear];
            moladDay += Math.floor(moladHalakim / HALAKIM_PER_DAY);
            moladHalakim = moladHalakim % HALAKIM_PER_DAY;
            tishri1After = Tishri1((metonicYear + 1) % 19, moladDay, moladHalakim);
        }
        else {
            // It found Tishri 1 at the end of the year.
            hebrewYear = metonicCycle * 19 + metonicYear;
            if (inputDay >= tishri1 - 177) {
                // It is one of the last 6 months of the year.
                if (inputDay > tishri1 - 30) {
                    hebrewMonth = 13;
                    hebrewDate = inputDay - tishri1 + 30;
                }
                else if (inputDay > tishri1 - 60) {
                    hebrewMonth = 12;
                    hebrewDate = inputDay - tishri1 + 60;
                }
                else if (inputDay > tishri1 - 89) {
                    hebrewMonth = 11;
                    hebrewDate = inputDay - tishri1 + 89;
                }
                else if (inputDay > tishri1 - 119) {
                    hebrewMonth = 10;
                    hebrewDate = inputDay - tishri1 + 119;
                }
                else if (inputDay > tishri1 - 148) {
                    hebrewMonth = 9;
                    hebrewDate = inputDay - tishri1 + 148;
                }
                else {
                    hebrewMonth = 8;
                    hebrewDate = inputDay - tishri1 + 178;
                }
                return;
            }
            else {
                if (mpy[(hebrewYear - 1) % 19] == 13) {
                    hebrewMonth = 7;
                    hebrewDate = inputDay - tishri1 + 207;
                    if (hebrewDate > 0)
                        return;
                    hebrewMonth--;
                    hebrewDate += 30;
                    if (hebrewDate > 0)
                        return;
                    hebrewMonth--;
                    hebrewDate += 30;
                }
                else {
                    hebrewMonth = 6;
                    hebrewDate = inputDay - tishri1 + 207;
                    if (hebrewDate > 0)
                        return;
                    hebrewMonth--;
                    hebrewDate += 30;
                }
                if (hebrewDate > 0)
                    return;
                hebrewMonth--;
                hebrewDate += 29;
                if (hebrewDate > 0)
                    return;
                // We need the length of the year to figure this out,so find Tishri 1 of this year.
                tishri1After = tishri1;
                FindTishriMolad(moladDay - 365);
                tishri1 = Tishri1(metonicYear, moladDay, moladHalakim);
            }
        }
        yearLength = tishri1After - tishri1;
        moladDay = inputDay - tishri1 - 29;
        if (yearLength == 355 || yearLength == 385) {
            // Heshvan has 30 days
            if (moladDay <= 30) {
                hebrewMonth = 2;
                hebrewDate = moladDay;
                return;
            }
            moladDay -= 30;
        }
        else {
            // Heshvan has 29 days
            if (moladDay <= 29) {
                hebrewMonth = 2;
                hebrewDate = moladDay;
                return;
            }
            moladDay -= 29;
        }
        // It has to be Kislev.
        hebrewMonth = 3;
        hebrewDate = moladDay;
    }
    function FindTishriMolad(inputDay) {
        // Estimate the metonic cycle number.  Note that this may be an under
        // estimate because there are 6939.6896 days in a metonic cycle not
        // 6940,but it will never be an over estimate.   The loop below will
        // correct for any error in this estimate.
        metonicCycle = Math.floor((inputDay + 310) / 6940);
        // Calculate the time of the starting molad for this metonic cycle.
        MoladOfMetonicCycle();
        // If the above was an under estimate,increment the cycle number until
        // the correct one is found.  For modern dates this loop is about 98.6%
        // likely to not execute,even once,because the above estimate is
        // really quite close.
        while (moladDay < inputDay - 6940 + 310) {
            metonicCycle++;
            moladHalakim += HALAKIM_PER_METONIC_CYCLE;
            moladDay += Math.floor(moladHalakim / HALAKIM_PER_DAY);
            moladHalakim = moladHalakim % HALAKIM_PER_DAY;
        }
        // Find the molad of Tishri closest to this date.
        for (metonicYear = 0; metonicYear < 18; metonicYear++) {
            if (moladDay > inputDay - 74)
                break;
            moladHalakim += HALAKIM_PER_LUNAR_CYCLE * mpy[metonicYear];
            moladDay += Math.floor(moladHalakim / HALAKIM_PER_DAY);
            moladHalakim = moladHalakim % HALAKIM_PER_DAY;
        }
    }
    function MoladOfMetonicCycle() {
        var r1 = void 0, r2 = void 0, d1 = void 0, d2 = void 0;
        // Start with the time of the first molad after creation.
        r1 = NEW_MOON_OF_CREATION;
        // Calculate gMetonicCycle * HALAKIM_PER_METONIC_CYCLE.  The upper 32
        // bits of the result will be in r2 and the lower 16 bits will be in r1.
        r1 += metonicCycle * (HALAKIM_PER_METONIC_CYCLE & 0xFFFF);
        r2 = r1 >> 16;
        r2 += metonicCycle * (HALAKIM_PER_METONIC_CYCLE >> 16 & 0xFFFF);
        // Calculate r2r1 / HALAKIM_PER_DAY.  The remainder will be in r1,the
        // upper 16 bits of the quotient will be in d2 and the lower 16 bits
        // will be in d1.
        d2 = Math.floor(r2 / HALAKIM_PER_DAY);
        r2 -= d2 * HALAKIM_PER_DAY;
        r1 = r2 << 16 | r1 & 0xFFFF;
        d1 = Math.floor(r1 / HALAKIM_PER_DAY);
        r1 -= d1 * HALAKIM_PER_DAY;
        moladDay = d2 << 16 | d1;
        moladHalakim = r1;
    }
    function Tishri1(metonicYear, moladDay, moladHalakim) {
        var tishri1 = moladDay, dow = tishri1 % 7, leapYear = metonicYear == 2 || metonicYear == 5 || metonicYear == 7 || metonicYear == 10 || metonicYear == 13 || metonicYear == 16 || metonicYear == 18, lastWasLeapYear = metonicYear == 3 || metonicYear == 6 || metonicYear == 8 || metonicYear == 11 || metonicYear == 14 || metonicYear == 17 || metonicYear == 0;
        // Apply rules 2,3 and 4
        if (moladHalakim >= NOON || !leapYear && dow == TUES && moladHalakim >= AM3_11_20 || lastWasLeapYear && dow == MON && moladHalakim >= AM9_32_43) {
            tishri1++;
            dow++;
            if (dow == 7)
                dow = 0;
        }
        // Apply rule 1 after the others because it can cause an additional delay of one day.
        if (dow == WED || dow == FRI || dow == SUN) {
            tishri1++;
        }
        return tishri1;
    }
    var inputYear = inputDateOrYear;
    if ((typeof inputYear === "undefined" ? "undefined" : _typeof(inputYear)) === "object") {
        inputMonth = inputDateOrYear.getMonth() + 1;
        inputDate = inputDateOrYear.getDate();
        inputYear = inputDateOrYear.getFullYear();
    }
    SdnToHebrew(GregorianToSdn(inputYear, inputMonth, inputDate));
    return {
        year: hebrewYear,
        month: hebrewMonth,
        date: hebrewDate,
        month_name: hMonth[hebrewMonth - 1]
    };
}

exports.hebrewDate = hebrewDate;
