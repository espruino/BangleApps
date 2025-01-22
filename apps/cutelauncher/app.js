{
    let settings = Object.assign(
        {
            showClocks: false,
            showLaunchers: false,
            direct: false,
            swipeExit: true,
            timeOut: 'Off',
        },
        require('Storage').readJSON('cutelauncher.json', true) || {}
    );

    let s = require('Storage');
    // Borrowed caching from Icon Launcher, code by halemmerich.
    let launchCache = s.readJSON('launch.cache.json', true) || {};
    let launchHash = require('Storage').hash(/\.info/);
    if (launchCache.hash != launchHash) {
        launchCache = {
            hash: launchHash,
            apps: s
                .list(/\.info$/)
                .map((app) => {
                    var a = s.readJSON(app, 1);
                    return a && { name: a.name, type: a.type, icon: a.icon, sortorder: a.sortorder, src: a.src };
                })
                .filter((app) => app && (app.type == 'app' || (app.type == 'clock' && settings.showClocks) || !app.type))
                .sort((a, b) => {
                    var n = (0 | a.sortorder) - (0 | b.sortorder);
                    if (n) return n; // do sortorder first
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                }),
        };
        s.writeJSON('launch.cache.json', launchCache);
    }
    let apps = launchCache.apps;
    apps.forEach((app) => {
        if (app.icon) app.icon = s.read(app.icon); // should just be a link to a memory area
        else app.icon = s.read('placeholder.img');
    });

    let Napps = apps.length;
    let Npages = Math.ceil(Napps / 4);
    let maxPage = Npages - 1;
    let selected = -1;
    let oldselected = -1;
    let page = 0;

    require('Font8x16').add(Graphics);
    Bangle.drawWidgets = () => { };
    Bangle.loadWidgets = () => { };

    let drawIcon = function (p, n, selected) {
        let coords = { x: (n % 2) * 88, y: n > 1 ? 88 : 0, w: 88, h: 88 };
        if (selected) {
            g.setColor(g.theme.bgH).fillRect(coords);
            g.setColor(g.theme.fgH);
        } else {
            g.setColor(g.theme.bg).fillRect(coords);
            g.setColor(g.theme.fg);
        }

        try {
            let icon = apps[p * 4 + n].icon;
            let iconWidth = icon.width || 48;
            let iconHeight = icon.height || 48;
            let maxSize = 48;
            let scale = Math.min(maxSize / iconWidth, maxSize / iconHeight);
            let scaledWidth = Math.floor(iconWidth * scale);
            let scaledHeight = Math.floor(iconHeight * scale);

            // Get text height to center everything
            g.setFontAlign(0, -1, 0).setFont('8x16');
            let text = g.wrapString(apps[p * 4 + n].name, 88).join('\n');
            let textHeight = text.split('\n').length * 16;

            let totalHeight = scaledHeight + 4 + textHeight; // 4px padding between icon and text
            let startY = coords.y + (88 - totalHeight) / 2;

            // Draw icon centered horizontally and as part of vertical group
            let iconX = coords.x + (88 - scaledWidth) / 2;
            let iconY = startY;
            g.drawImage(icon, iconX, iconY, { scale: scale });

            // Draw text below icon
            g.drawString(text, coords.x + coords.w / 2, startY + scaledHeight + 4);
        } catch (e) { }
    };

    let drawPage = function (p) {
        g.reset();
        g.setColor(g.theme.bg).fillRect(0, 0, 175, 175);
        for (let i = 0; i < 4; i++) {
            if (!apps[p * 4 + i]) return i;
            drawIcon(p, i, selected == i && !settings.direct);
        }
        g.flip();
    };

    drawPage(0);

    let swipeListenerDt = function (dirLeftRight, dirUpDown) {
        updateTimeoutToClock();
        selected = -1;
        oldselected = -1;
        if (settings.swipeExit && dirLeftRight == 1) Bangle.showClock();
        if (dirUpDown == -1 || dirLeftRight == -1) {
            ++page;
            if (page > maxPage) page = 0;
            drawPage(page);
        } else if (dirUpDown == 1 || (dirLeftRight == 1 && !settings.swipeExit)) {
            --page;
            if (page < 0) page = maxPage;
            drawPage(page);
        }
    };

    let isTouched = function (p, n) {
        if (n < 0 || n > 3) return false;
        let x1 = (n % 2) * 88;
        let y1 = n > 1 ? 88 : 0;
        let x2 = x1 + 88;
        let y2 = y1 + 88;
        return p.x > x1 && p.y > y1 && p.x < x2 && p.y < y2;
    };

    let touchListenerDt = function (_, p) {
        updateTimeoutToClock();
        let i;
        for (i = 0; i < 4; i++) {
            if (page * 4 + i < Napps) {
                if (isTouched(p, i)) {
                    drawIcon(page, i, true && !settings.direct);
                    if (selected >= 0 || settings.direct) {
                        if (selected != i && !settings.direct) {
                            drawIcon(page, selected, false);
                        } else {
                            load(apps[page * 4 + i].src);
                        }
                    }
                    selected = i;
                    break;
                }
            }
        }
        if ((i == 4 || page * 4 + i > Napps) && selected >= 0) {
            drawIcon(page, selected, false);
            selected = -1;
        }
    };

    Bangle.setUI({
        mode: 'custom',
        swipe: swipeListenerDt,
        touch: touchListenerDt,
        remove: () => {
            if (timeoutToClock) clearTimeout(timeoutToClock);
        },
    });

    // taken from Icon Launcher with minor alterations
    let timeoutToClock;
    const updateTimeoutToClock = function () {
        if (settings.timeOut != 'Off') {
            let time = parseInt(settings.timeOut); //the "s" will be trimmed by the parseInt
            if (timeoutToClock) clearTimeout(timeoutToClock);
            timeoutToClock = setTimeout(Bangle.showClock, time * 1000);
        }
    };
    updateTimeoutToClock();

    if (Bangle.backHandler) clearWatch(Bangle.backHandler);
    Bangle.backHandler = setWatch(Bangle.showClock, BTN1, { debounce: 100 });
} // end of app scope

// setUI now also needs to clear up our back button touch handler
Bangle.setUI = (old => function () {
    if (Bangle.backHandler) clearWatch(Bangle.backHandler);
    delete Bangle.backHandler;
    return old.apply(this, arguments);
})(Bangle.setUI);