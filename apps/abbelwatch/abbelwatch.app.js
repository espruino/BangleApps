/**
 * Optimized Bangle.js Numerals Clock
 *
 * + Original Author: Raik M. https://github.com/ps-igel
 * + Optimized: April 2025
 */

// Configuration constants
const REFRESH_RATE = 1000; // Refresh every second
const LONG_PRESS_DURATION = 1000; // 1 second for long press
const DEFAULT_BRIGHTNESS = 0.5;
const MAX_BRIGHTNESS = 1.0;

var currentFont = "NummeralByLERegular";

// App state
let state = {
  wischfunktion: 1,     // Main display mode (0=date, 1=time, 2=seconds, 3=steps, 4=heart rate)
  wischfunktionZ: 1,    // Secondary display mode (0=battery, 1=normal, 2=light)
  window: 1,            // Current horizontal swipe position
  windowZ: 1,           // Current vertical swipe position
  swipeDone: false,     // Flag to prevent multiple swipes
  loongpress: false,    // Flag for long press detection
  touchStartTime: 0,    // For long press detection
  bluetoothConnection: false,
  bcon: false,
  frequenz: "WAITING\n FOR\n",
  zeitanzeigen: true,
  interval: null,
  drawInterval: null
  
};

// Load persistent settings
let settings = require('Storage').readJSON('numerals.json', 1) || {
  color: 0,
  drawMode: "fill",
  showDate: 0
};

// Load theme settings
let theme = require("Storage").readJSON("theme.json", 1) || {};
let colors = {
  bg: theme.bg || "#000000",
  fg: theme.fg || "#FFFFFF",
  fg2: theme.fg2 || "#757575"
};


