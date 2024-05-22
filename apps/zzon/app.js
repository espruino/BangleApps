const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCCeZg-o1jX4x1wjuKVdngEkFWHDBVn-I0',
});
const bangalWatch = require('BANGLEJS2');

const ummAlQuraCoordinates = [
  { lat: 21.331115, lon: 39.946196 },
  { lat: 21.330865, lon: 39.946459 },
  { lat: 21.330215, lon: 39.945654 },
  { lat: 21.330485, lon: 39.945364 }
];

const radius = 0.05;

function createAndUploadZoneArea(watch, zoneName, coordinates, radius) {
  let newZone = {
    name: zoneName,
    coordinates: coordinates,
    radius: radius
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

bangalWatch.connect('zzon', (error, watch) => {
  if (error) {
    console.log('Error connecting to watch:', error);
  } else {
    createAndUploadZoneArea(watch, zoneName, ummAlQuraCoordinates, radius);
  }
});
