exports.hide = function() {
  if (!global.WIDGETS||!WIDGETS["messages"]) return;
  WIDGETS["messages"].hide();
}
exports.show = function() {
  if (!global.WIDGETS||!WIDGETS["messages"]) return;
  WIDGETS["messages"].show();
}