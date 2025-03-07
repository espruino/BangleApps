{
    let s = require('Storage');
    let settings = Object.assign(
        {
            showClocks: false,
            scrollbar: true
        },
        s.readJSON('cutelauncher.settings.json', true) || {}
    );

    // Borrowed caching from Icon Launcher, code by halemmerich.
    let launchCache = s.readJSON('launch.cache.json', true) || {};
    let launchHash = s.hash(/\.info/) + JSON.stringify(settings).length;
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

    const ITEM_HEIGHT = 95;

    // Create scroll indicator overlay
    const overlayWidth = 30;
    const overlayHeight = 35;
    const overlay = Graphics.createArrayBuffer(overlayWidth, overlayHeight, 16, { msb: true });

    // Function to create app backdrop
    function createAppBackdrop(y) {
        return [
            58, y + 5,    // Top edge
            118, y + 5,
            133 - 15 * 0.7, y + 5,
            133 - 15 * 0.4, y + 5 + 15 * 0.1,
            133 - 15 * 0.1, y + 5 + 15 * 0.4,  // Top right corner
            133, y + 5 + 15 * 0.7,
            133, y + 20,
            133, y + 75,    // Right edge
            133, y + 90 - 15 * 0.7,
            133 - 15 * 0.1, y + 90 - 15 * 0.4,
            133 - 15 * 0.4, y + 90 - 15 * 0.1,  // Bottom right corner
            133 - 15 * 0.7, y + 90,
            118, y + 90,
            58, y + 90,    // Bottom edge
            43 + 15 * 0.7, y + 90,
            43 + 15 * 0.4, y + 90 - 15 * 0.1,
            43 + 15 * 0.1, y + 90 - 15 * 0.4,  // Bottom left corner
            43, y + 90 - 15 * 0.7,
            43, y + 75,
            43, y + 20,    // Left edge
            43, y + 5 + 15 * 0.7,
            43 + 15 * 0.1, y + 5 + 15 * 0.4,
            43 + 15 * 0.4, y + 5 + 15 * 0.1,  // Top left corner
            43 + 15 * 0.7, y + 5
        ];
    }

    // Helper function for creating rounded rectangle points
    function createRoundedRectPoints(x1, y1, x2, y2, r) {
        return [
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
        ];
    }

    // Update initScrollIndicator to use the new function
    function initScrollIndicator() {
        overlay.setBgColor(g.theme.bg).clear();
        const points = createRoundedRectPoints(0, 0, overlayWidth, overlayHeight, 10);
        overlay.setColor(g.theme.bgH).fillPoly(points);

        // Add horizontal lines for scroll thumb aesthetic with outlines
        const lineY1 = overlayHeight / 3;
        const lineY2 = overlayHeight * 2 / 3;
        const lineLeft = 9;
        const lineRight = overlayWidth - 9;

        // Draw inner lines (increased from ±1 to ±2)
        overlay.setColor(g.theme.fg2);
        overlay.fillRect(lineLeft - 2, lineY1 - 1, lineRight + 2, lineY1 + 1);
        overlay.fillRect(lineLeft - 2, lineY2 - 1, lineRight + 2, lineY2 + 1);

        overlay.fillRect(lineLeft, lineY1 - 2, lineRight, lineY1 + 2);
        overlay.fillRect(lineLeft, lineY2 - 2, lineRight, lineY2 + 2);
    }
    initScrollIndicator();

    // Function to update scroll indicator
    function updateScrollIndicator(idx) {
        const marginX = 1;
        const marginY = 5;
        let scrollPercent = (idx) / (apps.length - 1);
        let scrollableHeight = g.getHeight() - marginY * 2 - overlayHeight;
        let indicatorY = scrollPercent * scrollableHeight + marginY;

        Bangle.setLCDOverlay(overlay, g.getWidth() - overlayWidth - marginX, indicatorY, { id: "scrollIndicator" });
    }

    let prev_idx = -1;
    let second_call = false;

    E.showScroller({
        h: ITEM_HEIGHT,
        c: apps.length,
        draw: (idx, rect) => {
            g.setFontAlign(0, -1, 0).setFont('8x16');
            // Calculate icon dimensions
            let icon = apps[idx].icon;
            let iconSize = 48;
            // Define rectangle size (independent of icon size)
            const rectSize = 80;
            const rectX = 48;

            // Draw rounded rectangle background using the new function
            const points = createAppBackdrop(rect.y);
            g.setColor(g.theme.bg2).fillPoly(points);

            // Draw icon centered in the top portion
            let iconPadding = 8;
            // Center icon within the rectangle
            let iconXInRect = rectX + (rectSize - iconSize) / 2;
            g.setColor(g.theme.fg).setBgColor(g.theme.bg2).drawImage(icon, iconXInRect, rect.y + iconPadding + 8);

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
            let textY = rect.y + iconPadding + iconSize + 15;
            g.drawString(text, rectX + rectSize / 2, textY);
            if (idx != prev_idx && !second_call && settings.scrollbar) {  
                updateScrollIndicator(idx);
                if (prev_idx == -1) second_call = true;
                prev_idx = idx;
            } else if (second_call) second_call = false;
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
            // Clear the scroll overlay
            Bangle.setLCDOverlay();
        }
    });

    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
    // Add lock handler to show clock when locked
    Bangle.on('lock', (on) => { if (on) Bangle.showClock(); });
}
