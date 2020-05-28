// EspruinoTools bundle (https://github.com/espruino/EspruinoTools)
// Created with https://github.com/espruino/EspruinoWebIDE/blob/gh-pages/extras/create_espruinotools_js.sh
// Based on EspruinoWebIDE  0.73.7
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Initialisation code
 ------------------------------------------------------------------
**/
"use strict";

var Espruino;

(function() {

  /** List of processors. These are functions that are called one
   * after the other with the data received from the last one.
   *
   * Common processors are:
   *
   *   jsCodeChanged        - called when the code in the editor changes with {code}
   *   sending              - sending code to Espruino (no data)
   *   transformForEspruino - transform code ready to be sent to Espruino
   *   transformModuleForEspruino({code,name})
   *           - transform module code before it's sent to Espruino with Modules.addCached (we only do this if we don't think it's been minified before)
   *   connected            - connected to Espruino (no data)
   *   disconnected         - disconnected from Espruino (no data)
   *   environmentVar       - Board's process.env loaded (object to be saved into Espruino.Env.environmentData)
   *   boardJSONLoaded      - Board's JSON was loaded into environmentVar
   *   getModule            - Called with data={moduleName:"foo", moduleCode:undefined} - moduleCode should be filled in if the module can be found
   *   getURL               - Called with data={url:"http://....", data:undefined) - data should be filled in if the URL is handled (See Espruino.Core.Utils.getURL to use this)
   *   terminalClear        - terminal has been cleared
   *   terminalPrompt       - we've received a '>' character (eg, `>` or `debug>`). The argument is the current line's contents.
   *   terminalNewLine      - When we get a new line on the terminal, this gets called with the last line's contents
   *   debugMode            - called with true or false when debug mode is entered or left
   *   editorHover          - called with { node : htmlNode, showTooltip : function(htmlNode) } when something is hovered over
   *   notification         - called with { mdg, type:"success","error"/"warning"/"info" }
   **/
  var processors = {};

  function init() {

    Espruino.Core.Config.loadConfiguration(function() {
      // Initialise all modules
      function initModule(modName, mod) {
        console.log("Initialising "+modName);
        if (mod.init !== undefined)
          mod.init();
      }

      var module;
      for (module in Espruino.Core) initModule(module, Espruino.Core[module]);
      for (module in Espruino.Plugins) initModule(module, Espruino.Plugins[module]);

      callProcessor("initialised", undefined, function() {
        // We need the delay because of background.js's url_handler...
        setTimeout(function() {
          Espruino.initialised = true;
        }, 1000);
      });
    });
  }

  // Automatically start up when all is loaded
  if (typeof document!=="undefined") 
    document.addEventListener("DOMContentLoaded", init);

  /** Add a processor function of type function(data,callback) */
  function addProcessor(eventType, processor) {
    if (processors[eventType]===undefined)
      processors[eventType] = [];
    processors[eventType].push(processor);
  }

  /** Call a processor function */
  function callProcessor(eventType, data, callback) {
    var p = processors[eventType];
    // no processors
    if (p===undefined || p.length==0) {
      if (callback!==undefined) callback(data);
      return;
    }
    // now go through all processors
    var n = 0;
    var cbCalled = false;
    var cb = function(inData) {
      if (cbCalled) throw new Error("Internal error in "+eventType+" processor. Callback is called TWICE.");
      cbCalled = true;
      if (n < p.length) {
        cbCalled = false;
        p[n++](inData, cb);
      } else {
        if (callback!==undefined) callback(inData);
      }
    };
    cb(data);
  }

  // -----------------------------------
  Espruino = {
    Core : { },
    Plugins : { },
    addProcessor : addProcessor,
    callProcessor : callProcessor,
    initialised : false,
    init : init, // just in case we need to initialise this by hand
  };

  return Espruino;
})();
Espruino.Core.Notifications = {
  success : function(e) { console.log(e); },
  error : function(e) { console.error(e); },
  warning : function(e) { console.warn(e); },
  info : function(e) { console.log(e); },
};
Espruino.Core.Status = {
  setStatus : function(e,len) { console.log(e); },
  hasProgress : function() { return false; },
  incrementProgress : function(amt) {}
};
var acorn = (function(){ var exports={};var module={};
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.acorn = {})));
}(this, (function (exports) { 'use strict';

// Reserved word lists for various dialects of the language

var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};

// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

var keywords = {
  5: ecma5AndLessKeywords,
  6: ecma5AndLessKeywords + " const class extends export import super"
};

var keywordRelationalOperator = /^in(stanceof)?$/;

// ## Character categories

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `bin/generate-identifier-regex.js`.

var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fd5\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ae\ua7b0-\ua7b7\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d4-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d01-\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf8\u1cf9\u1dc0-\u1df5\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by bin/generate-identifier-regex.js

// eslint-disable-next-line comma-spacing
var astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,17,26,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,26,45,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,785,52,76,44,33,24,27,35,42,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,54,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,86,25,391,63,32,0,449,56,264,8,2,36,18,0,50,29,881,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,881,68,12,0,67,12,65,0,32,6124,20,754,9486,1,3071,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,60,67,1213,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,3,5761,10591,541];

// eslint-disable-next-line comma-spacing
var astralIdentifierCodes = [509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,1306,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,52,0,13,2,49,13,10,2,4,9,83,11,7,0,161,11,6,9,7,3,57,0,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,87,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,423,9,838,7,2,7,17,9,57,21,2,13,19882,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,2214,6,110,6,6,9,792487,239];

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) { return false }
    pos += set[i + 1];
    if (pos >= code) { return true }
  }
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) { return code === 36 }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes)
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) { return code === 36 }
  if (code < 58) { return true }
  if (code < 65) { return false }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
}

// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

var TokenType = function TokenType(label, conf) {
  if ( conf === void 0 ) conf = {};

  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};

function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}
var beforeExpr = {beforeExpr: true};
var startsExpr = {startsExpr: true};

// Map keyword names to token types.

var keywords$1 = {};

// Succinct definitions of keyword token types
function kw(name, options) {
  if ( options === void 0 ) options = {};

  options.keyword = name;
  return keywords$1[name] = new TokenType(name, options)
}

var types = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {beforeExpr: true}),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import"),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
};

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
}

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;

// Checks if an object has a property.

function has(obj, propName) {
  return hasOwnProperty.call(obj, propName)
}

var isArray = Array.isArray || (function (obj) { return (
  toString.call(obj) === "[object Array]"
); });

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = function Position(line, col) {
  this.line = line;
  this.column = col;
};

Position.prototype.offset = function offset (n) {
  return new Position(this.line, this.column + n)
};

var SourceLocation = function SourceLocation(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) { this.source = p.sourceFile; }
};

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    lineBreakG.lastIndex = cur;
    var match = lineBreakG.exec(input);
    if (match && match.index < offset) {
      ++line;
      cur = match.index + match[0].length;
    } else {
      return new Position(line, offset - cur)
    }
  }
}

// A second optional argument can be given to further configure
// the parser process. These options are recognized:

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must
  // be either 3, 5, 6 (2015), 7 (2016), or 8 (2017). This influences support
  // for strict mode, the set of reserved words, and support for
  // new syntax features. The default is 7.
  ecmaVersion: 7,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"` or `"module"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called
  // when a semicolon is automatically inserted. It will be passed
  // th position of the comma as an offset, and if `locations` is
  // enabled, it is given the location as a `{line, column}` object
  // as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program.
  allowImportExportEverywhere: false,
  // When enabled, hashbang directive in the beginning of file
  // is allowed and treated as a line comment.
  allowHashBang: false,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false,
  plugins: {}
};

// Interpret and default an options object

function getOptions(opts) {
  var options = {};

  for (var opt in defaultOptions)
    { options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt]; }

  if (options.ecmaVersion >= 2015)
    { options.ecmaVersion -= 2009; }

  if (options.allowReserved == null)
    { options.allowReserved = options.ecmaVersion < 5; }

  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function (token) { return tokens.push(token); };
  }
  if (isArray(options.onComment))
    { options.onComment = pushComment(options, options.onComment); }

  return options
}

function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start: start,
      end: end
    };
    if (options.locations)
      { comment.loc = new SourceLocation(this, startLoc, endLoc); }
    if (options.ranges)
      { comment.range = [start, end]; }
    array.push(comment);
  }
}

// Registered plugins
var plugins = {};

function keywordRegexp(words) {
  return new RegExp("^(?:" + words.replace(/ /g, "|") + ")$")
}

var Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = keywordRegexp(keywords[options.ecmaVersion >= 6 ? 6 : 5]);
  var reserved = "";
  if (!options.allowReserved) {
    for (var v = options.ecmaVersion;; v--)
      { if (reserved = reservedWords[v]) { break } }
    if (options.sourceType == "module") { reserved += " await"; }
  }
  this.reservedWords = keywordRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = keywordRegexp(reservedStrict);
  this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.
  this.containsEsc = false;

  // Load plugins
  this.loadPlugins(options.plugins);

  // Set up token state

  // The current position of the tokenizer in the input.
  if (startPos) {
    this.pos = startPos;
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  } else {
    this.pos = this.lineStart = 0;
    this.curLine = 1;
  }

  // Properties of the current token:
  // Its type
  this.type = types.eof;
  // For tokens that include more information than their type, the value
  this.value = null;
  // Its start and end offset
  this.start = this.end = this.pos;
  // And, if locations are used, the {line, column} object
  // corresponding to those offsets
  this.startLoc = this.endLoc = this.curPosition();

  // Position information for the previous token
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;

  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.
  this.context = this.initialContext();
  this.exprAllowed = true;

  // Figure out if it's a module code.
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || this.strictDirective(this.pos);

  // Used to signify the start of a potential arrow function
  this.potentialArrowAt = -1;

  // Flags to track whether we are in a function, a generator, an async function.
  this.inFunction = this.inGenerator = this.inAsync = false;
  // Positions to delayed-check that yield/await does not exist in default parameters.
  this.yieldPos = this.awaitPos = 0;
  // Labels in scope.
  this.labels = [];

  // If enabled, skip leading hashbang line.
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
    { this.skipLineComment(2); }

  // Scope tracking for duplicate variable names (see scope.js)
  this.scopeStack = [];
  this.enterFunctionScope();
};

// DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them
Parser.prototype.isKeyword = function isKeyword (word) { return this.keywords.test(word) };
Parser.prototype.isReservedWord = function isReservedWord (word) { return this.reservedWords.test(word) };

Parser.prototype.extend = function extend (name, f) {
  this[name] = f(this[name]);
};

Parser.prototype.loadPlugins = function loadPlugins (pluginConfigs) {
    var this$1 = this;

  for (var name in pluginConfigs) {
    var plugin = plugins[name];
    if (!plugin) { throw new Error("Plugin '" + name + "' not found") }
    plugin(this$1, pluginConfigs[name]);
  }
};

Parser.prototype.parse = function parse () {
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.parseTopLevel(node)
};

var pp = Parser.prototype;

// ## Parser utilities

var literal = /^(?:'((?:\\.|[^'])*?)'|"((?:\\.|[^"])*?)"|;)/;
pp.strictDirective = function(start) {
  var this$1 = this;

  for (;;) {
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this$1.input)[0].length;
    var match = literal.exec(this$1.input.slice(start));
    if (!match) { return false }
    if ((match[1] || match[2]) == "use strict") { return true }
    start += match[0].length;
  }
};

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true
  } else {
    return false
  }
};

// Tests whether parsed token is a contextual keyword.

pp.isContextual = function(name) {
  return this.type === types.name && this.value === name && !this.containsEsc
};

// Consumes contextual keyword if possible.

pp.eatContextual = function(name) {
  if (!this.isContextual(name)) { return false }
  this.next();
  return true
};

// Asserts that following token is given contextual keyword.

pp.expectContextual = function(name) {
  if (!this.eatContextual(name)) { this.unexpected(); }
};

// Test whether a semicolon can be inserted at the current position.

pp.canInsertSemicolon = function() {
  return this.type === types.eof ||
    this.type === types.braceR ||
    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

pp.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon)
      { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
    return true
  }
};

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp.semicolon = function() {
  if (!this.eat(types.semi) && !this.insertSemicolon()) { this.unexpected(); }
};

pp.afterTrailingComma = function(tokType, notNext) {
  if (this.type == tokType) {
    if (this.options.onTrailingComma)
      { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
    if (!notNext)
      { this.next(); }
    return true
  }
};

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp.expect = function(type) {
  this.eat(type) || this.unexpected();
};

// Raise an unexpected token error.

pp.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

function DestructuringErrors() {
  this.shorthandAssign =
  this.trailingComma =
  this.parenthesizedAssign =
  this.parenthesizedBind =
  this.doubleProto =
    -1;
}

pp.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) { return }
  if (refDestructuringErrors.trailingComma > -1)
    { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) { this.raiseRecoverable(parens, "Parenthesized pattern"); }
};

pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) { return false }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
  if (shorthandAssign >= 0)
    { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
  if (doubleProto >= 0)
    { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
};

pp.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
    { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
  if (this.awaitPos)
    { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
};

pp.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression")
    { return this.isSimpleAssignTarget(expr.expression) }
  return expr.type === "Identifier" || expr.type === "MemberExpression"
};

var pp$1 = Parser.prototype;

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp$1.parseTopLevel = function(node) {
  var this$1 = this;

  var exports = {};
  if (!node.body) { node.body = []; }
  while (this.type !== types.eof) {
    var stmt = this$1.parseStatement(true, true, exports);
    node.body.push(stmt);
  }
  this.adaptDirectivePrologue(node.body);
  this.next();
  if (this.options.ecmaVersion >= 6) {
    node.sourceType = this.options.sourceType;
  }
  return this.finishNode(node, "Program")
};

var loopLabel = {kind: "loop"};
var switchLabel = {kind: "switch"};

pp$1.isLet = function() {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
  if (nextCh === 91 || nextCh == 123) { return true } // '{' and '['
  if (isIdentifierStart(nextCh, true)) {
    var pos = next + 1;
    while (isIdentifierChar(this.input.charCodeAt(pos), true)) { ++pos; }
    var ident = this.input.slice(next, pos);
    if (!keywordRelationalOperator.test(ident)) { return true }
  }
  return false
};

// check 'async [no LineTerminator here] function'
// - 'async /*foo*/ function' is OK.
// - 'async /*\n*/ function' is invalid.
pp$1.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
    { return false }

  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length;
  return !lineBreak.test(this.input.slice(this.pos, next)) &&
    this.input.slice(next, next + 8) === "function" &&
    (next + 8 == this.input.length || !isIdentifierChar(this.input.charAt(next + 8)))
};

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp$1.parseStatement = function(declaration, topLevel, exports) {
  var starttype = this.type, node = this.startNode(), kind;

  if (this.isLet()) {
    starttype = types._var;
    kind = "let";
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
  case types._break: case types._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  case types._debugger: return this.parseDebuggerStatement(node)
  case types._do: return this.parseDoStatement(node)
  case types._for: return this.parseForStatement(node)
  case types._function:
    if (!declaration && this.options.ecmaVersion >= 6) { this.unexpected(); }
    return this.parseFunctionStatement(node, false)
  case types._class:
    if (!declaration) { this.unexpected(); }
    return this.parseClass(node, true)
  case types._if: return this.parseIfStatement(node)
  case types._return: return this.parseReturnStatement(node)
  case types._switch: return this.parseSwitchStatement(node)
  case types._throw: return this.parseThrowStatement(node)
  case types._try: return this.parseTryStatement(node)
  case types._const: case types._var:
    kind = kind || this.value;
    if (!declaration && kind != "var") { this.unexpected(); }
    return this.parseVarStatement(node, kind)
  case types._while: return this.parseWhileStatement(node)
  case types._with: return this.parseWithStatement(node)
  case types.braceL: return this.parseBlock()
  case types.semi: return this.parseEmptyStatement(node)
  case types._export:
  case types._import:
    if (!this.options.allowImportExportEverywhere) {
      if (!topLevel)
        { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
      if (!this.inModule)
        { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
    }
    return starttype === types._import ? this.parseImport(node) : this.parseExport(node, exports)

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
  default:
    if (this.isAsyncFunction()) {
      if (!declaration) { this.unexpected(); }
      this.next();
      return this.parseFunctionStatement(node, true)
    }

    var maybeName = this.value, expr = this.parseExpression();
    if (starttype === types.name && expr.type === "Identifier" && this.eat(types.colon))
      { return this.parseLabeledStatement(node, maybeName, expr) }
    else { return this.parseExpressionStatement(node, expr) }
  }
};

pp$1.parseBreakContinueStatement = function(node, keyword) {
  var this$1 = this;

  var isBreak = keyword == "break";
  this.next();
  if (this.eat(types.semi) || this.insertSemicolon()) { node.label = null; }
  else if (this.type !== types.name) { this.unexpected(); }
  else {
    node.label = this.parseIdent();
    this.semicolon();
  }

  // Verify that there is an actual destination to break or
  // continue to.
  var i = 0;
  for (; i < this.labels.length; ++i) {
    var lab = this$1.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
      if (node.label && isBreak) { break }
    }
  }
  if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
};

pp$1.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement")
};

pp$1.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  this.expect(types._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6)
    { this.eat(types.semi); }
  else
    { this.semicolon(); }
  return this.finishNode(node, "DoWhileStatement")
};

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp$1.parseForStatement = function(node) {
  this.next();
  var awaitAt = (this.options.ecmaVersion >= 9 && this.inAsync && this.eatContextual("await")) ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterLexicalScope();
  this.expect(types.parenL);
  if (this.type === types.semi) {
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, null)
  }
  var isLet = this.isLet();
  if (this.type === types._var || this.type === types._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    if ((this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1 &&
        !(kind !== "var" && init$1.declarations[0].init)) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === types._in) {
          if (awaitAt > -1) { this.unexpected(awaitAt); }
        } else { node.await = awaitAt > -1; }
      }
      return this.parseForIn(node, init$1)
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init$1)
  }
  var refDestructuringErrors = new DestructuringErrors;
  var init = this.parseExpression(true, refDestructuringErrors);
  if (this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (this.options.ecmaVersion >= 9) {
      if (this.type === types._in) {
        if (awaitAt > -1) { this.unexpected(awaitAt); }
      } else { node.await = awaitAt > -1; }
    }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLVal(init);
    return this.parseForIn(node, init)
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) { this.unexpected(awaitAt); }
  return this.parseFor(node, init)
};

pp$1.parseFunctionStatement = function(node, isAsync) {
  this.next();
  return this.parseFunction(node, true, false, isAsync)
};

pp$1.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  // allow function declarations in branches, but only in non-strict mode
  node.consequent = this.parseStatement(!this.strict && this.type == types._function);
  node.alternate = this.eat(types._else) ? this.parseStatement(!this.strict && this.type == types._function) : null;
  return this.finishNode(node, "IfStatement")
};

pp$1.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
    { this.raise(this.start, "'return' outside of function"); }
  this.next();

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(types.semi) || this.insertSemicolon()) { node.argument = null; }
  else { node.argument = this.parseExpression(); this.semicolon(); }
  return this.finishNode(node, "ReturnStatement")
};

pp$1.parseSwitchStatement = function(node) {
  var this$1 = this;

  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types.braceL);
  this.labels.push(switchLabel);
  this.enterLexicalScope();

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  var cur;
  for (var sawDefault = false; this.type != types.braceR;) {
    if (this$1.type === types._case || this$1.type === types._default) {
      var isCase = this$1.type === types._case;
      if (cur) { this$1.finishNode(cur, "SwitchCase"); }
      node.cases.push(cur = this$1.startNode());
      cur.consequent = [];
      this$1.next();
      if (isCase) {
        cur.test = this$1.parseExpression();
      } else {
        if (sawDefault) { this$1.raiseRecoverable(this$1.lastTokStart, "Multiple default clauses"); }
        sawDefault = true;
        cur.test = null;
      }
      this$1.expect(types.colon);
    } else {
      if (!cur) { this$1.unexpected(); }
      cur.consequent.push(this$1.parseStatement(true));
    }
  }
  this.exitLexicalScope();
  if (cur) { this.finishNode(cur, "SwitchCase"); }
  this.next(); // Closing brace
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement")
};

pp$1.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
    { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement")
};

// Reused empty array added for node fields that are always empty.

var empty = [];

pp$1.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types._catch) {
    var clause = this.startNode();
    this.next();
    this.expect(types.parenL);
    clause.param = this.parseBindingAtom();
    this.enterLexicalScope();
    this.checkLVal(clause.param, "let");
    this.expect(types.parenR);
    clause.body = this.parseBlock(false);
    this.exitLexicalScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer)
    { this.raise(node.start, "Missing catch or finally clause"); }
  return this.finishNode(node, "TryStatement")
};

pp$1.parseVarStatement = function(node, kind) {
  this.next();
  this.parseVar(node, false, kind);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration")
};

pp$1.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "WhileStatement")
};

pp$1.parseWithStatement = function(node) {
  if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement(false);
  return this.finishNode(node, "WithStatement")
};

pp$1.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement")
};

pp$1.parseLabeledStatement = function(node, maybeName, expr) {
  var this$1 = this;

  for (var i$1 = 0, list = this$1.labels; i$1 < list.length; i$1 += 1)
    {
    var label = list[i$1];

    if (label.name === maybeName)
      { this$1.raise(expr.start, "Label '" + maybeName + "' is already declared");
  } }
  var kind = this.type.isLoop ? "loop" : this.type === types._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label$1 = this$1.labels[i];
    if (label$1.statementStart == node.start) {
      // Update information about previous labels on this node
      label$1.statementStart = this$1.start;
      label$1.kind = kind;
    } else { break }
  }
  this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
  node.body = this.parseStatement(true);
  if (node.body.type == "ClassDeclaration" ||
      node.body.type == "VariableDeclaration" && node.body.kind != "var" ||
      node.body.type == "FunctionDeclaration" && (this.strict || node.body.generator))
    { this.raiseRecoverable(node.body.start, "Invalid labeled declaration"); }
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement")
};

