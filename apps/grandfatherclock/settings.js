(function(back) {

    const configFile = "grandfatherclock.json";

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
    }, require('Storage').readJSON("grandfatherclock.json", true) || {});

    let writeConfig = function() {
        require('Storage').writeJSON(configFile, config);
    };

    E.showMenu({
        "": {"title" : "Grandfather Clock"},
        "< Back": () => back(),
        "Draw widget": {
            value: config.draw_widget,
            onchange: v => {
                config.draw_widget = v;
                writeConfig();
            }
        },
        "12 hour": {
            value: config.twelve_hour,
            onchange: v => {
                config.twelve_hour = v;
                writeConfig();
            }
        },"Swap meridian": {
            value: config.swap_meridian,
            onchange: v => {
                config.swap_meridian = v;
                writeConfig();
            }
        },"Hr attn. buzz length (ms)": {
            value: config.hour_attention_buzz_ms,
            onchange: v => {
                config.hour_attention_buzz_ms = v;
                writeConfig();
            }
        },"Hr count buzz (ms)": {
            value: config.hour_count_buzz_ms,
            onchange: v => {
                config.hour_count_buzz_ms = v;
                writeConfig();
            }
        },"Frac. count buzz (ms)": {
            value: config.fraction_count_buzz_ms,
            onchange: v => {
                config.fraction_count_buzz_ms = v;
                writeConfig();
            }
        },"Fracs. of hour": {
            value: config.fractions_of_hour,
            onchange: v => {
                config.fractions_of_hour = v;
                writeConfig();
            }
        },"Count wait (ms)": {
            value: config.wait_ms,
            onchange: v => {
                config.wait_ms = v;
                writeConfig();
            }
        },"Meridian buzz (ms)": {
            value: config.meridian_buzz_ms,
            onchange: v => {
                config.meridian_buzz_ms = v;
                writeConfig();
            }
        },"Meridian wait (ms)": {
            value: config.meridian_buzz_wait_ms,
            onchange: v => {
                config.meridian_buzz_wait_ms = v;
                writeConfig();
            }
        }
    });

})
