/* Call this with a pattern like '.-.', '.. .' or '..' to buzz that pattern
out on the internal vibration motor. use buzz_menu to display a menu
where the patterns can be chosen. */
exports.pattern = pattern => new Promise(resolve => {
  function b() {
    if (pattern=="") resolve();
    var c = pattern[0];
    pattern = pattern.substr(1);
    if (c==".") Bangle.buzz().then(()=>setTimeout(b,100));
    else if (c=="-") Bangle.buzz(500).then(()=>setTimeout(b,100));
    else setTimeout(b,100);
  }
  b();
});