pp$1.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement")
};

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp$1.parseBlock = function(createNewLexicalScope) {
  var this$1 = this;
  if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;

  var node = this.startNode();
  node.body = [];
  this.expect(types.braceL);
  if (createNewLexicalScope) {
    this.enterLexicalScope();
  }
  while (!this.eat(types.braceR)) {
    var stmt = this$1.parseStatement(true);
    node.body.push(stmt);
  }
  if (createNewLexicalScope) {
    this.exitLexicalScope();
  }
  return this.finishNode(node, "BlockStatement")
};

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp$1.parseFor = function(node, init) {
  node.init = init;
  this.expect(types.semi);
  node.test = this.type === types.semi ? null : this.parseExpression();
  this.expect(types.semi);
  node.update = this.type === types.parenR ? null : this.parseExpression();
  this.expect(types.parenR);
  this.exitLexicalScope();
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "ForStatement")
};

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp$1.parseForIn = function(node, init) {
  var type = this.type === types._in ? "ForInStatement" : "ForOfStatement";
  this.next();
  if (type == "ForInStatement") {
    if (init.type === "AssignmentPattern" ||
      (init.type === "VariableDeclaration" && init.declarations[0].init != null &&
       (this.strict || init.declarations[0].id.type !== "Identifier")))
      { this.raise(init.start, "Invalid assignment in for-in loop head"); }
  }
  node.left = init;
  node.right = type == "ForInStatement" ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types.parenR);
  this.exitLexicalScope();
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, type)
};

// Parse a list of variable declarations.

pp$1.parseVar = function(node, isFor, kind) {
  var this$1 = this;

  node.declarations = [];
  node.kind = kind;
  for (;;) {
    var decl = this$1.startNode();
    this$1.parseVarId(decl, kind);
    if (this$1.eat(types.eq)) {
      decl.init = this$1.parseMaybeAssign(isFor);
    } else if (kind === "const" && !(this$1.type === types._in || (this$1.options.ecmaVersion >= 6 && this$1.isContextual("of")))) {
      this$1.unexpected();
    } else if (decl.id.type != "Identifier" && !(isFor && (this$1.type === types._in || this$1.isContextual("of")))) {
      this$1.raise(this$1.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this$1.finishNode(decl, "VariableDeclarator"));
    if (!this$1.eat(types.comma)) { break }
  }
  return node
};

pp$1.parseVarId = function(decl, kind) {
  decl.id = this.parseBindingAtom(kind);
  this.checkLVal(decl.id, kind, false);
};

// Parse a function declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseFunction = function(node, isStatement, allowExpressionBody, isAsync) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync)
    { node.generator = this.eat(types.star); }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  if (isStatement) {
    node.id = isStatement === "nullableID" && this.type != types.name ? null : this.parseIdent();
    if (node.id) {
      this.checkLVal(node.id, "var");
    }
  }

  var oldInGen = this.inGenerator, oldInAsync = this.inAsync,
      oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;
  this.inGenerator = node.generator;
  this.inAsync = node.async;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.inFunction = true;
  this.enterFunctionScope();

  if (!isStatement)
    { node.id = this.type == types.name ? this.parseIdent() : null; }

  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody);

  this.inGenerator = oldInGen;
  this.inAsync = oldInAsync;
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.inFunction = oldInFunc;
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression")
};

pp$1.parseFunctionParams = function(node) {
  this.expect(types.parenL);
  node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseClass = function(node, isStatement) {
  var this$1 = this;

  this.next();

  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types.braceL);
  while (!this.eat(types.braceR)) {
    var member = this$1.parseClassMember(classBody);
    if (member && member.type === "MethodDefinition" && member.kind === "constructor") {
      if (hadConstructor) { this$1.raise(member.start, "Duplicate constructor in the same class"); }
      hadConstructor = true;
    }
  }
  node.body = this.finishNode(classBody, "ClassBody");
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
};

pp$1.parseClassMember = function(classBody) {
  var this$1 = this;

  if (this.eat(types.semi)) { return null }

  var method = this.startNode();
  var tryContextual = function (k, noLineBreak) {
    if ( noLineBreak === void 0 ) noLineBreak = false;

    var start = this$1.start, startLoc = this$1.startLoc;
    if (!this$1.eatContextual(k)) { return false }
    if (this$1.type !== types.parenL && (!noLineBreak || !this$1.canInsertSemicolon())) { return true }
    if (method.key) { this$1.unexpected(); }
    method.computed = false;
    method.key = this$1.startNodeAt(start, startLoc);
    method.key.name = k;
    this$1.finishNode(method.key, "Identifier");
    return false
  };

  method.kind = "method";
  method.static = tryContextual("static");
  var isGenerator = this.eat(types.star);
  var isAsync = false;
  if (!isGenerator) {
    if (this.options.ecmaVersion >= 8 && tryContextual("async", true)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
    } else if (tryContextual("get")) {
      method.kind = "get";
    } else if (tryContextual("set")) {
      method.kind = "set";
    }
  }
  if (!method.key) { this.parsePropertyName(method); }
  var key = method.key;
  if (!method.computed && !method.static && (key.type === "Identifier" && key.name === "constructor" ||
      key.type === "Literal" && key.value === "constructor")) {
    if (method.kind !== "method") { this.raise(key.start, "Constructor can't have get/set modifier"); }
    if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
    if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
    method.kind = "constructor";
  } else if (method.static && key.type === "Identifier" && key.name === "prototype") {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }
  this.parseClassMethod(classBody, method, isGenerator, isAsync);
  if (method.kind === "get" && method.value.params.length !== 0)
    { this.raiseRecoverable(method.value.start, "getter should have no params"); }
  if (method.kind === "set" && method.value.params.length !== 1)
    { this.raiseRecoverable(method.value.start, "setter should have exactly one param"); }
  if (method.kind === "set" && method.value.params[0].type === "RestElement")
    { this.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params"); }
  return method
};

pp$1.parseClassMethod = function(classBody, method, isGenerator, isAsync) {
  method.value = this.parseMethod(isGenerator, isAsync);
  classBody.body.push(this.finishNode(method, "MethodDefinition"));
};

pp$1.parseClassId = function(node, isStatement) {
  node.id = this.type === types.name ? this.parseIdent() : isStatement === true ? this.unexpected() : null;
};

pp$1.parseClassSuper = function(node) {
  node.superClass = this.eat(types._extends) ? this.parseExprSubscripts() : null;
};

// Parses module export declaration.

pp$1.parseExport = function(node, exports) {
  var this$1 = this;

  this.next();
  // export * from '...'
  if (this.eat(types.star)) {
    this.expectContextual("from");
    if (this.type !== types.string) { this.unexpected(); }
    node.source = this.parseExprAtom();
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration")
  }
  if (this.eat(types._default)) { // export default ...
    this.checkExport(exports, "default", this.lastTokStart);
    var isAsync;
    if (this.type === types._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) { this.next(); }
      node.declaration = this.parseFunction(fNode, "nullableID", false, isAsync);
    } else if (this.type === types._class) {
      var cNode = this.startNode();
      node.declaration = this.parseClass(cNode, "nullableID");
    } else {
      node.declaration = this.parseMaybeAssign();
      this.semicolon();
    }
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(true);
    if (node.declaration.type === "VariableDeclaration")
      { this.checkVariableExport(exports, node.declaration.declarations); }
    else
      { this.checkExport(exports, node.declaration.id.name, node.declaration.id.start); }
    node.specifiers = [];
    node.source = null;
  } else { // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports);
    if (this.eatContextual("from")) {
      if (this.type !== types.string) { this.unexpected(); }
      node.source = this.parseExprAtom();
    } else {
      // check for keywords used as local names
      for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
        var spec = list[i];

        this$1.checkUnreserved(spec.local);
      }

      node.source = null;
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration")
};

pp$1.checkExport = function(exports, name, pos) {
  if (!exports) { return }
  if (has(exports, name))
    { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
  exports[name] = true;
};

pp$1.checkPatternExport = function(exports, pat) {
  var this$1 = this;

  var type = pat.type;
  if (type == "Identifier")
    { this.checkExport(exports, pat.name, pat.start); }
  else if (type == "ObjectPattern")
    { for (var i = 0, list = pat.properties; i < list.length; i += 1)
      {
        var prop = list[i];

        this$1.checkPatternExport(exports, prop);
      } }
  else if (type == "ArrayPattern")
    { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];

        if (elt) { this$1.checkPatternExport(exports, elt); }
    } }
  else if (type == "Property")
    { this.checkPatternExport(exports, pat.value); }
  else if (type == "AssignmentPattern")
    { this.checkPatternExport(exports, pat.left); }
  else if (type == "RestElement")
    { this.checkPatternExport(exports, pat.argument); }
  else if (type == "ParenthesizedExpression")
    { this.checkPatternExport(exports, pat.expression); }
};

pp$1.checkVariableExport = function(exports, decls) {
  var this$1 = this;

  if (!exports) { return }
  for (var i = 0, list = decls; i < list.length; i += 1)
    {
    var decl = list[i];

    this$1.checkPatternExport(exports, decl.id);
  }
};

pp$1.shouldParseExportStatement = function() {
  return this.type.keyword === "var" ||
    this.type.keyword === "const" ||
    this.type.keyword === "class" ||
    this.type.keyword === "function" ||
    this.isLet() ||
    this.isAsyncFunction()
};

// Parses a comma-separated list of module exports.

pp$1.parseExportSpecifiers = function(exports) {
  var this$1 = this;

  var nodes = [], first = true;
  // export { x, y as z } [from '...']
  this.expect(types.braceL);
  while (!this.eat(types.braceR)) {
    if (!first) {
      this$1.expect(types.comma);
      if (this$1.afterTrailingComma(types.braceR)) { break }
    } else { first = false; }

    var node = this$1.startNode();
    node.local = this$1.parseIdent(true);
    node.exported = this$1.eatContextual("as") ? this$1.parseIdent(true) : node.local;
    this$1.checkExport(exports, node.exported.name, node.exported.start);
    nodes.push(this$1.finishNode(node, "ExportSpecifier"));
  }
  return nodes
};

// Parses import declaration.

pp$1.parseImport = function(node) {
  this.next();
  // import '...'
  if (this.type === types.string) {
    node.specifiers = empty;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types.string ? this.parseExprAtom() : this.unexpected();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration")
};

// Parses a comma-separated list of module imports.

pp$1.parseImportSpecifiers = function() {
  var this$1 = this;

  var nodes = [], first = true;
  if (this.type === types.name) {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLVal(node.local, "let");
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
    if (!this.eat(types.comma)) { return nodes }
  }
  if (this.type === types.star) {
    var node$1 = this.startNode();
    this.next();
    this.expectContextual("as");
    node$1.local = this.parseIdent();
    this.checkLVal(node$1.local, "let");
    nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"));
    return nodes
  }
  this.expect(types.braceL);
  while (!this.eat(types.braceR)) {
    if (!first) {
      this$1.expect(types.comma);
      if (this$1.afterTrailingComma(types.braceR)) { break }
    } else { first = false; }

    var node$2 = this$1.startNode();
    node$2.imported = this$1.parseIdent(true);
    if (this$1.eatContextual("as")) {
      node$2.local = this$1.parseIdent();
    } else {
      this$1.checkUnreserved(node$2.imported);
      node$2.local = node$2.imported;
    }
    this$1.checkLVal(node$2.local, "let");
    nodes.push(this$1.finishNode(node$2, "ImportSpecifier"));
  }
  return nodes
};

// Set `ExpressionStatement#directive` property for directive prologues.
pp$1.adaptDirectivePrologue = function(statements) {
  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};
pp$1.isDirectiveCandidate = function(statement) {
  return (
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "Literal" &&
    typeof statement.expression.value === "string" &&
    // Reject parenthesized strings.
    (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
  )
};

var pp$2 = Parser.prototype;

// Convert existing expression atom to assignable pattern
// if possible.

pp$2.toAssignable = function(node, isBinding, refDestructuringErrors) {
  var this$1 = this;

  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
    case "Identifier":
      if (this.inAsync && node.name === "await")
        { this.raise(node.start, "Can not use 'await' as identifier inside an async function"); }
      break

    case "ObjectPattern":
    case "ArrayPattern":
    case "RestElement":
      break

    case "ObjectExpression":
      node.type = "ObjectPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      for (var i = 0, list = node.properties; i < list.length; i += 1) {
        var prop = list[i];

      this$1.toAssignable(prop, isBinding);
        // Early error:
        //   AssignmentRestProperty[Yield, Await] :
        //     `...` DestructuringAssignmentTarget[Yield, Await]
        //
        //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
        if (
          prop.type === "RestElement" &&
          (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
        ) {
          this$1.raise(prop.argument.start, "Unexpected token");
        }
      }
      break

    case "Property":
      // AssignmentProperty has type == "Property"
      if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
      this.toAssignable(node.value, isBinding);
      break

    case "ArrayExpression":
      node.type = "ArrayPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      this.toAssignableList(node.elements, isBinding);
      break

    case "SpreadElement":
      node.type = "RestElement";
      this.toAssignable(node.argument, isBinding);
      if (node.argument.type === "AssignmentPattern")
        { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
      break

    case "AssignmentExpression":
      if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
      node.type = "AssignmentPattern";
      delete node.operator;
      this.toAssignable(node.left, isBinding);
      // falls through to AssignmentPattern

    case "AssignmentPattern":
      break

    case "ParenthesizedExpression":
      this.toAssignable(node.expression, isBinding);
      break

    case "MemberExpression":
      if (!isBinding) { break }

    default:
      this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
  return node
};

// Convert list of expression atoms to binding list.

pp$2.toAssignableList = function(exprList, isBinding) {
  var this$1 = this;

  var end = exprList.length;
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) { this$1.toAssignable(elt, isBinding); }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
      { this.unexpected(last.argument.start); }
  }
  return exprList
};

// Parses spread element.

pp$2.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement")
};

pp$2.parseRestBinding = function() {
  var node = this.startNode();
  this.next();

  // RestElement inside of a function parameter must be an identifier
  if (this.options.ecmaVersion === 6 && this.type !== types.name)
    { this.unexpected(); }

  node.argument = this.parseBindingAtom();

  return this.finishNode(node, "RestElement")
};

// Parses lvalue (assignable) atom.

pp$2.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
    case types.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(types.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern")

    case types.braceL:
      return this.parseObj(true)
    }
  }
  return this.parseIdent()
};

pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma) {
  var this$1 = this;

  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) { first = false; }
    else { this$1.expect(types.comma); }
    if (allowEmpty && this$1.type === types.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this$1.afterTrailingComma(close)) {
      break
    } else if (this$1.type === types.ellipsis) {
      var rest = this$1.parseRestBinding();
      this$1.parseBindingListItem(rest);
      elts.push(rest);
      if (this$1.type === types.comma) { this$1.raise(this$1.start, "Comma is not permitted after the rest element"); }
      this$1.expect(close);
      break
    } else {
      var elem = this$1.parseMaybeDefault(this$1.start, this$1.startLoc);
      this$1.parseBindingListItem(elem);
      elts.push(elem);
    }
  }
  return elts
};

pp$2.parseBindingListItem = function(param) {
  return param
};

// Parses assignment pattern around given atom if possible.

pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types.eq)) { return left }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern")
};

// Verify that a node is an lval — something that can be assigned
// to.
// bindingType can be either:
// 'var' indicating that the lval creates a 'var' binding
// 'let' indicating that the lval creates a lexical ('let' or 'const') binding
// 'none' indicating that the binding should be checked for illegal identifiers, but not for duplicate references

pp$2.checkLVal = function(expr, bindingType, checkClashes) {
  var this$1 = this;

  switch (expr.type) {
  case "Identifier":
    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
      { this.raiseRecoverable(expr.start, (bindingType ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
    if (checkClashes) {
      if (has(checkClashes, expr.name))
        { this.raiseRecoverable(expr.start, "Argument name clash"); }
      checkClashes[expr.name] = true;
    }
    if (bindingType && bindingType !== "none") {
      if (
        bindingType === "var" && !this.canDeclareVarName(expr.name) ||
        bindingType !== "var" && !this.canDeclareLexicalName(expr.name)
      ) {
        this.raiseRecoverable(expr.start, ("Identifier '" + (expr.name) + "' has already been declared"));
      }
      if (bindingType === "var") {
        this.declareVarName(expr.name);
      } else {
        this.declareLexicalName(expr.name);
      }
    }
    break

  case "MemberExpression":
    if (bindingType) { this.raiseRecoverable(expr.start, "Binding member expression"); }
    break

  case "ObjectPattern":
    for (var i = 0, list = expr.properties; i < list.length; i += 1)
      {
    var prop = list[i];

    this$1.checkLVal(prop, bindingType, checkClashes);
  }
    break

  case "Property":
    // AssignmentProperty has type == "Property"
    this.checkLVal(expr.value, bindingType, checkClashes);
    break

  case "ArrayPattern":
    for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
      var elem = list$1[i$1];

    if (elem) { this$1.checkLVal(elem, bindingType, checkClashes); }
    }
    break

  case "AssignmentPattern":
    this.checkLVal(expr.left, bindingType, checkClashes);
    break

  case "RestElement":
    this.checkLVal(expr.argument, bindingType, checkClashes);
    break

  case "ParenthesizedExpression":
    this.checkLVal(expr.expression, bindingType, checkClashes);
    break

  default:
    this.raise(expr.start, (bindingType ? "Binding" : "Assigning to") + " rvalue");
  }
};

// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

var pp$3 = Parser.prototype;

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp$3.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
    { return }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
    { return }
  var key = prop.key;
  var name;
  switch (key.type) {
  case "Identifier": name = key.name; break
  case "Literal": name = String(key.value); break
  default: return
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors && refDestructuringErrors.doubleProto < 0) { refDestructuringErrors.doubleProto = key.start; }
        // Backwards-compat kludge. Can be removed in version 6.0
        else { this.raiseRecoverable(key.start, "Redefinition of __proto__ property"); }
      }
      propHash.proto = true;
    }
    return
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition)
      { this.raiseRecoverable(key.start, "Redefinition of property"); }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp$3.parseExpression = function(noIn, refDestructuringErrors) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
  if (this.type === types.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(types.comma)) { node.expressions.push(this$1.parseMaybeAssign(noIn, refDestructuringErrors)); }
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
};

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
  if (this.inGenerator && this.isContextual("yield")) { return this.parseYield() }

  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors;
    ownDestructuringErrors = true;
  }

  var startPos = this.start, startLoc = this.startLoc;
  if (this.type == types.parenL || this.type == types.name)
    { this.potentialArrowAt = this.start; }
  var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
  if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    node.left = this.type === types.eq ? this.toAssignable(left, false, refDestructuringErrors) : left;
    if (!ownDestructuringErrors) { DestructuringErrors.call(refDestructuringErrors); }
    refDestructuringErrors.shorthandAssign = -1; // reset because shorthand default was used correctly
    this.checkLVal(left);
    this.next();
    node.right = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "AssignmentExpression")
  } else {
    if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
  }
  if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
  if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
  return left
};

// Parse a ternary conditional (`?:`) operator.

pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(noIn, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  if (this.eat(types.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types.colon);
    node.alternate = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
};

// Start the precedence parser.

pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  return expr.start == startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, noIn)
};

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
  var prec = this.type.binop;
  if (prec != null && (!noIn || this.type !== types._in)) {
    if (prec > minPrec) {
      var logical = this.type === types.logicalOR || this.type === types.logicalAND;
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
    }
  }
  return left
};

pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
};

// Parse unary operators, both prefix and postfix.

pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.inAsync && this.isContextual("await")) {
    expr = this.parseAwait();
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) { this.checkLVal(node.argument); }
    else if (this.strict && node.operator === "delete" &&
             node.argument.type === "Identifier")
      { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
    else { sawUnary = true; }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this$1.startNodeAt(startPos, startLoc);
      node$1.operator = this$1.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this$1.checkLVal(expr);
      this$1.next();
      expr = this$1.finishNode(node$1, "UpdateExpression");
    }
  }

  if (!sawUnary && this.eat(types.starstar))
    { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false) }
  else
    { return expr }
};

// Parse call, dot, and `[]`-subscript expressions.

pp$3.parseExprSubscripts = function(refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors);
  var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
  if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) { return expr }
  var result = this.parseSubscripts(expr, startPos, startLoc);
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
    if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
  }
  return result
};

pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
  var this$1 = this;

  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
      this.lastTokEnd == base.end && !this.canInsertSemicolon() && this.input.slice(base.start, base.end) === "async";
  for (var computed = (void 0);;) {
    if ((computed = this$1.eat(types.bracketL)) || this$1.eat(types.dot)) {
      var node = this$1.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = computed ? this$1.parseExpression() : this$1.parseIdent(true);
      node.computed = !!computed;
      if (computed) { this$1.expect(types.bracketR); }
      base = this$1.finishNode(node, "MemberExpression");
    } else if (!noCalls && this$1.eat(types.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this$1.yieldPos, oldAwaitPos = this$1.awaitPos;
      this$1.yieldPos = 0;
      this$1.awaitPos = 0;
      var exprList = this$1.parseExprList(types.parenR, this$1.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !this$1.canInsertSemicolon() && this$1.eat(types.arrow)) {
        this$1.checkPatternErrors(refDestructuringErrors, false);
        this$1.checkYieldAwaitInDefaultParams();
        this$1.yieldPos = oldYieldPos;
        this$1.awaitPos = oldAwaitPos;
        return this$1.parseArrowExpression(this$1.startNodeAt(startPos, startLoc), exprList, true)
      }
      this$1.checkExpressionErrors(refDestructuringErrors, true);
      this$1.yieldPos = oldYieldPos || this$1.yieldPos;
      this$1.awaitPos = oldAwaitPos || this$1.awaitPos;
      var node$1 = this$1.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      base = this$1.finishNode(node$1, "CallExpression");
    } else if (this$1.type === types.backQuote) {
      var node$2 = this$1.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this$1.parseTemplate({isTagged: true});
      base = this$1.finishNode(node$2, "TaggedTemplateExpression");
    } else {
      return base
    }
  }
};

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp$3.parseExprAtom = function(refDestructuringErrors) {
  var node, canBeArrow = this.potentialArrowAt == this.start;
  switch (this.type) {
  case types._super:
    if (!this.inFunction)
      { this.raise(this.start, "'super' outside of function or class"); }
    node = this.startNode();
    this.next();
    // The `super` keyword can appear at below:
    // SuperProperty:
    //     super [ Expression ]
    //     super . IdentifierName
    // SuperCall:
    //     super Arguments
    if (this.type !== types.dot && this.type !== types.bracketL && this.type !== types.parenL)
      { this.unexpected(); }
    return this.finishNode(node, "Super")

  case types._this:
    node = this.startNode();
    this.next();
    return this.finishNode(node, "ThisExpression")

  case types.name:
    var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
    var id = this.parseIdent(this.type !== types.name);
    if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types._function))
      { return this.parseFunction(this.startNodeAt(startPos, startLoc), false, false, true) }
    if (canBeArrow && !this.canInsertSemicolon()) {
      if (this.eat(types.arrow))
        { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false) }
      if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types.name && !containsEsc) {
        id = this.parseIdent();
        if (this.canInsertSemicolon() || !this.eat(types.arrow))
          { this.unexpected(); }
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true)
      }
    }
    return id

  case types.regexp:
    var value = this.value;
    node = this.parseLiteral(value.value);
    node.regex = {pattern: value.pattern, flags: value.flags};
    return node

  case types.num: case types.string:
    return this.parseLiteral(this.value)

  case types._null: case types._true: case types._false:
    node = this.startNode();
    node.value = this.type === types._null ? null : this.type === types._true;
    node.raw = this.type.keyword;
    this.next();
    return this.finishNode(node, "Literal")

  case types.parenL:
    var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow);
    if (refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
        { refDestructuringErrors.parenthesizedAssign = start; }
      if (refDestructuringErrors.parenthesizedBind < 0)
        { refDestructuringErrors.parenthesizedBind = start; }
    }
    return expr

  case types.bracketL:
    node = this.startNode();
    this.next();
    node.elements = this.parseExprList(types.bracketR, true, true, refDestructuringErrors);
    return this.finishNode(node, "ArrayExpression")

  case types.braceL:
    return this.parseObj(false, refDestructuringErrors)

  case types._function:
    node = this.startNode();
    this.next();
    return this.parseFunction(node, false)

  case types._class:
    return this.parseClass(this.startNode(), false)

  case types._new:
    return this.parseNew()

  case types.backQuote:
    return this.parseTemplate()

  default:
    this.unexpected();
  }
};

