#!/usr/bin/nodejs --max-old-space-size=5500

// npm install geojson-vt
// docs: https://github.com/mapbox/geojson-vt
// output format: https://github.com/mapbox/vector-tile-spec/

const fs = require('fs');
const sphm = require('./sphericalmercator.js');
var split = require('geojson-vt');
const process = require('process');


// delme.json needs to be real file, symlink to geojson will not work

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

function clamp(i) {
    if (i<0)
        return 0;
    if (i>4095)
        return 4095;
    return i;
}

function binGeom(tile, geom) {
    let off = 1;
    let r = new Uint8Array(geom.length * 3 + off);
    let j = off;
    for (i = 0; i< geom.length; i++) {
        let x = geom[i][0];
        let y = geom[i][1];
        x = clamp(x);
        y = clamp(y);
        r[j++] = x >> 4;
        r[j++] = y >> 4;
        r[j++] = (x & 0x0f) + ((y & 0x0f) << 4);
    }

    return r;
}

function zoomPoint(tags) {
    var z = 99;

    if (tags.featurecla == "Admin-0 scale ranksscalerank") z = 2;
    if (tags.featurecla == "Admin-0 capital") z = 3;
    if (tags.featurecla == "Admin-1 capital") z = 4;
    if (tags.featurecla == "Populated place") z = 5;

    if (tags.place == "city") z = 4;
    if (tags.place == "town") z = 8;
    if (tags.place == "village") z = 10;

    return z;
}

var meta = {};
var ac = -1;
meta.attrs = [];
var a_town = ++ac;
meta.attrs[ac] = {};
meta.attrs[ac].type = 1;
var a_village = ++ac
meta.attrs[ac] = {};
meta.attrs[ac].type = 1;
meta.attrs[ac].properties = {};
meta.attrs[ac].properties["marker-color"] = "#800000";
var a_way = ++ac;
meta.attrs[ac] = {};
meta.attrs[ac].type = 2;
var a_secondary = ++ac;
meta.attrs[ac] = {};
meta.attrs[ac].type = 2;
meta.attrs[ac].properties = {};
meta.attrs[ac].properties.stroke = "#000040";
var a_tertiary = ++ac;
meta.attrs[ac] = {};
meta.attrs[ac].type = 2;
meta.attrs[ac].properties = {};
meta.attrs[ac].properties.stroke = "#000080";
var a_track = ++ac;
meta.attrs[ac] = {};
meta.attrs[ac].type = 2;
meta.attrs[ac].properties = {};
meta.attrs[ac].properties.stroke = "#404040";
var a_path = ++ac;
meta.attrs[ac] = {};
meta.attrs[ac].type = 2;
meta.attrs[ac].properties = {};
meta.attrs[ac].properties.stroke = "#408040";
var a_polygon = ++ac;
meta.attrs[ac] = {};
meta.attrs[ac].type = 3;
var a_forest = ++ac;
meta.attrs[ac] = {};
meta.attrs[ac].properties = {};
meta.attrs[ac].properties.fill = "#c0ffc0";
meta.attrs[ac].type = 3;
var a_water = ++ac;
meta.attrs[ac] = {};
meta.attrs[ac].properties = {};
meta.attrs[ac].properties.fill = "#c0c0ff";
meta.attrs[ac].type = 3;

function paintPoint(tags) {
    var p = {};

    if (tags.place == "city" || tags.place == "town") { p.attr = a_town; }
    if (tags.place == "village") { p.attr = a_village; p["marker-color"] = "#ff0000"; }

    return p;
}

function zoomWay(tags) {
    var z = 99;

    if (tags.scalerank == 0) z = 0;

    if (tags.highway == "motorway") z = 7;
    if (tags.highway == "primary") z = 9;
    if (tags.highway == "secondary") z = 13;
    if (tags.highway == "tertiary") z = 14;
    if (tags.highway == "unclassified") z = 15;
    if (tags.highway == "residential") z = 15;
    if (tags.highway == "track") z = 15;
    if (tags.highway == "path") z = 16;
    if (tags.highway == "footway") z = 16;

    return z;
}

function paintWay(tags) {
    var p = {};

    p.attr = a_way;
    if (tags.highway == "motorway" || tags.highway == "primary") /* ok */;
    if (tags.highway == "secondary" || tags.highway == "tertiary") { p.stroke = "#0000ff"; p.attr = a_secondary; }
    if (tags.highway == "tertiary" || tags.highway == "unclassified" || tags.highway == "residential") { p.stroke = "#00ff00"; p.attr = a_tertiary; }
    if (tags.highway == "track") { p.stroke = "#ff0000"; p.attr = a_track; }
    if (tags.highway == "path" || tags.highway == "footway") { p.stroke = "#800000"; p.attr = a_path; }

    return p;
}

