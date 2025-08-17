(function() {
  /* Tile Clock with Clock Info Integration */
  
  // ===== CONSTANTS =====
  const SCALE = 12;
  const SEC_SCALE = 6;
  const FRAC_STEPS = 5;
  const ANIM_DELAY = 16;
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

  // ===== STATE VARIABLES =====
  let showingClockInfo = false, clockInfoUnfocused = false, userClockInfoPreference = null;
  let pendingSwitch = false, isDrawing = true, isColonDrawn = false, isSeconds = false;
  let drawTimeout = null, secondsTimeout = null, lastTime = null, lastSeconds = null;
  let clockInfoMenu = null, touchHandler = null, lockHandler = null;
  let animationTimeouts = new Uint16Array(50), animationTimeoutCount = 0;
  // State tracking for conditional saving
  let initialShowingClockInfo = false, initialUserClockInfoPreference = null;
  
  
  // ===== STATE PERSISTENCE =====
  const loadDisplayState = () => {
    const state = require('Storage').readJSON("tileclk.state.json", true) || {};
    showingClockInfo = state.showingClockInfo || false;
    userClockInfoPreference = state.userClockInfoPreference || null;
    
    // Track initial values for conditional saving
    initialShowingClockInfo = showingClockInfo;
    initialUserClockInfoPreference = userClockInfoPreference;
  }
  
  const saveDisplayState = () => {
    // Only save if values have changed to reduce flash wear
    if (showingClockInfo !== initialShowingClockInfo || 
        userClockInfoPreference !== initialUserClockInfoPreference) {
      require('Storage').writeJSON("tileclk.state.json", {
        showingClockInfo: showingClockInfo,
        userClockInfoPreference: userClockInfoPreference
      });
    }
  }

  // ===== DIGIT BITMAPS =====
  const digitBitmaps = new Uint16Array([
    0b000000000000000,0b111101101101111,0b010110010010111,0b111001111100111,0b111001111001111,
    0b101101111001001,0b111100111001111,0b111100111101111,0b111001001001001,0b111101111101111,0b111101111001111
  ]);

  let timeCache = null;

  const initEssentialCaches = () => {
    timeCache = {
      hourDigits12: new Uint8Array(24 * 2),
      hourDigits24: new Uint8Array(24 * 2),
      minuteDigits: new Uint8Array(60 * 2)
    };
    
    for (let h = 0; h < 24; h++) {
      const h12 = h % 12 || 12;
      timeCache.hourDigits12[h * 2] = (h12 / 10) | 0;
      timeCache.hourDigits12[h * 2 + 1] = h12 % 10;
      timeCache.hourDigits24[h * 2] = (h / 10) | 0;
      timeCache.hourDigits24[h * 2 + 1] = h % 10;
    }
    
    for (let m = 0; m < 60; m++) {
      timeCache.minuteDigits[m * 2] = (m / 10) | 0;
      timeCache.minuteDigits[m * 2 + 1] = m % 10;
    }
  }
  
  // Helper function to get digit index
  const getDigitIndex = (digit) => {
    if (digit === null) return 0; // space/blank
    return (digit >= 0 && digit <= 9) ? digit + 1 : 0;
  }
  
  const extractTimeDigits = (time) => {
    if (time === null) {
      return { h1: null, h2: null, m1: null, m2: null };
    }
    
    const hours = (time / 100) | 0;
    const minutes = time % 100;
    
    if (timeCache && timeCache.minuteDigits) {
      const hourCache = is12Hour ? timeCache.hourDigits12 : timeCache.hourDigits24;
      const minuteCache = timeCache.minuteDigits;
      
      return {
        h1: hourCache[hours * 2],
        h2: hourCache[hours * 2 + 1],
        m1: minuteCache[minutes * 2],
        m2: minuteCache[minutes * 2 + 1]
      };
    }
    
    return {
      h1: (hours / 10) | 0,
      h2: hours % 10,
      m1: (minutes / 10) | 0,
      m2: minutes % 10
    };
  }

  const digitWidth = 3 * SCALE, colonWidth = SCALE, secDigitWidth = 3 * SEC_SCALE;
  const totalSecWidth = 2 * secDigitWidth + GAP, secStartX = (width / 2) - (totalSecWidth / 2);
  const widgetYOffset = (settings.widgets === "hide" || settings.widgets === "swipe") ? -SCALE : 0;
  const borderColor = settings.borderColor === "theme" || !settings.borderColor ? 
    g.theme.bgH : g.toColor(settings.borderColor);

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
  const mainTimeArea = { top: widgetYOffset, bottom: widgetYOffset + Math.round(0.75 * height) };
  const bottomArea = { top: positions.seconds.y + widgetYOffset - 10, bottom: height };

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

  // ===== EFFICIENT COLOR SYSTEM =====
  // Pre-calculated color tables for animations
  let colorOn = null, colorOff = null;

  const initColorTables = () => {
    // Use Uint16Array since Bangle uses RGB565 (16-bit) colors
    colorOn = new Uint16Array(FRAC_STEPS + 1);
    colorOff = new Uint16Array(FRAC_STEPS + 1);
    
    const bgColor = g.theme.bg;
    const fgColor = g.theme.fg;
    
    // Simple linear interpolation between color values
    for (let i = 0; i <= FRAC_STEPS; i++) {
      const frac = i / FRAC_STEPS;
      
      // Direct interpolation of RGB565 values
      colorOn[i] = (bgColor + (fgColor - bgColor) * frac + 0.5) | 0;
      colorOff[i] = (fgColor + (bgColor - fgColor) * frac + 0.5) | 0;
    }
  }
  
  // ===== CONSOLIDATED BORDER DRAWING =====
  const drawBorder = (x, y, s, isMainDigit) => {
    if (!showBorders) return;
    
    // Direct variable lookup is faster than object property access
    const thickness = isMainDigit ? MAIN_BORDER_THICKNESS : SEC_BORDER_THICKNESS;
    if (thickness <= 0) return;
    
    g.setColor(borderColor);
    for (let i = 0; i < thickness; i++) {
      g.drawRect(x + i, y + i, x + s - 1 - i, y + s - 1 - i);
    }
  }

  // ===== ANIMATION FUNCTIONS =====
  const animateTransition = (x, y, s, startColor, endColor, drawBorderFunc, callback) => {
    let step = 0;
    const colors = startColor === g.theme.bg ? colorOn : colorOff;

    const transition = () => {
      if (!isDrawing || (pendingSwitch && isSeconds)) return;
      
      // Use pre-calculated color
      g.setColor(colors[step]);
      g.fillRect(x, y, x + s - 1, y + s - 1);

      step++;
      if (step <= FRAC_STEPS) {
        const timeout = setTimeout(transition, ANIM_DELAY);
        if (animationTimeoutCount < animationTimeouts.length) {
          animationTimeouts[animationTimeoutCount++] = timeout;
        }
      } else {
        g.setColor(endColor);
        g.fillRect(x, y, x + s - 1, y + s - 1);
        if (drawBorderFunc) drawBorderFunc();
        if (callback) callback();
      }
    }

    transition();
  }

  const animateTileOn = (x, y, s, callback, isMainDigit) => {
    const borderFunc = showBorders ? () => drawBorder(x, y, s, isMainDigit) : null;
    animateTransition(x, y, s, g.theme.bg, g.theme.fg, borderFunc, callback);
  }

  const animateTileOff = (x, y, s, callback) => {
    animateTransition(x, y, s, g.theme.fg, g.theme.bg, null, callback);
  }

  // ===== TILE CALCULATION =====
  const calculateTilesToUpdate = (x, y, s, currentDigit, prevDigit) => {
    const currentPacked = digitBitmaps[getDigitIndex(currentDigit)];
    const prevPacked = digitBitmaps[getDigitIndex(prevDigit)];
    const tiles = [];
    
    let yPos = y;
    
    // Loop through 5 rows
    for (let row = 0; row < 5; row++) {
      const shift = 12 - row * 3;
      const currentRow = (currentPacked >> shift) & 0b111;
      const prevRow = (prevPacked >> shift) & 0b111;
      const diff = currentRow ^ prevRow;
      if (diff) {
        if (diff & 4) tiles.push({ x: x, y: yPos, state: (currentRow >> 2) & 1 });
        if (diff & 2) tiles.push({ x: x + s, y: yPos, state: (currentRow >> 1) & 1 });
        if (diff & 1) tiles.push({ x: x + s + s, y: yPos, state: currentRow & 1 });
      }
      yPos += s;
    }
    
    return tiles;
  }
  
  // ===== TILE UPDATE =====
  const updateTile = (tile, s, skipAnimation, isMainDigit, isClearing) => {
    if (tile.state) {
      if (skipAnimation) {
        g.setColor(g.theme.fg);
        g.fillRect(tile.x, tile.y, tile.x + s - 1, tile.y + s - 1);
        drawBorder(tile.x, tile.y, s, isMainDigit);
      } else {
        animateTileOn(tile.x, tile.y, s, null, isMainDigit);
      }
    } else {
      if (skipAnimation || isClearing) {
        g.setColor(g.theme.bg);
        g.fillRect(tile.x, tile.y, tile.x + s - 1, tile.y + s - 1);
      } else {
        animateTileOff(tile.x, tile.y, s, null);
      }
    }
  }

  const updateTiles = (tiles, s, callback, skipAnimation, isMainDigit, isClearing) => {
    if (!isDrawing || !tiles.length || (pendingSwitch && isSeconds)) {
      if (callback) callback();
      return;
    }
    const tile = tiles.shift();
    updateTile(tile, s, skipAnimation, isMainDigit, isClearing);
    const timeout = setTimeout(() => updateTiles(tiles, s, callback, skipAnimation, isMainDigit, isClearing), ANIM_DELAY);
    if (animationTimeoutCount < animationTimeouts.length) {
      animationTimeouts[animationTimeoutCount++] = timeout;
    }
  }
  
  // ===== DIGIT DRAWING =====
  const drawDigit = (x, y, s, num, prevNum, callback, skipAnimation, isMainDigit) => {
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
    updateTiles(tiles, s, callback, skipAnimation, isMainDigit, num === null);
  }

  const drawColon = (x, y, callback) => {
    if (!isDrawing || isColonDrawn) {
      if (callback) callback();
      return;
    }
    animateTileOn(x, y + SCALE * 2, SCALE, () => {
      animateTileOn(x, y + SCALE * 4, SCALE, () => {
        isColonDrawn = true;
        if (callback) callback();
      }, true);
    }, true);
  }
  
  // ===== TIME UPDATE SCHEDULING =====
  const scheduleNextUpdate = () => {
    if (drawTimeout) clearTimeout(drawTimeout);
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    
    drawTimeout = setTimeout(updateAndAnimTime, msUntilNextMinute);
  }
  
  // ===== CLEARING FUNCTIONS (Direct callback approach for performance) =====
  const clearColon = (callback) => {
    if (!isColonDrawn) {
      if (callback) callback();
      return;
    }
    const layout = is12Hour && lastTime !== null && lastTime < 1000 ? threeDigitLayout : fourDigitLayout;
    const colonItem = layout.find(item => item.type === 'colon');

    if (colonItem) {
      animateTileOff(colonItem.x, colonItem.y + SCALE * 2, SCALE, () => {
        animateTileOff(colonItem.x, colonItem.y + SCALE * 4, SCALE, () => {
          isColonDrawn = false;
          if (callback) callback();
        });
      });
    } else {
      isColonDrawn = false;
      if (callback) callback();
    }
  }

  const clearAllDigits = (callback) => {
    const wasThreeDigit = is12Hour && lastTime !== null && lastTime < 1000;
    const layout = wasThreeDigit ? threeDigitLayout : fourDigitLayout;
    
    const previousDigits = extractTimeDigits(lastTime);
    
    // Direct callback chaining for better performance
    const clearItems = (items, next) => {
      if (!items.length) {
        next();
        return;
      }
      const item = items.shift();
      
      if (item.type === 'digit') {
        drawDigit(item.x, item.y, item.scale, null, previousDigits[item.value], () => clearItems(items, next), false, true);
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
              lastTime = null;
              if (callback) callback();
            });
          } else {
            lastTime = null;
            if (callback) callback();
          }
        });
      });
    });
  }

  // ===== MAIN TIME UPDATE (OPTIMIZED) =====
  function updateAndAnimTime() {
    if (!isDrawing) return;

    const now = new Date();
    const hoursNum = is12Hour ? now.getHours() % 12 || 12 : now.getHours();
    const minutesNum = now.getMinutes();
    const currentTime = hoursNum * 100 + minutesNum;
    
    // Extract current digits ONCE
    const currentDigits = (() => {
      if (timeCache && timeCache.minuteDigits) {
        const hourCache = is12Hour ? timeCache.hourDigits12 : timeCache.hourDigits24;
        const minuteCache = timeCache.minuteDigits;
        
        return {
          h1: hourCache[hoursNum * 2],
          h2: hourCache[hoursNum * 2 + 1],
          m1: minuteCache[minutesNum * 2],
          m2: minuteCache[minutesNum * 2 + 1]
        };
      } else {
        return {
          h1: (hoursNum / 10) | 0,
          h2: hoursNum % 10,
          m1: (minutesNum / 10) | 0,
          m2: minutesNum % 10
        };
      }
    })();
    
    // Determine layout based on extracted digits
    const isCurrentThreeDigit = is12Hour && currentDigits.h1 === 0;
    const wasLastThreeDigit = is12Hour && lastTime !== null && lastTime < 1000;

    function drawTime() {
      // Extract previous digits (or null for blank)
      const previousDigits = (isCurrentThreeDigit !== wasLastThreeDigit && lastTime !== null) ?
        { h1: null, h2: null, m1: null, m2: null } :
        extractTimeDigits(lastTime);
      
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
    let secondsNum = now.getSeconds();
    
    const skipAnimation = lastSeconds === null;
    
    // Declare digit variables once
    let s1, s2, prevS1, prevS2;
    
    if (skipAnimation) {
      // Calculate how many tiles need to be drawn from blank using cached lookups
      if (timeCache && timeCache.minuteDigits) {
        s1 = timeCache.minuteDigits[secondsNum * 2];
        s2 = timeCache.minuteDigits[secondsNum * 2 + 1];
      } else {
        s1 = (secondsNum / 10) | 0;  // Bitwise OR for integer division
        s2 = secondsNum % 10;
      }
      
      let tiles0 = calculateTilesToUpdate(positions.seconds.x[0], positions.seconds.y + widgetYOffset, SEC_SCALE, s1, null);
      let tiles1 = calculateTilesToUpdate(positions.seconds.x[1], positions.seconds.y + widgetYOffset, SEC_SCALE, s2, null);
      let tilesNeeded = tiles0.length + tiles1.length;

      // Check time again after calculations
      const nowAfterCalc = new Date();
      const timeUntilNextSecond = 1000 - nowAfterCalc.getMilliseconds();
      const estimatedDrawTime = tilesNeeded * ANIM_DELAY * 2; // Double for safety margin

      // If we can't finish in time, skip to next second
      if (estimatedDrawTime > timeUntilNextSecond) {
        // Get current time again to make sure we skip to the right second
        secondsNum = (new Date().getSeconds() + 1) % 60;
      }
    }

    // Extract current and previous digits using cached lookups
    if (timeCache && timeCache.minuteDigits) {
      s1 = timeCache.minuteDigits[secondsNum * 2];
      s2 = timeCache.minuteDigits[secondsNum * 2 + 1];
      if (lastSeconds !== null) {
        prevS1 = timeCache.minuteDigits[lastSeconds * 2];
        prevS2 = timeCache.minuteDigits[lastSeconds * 2 + 1];
      } else {
        prevS1 = null;
        prevS2 = null;
      }
    } else {
      s1 = (secondsNum / 10) | 0;  // Bitwise OR for integer division
      s2 = secondsNum % 10;
      prevS1 = lastSeconds === null ? null : (lastSeconds / 10) | 0;
      prevS2 = lastSeconds === null ? null : lastSeconds % 10;
    }
    
    function updateDigit(index) {
      // Check if we should stop
      if (!isDrawing || pendingSwitch || showingClockInfo) {
        isSeconds = false;
        return;
      }
      
      const currentDigit = index === 0 ? s1 : s2;
      const prevDigit = index === 0 ? prevS1 : prevS2;
      
      if (currentDigit !== prevDigit) {
        drawSecondDigit(index, currentDigit, prevDigit, () => {
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
      lastSeconds = secondsNum;
      isSeconds = false;
      
      // If we're locked after finishing animation, clear the seconds
      if (settings.seconds === "dynamic" && Bangle.isLocked() && !showingClockInfo) {
        clearSeconds();
        return;
      }
      
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

  const drawSecondDigit = (index, digit, prevDigit, callback, skipAnimation) => {
    drawDigit(positions.seconds.x[index], positions.seconds.y + widgetYOffset, SEC_SCALE, digit, prevDigit, callback, skipAnimation, false);
  }

  const clearSeconds = (callback) => {
    // If not drawing seconds, just call callback
    if (lastSeconds === null) {
      if (callback) callback();
      return;
    }

    // Cancel any pending seconds update
    if (secondsTimeout) {
      clearTimeout(secondsTimeout);
      secondsTimeout = null;
    }

    // Always do sequential animated clearing using cached lookups
    isSeconds = true;
    let s1, s2;
    
    if (timeCache && timeCache.minuteDigits) {
      s1 = timeCache.minuteDigits[lastSeconds * 2];
      s2 = timeCache.minuteDigits[lastSeconds * 2 + 1];
    } else {
      s1 = (lastSeconds / 10) | 0;  // Bitwise OR for integer division
      s2 = lastSeconds % 10;
    }
    
    drawDigit(positions.seconds.x[0], positions.seconds.y + widgetYOffset, SEC_SCALE, null, s1, () => {
      drawDigit(positions.seconds.x[1], positions.seconds.y + widgetYOffset, SEC_SCALE, null, s2, () => {
        lastSeconds = null;
        isSeconds = false;
        if (callback) callback();
      }, false, false);
    }, false, false);
  }

  // ===== ANIMATION CLEANUP =====
  const cancelAllAnimations = () => {
    // Use typed array for better performance
    for (let i = 0; i < animationTimeoutCount; i++) {
      clearTimeout(animationTimeouts[i]);
    }
    animationTimeoutCount = 0;
  }
  
  // ===== SWITCHING FUNCTIONS (Optimized with direct state changes) =====
  const switchToClockInfo = () => {
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
    
    if (showSeconds && lastSeconds !== null) {
      clearSeconds(show);
    } else {
      show();
    }
  }

  const hideClockInfo = () => {
    if (!showingClockInfo) return;
    
    pendingSwitch = false;
    cancelAllAnimations();
    showingClockInfo = false;
    clockInfoUnfocused = false;
    
    g.setColor(g.theme.bg);
    g.fillRect(0, positions.seconds.y + widgetYOffset - 10, width, positions.seconds.y + widgetYOffset + 50);
    g.flip();
  }

  const switchToSeconds = () => {
    if (!showingClockInfo || !showSeconds) return;
    
    pendingSwitch = false;
    cancelAllAnimations();
    userClockInfoPreference = 'hide';
    showingClockInfo = false;
    clockInfoUnfocused = false;
    lastSeconds = null;
    
    g.setColor(g.theme.bg);
    g.fillRect(0, positions.seconds.y + widgetYOffset - 10, width, positions.seconds.y + widgetYOffset + 50);
    g.flip();
    
    updateAndAnimTime();
  }

  // ===== TOUCH HANDLING =====
  const setupTouchHandler = () => {
    // Remove old handler if exists
    if (touchHandler) {
      Bangle.removeListener("touch", touchHandler);
    }
    
    touchHandler = (_, e) => {
      // Main time area - cycles through clock info states when clock info is available
      if (e.y >= mainTimeArea.top && e.y <= mainTimeArea.bottom) {
        if (showingClockInfo) {
          if (!clockInfoUnfocused) {
            // First tap: unfocus
            if (settings.haptics !== false) Bangle.buzz(40);
            clockInfoUnfocused = true;
            if (clockInfoMenu) {
              clockInfoMenu.focus = false;
              clockInfoMenu.redraw();
            }
            g.flip();
          } else {
            // Second tap: dismiss
            if (settings.haptics !== false) Bangle.buzz(60);
            if (showSeconds) {
              switchToSeconds();
            } else {
              userClockInfoPreference = 'hide';
              hideClockInfo();
            }
          }
        }
        return;
      }
      
      // Bottom area - toggles between seconds and clock info
      if (e.y >= bottomArea.top && e.y <= bottomArea.bottom) {
        if (showingClockInfo) {
          // Refocus if unfocused
          if (clockInfoUnfocused) {
            if (settings.haptics !== false) Bangle.buzz(50);
            clockInfoUnfocused = false;
            if (clockInfoMenu) {
              clockInfoMenu.focus = true;
              clockInfoMenu.redraw();
            }
            g.flip();
          }
          // When focused, do nothing (don't hide)
        } else {
          // Switch to clock info if available
          if (clockInfoMenu) {
            if (settings.haptics !== false) Bangle.buzz(50);
            userClockInfoPreference = 'show';
            switchToClockInfo();
          }
        }
      }
    };
    
    // Add the handler
    Bangle.on("touch", touchHandler);
  }

  // ===== CLOCK INFO SETUP =====
  const setupClockInfo = () => {
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
          if (text.indexOf(' ') === -1) {
            g.setFont("6x8:2");
            if (g.stringWidth(text) > maxTextWidth) g.setFont("6x8:1");
          } else {
            g.setFont("6x8:2");
            const lines = g.wrapString(text, maxTextWidth);
            text = lines.slice(0, 2).join("\n") + (lines.length > 2 ? "..." : "");
          }
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
  const drawClock = () => {
    g.clear(Bangle.appRect);
    if (settings.widgets !== "hide") Bangle.drawWidgets();
    lastTime = null;
    lastSeconds = null;
    isColonDrawn = false;
    
    // Initialize essential caches
    if (!timeCache) initEssentialCaches();
    if (!colorOn || !colorOff) initColorTables();
    
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
      lastTime = null;
      lastSeconds = null;
      isColonDrawn = false;
      isDrawing = false;
      pendingSwitch = false;
      isSeconds = false;
      
      // Clear animation system
      colorOn = null;
      colorOff = null;
      
      // Clear caches
      timeCache = null;
      
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
        if (!showingClockInfo && lastSeconds !== null) {
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
          updateSeconds();
        }
      }
    }
  };
  
  // Add the handler
  Bangle.on('lock', lockHandler);

  // ===== START CLOCK =====
  drawClock();
})();