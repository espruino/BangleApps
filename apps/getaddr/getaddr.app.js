// Set the API endpoint and parameters
const nominatimApi = 'https://nominatim.openstreetmap.org';
const locale = require('locale');
let lang = locale.name;

if (lang.toLowerCase() === 'system') {
  lang = 'en';
} else {
  lang = lang.substring(0, 2);
}

const params = {
  format: 'json',
  addressdetails: 1,
  zoom: 18,
  extratags: 1
};

// Function to break a string into lines
function breakStringIntoLines(str, maxWidth) {
  const words = str.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if (currentLine.length + word.length + 1 > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      if (currentLine!== '') {
        currentLine +=' ';
      }
      currentLine += word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Function to clear the screen and display a message
function showMessage(address, error, dir) {
  g.clear();
  g.reset();
  g.setFontVector(16);
  const addressLines = breakStringIntoLines(address, 20);
  let y = 20;
  for (const line of addressLines) {
    g.drawString(line, 10, y);
    y += 20;
  }
  if (error) {
    y += 10;
    const errorLines = breakStringIntoLines(error, 20);
    for (const line of errorLines) {
      g.drawString(line, 10, y);
      y += 20;
    }
  }
  g.drawString(`Direction: ${dir}`, 10, 150);
  g.flip();
}

// Function to get the compass direction
function getCompassDirection() {
  const compass = Bangle.getCompass();
  if (compass && compass.heading) {
    const direction = Math.floor(compass.heading);
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.floor(((direction % 360) + 22.5) / 45) % 8;
    if (index >= 0 && index < directions.length) {
      return directions[index];
    } else {
      return 'Invalid index';
    }
  } else {
    return 'No compass data';
  }
}

// Variable to store the current address and error
let currentAddress = 'Getting address...';
let currentError = '';
let lastUpdateTime = 0;

// Function to get the current location
function getCurrentLocation() {
  Bangle.setGPSPower(1);
  Bangle.setCompassPower(1);
  Bangle.on('GPS', (gps) => {
    if (gps.fix) {
      const now = Date.now();
      if (now - lastUpdateTime < 30000) return;
      lastUpdateTime = now;
      getStreetAndHouseNumber(gps.lat, gps.lon);
    } else {
      currentAddress = 'No GPS signal';
      currentError = `Sats: ${gps.satellites}`;
      showMessage(currentAddress, currentError, getCompassDirection());
    }
  });
}

// Function to get the street and house number
function getStreetAndHouseNumber(lat, lon) {
  const url = `${nominatimApi}/reverse`;
  const paramsStr = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  const fullUrl = `${url}?${paramsStr}&lat=${lat}&lon=${lon}&accept-language=${lang}&format=json`;

  Bangle.http(fullUrl).then(data => {
    try {
      const jsonData = JSON.parse(data.resp);
      if (jsonData && jsonData.address) {
        let street = jsonData.address.road;
        if (street.includes('Straße')) {
          street = street.replace('Straße', 'Str.');
        } else if (street.includes('Street')) {
          street = street.replace('Street', 'St.');
        }
        const houseNumber = jsonData.address.house_number;
        const newAddress = `${street} ${houseNumber}`;
        if (newAddress!== currentAddress) {
          currentAddress = newAddress;
          currentError = '';
        }
      } else {
        const newAddress = 'No address';
        if (newAddress!== currentAddress) {
          currentAddress = newAddress;
          currentError = '';
        }
      }
    } catch (err) {
      const newError = `Error: ${err}`;
      if (newError!== currentError) {
        currentError = newError;
      }
    }
    showMessage(currentAddress, currentError, getCompassDirection());
  }).catch(err => {
    const newError = `Error: ${err}`;
    if (newError!== currentError) {
      currentError = newError;
    }  
    showMessage(currentAddress, currentError, getCompassDirection());
  });
}

// Main function
function main() {
  showMessage('Getting address...', '', getCompassDirection());
  getCurrentLocation();
  setInterval(() => {
    showMessage(currentAddress, currentError, getCompassDirection());  
  }, 1000);
}

// Call the main function
main();
