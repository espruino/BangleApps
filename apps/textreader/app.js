{// Text Reader for Bangle.js 2
    require("Font8x12").add(Graphics);

    // Get list of readable files
    let getFileList = () => {
        return require("Storage").list(/\.txt$/).sort();
    };

    // Read file content
    let readFile = (filename) => {
        return require("Storage").read(filename);
    };

    // File browser menu
    let showFileBrowser = () => {
        const files = getFileList();
        if (files.length === 0) {
            E.showMessage("No text files found\nSave .txt files first");
            setTimeout(() => load(), 2000);
            return;
        }

        const menu = {
            "": { title: "Text Reader" }
        };

        // Add files to menu
        files.forEach(file => {
            menu[file] = () => showFileContent(file);
        });

        E.showMenu(menu);
    };

    // Show file content with scrolling
    let showFileContent = (filename) => {
        const content = readFile(filename);
        if (!content) {
            E.showMessage("Error reading file");
            setTimeout(showFileBrowser, 2000);
            return;
        }

        // Split content into words and remove empty strings
        const words = content.split(/\s+/).filter(word => word.length > 0);
        let currentWordIndex = 0;
        let autoScrollInterval;
        const SCROLL_SPEED = 200; // Time in ms between words during auto-scroll

        let startAutoScroll = (direction) => {
            if (autoScrollInterval) return; // Already scrolling
            autoScrollInterval = setInterval(() => {
                if (direction === 'prev' && currentWordIndex > 0) {
                    currentWordIndex--;
                    draw();
                } else if (direction === 'next' && currentWordIndex < words.length - 1) {
                    currentWordIndex++;
                    draw();
                } else {
                    clearInterval(autoScrollInterval);
                    autoScrollInterval = undefined;
                }
            }, SCROLL_SPEED);
        };

        let stopAutoScroll = () => {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = undefined;
            }
        };

        let draw = () => {
            // Set theme colors
            g.setColor(g.theme.bg);
            g.fillRect(0, 0, g.getWidth(), g.getHeight());
            g.setColor(g.theme.fg);

            g.setFontAlign(0, 0); // Center alignment
            g.setFont("6x8", 3);

            // Draw current word in center of screen
            if (words.length > 0) {
                let word = words[currentWordIndex];
                let size = 32; // Start with large vector font size
                g.setFont("Vector", size);

                // Keep reducing font size until word fits
                while (g.stringWidth(word) > g.getWidth() && size > 20) {
                    size -= 5;
                    g.setFont("Vector", size);
                }

                g.drawString(word, g.getWidth() / 2, g.getHeight() / 2);
            }

            // Draw word counter at bottom
            g.setFont("6x8", 2);
            // g.setFont("Vector", 14);
            g.drawString(`${currentWordIndex + 1}/${words.length}`, g.getWidth() / 2, g.getHeight() - 20);
        };

        Bangle.setUI({
            mode: "custom",
            back: showFileBrowser,
            touch: (button, xy) => {
                if (xy.type === 2) { // Long press
                    Bangle.buzz();
                    if (button === 1) {
                        startAutoScroll('prev');
                    } else {
                        startAutoScroll('next');
                    }
                } else if (xy.type === 0) { // Quick touch
                    stopAutoScroll();
                    if (button === 1) {
                        if (currentWordIndex > 0) {
                            currentWordIndex--;
                            draw();
                        }
                    } else {
                        if (currentWordIndex < words.length - 1) {
                            currentWordIndex++;
                            draw();
                        }
                    }
                }
            }
        });

        // Make sure to stop auto-scroll when exiting
        let cleanup = () => {
            stopAutoScroll();
        };
        Bangle.on('lock', cleanup);

        draw();
    };

    // Start the app
    showFileBrowser();
    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
}