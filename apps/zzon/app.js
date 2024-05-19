coordinates, replace with actual ones)
const ummAlQuraCoordinates = [
  { lat: 21.3353, lon: 39.8262 },
  { lat: 21.4260, lon: 39.8280 },
  { lat: 21.4245, lon: 39.8285 },
  { lat: 21.4230, lon: 39.8270 },
  { lat: 21.4255, lon: 39.8262 }
];
function createAndUploadZoneArea(watch, zoneName, coordinates) {
  let newZone = {
    name: zoneName,
    coordinates: coordinates
  };
  watch.uploadZoneArea(newZone, (error, response) => {
    if (error) {
      console.log('Error uploading zone area:', error);
    } else {
      console.log('Zone area uploaded successfully:', response);
    }
  });
}
const zoneName = 'Umm Al-Qura University Zone';
bangalWatch.connect('your-watch-id', (error, watch) => {
  if (error) {
    console.log('Error connecting to watch:', error);
  } else {
    createAndUploadZoneArea(watch, zoneName, ummAlQuraCoordinates);
  }
});
