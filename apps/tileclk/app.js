(function() {
  /* Tile Clock with Clock Info Integration */
  
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
  let userClockInfoPreference = null; // null: no preference, 'show': user wants it, 'hide': user dismissed it
  let pendingSwitch = false;
  
  // Animation state
  let isDrawing = true;
  let isColonDrawn = false;
  let isSeconds = false;
  let drawTimeout = null;
  let secondsTimeout = null;
  
  // Time tracking
  let lastTime = "";
  let lastSeconds = "";
  
  // Clock info menu
  let clockInfoMenu = null;
  
  // Event handlers (for cleanup)
  let touchHandler = null;
  let lockHandler = null;
  
  // Animation timeouts tracking
  let animationTimeouts = [];
  
  // ===== STATE PERSISTENCE =====
  function loadDisplayState() {
    const state = require('Storage').readJSON("tileclk.state.json", true) || {};
    showingClockInfo = state.showingClockInfo || false;
    userClockInfoPreference = state.userClockInfoPreference || null;
  }
  
  function saveDisplayState() {
    require('Storage').writeJSON("tileclk.state.json", {
      showingClockInfo: showingClockInfo,
      userClockInfoPreference: userClockInfoPreference
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

  // ===== BORDER COLOR =====
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

  // Touch areas
  const mainTimeArea = {
    top: widgetYOffset,
    bottom: widgetYOffset + Math.round(0.6 * height)
  };
  
  const secondsArea = {
    left: positions.seconds.x[0] - 10,
    right: positions.seconds.x[1] + secDigitWidth + 10,
    top: positions.seconds.y + widgetYOffset - 10,
    bottom: positions.seconds.y + widgetYOffset + 50  // Covers both seconds and clock info
  };

  // ===== LAYOUT GENERATION =====
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

  // ===== BORDER DRAWING =====
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
      if (!isDrawing || (pendingSwitch && isSeconds)) return;
      g.setColor(interpColor(on ? g.theme.bg : g.theme.fg, on ? g.theme.fg : g.theme.bg, Math.abs(progress - (on ? 0 : 1))));
      g.fillRect(x, y, x + s - 1, y + s - 1);

      progress += step;
      if (progress >= 0 && progress <= 1) {
        const timeout = setTimeout(transition, ANIM_DELAY);
        animationTimeouts.push(timeout);
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
    if (!isDrawing || !tiles.length || (pendingSwitch && isSeconds)) {
      if (callback) callback();
      return;
    }
    const tile = tiles.shift();
    updateTile(tile, s, skipAnimation, isMainDigit);
    const timeout = setTimeout(() => updateTiles(tiles, s, callback, skipAnimation, isMainDigit), ANIM_DELAY);
    animationTimeouts.push(timeout);
  }

  // ===== DIGIT DRAWING =====
  function drawDigit(x, y, s, num, prevNum, callback, skipAnimation, isMainDigit) {
    if (num === prevNum) {
      if (callback) callback();
      return;
    }
    
    // Check if we should stop seconds animation
    if (isSeconds && pendingSwitch) {
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

  // ===== MAIN TIME UPDATE =====
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
    if (isSeconds || !showSeconds || showingClockInfo || pendingSwitch) return;
    isSeconds = true;

    const now = new Date();
    let seconds = now.getSeconds();
    
    const skipAnimation = lastSeconds === "";
    
    if (skipAnimation) {
      // Calculate how many tiles need to be drawn from blank
      const secondsStr = seconds.toString().padStart(2, '0');
      const tiles0 = calculateTilesToUpdate(positions.seconds.x[0], positions.seconds.y + widgetYOffset, SEC_SCALE, secondsStr[0], ' ');
      const tiles1 = calculateTilesToUpdate(positions.seconds.x[1], positions.seconds.y + widgetYOffset, SEC_SCALE, secondsStr[1], ' ');
      const tilesNeeded = tiles0.length + tiles1.length;

      // Check time again after calculations
      const nowAfterCalc = new Date();
      const timeUntilNextSecond = 1000 - nowAfterCalc.getMilliseconds();
      const estimatedDrawTime = tilesNeeded * ANIM_DELAY * 2; // Double for safety margin

      // If we can't finish in time, skip to next second
      if (estimatedDrawTime > timeUntilNextSecond) {
        seconds = (nowAfterCalc.getSeconds() + 1) % 60;
      }
    }
    
    seconds = seconds.toString().padStart(2, '0');

    function updateDigit(index) {
      // Check if we should stop
      if (!isDrawing || pendingSwitch || showingClockInfo) {
        isSeconds = false;
        return;
      }
      
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
      isSeconds = false;
      g.flip();
      
      // Check if we have a pending switch
      if (pendingSwitch) {
        setTimeout(switchToClockInfo, 10);
        return;
      }
      
      if (secondsTimeout) clearTimeout(secondsTimeout);
      secondsTimeout = setTimeout(() => {
        if (showSeconds && !showingClockInfo && !pendingSwitch) updateSeconds();
      }, 1000 - new Date().getMilliseconds());
    }

    updateDigit(0);
  }

  function drawSecondDigit(index, digit, prevDigit, callback, skipAnimation) {
    drawDigit(positions.seconds.x[index], positions.seconds.y + widgetYOffset, SEC_SCALE, digit, prevDigit, callback, skipAnimation, false);
  }

  function clearSeconds(callback) {
    // If not drawing seconds, just call callback
    if (lastSeconds === "") {
      if (callback) callback();
      return;
    }

    // Cancel any pending seconds update
    if (secondsTimeout) {
      clearTimeout(secondsTimeout);
      secondsTimeout = null;
    }

    // Always do sequential animated clearing
    isSeconds = true;
    drawDigit(positions.seconds.x[0], positions.seconds.y + widgetYOffset, SEC_SCALE, " ", lastSeconds[0] || ' ', () => {
      drawDigit(positions.seconds.x[1], positions.seconds.y + widgetYOffset, SEC_SCALE, " ", lastSeconds[1] || ' ', () => {
        lastSeconds = "";
        isSeconds = false;
        if (callback) callback();
      }, false, false);
    }, false, false);
  }

  // ===== ANIMATION CLEANUP =====
  function cancelAllAnimations() {
    animationTimeouts.forEach(t => clearTimeout(t));
    animationTimeouts = [];
  }
  
  // ===== SWITCHING FUNCTIONS (Optimized with direct state changes) =====
  function switchToClockInfo() {
    if (showingClockInfo || !clockInfoMenu) {
      pendingSwitch = false;
      return;
    }
    
    // Mark that we want to switch
    pendingSwitch = true;
    
    // If seconds are drawing, wait a bit and retry
    if (isSeconds) {
      setTimeout(() => {
        if (pendingSwitch) switchToClockInfo();
      }, 100);
      return;
    }
    
    // Clear pending flag
    pendingSwitch = false;
    
    cancelAllAnimations();
    if (secondsTimeout) {
      clearTimeout(secondsTimeout);
      secondsTimeout = null;
    }
    
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
    
    pendingSwitch = false;
    cancelAllAnimations();
    showingClockInfo = false;
    clockInfoUnfocused = false;
    
    g.setColor(g.theme.bg);
    g.fillRect(0, positions.seconds.y + widgetYOffset - 10, width, positions.seconds.y + widgetYOffset + 50);
    g.flip();
  }

  function switchToSeconds() {
    if (!showingClockInfo || !showSeconds) return;
    
    pendingSwitch = false;
    cancelAllAnimations();
    userClockInfoPreference = 'hide';
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
    // Remove old handler if exists
    if (touchHandler) {
      Bangle.removeListener("touch", touchHandler);
    }
    
    // Create new handler
    touchHandler = (_, e) => {
      if (showingClockInfo) {
        // Check if tap is on clock info area
        if (e.x >= secondsArea.left && e.x <= secondsArea.right &&
            e.y >= secondsArea.top && e.y <= secondsArea.bottom) {
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
        if (e.y >= mainTimeArea.top && e.y <= mainTimeArea.bottom) {
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
              switchToSeconds();
            } else {
              userClockInfoPreference = 'hide';
              hideClockInfo();
            }
          }
        }
      } else {
        // Check seconds area for switching to clock info
        if (e.x >= secondsArea.left && e.x <= secondsArea.right &&
            e.y >= secondsArea.top && e.y <= secondsArea.bottom) {
          if (settings.haptics !== false) Bangle.buzz(50); // Haptic feedback for showing clock info
          userClockInfoPreference = 'show';
          switchToClockInfo();
        }
      }
    };
    
    // Add the handler
    Bangle.on("touch", touchHandler);
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
    
    // Determine initial display based on saved preferences and current settings
    if (showingClockInfo && clockInfoMenu) {
      // User was viewing clock info - restore it but unfocused
      clockInfoUnfocused = true;
      clockInfoMenu.focus = false;
      clockInfoMenu.redraw();
    } else if (userClockInfoPreference === 'show' && clockInfoMenu) {
      // User prefers clock info - show it unfocused
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
      // Stop all drawing
      isDrawing = false;
      pendingSwitch = false;
      isSeconds = false;
      
      // Save current state
      saveDisplayState();
      
      // Clear all timeouts
      if (drawTimeout) {
        clearTimeout(drawTimeout);
        drawTimeout = null;
      }
      if (secondsTimeout) {
        clearTimeout(secondsTimeout);
        secondsTimeout = null;
      }
      cancelAllAnimations();
      
      // Remove event handlers
      if (touchHandler) {
        Bangle.removeListener("touch", touchHandler);
        touchHandler = null;
      }
      if (lockHandler) {
        Bangle.removeListener("lock", lockHandler);
        lockHandler = null;
      }
      
      // Remove clock info menu
      if (clockInfoMenu) {
        clockInfoMenu.remove();
        clockInfoMenu = null;
      }
      
      // Clear state variables
      showingClockInfo = false;
      clockInfoUnfocused = false;
      userClockInfoPreference = null;
      lastTime = "";
      lastSeconds = "";
      isColonDrawn = false;
      
      // Clear caches
      Object.keys(colorCache).forEach(key => delete colorCache[key]);
      
      // Restore widgets if hidden
      if (["hide", "swipe"].includes(settings.widgets)) {
        require("widget_utils").show();
      }
    }
  });

  // ===== WIDGET SETUP =====
  Bangle.loadWidgets();
  if (settings.widgets === "hide") require("widget_utils").hide();
  else if (settings.widgets === "swipe") require("widget_utils").swipeOn();

  // ===== SETUP (run once) =====
  setupClockInfo();
  setupTouchHandler();
  
  // ===== LOCK HANDLER =====
  // Remove old handler if exists
  if (lockHandler) {
    Bangle.removeListener('lock', lockHandler);
  }
  
  // Create new handler
  lockHandler = function(isLocked) {
    if (settings.seconds === "dynamic") {
      showSeconds = !isLocked;
      pendingSwitch = false; // Clear any pending switch
      
      if (isLocked) {
        if (!showingClockInfo && lastSeconds !== "") {
          if (secondsTimeout) clearTimeout(secondsTimeout);
          clearSeconds(() => {
            if (userClockInfoPreference === 'show') {
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
        if (showingClockInfo && userClockInfoPreference !== 'show') {
          switchToSeconds();
        } else if (showSeconds && !showingClockInfo) {
          updateAndAnimTime();
        }
      }
    }
  };
  
  // Add the handler
  Bangle.on('lock', lockHandler);

  // ===== START CLOCK =====
  drawClock();
})();