pp$3.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  this.next();
  return this.finishNode(node, "Literal")
};

pp$3.parseParenExpression = function() {
  this.expect(types.parenL);
  var val = this.parseExpression();
  this.expect(types.parenR);
  return val
};

pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();

    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    while (this.type !== types.parenR) {
      first ? first = false : this$1.expect(types.comma);
      if (allowTrailingComma && this$1.afterTrailingComma(types.parenR, true)) {
        lastIsComma = true;
        break
      } else if (this$1.type === types.ellipsis) {
        spreadStart = this$1.start;
        exprList.push(this$1.parseParenItem(this$1.parseRestBinding()));
        if (this$1.type === types.comma) { this$1.raise(this$1.start, "Comma is not permitted after the rest element"); }
        break
      } else {
        exprList.push(this$1.parseMaybeAssign(false, refDestructuringErrors, this$1.parseParenItem));
      }
    }
    var innerEndPos = this.start, innerEndLoc = this.startLoc;
    this.expect(types.parenR);

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(types.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList)
    }

    if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
    if (spreadStart) { this.unexpected(spreadStart); }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression")
  } else {
    return val
  }
};

pp$3.parseParenItem = function(item) {
  return item
};

pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList)
};

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty$1 = [];

pp$3.parseNew = function() {
  var node = this.startNode();
  var meta = this.parseIdent(true);
  if (this.options.ecmaVersion >= 6 && this.eat(types.dot)) {
    node.meta = meta;
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target" || containsEsc)
      { this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target"); }
    if (!this.inFunction)
      { this.raiseRecoverable(node.start, "new.target can only be used in functions"); }
    return this.finishNode(node, "MetaProperty")
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
  if (this.eat(types.parenL)) { node.arguments = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false); }
  else { node.arguments = empty$1; }
  return this.finishNode(node, "NewExpression")
};

// Parse template expression.

pp$3.parseTemplateElement = function(ref) {
  var isTagged = ref.isTagged;

  var elem = this.startNode();
  if (this.type === types.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value,
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types.backQuote;
  return this.finishNode(elem, "TemplateElement")
};

pp$3.parseTemplate = function(ref) {
  var this$1 = this;
  if ( ref === void 0 ) ref = {};
  var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({isTagged: isTagged});
  node.quasis = [curElt];
  while (!curElt.tail) {
    this$1.expect(types.dollarBraceL);
    node.expressions.push(this$1.parseExpression());
    this$1.expect(types.braceR);
    node.quasis.push(curElt = this$1.parseTemplateElement({isTagged: isTagged}));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral")
};

pp$3.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
    (this.type === types.name || this.type === types.num || this.type === types.string || this.type === types.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types.star)) &&
    !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

// Parse an object literal or binding pattern.

pp$3.parseObj = function(isPattern, refDestructuringErrors) {
  var this$1 = this;

  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types.braceR)) {
    if (!first) {
      this$1.expect(types.comma);
      if (this$1.afterTrailingComma(types.braceR)) { break }
    } else { first = false; }

    var prop = this$1.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) { this$1.checkPropClash(prop, propHash, refDestructuringErrors); }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
};

pp$3.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types.comma) {
        this.raise(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement")
    }
    // To disallow parenthesized identifier via `this.toAssignable()`.
    if (this.type === types.parenL && refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0) {
        refDestructuringErrors.parenthesizedAssign = this.start;
      }
      if (refDestructuringErrors.parenthesizedBind < 0) {
        refDestructuringErrors.parenthesizedBind = this.start;
      }
    }
    // Parse argument.
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    // To disallow trailing comma via `this.toAssignable()`.
    if (this.type === types.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    // Finish
    return this.finishNode(prop, "SpreadElement")
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern)
      { isGenerator = this.eat(types.star); }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
    this.parsePropertyName(prop, refDestructuringErrors);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property")
};

pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types.colon)
    { this.unexpected(); }

  if (this.eat(types.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types.parenL) {
    if (isPattern) { this.unexpected(); }
    prop.kind = "init";
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
  } else if (!isPattern && !containsEsc &&
             this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
             (prop.key.name === "get" || prop.key.name === "set") &&
             (this.type != types.comma && this.type != types.braceR)) {
    if (isGenerator || isAsync) { this.unexpected(); }
    prop.kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get")
        { this.raiseRecoverable(start, "getter should have no params"); }
      else
        { this.raiseRecoverable(start, "setter should have exactly one param"); }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
        { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
    }
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    this.checkUnreserved(prop.key);
    prop.kind = "init";
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else if (this.type === types.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0)
        { refDestructuringErrors.shorthandAssign = this.start; }
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else {
      prop.value = prop.key;
    }
    prop.shorthand = true;
  } else { this.unexpected(); }
};

pp$3.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types.bracketR);
      return prop.key
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types.num || this.type === types.string ? this.parseExprAtom() : this.parseIdent(true)
};

// Initialize empty function node.

pp$3.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = false;
    node.expression = false;
  }
  if (this.options.ecmaVersion >= 8)
    { node.async = false; }
};

// Parse object or class method.

pp$3.parseMethod = function(isGenerator, isAsync) {
  var node = this.startNode(), oldInGen = this.inGenerator, oldInAsync = this.inAsync,
      oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;

  this.initFunction(node);
  if (this.options.ecmaVersion >= 6)
    { node.generator = isGenerator; }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  this.inGenerator = node.generator;
  this.inAsync = node.async;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.inFunction = true;
  this.enterFunctionScope();

  this.expect(types.parenL);
  node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false);

  this.inGenerator = oldInGen;
  this.inAsync = oldInAsync;
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.inFunction = oldInFunc;
  return this.finishNode(node, "FunctionExpression")
};

// Parse arrow function expression with given parameters.

pp$3.parseArrowExpression = function(node, params, isAsync) {
  var oldInGen = this.inGenerator, oldInAsync = this.inAsync,
      oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;

  this.enterFunctionScope();
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  this.inGenerator = false;
  this.inAsync = node.async;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.inFunction = true;

  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true);

  this.inGenerator = oldInGen;
  this.inAsync = oldInAsync;
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.inFunction = oldInFunc;
  return this.finishNode(node, "ArrowFunctionExpression")
};

// Parse function body and check parameters.

pp$3.parseFunctionBody = function(node, isArrowFunction) {
  var isExpression = isArrowFunction && this.type !== types.braceL;
  var oldStrict = this.strict, useStrict = false;

  if (isExpression) {
    node.body = this.parseMaybeAssign();
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      // If this is a strict mode function, verify that argument names
      // are not repeated, and it does not try to bind the words `eval`
      // or `arguments`.
      if (useStrict && nonSimple)
        { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
    }
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) { this.strict = true; }

    // Add the params to varDeclaredNames to ensure that an error is thrown
    // if a let/const declaration in the function clashes with one of the params.
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && this.isSimpleParamList(node.params));
    node.body = this.parseBlock(false);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitFunctionScope();

  if (this.strict && node.id) {
    // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
    this.checkLVal(node.id, "none");
  }
  this.strict = oldStrict;
};

pp$3.isSimpleParamList = function(params) {
  for (var i = 0, list = params; i < list.length; i += 1)
    {
    var param = list[i];

    if (param.type !== "Identifier") { return false
  } }
  return true
};

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp$3.checkParams = function(node, allowDuplicates) {
  var this$1 = this;

  var nameHash = {};
  for (var i = 0, list = node.params; i < list.length; i += 1)
    {
    var param = list[i];

    this$1.checkLVal(param, "var", allowDuplicates ? null : nameHash);
  }
};

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var this$1 = this;

  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this$1.expect(types.comma);
      if (allowTrailingComma && this$1.afterTrailingComma(close)) { break }
    } else { first = false; }

    var elt = (void 0);
    if (allowEmpty && this$1.type === types.comma)
      { elt = null; }
    else if (this$1.type === types.ellipsis) {
      elt = this$1.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this$1.type === types.comma && refDestructuringErrors.trailingComma < 0)
        { refDestructuringErrors.trailingComma = this$1.start; }
    } else {
      elt = this$1.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts
};

pp$3.checkUnreserved = function(ref) {
  var start = ref.start;
  var end = ref.end;
  var name = ref.name;

  if (this.inGenerator && name === "yield")
    { this.raiseRecoverable(start, "Can not use 'yield' as identifier inside a generator"); }
  if (this.inAsync && name === "await")
    { this.raiseRecoverable(start, "Can not use 'await' as identifier inside an async function"); }
  if (this.isKeyword(name))
    { this.raise(start, ("Unexpected keyword '" + name + "'")); }
  if (this.options.ecmaVersion < 6 &&
    this.input.slice(start, end).indexOf("\\") != -1) { return }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Can not use keyword 'await' outside an async function"); }
    this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
  }
};

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp$3.parseIdent = function(liberal, isBinding) {
  var node = this.startNode();
  if (liberal && this.options.allowReserved == "never") { liberal = false; }
  if (this.type === types.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;

    // To fix https://github.com/acornjs/acorn/issues/575
    // `class` and `function` keywords push new context into this.context.
    // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
    // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
    if ((node.name === "class" || node.name === "function") &&
        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "Identifier");
  if (!liberal) { this.checkUnreserved(node); }
  return node
};

// Parses yield expression inside generator.

pp$3.parseYield = function() {
  if (!this.yieldPos) { this.yieldPos = this.start; }

  var node = this.startNode();
  this.next();
  if (this.type == types.semi || this.canInsertSemicolon() || (this.type != types.star && !this.type.startsExpr)) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types.star);
    node.argument = this.parseMaybeAssign();
  }
  return this.finishNode(node, "YieldExpression")
};

pp$3.parseAwait = function() {
  if (!this.awaitPos) { this.awaitPos = this.start; }

  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true);
  return this.finishNode(node, "AwaitExpression")
};

var pp$4 = Parser.prototype;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
  throw err
};

pp$4.raiseRecoverable = pp$4.raise;

pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
};

var pp$5 = Parser.prototype;

// Object.assign polyfill
var assign = Object.assign || function(target) {
  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  for (var i = 0, list = sources; i < list.length; i += 1) {
    var source = list[i];

    for (var key in source) {
      if (has(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target
};

// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

pp$5.enterFunctionScope = function() {
  // var: a hash of var-declared names in the current lexical scope
  // lexical: a hash of lexically-declared names in the current lexical scope
  // childVar: a hash of var-declared names in all child lexical scopes of the current lexical scope (within the current function scope)
  // parentLexical: a hash of lexically-declared names in all parent lexical scopes of the current lexical scope (within the current function scope)
  this.scopeStack.push({var: {}, lexical: {}, childVar: {}, parentLexical: {}});
};

pp$5.exitFunctionScope = function() {
  this.scopeStack.pop();
};

pp$5.enterLexicalScope = function() {
  var parentScope = this.scopeStack[this.scopeStack.length - 1];
  var childScope = {var: {}, lexical: {}, childVar: {}, parentLexical: {}};

  this.scopeStack.push(childScope);
  assign(childScope.parentLexical, parentScope.lexical, parentScope.parentLexical);
};

pp$5.exitLexicalScope = function() {
  var childScope = this.scopeStack.pop();
  var parentScope = this.scopeStack[this.scopeStack.length - 1];

  assign(parentScope.childVar, childScope.var, childScope.childVar);
};

/**
 * A name can be declared with `var` if there are no variables with the same name declared with `let`/`const`
 * in the current lexical scope or any of the parent lexical scopes in this function.
 */
pp$5.canDeclareVarName = function(name) {
  var currentScope = this.scopeStack[this.scopeStack.length - 1];

  return !has(currentScope.lexical, name) && !has(currentScope.parentLexical, name)
};

/**
 * A name can be declared with `let`/`const` if there are no variables with the same name declared with `let`/`const`
 * in the current scope, and there are no variables with the same name declared with `var` in the current scope or in
 * any child lexical scopes in this function.
 */
pp$5.canDeclareLexicalName = function(name) {
  var currentScope = this.scopeStack[this.scopeStack.length - 1];

  return !has(currentScope.lexical, name) && !has(currentScope.var, name) && !has(currentScope.childVar, name)
};

pp$5.declareVarName = function(name) {
  this.scopeStack[this.scopeStack.length - 1].var[name] = true;
};

pp$5.declareLexicalName = function(name) {
  this.scopeStack[this.scopeStack.length - 1].lexical[name] = true;
};

var Node = function Node(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations)
    { this.loc = new SourceLocation(parser, loc); }
  if (parser.options.directSourceFile)
    { this.sourceFile = parser.options.directSourceFile; }
  if (parser.options.ranges)
    { this.range = [pos, 0]; }
};

// Start an AST node, attaching a start offset.

var pp$6 = Parser.prototype;

pp$6.startNode = function() {
  return new Node(this, this.start, this.startLoc)
};

pp$6.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
};

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations)
    { node.loc.end = loc; }
  if (this.options.ranges)
    { node.range[1] = pos; }
  return node
}

pp$6.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
};

// Finish node at given position

pp$6.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
};

// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design

var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
};

var types$1 = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};

var pp$7 = Parser.prototype;

pp$7.initialContext = function() {
  return [types$1.b_stat]
};

pp$7.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types$1.f_expr || parent === types$1.f_stat)
    { return true }
  if (prevType === types.colon && (parent === types$1.b_stat || parent === types$1.b_expr))
    { return !parent.isExpr }

  // The check for `tt.name && exprAllowed` detects whether we are
  // after a `yield` or `of` construct. See the `updateContext` for
  // `tt.name`.
  if (prevType === types._return || prevType == types.name && this.exprAllowed)
    { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
  if (prevType === types._else || prevType === types.semi || prevType === types.eof || prevType === types.parenR || prevType == types.arrow)
    { return true }
  if (prevType == types.braceL)
    { return parent === types$1.b_stat }
  if (prevType == types._var || prevType == types.name)
    { return false }
  return !this.exprAllowed
};

pp$7.inGeneratorContext = function() {
  var this$1 = this;

  for (var i = this.context.length - 1; i >= 1; i--) {
    var context = this$1.context[i];
    if (context.token === "function")
      { return context.generator }
  }
  return false
};

pp$7.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType == types.dot)
    { this.exprAllowed = false; }
  else if (update = type.updateContext)
    { update.call(this, prevType); }
  else
    { this.exprAllowed = type.beforeExpr; }
};

// Token-specific context update code

types.parenR.updateContext = types.braceR.updateContext = function() {
  if (this.context.length == 1) {
    this.exprAllowed = true;
    return
  }
  var out = this.context.pop();
  if (out === types$1.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};

types.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types$1.b_stat : types$1.b_expr);
  this.exprAllowed = true;
};

types.dollarBraceL.updateContext = function() {
  this.context.push(types$1.b_tmpl);
  this.exprAllowed = true;
};

types.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types._if || prevType === types._for || prevType === types._with || prevType === types._while;
  this.context.push(statementParens ? types$1.p_stat : types$1.p_expr);
  this.exprAllowed = true;
};

types.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
};

types._function.updateContext = types._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types.semi && prevType !== types._else &&
      !((prevType === types.colon || prevType === types.braceL) && this.curContext() === types$1.b_stat))
    { this.context.push(types$1.f_expr); }
  else
    { this.context.push(types$1.f_stat); }
  this.exprAllowed = false;
};

types.backQuote.updateContext = function() {
  if (this.curContext() === types$1.q_tmpl)
    { this.context.pop(); }
  else
    { this.context.push(types$1.q_tmpl); }
  this.exprAllowed = false;
};

types.star.updateContext = function(prevType) {
  if (prevType == types._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types$1.f_expr)
      { this.context[index] = types$1.f_expr_gen; }
    else
      { this.context[index] = types$1.f_gen; }
  }
  this.exprAllowed = true;
};

types.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6) {
    if (this.value == "of" && !this.exprAllowed ||
        this.value == "yield" && this.inGeneratorContext())
      { allowed = true; }
  }
  this.exprAllowed = allowed;
};

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations)
    { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
  if (p.options.ranges)
    { this.range = [p.start, p.end]; }
};

// ## Tokenizer

var pp$8 = Parser.prototype;

// Are we running under Rhino?
var isRhino = typeof Packages == "object" && Object.prototype.toString.call(Packages) == "[object JavaPackage]";

// Move to the next token

pp$8.next = function() {
  if (this.options.onToken)
    { this.options.onToken(new Token(this)); }

  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

pp$8.getToken = function() {
  this.next();
  return new Token(this)
};

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined")
  { pp$8[Symbol.iterator] = function() {
    var this$1 = this;

    return {
      next: function () {
        var token = this$1.getToken();
        return {
          done: token.type === types.eof,
          value: token
        }
      }
    }
  }; }

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

pp$8.curContext = function() {
  return this.context[this.context.length - 1]
};

// Read a single token, updating the parser object's token-related
// properties.

pp$8.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

  this.start = this.pos;
  if (this.options.locations) { this.startLoc = this.curPosition(); }
  if (this.pos >= this.input.length) { return this.finishToken(types.eof) }

  if (curContext.override) { return curContext.override(this) }
  else { this.readToken(this.fullCharCodeAtPos()); }
};

pp$8.readToken = function(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
    { return this.readWord() }

  return this.getTokenFromCode(code)
};

pp$8.fullCharCodeAtPos = function() {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 0xd7ff || code >= 0xe000) { return code }
  var next = this.input.charCodeAt(this.pos + 1);
  return (code << 10) + next - 0x35fdc00
};

pp$8.skipBlockComment = function() {
  var this$1 = this;

  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
  this.pos = end + 2;
  if (this.options.locations) {
    lineBreakG.lastIndex = start;
    var match;
    while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
      ++this$1.curLine;
      this$1.lineStart = match.index + match[0].length;
    }
  }
  if (this.options.onComment)
    { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                           startLoc, this.curPosition()); }
};

pp$8.skipLineComment = function(startSkip) {
  var this$1 = this;

  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this$1.input.charCodeAt(++this$1.pos);
  }
  if (this.options.onComment)
    { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                           startLoc, this.curPosition()); }
};

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp$8.skipSpace = function() {
  var this$1 = this;

  loop: while (this.pos < this.input.length) {
    var ch = this$1.input.charCodeAt(this$1.pos);
    switch (ch) {
    case 32: case 160: // ' '
      ++this$1.pos;
      break
    case 13:
      if (this$1.input.charCodeAt(this$1.pos + 1) === 10) {
        ++this$1.pos;
      }
    case 10: case 8232: case 8233:
      ++this$1.pos;
      if (this$1.options.locations) {
        ++this$1.curLine;
        this$1.lineStart = this$1.pos;
      }
      break
    case 47: // '/'
      switch (this$1.input.charCodeAt(this$1.pos + 1)) {
      case 42: // '*'
        this$1.skipBlockComment();
        break
      case 47:
        this$1.skipLineComment(2);
        break
      default:
        break loop
      }
      break
    default:
      if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++this$1.pos;
      } else {
        break loop
      }
    }
  }
};

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp$8.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) { this.endLoc = this.curPosition(); }
  var prevType = this.type;
  this.type = type;
  this.value = val;

  this.updateContext(prevType);
};

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp$8.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) { return this.readNumber(true) }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(types.ellipsis)
  } else {
    ++this.pos;
    return this.finishToken(types.dot)
  }
};

pp$8.readToken_slash = function() { // '/'
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(types.slash, 1)
};

pp$8.readToken_mult_modulo_exp = function(code) { // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types.star : types.modulo;

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && code == 42 && next === 42) {
    ++size;
    tokentype = types.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }

  if (next === 61) { return this.finishOp(types.assign, size + 1) }
  return this.finishOp(tokentype, size)
};

pp$8.readToken_pipe_amp = function(code) { // '|&'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) { return this.finishOp(code === 124 ? types.logicalOR : types.logicalAND, 2) }
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(code === 124 ? types.bitwiseOR : types.bitwiseAND, 1)
};

pp$8.readToken_caret = function() { // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(types.bitwiseXOR, 1)
};

pp$8.readToken_plus_min = function(code) { // '+-'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next == 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) == 62 &&
        (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken()
    }
    return this.finishOp(types.incDec, 2)
  }
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(types.plusMin, 1)
};

pp$8.readToken_lt_gt = function(code) { // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types.assign, size + 1) }
    return this.finishOp(types.bitShift, size)
  }
  if (next == 33 && code == 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) == 45 &&
      this.input.charCodeAt(this.pos + 3) == 45) {
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken()
  }
  if (next === 61) { size = 2; }
  return this.finishOp(types.relational, size)
};

pp$8.readToken_eq_excl = function(code) { // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
    this.pos += 2;
    return this.finishToken(types.arrow)
  }
  return this.finishOp(code === 61 ? types.eq : types.prefix, 1)
};

