var oldRead = require("Storage").readJSON;
var monthAgo = Date.now() - 1000 * 86400 * 28;
var cache;
var ensureCache = function () {
    if (!cache) {
        cache = oldRead("popcon.cache.json", true);
        if (!cache)
            cache = {};
    }
    return cache;
};
var saveCache = function (orderChanged) {
    require("Storage").writeJSON("popcon.cache.json", cache);
    if (orderChanged) {
        var info = oldRead("popcon.info", true);
        info.cacheBuster = !info.cacheBuster;
        require("Storage").writeJSON("popcon.info", info);
    }
};
var sortCache = function () {
    var ents = Object.values(cache);
    ents.sort(function (a, b) {
        var n;
        var am = (a.last > monthAgo);
        var bm = (b.last > monthAgo);
        n = bm - am;
        if (n)
            return n;
        n = b.pop - a.pop;
        if (n)
            return n;
        n = b.last - a.last;
        if (n)
            return n;
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    });
    var i = 0;
    var orderChanged = false;
    for (var _i = 0, ents_1 = ents; _i < ents_1.length; _i++) {
        var ent = ents_1[_i];
        if (ent.sortorder !== i)
            orderChanged = true;
        ent.sortorder = i++;
    }
    return orderChanged;
};
require("Storage").readJSON = (function (fname, skipExceptions) {
    var _a;
    var j = oldRead(fname, skipExceptions);
    if (/\.info$/.test(fname)) {
        var cache_1 = ensureCache();
        var so = void 0;
        if (j.src && (so = (_a = cache_1[j.src]) === null || _a === void 0 ? void 0 : _a.sortorder) != null)
            j.sortorder = so;
        else
            j.sortorder = 99;
    }
    return j;
});
var oldLoad = load;
global.load = function (src) {
    if (src) {
        var cache_2 = ensureCache();
        var ent = cache_2[src] || (cache_2[src] = {
            pop: 0,
            last: 0,
            sortorder: -10,
        });
        ent.pop++;
        ent.last = Date.now();
        var orderChanged = sortCache();
        saveCache(orderChanged);
    }
    return oldLoad(src);
};
