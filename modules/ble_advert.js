var advertise = function (options) {
    var clone = function (obj) {
        if (Array.isArray(obj)) {
            return obj.map(clone);
        }
        else if (typeof obj === "object") {
            var r = {};
            for (var k in obj) {
                r[k] = clone(obj[k]);
            }
            return r;
        }
        return obj;
    };
    if (process.env.VERSION >= "2.26") {
        options = options || {};
        if (!options.manufacturer)
            options.manufacturer = false;
    }
    var adv = clone(Bangle.bleAdvert);
    try {
        NRF.setAdvertising(adv, options);
    }
    catch (e) {
        if (e.toString().includes("INVALID_LENGTH")) {
            options.showName = false;
            try {
                NRF.setAdvertising(adv, options);
            }
            catch (e) {
                console.log("ble_advert error", e);
            }
        }
    }
};
var manyAdv = function (bleAdvert) {
    return Array.isArray(bleAdvert) && typeof bleAdvert[0] === "object";
};
exports.set = function (id, advert, options) {
    var _a, _b, _c;
    var bangle = Bangle;
    if (manyAdv(bangle.bleAdvert)) {
        var found = false;
        var obj = void 0;
        for (var _i = 0, _d = bangle.bleAdvert; _i < _d.length; _i++) {
            var ad = _d[_i];
            if (Array.isArray(ad))
                continue;
            obj = ad;
            if (ad[id]) {
                ad[id] = advert;
                found = true;
                break;
            }
        }
        if (!found) {
            if (obj)
                obj[id] = advert;
            else
                bangle.bleAdvert.push((_a = {}, _a[id] = advert, _a));
        }
    }
    else if (bangle.bleAdvert) {
        if (Array.isArray(bangle.bleAdvert)) {
            bangle.bleAdvert = [bangle.bleAdvert, (_b = {}, _b[id] = advert, _b)];
        }
        else {
            bangle.bleAdvert[id] = advert;
        }
    }
    else {
        bangle.bleAdvert = (_c = {}, _c[id] = advert, _c);
    }
    advertise(options);
};
exports.push = function (adv, options) {
    var bangle = Bangle;
    if (manyAdv(bangle.bleAdvert)) {
        bangle.bleAdvert.push(adv);
    }
    else if (bangle.bleAdvert) {
        bangle.bleAdvert = [bangle.bleAdvert, adv];
    }
    else {
        bangle.bleAdvert = [adv, {}];
    }
    advertise(options);
};
exports.remove = function (id, options) {
    var bangle = Bangle;
    if (manyAdv(bangle.bleAdvert)) {
        var i = 0;
        for (var _i = 0, _a = bangle.bleAdvert; _i < _a.length; _i++) {
            var ad = _a[_i];
            if (Array.isArray(ad))
                continue;
            if (ad[id]) {
                delete ad[id];
                if (Object.keys(ad).length === 0)
                    bangle.bleAdvert.splice(i, 1);
                break;
            }
            i++;
        }
    }
    else if (bangle.bleAdvert) {
        if (!Array.isArray(bangle.bleAdvert))
            delete bangle.bleAdvert[id];
    }
    advertise(options);
};