function setupFonts() {

  
  
  
  
  
  
  Graphics.prototype.setFontNunitoBlack = function() {
  
// Actual height ///58//// (54 - 2)
  // 1 BPP
  return this.setFontCustom(
E.toString(require('heatshrink').decompress(atob('ACUIAwsf4AGEh/4AwkD/wGEgP/wAHEv/gEYocFg4cFgAcGn45Fg4jFAA8BAwsDDgsD+AjF/hkF/4GGDgkf/4cEn//DggGBDgl/AwoFBNYgGFRoIiEgYGBQ4YGGg4GBHwYbCP4g3BAwhTBLQgcBUQjGISYseVBgAJv4zESoJCEIIIABGoSOCMwYNDSAQbCDoZzCRQZzCCogGECoIqDFYUPFwUDVwMDTgc/IIK4Dh4cCJYQSCDg4yECQI5GLojFBKwwVEGwRzGFYiQGT4YbEKgbFWAAcQAwsOAwsHa4iRFAAK1BCov/Cot/dgapCPwIADj4jFh6FCGIf+c5l/AwY1BVpoccAC1gQoQcCniFDOYWARgkPQIV/HITdCv5WDSYQDC/4cBKQIcBn5ZDDgIjCh5WCZIQGBDgQqBM4PfDgWAAwPnDgYGB8IcCQAd/HIQAB/EfDgSHCg6QE/hzCVoQ0BDgQVBAwIcCCoQDBO4QGCSAcPPYaUCiCUCDgIAOuCtFjwGCRoUPD4RWDRII5BGoICCBAKGBVoU/DIPgD4QeBUYfggYhBDIIJCLYIcCPAYcDwBbBDgg7CDgX8gYXCHIXDcoM/DgS1CWwLdDV4StD77nDv//+4GBEYIVB/IGBEYLgB/gmBWgV//y+BPwUHH4IqCAAM8WYIGDVIwAJVgQGEGIQGDEYpABAwwcEJwgGDDgiDCAwvfDgYGB44cDAwPBDgYwCYgKQD4DEBAwMfAwMHDgSGBVo4ACDgYACDoIcBAAQdBDjgACgK0GKwYACKwYACKwYcDb4QAXgZ7BDoRFDKwn+dAZWCCoZzC8EBCAJzCBYM/wAcEh/gDgeAgYcFgAcDBYQcDBYQcD4ALBHIfwh/wgYcC/kD/+DFoIcCUwQcEZQnwHYTKC/hYCEYIcCCoSxDCoQqBWITYDYQYGFD4IUBACKkCbwYqFh5HETAZkCBoZdCAwhPDAwZTBNQQVEAwaQD/DMBSAf4VoMPVoICBPgK+Cgf8PgTKC/6ZBZQYJBPILKCBIJXCDgX4JIYcB/xJDFoIcCKwYcBMwQjBDgIVCLoQmBZQKJDOoQGEM4IGFgFgYSQAENQQoFAwqHCHwhZBAAMcDgs/Dgt/DIIcDOYQcCNoIZBDgUDOgIcDTAQcDRIQcDVoQcDRAKQDv6lCTwIcBWYTQBFAYpCHoTIDDgQ+DDgayGRQgcBF4QcDQQaQIACMDDAZ7Bh47DFYJ7BLwRPBIYh5B8ZfDCQP9SAhsCSAYGDCoQGEFYKdDh5oBh/gn4aBIIMD/EHAgM/DgILBEIMHDgWAKAISBDgPwn4VBDgQwDHJLKDKwpuBNgQGBx7FDJ4PDLoYVB8AVBTAQ/BBISjCAYN/AwStDd4YAVewpICdIgGBPALSCIoJUBSASmC8CjBOYf8SATKDSA3ADgSHDDgU/4EDDgYJCv8BZQYtB4F/DgIJBg6+BDgXgCAM/VoMP/+H/l/M4I5D/5dFWgbKEOoIVEUwQVDAwRlDWgYGGBwSYEg5YBADMQAQMIAwSUCPgJXCOAQtCg5wCNgUB/+AAQReCUARQCj6gCDgsHDghoCDgTEBAQYSBAYMHOgYAFA=='))),
    46,
    atob("DhgbFhoaHBobGhsbDg=="),
    58|65536
  );
};  
  
  
  
  
  
  
Graphics.prototype.setFontNummeralByLERegular = function() {
  // Actual height 43 (47 - 5)
  // 1 BPP
  
  return this.setFontCustom( E.toString(require('heatshrink').decompress(atob('ABUCAwv+AokP/AGEv/gAocH/4MEn4TEgP/4AgEE4t/+ATFGhcfKpcHAokBJww6Ej4MEg5AEHIOAM5IYLgBmFn5fEh/8MpYYEgFwZLP/AAQ3Bh4GDFYIFDHAIMEIoN/AwfggYTFj4FDOQIME4DjBAAR5Bn47ENIIWBGIOAAQQQBGgSWCGgYMBEgI0BRQU/GgSwBEgI0CRwQ0CEAV/GgRsBEgQPCEgYPBGkwTBCAJpEv6eqAAY0CaYgTEc4oMBDQhLBAH4A/ACN8AokP+AGEVwQACaYIMEn7jBAAS4BCYkPcYIADv4nEgbJFj7TFAoYdBGgIACGIL0E8DtEDQMPfYt/CYg0BAAY0FE4IgFCYgMBE4hSEABMHKIRzCAQI9BIIMP/BeCPQJEBJQXABQIMCC4KeBNYXwNIPBNIn+IYRpC+AgCNIWDNIn8j/4v5pC8H/4Y0E/0fGgnwGgoiBGgYiBGggiBGgj4CGgb4CGgQiBGgj4CGgYkBGl6cCGgYABGgacCGgacCGgYABGgb5CGgYABGgggBGgQTC4E/8DyEfYQAMnEAmEAuEAg/wgfAh4gCEoI4BwA0BgY0DT2o0wj40FaoI0Dw40Fn40E8I0FcgI0Ev40E4Y0WdwTcCcAIACGgQADegYABGgQADGgQACGgQGD+ATFgAnEBgIAMJ4JMBAwQnBFYIABEAQ/BBgZTBDIgaDNIRnBAAJpCCYRBDBgQTCE43AAwRnDAAZaFPAJPDDYI0DIYQ0CF4YgEaIRkEGgatBGn40FUoYbCfYgMFEQIMEGwL0E4AlBCYirCfYQgEGwITEEAInEPAgAJOoKDBjhID+EDEAnAn/gGgZ/BwD0C/kfDgN/AwPgAIIPBAAJFBEAf4n5pE4JpE/0PNIX8n/wv5pC8P/wY0Dh40E/F/GgnDGgn+j40E+A0Fw40/GiwABGgbnDGgTICGgSgCGgbcCGgJGBfYUH/i0Cc4XAE4WAgF8bgQMBABruCJwMAEoRBCBghVBBghpCAwfwNIIADwA/CCYYME8AgEE4JnCLgRpBHYieEPoKeEGgTTDGgLTDGgTTDGgTTCGgTTDGgTTDGn40GTwY0BTwg0BTwmHTwg0BTwg0BTwZGC/40BIwITCdwIcBBgcDbgYMBACc8AYUcEAQFBgIDBn/AAwMf4EDGAIQBHAKcBAwM/AYJRBBgXAg4TCn5VDBgXwNIOABIIDBTgMAQAIDBTgICBEAIwCBgItBGgQMBDoIwCBgQ0CBgY0BSIIMBGgS+CgA0BBgJsCaIQwBJYQMEGgIMDGgPfBgY4BWARsCWAg0BBgjRCXoZMBBgbKGj56CGgafCGgYMEGgIMDGgIMEGgJtBGgbGCGgYMEh4MEE4IMEgBtCDQYFEAChwBAALGCAoRyCBgZFBBgiGBTwQAB+CeCCYaeCAAJzBEAngTwQACTwQ7EB4N/CAPAGgMD/EfGgQEB4A0D4H+CAI0BAgPwn40CAgOBGgeB/hFBGgIEBF4I0/GgienAAY0CaYgTEc4oMBDQnAAwIASLgIeBv0AJAX4g5BBNIR4B8BpDCAJpD/ieDAwPhNIqeDE4SeDAAPDNIn+aYk/+CeD4P/w7TDh40E+F/GgmDGgn8j40E8A0Fg40/GgzTDTwi0CTwYABegqeEdwSeCfYbTCAAI0CAAeACYggBE4mADQnwgAAbgQCB4AGCnkAh4FCgYrBN4IABj5FB8AGCBQM/AoQKBgJOBAAMeBAJOBAANAHJIA=='))),
    46,
    atob("DhAqKykpKSkpKyoqDA=="),
    53|65536
  );
};

  Graphics.prototype.setFontNewRockerRegular = function() {
    // Actual height 45 (44 - 0)
    // 1 BPP
    return this.setFontCustom(
      E.toString(require('heatshrink').decompress(atob('ABUBAwsPAws/Awv/AokDAwsH/whF/gGF8AGFwAGEhwvFjBZTiAGFsBmF4A2Lv4TFLBl//BzF+AGDj//FAn/CYkH/48En6OEgITFh4TGIQgTBGggTBGgl/J4hIBVAhIBBgpIGCYgnBOAkfCYhCBTIt+VopIEVo8DCYsEbqYANLIIABLYRZBAwh0BAwl/AwRICAoQGCUYIGERIIACUwIoDAwQoDAwV8UIYGBR4RHBwEDAwghBRIUPboMfAwYRBfYJSEAwgoBAwb4CAwYsCMwYlCNpQhBNoYhCNof8TorYFbggeBbhUOAws8AwpOCZoYsFn7DCAARVDGoSSBAwpLEYwgGIL4adCAwzbEGYLbGVZpBDKoqFNgidIAA0CAwsMAYV+AQMcAQJVBAYN4RgRLCOAZLBgZHBKgIKCNIJtEwCLCNoQnCEIQCBDQL3BgYCB//3FAMP/AaBx4oBh/wh/8n4oC8Ef+F/FAIvBv/AKIUfEILYDFoUDUggqBGYMAv7EBg4GCKwQ6BAwYlBAwIlBD4I4BeAQYBIgQGBCIIvCQwPggLUE4CMCAAcHWpIATjDvCLAU4FAQ2CZoRfCgJUBLAnwgxYBZoSdBAwJLBj/AegN/b4XAvgGDVwIYBVoKBBFQV/FAP+NYQdBIAMPAwI9Bg/wZ4IWCegKrBHQIGDBAQ9BAwZVC//fWgTUC360CHIP+boTNC/jdBF4JLB+AhBF4IGB8AGBwBSBAQLJBUxUCAwr8DAASVCAAQqBK4LgDFwQTDFwgTBLwQTDLwQTDF4YTBLwQ7C//nLwJ0C/8PGwUDEAMfGwSPB8E/HYq+BAwQtBGwYhBAAJFCAwYOCXAYGGDwJKCAwY9BAARTBMoLbEcQhMBAwZ8EgfwvCDE8FgWQngTwkP4LNKABEDAwsOLAJGBhEAvhYDLoJYE+EDVgJRC8EHDAKkBAwMfAwnAn5LBVYKsBv4GBToJrBOgSbCSYI9B+fzF4IPBPAJzBgarBAgMPwEHIgLmBbQJ8BGwOAZAQ9Bn66DNIN+MISkC/hhCFAMB/BhCZoXwMIY2B4BhDF4JoDLAM8NAkAYQUfaggAWD4QeCGwReDGwRXCAwZXCHoZJCNoZJCAwaHCOgYaDAwKHCPYYoC4EHAwLeBbIKrCa4ImBWwJOBwIRBXYIoBYgQPBgP+IoSkC/hFCB4KrBAwSrC8AGCMwXAKYRmCLQRfCjwGCLAMAnA/BF4SZBgIfBF4IAHgYGFEQIADgIlCAAV/EoQMCJwQGEFwInDOAYGCEIJ1BAwKZCL4cP+CtCMwXgRITNCOgt/wbiEv7BCGAX+R4Q6C/iABj7bC/bUBn6kCCIV/GwS2CNIQgBbAJpCv4sCBAJWBCIMBOgYKCNoRHCAAUPSwpmBAwk/R4kAvzCIADBmBQIZLB/r9DJYJ8BAwR7B+4GDWARpCPYQGEW4R3DAoQGCaQQGDh+ANAN/AwMfwE+DwIGBv+AngDBP4KPBvgDBwAoBgIRBagQvKZIIGEWoJfBfogGDPYUPNoRfCNoPvEIRtC5//YYQGBx5DBAwNgXjsBHoYnBgyrEgEcVYkAvCrD/x9CPYX+gZ0E/0HKQJtC/0fAwIvC/k/QQIoC+F/AwN+B4PAVYTsBn+BHAIrCvwKCh/wHYMDagSkDF4IGEF4iyDAwayCAwYoBMwTbDdgLbEdIgoBcQi5Bg4JBToYAWmEAggGDGgM8AoUDMgJLCOwPggYGDn/gh4GDPIMfLIQGBwE/EgIABOQM/KQJPBCIM+egYvBnAGDCINgJotAKw4'))),
      46,
      atob("DSEcFx4aHhsbHRwbDw=="),
      55|65536
    );
  };

  Graphics.prototype.setFontBodoniModaVariableFontopszwght = function() {
    // Actual height 48 (47 - 0)
    // 1 BPP
    return this.setFontCustom(
      E.toString(require('heatshrink').decompress(atob('ABMCAokB+AGEv4FEh/gCQn8Bgk/wAFDgYSEgE4I7NwEBUcAokOAokHAokDIokB4AMEAopRFG0Y8MGzsDTajJEgf/AwYFB/7qCgIFB/5UCv4FB/DhCBgRbBh4FCEAIYDDIV/FAQZBj6HDwB9EN4J9DgUAiBJDsAHBAAUEgFAAweAhAFDiEBAoYXBmDfEXggKBUgaWBh45CIoMAMQUfPIJlFBgIACAoIMDDgQFCSQUHRYiMCVggFFACp4BkB4EA4J4DA4KYJoCYESALXCL4ReD//gaIhNBcgbYBMgRsDAof+D4rWDGQYADYYgABLohlCAAhdDABsBGQMHV4V4gEDYQUfBwPHBgMH8EAsBPBgJlBhEfDgNvwECgYSBjICBoE+gEGAQMYgYYBw/ATAdgb4NANQQyBNoQiBTAJdDvkAmAFBmEPwEGAoMMgIyBI4MHgAyBjxjCg/AIgIQCGQK4BKwIyBXARvBDoLYBL4IyBBgIYBGQIMBDAIhCg54BGQQmBAQTLEg4yBAB5LBAYI7BgIoCvwlCQYMfMwXkgEFHwMA/lAgMfJAMfSAMjD4XBQQM8FoUQTAQjBWAMgU4dAggXBWYSoBBwQIBiAhBYwTQCKAIIBuEAvCSBwCHBnobBHgKeB3kAHgMf//n+F/wEBWIKnBCQK4Bh//RYMDWIK6CDIPwBgKFCVwK6CUipiCAAc4AokNAokGOYIACgOEBgnAD4kwQQIACjCdBDwamCAAKNBUwQeCUwSbCUwQeCgC1BAAMOKQQNBDwK1BYYR7BGQJABDwIyBIAMwaAQNBR4IAC4CeBAASMBV4IACCQvgXwIAC/jLCAARzEGQQACGQSMDOYhlEAAJlDAB8+AokPfwf8gP+dAJOBBIItBJwNAg/mKQOAJIP8oED+B8CWYN+eAeAh/ALgUQgP4LgQCBn5cDFAPgaAQCBHoIfBHYIyBVoVgGQMHBgLVBGQKpBg47B4Ef8ADBGQKnCBwIyBM4JlDY4WAgZlBBgJ4Bv4IBDAQACj4PBAAc8UqQADg7wBVIbqCBYY4CgBECCYYFC+AFBJQIMDj4XBv4ZBg/84B8CSQKLBgIIBn0MBIKLBh6bBBgJpB4DbBXwMAuEEXwccaIbeBB4S+CA4RPBE4VwAwPgd4QFBnDcCUAQaCKYP/XwI8BXwY9BXwZ5EHYS+EKwR+DSYQLDABavEEYIWEDgzhFj47DIYI1EU4bWDU4IDCgJhBXYR0CMAXAGQRZBCAIyCbAQyCnEf8AyCjgjCGQMOgEeFwUHPgf4gaJEdARlDMwn8YgRlC3BlEOQplGTAp+EACBRBAAJXBj6CCh/4g5+BJgP/wP/HgKCCv4MCAYOfRYUf//7fAT8CvkBRIP4gIdBF4McKgdggYDBEYMMgFAgEILoQDBgIFBiADCkEAgQDCggIBoEGCQJ0BjEAToN4SAJFBVoOAVwJYB/+8IYIKB//3bwRSB/gFBIIIMBh5lCBgPg//+aQXwBgKpCNAIYCZAbaEABUHbIilBC4ZMCBgYFBFoL4CBgR9BDAIZCkAYBgZKBQIM8HwJwBwCtBBAQSBKgICBCQKYBgEwA4ajCuCzBUYTJBiAFBhEHwAPBD4MBHQNgawStBGQUIn6EDgU/QoMf4ED34JBNYStBTwQGCSoQFCHgQMCQwQZCP4a2BAoYGBWB5qDMYcBDwMPGYV/HgLrBEoYIBCQJQBFwc/wAICdIcfFgU4CoL4EAAYA=='))),
      46,
      atob("ChofFRwaHxodGxwcCg=="),
      51|65536
    );
  };
  
  Graphics.prototype.setFontTeko = function() {
    // Actual height 44 (47 - 4)
    // 1 BPP
    return this.setFontCustom(
      E.toString(require('heatshrink').decompress(atob('AEcD8AHFh4HGj/AA4s/wAHFv4nG/wHG/AHGFwwAIIw4+G/4+Fh42G/4eFBx//MY3wAwkHB1ZDBAwsBBw0DdMH/SYp0BPot/A4I6DgYGB/7TDCwQHEn4HC/gtEA4geBaAM/C4UPGYUDA4UfOQYHCvBCDH4RKEAgMBewYECQokBM4MGWIgCBhwHDAgUcA4c8AQM+A4Y+CA4cDHYV/G4QDENwaUFPogHDToYHDLQaVC/w6Dj4WFVobMEgLLFAH0YAgdAAQMwXgrUEZIQKDZIbHCAAMMOgQPDnCEEQwi0EFYQGDUoUDA4gjBg4HEUYi1GAAUcNRYACNQYADsAHGcgYADaogARPoRCEPoUB/AHCPoUHAYUDPoU/BwUPHwX8A4U/HwMBCwSRBDwQSCgZ9CWgcPDYU+CwU+HQV8A4X5EYQKCgfDHwIuDh4rCJId8FYQKCCQMfKIgKBGYUfA4JgBGYU/4EBIgIzCA4MP+AzDfYXAGYYHBMYJqDBwIcBNQYWCGYKBDQQV+A4V/GYSZGga4DVgwADZ4YAbdYUAmADCvDzCNIT3Dg5hCgZ9CjwWCg4TCDQSxFKwZhCBQNgA4IKEBIIjCRAMBBIJmCY4MDA4JOCY4IcCuD7DbIT7EUQMBfYTRBUQMDJIX4h4HBhw+CXgIHBngHGLQUf//v/xtDA4OPCIKBCj/+DIL1BA4XwA4LTDNwIHBDwQJDeoQADg6QDABS3DAAcfA4wmGgZFDCwZmBAAl+JobpC/I+Fh/DKos/cQQWDTwI+ERQLXBCwmAYoQACHgLXBJgY0BHwhjBa4RMDCII+DgYUBHwkPAgI+En7CBAAL7CAwf/fYQHEDAMHA4jzEAAKWCdYIACSwp9FcwatGagx9FAAJ9EAAS8FADMBH40HA4YMCVAJUDY4atEgF/VoZyCBQQbBJgQKCUoLKCBQSVBZQQKCv/PXIQKC/kfXIQCBgP4HYROCfQIHCJIUH8BDCjzrDZIU4IoWAA4Q2Cn5HBFYLFCvwHCPof8A4QmCHwL9BwBdCHwIHBMAY+BA4QeCHwIHB/zoEE4LUDJIQWDgFAcDyfCIoTUDGwgOC/7DCL4RVBJwZPBA4wWBA4hcBA4sHFoMPNwhkBgIvDv/OfYv+jgEBvAeC+EwAgNwDwXALgQCCnzJDAQS8BSYMBAQXgg5hCEwWAh4EBhx7CWwUAHIQCBn4+EHIN/KwI5EcQJCBGIZ2CGIgGBMoUGQwfwA4MMA4ZVCjAHCRgcgD4QWCAAZHCADJHCAAk+AwsBfAqDBOIQ7ENwIAEvwmGb4YmKgYmGg55CRQS8BFwd8HwQTDEYRVDv6GCCQUHXwLzCBwSdCgISBBwg+CBwY+CBwg+CBwg+BBwo+BBwokBBwrxCPorZGgYOFHwLoGh7obABqoEcgV/LAZOBKIKNDA4MPA4YEB+E/A4YEB+B4Ev1/+P8j7gCCoP3U4IHBgfAj53Bg4/Bg4/BZwIEBgEOI4YEBgEYA4cMA4MwHAIHBBgMAsAHDBgMAGIJkCBgMB4BkBBQI+CwEH3/AAgJBCj4XBHwUH4P8A4McOol/+BQBA4XAOogHBewR1Ch/8A4SxDcgN/BQKlCTAS0DAAR0CADKcCAAZ0BGgR9BMwIHDJwTUBA4MBfgX/A4RKCeYIHCgweD/4vBQoUfM4IHBnAHBngRBN4NweYQhB8C5BXgT2CeYS3FCwIxDgF8AgLuCh0BNAQ5CjkHSoQ5CnEfLoV4AQPg/x9CDQMB460DAYMHbgKMDbwYHDAAScEPwYHFaYYHDHoQHDCwalDdQt/Jgb8FAGbDBO4JXDh57Bn4HDj4HBv4XDBgRYEBgMBN4gMBgbMCWwYxCAAQEBeAQAIA=='))),
      46,
      atob("DRMfGh4cHx0fHh4fDg=="),
      63|65536
    );
  };

  fonts = {
    current: "Vector",
    Bondoni: "Bondoni", // Custom font
    Vector: "Vector",  // Standard font
    Teko: "Teko"       // Custom font
  };

}

