{
    var oldRead_1 = require("Storage").readJSON;
    var monthAgo_1 = Date.now() - 1000 * 86400 * 28;
    var cache_1;
    var ensureCache_1 = function () {
        if (!cache_1) {
            cache_1 = oldRead_1("popcon.cache.json", true);
            if (!cache_1)
                cache_1 = {};
        }
        return cache_1;
    };
    var saveCache_1 = function (orderChanged) {
        require("Storage").writeJSON("popcon.cache.json", cache_1);
        if (orderChanged) {
            var info = oldRead_1("popcon.info", true);
            info.cacheBuster = !info.cacheBuster;
            require("Storage").writeJSON("popcon.info", info);
        }
    };
    var sortCache_1 = function () {
        var ents = Object.values(cache_1);
        ents.sort(function (a, b) {
            var n;
            var am = (a.last > monthAgo_1);
            var bm = (b.last > monthAgo_1);
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
        var j = oldRead_1(fname, skipExceptions);
        if (/\.info$/.test(fname)) {
            var cache_2 = ensureCache_1();
            var so = void 0;
            if (j.src && (so = (_a = cache_2[j.src]) === null || _a === void 0 ? void 0 : _a.sortorder) != null)
                j.sortorder = so;
            else
                j.sortorder = 99;
        }
        return j;
    });
    var oldLoad_1 = load;
    global.load = function (src) {
        if (src) {
            var cache_3 = ensureCache_1();
            var ent = cache_3[src] || (cache_3[src] = {
                pop: 0,
                last: 0,
                sortorder: -10,
            });
            ent.pop++;
            ent.last = Date.now();
            var orderChanged = sortCache_1();
            saveCache_1(orderChanged);
        }
        return oldLoad_1(src);
    };
}