pp$8.getTokenFromCode = function(code) {
  switch (code) {
  // The interpretation of a dot depends on whether it is followed
  // by a digit or another two dots.
  case 46: // '.'
    return this.readToken_dot()

  // Punctuation tokens.
  case 40: ++this.pos; return this.finishToken(types.parenL)
  case 41: ++this.pos; return this.finishToken(types.parenR)
  case 59: ++this.pos; return this.finishToken(types.semi)
  case 44: ++this.pos; return this.finishToken(types.comma)
  case 91: ++this.pos; return this.finishToken(types.bracketL)
  case 93: ++this.pos; return this.finishToken(types.bracketR)
  case 123: ++this.pos; return this.finishToken(types.braceL)
  case 125: ++this.pos; return this.finishToken(types.braceR)
  case 58: ++this.pos; return this.finishToken(types.colon)
  case 63: ++this.pos; return this.finishToken(types.question)

  case 96: // '`'
    if (this.options.ecmaVersion < 6) { break }
    ++this.pos;
    return this.finishToken(types.backQuote)

  case 48: // '0'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
    if (this.options.ecmaVersion >= 6) {
      if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
      if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
    }

  // Anything else beginning with a digit is an integer, octal
  // number, or float.
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return this.readNumber(false)

  // Quotes produce strings.
  case 34: case 39: // '"', "'"
    return this.readString(code)

  // Operators are parsed inline in tiny state machines. '=' (61) is
  // often referred to. `finishOp` simply skips the amount of
  // characters it is given as second argument, and returns a token
  // of the type given by its first argument.

  case 47: // '/'
    return this.readToken_slash()

  case 37: case 42: // '%*'
    return this.readToken_mult_modulo_exp(code)

  case 124: case 38: // '|&'
    return this.readToken_pipe_amp(code)

  case 94: // '^'
    return this.readToken_caret()

  case 43: case 45: // '+-'
    return this.readToken_plus_min(code)

  case 60: case 62: // '<>'
    return this.readToken_lt_gt(code)

  case 61: case 33: // '=!'
    return this.readToken_eq_excl(code)

  case 126: // '~'
    return this.finishOp(types.prefix, 1)
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp$8.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str)
};

// Parse a regular expression. Some context-awareness is necessary,
// since a '/' inside a '[]' set does not end the expression.

function tryCreateRegexp(src, flags, throwErrorAt, parser) {
  try {
    return new RegExp(src, flags)
  } catch (e) {
    if (throwErrorAt !== undefined) {
      if (e instanceof SyntaxError) { parser.raise(throwErrorAt, "Error parsing regular expression: " + e.message); }
      throw e
    }
  }
}

var regexpUnicodeSupport = !!tryCreateRegexp("\uffff", "u");

pp$8.readRegexp = function() {
  var this$1 = this;

  var escaped, inClass, start = this.pos;
  for (;;) {
    if (this$1.pos >= this$1.input.length) { this$1.raise(start, "Unterminated regular expression"); }
    var ch = this$1.input.charAt(this$1.pos);
    if (lineBreak.test(ch)) { this$1.raise(start, "Unterminated regular expression"); }
    if (!escaped) {
      if (ch === "[") { inClass = true; }
      else if (ch === "]" && inClass) { inClass = false; }
      else if (ch === "/" && !inClass) { break }
      escaped = ch === "\\";
    } else { escaped = false; }
    ++this$1.pos;
  }
  var content = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var mods = this.readWord1();
  if (this.containsEsc) { this.unexpected(flagsStart); }

  var tmp = content, tmpFlags = "";
  if (mods) {
    var validFlags = "gim";
    if (this.options.ecmaVersion >= 6) { validFlags += "uy"; }
    if (this.options.ecmaVersion >= 9) { validFlags += "s"; }
    for (var i = 0; i < mods.length; i++) {
      var mod = mods.charAt(i);
      if (validFlags.indexOf(mod) == -1) { this$1.raise(start, "Invalid regular expression flag"); }
      if (mods.indexOf(mod, i + 1) > -1) { this$1.raise(start, "Duplicate regular expression flag"); }
    }
    if (mods.indexOf("u") >= 0) {
      if (regexpUnicodeSupport) {
        tmpFlags = "u";
      } else {
        // Replace each astral symbol and every Unicode escape sequence that
        // possibly represents an astral symbol or a paired surrogate with a
        // single ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        // Note: replacing with the ASCII symbol `x` might cause false
        // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
        // perfectly valid pattern that is equivalent to `[a-b]`, but it would
        // be replaced by `[x-b]` which throws an error.
        tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g, function (_match, code, offset) {
          code = Number("0x" + code);
          if (code > 0x10FFFF) { this$1.raise(start + offset + 3, "Code point out of bounds"); }
          return "x"
        });
        tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
        tmpFlags = tmpFlags.replace("u", "");
      }
    }
  }
  // Detect invalid regular expressions.
  var value = null;
  // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
  // so don't do detection if we are running under Rhino
  if (!isRhino) {
    tryCreateRegexp(tmp, tmpFlags, start, this);
    // Get a regular expression object for this pattern-flag pair, or `null` in
    // case the current environment doesn't support the flags it uses.
    value = tryCreateRegexp(content, mods);
  }
  return this.finishToken(types.regexp, {pattern: content, flags: mods, value: value})
};

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp$8.readInt = function(radix, len) {
  var this$1 = this;

  var start = this.pos, total = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    var code = this$1.input.charCodeAt(this$1.pos), val = (void 0);
    if (code >= 97) { val = code - 97 + 10; } // a
    else if (code >= 65) { val = code - 65 + 10; } // A
    else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
    else { val = Infinity; }
    if (val >= radix) { break }
    ++this$1.pos;
    total = total * radix + val;
  }
  if (this.pos === start || len != null && this.pos - start !== len) { return null }

  return total
};

pp$8.readRadixNumber = function(radix) {
  this.pos += 2; // 0x
  var val = this.readInt(radix);
  if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
  return this.finishToken(types.num, val)
};

// Read an integer, octal integer, or floating-point number.

pp$8.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) { this.raise(start, "Invalid number"); }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
  var next = this.input.charCodeAt(this.pos);
  if (next === 46 && !octal) { // '.'
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) { // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) { ++this.pos; } // '+-'
    if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

  var str = this.input.slice(start, this.pos);
  var val = octal ? parseInt(str, 8) : parseFloat(str);
  return this.finishToken(types.num, val)
};

// Read a string value, interpreting backslash-escapes.

pp$8.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;

  if (ch === 123) { // '{'
    if (this.options.ecmaVersion < 6) { this.unexpected(); }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
  } else {
    code = this.readHexChar(4);
  }
  return code
};

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) { return String.fromCharCode(code) }
  code -= 0x10000;
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
}

pp$8.readString = function(quote) {
  var this$1 = this;

  var out = "", chunkStart = ++this.pos;
  for (;;) {
    if (this$1.pos >= this$1.input.length) { this$1.raise(this$1.start, "Unterminated string constant"); }
    var ch = this$1.input.charCodeAt(this$1.pos);
    if (ch === quote) { break }
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos);
      out += this$1.readEscapedChar(false);
      chunkStart = this$1.pos;
    } else {
      if (isNewLine(ch)) { this$1.raise(this$1.start, "Unterminated string constant"); }
      ++this$1.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types.string, out)
};

// Reads template string tokens.

var INVALID_TEMPLATE_ESCAPE_ERROR = {};

pp$8.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err
    }
  }

  this.inTemplateElement = false;
};

pp$8.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR
  } else {
    this.raise(position, message);
  }
};

pp$8.readTmplToken = function() {
  var this$1 = this;

  var out = "", chunkStart = this.pos;
  for (;;) {
    if (this$1.pos >= this$1.input.length) { this$1.raise(this$1.start, "Unterminated template"); }
    var ch = this$1.input.charCodeAt(this$1.pos);
    if (ch === 96 || ch === 36 && this$1.input.charCodeAt(this$1.pos + 1) === 123) { // '`', '${'
      if (this$1.pos === this$1.start && (this$1.type === types.template || this$1.type === types.invalidTemplate)) {
        if (ch === 36) {
          this$1.pos += 2;
          return this$1.finishToken(types.dollarBraceL)
        } else {
          ++this$1.pos;
          return this$1.finishToken(types.backQuote)
        }
      }
      out += this$1.input.slice(chunkStart, this$1.pos);
      return this$1.finishToken(types.template, out)
    }
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos);
      out += this$1.readEscapedChar(true);
      chunkStart = this$1.pos;
    } else if (isNewLine(ch)) {
      out += this$1.input.slice(chunkStart, this$1.pos);
      ++this$1.pos;
      switch (ch) {
      case 13:
        if (this$1.input.charCodeAt(this$1.pos) === 10) { ++this$1.pos; }
      case 10:
        out += "\n";
        break
      default:
        out += String.fromCharCode(ch);
        break
      }
      if (this$1.options.locations) {
        ++this$1.curLine;
        this$1.lineStart = this$1.pos;
      }
      chunkStart = this$1.pos;
    } else {
      ++this$1.pos;
    }
  }
};

// Reads a template token to search for the end, without validating any escape sequences
pp$8.readInvalidTemplateToken = function() {
  var this$1 = this;

  for (; this.pos < this.input.length; this.pos++) {
    switch (this$1.input[this$1.pos]) {
    case "\\":
      ++this$1.pos;
      break

    case "$":
      if (this$1.input[this$1.pos + 1] !== "{") {
        break
      }
    // falls through

    case "`":
      return this$1.finishToken(types.invalidTemplate, this$1.input.slice(this$1.start, this$1.pos))

    // no default
    }
  }
  this.raise(this.start, "Unterminated template");
};

// Used to read escaped characters

pp$8.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
  case 110: return "\n" // 'n' -> '\n'
  case 114: return "\r" // 'r' -> '\r'
  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  case 117: return codePointToString(this.readCodePoint()) // 'u'
  case 116: return "\t" // 't' -> '\t'
  case 98: return "\b" // 'b' -> '\b'
  case 118: return "\u000b" // 'v' -> '\u000b'
  case 102: return "\f" // 'f' -> '\f'
  case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
  case 10: // ' \n'
    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
    return ""
  default:
    if (ch >= 48 && ch <= 55) {
      var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
      var octal = parseInt(octalStr, 8);
      if (octal > 255) {
        octalStr = octalStr.slice(0, -1);
        octal = parseInt(octalStr, 8);
      }
      this.pos += octalStr.length - 1;
      ch = this.input.charCodeAt(this.pos);
      if ((octalStr !== "0" || ch == 56 || ch == 57) && (this.strict || inTemplate)) {
        this.invalidStringToken(this.pos - 1 - octalStr.length, "Octal literal in strict mode");
      }
      return String.fromCharCode(octal)
    }
    return String.fromCharCode(ch)
  }
};

// Used to read character escape sequences ('\x', '\u', '\U').

pp$8.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
  return n
};

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp$8.readWord1 = function() {
  var this$1 = this;

  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this$1.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this$1.pos += ch <= 0xffff ? 1 : 2;
    } else if (ch === 92) { // "\"
      this$1.containsEsc = true;
      word += this$1.input.slice(chunkStart, this$1.pos);
      var escStart = this$1.pos;
      if (this$1.input.charCodeAt(++this$1.pos) != 117) // "u"
        { this$1.invalidStringToken(this$1.pos, "Expecting Unicode escape sequence \\uXXXX"); }
      ++this$1.pos;
      var esc = this$1.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
        { this$1.invalidStringToken(escStart, "Invalid Unicode escape"); }
      word += codePointToString(esc);
      chunkStart = this$1.pos;
    } else {
      break
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos)
};

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp$8.readWord = function() {
  var word = this.readWord1();
  var type = types.name;
  if (this.keywords.test(word)) {
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword " + word); }
    type = keywords$1[word];
  }
  return this.finishToken(type, word)
};

// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/acornjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/acornjs/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

var version = "5.4.1";

// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

function parse(input, options) {
  return new Parser(options, input).parse()
}

// This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.

function parseExpressionAt(input, pos, options) {
  var p = new Parser(options, input, pos);
  p.nextToken();
  return p.parseExpression()
}

// Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenizer` export provides an interface to the tokenizer.

function tokenizer(input, options) {
  return new Parser(options, input)
}

// This is a terrible kludge to support the existing, pre-ES6
// interface where the loose parser module retroactively adds exports
// to this module.
 // eslint-disable-line camelcase
function addLooseExports(parse, Parser$$1, plugins$$1) {
  exports.parse_dammit = parse; // eslint-disable-line camelcase
  exports.LooseParser = Parser$$1;
  exports.pluginsLoose = plugins$$1;
}

exports.version = version;
exports.parse = parse;
exports.parseExpressionAt = parseExpressionAt;
exports.tokenizer = tokenizer;
exports.addLooseExports = addLooseExports;
exports.Parser = Parser;
exports.plugins = plugins;
exports.defaultOptions = defaultOptions;
exports.Position = Position;
exports.SourceLocation = SourceLocation;
exports.getLineInfo = getLineInfo;
exports.Node = Node;
exports.TokenType = TokenType;
exports.tokTypes = types;
exports.keywordTypes = keywords$1;
exports.TokContext = TokContext;
exports.tokContexts = types$1;
exports.isIdentifierChar = isIdentifierChar;
exports.isIdentifierStart = isIdentifierStart;
exports.Token = Token;
exports.isNewLine = isNewLine;
exports.lineBreak = lineBreak;
exports.lineBreakG = lineBreakG;
exports.nonASCIIwhitespace = nonASCIIwhitespace;

Object.defineProperty(exports, '__esModule', { value: true });

})));
return exports;})();
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Utilities
 ------------------------------------------------------------------
