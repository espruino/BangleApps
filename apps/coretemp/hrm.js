var cp = require("coretemp.controlpoint");
var protocol = require("coretemp.protocol");
var store = require("coretemp.store");

var HRM_FILE = "coretemp.hrm.json";
var RECENT_LIMIT = 5;

var SCAN_START_ACK_TIMEOUT_MS = 3000;
var SCAN_WINDOW_DEFAULT_SEC = 5;
var SCAN_WINDOW_MIN_SEC = 5;
var SCAN_WINDOW_MAX_SEC = 30;
var SCAN_COUNT_TIMEOUT_MS = 5000;
var SCAN_ENTRY_TIMEOUT_MS = 5000;
var STATUS_TIMEOUT_MS = 5000;
var PAIR_TIMEOUT_MS = 10000;
var CLEAR_TIMEOUT_MS = 10000;
var REPLACE_CLEAR_SETTLE_MS = 2000;

var hrmState = {
  busy: false,
  operation: null,
  lastError: null,
  lastScan: [],
  paired: [],
  selected: null,
  recent: []
};

function cloneEntry(entry) {
  if (!entry) return null;
  return {
    index: entry.index || 0,
    antId: entry.antId,
    txType: entry.txType || 0,
    transport: entry.transport || "ANT+"
  };
}

function serializeEntry(entry) {
  var serialized;
  if (!entry) return null;
  serialized = {
    antId: entry.antId,
    transport: entry.transport || "ANT+"
  };
  if (entry.txType) serialized.txType = entry.txType;
  return serialized;
}

function getScanWindowMs() {
  var value = store.get().antScanWindowSec;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) value = parseInt(value, 10);
  if (typeof value !== "number" || isNaN(value) || (value | 0) !== value) value = SCAN_WINDOW_DEFAULT_SEC;
  if (value < SCAN_WINDOW_MIN_SEC || value > SCAN_WINDOW_MAX_SEC) value = SCAN_WINDOW_DEFAULT_SEC;
  return value * 1000;
}

function normalizeAntId(id) {
  // Accept UI/persisted decimal strings, but keep the ANT device id bounded to
  // the 24 bits CORE accepts for pair requests.
  if (typeof id === "string" && /^\d+$/.test(id.trim())) id = parseInt(id, 10);
  if (typeof id !== "number" || isNaN(id) || (id | 0) !== id) return undefined;
  if (id <= 0 || id > 0xFFFFFF) return undefined;
  return id;
}

function normalizeEntry(entry) {
  var id;
  if (typeof entry === "number" || typeof entry === "string") {
    id = normalizeAntId(entry);
    if (id === undefined) return null;
    return {
      index: 0,
      antId: id,
      txType: (id >> 16) & 0xFF,
      transport: "ANT+"
    };
  }
  if (!entry) return null;
  id = normalizeAntId(entry.antId);
  if (id === undefined) return null;
  return {
    index: entry.index || 0,
    antId: id,
    txType: entry.txType || ((id >> 16) & 0xFF),
    transport: entry.transport || "ANT+"
  };
}

function readConfig() {
  var config = require("Storage").readJSON(HRM_FILE, 1) || {};
  // HRM choices live outside coretemp.json so resetting BLE pairing/cache can
  // be handled independently from the user's recent ANT+ sensor list.
  hrmState.selected = normalizeEntry(config.selected);
  hrmState.recent = (config.recent || []).map(normalizeEntry).filter(function (entry) {
    return !!entry;
  });
}

function persistConfig() {
  require("Storage").writeJSON(HRM_FILE, {
    selected: serializeEntry(hrmState.selected),
    recent: hrmState.recent.map(serializeEntry)
  });
}

function formatError(err) {
  if (err === undefined || err === null) return String(err);
  if (err instanceof Error) return err.message || String(err);
  if (typeof err === "string") return err;
  if (typeof err === "object" && err.message) return String(err.message);
  try {
    return JSON.stringify(err);
  } catch (e) {
    return String(err);
  }
}

