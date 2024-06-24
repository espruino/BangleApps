// single screen, clock on the right, sidebar without image (date/steps/bluetooth connection status/batt%)

// Large font KdamThmor taken from Rebble clock
Graphics.prototype.setFontKdamThmor = function(scale) {
  // Actual height 70 (69 - 0)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AH4AMgfABZM/BZMB/4WJg/+BZMf/ALJ//gIpP/wAugLpUAvyBKsDC/ACKYJQIKYJgaYKv6YJh7HJeoP8VxLSJg//+D0JIhMf/7RIf4JPJv//LX5a6CwLvJn5aJLYIKJgY4IADn/KpKvBAAKvIAARiGBQanGOwILJBQgLFFogvGIgZHGWAIAEdwg5FNYreBAAjvDeoIAFYQcfBYy3DEQRKEKQQiCAoRiCIogoDCIJGDEQLlEIwZoBCwYLCHQQoBQwgGEj7aFGoKuDKwYSFE4LZFv41Ch6dEIITICn5FEDwQuDeAwuEBQgeEB4b8EFwbADNIZdaHQoSBFwUfNIoGEv5GFXYpGEIoJBCZgjZGHQILDCwIpDj//GgQoBMggcBAApkDBQwiDDoQAEEQY0BERJGBERBGCERC8BBYrYFBQj8FLwrBGBQbkFEYoKFBYgtFL4jLFZ4gKJAH4AciALKRA73DbIgAFj/ABZLOGEQjDEj40En6tEv4oDgLPEAoLRFCIcHDgouJDgP4FxAiFFwt//xXEFwcDEQouEj4iEFwv/EQguEEQJ6EFwgiBS4guE/5uEFwiiBAAyiDBQwdDCw4uCIoIAGFwSLBF34unAAy7EAAy7EAAzqEAArqEF34ukAH4AGgfgNJWAAod8Cwn+SQn4RggFEv4oE/4FDg//FAYFFn4oEAoidBFAYFFh//YIYFBFwd//7BDAoIuCgf/YIYFBFwcfFAgFFDgIoDDgIFCEQpcBFwZFFn4uEAoJcEFwYFBLgouDQoo/BAwcf/hcEFwgiELgPfFwQRBEQYVBFwcPDYYzB+YSDn55DKwOPFwgbCKwP8CQYuBXIouEKIZcBIIgbF/BBEDYZcB4ASFDYI5BCgIuEHQSzCFwo6CeYQuEv4nBOYIPBFwa7Ddoa7FJoLtCFwhNBAAQfBFwiTBAAXAT4oKDCYSfFAAQ9BFwg6BAAQHBFwhDCLgQuFIwY5BFwhGDDwT9FOQI5CFwpSDDoYuDBYQWCFwoLCAgQuFCIsHFwgAFh4uEAH4AWjgLKvwGFj6LDP4sBcgjhCCwaGDn4LEgKjDAgKXEh61Dg7LEdQIuDj7AEZgIpDfYPACIgdCFwLjDdIQRCFwIoDEQJdEFAgiBJgYoEEQoLCAoRFFBYRjCFAIWDQII0Dv6SFv40CRYg1DHQRXBBQg1BFISpDBwQSEEQTQDj4SCDYJKBh42Cv4uCh4TCn4aBIIIuDCYIHBDQIeBFwYPBg4aCe4YPDfAYuHv4uNLo6bBLpJ4EFwYTBEQIHBCQYbBHQIqBEwIGCXYl/IQTwDD4P+CwIfBFILCCBAQACwACBEQQQBAArlDn4LGcoY3BGAIlEHQYAB+YiGMQIAB54DCOgRGD/0fEQpGD+A+CEQZ6BLYhFEKQX8HwYKDBYXgHwQ5DBYQpBBYQ5DHYRWDUQQAGgK5DADsBBZUfb4IAIOYoAETgJcFAAbLBBRBoBUQg5FRYxQDRYJGIZQQ5KFxDtCFxDpCFw7dIfAouICwQuHHIP+FxBQB8YuHf4UPFw6KCn4uGKAWAFw6KB/glBHJHAFw5QCQQIuGRQLzBFww5CKgRQH/A9BFwxQCFw45BCYQuGKAI5BFwwGBKAIuHRQRVCFwhQDFw6KBKAIuHfwQAEGAYKGGgbQCAAowCFwIAGF34ugAAjqHTojqFfQrqFcYoWJF0f+CxMH8ALJAEkCBZU8BRMB/CCKOw0DA4V/OwqhBA4IDBwAKFVoTlBBQytCn6xDBQX/IQQDDAgIACSwIRBTQQWDGwUHHQYzBAAK5CHQk/Fwo6EFwppBNoQuGgIPDFwYeCOoguC34eCh74DEASMCCQI+CDYQCBCQYuDDYMPFwQ6BFwYbBn4uCg4uE8ASBFwUfFwqIBCQV/FwsfLpAbBPgZdFFwpdGFwhdHDwQPELoYeCHwYbD/46CAYaMEBwLqFFwRGCv5RDFYUfBYIWBGQQuDv7iDMIQuCNIIADCwQuCfIgiDFwT5DEQYuDHQIiFVAc/EQyJDIwYiDc4RGDNAYuBCAJGDRYQHBCAQLDCwcPCAR+BHIgAEBYQKHEYQtDAH4Ak/gKJZALMBRhLGDAAjSGWYgLCEY7qDBYwtCXhBEBewzpF/5fGj4LDdYwKD//gKBBeHKAZGGHIX+gJGGKAQfBHQoSBCYQEB+A5GA4InBHQiJEQgKKGOIUPHQg5CFQU/HQaKDVgR1ERQQeCIwK8DBQPvDwUHFwZQB/0/DwUfFwaKB+IeDv4PCHIWHFw45B/geDFwjBCDwYPDEQKsCLoxFB+CIDCQIPCP4OAj6MCj4uEBAN/FQV/SAS0CFwIqBXYioCA4ZYBVwYbBHoIaCQAY+CHoPACwKADGwa+CEQcPFQIfBAARVCgE+dgiGCBYRVCHQLiFganEEQsIZQgiFAAZFGAAZGDNAYADcQSLDAAhSCVwYLHHI4LCCxC5FAH4AIJhRYBXgQAGh5vJgE/VI4uDSRAuJoAuJg4uKvguJg/wFxN/OAQuGaoIuJv/8FxAWBFxN/T4YuFCwIuJCwIuICwQuICwIuICwQGDFwgWCEQQuECwQpDFwk/BQIdDFwYPBCwguECwwuDCw4uDCw4uCCw4uDCw4uCCxAuCCxAuBCwYKEFwQWCRIYuD8YWIEAO/CxEPCoQWGLQYWHFwIWJJ4YWHFwYKGFwYWHFwYKHFwQWIFwQKHFwQWIFwQKIFwIWJdQQuJ8ALJAH8f/BuK/gIFv6RDBYqlBwEBSIIjFA4OAWgSSEA4WAv4LGA4TXC//Ab4v+j4LCwBYDAwP8DQTNEAwXzAYTCDFQfvAYRSDFQYADIwYqDAAZGCEQYAB8A6ENARHCDoI6DAgKKCD4N/HQQIB8ACBCYQGBAYMHE4IxBIQIPBHQU/DYIOBA4ISCDYQHBh4iCh7ICD4IaEAYJpCB4d/GwQuEGwasBDwYPBA4MHFw4HCj4uHA4QuULqyUDRgxCCRhC0Cn46CEwYbB+DhCYQa7DAAQyBcoIaBdQoLBawYrCAApRCHQILGKIT/C//7Eoh1DAAPvAYRRCIwkfEQpGD/AyDBQSBBCQQiGKQX+HwYiDKQXwGQRFDBYYyDNAYLCAwILCBQg+FHIgAEC4IKIQwKtCAH4AWnwKJPoKrEOAi3GaY4WJ/6KHW4ShIfwTbFAAMDCwX8A4UYHIrQE8AiFeYcHHwQiDKQZ6DEQZSCgYmDEQZGCj4uCEQQZBCYRtDNAPAg46Cg5hDv5aBBYI6Bn4aCRYInBDQIpCFwQTBGwQaBGQIuCn59Cn4uBSAgbDHoYuCE4JlCEwJjBCQUPEQUH/hjCFwaUCj/wHIKzDSgd/4AWBQAhhDcYTpDFwg5BUYYuE8Y5ELoufHIhdFaoguBYYbJESgjWDGgQHCH4IiDBQZZBCIIiCKAa7CIwIWCKAbPC8AWCKAZpCCgRQFIQhQGHQQADKAhOEKApGDAARQEIwZQHIwpQFBYpQFKQgWHPwYWHBYQWIEYREGL4YKJAH4AegIEDsCxGPIfgCwr/Dn6nFh6jCgKcGn/wEQQbDXgYqCn/4BQkDDwYPDFzV/JoUfB4RdOgI1DnjG/ACoA='))),
    46,
    atob("GBo2NjY2NjY2NjY2Gg=="),
    94+(scale<<8)+(1<<16)
  );
  return this;
};