// Initialize the display parameters
const display = {
  width: g.getWidth(),
  height: g.getHeight(),
  centerX: g.getWidth() / 2,
  centerY: g.getHeight() / 2,
  quadraticScaler: 205,
  get scaleX() { return this.width / this.quadraticScaler; },
  get scaleY() { return this.height / this.quadraticScaler; },
  get scale() { return Math.min(this.scaleX, this.scaleY); }
};

// Color palettes
const colorPalettes = {
  hours: process.env.HWVERSION == 1 
    ? ["#ff5555", "#ffff00", "#FF9901", "#2F00FF", "#7ac5cd"]
    : ["#ff0000", "#00ff00", "#ff0000", "#ff00ff", "#7ac5cd"],
  minutes: process.env.HWVERSION == 1
    ? ["#55ff55", "#ffffff", "#00EFEF", "#FFBF00", "#7ac5cd"]
    : ["#00ff00", "#0000ff", "#00ffff", "#00ff00", "#7ac5cd"]
};

// Set up the 12/24 hour format
const _12hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"] || false;

// System compatibility
var WIDGETS = {}; // For development only



// Setup the UI colors and state
function setupUI() {
  // Set color scheme based on settings
  if (settings.color === 0) {
    colorPalettes.hours = [colors.fg];
    colorPalettes.minutes = [colors.fg2];
  }
  
  g.setTheme({bg: colors.bg, fg: colors.fg});
  
  // Configure display mode
  state.zeitanzeigen = (state.wischfunktion <= 2 && state.wischfunktion >= 0) || state.wischfunktionZ === 1;
}

