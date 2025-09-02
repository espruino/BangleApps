/**
 * Timer Widget for BangleJS 2
 * 
 * A battery-optimized timer widget with gesture-based controls and accidental activation protection.
 * Features double-swipe unlock mechanism, visual feedback, and adaptive refresh rates.
 * 
 * @author Claude AI Assistant
 * @version 0.03
 */
(() => {
  "use strict";

  // =============================================================================
  // CONSTANTS
  // =============================================================================
  
  /** Timer adjustment constants (in seconds) */
  const ONE_MINUTE = 60;
  const TEN_MINUTES = 600;
  const DEFAULT_TIME = 300; // 5 minutes
  
  /** Refresh rate constants for battery optimization */
  const COUNTDOWN_INTERVAL_NORMAL = 10000; // 10 seconds when > 1 minute
  const COUNTDOWN_INTERVAL_FINAL = 1000;   // 1 second when <= 1 minute
  
  /** Completion notification constants */
  const BUZZ_COUNT = 3;
  const BUZZ_TOTAL_TIME = 5000; // 5 seconds total
  
  /** Gesture control constants */
  const UNLOCK_GESTURE_TIMEOUT = 1500; // milliseconds before unlock gesture has to be started from scratcb
  const UNLOCK_CONTROL_TIMEOUT = 5000; // milliseconds before gesture control locks again 
  const DIRECTION_LEFT = "left";
  const DIRECTION_RIGHT = "right";
  const DIRECTION_UP = "up";
  const DIRECTION_DOWN = "down";




  // =============================================================================
  // STATE VARIABLES
  // =============================================================================
  
  var settings;
  var interval = 0;
  var remainingTime = 0; // in seconds

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Format time as MM:SS (allowing MM > 59)
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  function formatTime(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
  }

  // =============================================================================
  // SETTINGS MANAGEMENT
  // =============================================================================

  /**
   * Save current settings to storage
   */
  function saveSettings() {
    require('Storage').writeJSON('widtimer.json', settings);
  }

  /**
   * Load settings from storage and calculate current timer state
   */
  function loadSettings() {
    settings = require('Storage').readJSON('widtimer.json', 1) || {
      totalTime: DEFAULT_TIME,
      running: false,
      startTime: 0
    };

    // Calculate remaining time if timer was running
    if (settings.running && settings.startTime) {
      var elapsed = Math.floor((Date.now() - settings.startTime) / 1000);
      remainingTime = Math.max(0, settings.totalTime - elapsed);
      if (remainingTime === 0) {
        settings.running = false;
        saveSettings();
      }
    } else {
      remainingTime = settings.totalTime;
    }
  }

  // =============================================================================
  // TIMER CONTROL FUNCTIONS
  // =============================================================================

  /**
   * Main countdown function - handles timer progression and battery optimization
   */
  function countdown() {
    if (!settings.running) return;

    var elapsed = Math.floor((Date.now() - settings.startTime) / 1000);
    var oldRemainingTime = remainingTime;
    remainingTime = Math.max(0, settings.totalTime - elapsed);

    // Switch to faster refresh when entering final minute for better accuracy
    if (oldRemainingTime > 60 && remainingTime <= 60 && interval) {
      clearInterval(interval);
      interval = setInterval(countdown, COUNTDOWN_INTERVAL_FINAL);
    }

    if (remainingTime <= 0) {
      // Timer finished - provide completion notification
      buzzMultiple();
      settings.running = false;
      remainingTime = settings.totalTime; // Reset to original time
      saveSettings();
      if (interval) {
        clearInterval(interval);
        interval = 0;
      }
    }

    WIDGETS["widtimer"].draw();
  }

  /**
   * Generate multiple buzzes for timer completion notification
   */
  function buzzMultiple() {
    var buzzInterval = BUZZ_TOTAL_TIME / BUZZ_COUNT;
    for (var i = 0; i < BUZZ_COUNT; i++) {
      (function(delay) {
        setTimeout(function() {
          Bangle.buzz(300);
        }, delay);
      })(i * buzzInterval);
    }
  }

  /**
   * Start the timer with battery-optimized refresh rate
   */
  function startTimer() {
    if (remainingTime > 0 && !settings.running) {
      settings.running = true;
      settings.startTime = Date.now();
      saveSettings();
      if (!interval) {
        // Use different intervals based on remaining time for battery optimization
        var intervalTime = remainingTime <= 60 ? COUNTDOWN_INTERVAL_FINAL : COUNTDOWN_INTERVAL_NORMAL;
        interval = setInterval(countdown, intervalTime);
      }
    }
  }

  /**
   * Adjust timer by specified number of seconds
   * @param {number} seconds - Positive or negative adjustment in seconds
   */
  function adjustTimer(seconds) {
    if (settings.running) {
      // For running timer, adjust both total time and remaining time
      settings.totalTime = Math.max(0, settings.totalTime + seconds);
      remainingTime = Math.max(0, remainingTime + seconds);

      // If remaining time becomes 0 or negative, stop the timer
      if (remainingTime <= 0) {
        settings.running = false;
        remainingTime = 0;
        if (interval) {
          clearInterval(interval);
          interval = 0;
        }
        // Provide feedback if timer finished due to negative adjustment
        if (remainingTime === 0) {
          buzzMultiple();
        }
      }
    } else {
      // Adjust stopped timer
      settings.totalTime = Math.max(0, settings.totalTime + seconds);
      remainingTime = settings.totalTime;

    }

    saveSettings();
    WIDGETS["widtimer"].draw();
  }

  // =============================================================================
  // GESTURE CONTROL SYSTEM
  // =============================================================================

  // Gesture state variables
  var drag = null;
  var lastSwipeTime = 0;
  var lastSwipeDirection = null;
  var isControlLocked = true;

  /**
   * Reset gesture controls to locked state
   */
  function resetUnlock() {
    isControlLocked = true;
    WIDGETS["widtimer"].draw();
  }

  function isHorizontal(direction) {
    return (direction == DIRECTION_LEFT) || (direction == DIRECTION_RIGHT)
  }

  function isVertical(direction) {
    return (direction == DIRECTION_UP) || (direction == DIRECTION_DOWN)
  }

  function isUnlockGesture(first_direction, second_direction) {
    return (isHorizontal(first_direction) && isVertical(second_direction)
      || isVertical(first_direction) && isHorizontal(second_direction)) 
  }

  /**
   * Set up gesture handlers with double-swipe protection against accidental activation
   */
  function setupGestures() {
    Bangle.on("drag", function(e) {
      if (!drag) {
        // Start tracking drag gesture
        drag = {x: e.x, y: e.y};
      } else if (!e.b) {
        // Drag gesture completed
        var dx = e.x - drag.x;
        var dy = e.y - drag.y;
        drag = null;

        // Only process significant gestures
        if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
          var currentTime = Date.now();
          var direction = null;
          var adjustment = 0;

          // Determine gesture direction and timer adjustment
          if (Math.abs(dx) > Math.abs(dy) + 10) {
            // Horizontal swipe detected
            if (dx > 0) {
              direction = 'right';
              adjustment = ONE_MINUTE;
            } else {
              direction = 'left';
              adjustment = -ONE_MINUTE;
            }
          } else if (Math.abs(dy) > Math.abs(dx) + 10) {
            // Vertical swipe detected
            if (dy > 0) {
              direction = 'down';
              adjustment = -TEN_MINUTES;
            } else {
              direction = 'up';
              adjustment = TEN_MINUTES;
            }
          }

          if (direction) {
            // Process gesture based on lock state
            if (!isControlLocked) {
              // Controls unlocked - execute adjustment immediately
              adjustTimer(adjustment);
            } else if (isUnlockGesture(direction, lastSwipeDirection) && 
                       currentTime - lastSwipeTime < UNLOCK_GESTURE_TIMEOUT) {
              // Double swipe detected - unlock controls and execute
              isControlLocked = false;
              // adjustTimer(adjustment);
              Bangle.buzz(50); // Provide unlock feedback

              // Auto-start if time > 0
              if (settings.totalTime > 0) {
                startTimer();
              }

              // Auto-lock after `UNLOCK_CONTROL_TIMEOUT` seconds of inactivity
              setTimeout(resetUnlock, UNLOCK_CONTROL_TIMEOUT);
            }

            // Update gesture tracking state
            lastSwipeDirection = direction;
            lastSwipeTime = currentTime;
          }
        }
      }
    });
  }

  // =============================================================================
  // WIDGET DEFINITION
  // =============================================================================

  /**
   * Main widget object following BangleJS widget conventions
   */
  WIDGETS["widtimer"] = {
    area: "tl",
    width: 58, // Optimized width for vector font display

    /**
     * Draw the widget with current timer state and visual feedback
     */
    draw: function() {
      g.reset();
      g.setFontAlign(0, 0);
      g.clearRect(this.x, this.y, this.x + this.width, this.y + 23);

      // Use vector font for crisp, scalable display
      g.setFont("Vector", 16);
      var timeStr = formatTime(remainingTime);

      // Set color based on current timer state
      if (settings.running && remainingTime > 0) {
        g.setColor("#ffff00"); // Yellow when running (visible on colored backgrounds)
      } else if (remainingTime === 0) {
        g.setColor("#ff0000"); // Red when finished
      } else if (!isControlLocked) {
        g.setColor("#00ff88"); // Light green when controls unlocked
      } else {
        g.setColor("#ffffff"); // White when stopped/locked
      }

      g.drawString(timeStr, this.x + this.width/2, this.y + 12);
      g.setColor("#ffffff"); // Reset graphics color
    },

    /**
     * Reload widget state from storage and restart timer if needed
     */
    reload: function() {
      loadSettings();

      // Clear any existing countdown interval
      if (interval) {
        clearInterval(interval);
        interval = 0;
      }

      // Restart countdown if timer was previously running
      if (settings.running && remainingTime > 0) {
        var intervalTime = remainingTime <= 60 ? COUNTDOWN_INTERVAL_FINAL : COUNTDOWN_INTERVAL_NORMAL;
        interval = setInterval(countdown, intervalTime);
      }

      this.draw();
    }
  };

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  // Initialize widget and set up gesture handlers
  WIDGETS["widtimer"].reload();
  setupGestures();
})();