var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(() => {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

const zeroPad = (num, places) => String(num).padStart(places, '0');

function draw() {
  const barWidth = 64;
  let date = new Date();
  let battColor = '#0ff';

  // queue next draw in one minute
  queueDraw();

  // clean screen
  g.reset().clearRect(Bangle.appRect);

  // draw side bar in blue
  g.setColor('#000').fillRect(0, 0, barWidth, g.getHeight());

  // show time on the right
  g.setColor(g.theme.fg).setFontAlign(0, 0).setFontKdamThmor();
  g.setColor('#11f').drawString(zeroPad(date.getHours(), 2), 120, g.getHeight() / 4 + 12);
  g.setColor('#000').drawString(zeroPad(date.getMinutes(), 2), 120, g.getHeight() * 3 / 4 + 12);

  // day of week
  g.setColor('#fff').setFontAlign(0, -1).setFont('Vector', 28).drawString(require("date_utils").dow(date.getDay(), 1).toUpperCase(), barWidth / 2 + 1, 3);
  //g.setFont('Vector', 30).drawString(twoCharsDayOfWeek[date.getDay()], barWidth/2, 3);

  // month
  g.drawString(require("date_utils").month(date.getMonth() + 1, 1).toUpperCase(), barWidth / 2 + 1, 84);

  // date
  g.setColor('#0ff').setFont('Vector', 48).drawString(date.getDate(), barWidth / 2 + 5, 36);

  // show daily steps
  g.setFontAlign(1, -1).setColor('#fff').setFont('Vector', 24).drawString((Bangle.getHealthStatus("day").steps / 1000).toFixed(1) + 'k', barWidth, 125);

  // Bluetooth/GPS/Compass connection status
  if (NRF.getSecurityStatus().connected) g.setColor('#0ff').fillRect(5, 115, barWidth - 5, 120);

  // show battery remaining percentage
  battColor = Bangle.isCharging() ? '#f00' : (E.getBattery() < 30 ? '#ff0' : '#0f0');
  g.setColor(battColor).drawString(E.getBattery() + '%', barWidth, 153);
}

function handleEvent() {
  draw();
}

Bangle.on('charging', handleEvent);
NRF.on('connect', handleEvent);
NRF.on('disconnect', handleEvent);

Bangle.setUI("clock");

// Load widgets
Bangle.loadWidgets();
require("widget_utils").hide();
draw();