**/
"use strict";
(function(){

  function init() {

  }

  function isWindows() {
    return (typeof navigator!="undefined") && navigator.userAgent.indexOf("Windows")>=0;
  }

  function isAppleDevice() {
    return (typeof navigator!="undefined") && (typeof window!="undefined") && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function getChromeVersion(){
    return parseInt(window.navigator.appVersion.match(/Chrome\/(.*?) /)[1].split(".")[0]);
  }

  function isNWApp() {
    return (typeof require === "function") && (typeof require('nw.gui') !== "undefined");
  }

  function isChromeWebApp() {
    return ((typeof chrome === "object") && chrome.app && chrome.app.window);
  }

  function isProgressiveWebApp() {
    return !isNWApp() && !isChromeWebApp() && window && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  }

  function hasNativeTitleBar() {
    return !isNWApp() && !isChromeWebApp();
  }

  function escapeHTML(text, escapeSpaces)
  {
    escapeSpaces = typeof escapeSpaces !== 'undefined' ? escapeSpaces : true;

    var chr = { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;', ' ' : (escapeSpaces ? '&nbsp;' : ' ') };

    return text.toString().replace(/[\"&<> ]/g, function (a) { return chr[a]; });
  }

  /* Google Docs, forums, etc tend to break code by replacing characters with
  fancy unicode versions. Un-break the code by undoing these changes */
  function fixBrokenCode(text)
  {
    // make sure we ignore `&shy;` - which gets inserted
    // by the forum's code formatter
    text = text.replace(/\u00AD/g,'');
    // replace quotes that get auto-replaced by Google Docs and other editors
    text = text.replace(/[\u201c\u201d]/g,'"');
    text = text.replace(/[\u2018\u2019]/g,'\'');

    return text;
  }


  function getSubString(str, from, len) {
    if (len == undefined) {
      return str.substr(from, len);
    } else {
      var s = str.substr(from, len);
      while (s.length < len) s+=" ";
      return s;
    }
  };

  /** Get a Lexer to parse JavaScript - this is really very nasty right now and it doesn't lex even remotely properly.
   * It'll return {type:"type", str:"chars that were parsed", value:"string", startIdx: Index in string of the start, endIdx: Index in string of the end}, until EOF when it returns undefined */
  function getLexer(str) {
    // Nasty lexer - no comments/etc
    var chAlpha="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";
    var chNum="0123456789";
    var chAlphaNum = chAlpha+chNum;
    var chWhiteSpace=" \t\n\r";
    var chQuotes = "\"'`";
    var ch;
    var idx = 0;
    var lineNumber = 1;
    var nextCh = function() {
      ch = str[idx++];
      if (ch=="\n") lineNumber++;
    };
    nextCh();
    var isIn = function(s,c) { return s.indexOf(c)>=0; } ;
    var nextToken = function() {
      while (isIn(chWhiteSpace,ch)) {
        nextCh();
      }
      if (ch==undefined) return undefined;
      if (ch=="/") {
        nextCh();
        if (ch=="/") {
          // single line comment
          while (ch!==undefined && ch!="\n") nextCh();
          return nextToken();
        } else if (ch=="*") {
          nextCh();
          var last = ch;
          nextCh();
          // multiline comment
          while (ch!==undefined && !(last=="*" && ch=="/")) {
            last = ch;
            nextCh();
          }
          nextCh();
          return nextToken();
        }
        return {type:"CHAR", str:"/", value:"/", startIdx:idx-2, endIdx:idx-1, lineNumber:lineNumber};
      }
      var s = "";
      var type, value;
      var startIdx = idx-1;
      if (isIn(chAlpha,ch)) { // ID
        type = "ID";
        do {
          s+=ch;
          nextCh();
        } while (isIn(chAlphaNum,ch));
      } else if (isIn(chNum,ch)) { // NUMBER
        type = "NUMBER";
        var chRange = chNum;
        if (ch=="0") { // Handle 
          s+=ch;
          nextCh();
          if ("xXoObB".indexOf(ch)>=0) {
            if (ch=="b" || ch=="B") chRange="01";
            if (ch=="o" || ch=="O") chRange="01234567";
            if (ch=="x" || ch=="X") chRange="0123456789ABCDEFabcdef";
            s+=ch;
            nextCh();
          } 
        }
        while (isIn(chRange,ch) || ch==".") {
          s+=ch;
          nextCh();
        } 
      } else if (isIn(chQuotes,ch)) { // STRING
        type = "STRING";
        var q = ch;
        value = "";
        s+=ch;
        nextCh();
        while (ch!==undefined && ch!=q) {
          s+=ch;
          if (ch=="\\") {
            nextCh();
            s+=ch;
            // FIXME: handle hex/etc correctly here
          }
          value += ch;
          nextCh();
        };
        if (ch!==undefined) s+=ch;
        nextCh();
      } else {
        type = "CHAR";
        s+=ch;
        nextCh();
      }
      if (value===undefined) value=s;
      return {type:type, str:s, value:value, startIdx:startIdx, endIdx:idx-1, lineNumber:lineNumber};
    };

    return {
      next : nextToken
    };
  };

  /** Count brackets in a string - will be 0 if all are closed */
  function countBrackets(str) {
    var lex = getLexer(str);
    var brackets = 0;
    var tok = lex.next();
    while (tok!==undefined) {
      if (tok.str=="(" || tok.str=="{" || tok.str=="[") brackets++;
      if (tok.str==")" || tok.str=="}" || tok.str=="]") brackets--;
      tok = lex.next();
    }
    return brackets;
  }

  /** Try and get a prompt from Espruino - if we don't see one, issue Ctrl-C
   * and hope it comes back. Calls callback with first argument true if it
     had to Ctrl-C out */
  function getEspruinoPrompt(callback) {
    if (Espruino.Core.Terminal!==undefined &&
        Espruino.Core.Terminal.getTerminalLine()==">") {
      console.log("Found a prompt... great!");
      return callback();
    }

    var receivedData = "";
    var prevReader = Espruino.Core.Serial.startListening(function (readData) {
      var bufView = new Uint8Array(readData);
      for(var i = 0; i < bufView.length; i++) {
        receivedData += String.fromCharCode(bufView[i]);
      }
      if (receivedData[receivedData.length-1] == ">") {
        if (receivedData.substr(-6)=="debug>") {
          console.log("Got debug> - sending Ctrl-C to break out and we'll be good");
          Espruino.Core.Serial.write('\x03');
        } else {
          if (receivedData == "\r\n=undefined\r\n>")
            receivedData=""; // this was just what we expected - so ignore it

          console.log("Received a prompt after sending newline... good!");
          clearTimeout(timeout);
          nextStep();
        }
      }
    });
    // timeout in case something goes wrong...
    var hadToBreak = false;
    var timeout = setTimeout(function() {
      console.log("Got "+JSON.stringify(receivedData));
      // if we haven't had the prompt displayed for us, Ctrl-C to break out of what we had
      console.log("No Prompt found, got "+JSON.stringify(receivedData[receivedData.length-1])+" - issuing Ctrl-C to try and break out");
      Espruino.Core.Serial.write('\x03');
      hadToBreak = true;
      timeout = setTimeout(function() {
        console.log("Still no prompt - issuing another Ctrl-C");
        Espruino.Core.Serial.write('\x03');
        nextStep();
      },500);
    },500);
    // when we're done...
    var nextStep = function() {
      // send data to console anyway...
      if(prevReader) prevReader(receivedData);
      receivedData = "";
      // start the previous reader listening again
      Espruino.Core.Serial.startListening(prevReader);
      // call our callback
      if (callback) callback(hadToBreak);
    };
    // send a newline, and we hope we'll see '=undefined\r\n>'
    Espruino.Core.Serial.write('\n');
  };

  /** Return the value of executing an expression on the board. If
  If exprPrintsResult=false/undefined the actual value returned by the expression is returned.
  If exprPrintsResult=true, whatever expression prints to the console is returned */
  function executeExpression(expressionToExecute, callback, exprPrintsResult) {
    var receivedData = "";
    var hadDataSinceTimeout = false;
    var allDataSent = false;

    var progress = 100;
    function incrementProgress() {
      if (progress==100) {
        Espruino.Core.Status.setStatus("Receiving...",100);
        progress=0;
      } else {
        progress++;
        Espruino.Core.Status.incrementProgress(1);
      }
    }

    function getProcessInfo(expressionToExecute, callback) {
      var prevReader = Espruino.Core.Serial.startListening(function (readData) {
        var bufView = new Uint8Array(readData);
        for(var i = 0; i < bufView.length; i++) {
          receivedData += String.fromCharCode(bufView[i]);
        }
        if(allDataSent) incrementProgress();
        // check if we got what we wanted
        var startProcess = receivedData.indexOf("< <<");
        var endProcess = receivedData.indexOf(">> >", startProcess);
        if(startProcess >= 0 && endProcess > 0){
          // All good - get the data!
          var result = receivedData.substring(startProcess + 4,endProcess);
          console.log("Got "+JSON.stringify(receivedData));
          // strip out the text we found
          receivedData = receivedData.substr(0,startProcess) + receivedData.substr(endProcess+4);
          // Now stop time timeout
          if (timeout) clearInterval(timeout);
          timeout = "cancelled";
          // Do the next stuff
          nextStep(result);
        } else if (startProcess >= 0) {
          // we got some data - so keep waiting...
          hadDataSinceTimeout = true;
        }
      });

      // when we're done...
      var nextStep = function(result) {
        Espruino.Core.Status.setStatus("");
        // start the previous reader listing again
        Espruino.Core.Serial.startListening(prevReader);
        // forward the original text to the previous reader
        if(prevReader) prevReader(receivedData);
        // run the callback
        callback(result);
      };

      var timeout = undefined;
      // Don't Ctrl-C, as we've already got ourselves a prompt with Espruino.Core.Utils.getEspruinoPrompt
      var cmd;
      if (exprPrintsResult)
        cmd  = '\x10print("<","<<");'+expressionToExecute+';print(">>",">")\n';
      else
        cmd  = '\x10print("<","<<",JSON.stringify('+expressionToExecute+'),">>",">")\n';

      Espruino.Core.Serial.write(cmd,
                                 undefined, function() {
        allDataSent = true;
        // now it's sent, wait for data
        var maxTimeout = 30; // seconds - how long we wait if we're getting data
        var minTimeout = 2; // seconds - how long we wait if we're not getting data
        var pollInterval = 500; // milliseconds
        var timeoutSeconds = 0;
        if (timeout != "cancelled") {
          timeout = setInterval(function onTimeout(){
            incrementProgress();
            timeoutSeconds += pollInterval/1000;
            // if we're still getting data, keep waiting for up to 10 secs
            if (hadDataSinceTimeout && timeoutSeconds<maxTimeout) {
              hadDataSinceTimeout = false;
            } else if (timeoutSeconds > minTimeout) {
              // No data yet...
              // OR we keep getting data for > maxTimeout seconds
              clearInterval(timeout);
              console.warn("No result found for "+JSON.stringify(expressionToExecute)+" - just got "+JSON.stringify(receivedData));
              nextStep(undefined);
            }
          }, pollInterval);
        }
      });
    }

    if(Espruino.Core.Serial.isConnected()){
      Espruino.Core.Utils.getEspruinoPrompt(function() {
        getProcessInfo(expressionToExecute, callback);
      });
    } else {
      console.error("executeExpression called when not connected!");
      callback(undefined);
    }
  };

  function versionToFloat(version) {
    return parseFloat(version.trim().replace("v","."));
  };

  /// Gets a URL, and returns callback(data) or callback(undefined) on error
  function getURL(url, callback) {
    Espruino.callProcessor("getURL", { url : url, data : undefined }, function(result) {
      if (result.data!==undefined) {
        callback(result.data);
      } else {
        var resultUrl = result.url ? result.url : url;
        if (typeof process === 'undefined') {
          // Web browser
          var xhr = new XMLHttpRequest();
          xhr.responseType = "text";
          xhr.addEventListener("load", function () {
            if (xhr.status === 200) {
              callback(xhr.response.toString());
            } else {
              console.error("getURL("+JSON.stringify(url)+") error : HTTP "+xhr.status);
              callback(undefined);
            }
          });
          xhr.addEventListener("error", function (e) {
            console.error("getURL("+JSON.stringify(url)+") error "+e);
            callback(undefined);
          });
          xhr.open("GET", url, true);
          xhr.send(null);
        } else {
          // Node.js
          if (resultUrl.substr(0,4)=="http") {
            var m = resultUrl[4]=="s"?"https":"http";

            var http_options = Espruino.Config.MODULE_PROXY_ENABLED ? {
              host: Espruino.Config.MODULE_PROXY_URL,
              port: Espruino.Config.MODULE_PROXY_PORT,
              path: resultUrl,
            } : resultUrl;

            require(m).get(http_options, function(res) {
              if (res.statusCode != 200) {
                console.log("Espruino.Core.Utils.getURL: got HTTP status code "+res.statusCode+" for "+url);
                return callback(undefined);
              }
              var data = "";
              res.on("data", function(d) { data += d; });
              res.on("end", function() {
                callback(data);
              });
            }).on('error', function(err) {
              console.error("getURL("+JSON.stringify(url)+") error : "+err);
              callback(undefined);
            });
          } else {
            require("fs").readFile(resultUrl, function(err, d) {
              if (err) {
                console.error(err);
                callback(undefined);
              } else
                callback(d.toString());
            });
          }
        }
      }
    });
  }

  /// Gets a URL as a Binary file, returning callback(err, ArrayBuffer)
  var getBinaryURL = function(url, callback) {
    console.log("Downloading "+url);
    Espruino.Core.Status.setStatus("Downloading binary...");
    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.addEventListener("load", function () {
      if (xhr.status === 200) {
        Espruino.Core.Status.setStatus("Done.");
        var data = xhr.response;
        callback(undefined,data);
      } else
        callback("Error downloading file - HTTP "+xhr.status);
    });
    xhr.addEventListener("error", function () {
      callback("Error downloading file");
    });
    xhr.open("GET", url, true);
    xhr.send(null);
  };

  /// Gets a URL as JSON, and returns callback(data) or callback(undefined) on error
  function getJSONURL(url, callback) {
    getURL(url, function(d) {
      if (!d) return callback(d);
      var j;
      try { j=JSON.parse(d); } catch (e) { console.error("Unable to parse JSON",d); }
      callback(j);
    });
  }

  function isURL(text) {
    return (new RegExp( '(http|https)://' )).test(text);
  }

  /* Are we served from a secure location so we're
   forced to use a secure get? */
  function needsHTTPS() {
    if (typeof window==="undefined" || !window.location) return false;
    return window.location.protocol=="https:";
  }

  /* Open a file load dialog.
  options = {
   id :  ID is to ensure that subsequent calls with  the same ID remember the last used directory.
   type :
     type=="text" => (default) Callback is called with a string
     type=="arraybuffer" => Callback is called with an arraybuffer
   mimeType : (optional) comma-separated list of accepted mime types for files or extensions (eg. ".js,application/javascript")

   callback(contents, mimeType, fileName)
  */
  function fileOpenDialog(options, callback) {
    options = options||{};
    options.type = options.type||"text";
    options.id = options.id||"default";
    var loaderId = options.id+"FileLoader";
    var fileLoader = document.getElementById(loaderId);
    if (!fileLoader) {
      fileLoader = document.createElement("input");
      fileLoader.setAttribute("id", loaderId);
      fileLoader.setAttribute("type", "file");
      fileLoader.setAttribute("style", "z-index:-2000;position:absolute;top:0px;left:0px;");
      if (options.mimeType)
        fileLoader.setAttribute("accept",options.mimeType);
      fileLoader.addEventListener('click', function(e) {
        e.target.value = ''; // handle repeated upload of the same file
      });
      fileLoader.addEventListener('change', function(e) {
        if (!fileLoader.callback) return;
        var files = e.target.files;
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
          /* Doing reader.readAsText(file) interprets the file as UTF8
          which we don't want. */
          var result;
          if (options.type=="text") {
            var a = new Uint8Array(e.target.result);
            result = "";
            for (var i=0;i<a.length;i++)
              result += String.fromCharCode(a[i]);
          } else
            result = e.target.result;
          fileLoader.callback(result, file.type, file.name);
          fileLoader.callback = undefined;
        };
        if (options.type=="text" || options.type=="arraybuffer") reader.readAsArrayBuffer(file);
        else throw new Error("fileOpenDialog: unknown type "+options.type);
      }, false);
      document.body.appendChild(fileLoader);
    }
    fileLoader.callback = callback;
    fileLoader.click();
  }

  // Save a file with a save file dialog
  function fileSaveDialog(data, filename) {
    function errorHandler() {
      Espruino.Core.Notifications.error("Error Saving", true);
    }

    if (chrome.fileSystem) {
      // Chrome Web App / NW.js
      chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName:filename}, function(writableFileEntry) {
        if (!writableFileEntry) return; // cancelled
        writableFileEntry.createWriter(function(writer) {
          var blob = new Blob([data],{ type: "text/plain"} );
          writer.onerror = errorHandler;
          // when truncation has finished, write
          writer.onwriteend = function(e) {
            writer.onwriteend = function(e) {
              console.log('FileWriter: complete');
            };
            console.log('FileWriter: writing');
            writer.write(blob);
          };
          // truncate
          console.log('FileWriter: truncating');
          writer.truncate(blob.size);
        }, errorHandler);
      });
    } else {
      var rawdata = new Uint8Array(data.length);
      for (var i=0;i<data.length;i++) rawdata[i]=data.charCodeAt(i);
      var a = document.createElement("a"),
          file = new Blob([rawdata.buffer], {type: "text/plain"});
      var url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
      }, 0);
    }
  };

  /** Bluetooth device names that we KNOW run Espruino */
  function recognisedBluetoothDevices() {
    return [
       "Puck.js", "Pixl.js", "MDBT42Q", "Espruino", "Badge", "Thingy", "RuuviTag", "iTracker", "Smartibot", "Bangle.js",
    ];
  }

  /** If we can't find service info, add devices
  based only on their name */
  function isRecognisedBluetoothDevice(name) {
    if (!name) return false;
    var devs = recognisedBluetoothDevices();
    for (var i=0;i<devs.length;i++)
      if (name.substr(0, devs[i].length) == devs[i])
        return true;
    return false;
  }


  function getVersion(callback) {
    var xmlhttp = new XMLHttpRequest();
    var path = (window.location.pathname.indexOf("relay")>=0)?"../":"";
    xmlhttp.open('GET', path+'manifest.json');
    xmlhttp.onload = function (e) {
        var manifest = JSON.parse(xmlhttp.responseText);
        callback(manifest.version);
    };
    xmlhttp.send(null);
  }

  function getVersionInfo(callback) {
    getVersion(function(version) {
      var platform = "Web App";
      if (isNWApp())
        platform = "NW.js Native App";
      if (isChromeWebApp())
        platform = "Chrome App";

      callback(platform+", v"+version);
    });
  }

  // Converts a string to an ArrayBuffer
  function stringToArrayBuffer(str) {
    var buf=new Uint8Array(str.length);
    for (var i=0; i<str.length; i++) {
      var ch = str.charCodeAt(i);
      if (ch>=256) {
        console.warn("stringToArrayBuffer got non-8 bit character - code "+ch);
        ch = "?".charCodeAt(0);
      }
      buf[i] = ch;
    }
    return buf.buffer;
  };

  // Converts a string to a Buffer
  function stringToBuffer(str) {
    var buf = Buffer.alloc(str.length);
    for (var i = 0; i < buf.length; i++) {
      buf.writeUInt8(str.charCodeAt(i), i);
    }
    return buf;
  };

  // Converts a DataView to an ArrayBuffer
  function dataViewToArrayBuffer(str) {
    var bufView = new Uint8Array(dv.byteLength);
    for (var i = 0; i < bufView.length; i++) {
      bufView[i] = dv.getUint8(i);
    }
    return bufView.buffer;
  };

  // Converts an ArrayBuffer to a string
  function arrayBufferToString(str) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  /* Parses a JSON string into JS, taking into account some of the issues
  with Espruino's JSON from 2v04 and before */
  function parseJSONish(str) {
    var lex = getLexer(str);
    var tok = lex.next();
    var final = "";
    while (tok!==undefined) {
      var s = tok.str;
      if (tok.type=="STRING") {
        s = s.replace(/\\([0-9])/g,"\\u000$1");
        s = s.replace(/\\x(..)/g,"\\u00$1");
      }
      final += s;
      tok = lex.next();
    }
    return JSON.parse(final);
  };

  // Does the given string contain only ASCII characters?
  function isASCII(str) {
    for (var i=0;i<str.length;i++) {
      var c = str.charCodeAt(i);
      if ((c<32 || c>126) &&
          (c!=10) && (c!=13) && (c!=9)) return false;
    }
    return true;
  }

  // btoa that works on utf8
  function btoa(input) {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "";
    var i=0;
    while (i<input.length) {
      var octet_a = 0|input.charCodeAt(i++);
      var octet_b = 0;
      var octet_c = 0;
      var padding = 0;
      if (i<input.length) {
        octet_b = 0|input.charCodeAt(i++);
        if (i<input.length) {
          octet_c = 0|input.charCodeAt(i++);
          padding = 0;
        } else
          padding = 1;
      } else
        padding = 2;
      var triple = (octet_a << 0x10) + (octet_b << 0x08) + octet_c;
      out += b64[(triple >> 18) & 63] +
             b64[(triple >> 12) & 63] +
             ((padding>1)?'=':b64[(triple >> 6) & 63]) +
             ((padding>0)?'=':b64[triple & 63]);
    }
    return out;
  }

  Espruino.Core.Utils = {
      init : init,
      isWindows : isWindows,
      isAppleDevice : isAppleDevice,
      getChromeVersion : getChromeVersion,
      isNWApp : isNWApp,
      isChromeWebApp : isChromeWebApp,
      isProgressiveWebApp : isProgressiveWebApp,
      hasNativeTitleBar : hasNativeTitleBar,
      escapeHTML : escapeHTML,
      fixBrokenCode : fixBrokenCode,
      getSubString : getSubString,
      getLexer : getLexer,
      countBrackets : countBrackets,
      getEspruinoPrompt : getEspruinoPrompt,
      executeExpression : function(expr,callback) { executeExpression(expr,callback,false); },
      executeStatement : function(statement,callback) { executeExpression(statement,callback,true); },
      versionToFloat : versionToFloat,
      getURL : getURL,
      getBinaryURL : getBinaryURL,
      getJSONURL : getJSONURL,
      isURL : isURL,
      needsHTTPS : needsHTTPS,
      fileOpenDialog : fileOpenDialog,
      fileSaveDialog : fileSaveDialog,
      recognisedBluetoothDevices : recognisedBluetoothDevices,
      isRecognisedBluetoothDevice : isRecognisedBluetoothDevice,
      getVersion : getVersion,
      getVersionInfo : getVersionInfo,
      stringToArrayBuffer : stringToArrayBuffer,
      stringToBuffer : stringToBuffer,
      dataViewToArrayBuffer : dataViewToArrayBuffer,
      arrayBufferToString : arrayBufferToString,
      parseJSONish : parseJSONish,
      isASCII : isASCII,
      btoa : btoa
  };
}());
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Central place to store and retrieve Options

  To use this, on your plugin's `init` function, do something like the
  following:

  Espruino.Core.Config.add("MAX_FOOBARS", {
    section : "Communications",           // Heading this will come under in the config screen
    name : "Foobars",                     // Nice name
    description : "How many foobars?",    // More detail about this
    type : "int"/"boolean"/"string"/{ value1:niceName, value2:niceName },
    defaultValue : 20,
    onChange : function(newValue) { ... }
  });

    * onChange will be called whenever the value changes from the default
      (including when it is loaded)

  Then use:

  Espruino.Config.MAX_FOOBARS in your code
 ------------------------------------------------------------------
