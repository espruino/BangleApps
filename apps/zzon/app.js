// const googleMapsClient = require('@google/maps').createClient({
//   key: 'AIzaSyCCeZg-o1jX4x1wjuKVdngEkFWHDBVn-I0',
// });
// const bangalWatch = require('BANGLEJS2');

// const ummAlQuraCoordinates = [
//   { lat: 21.331115, lon: 39.946196 },
//   { lat: 21.330865, lon: 39.946459 },
//   { lat: 21.330215, lon: 39.945654 },
//   { lat: 21.330485, lon: 39.945364 }
// ];

// const radius = 0.05;

// function createAndUploadZoneArea(watch, zoneName, coordinates, radius) {
//   let newZone = {
//     name: zoneName,
//     coordinates: coordinates,
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

// bangalWatch.connect('zzon', (error, watch) => {
//   if (error) {
//     console.log('Error connecting to watch:', error);
//   } else {
//     createAndUploadZoneArea(watch, zoneName, ummAlQuraCoordinates, radius);
//   }
// });
////////////////////////////////////////////////////////////////////////////////
npm install puppeteer
const puppeteer = require('puppeteer');

async function runMap() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set up the HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Google Maps Circle and Geofencing Example</title>
        <style>
            /* Set the size of the map */
            #map {
                height: 400px;
                width: 100%;
            }
            #message {
                font-size: 24px;
                margin: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Google Maps Circle and Geofencing Example</h1>
        <div id="you are out off the zone">Program is running...</div>
        <div id="map"></div>

        <script>
            // Function to create and append elements
            function createMapContainer() {
                // Create a div element to hold the map
                const mapDiv = document.createElement('div');
                mapDiv.id = 'map';
                mapDiv.style.height = '400px';
                mapDiv.style.width = '100%';

                // Append the map div to the body of the document
                document.body.appendChild(mapDiv);
            }

            // Load the Google Maps API script and initialize the map
            function initializeMap() {
                // Create a script element to load the Google Maps API
                const script = document.createElement('script');
                script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCCeZg-o1jX4x1wjuKVdngEkFWHDBVn-I0&callback=initializeMapCallback';
                script.async = true;
                script.defer = true;

                // Append the script element to the body to load the Google Maps API
                document.body.appendChild(script);
            }

            // Callback function to initialize the map
            function initializeMapCallback() {
                // Call the function to create the map container
                createMapContainer();

                // Create and initialize the map
                const map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: 21.331115, lng: 39.946196 }, // Updated coordinates
                    zoom: 12
                });

                // Create a circle overlay on the map
                const circle = new google.maps.Circle({
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#FF0000",
                    fillOpacity: 0.35,
                    map,
                    center: { lat: 21.331115, lng: 39.946196 }, // Updated coordinates
                    radius: 5000 // 5000 meters radius (5km)
                });

                // Check user's position when the page loads
                checkPosition(circle);

                // Watch user's position continuously
                navigator.geolocation.watchPosition((position) => {
                    const userLatLng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // Check if user is outside the circle
                    if (!google.maps.geometry.spherical.computeContainsLocation(userLatLng, circle)) {
                        alert("You've left the circle!");
                    }
                }, (error) => {
                    console.error("Error getting user's position:", error);
                });
            }

            // Check if user's position is initially outside the circle
            function checkPosition(circle) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const userLatLng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // Check if user is outside the circle
                    if (!google.maps.geometry.spherical.computeContainsLocation(userLatLng, circle)) {
                        alert("You're currently outside the circle!");
                    }
                }, (error) => {
                    console.error("Error getting user's position:", error);
                });
            }

            // Call the function to initialize the map
            initializeMap();
        </script>
    </body>
    </html>
    `;

    // Set the HTML content
    await page.setContent(htmlContent);

    // Take a screenshot of the page (optional)
    await page.screenshot({ path: 'map.png' });

    // Close the browser
    await browser.close();
}

// Run the function
runMap();
