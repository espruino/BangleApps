const storage = require('Storage');

let imageFiles = storage.list(/^gal-.*\.img/).sort();

let imageMenu = { '': { 'title': 'Gallery' } };

for (let fileName of imageFiles) {
    let displayName = fileName.substr(4, fileName.length - 8);          // Trim off the 'gal-' and '.img' for a friendly display name
    imageMenu[displayName] = eval(`() => { drawImage("${fileName}"); }`);    // Unfortunately, eval is the only reasonable way to do this
}

let cachedOptions = Bangle.getOptions();    // We will change the backlight and timeouts later, and need to restore them when displaying the menu
let backlightSetting = storage.readJSON('setting.json').brightness; // LCD brightness is not included in there for some reason

let angle = 0;              // Store the angle of rotation
let image;                  // Cache the image here because we access it in multiple places

let appsettings = storage.readJSON('setting.json') || {};
let disablePowerSaving = appsettings.disablePowerSaving || true; // Default to false if not set

function drawMenu() {
    Bangle.removeListener('touch', drawMenu);   // We no longer want touching to reload the menu
    Bangle.setOptions(cachedOptions);           // The drawImage function set no timeout, undo that
    Bangle.setLCDBrightness(backlightSetting);  // Restore backlight
    image = undefined;                          // Delete the image from memory

    E.showMenu(imageMenu);
}
//eslint-disable-next-line no-unused-vars
function drawImage(fileName) {
    E.showMenu();   // Remove the menu to prevent it from breaking things
    setTimeout(() => { Bangle.on('touch', drawMenu); }, 300);   // Touch the screen to go back to the image menu (300ms timeout to allow user to lift finger)
    if (disablePowerSaving) {    
        Bangle.setOptions({
            lockTimeout: 0,
            lcdPowerTimeout: 0,
            backlightTimeout: 0
        });
    }
    Bangle.setLCDBrightness(1);     // Full brightness
    image = eval(storage.read(fileName));   // Sadly, the only reasonable way to do this
    g.clear().reset().setBgColor(0).setColor("#fff").drawImage(image, 88, 88, { rotate: angle });
}

setWatch(info => {
    if (image) {
        if (angle == 0) angle = Math.PI;
        else angle = 0;
        Bangle.buzz();

        g.clear().reset().setBgColor(0).setColor("#fff").drawImage(image, 88, 88, { rotate: angle })
    }
}, BTN1, { repeat: true });

// We don't load the widgets because there is no reasonable way to unload them
drawMenu();
