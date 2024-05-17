exports.set = function (id, advert, options) {
    var _a, _b;
    var bangle = Bangle;
    if (Array.isArray(bangle.bleAdvert)) {
        var found = false;
        for (var _i = 0, _c = bangle.bleAdvert; _i < _c.length; _i++) {
            var ad = _c[_i];
            if (ad[id]) {
                ad[id] = advert;
                found = true;
                break;
            }
        }
        if (!found)
            bangle.bleAdvert.push((_a = {}, _a[id] = advert, _a));
    }
    else if (bangle.bleAdvert) {
        bangle.bleAdvert[id] = advert;
    }
    else {
        bangle.bleAdvert = (_b = {},
            _b[id] = advert,
            _b);
    }
    NRF.setAdvertising(bangle.bleAdvert, options);
};
exports.remove = function (id, options) {
    var bangle = Bangle;
    if (Array.isArray(bangle.bleAdvert)) {
        var i = 0;
        for (var _i = 0, _a = bangle.bleAdvert; _i < _a.length; _i++) {
            var ad = _a[_i];
            if (ad[id]) {
                delete ad[id];
                var empty = true;
                for (var _ in ad) {
                    empty = false;
                    break;
                }
                if (empty)
                    bangle.bleAdvert.splice(i, 1);
                break;
            }
            i++;
        }
    }
    else if (bangle.bleAdvert) {
        delete bangle.bleAdvert[id];
    }
    NRF.setAdvertising(bangle.bleAdvert, options);
};
