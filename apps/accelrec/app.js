//var acc;
var HZ = 100;
var SAMPLES = 6 * HZ; // 6 seconds
var SCALE = 2000;
var THRESH = 1.4;
var accelx = new Int16Array(SAMPLES);
var accely = new Int16Array(SAMPLES); // North
var accelz = new Int16Array(SAMPLES); // Into clock face
var timestep = new Int16Array(SAMPLES); // Into clock face
var accelIdx = 0;
var lastAccel;
var timestep_start = 0;

function accelHandlerTrigger(a) {
    "ram"
    if (a.mag * 2 > THRESH) { // *2 because 8g mode
        timestep_start = getTime();
        g.drawString("Recording", g.getWidth() / 2, g.getHeight() / 2, 1);
        Bangle.removeListener('accel', accelHandlerTrigger);
        Bangle.on('accel', accelHandlerRecord);
        lastAccel.forEach(accelHandlerRecord);
        accelHandlerRecord(a);
    } else {
        if (lastAccel.length > 10) lastAccel.shift();
        lastAccel.push(a);
    }
}

function accelHandlerRecord(a) {
    "ram"
    var i = accelIdx++;
    accelx[i] = a.x * SCALE * 2; // *2 because of 8g mode
    accely[i] = -a.y * SCALE * 2;
    accelz[i] = a.z * SCALE * 2;
    timestep[i] = (getTime() - timestep_start) * 1000;
    if (accelIdx >= SAMPLES) recordStop();
}

function recordStart() {
    "ram"
    Bangle.setLCDTimeout(0); // force LCD on
    accelIdx = 0;
    lastAccel = [];
    Bangle.accelWr(0x18, 0b01110100); // off, +-8g
    Bangle.accelWr(0x1B, 0x03 | 0x40); // 100hz output, ODR/2 filter
    Bangle.accelWr(0x18, 0b11110100); // +-8g
    Bangle.setPollInterval(10); // 100hz input
    setTimeout(function() {
        Bangle.on('accel', accelHandlerTrigger);
        g.clear(1).setFont("6x8", 2).setFontAlign(0, 0);
        g.drawString("Waiting", g.getWidth() / 2, g.getHeight() / 2);
    }, 200);
}


function recordStop() {
    "ram"
    //console.log("Length:",getTime()-tStart);
    Bangle.setPollInterval(80); // default poll interval
    Bangle.accelWr(0x18, 0b01101100); // off, +-4g
    Bangle.accelWr(0x1B, 0x0); // default 12.5hz output
    Bangle.accelWr(0x18, 0b11101100); // +-4g
    Bangle.removeListener('accel', accelHandlerRecord);
    E.showMessage("Finished");
    showData(true);
}


function showData(save_file) {
    g.clear(1);
    let csv_files_N = require("Storage").list(/^acc.*\.csv$/).length;
    let w_full = g.getWidth();
    let h = g.getHeight();
    var w = g.getWidth() - 20; // width
    var m = g.getHeight() / 2; // middle
    var s = 12; // how many pixels per G
    g.fillRect(9, 0, 9, g.getHeight());
    g.setFontAlign(0, 0);
    for (var l = -8; l <= 8; l++)
        g.drawString(l, 5, m - l * s);

    function plot(a) {
        g.moveTo(10, m - a[0] * s / SCALE);
        for (var i = 0; i < SAMPLES; i++)
            g.lineTo(10 + i * w / SAMPLES, m - a[i] * s / SCALE);
    }
    g.setColor("#FFFA5F");
    plot(accelz);
    g.setColor("#ff0000");
    plot(accelx);
    g.setColor("#00ff00");
    plot(accely);

    // work out stats
    var maxAccel = 0;
    var tStart = SAMPLES,
        tEnd = 0;
    var max_YZ = 0;
    for (var i = 0; i < SAMPLES; i++) {
        var a = Math.abs(accely[i] / SCALE);
        let a_yz = Math.sqrt(Math.pow(accely[i] / SCALE, 2) + Math.pow(accelz[i] / SCALE, 2));
        if (a > 0.1) {
            if (i < tStart) tStart = i;
            if (i > tEnd) tEnd = i;
        }
        if (a > maxAccel) maxAccel = a;
        if (a_yz > max_YZ) max_YZ = a_yz;
    }
    g.reset();
    g.setFont("6x8").setFontAlign(1, 0);
    g.drawString("Max X Accel: " + maxAccel.toFixed(2) + " g", g.getWidth() - 14, g.getHeight() - 50);
    g.drawString("Max YZ Accel: " + max_YZ.toFixed(2) + " g", g.getWidth() - 14, g.getHeight() - 40);
    g.drawString("Time moving: " + (tEnd - tStart) / HZ + " s", g.getWidth() - 14, g.getHeight() - 30);
    g.setFont("6x8", 2).setFontAlign(0, 0);
    g.drawString("File num: " + (csv_files_N + 1), w_full / 2, h - 20);
    g.setFont("6x8").setFontAlign(0, 0, 1);
    g.drawString("FINISH", g.getWidth() - 4, g.getHeight() / 2);
    setWatch(function() {
        if (save_file) showSaveMenu(); // when select only plot, don't ask for save option
        else showMenu();
    }, global.BTN2 ? BTN2 : BTN);
}

