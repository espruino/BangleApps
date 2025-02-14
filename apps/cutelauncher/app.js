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

    const ITEM_HEIGHT = 100;

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
            let maxSize = 45;
            let scale = Math.min(maxSize / iconWidth, maxSize / iconHeight);
            let scaledHeight = Math.floor(iconHeight * scale);

            // Center the icon horizontally
            let iconX = rect.x + (rect.w - maxSize) / 2;

            // Define rectangle size (independent of icon size)
            const rectSize = 80;
            const rectX = rect.x + (rect.w - rectSize) / 2;

            // Draw rounded rectangle background using polygon
            g.setColor(g.theme.bg2);
            const r = 15;
            const x1 = rectX - 5;
            const y1 = rect.y + 5;
            const x2 = rectX + rectSize + 5;
            const y2 = rect.y + rectSize + 10;

            // Create points for a rounded rectangle (approximating curves with more points per corner)
            g.fillPoly([
                x1 + r, y1,    // Top edge
                x2 - r, y1,
                x2 - r * 0.7, y1,
                x2 - r * 0.4, y1 + r * 0.1,
                x2 - r * 0.1, y1 + r * 0.4,  // Top right corner
                x2, y1 + r * 0.7,
                x2, y1 + r,
                x2, y2 - r,    // Right edge
                x2, y2 - r * 0.7,
                x2 - r * 0.1, y2 - r * 0.4,
                x2 - r * 0.4, y2 - r * 0.1,  // Bottom right corner
                x2 - r * 0.7, y2,
                x2 - r, y2,
                x1 + r, y2,    // Bottom edge
                x1 + r * 0.7, y2,
                x1 + r * 0.4, y2 - r * 0.1,
                x1 + r * 0.1, y2 - r * 0.4,  // Bottom left corner
                x1, y2 - r * 0.7,
                x1, y2 - r,
                x1, y1 + r,    // Left edge
                x1, y1 + r * 0.7,
                x1 + r * 0.1, y1 + r * 0.4,
                x1 + r * 0.4, y1 + r * 0.1,  // Top left corner
                x1 + r * 0.7, y1
            ]);
            g.setColor(g.theme.fg);

            // Draw icon centered in the top portion
            let iconPadding = 8;
            // Center icon within the rectangle
            let iconXInRect = rectX + (rectSize - maxSize) / 2;
            g.setBgColor(g.theme.bg2).drawImage(icon, iconXInRect, rect.y + iconPadding + 8, { scale: scale });

            // Draw app name with ellipsis if too long
            const maxWidth = rectSize - 8;
            let text = apps[idx].name;
            let textWidth = g.stringWidth(text);
            if (textWidth > maxWidth) {
                const ellipsis = "...";
                const ellipsisWidth = g.stringWidth(ellipsis);
                while (textWidth + ellipsisWidth > maxWidth && text.length > 0) {
                    text = text.slice(0, -1);
                    textWidth = g.stringWidth(text);
                }
                text = text + ellipsis;
            }
            let textY = rect.y + iconPadding + scaledHeight + 15;
            g.drawString(text, rectX + rectSize / 2, textY);
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