// Setup and start the update interval
function setUpdateInterval(set) {
  if (!state.zeitanzeigen) return;
  
  if (state.interval) clearInterval(state.interval);
  if (set) state.interval = setInterval(draw, REFRESH_RATE);
}

// Draw date display
function drawDate() {
  g.clear();
  setupUI();
  
  // Prepare the date strings
  const date = new Date();
  const dateStr = ("0" + date.getDate()).slice(-2) + ".";
  const monthStr = ("0" + (date.getMonth() + 1)).slice(-2);
  
  // Draw background
  g.setColor(colors.bg);
  g.fillRect(0, 0, display.width, display.height);
  
  // Setup font and positioning
  g.setFontAlign(0, 0).setFont(currentFont,2);
  let x = display.centerX - 20;
  let y = display.centerY - 35;
  if(currentFont == "NunitoBlack"){y+=3;}
  if(currentFont == "NummeralByLERegular"){
    y-=8;
    x-=10;
    }
  // Draw date
  g.setColor(colors.fg);
  g.drawString(dateStr, x, y);
  // Draw month
  if(currentFont == "NummeralByLERegular"){x-=10;}
  y += 87;
  x += 40;
  g.setColor(colors.fg2);
  g.drawString(monthStr, x, y);
}

// Draw time display
function drawTime() {
  g.clear();
  setupUI();
setUpdateInterval(1);
  // Prepare the time strings
  const date = new Date();
  const hStr = ("0" + date.getHours()).substr(-2);
  const mStr = ("0" + date.getMinutes()).substr(-2);
  
  // Draw background
  g.setColor(colors.bg);
  g.fillRect(0, 0, display.width, display.height);
  
  // Setup font and position
  g.setFontAlign(0, 0).setFont(currentFont,2);
  let x = display.centerX;
  let y = display.centerY - 35;
  //fontcorrection
  if(currentFont == "NummeralByLERegular"){y-=8;}
  if(currentFont == "NunitoBlack"){y+=3;}
  // Draw hours
  g.setColor(colors.fg);
  g.drawString(hStr, x, y);
  
  // Draw minutes
  y += 87;
  g.setColor(colors.fg2);
  g.drawString(mStr, x, y);
}

