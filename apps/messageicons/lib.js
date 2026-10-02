// This file is auto-generated. --- DO NOT MODIFY AT ALL ---
// If you want to add icons, import your icon as a 24x24 png, change icons/icon_names.json and re-run icons/generate.js
exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ",default|0,adp|1,airbnb|2,agenda|3,alarm|4,alarmclockreceiver|4,amazon shopping|5,bereal.|6,bluewatch|7,bibel|8,bitwarden|9,1password|9,lastpass|9,dashlane|9,bring|10,calendar|11,etar|11,chat|12,chrome|13,clock|4,corona-warn|14,bmo|15,desjardins|15,duolingo|16,rbc mobile|15,nbc|15,rabobank|15,scotiabank|15,td (canada)|15,davx⁵|17,discord|18,drive|19,element|20,element classic|20,element x|20,facebook|21,messenger|22,firefox|23,firefox beta|23,firefox nightly|23,f-droid|9,neo store|9,aurora droid|9,github|24,gitlab|25,gmail|26,gmx|27,google|28,google home|29,google play store|30,gotify|31,health|32,home assistant|33,instagram|34,jira|35,kalender|36,keep notes|37,kleinanzeigen|38,leboncoin|39,lieferando|40,linkedin|41,maps|42,meshtastic|43,organic maps|42,osmand|42,mastodon|44,fedilab|44,tooot|44,tusky|44,mattermost|45,messages|46,n26|47,netflix|48,news|49,cbc news|49,rc info|49,reuters|49,ap news|49,la presse|49,nbc news|49,nextbike|50,nextcloud|51,nina|52,ntfy|53,outlook mail|54,paypal|55,phone|56,plex|57,pocket|58,post & dhl|59,proton mail|60,reddit|61,sync pro|61,sync dev|61,boost|61,infinity|61,slide|61,signal|62,molly|62,roborock|63,skype|64,slack|65,snapchat|66,shortcuts|67,starbucks|68,steam|69,teams|70,telegram|71,telegram foss|71,threema|72,threema libre|72,thunderbird|73,tiktok|74,to do|75,opentasks|75,tasks|75,transit|76,twitch|77,twitter|78,uber|79,lyft|79,vlc|80,wallet|81,warnapp|82,whatsapp|83,wordfeud|84,youtube|85,newpipe|85,zoom|86,meet|86,music|87,sms message|0,mail|0,".match(new RegExp(`,${s}\\|(\\d+)`))
  return require("Storage").read("messageicons.img", (match===null)?0:match[1]*76, 76);
};

exports.getColor = function(msg,options) {
  options = options||{};
  var st = options.settings || require('Storage').readJSON("messages.settings.json", 1) || {}; // TODO: should we really be loading settings each time we want an icon color? Shouldn't this messageicons users' job?
  if (options.default===undefined) options.default=g.theme.fg;
  if (st.iconColorMode == 'mono') return options.default;
  const s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  let match = ",adp|F00,agenda|26D,airbnb|F35,bluewatch|08F,mail|FF0,music|F0F,phone|0F0,sms message|0FF,bibel|532,bring|456,davx⁵|8C4,duolingo|5C0,discord|56F,etar|3A8,facebook|17F,gmail|E43,gmx|149,google|48F,google home|FB0,health|F37,instagram|F06,jira|05C,kleinanzeigen|6B2,leboncoin|F72,lieferando|F80,linkedin|06C,messages|05C,messenger|07F,mastodon|53C,mattermost|00F,n26|3A8,nextbike|00F,nextcloud|08C,newpipe|F00,nina|E70,opentasks|498,outlook mail|07D,paypal|038,pocket|E45,post & dhl|FC0,reddit|F40,roborock|F00,signal|37F,skype|07D,slack|E17,shortcuts|80F,snapchat|FF0,steam|112,teams|66A,telegram|08C,telegram foss|08C,thunderbird|18E,to do|39E,twitch|94F,twitter|19F,vlc|F80,whatsapp|4C5,wordfeud|EDC,youtube|F00,".match(new RegExp(`,${s}\\|(...)`))
  return (match===null)?options.default:"#"+match[1]
};
  