**/
"use strict";
(function() {

  /** See addSection and getSections */
  var builtinSections = {};

  function _get(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get( "CONFIGS", function (data) {
        var value = data["CONFIGS"];
        console.log("GET chrome.storage.sync = "+JSON.stringify(value));
        callback(value);
      });
    } else if (typeof window !== 'undefined' && window.localStorage) {
      var data = {};
      var value = window.localStorage.getItem("CONFIG");
      console.log("GET window.localStorage = "+JSON.stringify(value));
      try {
        data = JSON.parse(value);
      } catch (e) {
        console.log("Invalid config data");
      }
      callback(data);
    } else if (typeof document != "undefined") {
      var data = {};
      var cookie = document.cookie;
      if (cookie!==undefined && cookie.indexOf("CONFIG=")>=0) {
        cookie = cookie.substring(cookie.indexOf("CONFIG=")+7);
        cookie = cookie.substring(0,cookie.indexOf(";"));
        try {
          var json = atob(cookie);
          data = JSON.parse(json);
        } catch (e) {
          console.log("Got ", e, " while reading info");
        }
      }
      callback(data);
    } else {
      callback({});
    }
  }

  function _set(data) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      console.log("SET chrome.storage.sync = "+JSON.stringify(data,null,2));
      chrome.storage.sync.set({ CONFIGS : data });
    } else if (typeof window !== 'undefined' && window.localStorage) {
      console.log("SET window.localStorage = "+JSON.stringify(data,null,2));
      window.localStorage.setItem("CONFIG",JSON.stringify(data));
    } else if (typeof document != "undefined") {
      document.cookie = "CONFIG="+btoa(JSON.stringify(data));
    }
  }

  function loadConfiguration(callback) {
    _get(function (value) {
      for (var key in value) {
        if (key=="set") continue;
        Espruino.Config[key] = value[key];
        if (Espruino.Core.Config.data[key] !== undefined &&
            Espruino.Core.Config.data[key].onChange !== undefined)
          Espruino.Core.Config.data[key].onChange(value[key]);
      }
      if (callback!==undefined)
        callback();
    });
  }

  function init() {
    addSection("General", { sortOrder:100, description: "General Web IDE Settings" });
    addSection("Communications", { sortOrder:200, description: "Settings for communicating with the Espruino Board" });
    addSection("Board", { sortOrder:300, description: "Settings for the Espruino Board itself" });
  }

  function add(name, options) {
    Espruino.Core.Config.data[name] = options;
    if (Espruino.Config[name] === undefined)
      Espruino.Config[name] = options.defaultValue;
  }

  /** Add a section (or information on the page).
   * options = {
   *   sortOrder : int, // a number used for sorting
   *   description : "",
   *   getHTML : function(callback(html)) // optional
   * };
   */
  function addSection(name, options) {
    options.name = name;
    builtinSections[name] = options;
  }

  /** Get an object containing the information on a section used in configs */
  function getSection(name) {
    if (builtinSections[name]!==undefined)
      return builtinSections[name];
    // not found - but we warned about this in getSections
    return {
      name : name
    };
  }

  /** Get an object containing information on all 'sections' used in all the configs */
  function getSections() {
    var sections = [];
    // add sections we know about
    for (var name in builtinSections)
      sections.push(builtinSections[name]);
    // add other sections
    for (var i in Espruino.Core.Config.data) {
      var c = Espruino.Core.Config.data[i];

      var found = false;
      for (var s in sections)
        if (sections[s].name == c.section)
          found = true;

      if (!found) {
        console.warn("Section named "+c.section+" was not added with Config.addSection");
        sections[c.section] = {
            name : c.section,
            sortOrder : 0
        };
      }
    }
    // Now sort by sortOrder
    sections.sort(function (a,b) { return a.sortOrder - b.sortOrder; });

    return sections;
  }

  Espruino.Config = {};
  Espruino.Config.set = function (key, value) {
    if (Espruino.Config[key] != value) {
      Espruino.Config[key] = value;
      // Do the callback
      if (Espruino.Core.Config.data[key] !== undefined &&
          Espruino.Core.Config.data[key].onChange !== undefined)
        Espruino.Core.Config.data[key].onChange(value);
      // Save to synchronized storage...
      var data = {};
      for (var key in Espruino.Config)
        if (key != "set")
          data[key] = Espruino.Config[key];
      _set(data);
    }
  };

  function clearAll() { // clear all settings
    _set({});
    for (var name in Espruino.Core.Config.data) {
      var options = Espruino.Core.Config.data[name];
      Espruino.Config[name] = options.defaultValue;
    }
  }

  Espruino.Core.Config = {
      loadConfiguration : loadConfiguration, // special - called before init

      init : init,
      add : add,
      data : {},


      addSection : addSection,
      getSection : getSection,
      getSections : getSections,

      clearAll : clearAll, // clear all settings
  };

})();
/*
Gordon Williams (gw@pur3.co.uk)

Common entrypoint for all communications from the IDE. This handles
all serial_*.js connection types and passes calls to the correct one.

To add a new serial device, you must add an object to
  Espruino.Core.Serial.devices:

  Espruino.Core.Serial.devices.push({
    "name" : "Test",               // Name, when initialising
    "init" : function()            // Gets called at startup
    "getPorts": function(callback) // calls 'callback' with an array of ports:
        callback([{path:"TEST",          // path passed to 'open' (and displayed to user)
                   description:"test",   // description displayed to user
                   type:"test",           // bluetooth|usb|socket - used to show icon in UI
                   // autoconnect : true  // automatically conect to this (without the connect menu)
                 }], true); // instantPorts - will getPorts return all the ports on the first call, or does it need multiple calls (eg. Bluetooth)
    "open": function(path, openCallback, receiveCallback, disconnectCallback),
    "write": function(dataAsString, callbackWhenWritten)
    "close": function(),
    "maxWriteLength": 20, // optional - the maximum amount of characters that should be given to 'write' at a time
  });

*/
(function() {

  // List of ports and the devices they map to
  var portToDevice = undefined;
  // The current connected device (from Espruino.Core.Serial.devices)
  var currentDevice = undefined;

  // called when data received
  var readListener = undefined;

  // are we sending binary data? If so, don't automatically insert breaks for stuff like Ctrl-C
  var sendingBinary = false;
  // For throttled write
  var slowWrite = true;
  var writeData = [];
  var writeTimeout = undefined;
  /// flow control XOFF received - we shouldn't send anything
  var flowControlXOFF = false;


  function init() {
    Espruino.Core.Config.add("BAUD_RATE", {
      section : "Communications",
      name : "Baud Rate",
      description : "When connecting over serial, this is the baud rate that is used. 9600 is the default for Espruino",
      type : {9600:9600,14400:14400,19200:19200,28800:28800,38400:38400,57600:57600,115200:115200},
      defaultValue : 9600,
    });
    Espruino.Core.Config.add("SERIAL_IGNORE", {
     section : "Communications",
     name : "Ignore Serial Ports",
     description : "A '|' separated list of serial port paths to ignore, eg `/dev/ttyS*|/dev/*.SOC`",
     type : "string",
     defaultValue : "/dev/ttyS*|/dev/*.SOC|/dev/*.MALS"
   });
    Espruino.Core.Config.add("SERIAL_FLOW_CONTROL", {
     section : "Communications",
     name : "Software Flow Control",
     description : "Respond to XON/XOFF flow control characters to throttle data uploads. By default Espruino sends XON/XOFF for USB and Bluetooth (on 2v05+).",
     type : "boolean",
     defaultValue : true
   });

    var devices = Espruino.Core.Serial.devices;
    for (var i=0;i<devices.length;i++) {
      console.log("  - Initialising Serial "+devices[i].name);
      if (devices[i].init)
        devices[i].init();
    }
  }

  var startListening=function(callback) {
    var oldListener = readListener;
    readListener = callback;
    return oldListener;
  };

  /* Calls 'callback(port_list, shouldCallAgain)'
   'shouldCallAgain==true' means that more devices
   may appear later on (eg Bluetooth LE).*/
  var getPorts=function(callback) {
    var ports = [];
    var newPortToDevice = [];
    // get all devices
    var responses = 0;
    var devices = Espruino.Core.Serial.devices;
    if (!devices || devices.length==0) {
         portToDevice = newPortToDevice;
      return callback(ports, false);
    }
    var shouldCallAgain = false;
    devices.forEach(function (device) {
      //console.log("getPorts -->",device.name);
      device.getPorts(function(devicePorts, instantPorts) {
        //console.log("getPorts <--",device.name);
        if (instantPorts===false) shouldCallAgain = true;
        if (devicePorts) {
          devicePorts.forEach(function(port) {
            var ignored = false;
            if (Espruino.Config.SERIAL_IGNORE)
              Espruino.Config.SERIAL_IGNORE.split("|").forEach(function(wildcard) {
                var regexp = "^"+wildcard.replace(/\./g,"\\.").replace(/\*/g,".*")+"$";
                if (port.path.match(new RegExp(regexp)))
                  ignored = true;
              });

            if (!ignored) {
              if (port.usb && port.usb[0]==0x0483 && port.usb[1]==0x5740)
                port.description = "Espruino board";
              ports.push(port);
              newPortToDevice[port.path] = device;
            }
          });
        }
        responses++;
        if (responses == devices.length) {
          portToDevice = newPortToDevice;
          ports.sort(function(a,b) {
            if (a.unimportant && !b.unimportant) return 1;
            if (b.unimportant && !a.unimportant) return -1;
            return 0;
          });
          callback(ports, shouldCallAgain);
        }
      });
    });
  };

  var openSerial=function(serialPort, connectCallback, disconnectCallback) {
    return openSerialInternal(serialPort, connectCallback, disconnectCallback, 2);
  }

  var openSerialInternal=function(serialPort, connectCallback, disconnectCallback, attempts) {
    /* If openSerial is called, we need to have called getPorts first
      in order to figure out which one of the serial_ implementations
      we must call into. */
    if (portToDevice === undefined) {
      portToDevice = []; // stop recursive calls if something errors
      return getPorts(function() {
        openSerialInternal(serialPort, connectCallback, disconnectCallback, attempts);
      });
    }

    if (!(serialPort in portToDevice)) {
      if (serialPort.toLowerCase() in portToDevice) {
        serialPort = serialPort.toLowerCase();
      } else {
        if (attempts>0) {
          console.log("Port "+JSON.stringify(serialPort)+" not found - checking ports again ("+attempts+" attempts left)");
          return getPorts(function() {
            openSerialInternal(serialPort, connectCallback, disconnectCallback, attempts-1);
          });
        } else {
          console.error("Port "+JSON.stringify(serialPort)+" not found");
          return connectCallback(undefined);
        }
      }
    }

    var portInfo = { port:serialPort };
    connectionInfo = undefined;
    flowControlXOFF = false;
    currentDevice = portToDevice[serialPort];
    currentDevice.open(serialPort, function(cInfo) {  // CONNECT
      if (!cInfo) {
//        Espruino.Core.Notifications.error("Unable to connect");
        console.error("Unable to open device (connectionInfo="+cInfo+")");
        connectCallback(undefined);
      } else {
        connectionInfo = cInfo;
        connectedPort = serialPort;
        console.log("Connected", cInfo);
        if (connectionInfo.portName)
          portInfo.portName = connectionInfo.portName;
        Espruino.callProcessor("connected", portInfo, function() {
          connectCallback(cInfo);
        });
      }
    }, function(data) { // RECEIEVE DATA
      if (!(data instanceof ArrayBuffer)) console.warn("Serial port implementation is not returning ArrayBuffers");
      if (Espruino.Config.SERIAL_FLOW_CONTROL) {
        var u = new Uint8Array(data);
        for (var i=0;i<u.length;i++) {
          if (u[i]==17) { // XON
            console.log("XON received => resume upload");
            flowControlXOFF = false;
          }
          if (u[i]==19) { // XOFF
            console.log("XOFF received => pause upload");
            flowControlXOFF = true;
          }
        }
      }
      if (readListener) readListener(data);
    }, function() { // DISCONNECT
      currentDevice = undefined;
      if (!connectionInfo) {
        // we got a disconnect when we hadn't connected...
        // Just call connectCallback(undefined), don't bother sending disconnect
        connectCallback(undefined);
        return;
      }
      connectionInfo = undefined;
      if (writeTimeout!==undefined)
        clearTimeout(writeTimeout);
      writeTimeout = undefined;
      writeData = [];
      sendingBinary = false;
      flowControlXOFF = false;

      Espruino.callProcessor("disconnected", portInfo, function() {
        disconnectCallback(portInfo);
      });
    });
  };

  var str2ab=function(str) {
    var buf=new ArrayBuffer(str.length);
    var bufView=new Uint8Array(buf);
    for (var i=0; i<str.length; i++) {
      var ch = str.charCodeAt(i);
      if (ch>=256) {
        console.warn("Attempted to send non-8 bit character - code "+ch);
        ch = "?".charCodeAt(0);
      }
      bufView[i] = ch;
    }
    return buf;
  };

  var closeSerial=function() {
    if (currentDevice) {
      currentDevice.close();
      currentDevice = undefined;
    } else
      console.error("Close called, but serial port not open");
  };

  var isConnected = function() {
    return currentDevice!==undefined;
  };

  var writeSerialWorker = function(isStarting) {
    writeTimeout = undefined; // we've been called
    // check flow control
    if (flowControlXOFF) {
      /* flow control was enabled - bit hacky (we could use a callback)
      but safe - just check again in a bit to see if we should send */
      writeTimeout = setTimeout(function() {
        writeSerialWorker();
      }, 50);
      return;
    }

    // if we disconnected while sending, empty queue
    if (currentDevice === undefined) {
      if (writeData[0].callback)
        writeData[0].callback();
      writeData.shift();
      if (writeData.length) setTimeout(function() {
        writeSerialWorker(false);
      }, 1);
      return;
    }

    if (writeData[0].data === "") {
      if (writeData[0].showStatus)
        Espruino.Core.Status.setStatus("Sent");
      if (writeData[0].callback)
        writeData[0].callback();
      writeData.shift(); // remove this empty first element
      if (!writeData.length) return; // anything left to do?
      isStarting = true;
    }

    if (isStarting) {
      var blockSize = 512;
      if (currentDevice.maxWriteLength)
        blockSize = currentDevice.maxWriteLength;
      /* if we're throttling our writes we want to send small
       * blocks of data at once. We still limit the size of
       * sent blocks to 512 because on Mac we seem to lose
       * data otherwise (not on any other platforms!) */
      if (slowWrite) blockSize=19;
      writeData[0].blockSize = blockSize;

      writeData[0].showStatus &= writeData[0].data.length>writeData[0].blockSize;
      if (writeData[0].showStatus) {
        Espruino.Core.Status.setStatus("Sending...", writeData[0].data.length);
        console.log("---> "+JSON.stringify(writeData[0].data));
      }
    }

    // Initial split use previous, or don't
    var d = undefined;
    var split = writeData[0].nextSplit || { start:0, end:writeData[0].data.length, delay:0 };
    // if we get something like Ctrl-C or `reset`, wait a bit for it to complete
    if (!sendingBinary) {
      function findSplitIdx(prev, substr, delay, reason) {
        var match = writeData[0].data.match(substr);
        // not found
        if (match===null) return prev;
        // or previous find was earlier in str
        var end = match.index + match[0].length;
        if (end > prev.end) return prev;
        // found, and earlier
        prev.start = match.index;
        prev.end = end;
        prev.delay = delay;
        prev.match = match[0];
        prev.reason = reason;
        return prev;
      }
      split = findSplitIdx(split, /\x03/, 250, "Ctrl-C"); // Ctrl-C
      split = findSplitIdx(split, /reset\(\);\n/, 250, "reset()"); // Reset
      split = findSplitIdx(split, /load\(\);\n/, 250, "load()"); // Load
      split = findSplitIdx(split, /Modules.addCached\("[^\n]*"\);\n/, 250, "Modules.addCached"); // Adding a module
      split = findSplitIdx(split, /\x10require\("Storage"\).write\([^\n]*\);\n/, 500, "Storage.write"); // Write chunk of data
    }
    // Otherwise split based on block size
    if (!split.match || split.end >= writeData[0].blockSize) {
      if (split.match) writeData[0].nextSplit = split;
      split = { start:0, end:writeData[0].blockSize, delay:0 };
    }
    if (split.match) console.log("Splitting for "+split.reason+", delay "+split.delay);
    // Only send some of the data
    if (writeData[0].data.length>split.end) {
      if (slowWrite && split.delay==0) split.delay=50;
      d = writeData[0].data.substr(0,split.end);
      writeData[0].data = writeData[0].data.substr(split.end);
      if (writeData[0].nextSplit) {
        writeData[0].nextSplit.start -= split.end;
        writeData[0].nextSplit.end -= split.end;
        if (writeData[0].nextSplit.end<=0)
          writeData[0].nextSplit = undefined;
      }
    } else {
      d = writeData[0].data;
      writeData[0].data = "";
      writeData[0].nextSplit = undefined;
    }
    // update status
    if (writeData[0].showStatus)
      Espruino.Core.Status.incrementProgress(d.length);
    // actually write data
    //console.log("Sending block "+JSON.stringify(d)+", wait "+split.delay+"ms");
    currentDevice.write(d, function() {
      // Once written, start timeout
      writeTimeout = setTimeout(function() {
        writeSerialWorker();
      }, split.delay);
    });
  }

   // Throttled serial write
  var writeSerial = function(data, showStatus, callback) {
    if (showStatus===undefined) showStatus=true;

    /* Queue our data to write. If there was previous data and no callback to
    invoke on this data or the previous then just append data. This would happen
    if typing in the terminal for example. */
    if (!callback && writeData.length && !writeData[writeData.length-1].callback) {
      writeData[writeData.length-1].data += data;
    } else {
      writeData.push({data:data,callback:callback,showStatus:showStatus});
      /* if this is our first data, start sending now. Otherwise we're already
      busy sending and will pull data off writeData when ready */
      if (writeData.length==1)
        writeSerialWorker(true);
    }
  };


  // ----------------------------------------------------------
  Espruino.Core.Serial = {
    "devices" : [], // List of devices that can provide a serial API
    "init" : init,
    "getPorts": getPorts,
    "open": openSerial,
    "isConnected": isConnected,
    "startListening": startListening,
    "write": writeSerial,
    "close": closeSerial,
    "isSlowWrite": function() { return slowWrite; },
    "setSlowWrite": function(isOn, force) {
      if ((!force) && Espruino.Config.SERIAL_THROTTLE_SEND) {
        console.log("ForceThrottle option is set - set Slow Write = true");
        isOn = true;
      } else
        console.log("Set Slow Write = "+isOn);
      slowWrite = isOn;
    },
    "setBinary": function(isOn) {
      sendingBinary = isOn;
    }
  };
})();
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  The plugin that actually writes code out to Espruino
 ------------------------------------------------------------------
**/
"use strict";
(function(){

  function init() {
    Espruino.Core.Config.add("RESET_BEFORE_SEND", {
      section : "Communications",
      name : "Reset before Send",
      description : "Reset Espruino before sending code from the editor pane?",
      type : "boolean",
      defaultValue : true
    });
    Espruino.Core.Config.add("STORE_LINE_NUMBERS", {
      section : "Communications",
      name : "Store line numbers",
      description : "Should Espruino store line numbers for each function? This uses one extra variable per function, but allows you to get source code debugging in the Web IDE",
      type : "boolean",
      defaultValue : true
    });

  }

  function writeToEspruino(code, callback) {
    /* hack around non-K&R code formatting that would have
    broken Espruino CLI's bracket counting */
    code = reformatCode(code);
    if (code === undefined) return; // it should already have errored

    // We want to make sure we've got a prompt before sending. If not,
    // this will issue a Ctrl+C
    Espruino.Core.Utils.getEspruinoPrompt(function() {
      // Make sure code ends in 2 newlines
      while (code[code.length-2]!="\n" || code[code.length-1]!="\n")
        code += "\n";

      // If we're supposed to reset Espruino before sending...
      if (Espruino.Config.RESET_BEFORE_SEND) {
        code = "\x10reset();\n"+code;
      }

      //console.log("Sending... "+data);
      Espruino.Core.Serial.write(code, true, function() {
        // give 5 seconds for sending with save and 2 seconds without save
        var count = Espruino.Config.SAVE_ON_SEND ? 50 : 20;
        setTimeout(function cb() {
          if (Espruino.Core.Terminal!==undefined &&
              Espruino.Core.Terminal.getTerminalLine()!=">") {
            count--;
            if (count>0) {
              setTimeout(cb, 100);
            } else {
              Espruino.Core.Notifications.error("Prompt not detected - upload failed. Trying to recover...");
              Espruino.Core.Serial.write("\x03\x03echo(1)\n", false, callback);
            }
          } else {
            if (callback) callback();
          }
        }, 100);
      });
    });
  };

  /// Parse and fix issues like `if (false)\n foo` in the root scope
  function reformatCode(code) {
     var APPLY_LINE_NUMBERS = false;
     var lineNumberOffset = 0;
     var ENV = Espruino.Core.Env.getData();
     if (ENV && ENV.VERSION_MAJOR && ENV.VERSION_MINOR) {
       if (ENV.VERSION_MAJOR>1 ||
           ENV.VERSION_MINOR>=81.086) {
         if (Espruino.Config.STORE_LINE_NUMBERS)
           APPLY_LINE_NUMBERS = true;
       }
     }
    // Turn cr/lf into just lf (eg. windows -> unix)
    code = code.replace(/\r\n/g,"\n");
    // First off, try and fix funky characters
    for (var i=0;i<code.length;i++) {
      var ch = code.charCodeAt(i);
      if ((ch<32 || ch>255) && ch!=9/*Tab*/ && ch!=10/*LF*/ && ch!=13/*CR*/) {
        console.warn("Funky character code "+ch+" at position "+i+". Replacing with ?");
        code = code.substr(0,i)+"?"+code.substr(i+1);
      }
    }

    /* Search for lines added to the start of the code by the module handler.
    Ideally there would be a better way of doing this so line numbers stayed correct,
    but this hack works for now. Fixes EspruinoWebIDE#140 */
    if (APPLY_LINE_NUMBERS) {
      var l = code.split("\n");
      var i = 0;
      while (l[i] && (l[i].substr(0,8)=="Modules." ||
                      l[i].substr(0,8)=="setTime(")) i++;
      lineNumberOffset = -i;
    }

    var resultCode = "\x10"; // 0x10 = echo off for line
    /** we're looking for:
     *   `a = \n b`
     *   `for (.....) \n X`
     *   `if (.....) \n X`
     *   `if (.....) { } \n else foo`
     *   `while (.....) \n X`
     *   `do \n X`
     *   `function (.....) \n X`
     *   `function N(.....) \n X`
     *   `var a \n , b`    `var a = 0 \n, b`
     *   `var a, \n b`     `var a = 0, \n b`
     *   `a \n . b`
     *   `foo() \n . b`
     *   `try { } \n catch \n () \n {}`
     *
     *   These are divided into two groups - where there are brackets
     *   after the keyword (statementBeforeBrackets) and where there aren't
     *   (statement)
     *
     *   We fix them by replacing \n with what you get when you press
     *   Alt+Enter (Ctrl + LF). This tells Espruino that it's a newline
     *   but NOT to execute.
     */
    var lex = Espruino.Core.Utils.getLexer(code);
    var brackets = 0;
    var curlyBrackets = 0;
    var statementBeforeBrackets = false;
    var statement = false;
    var varDeclaration = false;
    var lastIdx = 0;
    var lastTok = {str:""};
    var tok = lex.next();
    while (tok!==undefined) {
      var previousString = code.substring(lastIdx, tok.startIdx);
      var tokenString = code.substring(tok.startIdx, tok.endIdx);
      //console.log("prev "+JSON.stringify(previousString)+"   next "+tokenString);

      /* Inserting Alt-Enter newline, which adds newline without trying
      to execute */
      if (brackets>0 || // we have brackets - sending the alt-enter special newline means Espruino doesn't have to do a search itself - faster.
          statement || // statement was before brackets - expecting something else
          statementBeforeBrackets ||  // we have an 'if'/etc
          varDeclaration || // variable declaration then newline
          tok.str=="," || // comma on newline - there was probably something before
          tok.str=="." || // dot on newline - there was probably something before
          tok.str=="+" || tok.str=="-" || // +/- on newline - there was probably something before
          tok.str=="=" || // equals on newline - there was probably something before
          tok.str=="else" || // else on newline
          lastTok.str=="else" || // else befgore newline
          tok.str=="catch" || // catch on newline - part of try..catch
          lastTok.str=="catch"
        ) {
        //console.log("Possible"+JSON.stringify(previousString));
        previousString = previousString.replace(/\n/g, "\x1B\x0A");
      }

      var previousBrackets = brackets;
      if (tok.str=="(" || tok.str=="{" || tok.str=="[") brackets++;
      if (tok.str=="{") curlyBrackets++;
      if (tok.str==")" || tok.str=="}" || tok.str=="]") brackets--;
      if (tok.str=="}") curlyBrackets--;

      if (brackets==0) {
        if (tok.str=="for" || tok.str=="if" || tok.str=="while" || tok.str=="function" || tok.str=="throw") {
          statementBeforeBrackets = true;
          varDeclaration = false;
        } else if (tok.str=="var") {
          varDeclaration = true;
        } else if (tok.type=="ID" && lastTok.str=="function") {
          statementBeforeBrackets = true;
        } else if (tok.str=="try" || tok.str=="catch") {
          statementBeforeBrackets = true;
        } else if (tok.str==")" && statementBeforeBrackets) {
          statementBeforeBrackets = false;
          statement = true;
        } else if (["=","^","&&","||","+","+=","-","-=","*","*=","/","/=","%","%=","&","&=","|","|="].indexOf(tok.str)>=0) {
          statement = true;
        } else {
          if (tok.str==";") varDeclaration = false;
          statement = false;
          statementBeforeBrackets = false;
        }
      }
      /* If we're at root scope and had whitespace/comments between code,
      remove it all and replace it with a single newline and a
      0x10 (echo off for line) character. However DON'T do this if we had
      an alt-enter in the line, as it was there to stop us executing
      prematurely */
      if (previousBrackets==0 &&
          previousString.indexOf("\n")>=0 &&
          previousString.indexOf("\x1B\x0A")<0) {
        previousString = "\n\x10";
        // Apply line numbers to each new line sent, to aid debugger
        if (APPLY_LINE_NUMBERS && tok.lineNumber && (tok.lineNumber+lineNumberOffset)>0) {
          // Esc [ 1234 d
          // This is the 'set line number' command that we're abusing :)
          previousString += "\x1B\x5B"+(tok.lineNumber+lineNumberOffset)+"d";
        }
      }

      // add our stuff back together
      resultCode += previousString+tokenString;
      // next
      lastIdx = tok.endIdx;
      lastTok = tok;
      tok = lex.next();
    }
    //console.log(resultCode);
    if (brackets>0) {
      Espruino.Core.Notifications.error("You have more open brackets than close brackets. Please see the hints in the Editor window.");
      return undefined;
    }
    if (brackets<0) {
      Espruino.Core.Notifications.error("You have more close brackets than open brackets. Please see the hints in the Editor window.");
      return undefined;
    }
    return resultCode;
  };

  Espruino.Core.CodeWriter = {
    init : init,
    writeToEspruino : writeToEspruino,
  };
}());
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Automatically load any referenced modules
 ------------------------------------------------------------------
