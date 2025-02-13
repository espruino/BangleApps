{
    var loader = require('folderlaunch-configLoad.js');
    var storage_1 = require('Storage');
    var FOLDER_ICON_1 = require("heatshrink").decompress(atob("mEwwMA///wAJCAoPAAongAonwAon4Aon8Aon+Aon/AooA/AH4A/AFgA="));
    var config_1 = loader.getConfig();
    var timeout_1;
    var resetTimeout_1 = function () {
        if (timeout_1) {
            clearTimeout(timeout_1);
        }
        if (config_1.timeout != 0) {
            timeout_1 = setTimeout(function () {
                Bangle.showClock();
            }, config_1.timeout);
        }
    };
    var folderPath_1 = [];
    var getFolder_1 = function (folderPath) {
        var result = config_1.rootFolder;
        for (var _i = 0, folderPath_2 = folderPath; _i < folderPath_2.length; _i++) {
            var folderName = folderPath_2[_i];
            result = result.folders[folderName];
        }
        nPages_1 = Math.ceil((result.apps.length + Object.keys(result.folders).length) / (config_1.display.rows * config_1.display.rows));
        return result;
    };
    var folder_1 = getFolder_1(folderPath_1);
    var getFontSize_1 = function (length, maxWidth, minSize, maxSize) {
        var size = Math.floor(maxWidth / length);
        size *= (20 / 12);
        if (size < minSize)
            return minSize;
        else if (size > maxSize)
            return maxSize;
        else
            return Math.floor(size);
    };
    var grid_1 = [];
    for (var x = 0; x < config_1.display.rows; x++) {
        grid_1.push([]);
        for (var y = 0; y < config_1.display.rows; y++) {
            grid_1[x].push({
                type: 'empty',
                id: ''
            });
        }
    }
    var render_1 = function () {
        var gridSize = config_1.display.rows * config_1.display.rows;
        var startIndex = page_1 * gridSize;
        for (var i = 0; i < gridSize; i++) {
            var y = Math.floor(i / config_1.display.rows);
            var x = i % config_1.display.rows;
            var folderIndex = startIndex + i;
            var appIndex = folderIndex - Object.keys(folder_1.folders).length;
            if (folderIndex < Object.keys(folder_1.folders).length) {
                grid_1[x][y].type = 'folder';
                grid_1[x][y].id = Object.keys(folder_1.folders)[folderIndex];
            }
            else if (appIndex < folder_1.apps.length) {
                grid_1[x][y].type = 'app';
                grid_1[x][y].id = folder_1.apps[appIndex];
            }
            else
                grid_1[x][y].type = 'empty';
        }
        var squareSize = (g.getHeight() - 24) / config_1.display.rows;
        if (!config_1.display.icon && !config_1.display.font)
            config_1.display.font = 12;
        g.clearRect(0, 24, g.getWidth(), g.getHeight())
            .reset()
            .setFontAlign(0, -1);
        var empty = true;
        for (var x = 0; x < config_1.display.rows; x++) {
            for (var y = 0; y < config_1.display.rows; y++) {
                var entry = grid_1[x][y];
                var icon = void 0;
                var text = void 0;
                var fontSize = void 0;
                switch (entry.type) {
                    case 'app': {
                        var app_1 = storage_1.readJSON(entry.id + '.info', false);
                        icon = storage_1.read(app_1.icon);
                        text = app_1.name;
                        empty = false;
                        fontSize = config_1.display.font;
                        break;
                    }
                    case 'folder': {
                        icon = FOLDER_ICON_1;
                        text = entry.id;
                        empty = false;
                        fontSize = config_1.display.font ? config_1.display.font : 12;
                        break;
                    }
                    default:
                        continue;
                }
                var iconSize = config_1.display.icon ? Math.max(0, squareSize - fontSize) : 0;
                var iconScale = iconSize / 48;
                var posX = 12 + (x * squareSize);
                var posY = 24 + (y * squareSize);
                if (config_1.display.icon && iconSize != 0)
                    try {
                        g.drawImage(icon, posX + (squareSize - iconSize) / 2, posY, { scale: iconScale });
                    }
                    catch (error) {
                        console.log("Failed to draw icon for ".concat(text, ": ").concat(error));
                        console.log(icon);
                    }
                if (fontSize)
                    g.setFont('Vector', getFontSize_1(text.length, squareSize, 6, squareSize - iconSize))
                        .drawString(text, posX + (squareSize / 2), posY + iconSize);
            }
        }
        if (empty)
            E.showMessage('Folder is empty. Swipe from left, back button, or BTN1 to go back.');
        if (nPages_1 > 1) {
            var barSize = (g.getHeight() - 24) / nPages_1;
            var barTop = 24 + (page_1 * barSize);
            g.fillRect(g.getWidth() - 8, barTop, g.getWidth() - 4, barTop + barSize);
        }
    };
    var onTouch = function (_button, xy) {
        var x = Math.floor((xy.x - 12) / ((g.getWidth() - 24) / config_1.display.rows));
        if (x < 0)
            x = 0;
        else if (x >= config_1.display.rows)
            x = config_1.display.rows - 1;
        var y = Math.floor((xy.y - 24) / ((g.getHeight() - 24) / config_1.display.rows));
        if (y < 0)
            y = 0;
        else if (y >= config_1.display.rows)
            y = config_1.display.rows - 1;
        var entry = grid_1[x][y];
        switch (entry.type) {
            case "app": {
                buzz_1();
                var infoFile = storage_1.readJSON(entry.id + '.info', false);
                load(infoFile.src);
                break;
            }
            case "folder": {
                buzz_1();
                resetTimeout_1();
                page_1 = 0;
                folderPath_1.push(entry.id);
                folder_1 = getFolder_1(folderPath_1);
                render_1();
                break;
            }
            default: {
                resetTimeout_1();
                break;
            }
        }
    };
    var page_1 = 0;
    var nPages_1;
    var onSwipe = function (lr, ud) {
        if (lr == 1 && ud == 0) {
            onBackButton_1();
            return;
        }
        else if (ud == 1) {
            resetTimeout_1();
            if (page_1 == 0) {
                buzz_1(200);
                return;
            }
            else
                page_1--;
        }
        else if (ud == -1) {
            resetTimeout_1();
            if (page_1 == nPages_1 - 1) {
                buzz_1(200);
                return;
            }
            else
                page_1++;
        }
        render_1();
    };
    var onBackButton_1 = function () {
        buzz_1();
        if (folderPath_1.length == 0)
            Bangle.showClock();
        else {
            folderPath_1.pop();
            folder_1 = getFolder_1(folderPath_1);
            resetTimeout_1();
            page_1 = 0;
            render_1();
        }
    };
    var buzz_1 = config_1.disableVibration ? function () { } : Bangle.buzz;
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    Bangle.setUI({
        mode: 'custom',
        back: onBackButton_1,
        btn: onBackButton_1,
        swipe: onSwipe,
        touch: onTouch,
        remove: function () { if (timeout_1)
            clearTimeout(timeout_1); }
    });
    resetTimeout_1();
    render_1();
}
