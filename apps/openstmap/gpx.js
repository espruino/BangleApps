/* Reads the tracks and routes of a parsed GPX document
as a list of segments, each an array of {lat,lon} */

/* exported gpxToSegments */
function gpxToSegments(doc) {
  function pointsOf(parent, tagName) {
    return Array.from(parent.getElementsByTagName(tagName)).map(pt => ({
      lat : parseFloat(pt.getAttribute("lat")),
      lon : parseFloat(pt.getAttribute("lon"))
    })).filter(pt => isFinite(pt.lat) && isFinite(pt.lon));
  }
  const tracks = Array.from(doc.getElementsByTagName("trkseg")).map(seg => pointsOf(seg, "trkpt"));
  const routes = Array.from(doc.getElementsByTagName("rte")).map(rte => pointsOf(rte, "rtept"));
  return tracks.concat(routes).filter(segment => segment.length);
}
