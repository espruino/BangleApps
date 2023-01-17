exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ",default|0,airbnb|1,alarm|2,alarmclockreceiver|2,amazon shopping|3,bibel|4,bitwarden|5,1password|5,lastpass|5,dashlane|5,bring|6,calendar|7,etar|7,chat|8,chrome|9,clock|2,corona-warn|10,bmo|11,desjardins|11,rbc mobile|11,nbc|11,rabobank|11,scotiabank|11,td (canada)|11,discord|12,drive|13,element|14,facebook|15,messenger|16,firefox|17,firefox beta|17,firefox nightly|17,f-droid|5,neo store|5,aurora droid|5,github|18,gitlab|19,gmx|20,google|21,google home|22,google play store|23,home assistant|24,instagram|25,kalender|26,keep notes|27,lieferando|28,linkedin|29,maps|30,organic maps|30,osmand|30,mastodon|31,fedilab|31,tooot|31,tusky|31,mattermost|32,n26|33,netflix|34,news|35,cbc news|35,rc info|35,reuters|35,ap news|35,la presse|35,nbc news|35,nextbike|36,nina|37,outlook mail|38,paypal|39,phone|40,plex|41,pocket|42,post & dhl|43,proton mail|44,reddit|45,sync pro|45,sync dev|45,boost|45,infinity|45,slide|45,signal|46,skype|47,slack|48,snapchat|49,starbucks|50,steam|51,teams|52,telegram|53,telegram foss|53,threema|54,tiktok|55,to do|56,opentasks|56,tasks|56,transit|57,twitch|58,twitter|59,uber|60,lyft|60,vlc|61,warnapp|62,whatsapp|63,wordfeud|64,youtube|65,newpipe|65,zoom|66,meet|66,music|67,sms message|0,mail|0,gmail|0,".match(new RegExp(`,${s}\\|(\\d+)`))
  return require("Storage").read("messageicons.img", (match===null)?0:match[1]*76, 76);
};

exports.getColor = function(msg,options) {
  options = options||{};
  var st = options.settings || require('Storage').readJSON("messages.settings.json", 1) || {};
  if (options.default===undefined) options.default=g.theme.fg;
  if (st.iconColorMode == 'mono') return options.default;
  const s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  return {
    // generic colors, using B2-safe colors
    // DO NOT USE BLACK OR WHITE HERE, just leave the declaration out and then the theme's fg color will be used
    "airbnb": "#ff385c", // https://news.airbnb.com/media-assets/category/brand/
    "mail": "#ff0",
    "music": "#f0f",
    "phone": "#0f0",
    "sms message": "#0ff",
    // brands, according to https://www.schemecolor.com/?s (picking one for multicolored logos)
    // all dithered on B2, but we only use the color for the icons.  (Could maybe pick the closest 3-bit color for B2?)
    "bibel": "#54342c",
    "bring": "#455a64",
    "discord": "#5865f2", // https://discord.com/branding
    "etar": "#36a18b",
    "facebook": "#1877f2", // https://www.facebook.com/brand/resources/facebookapp/logo
    "gmail": "#ea4335",
    "gmx": "#1c449b",
    "google": "#4285F4",
    "google home": "#fbbc05",
// "home assistant": "#41bdf5", // ha-blue is #41bdf5, but that's the background
    "instagram": "#ff0069", // https://about.instagram.com/brand/gradient
    "lieferando": "#ff8000",
    "linkedin": "#0a66c2", // https://brand.linkedin.com/
    "messenger": "#0078ff",
    "mastodon": "#563acc", // https://www.joinmastodon.org/branding
    "mattermost": "#00f",
    "n26": "#36a18b",
    "nextbike": "#00f",
    "newpipe": "#f00",
    "nina": "#e57004",
    "opentasks": "#409f8f",
    "outlook mail": "#0078d4", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "paypal": "#003087",
    "pocket": "#ef4154f", // https://blog.getpocket.com/press/
    "post & dhl": "#f2c101",
    "reddit": "#ff4500", // https://www.redditinc.com/brand
    "signal": "#3a76f0", // https://github.com/signalapp/Signal-Desktop/blob/main/images/signal-logo.svg
    "skype": "#0078d4", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "slack": "#e51670",
    "snapchat": "#ff0",
    "steam": "#171a21",
    "teams": "#6264a7", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "telegram": "#0088cc",
    "telegram foss": "#0088cc",
    "to do": "#3999e5",
    "twitch": "#9146ff", // https://brand.twitch.tv/
    "twitter": "#1d9bf0", // https://about.twitter.com/en/who-we-are/brand-toolkit
    "vlc": "#ff8800",
    "whatsapp": "#4fce5d",
    "wordfeud": "#e7d3c7",
    "youtube": "#f00", // https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors
  }[s]||options.default;
};
  