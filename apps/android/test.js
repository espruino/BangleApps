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
  print(Bangle._PWR);

  print("Not connected, should use internal GPS");
  assertTrue(!NRF.getSecurityStatus().connected, "Not connected");

  assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

  assertTrue(Bangle.setGPSPower(1), "Switch GPS on");

  assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

  assertFalse(Bangle.setGPSPower(0), "Switch GPS off");

  assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

  assertTrue(Bangle.setGBGPSPower(1), "Switch GBGPS on");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertNotEmpty(Bangle._PWR.GBGPS, "GBGPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertTrue(Bangle.isGBGPSOn(), "isGBGPSOn");

  assertFalse(Bangle.setGBGPSPower(0), "Switch GBGPS off");

  assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

  print("Connected, should use GB GPS");
  sec.connected = true;

  assertTrue(NRF.getSecurityStatus().connected, "Connected");

  assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

  assertTrue(Bangle.setGPSPower(1), "Switch GPS on");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertNotEmpty(Bangle._PWR.GBGPS, "GBGPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertTrue(Bangle.isGBGPSOn(), "isGBGPSOn");

  assertFalse(Bangle.setGPSPower(0), "Switch GPS off");

  assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

  print("Connected, then reconnect cycle");
  sec.connected = true;

  assertTrue(NRF.getSecurityStatus().connected, "Connected");

  assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

  assertTrue(Bangle.setGPSPower(1), "Switch GPS on");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertNotEmpty(Bangle._PWR.GBGPS, "GBGPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertTrue(Bangle.isGBGPSOn(), "isGBGPSOn");

  print("disconnect");
  NRF.emit("disconnect", {});
  sec.connected = false;

  setTimeout(() => {

    assertNotEmpty(Bangle._PWR.GPS, "GPS");
    assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
    assertTrue(Bangle.isGPSOn(), "isGPSOn");
    assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

    print("connect");
    NRF.emit("connect", {});
    sec.connected = true;

    setTimeout(() => {
      assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
      assertNotEmpty(Bangle._PWR.GBGPS, "GBGPS");
      assertTrue(Bangle.isGPSOn(), "isGPSOn");
      assertTrue(Bangle.isGBGPSOn(), "isGBGPSOn");

      assertFalse(Bangle.setGPSPower(0), "Switch GPS off");

      assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
      assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
      assertFalse(Bangle.isGPSOn(), "isGPSOn");
      assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

      setTimeout(() => {
        print("Test disconnect without gps on");

        assertUndefinedOrEmpty(Bangle._PWR.GBGPS, "No GBGPS");
        assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
        assertFalse(Bangle.isGPSOn(), "isGPSOn");
        assertFalse(Bangle.isGBGPSOn(), "isGBGPSOn");

        print("Result Overall is " + (result ? "OK" : "FAIL"));
      }, 0);
    }, 0);
  }, 0);
}, 5000);