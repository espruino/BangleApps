{// List of available themes
    let cl = (x) => { return g.setColor(x).getColor(); };
    const THEMES_DATA = require("Storage").readJSON("themes.json");

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

    // Create menu with theme options
    const menu = {
        '': { 'title': 'Themes' },
    };

    // Add themes to menu
    Object.keys(THEMES).forEach(themeName => {
        menu[themeName] = () => {
            setTheme(themeName);
            menu_ui.draw();
        };
    });
    menu['Randomize'] = () => {
        setTheme(createRandomTheme());
        menu_ui.draw();
    };

    // Show the menu
    let menu_ui = E.showMenu(menu);
    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
}