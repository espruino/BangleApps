{
  const storage = require("Storage");
  const locale = require("locale");
  const widgets = require("widget_utils");
  const background = require("clockbg");

  const SETTINGS_FILE = "boxclk.settings.json";
  const DEFAULT_CONFIG_FILE = "boxclk.default-cfg.json";
  const CONFIG_PREFIX = "boxclk.cfg.";
  const CONFIG_SUFFIX = ".json";
  const DEFAULT_CONFIG = "default";
  const MULTI_TAP_MS = 500;
  const EDIT_ENTRY_TAPS = 3;
  const SAVE_EXIT_TAPS = 2;
  const OUTLINE_OFFSETS_X = [-1, 0, 1, -1, 1, -1, 0, 1];
  const OUTLINE_OFFSETS_Y = [-1, -1, -1, 0, 0, 1, 1, 1];
  const width = g.getWidth();
  const height = g.getHeight();

  let activeConfigName = DEFAULT_CONFIG;
  let config = null;
  let bgImage = null;
  let drawTimeout;
  let tapTimer = null;
  let tapCount = 0;
  let editMode = false;
  let editPromptOpen = false;
  let selectedItem = null;
  let systemTimeMode;
  let liveBattery = 0;
  let liveSteps = 0;
  let liveCharging = false;
  let touchHandler;
  let dragHandler;
  let lockHandler;
  let stepHandler;
  let chargingHandler;
  let fontCache = {};
  let suppressRemoveCleanup = false;
  let cleanedUp = false;

  const saveIcon = require("heatshrink").decompress(atob("mEwwkEogA/AHdP/4AK+gWVDBQWNAAIuVGBAIB+UQdhMfGBAHBCxUAgIXHIwPyCxQwEJAgXB+MAl/zBwQGBn8ggQjBGAQXG+EA/4XI/8gBIQXTGAMPC6n/C6HzkREBC6YACC6QAFC57aHCYIXOOgLsEn4XPABIX/C6vykQAEl6/WgCQBC5imFAAT2BC5gCBI4oUCC5x0IC/4X/C4K8Bl4XJ+TCCC4wKBABkvC4tEEoMQCxcBB4IWEC4XyDBUBFwIXGJAIAOIwowDABoWGGB4uHDBwWJAH4AzA"));
  const chargeIndicatorData = E.toString(require("heatshrink").decompress(atob("mUywMB/4AOz4FE44FE+IFE/AFE/k/AwkPAomDAonAAonwv4kEj4kEg4SEKguADAnAG4nwG4n4gYkEgAeEgAYEwA3E4EADIfwSIIkDAoI4CEgMADIX+AoI4DwEAK4YkBK4YkFHwRdEHwvgLop8E/x8GUIp8FTYq6FQQn/4IFE8DfFEgn+Egn/x4FE8b+K/hoE/7+FABPw")));
  const chargeIndicator = {
    width: chargeIndicatorData.charCodeAt(0),
    height: chargeIndicatorData.charCodeAt(1),
    bpp: chargeIndicatorData.charCodeAt(2) & 127,
    transparent: chargeIndicatorData.charCodeAt(3),
    buffer: E.toArrayBuffer(chargeIndicatorData.substr(4)),
    palette: new Uint16Array([0, 0])
  };

  background.load();

  const clone = value => JSON.parse(JSON.stringify(value));

  const sanitizeConfigName = name => {
    name = (name || "").toString().trim().toLowerCase();
    name = name.replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    return name || DEFAULT_CONFIG;
  };

  const configFilename = name => {
    name = sanitizeConfigName(name);
    if (name === DEFAULT_CONFIG) return DEFAULT_CONFIG_FILE;
    return CONFIG_PREFIX + name + CONFIG_SUFFIX;
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const toInt = (value, fallback) => {
    value = Math.round(Number(value));
    return isFinite(value) ? value : fallback;
  };

  const clampFontSize = (font, value) => clamp(toInt(value, 1), 1, font === "Vector" ? 96 : 8);

  const loadCustomFont = fontFile => {
    if (!fontFile) return null;
    if (Object.prototype.hasOwnProperty.call(fontCache, fontFile)) return fontCache[fontFile];
    const fontData = storage.read(fontFile);
    if (!fontData) {
      fontCache[fontFile] = null;
      return null;
    }
    fontCache[fontFile] = fontData;
    return fontCache[fontFile];
  };

  const applyFont = appearance => {
    appearance = appearance || {};
    const fontName = appearance.font || "6x8";
    const fontSize = clampFontSize(fontName, appearance.fontSize);
    if (fontName === "Vector" && g.setFontVector) {
      g.setFontVector(fontSize);
      return;
    }
    const custom = loadCustomFont(appearance.fontFile);
    if (custom && g.setFontPBF) {
      try {
        g.setFontPBF(custom, fontSize);
        return;
      } catch (error) {
      }
    }
    try {
      g.setFont(fontName, fontSize);
    } catch (error) {
      g.setFont("6x8", clampFontSize("6x8", fontSize));
    }
  };

  const normalizeBool = (value, defaultValue) => value === undefined ? defaultValue : !!value;

  const uniqueItemName = (base, usedNames) => {
    base = (base || "Item").toString().trim() || "Item";
    let candidate = base;
    let index = 2;
    while (usedNames[candidate]) candidate = base + " " + index++;
    usedNames[candidate] = true;
    return candidate;
  };

  const defaultAppearanceForType = type => {
    if (type === "time") {
      return {
        font: "BrunoAce",
        fontFile: "boxclk-brunoace.pbf",
        fontSize: 1,
        outline: 2,
        textColor: "#000",
        outlineColor: "#fff",
        borderColor: "#000",
        boundary: { x: 0, y: -4 }
      };
    }
    if (type === "battery" || type === "steps") {
      return {
        font: "4x6",
        fontSize: 2,
        outline: 1,
        textColor: "#0ff",
        outlineColor: "#000",
        borderColor: "#fff",
        boundary: { x: -0.5, y: -0.5 }
      };
    }
    return {
      font: "6x8",
      fontSize: type === "date" ? 1 : 2,
      outline: 1,
      textColor: "#000",
      outlineColor: "#fff",
      borderColor: "#000",
      boundary: { x: type === "date" ? 0 : -0.5, y: 0.5 }
    };
  };

  const saveSettings = () => {
    const settings = storage.readJSON(SETTINGS_FILE, 1) || {};
    settings.selectedConfig = activeConfigName;
    storage.writeJSON(SETTINGS_FILE, settings);
  };

  const syncDataListeners = () => {
    if (stepHandler) Bangle.removeListener("step", stepHandler);
    if (chargingHandler) Bangle.removeListener("charging", chargingHandler);
    if (config.f & 2) {
      Bangle.on("step", stepHandler);
    }
    if (config.f & 4) {
      Bangle.on("charging", chargingHandler);
    }
  };

  const normalizeAppearance = appearance => {
    appearance = appearance || {};
    const font = appearance.font || "6x8";
    const boundaryX = appearance.boundary && isFinite(appearance.boundary.x) ? appearance.boundary.x : 0;
    const boundaryY = appearance.boundary && isFinite(appearance.boundary.y) ? appearance.boundary.y : 0;
    return {
      font: font,
      fontFile: typeof appearance.fontFile === "string" && appearance.fontFile ? appearance.fontFile : undefined,
      fontSize: clampFontSize(font, appearance.fontSize),
      outline: clamp(toInt(appearance.outline, 0), 0, 6),
      textColor: appearance.textColor || "fg",
      outlineColor: appearance.outlineColor || "bg",
      borderColor: appearance.borderColor || "bgH",
      boundary: {
        x: boundaryX,
        y: boundaryY
      }
    };
  };

  const normalizeOptions = (type, options) => {
    options = options || {};
    if (type === "time") {
      return {
        timeMode: ["system", "12h", "24h"].includes(options.timeMode) ? options.timeMode : "system",
        showSeconds: normalizeBool(options.showSeconds, false)
      };
    }
    if (type === "date") {
      return {
        longMonth: normalizeBool(options.longMonth, true),
        showYear: normalizeBool(options.showYear, true),
        suffix: normalizeBool(options.suffix, true)
      };
    }
    if (type === "day" || type === "meridian") {
      return {
        short: normalizeBool(options.short, type === "meridian")
      };
    }
    return {};
  };

  const normalizeItem = (item, usedNames) => {
    item = item || {};
    const type = ["time", "date", "day", "meridian", "battery", "steps", "text"].includes(item.type) ? item.type : "text";
    const normalized = {
      name: uniqueItemName(item.name || (type === "text" ? "Custom Text" : type.charAt(0).toUpperCase() + type.slice(1)), usedNames),
      type: type,
      prefix: item.prefix || "",
      suffix: item.suffix || "",
      text: item.text || "",
      position: {
        x: clamp(item.position && isFinite(item.position.x) ? item.position.x : 0.5, 0, 1),
        y: clamp(item.position && isFinite(item.position.y) ? item.position.y : 0.5, 0, 1)
      },
      appearance: normalizeAppearance(item.appearance || defaultAppearanceForType(type)),
      options: normalizeOptions(type, item.options),
      _x: 0,
      _y: 0,
      _metrics: null,
      _displayText: null
    };
    normalized._x = normalized.position.x * width;
    normalized._y = normalized.position.y * height;
    return normalized;
  };

  const normalizeConfig = rawConfig => {
    if (!rawConfig || !Array.isArray(rawConfig.items)) {
      return null;
    }
    const usedNames = {};
    const normalized = {
      background: rawConfig.background || { type: "clockbg" },
      items: [],
      f: 0
    };
    rawConfig.items.forEach(item => {
      item = normalizeItem(item, usedNames);
      normalized.items.push(item);
      if (item.type === "time" && item.options.showSeconds) normalized.f |= 1;
      else if (item.type === "steps") normalized.f |= 2;
      else if (item.type === "battery") normalized.f |= 4;
    });
    return normalized;
  };

  const serialiseConfig = () => ({
    background: clone(config.background || { type: "clockbg" }),
    items: config.items.map(item => {
      return {
        name: item.name,
        type: item.type,
        prefix: item.prefix || "",
        suffix: item.suffix || "",
        text: item.type === "text" ? (item.text || "") : undefined,
        position: {
          x: +(clamp(item._x / width, 0, 1)).toFixed(3),
          y: +(clamp(item._y / height, 0, 1)).toFixed(3)
        },
        appearance: clone(item.appearance),
        options: clone(item.options || {})
      };
    })
  });

  const loadConfig = name => {
    name = sanitizeConfigName(name);
    fontCache = {};
    config = normalizeConfig(storage.readJSON(configFilename(name), 1));
    activeConfigName = name;
    if (!config && name !== DEFAULT_CONFIG) {
      activeConfigName = DEFAULT_CONFIG;
      config = normalizeConfig(storage.readJSON(DEFAULT_CONFIG_FILE, 1));
    }
    if (!config) throw new Error("Missing or invalid " + DEFAULT_CONFIG_FILE);
    bgImage = config.background && config.background.type === "image" && config.background.image ?
      storage.read(config.background.image) :
      null;
    systemTimeMode = (storage.readJSON("setting.json", 1) || {})["12hour"] ? 12 : 24;
  };

  const applyLiveState = data => {
    data = data || {};
    resetTapSequence();
    editPromptOpen = false;
    editMode = false;
    if (data.theme) {
      if (g.setTheme) g.setTheme(data.theme);
      else g.theme = data.theme;
    }
    if (data.selectedConfig) {
      loadConfig(data.selectedConfig);
      saveSettings();
      syncDataListeners();
    }
    clearSelection();
    if (Bangle.drawWidgets) Bangle.drawWidgets();
    draw();
    return 1;
  };

  const resolveColor = color => {
    if (typeof color === "number") return color;
    if (typeof color === "string") {
      if (color in g.theme) return g.theme[color];
      return g.toColor(color);
    }
    return g.theme.fg;
  };

  const usesEnglishOrdinals = (() => {
    const name = ((locale.name || "system") + "").toLowerCase();
    return name === "system" || /^en(?:[_ -]|$)/.test(name);
  })();

  const formatItemValue = (item, date) => {
    let value = "";
    if (item.type === "time") {
      const mode = item.options.timeMode || "system";
      const timeMode = mode === "12h" ? 12 : mode === "24h" ? 24 : systemTimeMode;
      let hours = date.getHours();
      if (timeMode === 12) hours = hours % 12 || 12;
      const hoursString = String(hours);
      const minutesString = ("0" + date.getMinutes()).substr(-2);
      value = hoursString + ":" + minutesString;
      if (item.options.showSeconds) {
        value += ":" + ("0" + date.getSeconds()).substr(-2);
      }
    } else if (item.type === "meridian") {
      const meridian = ((locale.meridian ? locale.meridian(date, true) : "") || (date.getHours() >= 12 ? "PM" : "AM")).toUpperCase();
      value = item.options.short ? (Array.from(meridian)[0] || meridian) : meridian;
    } else if (item.type === "date") {
      const month = locale.month(date, item.options.longMonth ? 0 : 1);
      const day = date.getDate();
      const dayString = String(day) + (item.options.suffix && usesEnglishOrdinals ? (day > 10 && day < 14 ? "th" : day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th") : "");
      value = month + " " + dayString + (item.options.showYear ? ", " + date.getFullYear() : "");
    } else if (item.type === "day") {
      value = locale.dow(date, item.options.short ? 1 : 0);
    } else if (item.type === "battery") {
      value = liveBattery;
    } else if (item.type === "steps") {
      value = liveSteps;
    } else {
      value = item.text || "";
    }
    return (item.prefix || "") + value + (item.suffix || "");
  };

  const hasChargeIndicator = item => item && item.type === "battery" && liveCharging;

  const getTextContentLayout = (item, text) => {
    applyFont(item.appearance);
    const fontHeight = g.getFontHeight();
    const indicator = hasChargeIndicator(item) ? (function() {
      const height = Math.max(7, Math.round(fontHeight * 0.95));
      const scale = height / chargeIndicator.height;
      return {
        width: Math.max(1, Math.round(chargeIndicator.width * scale)),
        height: height,
        gap: Math.max(1, Math.round(height * 0.2)),
        scale: scale
      };
    })() : null;
    const textWidth = g.stringWidth(text);
    return {
      textHeight: fontHeight,
      indicator: indicator,
      width: textWidth + (indicator ? indicator.width + indicator.gap : 0),
      height: Math.max(fontHeight, indicator ? indicator.height : 0)
    };
  };

  const drawTextContent = (item, text, centerX, centerY, color, layout) => {
    layout = layout || getTextContentLayout(item, text);
    const left = centerX + getSpanStart(layout.width);
    const top = centerY + getSpanStart(layout.height);
    let textX = left;
    g.setColor(color);
    if (layout.indicator) {
      const iconY = top + Math.round((layout.height - layout.indicator.height) / 2);
      chargeIndicator.palette[0] = g.getColor();
      g.drawImage(chargeIndicator, textX, iconY, { scale: layout.indicator.scale });
      textX += layout.indicator.width + layout.indicator.gap;
    }
    g.drawString(text, textX, top + Math.round((layout.height - layout.textHeight) / 2));
  };

  const getDisplayText = (item, now, refresh) => {
    if (refresh || item._displayText == null) {
      item._displayText = formatItemValue(item, now || new Date());
    }
    return item._displayText;
  };

  const getSpanStart = length => -(length - 1) / 2;
  const getSpanEnd = length => (length - 1) / 2;

  const getItemMetrics = (item, text) => {
    if (text === undefined) text = getDisplayText(item);
    const appearance = item.appearance;
    const boundary = appearance.boundary;
    const metricsKey = text + "|" + (hasChargeIndicator(item) ? 1 : 0) + "|" + appearance.font + "|" + appearance.fontSize + "|" + appearance.outline + "|" + boundary.x + "|" + boundary.y;
    if (item._metrics && item._metrics.key === metricsKey) {
      return item._metrics;
    }
    const layout = getTextContentLayout(item, text);
    const outline = appearance.outline;
    const textWidth = Math.max(1, layout.width + outline * 2);
    const textHeight = Math.max(1, layout.height + outline * 2);
    const textX1 = getSpanStart(textWidth);
    const textY1 = getSpanStart(textHeight);
    const textX2 = getSpanEnd(textWidth);
    const textY2 = getSpanEnd(textHeight);
    const boundaryWidth = Math.max(1, textWidth + boundary.x * 2);
    const boundaryHeight = Math.max(1, textHeight + boundary.y * 2);
    const boundaryX1 = getSpanStart(boundaryWidth);
    const boundaryY1 = getSpanStart(boundaryHeight);
    const boundaryX2 = getSpanEnd(boundaryWidth);
    const boundaryY2 = getSpanEnd(boundaryHeight);
    const unionX1 = Math.min(textX1, boundaryX1);
    const unionY1 = Math.min(textY1, boundaryY1);
    const unionX2 = Math.max(textX2, boundaryX2);
    const unionY2 = Math.max(textY2, boundaryY2);
    item._metrics = {
      key: metricsKey,
      layout: layout,
      textX1: textX1,
      textY1: textY1,
      textX2: textX2,
      textY2: textY2,
      boundaryX1: boundaryX1,
      boundaryY1: boundaryY1,
      boundaryX2: boundaryX2,
      boundaryY2: boundaryY2,
      unionX1: unionX1,
      unionY1: unionY1,
      unionX2: unionX2,
      unionY2: unionY2
    };
    return item._metrics;
  };

  const drawItemText = (item, text, layout) => {
    const x = item._x;
    const y = item._y;
    const outline = item.appearance.outline;
    layout = layout || getTextContentLayout(item, text);
    applyFont(item.appearance);
    const textColor = resolveColor(item.appearance.textColor);

    if (outline > 0) {
      const outlineColor = resolveColor(item.appearance.outlineColor);
      for (let i = 0; i < OUTLINE_OFFSETS_X.length; i++) {
        drawTextContent(
          item,
          text,
          x + OUTLINE_OFFSETS_X[i] * outline,
          y + OUTLINE_OFFSETS_Y[i] * outline,
          outlineColor,
          layout
        );
      }
    }

    drawTextContent(item, text, x, y, textColor, layout);
  };

  const resetTapSequence = () => {
    if (tapTimer) clearTimeout(tapTimer);
    tapTimer = null;
    tapCount = 0;
  };

  const registerTap = (targetCount, callback) => {
    tapCount += 1;
    if (tapTimer) clearTimeout(tapTimer);
    if (tapCount >= targetCount) {
      resetTapSequence();
      callback();
      return;
    }
    tapTimer = setTimeout(() => {
      tapTimer = null;
      tapCount = 0;
    }, MULTI_TAP_MS);
  };

  const clearSelection = () => {
    selectedItem = null;
    if (editMode) return widgets.hide();
    widgets.show();
    widgets.swipeOn();
  };

  const setEditMode = value => {
    editMode = value;
    clearSelection();
    draw();
  };

  const showEditModePrompt = () => {
    if (editPromptOpen) return;
    editPromptOpen = true;
    resetTapSequence();
    suppressRemoveCleanup = true;
    E.showPrompt(
      "Tap a box to select it.\nDrag to move it.\nTap outside to deselect.\nDouble-tap the background to save and exit.",
      {
        title: "Layout",
        buttons: { "Cancel": false, "OK": true }
      }
    ).then(ok => {
      suppressRemoveCleanup = false;
      installClockUI();
      editPromptOpen = false;
      if (ok) setEditMode(true);
      else draw();
    });
  };

  const draw = () => {
    const bg = config.background;
    const now = new Date();
    if (config.f & 4) {
      liveBattery = E.getBattery();
      liveCharging = !!Bangle.isCharging();
    } else liveCharging = false;
    if (config.f & 2) liveSteps = Bangle.getHealthStatus("day").steps;
    if (bg.type === "image" && bgImage) {
      g.clear();
      g.drawImage(bgImage, 0, 0);
    } else if (bg.type === "solid") {
      g.setBgColor(resolveColor(bg.color || "bg")).clear();
    } else if (bg.type === "clockbg") {
      g.clear();
      background.fillRect(0, 0, width, height);
    } else {
      g.setBgColor(g.theme.bg).clear();
    }
    g.setFontAlign(-1, -1, 0);

    for (let i = 0; i < config.items.length; i++) {
      const item = config.items[i];
      const text = getDisplayText(item, now, !editMode);
      let layout;
      if (item === selectedItem) {
        const metrics = getItemMetrics(item, text);
        g.setColor(resolveColor(item.appearance.borderColor));
        g.drawRect(
          Math.max(0, Math.ceil(item._x + metrics.boundaryX1)),
          Math.max(0, Math.ceil(item._y + metrics.boundaryY1)),
          Math.min(width - 1, Math.floor(item._x + metrics.boundaryX2)),
          Math.min(height - 1, Math.floor(item._y + metrics.boundaryY2))
        );
        layout = metrics.layout;
      }
      drawItemText(item, text, layout);
    }

    if (drawTimeout) clearTimeout(drawTimeout);
    if (editMode || selectedItem || editPromptOpen) return;
    const delay = config.f & 1 ? 1000 - (Date.now() % 1000) : 60000 - (Date.now() % 60000);
    drawTimeout = setTimeout(() => {
      drawTimeout = undefined;
      draw();
    }, delay);
  };

  const cleanupApp = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    E.removeListener("kill", cleanupApp);
    if (touchHandler) Bangle.removeListener("touch", touchHandler);
    if (dragHandler) Bangle.removeListener("drag", dragHandler);
    if (lockHandler) Bangle.removeListener("lock", lockHandler);
    if (stepHandler) Bangle.removeListener("step", stepHandler);
    if (chargingHandler) Bangle.removeListener("charging", chargingHandler);
    if (drawTimeout) clearTimeout(drawTimeout);
    if (tapTimer) clearTimeout(tapTimer);
    drawTimeout = undefined;
    tapTimer = null;
    tapCount = 0;
    editMode = false;
    editPromptOpen = false;
    selectedItem = null;
    suppressRemoveCleanup = false;
    widgets.show();
    background.unload();
    touchHandler = undefined;
    dragHandler = undefined;
    lockHandler = undefined;
    stepHandler = undefined;
    chargingHandler = undefined;
    fontCache = {};
    delete global.__boxclkApply;
  };

  const installClockUI = () => {
    Bangle.setUI({
      mode: "clock",
      redraw: draw,
      remove: function() {
        if (suppressRemoveCleanup) return;
        cleanupApp();
      }
    });
  };

  touchHandler = (_, event) => {
    if (editPromptOpen) return;

    if (!editMode) {
      registerTap(EDIT_ENTRY_TAPS, showEditModePrompt);
      return;
    }

    let touchedItem = null;
    for (let i = config.items.length - 1; i >= 0; i--) {
      const item = config.items[i];
      const metrics = getItemMetrics(item);
      if (
        event.x >= item._x + metrics.unionX1 &&
        event.x <= item._x + metrics.unionX2 &&
        event.y >= item._y + metrics.unionY1 &&
        event.y <= item._y + metrics.unionY2
      ) {
        touchedItem = item;
        break;
      }
    }

    if (touchedItem) {
      selectedItem = touchedItem;
      resetTapSequence();
      widgets.hide();
      draw();
      return;
    }

    if (selectedItem) {
      resetTapSequence();
      clearSelection();
      draw();
      return;
    }

    registerTap(SAVE_EXIT_TAPS, () => {
      storage.writeJSON(configFilename(activeConfigName), serialiseConfig());
      setEditMode(false);
      g.drawImage(saveIcon, width / 2 - 24, height / 2 - 24);
      setTimeout(() => draw(), 1200);
    });
  };

  dragHandler = event => {
    if (!editMode) return;
    const item = selectedItem;
    if (!item || !event.b) return;

    if (E.stopEventPropagation) E.stopEventPropagation();
    resetTapSequence();

    item._x += event.dx;
    item._y += event.dy;
    {
      const metrics = getItemMetrics(item);
      const maxPixelX = width - 1;
      const maxPixelY = height - 1;
      const minX = Math.max(-metrics.textX1, -metrics.boundaryX1);
      const maxX = Math.min(maxPixelX - metrics.textX2, maxPixelX - metrics.boundaryX2);
      const minY = Math.max(-metrics.textY1, -metrics.boundaryY1);
      const maxY = Math.min(maxPixelY - metrics.textY2, maxPixelY - metrics.boundaryY2);
      item._x = clamp(item._x, Math.min(minX, maxX), Math.max(minX, maxX));
      item._y = clamp(item._y, Math.min(minY, maxY), Math.max(minY, maxY));
    }
    draw();
  };

  lockHandler = locked => {
    if (!locked) return;
    resetTapSequence();
    if (editPromptOpen) editPromptOpen = false;
    if (editMode || selectedItem) setEditMode(false);
  };

  stepHandler = () => {
    if (!editMode && !selectedItem) draw();
  };

  chargingHandler = () => {
    if (!editMode && !selectedItem) draw();
  };

  {
    const name = sanitizeConfigName(((storage.readJSON(SETTINGS_FILE, 1) || {}).selectedConfig) || DEFAULT_CONFIG);
    loadConfig(name);
    if (activeConfigName !== name) saveSettings();
  }
  global.__boxclkApply = applyLiveState;

  installClockUI();
  E.on("kill", cleanupApp);

  Bangle.loadWidgets();
  widgets.swipeOn();
  Bangle.on("touch", touchHandler);
  Bangle.on("drag", dragHandler);
  Bangle.on("lock", lockHandler);
  syncDataListeners();
  draw();
}
