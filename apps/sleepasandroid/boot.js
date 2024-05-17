(() => {
  function gbSend(message) {
    Bluetooth.println("");
    Bluetooth.println(JSON.stringify(message));
  }

  var accel_data = [];

  function updateAccel(accel) {
    accel_data.push(accel);
  }

  function update_sleep_accel() {
    copy = accel_data.map((x) => x);
    mean_x = E.sum(copy.map((x) => x.x)) / copy.length;
    mean_y = E.sum(copy.map((x) => x.y)) / copy.length;
    mean_z = E.sum(copy.map((x) => x.z)) / copy.length;

    update_data = { t: "sleep_as_android", "accel": { "x": mean_x, "y": mean_y, "z": mean_z } };
    gbSend(update_data);
    accel_data = [];
  }

  Bangle.on("accel", updateAccel);

  setInterval(update_sleep_accel, 10000);
})();