function zoomPolygon(tags) {
    var z = 99;

    if (tags.scalerank == 0) z = 0;

    if (tags.landuse == "forest") z = 16;
    if (tags.natural == "water") z = 16;

    return z;
}

function paintPolygon(tags) {
    var p = {};

    p.attr = a_polygon;
    if (tags.landuse == "forest") { p.fill = "#c0ffc0"; p.attr = a_forest; }
    if (tags.natural == "water") { p.fill = "#c0c0ff"; p.attr = a_water; }

    if (tags.featurecla == "Admin-0 sovereignty") p.attr = a_way;

    return p;
}

function writeFeatures(name, feat)
{
    if (0) {
        var n = {};
        n.type = "FeatureCollection";
        n.features = feat;
    
        fs.writeFile(name+'.json', JSON.stringify(n), on_error);
    } else {
        if (feat.length > 0)
            fs.writeFile(name+'.json', JSON.stringify(feat), on_error);
    }
}

function btoa(s) {
    return Buffer.from(s).toString('base64');
}

// E.toString()

function toGjson(name, d, tile) {
    var cnt = 0;
    var feat = [];
    for (var a of d) {
        let f = {};        // geojson output
        let b = {};     // moving towards binary output 
        var zoom = 99;
        var p = {};
        var bin = [];
        if (!a.tags)
            a.tags = a.properties;
        f.properties = a.tags;
        f.type = "Feature";
        f.geometry = {};
        if (a.type == 1) {
            f.geometry.type = "Point";
            f.geometry.coordinates = convGeom(tile, a.geometry)[0];
            bin = binGeom(tile, a.geometry);
            zoom = zoomPoint(a.tags);
            p = paintPoint(a.tags);
        } else if (a.type == 2) {
            f.geometry.type = "LineString";
            f.geometry.coordinates = convGeom(tile, a.geometry[0]);
            bin = binGeom(tile, a.geometry[0]);
            zoom = zoomWay(a.tags);
            p = paintWay(a.tags);            
            if (zoom == 99) {
                f.geometry.type = "Polygon";
                zoom = zoomPolygon(a.tags);
                p = paintPolygon(a.tags);
            }
        } else if (a.type == 3) {
            f.geometry.type = "Polygon";
            f.geometry.coordinates = convGeom(tile, a.geometry[0]);
            bin = binGeom(tile, a.geometry[0]);
            zoom = zoomPolygon(a.tags);
            p = paintPolygon(a.tags);
        } else {
            console.log("Unknown type", a.type);
        }
        //zoom -= 4; // Produces way nicer map, at expense of space.
        if (tile.z < zoom)
            continue;
        f.properties = Object.assign({}, f.properties, p);
        //feat.push(f); FIXME
        bin[0] = p.attr;
        b.b = btoa(bin);
        b.tags = {};
        if (a.tags.name)
            b.tags.name = a.tags.name;
        if (a.tags.nameascii)
            b.tags.name = a.tags.nameascii;
        if (a.tags.sr_subunit)
            b.tags.name = a.tags.sr_subunit;
        
        //delete(a.tags.highway);
        //delete(a.tags.landuse);
        //delete(a.tags.natural);
        //delete(a.tags.place);
        //        b.properties = p
        feat.push(b);
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
meta.min_zoom = 0;
meta.max_zoom = 16; // HERE
                 // = 16 ... split3 takes > 30 minutes
                 // = 13 ... 2 minutes
if (process.argv[2] == "-h") {
    console.log("help here");
    process.exit(0);
}
if (process.argv[2] == "--maxz") {
    meta.max_zoom = 1*process.argv[3];
    console.log("... max zoom", meta.max_zoom);
}
if (process.argv[2] == "--world") {
    console.log("Loading world");
    meta.max_zoom = 4;
    var g_sovereign = require("./ne_10m_admin_0_sovereignty.json");
    var g_labels = require("./ne_10m_admin_0_label_points.json");
    var g_places = require("./ne_10m_populated_places_simple.json");

    gjs = {}
    gjs.type = "FeatureCollection";
    //gjs.features = g_sovereign.features + g_labels.features + g_places.features;
    gjs.features = g_sovereign.features.concat(g_labels.features).concat(g_places.features);
    console.log(gjs);
} else {
    console.log("Loading json");
    gjs = require("./delme.json");
}

var index = split(gjs, Object.assign({
    maxZoom: meta.max_zoom,
    indexMaxZoom: meta.max_zoom,
    indexMaxPoints: 0,
    tolerance: 10,
    buffer: 0,
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