**/
"use strict";
(function(){

  function init() {
    Espruino.Core.Config.add("MODULE_URL", {
      section : "Communications",
      name : "Module URL",
      description : "Where to search online for modules when `require()` is used",
      type : "string",
      defaultValue : "https://www.espruino.com/modules"
    });
    Espruino.Core.Config.add("MODULE_EXTENSIONS", {
      section : "Communications",
      name : "Module Extensions",
      description : "The file extensions to use for each module. These are checked in order and the first that exists is used. One or more file extensions (including the dot) separated by `|`",
      type : "string",
      defaultValue : ".min.js|.js"
    });
    Espruino.Core.Config.add("MODULE_AS_FUNCTION", {
      section : "Communications",
      name : "Modules uploaded as functions",
      description : "Espruino 1v90 and later ONLY. Upload modules as Functions, allowing any functions inside them to be loaded directly from flash when 'Save on Send' is enabled.",
      type : "boolean",
      defaultValue : true
    });

    Espruino.Core.Config.add("MODULE_PROXY_ENABLED", {
      section : "Communications",
      name : "Enable Proxy",
      description : "Enable Proxy for loading the modules when `require()` is used (only in native IDE)",
      type : "boolean",
      defaultValue : false
    });

    Espruino.Core.Config.add("MODULE_PROXY_URL", {
      section : "Communications",
      name : "Proxy URL",
      description : "Proxy URL for loading the modules when `require()` is used (only in native IDE)",
      type : "string",
      defaultValue : ""
    });

    Espruino.Core.Config.add("MODULE_PROXY_PORT", {
      section : "Communications",
      name : "Proxy Port",
      description : "Proxy Port for loading the modules when `require()` is used (only in native IDE)",
      type : "string",
      defaultValue : ""
    });

    // When code is sent to Espruino, search it for modules and add extra code required to load them
    Espruino.addProcessor("transformForEspruino", function(code, callback) {
      loadModules(code, callback);
    });

    // Append the 'getModule' processor as the last (plugins get initialized after Espruino.Core modules)
    Espruino.Plugins.CoreModules = {
      init: function() {
        Espruino.addProcessor("getModule", function(data, callback) {
          if (data.moduleCode!==undefined) { // already provided be previous getModule processor
            return callback(data);
          }

          fetchGetModule(data, callback);
        });
      }
    };
  }

  function isBuiltIn(module) {
    var d = Espruino.Core.Env.getData();
    // If we got data from the device itself, use that as the
    // definitive answer
    if ("string" == typeof d.MODULES)
      return d.MODULES.split(",").indexOf(module)>=0;
    // Otherwise try and figure it out from JSON
    if ("info" in d &&
        "builtin_modules" in d.info &&
        d.info.builtin_modules.indexOf(module)>=0)
      return true;
    // Otherwise assume we don't have it
    return false;
  }

  /** Find any instances of require(...) in the code string and return a list */
  var getModulesRequired = function(code) {
    var modules = [];

    var lex = Espruino.Core.Utils.getLexer(code);
    var tok = lex.next();
    var state = 0;
    while (tok!==undefined) {
      if (state==0 && tok.str=="require") {
        state=1;
      } else if (state==1 && tok.str=="(") {
        state=2;
      } else if (state==2 && (tok.type=="STRING")) {
        state=0;
        var module = tok.value;
        if (!isBuiltIn(module) && modules.indexOf(module)<0)
          modules.push(module);
      } else
        state = 0;
      tok = lex.next();
    }

    return modules;
  };

  /** Download modules from MODULE_URL/.. */
  function fetchGetModule(data, callback) {
    var fullModuleName = data.moduleName;

    // try and load the module the old way...
    console.log("loadModule("+fullModuleName+")");

    var urls = []; // Array of where to look for this module
    var modName; // Simple name of the module
    if(Espruino.Core.Utils.isURL(fullModuleName)) {
      modName = fullModuleName.substr(fullModuleName.lastIndexOf("/") + 1).split(".")[0];
      urls = [ fullModuleName ];
    } else {
      modName = fullModuleName;
      Espruino.Config.MODULE_URL.split("|").forEach(function (url) {
        url = url.trim();
        if (url.length!=0)
        Espruino.Config.MODULE_EXTENSIONS.split("|").forEach(function (extension) {
          urls.push(url + "/" + fullModuleName + extension);
        })
      });
    };

    // Recursively go through all the urls
    (function download(urls) {
      if (urls.length==0) {
        return callback(data);
      }
      var dlUrl = urls[0];
      Espruino.Core.Utils.getURL(dlUrl, function (code) {
        if (code!==undefined) {
          // we got it!
          data.moduleCode = code;
          data.isMinified = dlUrl.substr(-7)==".min.js";
          return callback(data);
        } else {
          // else try next
          download(urls.slice(1));
        }
      });
    })(urls);
  }


  /** Called from loadModule when a module is loaded. Parse it for other modules it might use
   *  and resolve dfd after all submodules have been loaded */
  function moduleLoaded(resolve, requires, modName, data, loadedModuleData, alreadyMinified){
    // Check for any modules used from this module that we don't already have
    var newRequires = getModulesRequired(data);
    console.log(" - "+modName+" requires "+JSON.stringify(newRequires));
    // if we need new modules, set them to load and get their promises
    var newPromises = [];
    for (var i in newRequires) {
      if (requires.indexOf(newRequires[i])<0) {
        console.log("   Queueing "+newRequires[i]);
        requires.push(newRequires[i]);
        newPromises.push(loadModule(requires, newRequires[i], loadedModuleData));
      } else {
        console.log("   Already loading "+newRequires[i]);
      }
    }

    var loadProcessedModule = function (module) {
      // if we needed to load something, wait until it's loaded before resolving this
      Promise.all(newPromises).then(function(){
        // add the module to end of our array
        if (Espruino.Config.MODULE_AS_FUNCTION)
          loadedModuleData.push("Modules.addCached(" + JSON.stringify(module.name) + ",function(){" + module.code + "});");
        else
          loadedModuleData.push("Modules.addCached(" + JSON.stringify(module.name) + "," + JSON.stringify(module.code) + ");");
        // We're done
        resolve();
      });
    }
    if (alreadyMinified)
      loadProcessedModule({code:data,name:modName});
    else
      Espruino.callProcessor("transformModuleForEspruino", {code:data,name:modName}, loadProcessedModule);
  }

  /** Given a module name (which could be a URL), try and find it. Return
   * a deferred thingybob which signals when we're done. */
  function loadModule(requires, fullModuleName, loadedModuleData) {
    return new Promise(function(resolve, reject) {
      // First off, try and find this module using callProcessor
      Espruino.callProcessor("getModule",
        { moduleName:fullModuleName, moduleCode:undefined, isMinified:false },
        function(data) {
          if (data.moduleCode===undefined) {
            Espruino.Core.Notifications.warning("Module "+fullModuleName+" not found");
            return resolve();
          }

          // great! it found something. Use it.
          moduleLoaded(resolve, requires, fullModuleName, data.moduleCode, loadedModuleData, data.isMinified);
        });
    });
  }

  /** Finds instances of 'require' and then ensures that
   those modules are loaded into the module cache beforehand
   (by inserting the relevant 'addCached' commands into 'code' */
  function loadModules(code, callback){
    var loadedModuleData = [];
    var requires = getModulesRequired(code);
    if (requires.length == 0) {
      // no modules needed - just return
      callback(code);
    } else {
      Espruino.Core.Status.setStatus("Loading modules");
      // Kick off the module loading (each returns a promise)
      var promises = requires.map(function (moduleName) {
        return loadModule(requires, moduleName, loadedModuleData);
      });
      // When all promises are complete
      Promise.all(promises).then(function(){
        callback(loadedModuleData.join("\n") + "\n" + code);
      });
    }
  };


  Espruino.Core.Modules = {
    init : init
  };
}());
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Board Environment variables (process.env) - queried when board connects
 ------------------------------------------------------------------
**/
"use strict";
(function(){

  var environmentData = {};
  var boardData = {};

  function init() {
    Espruino.Core.Config.add("ENV_ON_CONNECT", {
      section : "Communications",
      name : "Request board details on connect",
      description : 'Just after the board is connected, should we query `process.env` to find out which board we\'re connected to? '+
                    'This enables the Web IDE\'s code completion, compiler features, and firmware update notice.',
      type : "boolean",
      defaultValue : true,
    });

    Espruino.addProcessor("connected", function(data, callback) {
      // Give us some time for any stored data to come in
      setTimeout(queryBoardProcess, 200, data, callback);
    });
  }

  function queryBoardProcess(data, callback) {
    if ((!Espruino.Config.ENV_ON_CONNECT) ||
        (Espruino.Core.MenuFlasher && Espruino.Core.MenuFlasher.isFlashing())) {
      return callback(data);
    }

    Espruino.Core.Utils.executeExpression("process.env", function(result) {
      var json = {};
      if (result!==undefined) {
        try {
          json = JSON.parse(result);
        } catch (e) {
          console.log("JSON parse failed - " + e + " in " + JSON.stringify(result));
        }
      }
      if (Object.keys(json).length==0) {
        Espruino.Core.Notifications.error("Unable to retrieve board information.\nConnection Error?");
        // make sure we don't remember a previous board's info
        json = {
          VERSION : undefined,
          BOARD : undefined,
          MODULES : undefined,
          EXPTR : undefined
        };
      } else {
        if (json.BOARD && json.VERSION)
          Espruino.Core.Notifications.info("Found " +json.BOARD+", "+json.VERSION);
      }
      // now process the enviroment variables
      for (var k in json) {
        boardData[k] = json[k];
        environmentData[k] = json[k];
      }
      if (environmentData.VERSION) {
        var v = environmentData.VERSION;
        var vIdx = v.indexOf("v");
        if (vIdx>=0) {
          environmentData.VERSION_MAJOR = parseInt(v.substr(0,vIdx));
          var minor = v.substr(vIdx+1);
          var dot = minor.indexOf(".");
          if (dot>=0)
            environmentData.VERSION_MINOR = parseInt(minor.substr(0,dot)) + parseInt(minor.substr(dot+1))*0.001;
          else
            environmentData.VERSION_MINOR = parseFloat(minor);
        }
      }

      Espruino.callProcessor("environmentVar", environmentData, function(envData) {
        environmentData = envData;
        callback(data);
      });
    });
  }

  /** Get all data merged in from the board */
  function getData() {
    return environmentData;
  }

  /** Get just the board's environment data */
  function getBoardData() {
    return boardData;
  }

  /** Get a list of boards that we know about */
  function getBoardList(callback) {
    var jsonDir = Espruino.Config.BOARD_JSON_URL;

    // ensure jsonDir ends with slash
    if (jsonDir.indexOf('/', jsonDir.length - 1) === -1) {
      jsonDir += '/';
    }

    Espruino.Core.Utils.getJSONURL(jsonDir + "boards.json", function(boards){
      // now load all the individual JSON files
      var promises = [];
      for (var boardId in boards) {
        promises.push((function() {
          var id = boardId;
          return new Promise(function(resolve, reject) {
            Espruino.Core.Utils.getJSONURL(jsonDir + boards[boardId].json, function (data) {
              boards[id]["json"] = data;
              resolve();
            });
          });
        })());
      }

      // When all are loaded, load the callback
      Promise.all(promises).then(function() {
        callback(boards);
      });
    });
  }

  Espruino.Core.Env = {
    init : init,
    getData : getData,
    getBoardData : getBoardData,
    getBoardList : getBoardList,
  };
}());
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Automatically run an assembler on inline assembler statements
 ------------------------------------------------------------------
