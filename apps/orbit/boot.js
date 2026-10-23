/* Keep recording across clock/calendar/LCD changes and other apps. MIT.
 * BangleApps runs boot scripts again on app loads; complete bins and partial
 * coverage are restored, while peak detection restarts cleanly after an interrupted sample stream.
 */
(function(){
  var storage=require("Storage"),s=storage.readJSON("orbit.json",1)||{};
  if(s.restEnabled===false||Bangle.orbitRest)return;
  var source=storage.read("orbit.rest");
  if(!source)return;
  var exports={};(new Function("exports",source))(exports);
  exports.install(Bangle,storage,E);
})();
