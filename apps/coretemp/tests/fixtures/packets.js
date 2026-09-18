exports.response = function response(opcode, payload, resultCode) {
  return [0x80, opcode, resultCode === undefined ? 0x01 : resultCode].concat(payload || []);
};

exports.antEntryPayload = function antEntryPayload(id, txType) {
  return [id & 0xFF, (id >> 8) & 0xFF, txType || ((id >> 16) & 0xFF)];
};
