exports.create = function createControlPoint() {
  const calls = [];
  const handlers = [];
  return {
    calls,
    request(opcode, params, options) {
      calls.push({ opcode, params: params || [], options });
      if (!handlers.length) return Promise.reject(new Error("No fake response for opcode " + opcode));
      return Promise.resolve().then(() => handlers.shift()(opcode, params || [], options));
    },
    enqueue(handler) {
      handlers.push(handler);
    },
    enqueueResponse(opcode, payload) {
      handlers.push(() => ({
        bytes: [0x80, opcode, 0x01].concat(payload || []),
        opCode: 0x80,
        requestOpCode: opcode,
        resultCode: 0x01,
        payload: payload || []
      }));
    },
    onNotification() {},
    cancelActive() {},
    isBusy() {
      return false;
    }
  };
};
