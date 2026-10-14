/* Works out which map areas are needed to cover everything within
a given distance of a route, split into areas small enough to upload.

Areas are {zoom,x,y,width,height} in OpenStreetMap pixels at that zoom,
aligned to a grid of Bangle.js tiles so neighbouring areas join seamlessly. */

/* exported RoutePlan */
const RoutePlan = (function() {
  const OSM_TILE_SIZE = 256;
  const EARTH_RADIUS = 6378137;
  const LAT_MAX = 85.0511287798;

  function worldSize(zoom) {
    return OSM_TILE_SIZE * Math.pow(2, zoom);
  }

  function project(lat, lon, zoom) {
    const s = Math.sin(Math.max(-LAT_MAX, Math.min(LAT_MAX, lat)) * Math.PI / 180);
    return {
      x : (lon + 180) / 360 * worldSize(zoom),
      y : (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * worldSize(zoom)
    };
  }

  function metresPerPixel(lat, zoom) {
    return 2 * Math.PI * EARTH_RADIUS * Math.cos(lat * Math.PI / 180) / worldSize(zoom);
  }

  function distanceToSegment(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const lengthSq = dx*dx + dy*dy;
    const t = lengthSq ? Math.max(0, Math.min(1, ((p.x - a.x)*dx + (p.y - a.y)*dy) / lengthSq)) : 0;
    return Math.hypot(p.x - (a.x + t*dx), p.y - (a.y + t*dy));
  }

  function distanceToBox(p, box) {
    return Math.hypot(
      Math.max(box.x0 - p.x, 0, p.x - box.x1),
      Math.max(box.y0 - p.y, 0, p.y - box.y1));
  }

  // Liang-Barsky clipping
  function segmentCrossesBox(a, b, box) {
    const dx = b.x - a.x, dy = b.y - a.y;
    let t0 = 0, t1 = 1;
    return [[-dx, a.x - box.x0], [dx, box.x1 - a.x], [-dy, a.y - box.y0], [dy, box.y1 - a.y]].every(([p, q]) => {
      if (p === 0) return q >= 0;
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      return t0 <= t1;
    });
  }

  function segmentDistanceToBox(a, b, box) {
    if (segmentCrossesBox(a, b, box)) return 0;
    const corners = [{x:box.x0, y:box.y0}, {x:box.x1, y:box.y0}, {x:box.x0, y:box.y1}, {x:box.x1, y:box.y1}];
    return Math.min(distanceToBox(a, box), distanceToBox(b, box),
      ...corners.map(corner => distanceToSegment(corner, a, b)));
  }

  // Grid tiles within radiusMetres of the route, in the order the route first reaches them
  function coveredTiles(segments, zoom, radiusMetres, tileSize) {
    const tiles = {};
    segments.forEach(segment => {
      const points = segment.map(pt => project(pt.lat, pt.lon, zoom));
      points.forEach((a, i) => {
        const b = points[i+1] || a;
        const radius = radiusMetres / metresPerPixel(segment[i].lat, zoom);
        for (let tx = Math.floor((Math.min(a.x, b.x) - radius) / tileSize); tx*tileSize <= Math.max(a.x, b.x) + radius; tx++) {
          for (let ty = Math.floor((Math.min(a.y, b.y) - radius) / tileSize); ty*tileSize <= Math.max(a.y, b.y) + radius; ty++) {
            const key = tx + "," + ty;
            const box = {x0:tx*tileSize, y0:ty*tileSize, x1:(tx+1)*tileSize, y1:(ty+1)*tileSize};
            if (!(key in tiles) && segmentDistanceToBox(a, b, box) <= radius)
              tiles[key] = {x:tx, y:ty};
          }
        }
      });
    });
    return Object.values(tiles);
  }

  // Groups tiles into areas of at most tilesPerArea x tilesPerArea tiles
  function groupIntoAreas(tiles, zoom, tileSize, tilesPerArea) {
    const groups = {};
    tiles.forEach(tile => {
      const key = Math.floor(tile.x / tilesPerArea) + "," + Math.floor(tile.y / tilesPerArea);
      (groups[key] = groups[key] || []).push(tile);
    });
    return Object.values(groups).map(group => {
      const xs = group.map(tile => tile.x), ys = group.map(tile => tile.y);
      const x = Math.min(...xs), y = Math.min(...ys);
      return {
        zoom : zoom,
        x : x * tileSize,
        y : y * tileSize,
        width : (Math.max(...xs) - x + 1) * tileSize,
        height : (Math.max(...ys) - y + 1) * tileSize
      };
    });
  }

  /* options = {zoom, radius (metres), tileSize (pixels), tilesPerArea}
  Returns areas in route order, so the first area contains the start */
  function areasFor(segments, options) {
    const tiles = coveredTiles(segments, options.zoom, options.radius, options.tileSize);
    return groupIntoAreas(tiles, options.zoom, options.tileSize, options.tilesPerArea);
  }

  return {
    areasFor : areasFor
  };
})();
