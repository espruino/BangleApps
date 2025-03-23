/* ui library 0.1.4 -- forked/modified for txtreader */
let ui = {
  display: 0,
  drawMsg: function(msg) {
    g.reset().setFont("Vector", 35)
      .setColor(1, 1, 1)
      .fillRect(0, this.wi, this.w, this.y2)
      .setColor(0, 0, 0)
      .drawString(msg, 5, 30)
      .flip();
  },
  drawBusy: function() {
    this.drawMsg("\n.oO busy");
  },
  nextScreen: function() {},
  prevScreen: function() {},
  onSwipe: function(dir) {
    this.nextScreen();
  },
  wi: 24,
  y2: 176,
  h: 152,
  w: 176,
  last_b: 0,
  topLeft: function() { this.drawMsg("Unimpl"); },
  topRight: function() { this.drawMsg("Unimpl"); },
  touchHandler: function(d) {
    let x = Math.floor(d.x);
    let y = Math.floor(d.y);
    
    if (d.b != 1 || this.last_b != 0) {
      this.last_b = d.b;
      return;
    }
    
    print("touch", x, y, this.h, this.w);

    if ((x<this.w/2) && (y<this.y2/2))
      this.topLeft();
    if ((x>this.w/2) && (y<this.y2/2))
      this.topRight();
    if ((x<this.w/2) && (y>this.y2/2)) {
      print("prev");
      this.prevScreen();
    }
    if ((x>this.w/2) && (y>this.y2/2)) {
      print("next");
      this.nextScreen();
    }
  },
  init: function() {
    this.h = this.y2 - this.wi;
    this.drawBusy();
  },
};

ui.init();

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

var big = 0;

function onFileSelected(file) {
  const chunkSize = 1024; 
  let currentOffset = 0;
  let currentPage = 1;
  let history = []; 

  function displayText(offset, pageNumber) {
    let border = 10;
    let char_h = 10;
    let char_w = 6;
    g.clear();
    if (!big) {
      g.setFont("6x8", 1);
    } else {
      g.setFont("12x20", 1);
    }
    char_h = g.getFontHeight();
    char_w = g.stringWidth("w");
    
    g.setColor(g.theme.fg);
    g.drawString("Page " + pageNumber, border, 2);
    //g.drawString("Offset " + offset, 60, 2);
    g.drawString(file, g.getWidth() - file.length * char_w, 2);
    // This can be used as a feedback that touch was registered
    //g.flip();

    var text = require("Storage").read(file, offset, chunkSize);
    var lines = text.split("\n");
    var y = 5+char_h; // Text start, top row reserved for page number
    var linesDisplayed = 0; // Lines per page
    var totalCharsDisplayed = 0; // Total characters per page

    for (var i = 0; i < lines.length; i++) {
      var wrappedLines = g.wrapString(lines[i], g.getWidth() - 2*border);
      for (var j = 0; j < wrappedLines.length; j++) {
        g.drawString(wrappedLines[j], border, y);
        y += char_h; // Move down for the next line
        linesDisplayed++;
        totalCharsDisplayed += wrappedLines[j].length + (j < wrappedLines.length - 1 ? 0 : 1); // Add newline character for the last wrapped line
        if (y >= g.getHeight() - char_h) {
          // If we run out of space, stop drawing
          return { nextOffset: offset + totalCharsDisplayed, linesDisplayed: linesDisplayed };
        }
      }
    }
    return null; // No more lines to display
  }

  function nextPage() {
    var nextOffset = displayText(currentOffset, currentPage + 1);
    if (nextOffset !== null) {
      currentOffset = nextOffset.nextOffset;
      currentPage++;
      history.push({ offset: currentOffset, linesDisplayed: nextOffset.linesDisplayed });
      displayText(currentOffset, currentPage);
    } else {
      currentOffset = 0;
      currentPage = 1;
      let result = displayText(currentOffset, currentPage);
      history = [{ offset: currentOffset, linesDisplayed: result.linesDisplayed }];
    }
  }

  function prevPage() {
      if (currentPage > 1) {
        history.pop(); // Remove current page from history
        var previousPage = history[history.length - 1];
        currentOffset = previousPage.offset;
        currentPage--;
        displayText(currentOffset, currentPage);
      }
  }

  function zoom() {
    g.clear();
    big = !big;
    firstDraw();
  }
  
  function firstDraw() {
    currentOffset = 0;
    currentPage = 1;
    history = []; 

    // Initial display
    var result = displayText(currentOffset, currentPage);
    history.push({ offset: currentOffset, linesDisplayed: result.linesDisplayed });
  }
  
  ui.init();
  ui.prevScreen = prevPage;
  ui.nextScreen = nextPage;
  ui.topLeft = zoom;
  firstDraw();
  
  Bangle.on("drag", (b) => ui.touchHandler(b));
}

showFileSelector();
