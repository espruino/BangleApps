exports.create = function createStorage(seed) {
  const files = Object.assign({}, seed || {});
  return {
    files,
    readJSON(name) {
      if (files[name] === undefined) return undefined;
      return JSON.parse(JSON.stringify(files[name]));
    },
    writeJSON(name, value) {
      files[name] = JSON.parse(JSON.stringify(value));
      return true;
    },
    read(name) {
      return files[name];
    },
    write(name, value) {
      files[name] = value;
      return true;
    },
    compact() {},
    open(name) {
      return {
        erase() {
          delete files[name];
        },
        write(value) {
          files[name] = (files[name] || "") + value;
        }
      };
    }
  };
};
