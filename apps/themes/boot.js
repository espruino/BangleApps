{
    let s = require('Storage');
    let settings = Object.assign(
        {
            cycleInterval: 0
        },
        s.readJSON('themes.settings.json', true) || {}
    );
    if (settings.cycleInterval != 0) {
        let cl = (x) => { return g.setColor(x).getColor(); };
        const THEMES_DATA = s.readJSON("themes.json");

        // Convert hex colors to graphics context colors
        const THEMES = {};
        Object.keys(THEMES_DATA).forEach(themeName => {
            const theme = THEMES_DATA[themeName];
            THEMES[themeName] = {
                fg: cl(theme.fg),
                bg: cl(theme.bg),
                fg2: cl(theme.fg2),
                bg2: cl(theme.bg2),
                fgH: cl(theme.fgH),
                bgH: cl(theme.bgH),
                dark: theme.dark
            };
        });

        // Function to apply the selected theme
        let setTheme = (themeNameOrObject) => {
            const theme = typeof themeNameOrObject === 'string' ? THEMES[themeNameOrObject] : themeNameOrObject;
            if (!theme) return;

            g.setTheme(theme);
            let settings = s.readJSON("setting.json", 1) || {};
            settings.theme = theme;
            s.write("setting.json", settings);
        };

        // Set up theme cycling
        let themeNames = Object.keys(THEMES);
        let currentThemeIndex = 0;

        // Set up interval to change theme
        setInterval(() => {
            currentThemeIndex = (currentThemeIndex + 1) % themeNames.length;
            setTheme(themeNames[currentThemeIndex]);
        }, settings.cycleInterval * 60000); // Convert minutes to milliseconds
    }
}
