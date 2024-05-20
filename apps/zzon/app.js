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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // function createAndUploadZoneArea(watch, zoneName, centerLat, centerLon, radius) {
  //   let newZone = {
  //     name: zoneName,
  //     center: { lat: centerLat, lon: centerLon },
  //     radius: radius
  //   };
  //   watch.uploadZoneArea(newZone, (error, response) => {
  //     if (error) {
  //       console.log('Error uploading zone area:', error);
  //     } else {
  //       console.log('Zone area uploaded successfully:', response);
  //     }
  //   });
  // }
  
  // const zoneName = 'Umm Al-Qura University Zone';
  // const centerLatitude = 21.4260; // replace with your latitude
  // const centerLongitude = 39.8262; // replace with your longitude
  // const radius = 0.05; // replace with your radius
  
  // bangalWatch.connect('your-watch-id', (error, watch) => {
  //   if (error) {
  //     console.log('Error connecting to watch:', error);
  //   } else {
  //     createAndUploadZoneArea(watch, zoneName, centerLatitude, centerLongitude, radius);
  //   }
  // });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  //   var R = 6371; // Radius of the earth in km
  //   var dLat = deg2rad(lat2 - lat1);
  //   var dLon = deg2rad(lon2 - lon1); 
  //   var a = 
  //     Math.sin(dLat/2) * Math.sin(dLat/2) +
  //     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
  //     Math.sin(dLon/2) * Math.sin(dLon/2)
  //     ; 
  //   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  //   var d = R * c; // Distance in km
  //   return d;
  // }
  
  // function deg2rad(deg) {
  //   return deg * (Math.PI/180);
  // }
  
  // function createAndUploadZoneArea(watch, zoneName, centerLat, centerLon, radius) {
  //   let newZone = {
  //     name: zoneName,
  //     center: { lat: centerLat, lon: centerLon },
  //     radius: radius
  //   };
  //   watch.uploadZoneArea(newZone, (error, response) => {
  //     if (error) {
  //       console.log('Error uploading zone area:', error);
  //     } else {
  //       console.log('Zone area uploaded successfully:', response);
  //     }
  //   });
  // }
  
  // const zoneName = 'Umm Al-Qura University Zone';
  // const centerLatitude = 21.4260; // replace with your latitude
  // const centerLongitude = 39.8262; // replace with your longitude
  // const radius = 0.05; // replace with your radius in km
  
  // bangalWatch.connect('your-watch-id', (error, watch) => {
  //   if (error) {
  //     console.log('Error connecting to watch:', error);
  //   } else {
  //     createAndUploadZoneArea(watch, zoneName, centerLatitude, centerLongitude, radius);
  //     watch.on('location', (location) => {
  //       const distance = getDistanceFromLatLonInKm(centerLatitude, centerLongitude, location.lat, location.lon);
  //       if (distance > radius) {
  //         console.log('You are out of the zone');
  //       }
  //     });
  //   }
  // });

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

//   const Bangle = require('banglejs');
// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   var R = 6371; // Radius of the earth in km
//   var dLat = deg2rad(lat2 - lat1);
//   var dLon = deg2rad(lon2 - lon1); 
//   var a = 
//     Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
//     Math.sin(dLon/2) * Math.sin(dLon/2)
//     ; 
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
//   var d = R * c; // Distance in km
//   return d;
// }

// function deg2rad(deg) {
//   return deg * (Math.PI/180);
// }

// function createAndUploadZoneArea(watch, zoneName, centerLat, centerLon, radius) {
//   let newZone = {
//     name: zoneName,
//     center: { lat: centerLat, lon: centerLon },
//     radius: radius
//   };
//   watch.uploadZoneArea(newZone, (error, response) => {
//     if (error) {
//       console.log('Error uploading zone area:', error);
//     } else {
//       console.log('Zone area uploaded successfully:', response);
//     }
//   });
// }

// const zoneName = 'Your Zone';
// const radius = 0.05; // replace with your radius in km

// Bangle.connect('your-watch-id', (error, watch) => {
//   if (error) {
//     console.log('Error connecting to watch:', error);
//   } else {
//     watch.getGPS().then(location => {
//       const centerLatitude = location.lat;
//       const centerLongitude = location.lon;
//       createAndUploadZoneArea(watch, zoneName, centerLatitude, centerLongitude, radius);
//       watch.on('location', (location) => {
//         const distance = getDistanceFromLatLonInKm(centerLatitude, centerLongitude, location.lat, location.lon);
//         if (distance > radius) {
//           console.log('You are out of the zone');
//         }
//       });
//     });
//   }
// });
