const storage = require('Storage');

require("Font6x12").add(Graphics);
require("Font8x12").add(Graphics);
require("Font7x11Numeric7Seg").add(Graphics);

function bigThenSmall(big, small, x, y) {
  g.setFont("7x11Numeric7Seg", 2);
  g.drawString(big, x, y);
  x += g.stringWidth(big);
  g.setFont("8x12");
  g.drawString(small, x, y);
}

function getBackgroundImage() {
  return require("heatshrink").decompress(atob("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"));
}

function getRocketSequences() {
  return {
    1: require("heatshrink").decompress(atob("qFGwkCkQAiiEBEkUgKQhPhE8ogCE8YhCiQoEE7pKEPIgncTQ4neEwpQCPoh1eJYYwCJ7QmHKAh1hZIpOjPAUBJ0ZQCTzEhExZ1lPAZ1kKDQmOJ65O2E65OPOy5O2E64mPOyxO/J2wnPJyx2QJ35O/J2khE0p2POq52PEy4nOiQnlOrEhiSfMJrEggQnLJzB1CPBQmZkInMEzBQDPBImbPBR1ZEoRMCZYImhgQgEE0BzFKAgmaDwLDFKAbqdYQwHBOrcgDgLBFJrsiiRNGYbpLBY4Ymhd4omkkUhE0pQEEwUBJjrHBd4QmCdzoiBDwYrCPLyZHF4QnagQeCE8UgJwYniJwgnIOzwfFO0wJCJzMQE4gyFEzR2FBQombkInDQI4AakAnBTYS+ZE5BMDE0LEES7YnLE0R3FAEQA=")),
    2: require("heatshrink").decompress(atob("qFGwkCkQAikMAgIliKYon/AA0gEAQniEwIhCAgYndEIjqBE8CaGKogmgKAp1fKAgncExBQBBQR1gKAp7BJ0IndExR4CE0idaOpYnbExqeYJxxPYEx0BJ0x2XExx2XJ20QE6xONJi5OPGwJOlBwLFkLoLFlBwJOkOwJOlE4JOkTjBOOE/52Pdi5OPEy7FnE5wmXE5xOZT5gmYEoMiiB1lgR4KTLAkDPBJ1WIAYDDKA4mWJwchDwYEDTjQiDJQh4GYLAhHFosSJy6OCTIxaEEywbBKYwjEEzMgUQxQFBogAURwZOGOjTKJdTYnOEryfHE0JQEfIpQgYQMAgJLeAgrtfTI4ndgSaFE4h0bdQkSZQpOfEAgIBO0AnEdrh2FJAb1EdbInEBIpObOwhOEEzYnFXzZ2HE4QlhE4QlDFMKcDYooniO0QnDT0YnCE0ciA")),
    3: require("heatshrink").decompress(atob("qFGwkEogAjiMUEkVAKYgnhPYolgOQIniOYZ4FOcLqBE8CaGKojpgKAomhEYUQE7gmHKAIxCE0QkCPYR1gZIgnZExR4CJ0idmE7ZONYzImNgEUJ0p3YJRh2ZJJwnXOpQhBdkpaETsMEGQhOhE7jFLUYpOfTzgmKE4hOiE4hOigEUJ0rvCEywnPEqx2OTjBOOE7ImOTsqeZE5zFYoJOmT5kBJzEAih4LdK5mBAQInKOqoYDEgR4JEypHDEYbxJOq5ABdgZ7CEzZOEJQgnGihOYEIzJFTionCKYxWGEy9ADAYnGUIYmWog/EdBFAEy7KIKAwnjKwLqWE5pMeT48CVQpQfgMjKEtEiAnfEQJQCgJSCTcB6FJzkEdYcUE8FAdQghDOzonKTjh2EZAidcDoInHJzodBOwx/BE8JxcOwsAOwQmhJgSXDObwnFEwUUO0LFGE8aeiE4YmiokQE0tE")),
    4: require("heatshrink").decompress(atob("qFGwkCkQAjiMSEkRTFE/4AGkMAgQCBE8MgEIYEDE7whDdQIngTQxVEE0ChFTjxQFE7jnFKAgxCOsBQFZgJ1gE7wmKPAROkTrTEHGAwnYiBHJFAaeXOoyXBEQZPac5AsFgJOhAoh2XJwwnFKoROdE4J9GJzwnIiQmVkInPAC0QE5AJFE64mHY5DFdE4SBEYr5JDJ0hKDJ0jCZJxoACgInmKLAmOTq5OOEy5OPTsxOYE5wmXO5wlYkAnMOqshiRNCgR4LOC8CkJCCEzxHDAgYnJOqpAEDoZ4HEyodDEQpQHdCsQOwwFHEyzoCPYzJGEy0gEwaZGA4acVEQSjHKAomXkQYEYAwlZeRKYDE8gjCYa7zJEwcCkImfKAb4FAD0hdTh4LgRSBOcR0CJz0gYYrrgN4QnEYrxOEE4bEeiAnGF4J2idL6VDE8ohBE0gnFE0J0BE4QGBiROgdIQABgJ2hJoTtjYgZSEE8ScgE4omikUQTcQADA=")),
    5: require("heatshrink").decompress(atob("qFGwkCkQAikMAgIliKYonhiAnjkEATIIniEwIhCAgYndEIhQFYUZVEE0BQFOr5QEeQQmiKAL1DOr5QEE7ROCDgZVEAoInZDwchFQQoDPAJOdEQYrBdrZFDOYwncEJDsDVIpOXgJxEE4pObEAgGFgJOaE48BaIhOZJ5ZObY5ROcE441CE6xOGPAwtCJzpGCJ0hHDkI1DJzwoEJzInLFg52dUo5O/J35OzE54mWOx4mXJxx1XE54mXkUhExkSJzCfMOrAlBPBiZXgQDBAQQmgJgh4JOqoYEFYwmaDoZzEFgh1YDgkiiAFEKAroXJJAGFiQmVkCNDTIz5EJy57HKAomXkQYEJoqaYeRadEJrAnJEQUAgJPiAoYmeT4cCkAnBE0BKCJkT1EkDCeJYYiDOkLDFFL5wBE4guCPDhEBEwQiDY70CkInDiQnCJzkhOwhKDdzp2Idb4nEE0B0Bdo4niE0J0CeYhOhgESUYYnidsgnEE0KeCE0gnDE0ciA")),
    6: require("heatshrink").decompress(atob("qFGwkCkQA/ABEgKQZPhEwgABEsAoGJkBxBE8JKEAowAbJIhQEgLDiPooAdKA4ncTZAndSwhQEFoInaJQkSKAwlZdgwnfSgYADE4h1ZDwInlcggnIOzAdCE8i7EY5J3XDgYhGd4pOZEI52bSYwGCOAJ2bYIodEOzZOFFAjFcEwwAIE6xOHABBO/J34ndEyx2PJ00BJ00SJ0p1XE54mXOxxO/J5wmYgQnMOrB2BPBgkWiJ1CPBbBYAYR4KiTAXRwIrFTjgZDJYZ4IEyoiEIwrDcEJJQFOqwiBDARxFFwgmXkAYDEogsBF4QmXEQJ7GUYYkBEzDKJAgYmdEQbKFEzonEKYgngJwgmfZggmjKQghgiBRGkBzeTgUikJRgc47LDErTnDEAkQJzkCJwYnEJzonEJIaddOwhJEJzgdBE4hYEJzieJADgnEE0KUCXzoAGkJLEiB2hOgQDBT0TsDT0YmlE4YmjkQ=")),
    7: require("heatshrink").decompress(atob("qFGwkCkQAhkIpBiQlhkBSEJ8InlEIIoFE7whEE8pQFE7giBJQoneI4MCTYhQDE7YdCYYondEQYnEPwZ1bE5BQCJzonHkR2ZEAkBE4pNBE7zHFYrYhFUgonaXAQeEEwruZEYcgiROHJ7AfDAwxOeAAURiAmHE65HIOzwmOJ35OPE6xOPO35O/J35O/J1gnPEyx2PEy5OOOq5OnE5xOYO5omZgJQMJrQnLiQnagR4JOq5nCDgZ1fEYRLDE5DoZkUQNoZ4GOrJKGAoomXOw7lCAwYmYDgJSEAAUBA4QDBJzB6FOQrDXJwTJFdLjJKE9jDYZRAmkKAwmhKAgmiKAYmBkApdJIgjCKYIncOQYvJYTovGE84lagR2DE4xOakBOEgJXFOjYnEJAbtdOwggEkAmbDgInDE0B0BE4QgcE5AkiXYbpCOLonGYo4nhPMYnCUEgnBY0kiA==")),
    8: require("heatshrink").decompress(atob("qFGwkCkQA/ABBSEJ8MgE4kBEsBPFE7xMCOIJ3hOYgFEE7rCGE70gE4pQBiAndYQwjBUohOZD4ZQFE7YkBE5AICYbZ2GE7sggJRCAA8iYzZOITroALE7EhExh4CAC0QExpPXOponZExx2XJ24nWdh52XdhzF/Yu5O/J35O0E55OXOx5O/J2omXE5x1XO54mYgQnMJrR4LOrciiAmiJgR4KEzIjDPBAlYiAiEeI51YkEBE4J5CD4KceTQQcBJgRQFdTZDCJIjDcNIqhGdTQmCkByFTTInDKgoAEE7ZEEJwhPdE1R1FE0InEE0R3DEwTGcDwomEE7hKFPYqafE8ROCE5DJbE5B/IEqh2ED4gnCJrMCJwgnEiB2bE4qeFEzUggQmIBQLEaEQImHLIImaE4YfcOw4lEFMLECS7onJO8wmkE4QljAAIA==")),
  };
}