// Draw seconds display
function drawSeconds() {
  g.clear();
  setupUI();
  setUpdateInterval(1);
  
  // Prepare the time strings
  const date = new Date();
  const mStr = ("0" + date.getMinutes()).substr(-2);
  const sStr = ("0" + date.getSeconds()).substr(-2);
  
  // Draw background
  g.setColor(colors.bg);
  g.fillRect(0, 0, display.width, display.height);
  
  // Setup font and position
  g.setFontAlign(0, 0).setFont(currentFont,2);
  let x = display.centerX;
  let y = display.centerY - 35;
  //fontcorrection
  if(currentFont == "NummeralByLERegular"){y-=8;}
  if(currentFont == "NunitoBlack"){y+=3;}
  // Draw minutes
  g.setColor(colors.fg);
  g.drawString(mStr, x, y);
  
  // Draw seconds
  y += 87;
  g.setColor(colors.fg2);
  g.drawString(sStr, x, y);
}

// Draw steps display
function drawSteps() {
  setupUI();
  g.clear();
  g.reset();
  
  // Draw background
  g.setColor(colors.bg);
  g.fillRect(0, 0, display.width, display.height);
  
  // Setup font and draw steps
  g.setFontAlign(0, 0).setFont("Vector", 50);
  const stepCount = Bangle.getStepCount();
  const centerX = display.centerX + 5;
  const centerY = display.centerY - 15;
  
  g.setColor(1, 1, 1); // White
  g.drawString(stepCount, centerX, centerY);
  
  // Draw label
  g.setFont("Vector", 32);
  g.drawString("SCHRITTE", display.centerX, display.centerY + 35);
  
  setUpdateInterval(1);
  
}