function showBig(txt) {
    g.clear(1);
    g.setFontVector(80).setFontAlign(0, 0);
    g.drawString(txt, g.getWidth() / 2, g.getHeight() / 2);
    g.flip();
}

function countDown() {
    showBig(3);
    setTimeout(function() {
        showBig(2);
        setTimeout(function() {
            showBig(1);
            setTimeout(function() {
                recordStart();
            }, 800);
        }, 1000);
    }, 1000);
}

function showMenu() {
    Bangle.setLCDTimeout(10); // set timeout for LCD in menu
    var menu = {
        "": { title: "Acceleration Rec" },
        "Start": function() {
            E.showMenu();
            if (accelIdx == 0) countDown();
            else E.showPrompt("Overwrite Recording?").then(ok => {
                if (ok) countDown();
                else showMenu();
            });
        },
        "Plot": function() {
            E.showMenu();
            if (accelIdx) showData(false);
            else E.showAlert("No Data").then(() => {
                showMenu();
            });
        },
        "Storage": function() {
            E.showMenu();
            if (require("Storage").list(/^acc.*\.csv$/).length)
                StorageMenu();
            else
                E.showAlert("No Data").then(() => {
                    showMenu();
                });
        },
        "Exit": function() {
            load();
        },
    };
    E.showMenu(menu);
}

function showSaveMenu() {
    E.showPrompt("Save recording?").then(ok => {
        if (ok)
            SaveFile();
        else
            showMenu();
    });
}

function SaveFile() {
    let csv_files_N = require("Storage").list(/^acc.*\.csv$/).length;
    //if (csv_files_N > 20)
    //  E.showMessage("Storage is full");
    //  showMenu();
    let csv = "";
    let date = new Date();
    let fn = "accelrec_" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "_" + (csv_files_N + 1) + ".csv";
    E.showMessage("Saveing to file \n" + fn);
    for (var i = 0; i < SAMPLES; i++)
        csv += `${timestep[i]},${accelx[i]/SCALE},${accely[i]/SCALE},${accelz[i]/SCALE}\n`;
    require("Storage").write(fn, csv);
    showMenu();
}

//Show saved csv files
function StorageMenu() {
    var menu = {
        "": {
            title: "Storage"
        }
    };
    let csv_files = require("Storage").list(/^acc.*\.csv$/);
    var inx = 0;
    csv_files.forEach(fn => {
        inx++;
        menu[inx + ". " + fn] = function() {
            StorageOptions(fn);
        };
    });
    menu["< Back"] = function() {
        showMenu();
    };
    E.showMenu(menu);
}

function StorageOptions(file) {
    let menu = {
        "": {
            title: "Options"
        },
        "Plot": function() {
            showMenu();
        },
        "Delete": function() {
            E.showMenu();
            E.showPrompt("Delete recording?").then(ok => {
                if (ok)
                    DeleteRecord(file);
                else
                    StorageMenu();
            });
        },
        "< Back": function() {
            StorageMenu();
        },
    };
    E.showMenu(menu);
}

function DeleteRecord(file) {
    E.showMessage("Deleteing file \n" + file);
    require("Storage").erase(file);
    StorageMenu();
}
showMenu();