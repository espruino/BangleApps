(function() {
  /* Tile Clock with Clock Info Integration - Performance Optimized */
  
  // ===== CONSTANTS =====
  const SCALE = 12;
  const SEC_SCALE = 6;
  const FRAC_STEPS = 5;
  const ANIM_DELAY = 16;
  const COLOR_INTERP = 0.2;
  const GAP = 3;
  const MAIN_BORDER_THICKNESS = 2;
  const SEC_BORDER_THICKNESS = 1;

  // ===== SCREEN DIMENSIONS =====
  const width = g.getWidth();
  const height = g.getHeight();

  // ===== SETTINGS =====
  const settings = require('Storage').readJSON("tileclk.json", true) || {
    widgets: "show",
    seconds: "hide",
    borders: true,
    borderColor: "theme",
    haptics: true
  };
  const is12Hour = (require('Storage').readJSON("setting.json", true) || {})['12hour'] || false;
  let showSeconds = settings.seconds === "show" || (settings.seconds === "dynamic" && !Bangle.isLocked());
  const showBorders = settings.borders !== false;

  // ===== FLAT STATE VARIABLES (Optimized for access speed) =====
  // Display state
  let showingClockInfo = false;
  let clockInfoUnfocused = false;
  let userPreferClockInfo = false;
  let userDismissedClockInfo = false;
  
  // Animation state
  let isDrawing = true;
  let isColonDrawn = false;
  let isDrawingSeconds = false;
  let drawTimeout = null;
  let secondsTimeout = null;
  
  // Time tracking
  let lastTime = "";
  let lastSeconds = "";
  
  // Clock info menu
  let clockInfoMenu = null;
  
  // ===== STATE PERSISTENCE =====
  function loadDisplayState() {
    const state = require('Storage').readJSON("tileclk.state.json", true) || {};
    showingClockInfo = state.showingClockInfo || false;
    userPreferClockInfo = state.userPreferClockInfo || false;
    userDismissedClockInfo = state.userDismissedClockInfo || false;
  }
  
  function saveDisplayState() {
    require('Storage').writeJSON("tileclk.state.json", {
      showingClockInfo: showingClockInfo,
      userPreferClockInfo: userPreferClockInfo,
      userDismissedClockInfo: userDismissedClockInfo
    });
  }

  // ===== DIGIT BITMAPS =====
  const digitBitmaps = {
    ' ': [0, 0, 0, 0, 0],
    '0': [7, 5, 5, 5, 7],
    '1': [2, 6, 2, 2, 7],
    '2': [7, 1, 7, 4, 7],
    '3': [7, 1, 7, 1, 7],
    '4': [5, 5, 7, 1, 1],
    '5': [7, 4, 7, 1, 7],
    '6': [7, 4, 7, 5, 7],
    '7': [7, 1, 1, 1, 1],
    '8': [7, 5, 7, 5, 7],
    '9': [7, 5, 7, 1, 7]
  };

  // ===== CALCULATED CONSTANTS =====
  const digitWidth = 3 * SCALE;
  const colonWidth = SCALE;
  const secDigitWidth = 3 * SEC_SCALE;
  const totalSecWidth = 2 * secDigitWidth + GAP;
  const secStartX = (width / 2) - (totalSecWidth / 2);

  // ===== WIDGET OFFSET =====
  const widgetYOffset = (settings.widgets === "hide" || settings.widgets === "swipe") ? -SCALE : 0;

  // ===== BORDER COLOR (Inlined for performance) =====
  const borderColor = settings.borderColor === "theme" || !settings.borderColor ? 
    g.theme.bgH : g.toColor(settings.borderColor);

  // ===== POSITION CALCULATIONS (Pre-computed for performance) =====
  const positions = {
    threeDigit: (() => {
      const totalWidth = 3 * digitWidth + colonWidth + 3 * GAP;
      const startX = (width - totalWidth) / 2;
      return {
        colonX: Math.round(startX + digitWidth + GAP),
        colonY: Math.round(0.35 * height),
        digitX: [
          Math.round(startX),
          Math.round(startX + digitWidth + GAP + colonWidth + GAP),
          Math.round(startX + 2 * (digitWidth + GAP) + colonWidth + GAP)
        ],
        digitsY: Math.round(0.41 * height)
      };
    })(),
    fourDigit: (() => {
      const totalWidth = 4 * digitWidth + colonWidth + 4 * GAP;
      const startX = (width - totalWidth) / 2;
      return {
        colonX: Math.round(startX + 2 * (digitWidth + GAP)),
        colonY: Math.round(0.35 * height),
        digitX: [
          Math.round(startX),
          Math.round(startX + digitWidth + GAP),
          Math.round(startX + 2 * (digitWidth + GAP) + colonWidth + GAP),
          Math.round(startX + 3 * (digitWidth + GAP) + colonWidth + GAP)
        ],
        digitsY: Math.round(0.41 * height)
      };
    })(),
    seconds: {
      x: [Math.round(secStartX), Math.round(secStartX + secDigitWidth + GAP)],
      y: Math.round(0.8 * height)
    }
  };

  // Pre-compute touch areas for faster access
  const mainTimeAreaBottom = widgetYOffset + Math.round(0.6 * height);
  const secondsAreaLeft = positions.seconds.x[0] - 10;
  const secondsAreaRight = positions.seconds.x[1] + secDigitWidth + 10;
  const secondsAreaTop = positions.seconds.y + widgetYOffset - 10;
  const secondsAreaBottom = positions.seconds.y + widgetYOffset + 5 * SEC_SCALE + 10;
  const clockInfoAreaBottom = positions.seconds.y + widgetYOffset + 40;

  // ===== LAYOUT GENERATION (Optimized with pre-built layouts) =====
  const threeDigitLayout = [
    { type: 'digit', value: 'h2', x: positions.threeDigit.digitX[0], y: positions.threeDigit.digitsY + widgetYOffset, scale: SCALE },
    { type: 'colon', x: positions.threeDigit.colonX, y: positions.threeDigit.colonY + widgetYOffset, scale: SCALE },
    { type: 'digit', value: 'm1', x: positions.threeDigit.digitX[1], y: positions.threeDigit.digitsY + widgetYOffset, scale: SCALE },
    { type: 'digit', value: 'm2', x: positions.threeDigit.digitX[2], y: positions.threeDigit.digitsY + widgetYOffset, scale: SCALE }
  ];
  
  const fourDigitLayout = [
    { type: 'digit', value: 'h1', x: positions.fourDigit.digitX[0], y: positions.fourDigit.digitsY + widgetYOffset, scale: SCALE },
    { type: 'digit', value: 'h2', x: positions.fourDigit.digitX[1], y: positions.fourDigit.digitsY + widgetYOffset, scale: SCALE },
    { type: 'colon', x: positions.fourDigit.colonX, y: positions.fourDigit.colonY + widgetYOffset, scale: SCALE },
    { type: 'digit', value: 'm1', x: positions.fourDigit.digitX[2], y: positions.fourDigit.digitsY + widgetYOffset, scale: SCALE },
    { type: 'digit', value: 'm2', x: positions.fourDigit.digitX[3], y: positions.fourDigit.digitsY + widgetYOffset, scale: SCALE }
  ];

  // ===== COLOR INTERPOLATION WITH CACHING =====
  const colorCache = {};
  
  function interpColor(c1, c2, fraction) {
    const key = c1 + "_" + c2 + "_" + Math.round(fraction * FRAC_STEPS);
    if (colorCache[key]) return colorCache[key];
    
    const r1 = (c1 >> 16) & 0xFF;
    const g1 = (c1 >> 8) & 0xFF;
    const b1 = c1 & 0xFF;
    const r2 = (c2 >> 16) & 0xFF;
    const g2 = (c2 >> 8) & 0xFF;
    const b2 = c2 & 0xFF;
    
    const r = Math.round(r1 * (1 - fraction) + r2 * fraction);
    const g = Math.round(g1 * (1 - fraction) + g2 * fraction);
    const b = Math.round(b1 * (1 - fraction) + b2 * fraction);
    
    colorCache[key] = (r << 16) | (g << 8) | b;
    return colorCache[key];
  }

  // ===== BORDER DRAWING (Inlined check for performance) =====
  function drawBorder(x, y, s, thickness) {
    if (!showBorders || thickness <= 0) return;
    
    g.setColor(borderColor);
    for (let i = 0; i < thickness; i++) {
      g.drawRect(x + i, y + i, x + s - 1 - i, y + s - 1 - i);
    }
  }

  // ===== ANIMATION FUNCTIONS =====
  function animateTile(x, y, s, on, callback, isMainDigit) {
    let progress = on ? 0 : 1;
    const step = on ? COLOR_INTERP : -COLOR_INTERP;
    const thickness = isMainDigit ? MAIN_BORDER_THICKNESS : SEC_BORDER_THICKNESS;

    function transition() {
      if (!isDrawing) return;
      g.setColor(interpColor(on ? g.theme.bg : g.theme.fg, on ? g.theme.fg : g.theme.bg, Math.abs(progress - (on ? 0 : 1))));
      g.fillRect(x, y, x + s - 1, y + s - 1);

      progress += step;
      if (progress >= 0 && progress <= 1) {
        setTimeout(transition, ANIM_DELAY);
      } else {
        if (on) drawBorder(x, y, s, thickness);
        if (callback) callback();
      }
    }

    transition();
  }

  // ===== TILE CALCULATION =====
  function calculateTilesToUpdate(x, y, s, currentDigit, prevDigit) {
    const current = digitBitmaps[currentDigit] || digitBitmaps[' '];
    const previous = digitBitmaps[prevDigit] || digitBitmaps[' '];
    const tiles = [];
    
    for (let row = 0; row < 5; row++) {
      const diff = current[row] ^ previous[row];
      if (diff === 0) continue;
      
      for (let col = 0; col < 3; col++) {
        if (diff & (1 << (2 - col))) {
          tiles.push({
            x: x + col * s,
            y: y + row * s,
            state: (current[row] >> (2 - col)) & 1
          });
        }
      }
    }
    
    return tiles;
  }

  // ===== TILE UPDATE =====
  function updateTile(tile, s, skipAnimation, isMainDigit) {
    const thickness = isMainDigit ? MAIN_BORDER_THICKNESS : SEC_BORDER_THICKNESS;
    
    if (tile.state) {
      if (skipAnimation) {
        g.setColor(g.theme.fg);
        g.fillRect(tile.x, tile.y, tile.x + s - 1, tile.y + s - 1);
        drawBorder(tile.x, tile.y, s, thickness);
      } else {
        animateTile(tile.x, tile.y, s, true, null, isMainDigit);
      }
    } else {
      g.setColor(g.theme.bg);
      g.fillRect(tile.x, tile.y, tile.x + s - 1, tile.y + s - 1);
    }
  }

  function updateTiles(tiles, s, callback, skipAnimation, isMainDigit) {
    if (!isDrawing || !tiles.length) {
      if (callback) callback();
      return;
    }
    const tile = tiles.shift();
    updateTile(tile, s, skipAnimation, isMainDigit);
    setTimeout(() => updateTiles(tiles, s, callback, skipAnimation, isMainDigit), ANIM_DELAY);
  }

  // ===== DIGIT DRAWING =====
  function drawDigit(x, y, s, num, prevNum, callback, skipAnimation, isMainDigit) {
    if (num === prevNum) {
      if (callback) callback();
      return;
    }
    const tiles = calculateTilesToUpdate(x, y, s, num, prevNum);
    updateTiles(tiles, s, callback, skipAnimation, isMainDigit);
  }

  function drawColon(x, y, callback) {
    if (!isDrawing || isColonDrawn) {
      if (callback) callback();
      return;
    }
    animateTile(x, y + SCALE * 2, SCALE, true, () => {
      animateTile(x, y + SCALE * 4, SCALE, true, () => {
        isColonDrawn = true;
        if (callback) callback();
      }, true);
    }, true);
  }

  // ===== TIME UPDATE SCHEDULING =====
  function scheduleNextUpdate() {
    if (drawTimeout) clearTimeout(drawTimeout);
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    
    drawTimeout = setTimeout(updateAndAnimTime, msUntilNextMinute);
  }

  // ===== CLEARING FUNCTIONS (Direct callback approach for performance) =====
  function clearColon(callback) {
    if (!isColonDrawn) {
      if (callback) callback();
      return;
    }
    const layout = is12Hour && lastTime[0] === '0' ? threeDigitLayout : fourDigitLayout;
    const colonItem = layout.find(item => item.type === 'colon');

    if (colonItem) {
      animateTile(colonItem.x, colonItem.y + SCALE * 2, SCALE, false, () => {
        animateTile(colonItem.x, colonItem.y + SCALE * 4, SCALE, false, () => {
          isColonDrawn = false;
          if (callback) callback();
        }, true);
      }, true);
    } else {
      isColonDrawn = false;
      if (callback) callback();
    }
  }

  function clearAllDigits(callback) {
    const wasThreeDigit = is12Hour && lastTime[0] === '0';
    const layout = wasThreeDigit ? threeDigitLayout : fourDigitLayout;
    
    const previousDigits = {
      h1: lastTime[0] || ' ',
      h2: lastTime[1] || ' ',
      m1: lastTime[2] || ' ',
      m2: lastTime[3] || ' '
    };
    
    // Direct callback chaining for better performance
    function clearItems(items, next) {
      if (!items.length) {
        next();
        return;
      }
      const item = items.shift();
      
      if (item.type === 'digit') {
        drawDigit(item.x, item.y, item.scale, " ", previousDigits[item.value], () => clearItems(items, next), false, true);
      } else if (item.type === 'colon') {
        clearColon(() => clearItems(items, next));
      }
    }
    
    // Clear in order: hours -> colon -> minutes -> seconds
    const hourItems = layout.filter(item => item.type === 'digit' && item.value.startsWith('h'));
    const colonItems = layout.filter(item => item.type === 'colon');
    const minuteItems = layout.filter(item => item.type === 'digit' && item.value.startsWith('m'));
    
    clearItems(hourItems.slice(), () => {
      clearItems(colonItems.slice(), () => {
        clearItems(minuteItems.slice(), () => {
          if (showSeconds && !showingClockInfo) {
            clearSeconds(() => {
              lastTime = "";
              if (callback) callback();
            });
          } else {
            lastTime = "";
            if (callback) callback();
          }
        });
      });
    });
  }

  // ===== MAIN TIME UPDATE (Optimized with direct logic) =====
  function updateAndAnimTime() {
    if (!isDrawing) return;

    const now = new Date();
    const hours = (is12Hour ? now.getHours() % 12 || 12 : now.getHours()).toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = hours + minutes;
    const isCurrentThreeDigit = is12Hour && hours[0] === '0';
    const wasLastThreeDigit = is12Hour && lastTime[0] === '0';

    function drawTime() {
      const currentDigits = { h1: hours[0], h2: hours[1], m1: minutes[0], m2: minutes[1] };
      const previousDigits = (isCurrentThreeDigit !== wasLastThreeDigit && lastTime !== "") ? 
        { h1: ' ', h2: ' ', m1: ' ', m2: ' ' } : 
        { h1: lastTime[0] || ' ', h2: lastTime[1] || ' ', m1: lastTime[2] || ' ', m2: lastTime[3] || ' ' };
      
      const layout = isCurrentThreeDigit ? threeDigitLayout : fourDigitLayout;
      
      // Direct drawing without queue abstraction
      function drawLayout(items, onComplete) {
        if (!items.length) {
          if (onComplete) onComplete();
          return;
        }
        
        const item = items.shift();
        const next = () => drawLayout(items, onComplete);
        
        if (item.type === 'digit') {
          drawDigit(item.x, item.y, item.scale, currentDigits[item.value], previousDigits[item.value], next, false, true);
        } else if (item.type === 'colon') {
          drawColon(item.x, item.y, next);
        }
      }

      if (isCurrentThreeDigit !== wasLastThreeDigit) {
        clearAllDigits(() => drawLayout(layout.slice(), finishDrawing));
      } else {
        drawLayout(layout.slice(), finishDrawing);
      }
    }

    function finishDrawing() {
      g.flip();
      lastTime = currentTime;
      if (showSeconds && !showingClockInfo) updateSeconds();
      scheduleNextUpdate();
    }

    drawTime();
  }

  // ===== SECONDS HANDLING =====
  function updateSeconds() {
    if (isDrawingSeconds || !showSeconds || showingClockInfo) return;
    isDrawingSeconds = true;

    const now = new Date();
    const currentMs = now.getMilliseconds();
    let seconds = now.getSeconds();
    
    const skipAnimation = lastSeconds === "";
    
    if (skipAnimation) {
      // Calculate how many tiles need to be drawn from blank
      const secondsStr = seconds.toString().padStart(2, '0');
      const tiles0 = calculateTilesToUpdate(positions.seconds.x[0], positions.seconds.y + widgetYOffset, SEC_SCALE, secondsStr[0], ' ');
      const tiles1 = calculateTilesToUpdate(positions.seconds.x[1], positions.seconds.y + widgetYOffset, SEC_SCALE, secondsStr[1], ' ');
      const tilesNeeded = tiles0.length + tiles1.length;
      
      // Each tile takes ANIM_DELAY to draw in fast mode
      const estimatedDrawTime = tilesNeeded * ANIM_DELAY * 2 // Double for safety margin
      const timeUntilNextSecond = 1000 - currentMs;
      
      // If we can't finish in time, skip to next second
      if (estimatedDrawTime > timeUntilNextSecond) {
        seconds = (seconds + 1) % 60;
      }
    }
    
    seconds = seconds.toString().padStart(2, '0');

    function updateDigit(index) {
      if (seconds[index] !== (lastSeconds[index] || ' ')) {
        drawSecondDigit(index, seconds[index], lastSeconds[index] || ' ', () => {
          if (index === 0) {
            updateDigit(1);
          } else {
            finishSeconds();
          }
        }, skipAnimation);
      } else if (index === 0) {
        updateDigit(1);
      } else {
        finishSeconds();
      }
    }

    function finishSeconds() {
      lastSeconds = seconds;
      isDrawingSeconds = false;
      g.flip();
      
      if (secondsTimeout) clearTimeout(secondsTimeout);
      secondsTimeout = setTimeout(() => {
        if (showSeconds && !showingClockInfo) updateSeconds();
      }, 1000 - new Date().getMilliseconds());
    }

    updateDigit(0);
  }

  function drawSecondDigit(index, digit, prevDigit, callback, skipAnimation) {
    drawDigit(positions.seconds.x[index], positions.seconds.y + widgetYOffset, SEC_SCALE, digit, prevDigit, callback, skipAnimation, false);
  }

  function clearSeconds(callback) {
    if (isDrawingSeconds) {
      setTimeout(() => clearSeconds(callback), 50);
      return;
    }

    isDrawingSeconds = true;
    drawDigit(positions.seconds.x[0], positions.seconds.y + widgetYOffset, SEC_SCALE, " ", lastSeconds[0] || ' ', () => {
      drawDigit(positions.seconds.x[1], positions.seconds.y + widgetYOffset, SEC_SCALE, " ", lastSeconds[1] || ' ', () => {
        lastSeconds = "";
        isDrawingSeconds = false;
        if (callback) callback();
      });
    }, false, false);
  }

  // ===== SWITCHING FUNCTIONS (Optimized with direct state changes) =====
  function switchToClockInfo() {
    if (showingClockInfo || !clockInfoMenu) return;
    
    if (secondsTimeout) clearTimeout(secondsTimeout);
    
    const show = () => {
      showingClockInfo = true;
      clockInfoUnfocused = false;
      if (clockInfoMenu) {
        clockInfoMenu.focus = true;
        clockInfoMenu.redraw();
      }
      g.flip();
    };
    
    if (showSeconds && lastSeconds !== "") {
      clearSeconds(show);
    } else {
      show();
    }
  }

  function hideClockInfo() {
    if (!showingClockInfo) return;
    
    userPreferClockInfo = false;
    showingClockInfo = false;
    clockInfoUnfocused = false;
    
    g.setColor(g.theme.bg);
    g.fillRect(0, positions.seconds.y + widgetYOffset - 10, width, positions.seconds.y + widgetYOffset + 50);
    g.flip();
  }

  function switchToSeconds() {
    if (!showingClockInfo || !showSeconds) return;
    
    userPreferClockInfo = false;
    userDismissedClockInfo = true;
    showingClockInfo = false;
    clockInfoUnfocused = false;
    lastSeconds = "";
    
    g.setColor(g.theme.bg);
    g.fillRect(0, positions.seconds.y + widgetYOffset - 10, width, positions.seconds.y + widgetYOffset + 50);
    g.flip();
    
    updateAndAnimTime();
  }

  // ===== TOUCH HANDLING (Optimized with pre-computed areas) =====
  function setupTouchHandler() {
    Bangle.on("touch", (_, e) => {
      if (showingClockInfo) {
        // Check if tap is on clock info area
        if (e.y >= secondsAreaTop && e.y <= clockInfoAreaBottom) {
          // Refocus if unfocused
          if (clockInfoUnfocused) {
            if (settings.haptics !== false) Bangle.buzz(50); // Haptic feedback for refocus
            clockInfoUnfocused = false;
            if (clockInfoMenu) {
              clockInfoMenu.focus = true;
              clockInfoMenu.redraw();
            }
            g.flip();
          }
          return;
        }
        
        // Check main time area for dismissal
        if (e.x >= 0 && e.x <= width && e.y >= widgetYOffset && e.y <= mainTimeAreaBottom) {
          if (!clockInfoUnfocused) {
            // First tap: unfocus
            if (settings.haptics !== false) Bangle.buzz(40); // Light haptic for unfocus
            clockInfoUnfocused = true;
            if (clockInfoMenu) {
              clockInfoMenu.focus = false;
              clockInfoMenu.redraw();
            }
            g.flip();
          } else {
            // Second tap: dismiss
            if (settings.haptics !== false) Bangle.buzz(60); // Slightly stronger haptic for dismiss
            if (showSeconds) {
              userPreferClockInfo = false;
              userDismissedClockInfo = true;
              switchToSeconds();
            } else {
              userDismissedClockInfo = true;
              hideClockInfo();
            }
          }
        }
      } else {
        // Check seconds area for switching to clock info
        if (e.x >= secondsAreaLeft && e.x <= secondsAreaRight &&
            e.y >= secondsAreaTop && e.y <= secondsAreaBottom) {
          if (settings.haptics !== false) Bangle.buzz(50); // Haptic feedback for showing clock info
          userPreferClockInfo = true;
          userDismissedClockInfo = false;
          switchToClockInfo();
        }
      }
    });
  }

  // ===== CLOCK INFO SETUP =====
  function setupClockInfo() {
    if (clockInfoMenu) return;
    
    try {
      const clockInfoItems = require("clock_info").load();
      
      const clockInfoDraw = (_, info, options) => {
        if (!showingClockInfo) return;
        
        g.reset().setBgColor(g.theme.bg).setColor(g.theme.fg);
        g.clearRect(options.x, options.y, options.x + options.w - 1, options.y + options.h - 1);
        
        if (!clockInfoUnfocused) {
          g.setColor(borderColor);
          g.drawRect(options.x, options.y, options.x + options.w - 1, options.y + options.h - 1);
        }
        
        g.setFont("6x8:3");
        
        const padding = 8;
        const imgSize = 24;
        const midy = options.y + options.h / 2;
        
        let text = info.text;
        const maxTextWidth = options.w - imgSize - padding * 3;
        
        if (g.stringWidth(text) > maxTextWidth) {
          while (g.stringWidth(text + "...") > maxTextWidth && text.length > 0) {
            text = text.substr(0, text.length - 1);
          }
          text = text + "...";
        }
        
        const textWidth = g.stringWidth(text);
        const totalContentWidth = imgSize + padding + textWidth;
        const startX = options.x + (options.w - totalContentWidth) / 2;
        
        if (info.img) {
          g.drawImage(info.img, startX, midy - 12);
        }
        
        g.setColor(g.theme.fg);
        g.setFontAlign(-1, 0);
        g.drawString(text, startX + imgSize + padding, midy);
      };
      
      clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, {
        app: "tileclk",
        x: 0,
        y: positions.seconds.y + widgetYOffset - 10,
        w: width,
        h: 50,
        draw: clockInfoDraw
      });
    } catch(e) {
      clockInfoMenu = null;
    }
  }

  // ===== MAIN CLOCK DRAW =====
  function drawClock() {
    g.clear(Bangle.appRect);
    if (settings.widgets !== "hide") Bangle.drawWidgets();
    lastTime = "";
    lastSeconds = "";
    isColonDrawn = false;
    
    // Load saved state
    loadDisplayState();
    
    // Setup clock info and touch handler
    setupClockInfo();
    setupTouchHandler();
    
    // Determine initial display based on saved preferences and current settings
    if (showingClockInfo && clockInfoMenu) {
      // User was viewing clock info - restore it but unfocused
      clockInfoUnfocused = true;
      clockInfoMenu.focus = false;
      clockInfoMenu.redraw();
    } else if (userPreferClockInfo && clockInfoMenu) {
      // User prefers clock info - show it unfocused
      showingClockInfo = true;
      clockInfoUnfocused = true;
      clockInfoMenu.focus = false;
      clockInfoMenu.redraw();
    } else if (showSeconds && !userDismissedClockInfo) {
      // Seconds are enabled and user hasn't dismissed clock info
      showingClockInfo = false;
      clockInfoUnfocused = false;
    } else if (!showSeconds && !userDismissedClockInfo && settings.seconds === "dynamic" && clockInfoMenu) {
      // Dynamic mode when locked - show clock info unfocused if not dismissed
      showingClockInfo = true;
      clockInfoUnfocused = true;
      clockInfoMenu.focus = false;
      clockInfoMenu.redraw();
    } else {
      // Default: show nothing in seconds area
      showingClockInfo = false;
      clockInfoUnfocused = false;
    }
    
    updateAndAnimTime();
  }

  // ===== UI SETUP =====
  Bangle.setUI({
    mode: "clock",
    remove: function() {
      isDrawing = false;
      saveDisplayState();
      
      if (drawTimeout) clearTimeout(drawTimeout);
      if (secondsTimeout) clearTimeout(secondsTimeout);
      
      if (clockInfoMenu) {
        clockInfoMenu.remove();
        clockInfoMenu = null;
      }
    }
  });

  // ===== WIDGET SETUP =====
  Bangle.loadWidgets();
  if (settings.widgets === "hide") require("widget_utils").hide();
  else if (settings.widgets === "swipe") require("widget_utils").swipeOn();

  // ===== LOCK HANDLER =====
  Bangle.on('lock', function(isLocked) {
    if (settings.seconds === "dynamic") {
      showSeconds = !isLocked;
      if (isLocked) {
        if (!showingClockInfo && lastSeconds !== "") {
          if (secondsTimeout) clearTimeout(secondsTimeout);
          clearSeconds(() => {
            if (!userDismissedClockInfo) {
              showingClockInfo = true;
              clockInfoUnfocused = true;
              if (clockInfoMenu) {
                clockInfoMenu.focus = false;
                clockInfoMenu.redraw();
              }
            }
            g.flip();
          });
        }
      } else {
        if (!userPreferClockInfo && showingClockInfo && !userDismissedClockInfo) {
          switchToSeconds();
        } else if (showSeconds && !showingClockInfo && !userPreferClockInfo) {
          showingClockInfo = false;
          updateAndAnimTime();
        }
      }
    }
  });

  // ===== START CLOCK =====
  drawClock();
})();