// Draw heart rate display
function drawHeartRate() {
  setupUI();
  g.clear();
  
  // Activate heart rate monitor
  Bangle.setHRMPower(true);
  Bangle.removeAllListeners("HRM");
  
  // Draw background
  g.reset();
  g.setColor(1, 0, 0); // Red
  g.fillRect(0, 0, display.width, display.height);
  
  // Setup font and display heart rate
  g.setFontAlign(0, 0).setFont("Vector", 30);
  g.setColor(1, 1, 1); // White
  g.drawString(state.frequenz + " BPM", display.centerX, display.centerY);
  
  // Setup heart rate monitor
  Bangle.on("HRM", function(hrm) {
    state.frequenz = hrm.bpm || "WAITING\n FOR\n";
    if (state.frequenz === 0) {
      state.frequenz = "WAITING\n FOR\n";
    }
  });
  
  // Setup Bluetooth if needed
  if (!state.bluetoothConnection) {
    NRF.setServices(undefined, { uart: true });
    Bangle.on('HRM', function(hrm) {
      Bluetooth.println("HRM:" + hrm.bpm);
      state.bcon = true;
    });
    state.bluetoothConnection = true;
  }
}
// Draw flashlight
function drawFlashlight() {
  g.clear();
  setUpdateInterval(0);
  Bangle.setLCDTimeout(0);
  // Full white screen
  g.setColor(100, 100, 100); // White
  g.fillRect(0, 0, display.width, display.height);
  Bangle.setLCDBrightness(MAX_BRIGHTNESS);
}


