E.showMenu = function (items) {
    var RectRnd = function (x1, y1, x2, y2, r) {
        var pp = [];
        pp.push.apply(pp, g.quadraticBezier([x2 - r, y1, x2, y1, x2, y1 + r]));
        pp.push.apply(pp, g.quadraticBezier([x2, y2 - r, x2, y2, x2 - r, y2]));
        pp.push.apply(pp, g.quadraticBezier([x1 + r, y2, x1, y2, x1, y2 - r]));
        pp.push.apply(pp, g.quadraticBezier([x1, y1 + r, x1, y1, x1 + r, y1]));
        return pp;
    };
    var fillRectRnd = function (x1, y1, x2, y2, r, c) {
        g.setColor(c);
        g.fillPoly(RectRnd(x1, y1, x2, y2, r));
        g.setColor(255, 255, 255);
    };
    var options = items && items[""] || {};
    if (items)
        delete items[""];
    var menuItems = Object.keys(items);
    var fontHeight = options.fontHeight || 25;
    var selected = options.scroll || options.selected || 0;
    var ar = Bangle.appRect;
    g.reset().clearRect(ar);
    var x = ar.x;
    var x2 = ar.x2;
    var y = ar.y;
    var y2 = ar.y2 - 12;
    if (options.title)
        y += 22;
    var lastIdx = 0;
    var selectEdit = undefined;
    var l = {
        draw: function (rowmin, rowmax) {
            var rows = 0 | Math.min((y2 - y) / fontHeight, menuItems.length);
            var idx = E.clip(selected - (rows >> 1), 0, menuItems.length - rows);
            if (idx != lastIdx)
                rowmin = undefined;
            lastIdx = idx;
            var iy = y;
            g.reset().setFontAlign(0, -1, 0).setFont12x20();
            if (options.predraw)
                options.predraw(g);
            if (rowmin === undefined && options.title)
                g.drawString(options.title, (x + x2) / 2, y - 21).drawLine(x, y - 2, x2, y - 2).
                    setColor(g.theme.fg).setBgColor(g.theme.bg);
            iy += 4;
            if (rowmin !== undefined) {
                if (idx < rowmin) {
                    iy += fontHeight * (rowmin - idx);
                    idx = rowmin;
                }
                if (rowmax && idx + rows > rowmax) {
                    rows = 1 + rowmax - rowmin;
                }
            }
            while (rows--) {
                var name = menuItems[idx];
                var item = items[name];
                var hl = (idx === selected && !selectEdit);
                if (g.theme.dark) {
                    fillRectRnd(x, iy, x2, iy + fontHeight - 3, 7, hl ? g.theme.bgH : g.theme.bg + 40);
                }
                else {
                    fillRectRnd(x, iy, x2, iy + fontHeight - 3, 7, hl ? g.theme.bgH : g.theme.bg - 20);
                }
                g.setColor(hl ? g.theme.fgH : g.theme.fg);
                g.setFontAlign(-1, -1);
                var v = void 0;
                if (typeof item === "object") {
                    v = "format" in item
                        ? item.format(item.value)
                        : item.value;
                    if (typeof v !== "string")
                        v = "".concat(v);
                }
                else {
                    v = "";
                }
                {
                    if (name.length >= 17 - v.length && typeof item === "object") {
                        g.drawString(name.substring(0, 12 - v.length) + "...", x + 3.7, iy + 2.7);
                    }
                    else if (name.length >= 15) {
                        g.drawString(name.substring(0, 15) + "...", x + 3.7, iy + 2.7);
                    }
                    else {
                        g.drawString(name, x + 3.7, iy + 2.7);
                    }
                    var xo = x2;
                    if (selectEdit && idx === selected) {
                        xo -= 24 + 1;
                        g.setColor(g.theme.fgH)
                            .drawImage("\x0c\x05\x81\x00 \x07\x00\xF9\xF0\x0E\x00@", xo, iy + (fontHeight - 10) / 2, { scale: 2 });
                    }
                    g.setFontAlign(1, -1);
                    g.drawString(v, xo - 2, iy + 1);
                }
                g.setColor(g.theme.fg);
                iy += fontHeight;
                idx++;
            }
            g.setFontAlign(-1, -1);
            g.setColor((idx < menuItems.length) ? g.theme.fg : g.theme.bg).fillPoly([72, 166, 104, 166, 88, 174]);
            g.flip();
        },
        select: function () {
            var item = items[menuItems[selected]];
            if (typeof item === "function") {
                item();
            }
            else if (typeof item === "object") {
                if (typeof item.value === "number") {
                    selectEdit = selectEdit ? undefined : item;
                }
                else {
                    if (typeof item.value === "boolean")
                        item.value = !item.value;
                    if (item.onchange)
                        item.onchange(item.value);
                }
                l.draw();
            }
        },
        move: function (dir) {
            var item = selectEdit;
            if (typeof item === "object" && typeof item.value === "number") {
                item.value += (-dir || 1) * (item.step || 1);
                if (item.min && item.value < item.min)
                    item.value = item.wrap ? item.max : item.min;
                if ("max" in item && item.value > item.max)
                    item.value = item.wrap ? item.min : item.max;
                if (item.onchange)
                    item.onchange(item.value);
                l.draw(selected, selected);
            }
            else {
                var lastSelected = selected;
                selected = (selected + dir + menuItems.length) % menuItems.length;
                l.draw(Math.min(lastSelected, selected), Math.max(lastSelected, selected));
            }
        },
    };
    l.draw();
    var back = options.back;
    if (!back) {
        var backItem = items && items["< Back"];
        if (typeof backItem === "function")
            back = backItem;
        else if (backItem && "back" in backItem)
            back = backItem.back;
    }
    var onSwipe;
    if (typeof back === "function") {
        var back_1 = back;
        onSwipe = function (lr) {
            if (lr < 0)
                back_1();
        };
        Bangle.on('swipe', onSwipe);
    }
    Bangle.setUI({
        mode: "updown",
        back: back,
        remove: function () {
            Bangle.removeListener("swipe", onSwipe);
        },
    }, function (dir) {
        if (dir)
            l.move(dir);
        else
            l.select();
    });
    return l;
};
