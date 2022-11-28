exports.hide = function() {
  if (!global.WIDGETS||!WIDGETS["msggrid"]) return;
  WIDGETS["msggrid"].hide();
}
exports.show = function() {
  if (!global.WIDGETS||!WIDGETS["msggrid"]) return;
  WIDGETS["msggrid"].show();
}