// Draw battery status
function drawBattery() {
  g.setColor(colors.bg);
  g.fillRect(0, 0, display.width, display.height);
  
  // Draw battery widget
  g.reset();
  g.setFontAlign(0, 0);
  
  // Battery icon - simplified for brevity
  const img = atob("ZGSBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////gAAAB////////////gAAAf////////////gAAD/////////////AAAP////////////8AAB/////////////4AAH/////////////gAA//////////////AAD/////////////8AAP/////////////wAA//////////////AAD/////////////8AAP/////////////wAA//////////////AAD/////////////8AAP/////////////wAA//////////////+AD//////////////8AP//////7///////wA//////+P///////AD//////g///////8AP/////wD///////wA/////8AP///////AD/////AA///////8AP////wAD//P////wA////8AAPgB/////AD///+ADwAAf////8AP///j//AAP/////wA//////8AD//////AD//////wA//////8AP//////AP//////wA//////8D///////AD//////x///////8AP//////f///////wA///////////////AD//////////////4AP/////////////wAA//////////////AAD/////////////8AAP/////////////wAA//////////////AAD/////////////8AAP/////////////wAA//////////////AAD/////////////8AAH/////////////gAAf////////////+AAA/////////////wAAD/////////////AAAH////////////4AAAH///////////+AAAAH///////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"); // Shortened placeholder
  g.drawImage(img, 35, 15);
  
  // Draw battery percentage
  g.setFontAlign(0, 0).setFont("Vector", 48);
  g.drawString(E.getBattery() + "%", display.centerX, display.centerY + 30);
  
  Bangle.setLCDBrightness(DEFAULT_BRIGHTNESS);
  
  // Auto-return to normal mode after 3 seconds
  if (state.wischfunktionZ !== 2) {
    setTimeout(function() {
      Bangle.setLCDBrightness(DEFAULT_BRIGHTNESS);
      state.wischfunktionZ = 1;
      state.windowZ = state.wischfunktionZ;
      setupUI();
    }, 3000);
  }
}


// Main draw function - handles different display modes
function draw() {

  // Handle primary display modes
  switch (state.wischfunktion) {
    case 0: drawDate(); break;
    case 1: drawTime(); break;
    case 2: drawSeconds(); break;
    case 3: drawSteps(); break;
    case 4: drawHeartRate(); break;
    case 99: break; // Menu mode
  }
  
  // Handle secondary display modes
  switch (state.wischfunktionZ) {
    case 0: drawBattery(); break;
    case 2: drawFlashlight(); break;
    // case 1 is normal mode, handled by primary display
  }
}


// Start the draw loop
function startDrawLoop() {
  if (state.drawInterval) clearInterval(state.drawInterval);
  state.drawInterval = setInterval(() => {
    if (Bangle.isLCDOn()) draw();
  }, REFRESH_RATE);
}

// Declare menu variables globally
let mainMenu, colorSettingsMenu, fontMenu;

// Create the main menu system
function createMenuSystem() {
  // Color settings menu
  colorSettingsMenu = {
    "": { "title": "Choose Color" },
    "Background": () => {
      E.showMenu(createColorMenu("Hintergrundfarbe", (color) => colors.bg = color, colorSettingsMenu));
    },
    "Upper digits": () => {
      E.showMenu(createColorMenu("Obere Zeichen", (color) => colors.fg = color, colorSettingsMenu));
    },
    "Lower digits": () => {
      E.showMenu(createColorMenu("Untere Zeichen", (color) => colors.fg2 = color, colorSettingsMenu));
    },
    "< back": () => {
      E.showMenu(mainMenu);
    }
  };
  
  // Font menu
  fontMenu = {
  "": { "title": "Choose Font" },
  "Bodoni": () => {
    currentFont = "BodoniModaVariableFontopszwght";  // Make sure this font is available
    E.showMenu(mainMenu);
  },
    "NumeraLE": () => {
    currentFont = "NummeralByLERegular";
    g.setFont("Vector"); // Make sure this font is available
    E.showMenu(mainMenu);
  },
  "NewRocker": () => {
    currentFont = "NewRockerRegular";  // This should match what's in your fonts object
    E.showMenu(mainMenu);
  },
  "NunitoBlack": () => {
    currentFont = "NunitoBlack";  // This should match what's in your fonts object
    E.showMenu(mainMenu);
  },
  "Teko": () => {
    currentFont = "Teko";
    g.setFont("Vector"); // Make sure this font is available
    E.showMenu(mainMenu);
  },
  "< back": () => {
    E.showMenu(mainMenu);
  }
};
  
  // Main menu
  mainMenu = {
    "": { "title": "Abbel Menu" },
    "Color": () => {
      E.showMenu(colorSettingsMenu);
    },
    "Fonts": () => {
      E.showMenu(fontMenu);
    },/*
    "Auto Anzeige3": {
      value: true,
      onchange: v => {
        console.log("Toggle changed to", v);
      }
    },*/
    "< Back": () => {
      E.showMenu(); // Closes menu
      state.menuOpen = false;
      state.wischfunktion = 1;
      state.wischfunktionZ = 1;
      state.windowZ = 1;
      draw(); // Redraw the display
    }
  };
}

function conditionalBuzz(duration) {
  if (!state.menuOpen) {
    Bangle.buzz(duration || 60);
  }
}
// Handle long press
function onLongPress() {
  state.loongpress = true;
  state.wischfunktionZ = 99;
  state.wischfunktion = 99;
  state.zeitanzeigen = false;
  
  g.clear();
  showMenu();
  
  // Optional vibration feedback
  conditionalBuzz();
}


