var protocol = require("coretemp.protocol");
var adapter;
var activeRequest;
var requestQueue = [];

function log(text, value) { if (adapter && adapter.log) adapter.log(text, value); }
function clearRequest(req) {
  if (req.timeout) clearTimeout(req.timeout);
  if (activeRequest === req) activeRequest = undefined;
}
function close(reason) {
  var err = reason instanceof Error ? reason : new Error(reason || "CORE control point is not connected");
  // Detach before rejecting anything. Cancellation must never pump the queue.
  adapter = undefined;
  var pending = requestQueue;
  requestQueue = [];
  if (activeRequest) {
    pending.unshift(activeRequest);
    clearRequest(activeRequest);
  }
  pending.forEach(function (req) { req.reject(err); });
}
function failTransport(req, reason) {
  if (activeRequest !== req) return;
  var err = reason instanceof Error ? reason : new Error(String(reason));
  err.coreTransportFailure = true;
  close(err);
}
function pumpQueue() {
  if (activeRequest || !requestQueue.length) return;
  var req = activeRequest = requestQueue.shift();
  req.timeout = setTimeout(function () {
    failTransport(req, new Error("CORE control point timeout for opcode " + req.opcode));
  }, req.timeoutMs);
  Promise.resolve().then(function () {
    if (activeRequest !== req) return;
    return adapter.write([req.opcode].concat(req.params));
  }).then(function () {
    if (activeRequest === req) log("Sent control point opcode", req.opcode);
  }).catch(function (err) { failTransport(req, err); });
}

exports.setAdapter = function (nextAdapter) {
  close("CORE control point session replaced");
  adapter = nextAdapter;
};
exports.close = close;
exports.cancelActive = close;
exports.isBusy = function () { return !!activeRequest; };
exports.request = function (opcode, params, options) {
  if (!adapter) return Promise.reject(new Error("CORE control point is not connected"));
  options = typeof options === "number" ? { timeoutMs: options } : (options || {});
  return new Promise(function (resolve, reject) {
    requestQueue.push({
      opcode: opcode,
      params: (params || []).slice(),
      timeoutMs: options.timeoutMs || 10000,
      resolve: resolve,
      reject: reject
    });
    pumpQueue();
  });
};
exports.onNotification = function (dv) {
  var response = protocol.parseResponse(dv);
  if (response.opCode !== protocol.OPCODES.RESPONSE || !activeRequest || response.requestOpCode !== activeRequest.opcode) {
    log("Discarding unexpected control point response", response.bytes);
    return;
  }
  var req = activeRequest;
  clearRequest(req);
  if (response.resultCode === 0x01) req.resolve(response);
  else req.reject(new Error("Control point error code " + response.resultCode));
  pumpQueue();
};
