{// Text Reader for Bangle.js 2

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

        let draw = () => {
            // Set theme colors
            g.setColor(g.theme.bg);
            g.fillRect(0, 0, g.getWidth(), g.getHeight());
            g.setColor(g.theme.fg);

            g.setFontAlign(0, 0); // Center alignment
            g.setFont("6x8", 3);

            // Draw current word in center of screen
            if (words.length > 0) {
                g.drawString(words[currentWordIndex], g.getWidth() / 2, g.getHeight() / 2);
            }

            // Draw word counter at bottom
            g.setFont("6x8", 1);
            g.drawString(`${currentWordIndex + 1}/${words.length}`, g.getWidth() / 2, g.getHeight() - 20);
        };

        Bangle.setUI({
            mode: "custom",
            back: showFileBrowser,
            touch: (button, xy) => {
                if (button == 1) {
                    // Left side - previous word
                    if (currentWordIndex > 0) {
                        currentWordIndex--;
                        draw();
                    }
                } else {
                    // Right side - next word
                    if (currentWordIndex < words.length - 1) {
                        currentWordIndex++;
                        draw();
                    }
                }
            }
        });

        draw();
    };

    // Start the app
    showFileBrowser();
}