if (E.setDST) {
  let dstSettings = require('Storage').readJSON('widdst.json',1)||{};
  if (dstSettings.has_dst) {
    E.setDST(60*dstSettings.dst_size, 60*dstSettings.tz, dstSettings.dst_start.dow_number, dstSettings.dst_start.dow,
      dstSettings.dst_start.month, dstSettings.dst_start.day_offset, 60*dstSettings.dst_start.at,
      dstSettings.dst_end.dow_number, dstSettings.dst_end.dow, dstSettings.dst_end.month, dstSettings.dst_end.day_offset,
      60*dstSettings.dst_end.at);
    /* on 2v19.106 and later, E.setTimeZone overwrites E.setDST so we
    manually disable E.setTimeZone here to stop Gadgetbridge resetting the timezone */
    E.setTimeZone = function(){};
  } else {
    E.setDST(0,0,0,0,0,0,0,0,0,0,0,0);
  }
}

