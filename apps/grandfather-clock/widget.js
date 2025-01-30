(() => {

    // todo: all of these configurable through app settings menu.
    const twelve_hour = true;
    const swap_meridian = false;
    const hour_attention_buzz_ms = 1000;
    const hour_count_buzz_ms = 250;
    const fraction_count_buzz_ms = 250;
    const fractions_of_hour = 4; // 4 = 15min intervals, 6 = 10min intervals
    const wait_ms = 500;
    const meridian_buzz_ms = 50;
    const meridian_buzz_wait_ms = 300;

    let date;
    let fractionMs = 3600000 / fractions_of_hour;

    let chime = function () {
        date = new Date();
        let hourFrac = Math.floor(date.getMinutes() / (60 / fractions_of_hour));

        if (hourFrac == 0) { // if it's an o'clock hour
            let chimeHour = (twelve_hour ? date.getHours() % 12 : date.getHours());
            if (chimeHour == 0) (twelve_hour ? chimeHour += 12 : chimeHour += 24);

            Bangle.buzz(hour_attention_buzz_ms).then(() => { // initial buzz
                setTimeout(hourChime, wait_ms, chimeHour); // wait a period before doing the first chime
            });
        } else { // if it's a fraction of an hour
            fractionChime(hourFrac);
        }

        queueNextChime();
    };

    let hourChime = function (hoursLeftToChime) {
        hoursLeftToChime--;
        Bangle.buzz(hour_count_buzz_ms).then(() => { // recursive. buzz and wait to do the next buzz.
            if (hoursLeftToChime > 0) {
                setTimeout(hourChime, wait_ms, hoursLeftToChime);
            } else if (twelve_hour) { // once finished with the hour count
                setTimeout(meridianChime, wait_ms, (date.getHours() >= 12)); // if in twelve hour mode, queue up the meridian chime.
            }
        });
    };

    let fractionChime = function (fractionsLeftToChime) {
        fractionsLeftToChime--;
        Bangle.buzz(fraction_count_buzz_ms).then(() => { // recursive. buzz and wait to do the next buzz.
            if (fractionsLeftToChime > 0) setTimeout(fractionChime, wait_ms, fractionsLeftToChime);
        });
    };

    let meridianChime = function (meridian) {
        if ((swap_meridian ? !meridian : meridian)) { // default: if PM
                Bangle.buzz(meridian_buzz_ms).then(setTimeout(Bangle.buzz, meridian_buzz_wait_ms, meridian_buzz_ms)); // buzz once, wait, buzz again.
        } else { // default: if AM
                Bangle.buzz(meridian_buzz_ms); // buzz once.
        }
    };

    let queueNextChime = function () {
        let msUntilNextFraction = fractionMs - (Date.now() % fractionMs);
        setTimeout(chime, msUntilNextFraction);
    };

    queueNextChime();
})()
