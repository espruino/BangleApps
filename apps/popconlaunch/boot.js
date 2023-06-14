(function () {
    var oldRead = require("Storage").readJSON;
    var oneMonth = 1000 * 86400 * 28;
    var monthAgo = Date.now() - oneMonth;
    var cache;
    var ensureCache = function () {
        if (!cache) {
            cache = oldRead("popcon.cache.json", true);
            if (!cache)
                cache = {};
        }
        return cache;
    };
    var trimCache = function (cache) {
        var threeMonthsBack = Date.now() - oneMonth * 3;
        var del = [];
        for (var k in cache)
            if (cache[k].last < threeMonthsBack)
                del.push(k);
        for (var _i = 0, del_1 = del; _i < del_1.length; _i++) {
            var k = del_1[_i];
            delete cache[k];
        }
    };
    var saveCache = function (cache, orderChanged) {
        trimCache(cache);
        require("Storage").writeJSON("popcon.cache.json", cache);
        if (orderChanged) {
            var info = oldRead("popconlaunch.info", true) || { cacheBuster: true };
            info.cacheBuster = !info.cacheBuster;
            require("Storage").writeJSON("popconlaunch.info", info);
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
        if (j && /\.info$/.test(fname)) {
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
            saveCache(cache_2, orderChanged);
        }
        return oldLoad(src);
    };
})();
