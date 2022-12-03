exports.getImage = function(msg) {
  /*
  * icons should be 24x24px or less with 1bpp colors and 'Transparency to Color'
  * http://www.espruino.com/Image+Converter
  */
  if (msg.img) return atob(msg.img);
  const s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (s=="airbnb") return atob("GBgBAAAAADwAAH4AAMMAAIMAAYGAAQGAAwDAAwDABjxgBn5gDMMwDMMwGMMYGMMYMGYMMGYMIDwEIBgEIDwEMH4MHee4D4HwAAAA"); // icons/airbnb.png
  if (s=="alarm" || s =="alarmclockreceiver") return atob("GBgBAAAAAAAAAgBABwDgHn54Of+cE8PIBwDgDhhwDBgwHBg4GBgYGBgYGBgYGA4YHAc4DAEwDgBwBwDgA8PAAf+AAH4AAAAAAAAA"); // icons/alarm.png
  if (s=="amazon shopping") return atob("GBgBAAAAAP8AAf+AA//AA+fAA8PAAIPAAD/AAP/AA//AA+PAB8PAB8fAB8fgB//gA//gA/3AAPCecAAeOAAeDwH0B//kAf+AAAAA"); // icons/amazon.png
  if (s=="bibel") return atob("GBgBAAAAA//wD//4D//4H//4H/f4H/f4H+P4H4D4H4D4H/f4H/f4H/f4H/f4H/f4H//4H//4H//4GAAAEAAAEAAACAAAB//4AAAA");
  if (s=="bitwarden" || s=="1password" || s=="lastpass" || s=="dashlane") return atob("GBgBAAAAABgAAP8AA//AD4/wHg/4GA/4GA/4GA/4GA/4GA/4GA/4H/AYH/AYH/A4D/AwD/BwB/BgB/DgA/HAAfeAAP8AADwAAAAA"); // icons/security.png
  if (s=="bring") return atob("GBgBAAAAAAAAAAAAAAAAAHwAAFoAAf+AA/+AA/+AA/+AA/eAA+eAA0+AAx+AA7+AA/+AA//AA/+AAf8AAAIAAAAAAAAAAAAAAAAA");
  if (s=="calendar" || s=="etar") return atob("GBiBAAAAAAAAAAAAAA//8B//+BgAGBgAGBgAGB//+B//+B//+B9m2B//+B//+Btm2B//+B//+Btm+B//+B//+A//8AAAAAAAAAAAAA==");
  if (s=="chat") return atob("GBgBAAAAAf/8A//+A//+A//+OAB+e/8+e/++e/++e/++e/++e/++e/++ef+8fAAAf//Af//Af//Af//Af/+AcAAAYAAAQAAAAAAA"); // icons/google chat.png
  if (s=="chrome") return atob("GBgBAAAAAAAAAP8AA//AB+fgDwDwHgB4HAA4Pj/8OmYcO8McMYEMMYEMOMMcOGccOD4cHAw4Hgx4DxjwB//gA//AAP8AAAAAAAAA"); // icons/chrome.png
  if (s=="corona-warn") return atob("GBgBAAAAAAAAABgAABgABhhgDn5wD//wA8PAA+fAB2bgBgBgPpl8Ppl8BgBgB2bgA+fAA8PAD//wDn5wBhhgABgAABgAAAAAAAAA"); // icons/coronavirus.png
  if (s=="bmo" || s=="desjardins" || s=="rbc mobile" || s=="nbc" || s=="rabobank" || s=="scotiabank" || s=="td (canada)") return atob("GBgBAAAAADgAAP4AAe8AB4PAHgDwP//4P//4AAAAAAAADjjgDjjgDjjgDjjgDjjgDjjgDjjgAAAAAAAAP//4P//4AAAAAAAAAAAA"); // icons/bank.png
  if (s=="discord") return atob("GBgBAAAAAAAAAAAAAAAAA4HAD//wH//4H//4P//8P//8P//8fn5+fDw+fDw+fn5+f//+f//+ff++PgB8DgBwAAAAAAAAAAAAAAAA"); // icons/discord.png
  if (s=="drive") return atob("GBgBAAAAAAAAAH8AAH8AAT+AA7/AA9/AB8/gB+/gD+fwD+fwH8P4P8P8P4H8fwAAf3/+Pn/8Pv/8HP/4Df/wC//wAAAAAAAAAAAA"); // icons/google drive.png
  if (s=="element") return atob("GBgBAAAAAHwAAH4AAH8AAAeAAePAB+HAD+DgHgDgPADuOADucAAOcAAOdwAcdwA8BwB4BwfwA4fgA8eAAeAAAP4AAH4AAD4AAAAA"); // icons/matrix element.png
  if (s=="facebook") return atob("GBgBAAAAAAAAAH4AAf+AB//gD//wD/DwH+D4H+P4P+f8P+f8P+f8PwD8PwD8PwD8H+f4H+f4D+fwD+fwB+fgAeeAAOcAAAAAAAAA"); // icons/facebook.png
  if (s=="messenger") return atob("GBgBAAAAAAAAAP8AA//AB//gD//wH//4H//4P//8P9+8P458PwB8PgD8PnH8Pfv8H//4H//4D//wB//gB//AB/8AAwAAAAAAAAAA"); // icons/facebook messenger.png
  if (s=="firefox" || s=="firefox beta" || s=="firefox nightly") return atob("GBgBAAAAAAAAAAMAAAcAAAeABA/ADY/gH4P4H4H4H8H8P/H8P+D8PwD8PwD8PwD8H4H4H8P4H//4D//wB//gA//AAP8AAAAAAAAA"); // icons/firefox.png
  if (s=="f-droid" || s=="neo store" || s=="aurora droid") return atob("GBgBAAAAQAACYAAGP//8H//4H//4HH44HH44H//4AAAAH//4H8P4H734H374HsN4Hvl4Hv14Hvl4HsN4H374H734H8P4D//wAAAA"); // icons/security.png
  if (s=="github") return atob("GBgBAAAAAAAAAH4AAf+AB//gD//wDv9wHgB4HgB4PAA8PAA8PAA8PAA8PAA8PgB8HwD4G8P4DcPwDgPwB4PgAcOAAAAAAAAAAAAA"); // icons/github.png
  if (s=="gitlab") return atob("GBgBAAAABAAgDAAwDAAwHgB4HgB4PgB8PwD8P//8f//+f//+f//+f//+f//+f//+P//8H//4D//wA//AAf+AAP8AADwAABgAAAAA"); // icons/gitlab.png
  if (s=="gmx") return atob("GBgBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEJmfmd8Zuc85v847/88Z9s8fttmHIHiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  if (s=="google") return atob("GBgBAAAAAP8AA//AB//gD//gH+fAP4CAPwAAPgAAfAAAfA/+fA/+fA/+fA/+fAA+PgA+PwB8P4D8H+f4D//4B//wA//AAP8AAAAA"); // icons/google.png
  if (s=="google home") return atob("GBgBAAAAABgAADwAAH4AAf4AA/zAB/vgD/fwH+f4P4H8fwD+fgB+fAA+eAA+cAA+bAA+HAA+PAA+ff++ff++ff++ff++Pf+8AAAA"); // icons/google home.png
  if (s=="google play store") return atob("GBgBAAAAAAAAAH4AAP8AAMMAAMMAP//8P//8MAAMMAAMMGAMMHgMMH4MMH8MMH4MMHgMMGAMMAAMMAAMP//8H//4AAAAAAAAAAAA"); // icons/google play store.png
  if (s=="home assistant") return atob("FhaBAAAAAADAAAeAAD8AAf4AD/3AfP8D7fwft/D/P8ec572zbzbNsOEhw+AfD8D8P4fw/z/D/P8P8/w/z/AAAAA=");
  if (s=="instagram") return atob("GBgBAAAAD//wH//4OAAccAAOYABmYDxmYP8GYeeGYYGGY4HGYwDGYwDGY4HGYYGGYeeGYP8GYDwGYAAGcAAOOAAcH//4D//wAAAA"); // icons/instagram.png
  if (s=="kalender") return atob("GBgBBgBgBQCgff++RQCiRgBiQAACf//+QAACQAACR//iRJkiRIEiR//iRNsiRIEiRJkiR//iRIEiRIEiR//iQAACQAACf//+AAAA");
  if (s=="keep notes") return atob("GBgBAAAAAAAAH//4P//8P8P8Pzz8P378Pv98Pv98Pv98Pv98P378Pzz8P738P4H8P738P738P4GMP8OYP/+wP//gH//AAAAAAAAA"); // icons/google keep.png
  if (s=="lieferando") return atob("GBgBAAAAADwAAH4AAP/gAf/wA//wB//wD//wH//4H/98Pt58ft5+Ptx8DtxwDtxwDhxwDhhwDhhwDzhwD75wD75wD75wB77gAAAA"); // icons/lieferando.png
  if (s=="linkedin") return atob("GBgBAAAAf//+f//+f//+ef/+cf/+cf/+f//+f//+ccw+ccAeccAecccOcceOcceOcceOcceOcceOcceOec+ef//+f//+f//+AAAA"); // icons/linkedin.png
  if (s=="maps" || s=="organic maps" || s=="osmand") return atob("GBgBAAAAAAAAAAAAAeAYD/z4H//4GMeYGMMYGMMYGMMYGMMYGMMYGMMYGMMYGMMYGMMYGMMYGeMYH//4Hz/wGAeAAAAAAAAAAAAA"); // icons/map.png
  if (s=="mastodon" || s=="fedilab" || s=="tooot" || s=="tusky") return atob("GBgBAAAAB//gD//4H//4P//8PBg8PAA8fOMeeOeeeOeeOOeeOOecOP+cOP+cP//8P//4P//4P//gHwAAH4AAD+cAB/8AAf4AAAAA"); // icons/mastodon.png
  if (s=="mattermost") return atob("GBgBAAAAAPAAA+EAB4GADgOQHAeYOA+cOB+MeB+OcD+GcD+GcD+GeD8OeB4OeAAOfAAePgA8P4B8H/f4D//wB//gA//AAP8AAAAA"); // icons/mattermost.png
  if (s=="n26") return atob("GBgBAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAOIAAOIAAPIAANoAANoAAM4AAMYAAMYAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAA");
  if (s=="netflix") return atob("GBgBAAAAA8PAA+PAAePAAePAAfPAAvPAA/PAAvvAAn/AA/nAA3/AA/7AA5/AA/5AA99AA8/AA89AA8+AA8eAA8eAA8fAA8PAAAAA"); // icons/netflix.png
  if (s=="news" || s=="cbc news" || s=="rc info" || s=="reuters" || s=="ap news" || s=="la presse" || s=="nbc news") return atob("GBgBAAAAAAAAAAAALaW0P//8P//8P//8P//8MAAMMAAMMAAMP//8P//8MBwcMBwcMB/8MB/8MBwcMBwcP//8P//8AAAAAAAAAAAA"); // icons/news.png
  if (s=="nextbike") return atob("GBgBAAAAAAAAAAAAAAAAAAAAAACAfgDAPwDAP4HAH4N4H8f8D82GMd8CMDsDMGMDMGGGGMHOD4D8AAAAAAAAAAAAAAAAAAAAAAAA");
  if (s=="nina") return atob("GBgBAAAABAAQCAAICAAIEAAEEgAkJAgSJBwSKRxKSj4pUn8lVP+VVP+VUgAlSgApKQBKJAASJAASEgAkEAAECAAICAAIBAAQAAAA");
  if (s=="outlook mail") return atob("GBgBAAAAAAAAAP/8AP/8AP/8AJjMf/jMf//8f//8cHjMd3jMZz/+Zz/+d3jecHj+f//mf/eGf/PGAwDmAwA+A//+Af/+AAAAAAAA"); // icons/outlook.png
  if (s=="paypal") return atob("GBgBAAAAA/+AA//gA//wB//wB//wB//wB//wB//wB//gD//gD//ID/+ID/wwD4BwD5/gD74AH7gAHzAAHzAAHzAAAHAAAHAAAAAA"); // icons/paypal.png
  if (s=="phone") return atob("GBgBAAAAAAAAH4AAP8AAP8AAP8AAH8AAH8AAH8AAH4AADwAADwAABwAAA4AAA8HwAeP8AP/8AH/8AD/8AA/8AAP8AAB4AAAAAAAA"); // icons/phone.png
  if (s=="plex") return atob("GBgBAAAAB/gAB/gAA/wAAf4AAf4AAP8AAH+AAH+AAD/AAB/gAB/gAB/gAB/gAD/AAH+AAH+AAP8AAf4AAf4AA/wAB/gAB/gAAAAA"); // icons/plex.png
  if (s=="pocket") return atob("GBgBAAAAAAAAP//8f//+f//+f//+f//+f//+fP8+eH4efDw+fhh+fwD+f4H+P8P8P+f8H//4H//4D//wB//gAf+AAH4AAAAAAAAA"); // icons/pocket.png
  if (s=="post & dhl") return atob("GBgBAAAAAAAAAAAAAAAAP/+Af/+AYAGAYAGAYAHwYAH4YAGMYAGGYAH+YAH+bwH+f//+ef+eGYGYH4H4DwDwAAAAAAAAAAAAAAAA"); // icons/delivery.png
  if (s=="proton mail") return atob("GBgBAAAAAAAAAAAAQAACYAAGcAAOeAAePABeXgDebwHed4Pee/fefe/efh/ef//ef//ef//ef//ef//ef//eP//cAAAAAAAAAAAA"); // icons/protonmail.png
  if (s=="reddit" || s=="sync pro" || s=="sync dev" || s=="boost" || s=="infinity" || s=="slide") return atob("GBgBAAAAAAAAAAYwAAX4AAh4AAgwAAgAAAgAAH4AAf+AN//sf//+fn5+PDw8HDw4Hn54H//4H//4DzzwB4HgAf+AAH4AAAAAAAAA"); // icons/reddit.png
  if (s=="signal") return atob("GBgBAAAAAL0AAYGABH4gCf+QE//IB//gL//0b//2H//4X//6X//6X//6X//6H//4b//2L//0D//gL//ID/+QYH4gVYGAcL0AAAAA"); // icons/signal.png
  if (s=="skype") return atob("GBgBAAAAB8AAH/8AP//AP//gf8fwfwD4fgB4fjx8fj/8Pg/8PwH8P4B8P/h8Pnx+Pjx+Hhh+HwD+D8P+B//8A//8AP/4AAPgAAAA"); // icons/skype.png
  if (s=="slack") return atob("GBgBAAAAAOcAAeeAAeeAAeeAAGeAAAeAP+ecf+eef+e+f+e+AAAAAAAAfef+fef+eef+Oef8AeAAAeYAAeeAAeeAAeeAAOcAAAAA"); // icons/slack.png
  if (s=="snapchat") return atob("GBgBAAAAAAAAAAAAAH4AAf+AAYGAAwDAAwDAAwDADwDwDwDwDgBwBwDgBwDgDgBwHAA4OAAcHAA4D4HwB//gAH4AAAAAAAAAAAAA"); // icons/snapchat.png
  if (s=="starbucks") return atob("GBgBAAAAAAAAAAAAD//4D//8DADMDADMDADMDAD8DAD4DADADADADADADADADgHAB/+AA/8AAAAAAAAAP//wP//wAAAAAAAAAAAA"); // icons/cafe.png
  if (s=="steam") return atob("GBgBAAAAAAAAAf+AA//AD//wD//wH/g4P/OcP/RcP+RcP+ReH8OeB4A+AAH+AMP8IC/8OS/8HN/4Dj/wD//wA//AAf+AAAAAAAAA"); // icons/steam.png
  if (s=="teams") return atob("GBgBAAAAAAgAAD4AADcYAGM8AGNmP/dmP/48MDAYMD/+PP/+PPBmPPBmPPBmPPBmP/BmP/BmH+B+AYD4AMDAAOOAAH8AABwAAAAA"); // icons/teams.png
  if (s=="telegram" || s=="telegram foss") return atob("GBgBAAAAAAAAAAAAAAAeAAB+AAP+AA/+AD/+Af9+B/z+H/n8f+P8f8f8Dw/8AB/8AB/8AB/4AAf4AAP4AAD4AABwAAAAAAAAAAAA"); // icons/telegram.png
  if (s=="threema") return atob("GBgBAAAAAP8AA//AB//gD//wH8P4H9v4H734P5n8P4H8P4H8H4H4H4H4D//wD//gD//AH/8AHDwAAAAAAAAABhhgDzzwBhhgAAAA"); // icons/threema.png
  if (s=="tiktok") return atob("GBgBAAAAAAAAAAcAAAcAAAeAAAfAAAfwAAf4AAf4AMd4A8cAB8cAD8cADwcAHgcAHgcAHg8ADw8AD/4AB/4AA/wAAfAAAAAAAAAA"); // icons/tiktok.png
  if (s=="to do" || s=="opentasks" || s=="tasks") return atob("GBgBAAAAAHwAAf+AA//ID4GcHwA8HAB4PADwOAHgcAPGcAeOcY8Oc94OcfwOcPgOOHAcOCAcHAA4DgB4D4HwB//gAf+AAH4AAAAA"); // icons/task.png
  if (s=="transit") return atob("GBgBAAAAD//wP//8P//8f//+f/j+ffA+eOA+eOMef+cefef+eOe+fecef+e+eOf+eOcefAcefA++fx/+f//+P//8P//8D//wAAAA"); // icons/transit.png
  if (s=="twitch") return atob("GBgBAAAAA//8B//8DgAMHgAMPhjMPhjMPhjMPhjMPhjMPgAMPgAMPgAYPgAwP+fgP+/AP/+AP/8AP/4AAeAAAcAAAYAAAQAAAAAA"); // icons/twitch.png
  if (s=="twitter") return atob("GBgBAAAAAAAAAAAAAAPAIAf8MA/4PA/8Pg/4H//4H//4P//4P//wH//wD//wD//gD//AA//AAf+AB/8AP/wAD/AAAAAAAAAAAAAA"); // icons/twitter.png
  if (s=="uber" || s=="lyft") return atob("GBgBAAAAAAAAAAAAAH4AAH4AB//gB//gDgBwDAAwDAAwH//4H//4GAAYG4HYG4HYG4HYGAAYH//4H//4HAA4HAA4AAAAAAAAAAAA"); // icons/taxi.png
  if (s=="vlc") return atob("GBgBAAAAABgAABgAADwAADwAAAAAAAAAAAAAAAAAAIEAAP8AAP8AAf+AAP8AAAAADAAwDAAwHAA4HwD4H//4P//8P//8P//8AAAA"); // icons/vlc.png
  if (s=="warnapp") return atob("GBgBAAAAAAAAAAAAAH4AAP8AA//AA//AD//gP//gf//4f//+/+P+/8H//8n//4n/fxh/fzg+Pj88Dn44AA4AAAwAAAwAAAgAAAAA");
  if (s=="whatsapp") return atob("GBgBAAAAAP8AA//AB4HwDgB4HAA4OAAcMYAMc8AOc8AGY8AGYcAGYeAGYPOGcH/OcD/OMA+MOAAcMAA4MgBwf8Pgf//AcP8AAAAA"); // icons/whatsapp.png
  if (s=="wordfeud") return atob("GBgCWqqqqqqlf//////9v//////+v/////++v/////++v8///Lu+v8///L++v8///P/+v8v//P/+v9v//P/+v+fx/P/+v+Pk+P/+v/PN+f/+v/POuv/+v/Ofdv/+v/NvM//+v/I/Y//+v/k/k//+v/i/w//+v/7/6//+v//////+v//////+f//////9Wqqqqqql");
  if (s=="youtube" || s=="newpipe") return atob("GBgBAAAAAAAAAAAAAAAAAAAAH//4P//8P//8f//+f8/+f8P+f8D+f8D+f8P+f8/+f//+P//8P//8H//4AAAAAAAAAAAAAAAAAAAA"); // icons/youtube.png
  if (s=="zoom" || s=="meet") return atob("GBgBAAAAAAAAAAAAP/+Af//Af//AcADicADmcADucAD+cAD+cAD+cAD+cAD+cAD+cADucADmcADif//Af//AP/+AAAAAAAAAAAAA"); // icons/videoconf.png
  if (msg.id=="music") return atob("FhaBAH//+/////////////h/+AH/4Af/gB/+H3/7/f/v9/+/3/7+f/vB/w8H+Dwf4PD/x/////////////3//+A=");
  // if (s=="sms message" || s=="mail" || s=="gmail") // .. default icon (below)
  return atob("FhKBAH//+P//yf/+c//z5/+fz/z/n+f/Pz/+ef/8D///////////////////////f//4///A");
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
