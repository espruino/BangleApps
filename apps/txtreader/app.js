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

  menuItems['< Back'] = () => { load(); }; 
  E.showMenu(menuItems);
}

function onFileSelected(file) {
  const chunkSize = 1024; 
  let currentOffset = 0;
  let currentPage = 1;
  let history = []; 

  function displayText(offset, pageNumber) {
    g.clear();
    g.setFont("6x8", 1);
    g.setColor(g.theme.fg);
    g.drawString("Page " + pageNumber, 10, 2);
    //g.drawString("Offset " + offset, 60, 2);
    g.drawString(file, g.getWidth() - file.length * 6, 2);

    var text = require("Storage").read(file, offset, chunkSize);
    var lines = text.split("\n");
    var y = 15; // Text start, top row reserved for page number
    var linesDisplayed = 0; // Lines per page
    var totalCharsDisplayed = 0; // Total characters per page

    for (var i = 0; i < lines.length; i++) {
      var wrappedLines = g.wrapString(lines[i], g.getWidth() - 20);
      for (var j = 0; j < wrappedLines.length; j++) {
        g.drawString(wrappedLines[j], 10, y);
        y += 10; // Move down for the next line
        linesDisplayed++;
        totalCharsDisplayed += wrappedLines[j].length + (j < wrappedLines.length - 1 ? 0 : 1); // Add newline character for the last wrapped line
        if (y >= g.getHeight() - 10) {
          // If we run out of space, stop drawing
          return { nextOffset: offset + totalCharsDisplayed, linesDisplayed: linesDisplayed };
        }
      }
    }
    return null; // No more lines to display
  }

  // Initial display
  var result = displayText(currentOffset, currentPage);
  history.push({ offset: currentOffset, linesDisplayed: result.linesDisplayed });

  // Handle touch events
  Bangle.on('touch', function(button) {
    if (button === 2) { // Right side of the screen (next page)
      var nextOffset = displayText(currentOffset, currentPage + 1);
      if (nextOffset !== null) {
        currentOffset = nextOffset.nextOffset;
        currentPage++;
        history.push({ offset: currentOffset, linesDisplayed: nextOffset.linesDisplayed });
        displayText(currentOffset, currentPage);
      } else {
        currentOffset = 0;
        currentPage = 1;
        history = [{ offset: currentOffset, linesDisplayed: result.linesDisplayed }];
        displayText(currentOffset, currentPage);
      }
    } else if (button === 1) { // Left side of the screen (previous page)
      if (currentPage > 1) {
        history.pop(); // Remove current page from history
        var previousPage = history[history.length - 1];
        currentOffset = previousPage.offset;
        currentPage--;
        displayText(currentOffset, currentPage);
      }
    }
  });
}

showFileSelector();