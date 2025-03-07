(() => {

    // sensible defaults
    let config = Object.assign({
        draw_widget: true,
        twelve_hour: true,
        swap_meridian: false,
        hour_attention_buzz_ms: 1000,
        hour_count_buzz_ms: 250,
        fraction_count_buzz_ms: 250,
        fractions_of_hour: 4, // 4 = 15min intervals, 6 = 10min intervals
        wait_ms: 500,
        meridian_buzz_ms: 50,
        meridian_buzz_wait_ms: 300
    }, require('Storage').readJSON("grandfatherclock.json", true) || {}); // or, load the app settings file.

    WIDGETS["grandfatherclock"] = {
        area: "tr",
        width: config.draw_widget ? 16 : 0,
        draw: function() {
            if (config.draw_widget) {
                g.reset();
                g.drawImage(atob("EBiDASSTJJISSSSZJJJCSSTJ///ISSZP///5CTJ/////ITJ/////ITJ/+B//ITJ/+B//ITJ//+P/ITJ/////ISZP///5CSRJ///ICSQJJJJACSYBJJIBCSYABgABCSYABgABCSYAJAABCSYANgABCSYBtgABCSYNtsABCSYBtgABCSYAMAABCSYAAAABCSZJJJJJCQ=="), this.x, this.y);
            }
        }
    };

    let date;
    let fractionMs = 3600000 / config.fractions_of_hour;

    let chime = function () {
        date = new Date();
        let hourFrac = Math.floor(date.getMinutes() / (60 / config.fractions_of_hour));

        if (hourFrac == 0) { // if it's an o'clock hour
            let chimeHour = (config.twelve_hour ? date.getHours() % 12 : date.getHours());
            if (chimeHour == 0) (config.twelve_hour ? chimeHour += 12 : chimeHour += 24);

            Bangle.buzz(config.hour_attention_buzz_ms).then(() => { // initial buzz
                setTimeout(hourChime, config.wait_ms, chimeHour); // wait a period before doing the first chime
            });
        } else { // if it's a fraction of an hour
            fractionChime(hourFrac);
        }

        queueNextChime();
    };

    let hourChime = function (hoursLeftToChime) {
        hoursLeftToChime--;
        Bangle.buzz(config.hour_count_buzz_ms).then(() => { // recursive. buzz and wait to do the next buzz.
            if (hoursLeftToChime > 0) {
                setTimeout(hourChime, config.wait_ms, hoursLeftToChime);
            } else if (config.twelve_hour) { // once finished with the hour count
                setTimeout(meridianChime, config.wait_ms, (date.getHours() >= 12)); // if in twelve hour mode, queue up the meridian chime.
            }
        });
    };

    let fractionChime = function (fractionsLeftToChime) {
        fractionsLeftToChime--;
        Bangle.buzz(config.fraction_count_buzz_ms).then(() => { // recursive. buzz and wait to do the next buzz.
            if (fractionsLeftToChime > 0) setTimeout(fractionChime, config.wait_ms, fractionsLeftToChime);
        });
    };

    let meridianChime = function (meridian) {
        if ((config.swap_meridian ? !meridian : meridian)) { // default: if PM
                Bangle.buzz(config.meridian_buzz_ms).then(setTimeout(Bangle.buzz, config.meridian_buzz_wait_ms, config.meridian_buzz_ms)); // buzz once, wait, buzz again.
        } else { // default: if AM
                Bangle.buzz(config.meridian_buzz_ms); // buzz once.
        }
    };

    let queueNextChime = function () {
        let msUntilNextFraction = fractionMs - (Date.now() % fractionMs);
        setTimeout(chime, msUntilNextFraction);
    };

    queueNextChime();
})()
