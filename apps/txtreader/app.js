function showFileSelector() {
  let files = require("Storage").list().filter(f => f.endsWith('.txt'));

  let menuItems = {};
  files.forEach(file => {
    menuItems[file] = () => {
      E.showPrompt(`Select ${file}?`).then(confirm => {
        if (confirm) {
          onFileSelected(file);
        } else {
          showFileSelector();
        }
      });
    };
  });

  menuItems['< Back'] = () => { load(); }; // Go back to the launcher or previous screen
  E.showMenu(menuItems);
}

function onFileSelected(file) {

  var text = require("Storage").read(file);

  function displayText(text, startLine, pageNumber) {
    g.clear();
    g.setFont("6x8", 1);
    g.setColor(1);
    g.drawString("Page " + pageNumber, 10, 2);
    g.drawString(file, g.getWidth()-file.length*6, 2);

    var lines = text.split("\n");
    var y = 15; // Text start, top row reserved for page number
    var currentLine = startLine || 0;
    var linesDisplayed = 0; //Per page

    for (var i = currentLine; i < lines.length; i++) {
      var wrappedLines = g.wrapString(lines[i], g.getWidth() - 20);
      for (var j = 0; j < wrappedLines.length; j++) {
        g.drawString(wrappedLines[j], 10, y);
        y += 10; // Move down for the next line
        linesDisplayed++;
        if (y >= g.getHeight() - 10) {
          // If we run out of space, stop drawing
          return { nextStartLine: i , linesDisplayed: linesDisplayed };
        }
      }
    }
    return null; // No more lines to display
  }

  var currentStartLine = 0;
  var currentPage = 1;
  var history = []; // Track the start line and lines displayed for each page

  // Initial display
  var result = displayText(text, currentStartLine, currentPage);
  history.push({ startLine: currentStartLine, linesDisplayed: result.linesDisplayed });

  // Handle touch events
  Bangle.on('touch', function(button) {
    if (button === 2) { // Right side of the screen (next page)
      var nextStartLine = displayText(text, currentStartLine, currentPage + 1);
      if (nextStartLine !== null) {
        currentStartLine = nextStartLine.nextStartLine;
        currentPage++;
        history.push({ startLine: currentStartLine, linesDisplayed: nextStartLine.linesDisplayed });
        displayText(text, currentStartLine, currentPage);
      } else {
        currentStartLine = 0;
        currentPage = 1;
        history = [{ startLine: currentStartLine, linesDisplayed: result.linesDisplayed }];
        displayText(text, currentStartLine, currentPage);
      }
    } else if (button === 1) { // Left side of the screen (previous page)
      if (currentPage > 1) {
        // Go back to the previous page
        history.pop(); // Remove the current page from history
        var previousPage = history[history.length - 1];
        currentStartLine = previousPage.startLine;
        currentPage--;
        displayText(text, currentStartLine, currentPage);
      }
    }
  });
}

showFileSelector();