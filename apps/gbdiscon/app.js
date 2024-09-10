{
Bangle.setUI({mode:"custom",remove:()=>{}});"Bangle.loadWidgets"; // Allow fastloading.

Bluetooth.println(JSON.stringify({t:"intent", action:"nodomain.freeyourgadget.gadgetbridge.BLUETOOTH_DISCONNECT", extra:{EXTRA_DEVICE_ADDRESS:NRF.getAddress()}}));

Bangle.showClock();
}
