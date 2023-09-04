#!/usr/bin/nodejs --max-old-space-size=5500

// npm install geojson-vt
// docs: https://github.com/mapbox/geojson-vt
// output format: https://github.com/mapbox/vector-tile-spec/

const fs = require('fs');
const sphm = require('./sphericalmercator.js');
var split = require('geojson-vt')

// delme.json needs to be real file, symlink to geojson will not work
console.log("Loading json");
var gjs = require("./delme.json");

function tileToLatLon(x, y, z, x_, y_) {
    var [ w, s, e, n ] = merc.bbox(x, y, z);
    var lon = (e - w) * (x_ / 4096) + w;
    var lat = (n - s) * (1-(y_ / 4096)) + s;
    return [ lon, lat ];
}

function convGeom(tile, geom) {
    var g = [];
    for (i = 0; i< geom.length; i++) {
        var x = geom[i][0];
        var y = geom[i][1];
        var pos = tileToLatLon(tile.x, tile.y, tile.z, x, y);
        g.push(pos);
    }
    return g;
}

function zoomPoint(tags) {
    var z = 99;

    if (tags.place == "city") z = 4;
    if (tags.place == "town") z = 8;
    if (tags.place == "village") z = 10;

    return z;
}

function paintPoint(tags) {
    var p = {};

    if (tags.place == "village") p["marker-color"] = "#ff0000";

    return p;
}

function zoomWay(tags) {
    var z = 99;

    if (tags.highway == "motorway") z = 7;
    if (tags.highway == "primary") z = 9;
    if (tags.highway == "secondary") z = 13;
    if (tags.highway == "tertiary") z = 14;
    if (tags.highway == "unclassified") z = 16;
    if (tags.highway == "residential") z = 17;
    if (tags.highway == "track") z = 17;
    if (tags.highway == "path") z = 17;
    if (tags.highway == "footway") z = 17;

    return z;
}

function paintWay(tags) {
    var p = {};

    if (tags.highway == "motorway" || tags.highway == "primary") /* ok */;
    if (tags.highway == "secondary" || tags.highway == "tertiary") p.stroke = "#0000ff";
    if (tags.highway == "tertiary" || tags.highway == "unclassified" || tags.highway == "residential") p.stroke = "#00ff00";
    if (tags.highway == "track") p.stroke = "#ff0000";
    if (tags.highway == "path" || tags.highway == "footway") p.stroke = "#800000";

    return p;
}

function writeFeatures(name, feat)
{
    var n = {};
    n.type = "FeatureCollection";
    n.features = feat;
    
    fs.writeFile(name+'.json', JSON.stringify(n), on_error);
}

function toGjson(name, d, tile) {
    var cnt = 0;
    var feat = [];
    for (var a of d) {
        var f = {};
        var zoom = 99;
        var p = {};
        f.properties = a.tags;
        f.type = "Feature";
        f.geometry = {};
        if (a.type == 1) {
            f.geometry.type = "Point";
            f.geometry.coordinates = convGeom(tile, a.geometry)[0];
            zoom = zoomPoint(a.tags);
            p = paintPoint(a.tags);
        } else if (a.type == 2) {
            f.geometry.type = "LineString";
            f.geometry.coordinates = convGeom(tile, a.geometry[0]);
            zoom = zoomWay(a.tags);
            p = paintWay(a.tags);
        } else {
            //console.log("Unknown type", a.type);
        }
        //zoom -= 4; // Produces way nicer map, at expense of space.
        if (tile.z < zoom)
            continue;
        f.properties = Object.assign({}, f.properties, p);
        feat.push(f);
        var s = JSON.stringify(feat);
        if (s.length > 6000) {
            console.log("tile too big, splitting", cnt);
            writeFeatures(name+'-'+cnt++, feat);
            feat = [];
        }
    }
    writeFeatures(name+'-'+cnt, feat);
    return n;
}

function writeTile(name, d, tile) {
    toGjson(name, d, tile)
}

// By default, precomputes up to z30
var merc = new sphm({
    size: 256,
    antimeridian: true
});

console.log("Splitting data");
var meta = {}
meta.min_zoom = 0;
meta.max_zoom = 17; // HERE
                 // = 16 ... split3 takes > 30 minutes
                 // = 13 ... 2 minutes
var index = split(gjs, Object.assign({
    maxZoom: meta.max_zoom,
    indexMaxZoom: meta.max_zoom,
    indexMaxPoints: 0,
    tolerance: 30,
}), {});
console.log("Producing output");

var output = {};

function on_error(e) {
    if (e) { console.log(e); }
}

var num = 0;
for (const id in index.tiles) {
    const tile = index.tiles[id];
    const z = tile.z;
    console.log(num++, ":", tile.x, tile.y, z);
    var d = index.getTile(z, tile.x, tile.y).features;
    var n = `delme/z${z}-${tile.x}-${tile.y}` ;
    writeTile(n, d, tile)
}

fs.writeFile('delme/meta.json', JSON.stringify(meta), on_error);
