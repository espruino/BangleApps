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
// add an empty starting point to make the asserts work
Bangle._PWR={};

let teststeps = [];

teststeps.push(()=>{
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

});

teststeps.push(()=>{
  print("Connected, should use GB GPS");
  sec.connected = true;

  assertTrue(NRF.getSecurityStatus().connected, "Connected");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");


  print("Internal GPS stays on until the first GadgetBridge event arrives");
  assertTrue(Bangle.setGPSPower(1, "test"), "Switch GPS on");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertTrue(internalOn(), "Internal GPS on");

  print("Send minimal GadgetBridge GPS event to trigger switch");
  GB({t:"gps"});
});

teststeps.push(()=>{
  print("GPS should be on, internal off");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");
});

teststeps.push(()=>{
  print("Switching GPS off turns both GadgetBridge as well as internal off");
  assertFalse(Bangle.setGPSPower(0, "test"), "Switch GPS off");

  assertUndefinedOrEmpty(Bangle._PWR.GPS, "No GPS");
  assertFalse(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");
});

teststeps.push(()=>{
  print("Wait for all timeouts to run out");
  return 12000;
});

teststeps.push(()=>{
  print("Check auto switch when no GPS event arrives");

  assertTrue(Bangle.setGPSPower(1, "test"), "Switch GPS on");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertTrue(internalOn(), "Internal GPS on");

  print("Send minimal GadgetBridge GPS event to trigger switch");
  GB({t:"gps"});

  print("Internal should be switched off now");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertFalse(internalOn(), "Internal GPS off");

  //wait on next test
  return 12000;
});

teststeps.push(()=>{
  print("Check state and disable GPS, internal should be on");

  assertNotEmpty(Bangle._PWR.GPS, "GPS");
  assertTrue(Bangle.isGPSOn(), "isGPSOn");
  assertTrue(internalOn(), "Internal GPS on");

  assertFalse(Bangle.setGPSPower(0, "test"), "Switch GPS off");
});

teststeps.push(()=>{
  print("Result Overall is " + (result ? "OK" : "FAIL"));
});

let wrap = (functions) => {
  if (functions.length > 0) {
    setTimeout(()=>{
      let waitingTime = functions.shift()();
      if (waitingTime){
        print("WAITING: ", waitingTime);
        setTimeout(()=>{wrap(functions);}, waitingTime);
      } else
        wrap(functions);
    },0);
  }
};

setTimeout(()=>{
  wrap(teststeps);
}, 5000);

