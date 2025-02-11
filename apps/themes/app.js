{// List of available themes
    let cl = (x) => { return g.setColor(x).getColor(); };
    const THEMES = {
        "Light": {
            fg: cl("#000"), // black
            bg: cl("#FFF"), // white
            fg2: cl("#555"), // gray 
            bg2: cl("#AAA"), // light gray
            fgH: cl("#FFF"), // white
            bgH: cl("#000"), // black
            dark: false
        },
        "Dark": {
            fg: cl("#FFF"), // white
            bg: cl("#000"), // black
            fg2: cl("#AAA"), // light gray
            bg2: cl("#222"), // dark gray
            fgH: cl("#000"), // black
            bgH: cl("#FFF"), // white
            dark: true
        },
        "Ruby": {
            fg: cl("#000"), // black
            bg: cl("#F00"), // red
            fg2: cl("#800"), // dark red
            bg2: cl("#F88"), // light red
            fgH: cl("#FFF"), // white
            bgH: cl("#800"), // dark red
            dark: false
        },
        "Ocean": {
            fg: cl("#FFF"), // white
            bg: cl("#00F"), // blue
            fg2: cl("#99F"), // light blue
            bg2: cl("#008"), // dark blue
            fgH: cl("#FFF"), // white
            bgH: cl("#44F"), // medium blue
            dark: true
        },
        "Forest": {
            fg: cl("#000"), // black
            bg: cl("#0F0"), // green
            fg2: cl("#080"), // dark green
            bg2: cl("#8F8"), // light green
            fgH: cl("#FFF"), // white
            bgH: cl("#080"), // dark green
            dark: false
        },
        "Royal": {
            fg: cl("#FFF"), // white
            bg: cl("#808"), // purple
            fg2: cl("#F8F"), // light purple
            bg2: cl("#404"), // dark purple
            fgH: cl("#FFF"), // white
            bgH: cl("#C0C"), // bright purple
            dark: true
        },
        "Sunset": {
            fg: cl("#000"), // black
            bg: cl("#F80"), // orange
            fg2: cl("#840"), // dark orange
            bg2: cl("#FC8"), // light orange
            fgH: cl("#FFF"), // white
            bgH: cl("#F60"), // bright orange
            dark: false
        },
        "Bubblegum": {
            fg: cl("#000"), // black
            bg: cl("#F8C"), // pink
            fg2: cl("#C48"), // dark pink
            bg2: cl("#FAE"), // light pink
            fgH: cl("#FFF"), // white
            bgH: cl("#F68"), // bright pink
            dark: false
        },
        "Arctic": {
            fg: cl("#000"), // black
            bg: cl("#0FF"), // cyan
            fg2: cl("#088"), // dark cyan
            bg2: cl("#8FF"), // light cyan
            fgH: cl("#FFF"), // white
            bgH: cl("#0CC"), // bright cyan
            dark: false
        },
        "Sunflower": {
            fg: cl("#000"), // black
            bg: cl("#FF0"), // yellow
            fg2: cl("#880"), // dark yellow
            bg2: cl("#FF8"), // light yellow
            fgH: cl("#000"), // black
            bgH: cl("#CC0"), // bright yellow
            dark: false
        },
        "Smoke": {
            fg: cl("#000"), // black
            bg: cl("#888"), // medium gray
            fg2: cl("#444"), // dark gray
            bg2: cl("#CCC"), // light gray
            fgH: cl("#FFF"), // white
            bgH: cl("#666"), // gray
            dark: false
        },
        "Espresso": {
            fg: cl("#FFF"), // white
            bg: cl("#842"), // brown
            fg2: cl("#CA8"), // light brown
            bg2: cl("#421"), // dark brown
            fgH: cl("#FFF"), // white
            bgH: cl("#963"), // medium brown
            dark: true
        },
        "Matrix": {
            fg: cl("#0F0"), // bright green
            bg: cl("#000"), // black
            fg2: cl("#0A0"), // medium green
            bg2: cl("#010"), // very dark green
            fgH: cl("#FFF"), // white
            bgH: cl("#0F0"), // bright green
            dark: true
        },
        "Peach": {
            fg: cl("#000"), // black
            bg: cl("#E6A08F"), // darker soft peach
            fg2: cl("#B85F47"), // darker peachy coral
            bg2: cl("#E6B3A3"), // darker creamy peach
            fgH: cl("#FFF"), // white
            bgH: cl("#E67F66"), // darker coral peach
            dark: false
        }
    };

    // Function to apply the selected theme
    let setTheme = (themeNameOrObject) => {
        const theme = typeof themeNameOrObject === 'string' ? THEMES[themeNameOrObject] : themeNameOrObject;
        if (!theme) return;

        g.theme = theme;
        let settings = require("Storage").readJSON("setting.json", 1) || {};
        settings.theme = theme;
        require("Storage").write("setting.json", settings);
    };

    // Function to generate random color
    let randomColor = () => {
        return cl('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
    };

    // Function to create a random theme
    let createRandomTheme = () => {
        let bgColor = randomColor();
        return {
            fg: cl("#000"), // black for readability
            bg: bgColor,
            fg2: cl("#666"), // gray for contrast
            bg2: randomColor(),
            fgH: cl("#FFF"), // white for highlights
            bgH: randomColor(),
            dark: false
        };
    };

    // Create array of theme entries for the scroller
    const themeEntries = Object.keys(THEMES).map(name => [name, THEMES[name]]);
    themeEntries.push(['Randomize', null]);
    const ITEM_HEIGHT = 50; // Height for each theme item

    E.showScroller({
        h: ITEM_HEIGHT,
        c: themeEntries.length,
        draw: (idx, rect) => {
            var entry = themeEntries[idx];
            var name = entry[0];
            var theme = entry[1];

            // Fill background with theme color
            if (theme) {
                g.setColor(theme.bg);
                g.fillRect(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
            }

            // Draw theme name with theme's foreground color
            g.setColor(theme ? theme.fg : g.theme.fg);
            g.setFontAlign(-1, -1, 0);
            g.setFont('12x20');
            g.drawString(name, rect.x + 5, rect.y + 5);

            // Draw color preview bars
            const barWidth = 10;
            const barHeight = 20;
            const colors = theme ? [
                theme.fg2,  // Secondary Foreground
                theme.bg2,  // Secondary Background
                theme.fgH,  // Highlight Foreground
                theme.bgH   // Highlight Background
            ] : ['#F00', '#FF0', '#0F0', '#0FF', '#00F', '#F0F'];

            const totalWidth = barWidth * colors.length;
            const startX = rect.x + rect.w - totalWidth - 10;
            const startY = rect.y + (rect.h - barHeight) / 2;

            colors.forEach((color, i) => {
                g.setColor(theme ? color : cl(color));
                g.fillRect(
                    startX + (i * barWidth),
                    startY,
                    startX + ((i + 1) * barWidth),
                    startY + barHeight
                );
            });
        },
        select: (idx) => {
            var name = themeEntries[idx][0];
            setTheme(name === 'Randomize' ? createRandomTheme() : name);
            // Force a redraw to update all theme colors
            g.clear();
            E.showScroller();
        }
    });
}