const EARTHRADIUS = 6371000; //km

function radians(a) {
    return a * Math.PI / 180;
}

function degrees(a) {
    let d = a * 180 / Math.PI;
    return (d + 360) % 360;
}

function toXY(a, origin) {
    let pt = {
        x: 0,
        y: 0
    };

    pt.x = EARTHRADIUS * radians(a.lon - origin.lon) * Math.cos(radians((a.lat + origin.lat) / 2));
    pt.y = EARTHRADIUS * radians(origin.lat - a.lat);
    return pt;
}

function arraytoXY(array, origin) {
    let out = [];
    for (var j in array) {
        let newpt = toXY(array[j], origin);
        out.push(newpt);
    }
    return out;
}

function angle(a, b) {
    let x = b.x - a.x;
    let y = b.y - a.y;
    return Math.atan2(-y, x);
}

function rotateVec(a, theta) {
    let pt = {
        x: 0,
        y: 0
    };
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    pt.x = c * a.x - s * a.y;
    pt.y = s * a.x + c * a.y;
    return pt;
}

function distance(a,b) {
    return Math.sqrt(Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2))
}

// https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
function downloadObjectAsJSON(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportObj); // must be stringified!!
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}