function waitMs(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function decorateEntry(entry) {
  entry.transport = entry.transport || "ANT+";
  return entry;
}

function buildStatus() {
  return {
    busy: hrmState.busy,
    operation: hrmState.operation,
    lastError: hrmState.lastError,
    lastScan: hrmState.lastScan.map(cloneEntry),
    pairedSensors: hrmState.paired.map(cloneEntry),
    pairedCount: hrmState.paired.length,
    paired: hrmState.paired.length > 0,
    multiplePaired: hrmState.paired.length > 1,
    currentSource: hrmState.paired[0] ? cloneEntry(hrmState.paired[0]) : null,
    syncState: hrmState.paired.length ? "paired" : "none",
    selected: cloneEntry(hrmState.selected),
    recent: hrmState.recent.map(cloneEntry)
  };
}

function setPaired(entries) {
  hrmState.paired = entries.map(function (entry, index) {
    entry.index = index;
    return decorateEntry(entry);
  });
}

function queryPairedEntries() {
  return cp.request(protocol.OPCODES.HRM_PAIRED_COUNT, [], STATUS_TIMEOUT_MS)
    .then(function (response) {
      var count = protocol.parseCount(response);
      var entries = [];
      var promise = Promise.resolve();
      var i;
      // Control-point requests must stay serialized; build an explicit promise
      // chain rather than issuing all entry reads concurrently.
      for (i = 0; i < count; i++) {
        (function (index) {
          promise = promise.then(function () {
            return cp.request(
              protocol.OPCODES.HRM_PAIRED_ANT_ENTRY,
              [index],
              STATUS_TIMEOUT_MS
            ).then(function (entryResponse) {
              entries.push(decorateEntry(protocol.parseAntEntry(entryResponse, index)));
            });
          });
        })(i);
      }
      return promise.then(function () {
        entries.sort(function (a, b) { return a.index - b.index; });
        setPaired(entries);
        return entries;
      });
    });
}

function remember(entry) {
  var normalized = normalizeEntry(entry);
  var next = [];
  var i;
  if (!normalized) return;
  hrmState.selected = normalized;
  next.push(normalized);
  for (i = 0; i < hrmState.recent.length && next.length < RECENT_LIMIT; i++) {
    if (hrmState.recent[i].antId !== normalized.antId) next.push(hrmState.recent[i]);
  }
  hrmState.recent = next;
  persistConfig();
}

function runOperation(name, fn) {
  if (hrmState.busy) {
    return Promise.reject(new Error("HRM operation already in progress"));
  }
  // Scan, pair, clear, and status all share the CORE control point. A module
  // level operation lock keeps UI actions from interleaving multi-step flows.
  hrmState.busy = true;
  hrmState.operation = name;
  hrmState.lastError = null;
  store.log("HRM operation -> " + name);
  return Promise.resolve().then(fn).then(function (result) {
    hrmState.busy = false;
    hrmState.operation = null;
    hrmState.lastError = null;
    return result;
  }, function (err) {
    hrmState.busy = false;
    hrmState.operation = null;
    hrmState.lastError = formatError(err);
    store.log("HRM error", hrmState.lastError);
    throw err;
  });
}

function pairNormalizedEntry(entry) {
  return cp.request(
    protocol.OPCODES.HRM_PAIR_ANT,
    protocol.makeAntPairParams(entry.antId, entry.txType),
    PAIR_TIMEOUT_MS
  ).then(function () {
    return queryPairedEntries();
  }).then(function (entries) {
    var i;
    for (i = 0; i < entries.length; i++) {
      if (entries[i].antId === entry.antId) {
        remember(entry);
        return buildStatus();
      }
    }
    throw new Error("HRM pair verification failed");
  });
}

function replacePairedEntry(entry) {
  return cp.request(protocol.OPCODES.HRM_CLEAR_ANT, [], CLEAR_TIMEOUT_MS)
    .then(function () {
      return waitMs(REPLACE_CLEAR_SETTLE_MS);
    })
    .then(function () {
      return pairNormalizedEntry(entry);
    });
}

exports.init = function () {
  readConfig();
};

exports.getState = function () {
  return buildStatus();
};

exports.getManagerState = exports.getState;

exports.getStatus = function () {
  return runOperation("status", function () {
    return queryPairedEntries().then(buildStatus);
  });
};

exports.scanANT = function () {
  return runOperation("scan_ant", function () {
    // CORE scan results may include HRMs that are already paired.
    return cp.request(
      protocol.OPCODES.HRM_SCAN_ANT_START,
      [0xFF],
      SCAN_START_ACK_TIMEOUT_MS
    ).then(function () {
      return waitMs(getScanWindowMs());
    }).then(function () {
      return cp.request(protocol.OPCODES.HRM_SCAN_ANT_COUNT, [], SCAN_COUNT_TIMEOUT_MS);
    }).then(function (response) {
      var count = protocol.parseCount(response);
      var found = [];
      var promise = Promise.resolve();
      var i;
      // As with paired-entry reads, CORE returns scan entries by index through
      // the single control point instead of in the count response.
      for (i = 0; i < count; i++) {
        (function (index) {
          promise = promise.then(function () {
            return cp.request(
              protocol.OPCODES.HRM_SCAN_ANT_ENTRY,
              [index],
              SCAN_ENTRY_TIMEOUT_MS
            ).then(function (entryResponse) {
              found.push(decorateEntry(protocol.parseAntEntry(entryResponse, index)));
            });
          });
        })(i);
      }
      return promise.then(function () {
        found.sort(function (a, b) { return a.index - b.index; });
        hrmState.lastScan = found;
        return found.map(cloneEntry);
      });
    });
  });
};

exports.pairANT = function (entry, replaceExisting) {
  var normalized = normalizeEntry(entry);
  if (!normalized) return Promise.reject(new Error("Invalid ANT+ HRM id"));
  return runOperation("pair_ant", function () {
    return queryPairedEntries().then(function (entries) {
      if (entries.length > 1) {
        throw new Error("Multiple HRMs are paired on CORE. Clear paired HRMs before pairing one ANT+ sensor.");
      }
      if (entries.length === 1) {
        if (entries[0].antId === normalized.antId && !replaceExisting) {
          remember(normalized);
          return buildStatus();
        }
        if (!replaceExisting) {
          throw new Error("A different HRM is already paired on CORE");
        }
        return replacePairedEntry(normalized);
      }
      return pairNormalizedEntry(normalized);
    });
  });
};

exports.clearANT = function () {
  return runOperation("clear_ant", function () {
    return cp.request(protocol.OPCODES.HRM_CLEAR_ANT, [], CLEAR_TIMEOUT_MS)
      .then(queryPairedEntries)
      .then(function (entries) {
        if (entries.length) throw new Error("HRM clear verification failed");
        hrmState.selected = null;
        persistConfig();
        return buildStatus();
      });
  });
};

exports.clear = exports.clearANT;