// Create a color picker menu
function createColorMenu(title, colorSetter, returnMenu) {
   colorOptions = {
    "White": "#FFFFFF",
    "Black": "#000000",
    "Yellow": "#FFFF00",
    "Orange": "#ff8000",
    "Turquoise": "#00FFFF",
    "Blue": "#0000FF",
    "Green": "#00FF00",
    "Cyan": "#00fff7",
    "Red": "#FF0000",
    "Pink": "#ff0084",
    "Magenta": "#ff00ff",
    "Azure": "#88b3f7",
    "Light-Red": "#f09b7f",
    "Gray": "#757575"
  };
  
  const menu = { "": { "title": title } };
  
  // Add color options - revised to avoid destructuring
  Object.keys(colorOptions).forEach(function(colorName) {
    const colorValue = colorOptions[colorName];
    menu[colorName] = function() {
      // Apply the color
      colorSetter(colorValue);
      g.setBgColor(colorValue);
      g.clear();
      g.setColor("#FFFFFF");
      g.drawString("Farbe: " + colorValue + "\n Gesetzt", 10, 50);
      
      // Return to previous menu after delay
      setTimeout(function() { 
        E.showMenu(returnMenu);
      }, 1000);
      setupUI();
    };
  });
  
  // Add back option
  menu["< Zurück"] = function() {
    E.showMenu(returnMenu);
  };
  
  return menu;
}

// Show the menu
function showMenu() {
  state.menuOpen = true;
  E.showMenu(mainMenu);
}

// Handle touch events
let touchStartX = 0;
let touchStartY = 0;
const MOVEMENT_THRESHOLD = 30; // How many pixels movement is allowed before canceling long press

// Handle touch events
Bangle.on('touch', (button, xy) => {
  if (state.touchStartTime === 0) {
    // First touch - record the time and position
    state.touchStartTime = getTime();
    touchStartX = xy.x;
    touchStartY = xy.y;
  } else {
    // Calculate how long the touch has been held
    const duration = (getTime() - state.touchStartTime) * 2000;
    
    // Calculate how far the finger has moved
    const moveX = Math.abs(xy.x - touchStartX);
    const moveY = Math.abs(xy.y - touchStartY);
    const totalMovement = moveX + moveY;
    
    // Only trigger long press if finger hasn't moved much AND held long enough
    if (duration >= LONG_PRESS_DURATION && totalMovement < MOVEMENT_THRESHOLD) {
      onLongPress();
    }
    
    // Don't reset timer here - let it continue until finger is lifted
  }
});

// Add a separate touch_end event to reset the timer
Bangle.on('touch_end', () => {
  state.touchStartTime = 0; // Reset timer when finger is lifted
});

// Handle drag events (vertical swipes)
Bangle.on('drag', function(e) {
  if (e.b === 1 && !state.swipeDone) {
    if (e.dy < -60 && Math.abs(e.dy) > Math.abs(e.dx)) {
      // Swipe up
      state.windowZ++;
      conditionalBuzz();
      state.swipeDone = true;
    } else if (e.dy > 60 && Math.abs(e.dy) > Math.abs(e.dx)) {
      // Swipe down
      state.windowZ--;
      conditionalBuzz();
      state.swipeDone = true;
    }
    
    // Constrain within range
    if (state.wischfunktionZ !== 99) {
      state.windowZ = Math.max(0, Math.min(3, state.windowZ));
      state.wischfunktionZ = state.windowZ;
      draw();
    }
  }
  
  // Reset flag when finger is lifted
  if (e.b === 0) {
    state.swipeDone = false;
  }
});

// Handle swipe events (horizontal swipes)
Bangle.on('swipe', function(dir) {
  if (dir === -1) {
    // Swipe left
    state.window++;
    conditionalBuzz();
  } else if (dir === 1) {
    // Swipe right
    state.window--;
    conditionalBuzz();
  }
  
  // Constrain within range
  if (state.wischfunktion !== 99) {
    state.window = Math.max(0, Math.min(4, state.window));
    state.wischfunktion = state.window;
    draw();
  }
});


// LCD power management
Bangle.on('lcdPower', on => {
  if (on) {
    draw();
    startDrawLoop();
  } else {
    //g.clear();
    if (state.drawInterval) clearInterval(state.drawInterval);
    state.drawInterval = undefined;
  }
});

function drawLockIndicator() {
  const radius = 5;
  const margin = 10;
  const x = display.width - margin - radius;
  const y = margin + radius;
  // Draw the indicator ball
  g.setColor("#00FF00"); // Green if unlocked
  g.fillCircle(x, y, radius);
  startDrawLoop();
  
}
// Initialize the app
function init() {
  setupFonts();
  setupUI();
  
  // Create the menu system early
  createMenuSystem();
  
  g.clear(1);
  Bangle.setUI("clock");
  
  if (settings.color > 0) {
    _rCol = settings.color - 1;
  }
  if (state.wischfunktion !== 4) {
    Bangle.setHRMPower(false);
    Bangle.removeAllListeners("HRM");
  }
  
  setUpdateInterval(1);
  draw();
}

// Start the app
init();
Bangle.setLCDTimeout(10); // screen turns off after 10 sec