let rocketSequence = 1;
let settings = storage.readJSON("cassioWatch.settings.json", true) || {};
let rocketSpeed = settings.rocketSpeed || 700;
delete settings;

// schedule a draw for the next minute
let rocketInterval;
var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function clearIntervals() {
  if (rocketInterval) clearInterval(rocketInterval);
  rocketInterval = undefined;
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
}

function drawClock() {
  g.setFont("7x11Numeric7Seg", 3);
  g.clearRect(80, 57, 170, 96);
  g.setColor(0, 255, 255);
  g.drawRect(80, 57, 170, 96);
  g.fillRect(80, 57, 170, 96);
  g.setColor(0, 0, 0);
  g.drawString(require("locale").time(new Date(), 1), 70, 60);
  g.setFont("8x12", 2);
  g.drawString(require("locale").dow(new Date(), 2).toUpperCase(), 18, 130);
  g.setFont("8x12");
  g.drawString(require("locale").month(new Date(), 2).toUpperCase(), 80, 126);
  g.setFont("8x12", 2);
  const time = new Date().getDate();
  g.drawString(time < 10 ? "0" + time : time, 78, 137);
}

function drawBattery() {
  bigThenSmall(E.getBattery(), "%", 135, 21);
}

function drawRocket() {
  let Rocket = getRocketSequences();
  g.clearRect(5, 62, 63, 115);
  g.setColor(0, 255, 255);
  g.drawRect(5, 62, 63, 115);
  g.fillRect(5, 62, 63, 115);
  g.drawImage(Rocket[rocketSequence], 5, 65, { scale: 0.7 });
  g.setColor(0, 0, 0);
  rocketSequence = rocketSequence + 1;
  if(rocketSequence > 8) rocketSequence = 1;
}

