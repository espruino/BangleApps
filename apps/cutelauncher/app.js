{
    let settings = Object.assign(
        {
            showClocks: false,
            showLaunchers: false,
            timeOut: 10,
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
        if (app.icon) app.icon = s.read(app.icon);
        else app.icon = s.read('placeholder.img');
    });

    require('Font8x16').add(Graphics);
    Bangle.drawWidgets = () => { };
    Bangle.loadWidgets = () => { };

    const ITEM_HEIGHT = 88;

    E.showScroller({
        h: ITEM_HEIGHT,
        c: apps.length,
        draw: (idx, rect) => {
            g.setColor(g.theme.fg);
            g.setFontAlign(0, -1, 0).setFont('8x16');

            // Calculate icon dimensions
            let icon = apps[idx].icon;
            let iconWidth = icon.width || 48;
            let iconHeight = icon.height || 48;
            let maxSize = 48;
            let scale = Math.min(maxSize / iconWidth, maxSize / iconHeight);
            let scaledHeight = Math.floor(iconHeight * scale);

            // Center the icon horizontally
            let iconX = rect.x + (rect.w - iconWidth) / 2;
            g.drawImage(icon, iconX, rect.y);

            // Draw app name
            let text = g.wrapString(apps[idx].name, rect.w).join('\n');

            // Position text below icon with padding
            let textY = rect.y + scaledHeight + 4;
            g.drawString(text, rect.x + rect.w / 2, textY);
        },
        select: (idx) => {
            // Launch the selected app
            load(apps[idx].src);
        },
        remove: () => {
            // Remove button handler
            setWatch(() => { }, BTN1);
            // Remove lock handler
            Bangle.removeListener('lock');
        }
    });

    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
    // Add lock handler to show clock when locked
    Bangle.on('lock', (on) => { if (on) Bangle.showClock(); });
}
