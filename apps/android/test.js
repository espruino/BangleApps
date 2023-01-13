let result = true;

function assertTrue(condition, text) {
  if (!condition) {
    result = false;
    print("FAILURE: " + text);
  } else print("OK: " + text);
}

function assertFalse(condition, text) {
  assertTrue(!condition, text);
}

function assertUndefinedOrEmpty(array, text) {
  assertTrue(!array || array.length == 0, text);
}

function assertNotEmpty(array, text) {
  assertTrue(array && array.length > 0, text);
}

let sec = {
  connected: false
};

NRF.getSecurityStatus = () => sec;

setTimeout(() => {
  // add an empty starting point to make the asserts work
  Bangle._PWR={};

  print("Not connected, should use internal GPS");
  assertTrue(!NRF.getSecurityStatus().connected, "Not connected");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");

  assertTrue(Bangle.setGPSPower(1), "Switch GPS on");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");

  assertFalse(Bangle.setGPSPower(0), "Switch GPS off");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");

  print("Connected, should use GB GPS");
  sec.connected = true;

  assertTrue(NRF.getSecurityStatus().connected, "Connected");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");

  assertTrue(Bangle.setGPSPower(1), "Switch GPS on");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");

  assertFalse(Bangle.setGPSPower(0), "Switch GPS off");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");

  print("Connected, then reconnect cycle");
  sec.connected = true;

  assertTrue(NRF.getSecurityStatus().connected, "Connected");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");

  assertTrue(Bangle.setGPSPower(1), "Switch GPS on");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");

  print("disconnect");
  NRF.emit("disconnect", {});
  sec.connected = false;

  setTimeout(() => {

    assertNotEmpty(Bangle._PWR.GPS, "GPS");
    assertTrue(Bangle.isGPSOn(), "isGPSOn");

    print("connect");
    NRF.emit("connect", {});
    sec.connected = true;

    setTimeout(() => {
      assertNotEmpty(Bangle._PWR.GPS, "GPS");
      assertTrue(Bangle.isGPSOn(), "isGPSOn");

      assertFalse(Bangle.setGPSPower(0), "Switch GPS off");

      assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
      assertFalse(Bangle.isGPSOn(), "isGPSOn");

      setTimeout(() => {
        print("Test disconnect without gps on");

        assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
        assertFalse(Bangle.isGPSOn(), "isGPSOn");

        print("Result Overall is " + (result ? "OK" : "FAIL"));
      }, 0);
    }, 0);
  }, 0);
}, 5000);