function getTemperature(){
  try {
    var weatherJson = storage.readJSON('weather.json');
    var weather = weatherJson.weather;
    return Math.round(weather.temp-273.15);
  } catch(ex) {
    print(ex)
    return "?"
  }
}

function getSteps() {
  var steps = Bangle.getHealthStatus("day").steps;
  steps = Math.round(steps/1000);
  return steps + "k";
}


function draw() {
  queueDraw();

  g.clear(1);
  g.setColor(0, 255, 255);
  g.fillRect(0, 0, g.getWidth(), g.getHeight());
  let background = getBackgroundImage();
  g.drawImage(background, 0, 0, { scale: 1 });
  g.setColor(0, 0, 0);
  g.setFont("6x12");
  g.drawString("Launching Process", 30, 20);
  g.setFont("8x12");
  g.drawString("ACTIVATE", 40, 35);

  g.setFontAlign(0,-1);
  g.setFont("8x12", 2);
  g.drawString(getTemperature(), 155, 132);
  g.drawString(Math.round(Bangle.getHealthStatus().bpm||Bangle.getHealthStatus("last").bpm), 109, 98);
  g.drawString(getSteps(), 158, 98);

  g.setFontAlign(-1,-1);
  drawClock();
  drawRocket();
  drawBattery();
}

Bangle.on("lcdPower", (on) => {
  if (on) {
    draw();
  } else {
    clearIntervals();
  }
});


Bangle.on("lock", (locked) => {
  clearIntervals();
  draw();
  if (!locked) {
    rocketInterval = setInterval(drawRocket, rocketSpeed);
  }
});

Bangle.setUI("clock");

// Load widgets, but don't show them
Bangle.loadWidgets();
require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
g.clear(1);
draw();
