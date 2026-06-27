let interval;
let rxBuffer = ""; // accumulates incoming chunks

NRF.setAdvertising({}, { connectable: true });

exports.sendSystemData = function () {
  let data = {
    type: "systemInfo",
    batt: E.getBattery()
  };
  sendData(JSON.stringify(data));
};

function updateWeatherData(d) {
  let weatherEvent = {
    t: "weather",
    temp: d.temp,
    feels: d.feels,
    hi: d.hi,
    lo: d.lo,
    hum: d.hum,
    rain: d.rain,
    uv: d.uv,
    code: d.code,
    txt: d.txt,
    wind: d.wind,
    wdir: d.wdir,
    loc: d.loc
  };
  const numFields = [
    "code",
    "wdir",
    "temp",
    "feels",
    "hi",
    "lo",
    "hum",
    "wind",
    "uv",
    "rain"
  ];
  numFields.forEach((field) => {
    if (weatherEvent[field] != null) weatherEvent[field] = +weatherEvent[field];
  });
  require("weather").update(weatherEvent);
}

function sendData(dataString) {
  if (global.phoneConnected) {
    Bluetooth.write("BlueWatch_PRIMER" + "\n");
    setTimeout(function () {
      Bluetooth.write(dataString + "\n");
    }, 500);
  } else {
    print("Phone not connected");
  }
}

/*
Expects object containing any of these:
* bpm
* movement
* bpmConfidence
* 
auto-adds steps cumulative and battery
*/

function sendRawHealthData(data) {
  let sendableData = {
    type: "health",
    steps: Bangle.getHealthStatus("day").steps,
    start: Date.now(),
    end: Date.now(),
    battery: E.getBattery()
  };
  if (data.movement) {
    sendableData.movement = data.movement;
    sendableData.state = data.movement <= 150 ? "sedentary" : "moving";
  }
  if (data.bpmConfidence && data.bpm) {
    if (data.bpmConfidence > 75 && data.bpm != 0) sendableData.hr = data.bpm;
    sendableData.confidence = data.bpmConfidence;
  }
  setTimeout(function () {
    sendData(JSON.stringify(sendableData));
  }, 3000);
}

function sendHealthData() {
  setTimeout(function () {
    sendRawHealthData(Bangle.getHealthStatus("last"));
  }, 3000);
}

function onConnect() {
  global.phoneConnected = true;
  Bangle.emit("BlueWatchConnected");
  setTimeout(sendHealthData, 1000);
}

function processMessage(raw) {
  raw = raw.trim();
  print("Processing complete message:", raw.length, "chars");

  let obj;
  try {
    obj = JSON.parse(raw);
  } catch (error) {
    if (raw.startsWith("RAW: ")) {
      eval(raw.replace("RAW: ", ""));
      return;
    }
    switch (raw) {
      case "Buzz":
        exports.buzz();
        break;
      case "Find Watch":
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        interval = setInterval(exports.buzz, 1500);
        setTimeout(function () {
          clearInterval(interval);
          interval = null;
        }, 10000);
        break;
      case "Stop Find Watch":
        clearInterval(interval);
        interval = null;
        break;
      case "BlueWatch Connected":
        onConnect();
        break;
      case "Request Health":
        sendHealthData();
        break;
      case "Request System Info":
        exports.sendSystemData();
        break;
      default:
        print("Unknown BlueWatch command:", raw);
    }
    return;
  }

  if (obj) {
    switch (obj.id) {
      case "WeatherUpdate":
        updateWeatherData(obj);
        break;
    }
  } else if (obj) {
    print("Unknown object type, id:", obj.id);
  }
}

function messageReceived(data) {
  // 1. Force conversion to string if it's a byte array
  if (typeof data !== "string") {
    data = String(data);
  }
  rxBuffer += data;

  // 2. Check if the delimiter exists
  let idx = rxBuffer.indexOf("|");

  while (idx !== -1) {
    print("BlueWatch: Received but not ended with |");
    let complete = rxBuffer.substring(0, idx);
    rxBuffer = rxBuffer.substring(idx + 1);

    let finalMsg = complete.trim();
    if (finalMsg.length > 0) {
      processMessage(finalMsg);
    }

    // Check for the next one in the remaining buffer
    idx = rxBuffer.indexOf("|");
  }
}

exports.buzz = function () {
  Bangle.buzz(400);
};
exports.sendData = sendData;
exports.sendJSON = sendData;
exports.sendHealthData = sendHealthData;
exports.sendRawHealthData = sendRawHealthData;
exports.receive = messageReceived;
