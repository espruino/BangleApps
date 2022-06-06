// boolean options, which default to true
exports.showDate =
exports.loadWidgets =
  function(value, callback) {
    if (value === undefined) value = true;
    return {
      value: !!value,
      onchange: v=>callback(v),
    };
  };
