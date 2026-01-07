// This file is auto-generated. --- DO NOT MODIFY AT ALL ---
// If you want to add icons, import your icon as a 24x24 png, change icons/icon_names.json and re-run icons/generate.js
exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ",default|0,adp|1,airbnb|2,agenda|3,alarm|4,alarmclockreceiver|4,amazon shopping|5,bereal.|6,bibel|7,bitwarden|8,1password|8,lastpass|8,dashlane|8,bring|9,calendar|10,etar|10,chat|11,chrome|12,clock|4,corona-warn|13,bmo|14,desjardins|14,duolingo|15,rbc mobile|14,nbc|14,rabobank|14,scotiabank|14,td (canada)|14,davx⁵|16,discord|17,drive|18,element|19,element classic|19,element x|19,facebook|20,messenger|21,firefox|22,firefox beta|22,firefox nightly|22,f-droid|8,neo store|8,aurora droid|8,github|23,gitlab|24,gmail|25,gmx|26,google|27,google home|28,google play store|29,gotify|30,health|31,home assistant|32,instagram|33,jira|34,kalender|35,keep notes|36,kleinanzeigen|37,leboncoin|38,lieferando|39,linkedin|40,maps|41,meshtastic|42,organic maps|41,osmand|41,mastodon|43,fedilab|43,tooot|43,tusky|43,mattermost|44,messages|45,n26|46,netflix|47,news|48,cbc news|48,rc info|48,reuters|48,ap news|48,la presse|48,nbc news|48,nextbike|49,nextcloud|50,nina|51,ntfy|52,outlook mail|53,paypal|54,phone|55,plex|56,pocket|57,post & dhl|58,proton mail|59,reddit|60,sync pro|60,sync dev|60,boost|60,infinity|60,slide|60,signal|61,molly|61,roborock|62,skype|63,slack|64,snapchat|65,shortcuts|66,starbucks|67,steam|68,teams|69,telegram|70,telegram foss|70,threema|71,threema libre|71,thunderbird|72,tiktok|73,to do|74,opentasks|74,tasks|74,transit|75,twitch|76,twitter|77,uber|78,lyft|78,vlc|79,warnapp|80,whatsapp|81,wordfeud|82,youtube|83,newpipe|83,zoom|84,meet|84,music|85,sms message|0,mail|0,".match(new RegExp(`,${s}\\|(\\d+)`))
  return require("Storage").read("messageicons.img", (match===null)?0:match[1]*76, 76);
};

exports.getColor = function(msg,options) {
  options = options||{};
  var st = options.settings || require('Storage').readJSON("messages.settings.json", 1) || {};
  if (options.default===undefined) options.default=g.theme.fg;
  if (st.iconColorMode == 'mono') return options.default;
  const s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  return {
    /* generic colors, using B2-safe colors */ 
    "adp": "#f00",
    "agenda": "#206cd5",
    "airbnb": "#ff385c", // https://news.airbnb.com/media-assets/category/brand/
    "mail": "#ff0",
    "music": "#f0f",
    "phone": "#0f0",
    "sms message": "#0ff", 
    "bibel": "#54342c",
    "bring": "#455a64",
    "davx⁵": "#8bc34a",
    "duolingo": "#58cc02", // https://design.duolingo.com/identity/color#core-brand-colors
    "discord": "#5865f2", // https://discord.com/branding
    "etar": "#36a18b",
    "facebook": "#1877f2", // https://www.facebook.com/brand/resources/facebookapp/logo
    "gmail": "#ea4335",
    "gmx": "#1c449b",
    "google": "#4285F4",
    "google home": "#fbbc05",
    "health": "#ff3d71",
// "home assistant": "#41bdf5", // ha-blue is #41bdf5, but that's the background
    "instagram": "#ff0069", // https://about.instagram.com/brand/gradient
    "jira": "#0052cc", // https://atlassian.design/resources/logo-library
    "kleinanzeigen": "#69bd2f", // https://themen.kleinanzeigen.de/medien/mediathek/kleinanzeigen-guideline-nutzung-logo/ 
    "leboncoin": "#fa7321",
    "lieferando": "#ff8000",
    "linkedin": "#0a66c2", // https://brand.linkedin.com/
    "messages": "#0a5cce",
    "messenger": "#0078ff",
    "mastodon": "#563acc", // https://www.joinmastodon.org/branding
    "mattermost": "#00f",
    "n26": "#36a18b",
    "nextbike": "#00f",
    "nextcloud": "#0082c9", // https://nextcloud.com/brand/
    "newpipe": "#f00",
    "nina": "#e57004",
    "opentasks": "#409f8f",
    "outlook mail": "#0078d4", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "paypal": "#003087",
    "pocket": "#ef4154", // https://blog.getpocket.com/press/
    "post & dhl": "#f2c101",
    "reddit": "#ff4500", // https://www.redditinc.com/brand
    "roborock": "#f00",
    "signal": "#3a76f0", // https://github.com/signalapp/Signal-Desktop/blob/main/images/signal-logo.svg
    "skype": "#0078d4", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "slack": "#e51670",
    "shortcuts": "#8000ff",
    "snapchat": "#ff0",
    "steam": "#171a21",
    "teams": "#6264a7", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "telegram": "#0088cc",
    "telegram foss": "#0088cc",
    "thunderbird": "#1582e4",
    "to do": "#3999e5",
    "twitch": "#9146ff", // https://brand.twitch.tv/
    "twitter": "#1d9bf0", // https://about.twitter.com/en/who-we-are/brand-toolkit
    "vlc": "#ff8800",
    "whatsapp": "#4fce5d",
    "wordfeud": "#e7d3c7",
    "youtube": "#f00", // https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors
  }[s]||options.default;
};
  