**/
"use strict";
(function(){

  var base64_encode;
  if (typeof btoa == "undefined")
    base64_encode = function(s) { return Buffer.from(s).toString('base64'); };
  else
    base64_encode = btoa;

/*  Thumb reference :
    http://ece.uwaterloo.ca/~ece222/ARM/ARM7-TDMI-manual-pt3.pdf

    ARM reference
    https://web.eecs.umich.edu/~prabal/teaching/eecs373-f11/readings/ARMv7-M_ARM.pdf
*/

  // list of registers (for push/pop type commands)
  function rlist_lr(value) {
   var regs = value.split(",");
   var vals = { r0:1,r1:2,r2:4,r3:8,r4:16,r5:32,r6:64,r7:128,lr:256 };
   var bits = 0;
   for (var i in regs) {
     var reg = regs[i].trim();
     if (!(reg in vals))  throw "Unknown register name "+reg;
     bits |= vals[reg];
   }
   return bits;
  }

  function reg(reg_offset) {
    return function(reg) {
      var vals = { r0:0,r1:1,r2:2,r3:3,r4:4,r5:5,r6:6,r7:7 };
      if (!(reg in vals)) throw "Unknown register name "+reg;
      return vals[reg]<<reg_offset;
    };
  }
  function reg4(reg_offset) { // 4 bit register
    return function(reg) {
      var vals = { r0:0,r1:1,r2:2,r3:3,r4:4,r5:5,r6:6,r7:7,
                   r8:8,r9:9,r10:10,r11:11,r12:12,r13:13,r14:14,r15:15,
                   lr:14, pc:15 };
      if (!(reg in vals)) throw "Unknown register name "+reg;
      return vals[reg]<<reg_offset;
    };
  }


  function reg_or_immediate(reg_offset, immediate_bit) {
    return function(reg) {
      var regVal = parseInt(reg);
      if (regVal>=0 && regVal<8)
        return ((regVal&7)<<reg_offset) | (1<<immediate_bit);
      var vals = { r0:0,r1:1,r2:2,r3:3,r4:4,r5:5,r6:6,r7:7 };
      if (!(reg in vals)) throw "Unknown register name, or immediate out of range 0..7 "+reg;
      return vals[reg]<<reg_offset;
    };
  }

  function reg_base_offset(base_offset, offset_offset) {
   return function(value) {
     var parms = value.split(",");
     return reg(base_offset)(parms[0]) | reg(offset_offset)(parms[0]);
   };
  }

  function thumb2_immediate_t3(value) {
    if (value[0]!="#")
      throw new "Expecting '#' before number";
    var v = parseInt(value.substr(1));
    if (v>=0 && v<65536) {
      // https://web.eecs.umich.edu/~prabal/teaching/eecs373-f11/readings/ARMv7-M_ARM.pdf page 347
      var imm4,i,imm3,imm8; // what the...?
      imm4 = (v>>12)&15;
      i = (v>>11)&1;
      imm3 = (v>>8)&7;
      imm8 = v&255;
      return (i<<26) | (imm4<<16) | (imm3<<12) | imm8;
    }
    throw "Invalid number '"+value+"' - must be between 0 and 65535";
  }

  function _int(offset, bits, shift, signed) {
    return function(value, labels) {
      var maxValue = ((1<<bits)-1) << shift;
      var minValue = 0;
      if (signed) {
        minValue = -(1<<(bits-1));
        maxValue += minValue;
      }

      var binValue = undefined;
      if (value[0]=="#") {
        binValue = parseInt(value.substr(1));
      } else {
        var addValue = 0;
        var maths = value.indexOf("+");
        if (maths >= 0) {
          addValue = parseInt(value.substr(maths));
          value = value.substr(0,maths);
        }
        if (value in labels)
          binValue = labels[value] + addValue - labels["PC"];
        else
          throw "Unknown label '"+value+"'";
      }


      //console.log("VALUE----------- "+binValue+" PC "+labels["PC"]+" L "+labels[value]);

      if (binValue>=minValue && binValue<=maxValue && (binValue&((1<<shift)-1))==0)
        return ((binValue >> shift) & ((1<<bits)-1)) << offset;

      var msg = "Invalid number '"+value+"' ("+binValue+") - must be between 0 and "+maxValue;
      if (shift!=0) msg += " and a multiple of "+(1<<shift);
      throw msg;
    };
  }

  function uint(offset, bits, shift) {
    return _int(offset, bits, shift, false);
  }

  function sint(offset, bits, shift) {
    return _int(offset, bits, shift, true);
  }

  // special 23-bit address (bottom bit ignored) split into two halves
  function bl_addr() {
    var normal = sint(0, 22, 1); // un-split address
    return function(value, labels) {
      var v = normal(value, labels);
      return ((v>>11)&0x7FF)<<16 | (v&0x7FF);
    };
  }

  var ops = {
    // Format 1: move shifted register
    "lsl"  :[{ base:"00000-----___---", regex : /(r[0-7]),(r[0-7]),(#[0-9]+)$/, args:[reg(0),reg(3),uint(6,5,0)] },
             { base:"0100000010___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // 5.4 d = d << s
    "lsr"  :[{ base:"00001-----___---", regex : /(r[0-7]),(r[0-7]),(#[0-9]+)$/, args:[reg(0),reg(3),uint(6,5,0)] },
             { base:"0100000011___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // 5.4 d = d >> s
    "asr"  :[{ base:"00010-----___---", regex : /(r[0-7]),(r[0-7]),(#[0-9]+)$/, args:[reg(0),reg(3),uint(6,5,0)] },
             { base:"0100000100___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // 5.4 d = d >>> s
    // 5.2 Format 2: add/subtract
    // 00011
    // 5.3 Format 3: move/compare/add/subtract immediate
    "cmp"  :[{ base:"00101---________", regex : /(r[0-7]),(#[0-9]+)$/, args:[reg(8),uint(0,8,0)] }, // move/compare/subtract immediate
             { base:"0100001010___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // 5.4 test d-s
    // 5.4 Format 4: ALU operations
    "and"  :[{ base:"0100000000___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }],
    "eor"  :[{ base:"0100000001___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }],
    // lsl is above
    // lsr is above
    // asr is above
    "adc"  :[{ base:"0100000101___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // d + s + carry
    "sbc"  :[{ base:"0100000110___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // d - s - !carry
    "ror"  :[{ base:"0100000111___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // rotate right
    "tst"  :[{ base:"0100001000___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // test
    "neg"  :[{ base:"0100001001___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // - s
    // cmp is above
    "cmn"  :[{ base:"0100001011___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // test d+s
    "orr"  :[{ base:"0100001100___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // |
    "mul"  :[{ base:"0100001101___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // s*d
    "bic"  :[{ base:"0100001110___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // d & ~s
    "mvn"  :[{ base:"0100001111___---", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }], // ~s
    // 5.5 Format 5: Hi register operations/branch exchange
    // 5.6 Format 6: PC-relative load
    //  done (below)
    // 5.7 Format 7: load/store with register offset
    //  done (below)
    // 5.8 Format 8: load/store sign-extended byte/halfword
    // 5.9 Format 9: load/store with immediate offset
    //  done (below)
    // 5.10 Format 10: load/store halfword
    // 5.11 Format 11: SP-relative load/store
    // 5.12 Format 12: load address
    // done (below)
    // 5.13 Format 13: add offset to Stack Pointer
    // 5.14 Format 14: push/pop registers
    //  done (below)
    // 5.16 Format 16: conditional branch
    "beq" :[{ base:"11010000________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bne" :[{ base:"11010001________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bcs" :[{ base:"11010010________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bcc" :[{ base:"11010011________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bmi" :[{ base:"11010100________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bpl" :[{ base:"11010101________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bvs" :[{ base:"11010110________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bvc" :[{ base:"11010111________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bhi" :[{ base:"11011000________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bls" :[{ base:"11011001________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bge" :[{ base:"11011010________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "blt" :[{ base:"11011011________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "bgt" :[{ base:"11011100________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    "ble" :[{ base:"11011101________", regex : /^(.*)$/, args:[sint(0,8,1)] }], // 5.16 Format 16: conditional branch
    // 5.17 Format 17: software interrupt
    // 5.18 Format 18: unconditional branch
    "b"   :[{ base:"11100___________", regex : /^(.*)$/, args:[sint(0,11,1)] }],
    // 5.19 Format 19: long branch with link
    "bl"  :[{ base:"11110___________11111___________", regex : /^(.*)$/, args:[bl_addr()] }],
    "bx"   :[{ base:"010001110----000", regex : /(lr|r[0-9]+)$/, args:[reg4(3)] }],
    // ....


    "adr"  :[{ base:"10100---________", regex : /^(r[0-7]),([a-zA-Z_][0-9a-zA-Z_]*)$/,args:[reg(8),uint(0,8,2)] },  // ADR pseudo-instruction to save address (actually ADD PC)
             { base:"10100---________", regex : /^(r[0-7]),([a-zA-Z_][0-9a-zA-Z_]*\+[0-9]+)$/,args:[reg(8),uint(0,8,2)] }],
    "push" :[{ base:"1011010-________", regex : /^{(.*)}$/, args:[rlist_lr] }], // 5.14 Format 14: push/pop registers
    "pop"  :[{ base:"1011110-________", regex : /^{(.*)}$/, args:[rlist_lr] }], // 5.14 Format 14: push/pop registers
    "add"  :[{ base:"00110---________", regex : /(r[0-7]),(#[0-9]+)$/, args:[reg(8),uint(0,8,0)] }, // move/compare/subtract immediate
             { base:"10100---________", regex : /^(r[0-7]),pc,(#[0-9]+)$/,args:[reg(8),uint(0,8,2)] },
             { base:"10101---________", regex : /^(r[0-7]),sp,(#[0-9]+)$/, args:[reg(8),uint(0,8,2)] },
             { base:"101100000_______", regex : /^sp,(#[0-9]+)$/, args:[uint(0,7,2)] },
             { base:"00011-0___---___", regex : /^(r[0-7]),(r[0-7]),([^,]+)$/, args:[reg(0),reg(3),reg_or_immediate(6,10)] } ], // Format 2: add/subtract
    "adds" :[{ base:"00011-0___---___", regex : /^(r[0-7]),(r[0-7]),([^,]+)$/, args:[reg(0),reg(3),reg_or_immediate(6,10)] } ], //?
    "adc.w":[{ base:"111010110100----________--------", regex : /^(r[0-7]),(r[0-7]),(r[0-7])$/,args:[reg(16),reg(8),reg(0)] }], // made this up. probably wrong
    "add.w":[{ base:"11110001--------________--------", regex : /^(r[0-7]),(r[0-7]),(#[0-9]+)$/,args:[reg(16),reg(8),uint(0,8,0)] }], // made this up. probably wrong
    "sub"  :[{ base:"00111---________", regex : /(r[0-7]),(#[0-9]+)$/, args:[reg(8),uint(0,8,0)] }, // move/compare/subtract immediate
              /*{ base:"10100---________", regex : /^([^,]+),pc,(#[0-9]+)$/,args:[reg(8),uint(0,8,2)] },*/
             { base:"101100001_______", regex : /^sp,(#[0-9]+)$/, args:[uint(0,7,2)] },
             { base:"00011-1___---___", regex : /^([^,]+),([^,]+),([^,]+)$/, args:[reg(0),reg(3),reg_or_immediate(6,10)] } ],

    "str"  :[{ base:"0101000---___---", regex : /(r[0-7]),\[(r[0-7]),(r[0-7])\]$/, args:[reg(0),reg(3),reg(6)] }, // 5.7 Format 7: load/store with register offset
             { base:"10010---________", regex : /(r[0-7]),\[sp,(#[0-9]+)\]$/, args:[reg(8),uint(0,8,2)] }, // 5.11 SP-relative store
             { base:"0110000000___---", regex : /(r[0-7]),\[(r[0-7])\]$/, args:[reg(0),reg(3)] }, // 5.9 Format 9: load/store with no offset
             { base:"0110000---___---", regex : /(r[0-7]),\[(r[0-7]),(#[0-9]+)\]$/, args:[reg(0),reg(3), uint(6,5,2)] }], // 5.9 Format 9: load/store with immediate offset
    "strb" :[{ base:"0101010---___---", regex : /(r[0-7]),\[(r[0-7]),(r[0-7])\]$/, args:[reg(0),reg(3),reg(6)] }, // 5.7 Format 7: load/store with register offset
             { base:"01110-----___---", regex : /(r[0-7]),\[(r[0-7]),(#[0-9]+)\]$/, args:[reg(0),reg(3), uint(6,5,0)] }], // 5.9 Format 9: load/store with immediate offset
    "strh" :[{ base:"0101001---___---", regex : /(r[0-7]),\[(r[0-7]),(r[0-7])\]$/, args:[reg(0),reg(3),reg(6)] }, // 5.7 Format 7: load/store with register offset
             { base:"10000-----___---", regex : /(r[0-7]),\[(r[0-7]),(#[0-9]+)\]$/, args:[reg(0),reg(3), uint(6,5,1)] }], // 5.9 Format 9: load/store with immediate offset
    "ldr"  :[{ base:"01001---________", regex : /(r[0-7]),\[pc,(#[0-9]+)\]$/, args:[reg(8),uint(0,8,2)] }, // 5.6 Format 6: PC-relative load
             { base:"10011---________", regex : /(r[0-7]),\[sp,(#[0-9]+)\]$/, args:[reg(8),uint(0,8,2)] }, // 5.11 SP-relative load
             { base:"01001---________", regex : /(r[0-7]),([a-zA-Z_][0-9a-zA-Z_]*)$/, args:[reg(8),uint(0,8,2)] }, // 5.6 Format 6: PC-relative load (using label)
             { base:"01001---________", regex : /(r[0-7]),([a-zA-Z_][0-9a-zA-Z_]*\+[0-9]+)$/, args:[reg(8),uint(0,8,2)] }, // 5.6 Format 6: PC-relative load (using label and maths - huge hack)
             { base:"0101100---___---", regex : /(r[0-7]),\[(r[0-7]),(r[0-7])\]$/, args:[reg(0),reg(3),reg(6)] }, // 5.7 Format 7: load/store with register offset
             { base:"0110100000___---", regex : /(r[0-7]),\[(r[0-7])\]$/, args:[reg(0),reg(3)] }, // 5.9 Format 9: load/store with no offset
             { base:"0110100---___---", regex : /(r[0-7]),\[(r[0-7]),(#[0-9]+)\]$/, args:[reg(0),reg(3), uint(6,5,2)] }], // 5.9 Format 9: load/store with immediate offset

    "ldrb" :[{ base:"0101110---___---", regex : /(r[0-7]),\[(r[0-7]),(r[0-7])\]$/, args:[reg(0),reg(3),reg(6)] }, // 5.7 Format 7: load/store with register offset
             { base:"01111-----___---", regex : /(r[0-7]),\[(r[0-7]),(#[0-9]+)\]$/, args:[reg(0),reg(3), uint(6,5,0)] }], // 5.9 Format 9: load/store with immediate offset
    "ldrsb":[{ base:"0101011---___---", regex : /(r[0-7]),\[(r[0-7]),(r[0-7])\]$/, args:[reg(0),reg(3),reg(6)] }], // 5.7 Format 7: load/store with register offset
    "ldrh" :[{ base:"0101101---___---", regex : /(r[0-7]),\[(r[0-7]),(r[0-7])\]$/, args:[reg(0),reg(3),reg(6)] }, // 5.7 Format 7: load/store with register offset
             { base:"10001-----___---", regex : /(r[0-7]),\[(r[0-7]),(#[0-9]+)\]$/, args:[reg(0),reg(3), uint(6,5,1)] }], // 5.9 Format 9: load/store with immediate offset
    "ldrsh":[{ base:"0101111---___---", regex : /(r[0-7]),\[(r[0-7]),(r[0-7])\]$/, args:[reg(0),reg(3),reg(6)] }], // 5.7 Format 7: load/store with register offset
    "mov"  :[{ base:"00100---________", regex : /(r[0-7]),(#[0-9]+)$/, args:[reg(8),uint(0,8,0)] }, // move/compare/subtract immediate
             { base:"0001110000---___", regex : /(r[0-7]),(r[0-7])$/, args:[reg(0),reg(3)] }, // actually 'add Rd,Rs,#0'
             { base:"0100011010---101", regex : /sp,(r[0-7])$/, args:[reg(3)] }], // made up again
    "movs" :[{ base:"00100---________", regex : /(r[0-7]),(#[0-9]+)$/, args:[reg(8),uint(0,8,0)] }], // is this even in thumb?
    "movw" :[{ base:"11110-100100----0___----________", regex : /(r[0-7]),(#[0-9]+)$/, args:[reg4(8),thumb2_immediate_t3] }],

    ".word":[{ base:"--------------------------------", regex : /0x([0-9A-Fa-f]+)$/, args:[function(v){v=parseInt(v,16);return (v>>16)|(v<<16);}] },
             { base:"--------------------------------", regex : /([0-9]+)$/, args:[function(v){v=parseInt(v);return (v>>16)|(v<<16);}] }],
    "nop"  :[{ base:"0100011011000000", regex : "", args:[] }], // MOV R8,R8 (Format 5)
    "cpsie"  :[{ base:"1011011001100010", regex : /i/, args:[] }], // made up again
    "cpsid"  :[{ base:"1011011001110010", regex : /i/, args:[] }], // made up again
    "wfe"    :[{ base:"1011111100100000", regex : /i/, args:[] }],
    "wfi"    :[{ base:"1011111100110000", regex : /i/, args:[] }],

   // for this, uint needs to work without a hash
//    "swi"    :[{ base:"11011111--------", regex : /([0-9]+)$/, args:[uint(0,8,0)] }], // Format 17: software interrupt
  };


  function getOpCode(binary) {
   var base = "";
   for (var b in binary)
     if ("-_".indexOf(binary[b])>=0)
       base += "0";
     else
       base += binary[b];
   var opCode = parseInt(base,2);
   if (opCode<0) opCode = opCode + 2147483648.0;
   return opCode;
  }

  function assemble_internal(asmLines, wordCallback, labels) {
    var addr = 0;
    var newLabels = {};
    asmLines.forEach(function (line) {
      // setup labels
      if (labels!==undefined)
        labels["PC"] = addr+4;
      // handle line
      line = line.trim();
      if (line=="") return;
      if (line.substr(-1)==":") {
        // it's a label
        var labelName = line.substr(0,line.length-1);
        if (newLabels[labelName] !== undefined)
          throw "Label '"+labelName+"' was already defined";
        newLabels[labelName] = addr;
        return;
      }

      // parse instruction
      var firstArgEnd = line.indexOf("\t");
      if (firstArgEnd<0) firstArgEnd = line.indexOf(" ");
      if (firstArgEnd<0) firstArgEnd=line.length;
      var opName = line.substr(0,firstArgEnd);
      var args = line.substr(firstArgEnd).replace(/[ \t]/g,"").trim();
      if (!(opName in ops)) throw "Unknown Op '"+opName+"' in '"+line+"'";
      // search ops
      var found = false;
      for (var n in ops[opName]) {
        var op = ops[opName][n];
        var m;
        if (m=args.match(op.regex)) {
          found = true;
          // work out the base opcode
          var opCode = getOpCode(op.base);

          if (labels!==undefined) {
            /* If we're properly generating code, parse each argument.
             Otherwise we're just working out the size in bytes of each line
             and we can skip this */
            for (var i in op.args) {
              //console.log(i,m[(i|0)+1]);
              var argFunction = op.args[i];
              var bits = argFunction(m[(i|0)+1], labels);
              //console.log("  ",bits)
              opCode |= bits;
            }
          }

          if (op.base.length > 16) {
            wordCallback((opCode>>>16));
            wordCallback(opCode&0xFFFF);
            addr += 4;
          } else {
            wordCallback(opCode);
            addr += 2;
          }
          break;
        }
      }
      // now parse args
      if (!found)
        throw "Unknown arg style '"+args+"' in '"+line+"'";
    });
    return newLabels;
  }

  function assemble(asmLines, wordCallback) {
    // remove line comments
    asmLines = asmLines.map(function(l) {
      var i;
      i = l.indexOf(";");
      if (i>=0) l = l.substr(0,i);
      i = l.indexOf("//");
      if (i>=0) l = l.substr(0,i);
      return l;
    });
    // process assembly to grab labels
    var labels = assemble_internal(asmLines, function() {}, undefined);
    console.log("Assembler Labels:",labels);
    // process again to actually get an output
    assemble_internal(asmLines, wordCallback, labels);
  }

//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------

  function init() {
    // When code is sent to Espruino, search it for bits of assembler and then assemble them
    Espruino.addProcessor("transformForEspruino", function(code, callback) {
      findASMBlocks(code, "", callback);
    });
    // When a module is sent to Espruino...
    Espruino.addProcessor("transformModuleForEspruino", function(module, callback) {
      findASMBlocks(module.code, " in "+module.name, function(code) {
        module.code = code;
        callback(module);
      });
    });
  }

  function assembleBlock(asmLines, description) {
    var machineCode = [];
    try {
      assemble(asmLines, function(word) { machineCode.push("0x"+word.toString(16)); });
    } catch (err) {
      console.log("Assembler failed: "+err+description);
      Espruino.Core.Notifications.error("Assembler failed: "+err+description);
      return undefined;
    }

    return machineCode;
  }

  /* Finds instances of 'E.asm' and replaces them */
  function findASMBlocks(code, description, callback){

    function match(str, type) {
      if (str!==undefined && tok.str!=str) {
        Espruino.Core.Notifications.error("Expecting '"+str+"' but got '"+tok.str+description+"'. Should have E.asm('arg spec', 'asmline1', ..., 'asmline2'");
        return false;
      }
      if (type!==undefined && tok.type!=type) {
        Espruino.Core.Notifications.error("Expecting a "+type+" but got "+tok.type+description+". Should have E.asm('arg spec', 'asmline1', ..., 'asmline2'");
        return false;
      }
      tok = lex.next();
      return true;
    }

    var foundAsm = true;
    var assembledCode = "";
    var asmBlockCount = 1;
    while (foundAsm) {
      foundAsm = false;
      var lex = Espruino.Core.Utils.getLexer(code);
      var tok = lex.next();
      var state = 0;
      var startIndex = -1;
      while (tok!==undefined) {
        if (state==0 && tok.str=="E") { state=1; startIndex = tok.startIdx; tok = lex.next();
        } else if (state==1 && tok.str==".") { state=2; tok = lex.next();
        } else if (state==2 && (tok.str=="asm")) { state=3; tok = lex.next();
        } else if (state==3 && (tok.str=="(")) {
          foundAsm = true;
          state=0;
          tok = lex.next(); // skip (
          var argSpec = tok.value;
          var asmLines = [];
          if (!match(undefined,"STRING")) return;
          if (!match(",",undefined)) return;
          while (tok && tok.str!=")") {
            var lines = tok.value.split("\n");
            lines.forEach(function(l) {
              asmLines.push(l);
            });
            if (!match(undefined,"STRING")) return;
            if (tok.str!=")")
              if (!match(",",undefined)) return;
          }
          if (!match(")",undefined)) return;
          var endIndex = tok.endIdx;

          var machineCode = assembleBlock(asmLines, description);
          //console.log(machineCode);
          if (machineCode===undefined) return; // There was an error - just leave and don't try to flash
          var raw = "";
          machineCode.forEach(function(short) {
            var v = parseInt(short,16);
            raw += String.fromCharCode(v&255,v>>8);
          });
          var base64 = base64_encode(raw);
          code = code.substr(0,startIndex) +
                 'E.nativeCall(1, '+JSON.stringify(argSpec)+', atob('+JSON.stringify(base64)+'))'+
                 code.substr(endIndex);
          asmBlockCount++;

          // Break out
          tok = undefined;
        } else {
          state = 0;
          tok = lex.next();
        }
      }
    }

    if (assembledCode!="") {
      code = "var ASM_BASE=process.memory().stackEndAddress;\n"+
             assembledCode+
             code;
    }
    callback(code);
  };


  Espruino.Plugins.Assembler = {
    init : init,
  };
}());
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
 
 ------------------------------------------------------------------
  Try and get any URLS that are from GitHub
 ------------------------------------------------------------------
**/
"use strict";
(function(){
  
  function init() {
    Espruino.addProcessor("getURL", getGitHub);      
  }
  
  function getGitHub(data, callback) {
    var match = data.url.match(/^https?:\/\/github.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.*)$/);
    if (match) {
      var git = {
          owner : match[1],
          repo : match[2],
          branch : match[3],
          path : match[4]
          };
      
      var url = "https://raw.githubusercontent.com/"+git.owner+"/"+git.repo+"/"+git.branch+"/"+git.path;
      console.log("Found GitHub", JSON.stringify(git));
      callback({url: url});
    } else
      callback(data); // no match - continue as normal
  }

  Espruino.Plugins.GetGitHub = {
    init : init,
  };
}());
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Pretokenise code before it uploads
 ------------------------------------------------------------------
**/
"use strict";
(function(){
  if (typeof acorn == "undefined") {
    console.log("pretokenise: needs acorn, disabling.");
    return;
  }

  function init() {
    Espruino.Core.Config.add("PRETOKENISE", {
      section : "Minification",
      name : "Pretokenise code before upload (BETA)",
      description : "All whitespace and comments are removed and all reserved words are converted to tokens before upload. This means a faster upload, less memory used, and increased performance (+10%) at the expense of code readability.",
      type : "boolean",
      defaultValue : false
    });

    // When code is sent to Espruino, search it for modules and add extra code required to load them
    Espruino.addProcessor("transformForEspruino", function(code, callback) {
      if (!Espruino.Config.PRETOKENISE) return callback(code);
      pretokenise(code, callback);
    });
   // When code is sent to Espruino, search it for modules and add extra code required to load them
    Espruino.addProcessor("transformModuleForEspruino", function(module, callback) {
      if (!Espruino.Config.PRETOKENISE) return callback(module);
      pretokenise(module.code, function(code) {
        module.code = code;
        callback(module);
      });
    });
  }


  var LEX_OPERATOR_START = 138;
  var TOKENS =  [// plundered from jslex.c
/* LEX_EQUAL      :   */ "==",
/* LEX_TYPEEQUAL  :   */ "===",
/* LEX_NEQUAL     :   */ "!=",
/* LEX_NTYPEEQUAL :   */ "!==",
/* LEX_LEQUAL    :    */ "<=",
/* LEX_LSHIFT     :   */ "<<",
/* LEX_LSHIFTEQUAL :  */ "<<=",
/* LEX_GEQUAL      :  */ ">=",
/* LEX_RSHIFT      :  */ ">>",
/* LEX_RSHIFTUNSIGNED */ ">>>",
/* LEX_RSHIFTEQUAL :  */ ">>=",
/* LEX_RSHIFTUNSIGNEDEQUAL */ ">>>=",
/* LEX_PLUSEQUAL   :  */ "+=",
/* LEX_MINUSEQUAL  :  */ "-=",
/* LEX_PLUSPLUS :     */ "++",
/* LEX_MINUSMINUS     */ "--",
/* LEX_MULEQUAL :     */ "*=",
/* LEX_DIVEQUAL :     */ "/=",
/* LEX_MODEQUAL :     */ "%=",
/* LEX_ANDEQUAL :     */ "&=",
/* LEX_ANDAND :       */ "&&",
/* LEX_OREQUAL :      */ "|=",
/* LEX_OROR :         */ "||",
/* LEX_XOREQUAL :     */ "^=",
/* LEX_ARROW_FUNCTION */ "=>",
// reserved words
/*LEX_R_IF :       */ "if",
/*LEX_R_ELSE :     */ "else",
/*LEX_R_DO :       */ "do",
/*LEX_R_WHILE :    */ "while",
/*LEX_R_FOR :      */ "for",
/*LEX_R_BREAK :    */ "break",
/*LEX_R_CONTINUE   */ "continue",
/*LEX_R_FUNCTION   */ "function",
/*LEX_R_RETURN     */ "return",
/*LEX_R_VAR :      */ "var",
/*LEX_R_LET :      */ "let",
/*LEX_R_CONST :    */ "const",
/*LEX_R_THIS :     */ "this",
/*LEX_R_THROW :    */ "throw",
/*LEX_R_TRY :      */ "try",
/*LEX_R_CATCH :    */ "catch",
/*LEX_R_FINALLY :  */ "finally",
/*LEX_R_TRUE :     */ "true",
/*LEX_R_FALSE :    */ "false",
/*LEX_R_NULL :     */ "null",
/*LEX_R_UNDEFINED  */ "undefined",
/*LEX_R_NEW :      */ "new",
/*LEX_R_IN :       */ "in",
/*LEX_R_INSTANCEOF */ "instanceof",
/*LEX_R_SWITCH     */ "switch",
/*LEX_R_CASE       */ "case",
/*LEX_R_DEFAULT    */ "default",
/*LEX_R_DELETE     */ "delete",
/*LEX_R_TYPEOF :   */ "typeof",
/*LEX_R_VOID :     */ "void",
/*LEX_R_DEBUGGER : */ "debugger",
/*LEX_R_CLASS :    */ "class",
/*LEX_R_EXTENDS :  */ "extends",
/*LEX_R_SUPER :  */   "super",
/*LEX_R_STATIC :   */ "static",
/*LEX_R_OF    :   */  "of"
];


  function pretokenise(code, callback) {
    var lex = (function() {
      var t = acorn.tokenizer(code);
      return { next : function() {
        var tk = t.getToken();
        if (tk.type.label=="eof") return undefined;
        var tp = "?";
        if (tk.type.label=="template" || tk.type.label=="string") tp="STRING";
        if (tk.type.label=="num") tp="NUMBER";
        if (tk.type.keyword || tk.type.label=="name") tp="ID";
        if (tp=="?" && tk.start+1==tk.end) tp="CHAR";
        return {
          startIdx : tk.start,
          endIdx : tk.end,
          str : code.substring(tk.start, tk.end),
          type : tp
        };
      }};
    })();
    var brackets = 0;
    var resultCode = "";
    var lastIdx = 0;
    var lastTok = {str:""};
    var tok = lex.next();
    while (tok!==undefined) {
      var previousString = code.substring(lastIdx, tok.startIdx);
      var tokenString = code.substring(tok.startIdx, tok.endIdx);
      var tokenId = LEX_OPERATOR_START + TOKENS.indexOf(tokenString);
      if (tokenId<LEX_OPERATOR_START) tokenId=undefined;
      //console.log("prev "+JSON.stringify(previousString)+"   next "+tokenString);

      if (tok.str=="(" || tok.str=="{" || tok.str=="[") brackets++;
      // TODO: check for eg. two IDs/similar which can't be merged without a space
      // preserve newlines at root scope to avoid us filling up the command buffer all at once
      if (brackets==0 && previousString.indexOf("\n")>=0)
        resultCode += "\n";
      if (tok.str==")" || tok.str=="}" || tok.str=="]") brackets--;
      // if we have a token for something, use that - else use the string
      if (tokenId) {
        //console.log(JSON.stringify(tok.str)+" => "+tokenId);
        resultCode += String.fromCharCode(tokenId);
        tok.type = "TOKENISED";
      } else {
        if ((tok.type=="ID" || tok.type=="NUMBER") &&
            (lastTok.type=="ID" || lastTok.type=="NUMBER"))
          resultCode += " ";
        resultCode += tokenString;
      }
      // next
      lastIdx = tok.endIdx;
      lastTok = tok;
      tok = lex.next();
    }
    callback(resultCode);
  }

  Espruino.Plugins.Pretokenise = {
    init : init,
  };
}());
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk),
                Victor Nakoryakov (victor@amperka.ru)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Wrap whole code in `onInit` function before send and save() it
  after upload. Wrapping is necessary to avoid execution start
  before save() is executed
 ------------------------------------------------------------------
**/
"use strict";
(function(){

  function init() {
    Espruino.Core.Config.add("SAVE_ON_SEND", {
      section : "Communications",
      name : "Save on Send",
      descriptionHTML : 'How should code be uploaded? See <a href="http://www.espruino.com/Saving" target="_blank">espruino.com/Saving</a> for more information.<br>'+
                        "<b>NOTE:</b> Avoid 'Direct to flash, even after <code>reset()</code>' for normal development - it can make it hard to recover if your code crashes the device.",
      type : {
        0: "To RAM (default) - execute code while uploading. Use 'save()' to save a RAM image to Flash",
        1: "Direct to Flash (execute code at boot)",
        2: "Direct to Flash (execute code at boot, even after 'reset()') - USE WITH CARE",
        3: "To Storage File (see 'File in Storage to send to')",
      },
      defaultValue : 0
    });
    Espruino.Core.Config.add("SAVE_STORAGE_FILE", {
      section : "Communications",
      name : "Send to File in Storage",
      descriptionHTML : "If <code>Save on Send</code> is set to <code>To Storage File</code>, this is the name of the file to write to.",
      type : "string",
      defaultValue : "myapp"
    });
    Espruino.Core.Config.add("LOAD_STORAGE_FILE", {
      section : "Communications",
      name : "Load after saving",
      descriptionHTML : "This applies only if saving to Flash (not RAM)",
      type : {
        0: "Don't load",
        1: "Load default application",
        2: "Load the Storage File just written to"
      },
      defaultValue : 2
    });
    Espruino.addProcessor("transformForEspruino", function(code, callback) {
      wrap(code, callback);
    });
  }

  function wrap(code, callback) {
    var isFlashPersistent = Espruino.Config.SAVE_ON_SEND == 2;
    var isStorageUpload = Espruino.Config.SAVE_ON_SEND == 3;
    var isFlashUpload = Espruino.Config.SAVE_ON_SEND == 1 || isFlashPersistent || isStorageUpload;
    if (!isFlashUpload) return callback(code);

    // Check environment vars
    var hasStorage = false;
    var ENV = Espruino.Core.Env.getData();
    if (ENV &&
        ENV.VERSION_MAJOR &&
        ENV.VERSION_MINOR!==undefined) {
      if (ENV.VERSION_MAJOR>1 ||
          ENV.VERSION_MINOR>=96) {
        hasStorage = true;
      }
    }

    //
    console.log("Uploading "+code.length+" bytes to flash");
    if (!hasStorage) { // old style
      if (isStorageUpload) {
        Espruino.Core.Notifications.error("You have pre-1v96 firmware - unable to upload to Storage");
        code = "";
      } else {
        Espruino.Core.Notifications.error("You have pre-1v96 firmware. Upload size is limited by available RAM");
        code = "E.setBootCode("+JSON.stringify(code)+(isFlashPersistent?",true":"")+");load()\n";
      }
    } else { // new style
      var filename;
      if (isStorageUpload)
        filename = Espruino.Config.SAVE_STORAGE_FILE;
      else
        filename = isFlashPersistent ? ".bootrst" : ".bootcde";
      if (!filename || filename.length>28) {
        Espruino.Core.Notifications.error("Invalid Storage file name "+JSON.stringify(filename));
        code = "";
      } else {
        var CHUNKSIZE = 1024;
        var newCode = [];
        var len = code.length;
        newCode.push('require("Storage").write("'+filename+'",'+JSON.stringify(code.substr(0,CHUNKSIZE))+',0,'+len+');');
        for (var i=CHUNKSIZE;i<len;i+=CHUNKSIZE)
          newCode.push('require("Storage").write("'+filename+'",'+JSON.stringify(code.substr(i,CHUNKSIZE))+','+i+');');
        code = newCode.join("\n");
        if (Espruino.Config.LOAD_STORAGE_FILE==2 && isStorageUpload)
          code += "\nload("+JSON.stringify(filename)+")\n";
        else if (Espruino.Config.LOAD_STORAGE_FILE!=0)
          code += "\nload()\n";
      }
    }
    callback(code);
  }

  Espruino.Plugins.SaveOnSend = {
    init : init,
  };
}());
/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Ability to set the current time in Espruino
 ------------------------------------------------------------------
**/
"use strict";
(function(){

  function init() {
    Espruino.Core.Config.add("SET_TIME_ON_WRITE", {
      section : "Communications",
      name : "Set Current Time",
      description : "When sending code, set Espruino's clock to the current time",
      type : "boolean",
      defaultValue : true,
      onChange : function(newValue) {  }
    });

   // When code is sent to Espruino, append code to set the current time
   Espruino.addProcessor("transformForEspruino", function(code, callback) {
     if (Espruino.Config.SET_TIME_ON_WRITE) {
       var time = new Date();
       code = "setTime("+(time.getTime()/1000)+");E.setTimeZone("+(-time.getTimezoneOffset()/60)+")\n"+code;
     }
     callback(code);
   });
  }

  Espruino.Plugins.SetTime = {
    init : init,
  };
}());
Espruino.transform = function(code, options) {
  return new Promise(function(resolve,reject) {
    Object.keys(options).forEach(function(key) {
      if (key==key.toUpperCase())
        Espruino.Config[key] = options[key];
    });
    if (options.builtinModules) {
      var d = Espruino.Core.Env.getData();
      d.MODULES = options.builtinModules;
    }

    Espruino.callProcessor("transformForEspruino", code, resolve);
  });
};

if ("undefined"==typeof document) Espruino.init();
if ("undefined"!=typeof module)
  module.exports = Espruino;

