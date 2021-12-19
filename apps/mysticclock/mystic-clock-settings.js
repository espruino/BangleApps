// make sure to enclose the function in parentheses
(function (back) {

    const settings = require('Storage').readJSON('mysticclock.json',1)||{};
    const colors = ['White', 'Blue', 'Green', 'Purple', 'Red', 'Teal', 'Yellow'];
    const offon = ['Off','On'];
    const onoff = ['On','Off'];

    function save(key, value) {
        settings[key] = value;
        require('Storage').writeJSON('mysticclock.json',settings);
    }

    const appMenu = {
        '': {'title': 'Clock Settings'},
        '< Back': back,
        'Color': {
            value: 0|settings['color'],
            min:0,
            max:6,
            format: m => colors[m],
            onchange: m => {save('color', m)}
        },
        '12 Hour Clock': {
            value: 0|settings['use12Hour'],
            min:0,
            max:1,
            format: m => offon[m],
            onchange: m => {save('use12Hour', m)}
        },
        'Use Locale': {
            value: 0|settings['useLocale'],
            min:0,
            max:1,
            format: m => onoff[m],
            onchange: m => {save('useLocale', m)}
        }
    };
    E.showMenu(appMenu)

})
