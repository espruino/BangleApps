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

let internalOn = () => {
  return getPinMode((process.env.HWVERSION==2)?D30:D26) == "input";
};

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

  assertTrue(Bangle.setGPSPower(1, "test"), "Switch GPS on");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertTrue(internalOn(), "Internal GPS on");

  assertFalse(Bangle.setGPSPower(0, "test"), "Switch GPS off");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");

  print("Connected, should use GB GPS");
  sec.connected = true;

  assertTrue(NRF.getSecurityStatus().connected, "Connected");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");

  assertTrue(Bangle.setGPSPower(1, "test"), "Switch GPS on");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");

  assertFalse(Bangle.setGPSPower(0, "test"), "Switch GPS off");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");

  print("Connected, then reconnect cycle");
  sec.connected = true;

  assertTrue(NRF.getSecurityStatus().connected, "Connected");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");

  assertTrue(Bangle.setGPSPower(1, "test"), "Switch GPS on");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");

  NRF.emit("disconnect", {});
  print("disconnect");
  sec.connected = false;

  setTimeout(() => {

    assertNotEmpty(Bangle._PWR.GPS, "GPS");
    assertTrue(Bangle.isGPSOn(), "isGPSOn");
    assertTrue(internalOn(), "Internal GPS on");

    print("connect");
    sec.connected = true;
    NRF.emit("connect", {});

    setTimeout(() => {
      assertNotEmpty(Bangle._PWR.GPS, "GPS");
      assertTrue(Bangle.isGPSOn(), "isGPSOn");
      assertFalse(internalOn(), "Internal GPS off");

      assertFalse(Bangle.setGPSPower(0, "test"), "Switch GPS off");

      assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
      assertFalse(Bangle.isGPSOn(), "isGPSOn");
      assertFalse(internalOn(), "Internal GPS off");

      setTimeout(() => {
        print("Test disconnect without gps on");

        assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
        assertFalse(Bangle.isGPSOn(), "isGPSOn");
        assertFalse(internalOn(), "Internal GPS off");

        print("Result Overall is " + (result ? "OK" : "FAIL"));
      }, 0);
    }, 0);
  }, 0);
}, 5000);