const createXmlString = lines => {
  // Normalize input into an array of segments, each a list of point objects
  // Supported inputs:
  // 1) [[lon,lat,ele], ...]                         -> single segment
  // 2) [ [ [lon,lat,ele], ... ], [ [lon,lat,ele] ] ] -> multiple segments
  // 3) [{lat, long, time, heart_rate, speed, alt}, ...] -> single segment (new format)
  // 4) [ [ {..}, {..} ], [ {..} ] ]                    -> multiple segments (new format)
  const toPointObj = (p) => {
    if (p && typeof p === 'object' && !Array.isArray(p)) {
      // already object with possible fields
      return {
        lat: typeof p.lat === 'string' ? parseFloat(p.lat) : p.lat,
        long: typeof p.long === 'string' ? parseFloat(p.long) : p.long,
        alt: p.alt != null ? (typeof p.alt === 'string' ? parseFloat(p.alt) : p.alt) : undefined,
        time: p.time != null ? (typeof p.time === 'string' ? parseFloat(p.time) : p.time) : undefined,
        heart_rate: p.heart_rate != null ? (typeof p.heart_rate === 'string' ? parseFloat(p.heart_rate) : p.heart_rate) : undefined,
        speed: p.speed != null ? (typeof p.speed === 'string' ? parseFloat(p.speed) : p.speed) : undefined,
      };
    }
    // legacy array [lon, lat, ele]
    if (Array.isArray(p)) {
      return { lat: parseFloat(p[1]), long: parseFloat(p[0]), alt: p[2] != null ? parseFloat(p[2]) : undefined };
    }
    return undefined;
  };

  let segments = [];
  if (!Array.isArray(lines)) {
    segments = [];
  } else if (lines.length && Array.isArray(lines[0])) {
    // Could be [[lon,lat,ele], ...] or [ [ [lon,lat,ele], ... ], ...]
    if (lines[0].length && Array.isArray(lines[0][0])) {
      // multiple segments of arrays
      segments = lines.map(seg => seg.map(toPointObj));
    } else if (lines[0].length && (typeof lines[0][0] === 'number' || typeof lines[0][0] === 'string')) {
      // single segment of arrays
      segments = [lines.map(toPointObj)];
    } else if (lines[0] && typeof lines[0] === 'object' && !Array.isArray(lines[0])) {
      // single segment of objects nested in an array wrapper
      segments = [lines.map(toPointObj)];
    } else {
      segments = [];
    }
  } else if (lines.length && typeof lines[0] === 'object') {
    // single segment of objects
    segments = [lines.map(toPointObj)];
  } else {
    segments = [];
  }

  // Compute base time if any time values exist (seconds, relative). We'll base on current time.
  let firstTime = undefined;
  for (const seg of segments) {
    for (const p of seg) {
      if (p && typeof p.time === 'number' && !isNaN(p.time)) {
        firstTime = (firstTime === undefined) ? p.time : Math.min(firstTime, p.time);
      }
    }
  }
  const baseDate = new Date();

  let result = '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v2" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v2 http://www8.garmin.com/xmlschemas/TrackPointExtensionv2.xsd" version="1.1" creator="runtracker"><metadata/><trk><name></name><desc></desc>';
  result += segments.reduce((accum, curr) => {
    let segmentTag = '<trkseg>';
    segmentTag += curr.map((point) => {
      if (!point) return '';
      const lat = (point.lat != null) ? point.lat : undefined;
      const lon = (point.long != null) ? point.long : undefined;
      if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) return '';
      let s = `<trkpt lat="${lat}" lon="${lon}">`;
      if (point.alt != null && !isNaN(point.alt)) s += `<ele>${point.alt}</ele>`;
      if (point.time != null && firstTime != null && !isNaN(point.time)) {
        const dt = new Date(baseDate.getTime() + (point.time - firstTime) * 1000);
        s += `<time>${dt.toISOString()}</time>`;
      }
      // Extensions for HR and speed if provided
      const hrOk = point.heart_rate != null && !isNaN(point.heart_rate);
      const spOk = point.speed != null && !isNaN(point.speed);
      if (hrOk || spOk) {
        s += '<extensions><gpxtpx:TrackPointExtension>';
        if (hrOk) s += `<gpxtpx:hr>${Math.round(point.heart_rate)}</gpxtpx:hr>`;
        if (spOk) s += `<gpxtpx:speed>${point.speed}</gpxtpx:speed>`;
        s += '</gpxtpx:TrackPointExtension></extensions>';
      }
      s += '</trkpt>';
      return s;
    }).join('');
    segmentTag += '</trkseg>';
    return accum + segmentTag;
  }, '');
  result += '</trk></gpx>';
  return result;
}

window.gpx_manager = {
    "downloadGpxFile": function (
        lines,
        distance,
        units
    ) {
        const xml = createXmlString(lines);
        const url = 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(xml);
        const link = document.createElement('a');
        link.download = `${distance[distance.length - 1]}-${units}.gpx`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
    }
};