// This file is auto-generated. --- DO NOT MODIFY AT ALL ---
// If you want to add icons, import your icon as a 24x24 png, change icons/icon_names.json and re-run icons/generate.js
exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ",default|0,adp|1,airbnb|2,agenda|3,alarm|4,alarmclockreceiver|4,amazon shopping|5,bereal.|6,bibel|7,bitwarden|8,1password|8,lastpass|8,dashlane|8,bring|9,calendar|10,etar|10,chat|11,chrome|12,clock|4,corona-warn|13,bmo|14,desjardins|14,duolingo|15,rbc mobile|14,nbc|14,rabobank|14,scotiabank|14,td (canada)|14,davx⁵|16,discord|17,drive|18,element|19,element classic|19,element x|19,facebook|20,messenger|21,firefox|22,firefox beta|22,firefox nightly|22,f-droid|8,neo store|8,aurora droid|8,github|23,gitlab|24,gmail|25,gmx|26,google|27,google home|28,google play store|29,gotify|30,health|31,home assistant|32,instagram|33,jira|34,kalender|35,keep notes|36,kleinanzeigen|37,leboncoin|38,lieferando|39,linkedin|40,maps|41,meshtastic|42,organic maps|41,osmand|41,mastodon|43,fedilab|43,tooot|43,tusky|43,mattermost|44,messages|45,n26|46,netflix|47,news|48,cbc news|48,rc info|48,reuters|48,ap news|48,la presse|48,nbc news|48,nextbike|49,nextcloud|50,nina|51,ntfy|52,outlook mail|53,paypal|54,phone|55,plex|56,pocket|57,post & dhl|58,proton mail|59,reddit|60,sync pro|60,sync dev|60,boost|60,infinity|60,slide|60,signal|61,molly|61,roborock|62,skype|63,slack|64,snapchat|65,shortcuts|66,starbucks|67,steam|68,teams|69,telegram|70,telegram foss|70,threema|71,threema libre|71,thunderbird|72,tiktok|73,to do|74,opentasks|74,tasks|74,transit|75,twitch|76,twitter|77,uber|78,lyft|78,vlc|79,wallet|80,warnapp|81,whatsapp|82,wordfeud|83,youtube|84,newpipe|84,zoom|85,meet|85,music|86,sms message|0,mail|0,".match(new RegExp(`,${s}\\|(\\d+)`))
  return require("Storage").read("messageicons.img", (match===null)?0:match[1]*76, 76);
};

exports.getColor = function(msg,options) {
  options = options||{};
  var st = options.settings || require('Storage').readJSON("messages.settings.json", 1) || {}; // TODO: should we really be loading settings each time we want an icon color? Shouldn't this messageicons users' job?
  if (options.default===undefined) options.default=g.theme.fg;
  if (st.iconColorMode == 'mono') return options.default;
  const s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  let match = ",adp|F00,agenda|26D,airbnb|F35,mail|FF0,music|F0F,phone|0F0,sms message|0FF,bibel|532,bring|456,davx⁵|8C4,duolingo|5C0,discord|56F,etar|3A8,facebook|17F,gmail|E43,gmx|149,google|48F,google home|FB0,health|F37,instagram|F06,jira|05C,kleinanzeigen|6B2,leboncoin|F72,lieferando|F80,linkedin|06C,messages|05C,messenger|07F,mastodon|53C,mattermost|00F,n26|3A8,nextbike|00F,nextcloud|08C,newpipe|F00,nina|E70,opentasks|498,outlook mail|07D,paypal|038,pocket|E45,post & dhl|FC0,reddit|F40,roborock|F00,signal|37F,skype|07D,slack|E17,shortcuts|80F,snapchat|FF0,steam|112,teams|66A,telegram|08C,telegram foss|08C,thunderbird|18E,to do|39E,twitch|94F,twitter|19F,vlc|F80,whatsapp|4C5,wordfeud|EDC,youtube|F00,".match(new RegExp(`,${s}\\|(...)`))
  return (match===null)?options.default:"#"+match[1]
};
  