exports.fromBytes = function fromBytes(bytes) {
  return new DataView(Uint8Array.from(bytes).buffer);
};
