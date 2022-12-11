const vw = g.getWidth();
const bgWidth = 384;

const sonic = {
  bpp: 4,
  transparent: 1,
};

const defaultSonic = {
  width: 36,
  height: 62,
  buffer: require("heatshrink").decompress(atob("iIADzIACA4gNECKYOComZxAVDogRXBQfdCQQABCLITCogRFCQIRYLAgAFCQwRQBoQCC///AYYRWGAoMBAAgRYCYf/gEAB4ICBCKrDDCL4UECMA3DolEB4IDBAAQRb7oMB7vdHIIRWCAYRCAAoRWCoozDCBQRRBQI3FERIRPPIbGBPIQiICKAQCdQRZDAYIRXCQIJB/4RDEhQRQGYP//7FEGpARQCAYREgEzERQRNAAIRCLIKkBCLg4CYoIABB5IRWAQQRcBoIODCRYRQB4INECLkRgH/ZAMACRgRSmbGBCIIFBmYWCCLAAC7oCBdgNEAgIRWBQY2B7oTBAwMzCYoRUBIIQBCQQGBHIYRUABwRRA=")),
};

const startingBuffers = [
  {
    width: 49,
    height: 63,
    buffer: require("heatshrink").decompress(atob("iIAFzIAEyMRjICBABkZDAogCCxgRBxAACzOUpIzDFxmYC4WJzNEGYgyQzOd6lIDoJiNGQYwB7tEDoQxQI4NN7BPDGJ54BondQAgvPGCjDDGCQVCCAVESAOIx/4GJYuCSIQwBFwX/GJbyEAAmDn///AwJjLyDAAsz/4xBGBAvJGAfwhIwHF5QwDgAwHXwYADGB6+DAAY2EGBYzHGA8P+EAgLyKGBIBBgD3ObwVPGAMEoAwIe4+ZolEGAVEGBRfDAYOUpvd6gaBpvQF5IuBFoOJDANE7vdC4IEBF5h8DGAQABGQNBF5YuCGAgyDYZwxE6lDmcxR5gAFGINEmczF6IxCob1B+YxIF5AxCeoQxJzLNBAAQFBhOUoEDGAIxJjOQC4cJAoIvBgAwCGJIwWiEAgcwglEpOZGwgvCGBANBmcAaIJ2BC4cPC4QwIga3BmEIeoIwBDoJhDF4j5DBgIABgGIGAROBMIYvEilBGAgvDAARIBGQL0FA4IwFF4YABJQIyBoczF4lEGA0JCwWUEoPd7qBCzIwDgAwGF4YXBpvd6iyBzORGAVAgLEEF4YwCF4IwEMYMzGAjECC4YwBF4IwEycxic0GAsN7vRiMZDIQvDBwItBS4IqBGAgQBAgIXCzovCLwItBS4MwgAwCF4XTn/xGIiODF4QwCF40z/4xERwYvCGAQvF7vf+CUEEobvCAAJgEF4Xd/6UEXgTvDAANAMAwwFCwgwESBAwFC4owCF43f/vUoaSCABAvCMAv/aQKSDAA8UF4JgG7/0oIWJGAhgG/9EC5YwCSA5eKFQiQIC5sQF4QwD6hfMGpAvBL5g1IhovVGAQvUGAMEF6owBF6owB")),
  },
  {
    width: 42,
    height: 62,
    buffer: require("heatshrink").decompress(atob("iIADzIAEA4QNEAAwUSBwOIAAWZogXECjgWFzPdogECCj5pDondIggUeSAYUjCISRDCQX/CpIUTXQgAEmf/CoIUaCZIUDgAUZRoYADCkIXHCg4BBgAUZX4y+BogUCogUccwgTB7vdCwIEBFA4UTHQYACCgQACogoJCiYAFCoYTHCigTHCoQnICioaJCRwUUHYbhBHpwUTXoQTCmczCpgUTcwYUB/8zAIIUfgDeBCoQUC/4UeRYQPBCoITCHxQUXCYMAgAVBmboKCjCUCAAQPFToIUaMgOIAAIUGBoIUYCoS9DNYIVECYwUWmYVBcIYVBokRBQIUbBoLhB7pjFOYQTGCixpCAwidCCY4UVCoYGFCYIUeBwLaGCZYUVDQ4TRChA")),
  },
  {
    width: 34,
    height: 60,
    buffer: require("heatshrink").decompress(atob("iIADzIADBAgOECCALBxAABAYIUDxAQVCQQNBogVFCDAAB7oRFCCwPCogQcNoQQCBoP/CI4QPS4gACmf/CIQQTBwwQEgGIfoQQPfIg1ECC6XFCA4ACCCYRFolECAVECCq5CbobeBAAPdCCgPECAYADoggHCCIRFB4YQQXYwSDOgwQPAAoQDBwMzmYRICB5SCGIYQZB4h0CEBoQKmf/oj/CCQQgHCB4PBAAJ1CxAWBEBAQRmYPBAgJCKCCIyCfoYQXCIKQBB4ndGoIQWiL4BgDaBS4IPBGw4QPBwQSCAgMzCoScECCg4FAAQQVB4IREABAQSAAQtGCCoRDOQYiMCBpxGCCoA==")),
  },
  {
    width: 44,
    height: 62,
    buffer: require("heatshrink").decompress(atob("iIAEzIADBAgPFCrIQBxAABAYIZDxAVfC4QSBogaFCsQAB7oWFCsAUCogVmSAQVCCQP/CxgVUYggACmf/CwQVdCYwVEgGIgAVbSoQADCsgYGCowACCroWFolECoVECr7wCAALyB7oXBAYJCJCqgUECoYADokzmYWFCrYWFNoIVceQwXDS4QUBCrYACRwQVDAoIXBCrznCMwRAFAAYpFCqf/mf/CgKZFohQGCrIACS4hFCCQ3dIgIVXIQIUDxAVIBAIVXCYJAFxGITIIVfCwMziOZAIIXEAAIVeAAQFBgBFEDITADCrUAAAoeDCwP/IAX/CrAPBog/CJQoWBHwJsFCrAWBCYpqCCgQNECqwUBCpJrCBooVUIBgABEQwVWokzChRPDCrA/NKIgxJCp4FEAB4VVA")),
  },
  {
    width: 38,
    height: 62,
    buffer: require("heatshrink").decompress(atob("iIADzIADBAgOECSgNBxAABAYIWDxASZCgQPBogXFCTgAB7oTFCTQRCogSgPYQSCB4P/CZISRVIgACmf/CYQSXCAwSEgGIgASVdgbvDCToVGCQwACCS4TFolECQVECTLPCe4b4BAAPdCTARECQYADogkJCSYTFCIoSSaIwUDEYwSTAATKCCQa4GCSwRC/8zog3CehASYaIkAmYTGCSYTBCIISEBIITGCSStEZ4YSceo7PBQpASSBAQVFaBISRgChBAIIRCxAkKCSAPBeQI5CK4ITG7oJBCSgRCPoYSFCIISVTwaiEzIREEAISTABH/AAIDBG4YSce4IAB/43MCSQRD7q1CEhwSQRwS1CCTqzDWwgSTA==")),
  },
  {
    width: 40,
    height: 60,
    buffer: require("heatshrink").decompress(atob("iIADzIAEA4QNEAAoTRBoOIAAWZogWECbQVFzPdogECCbpkDondIIgTcRIYThCASKDCIX/ChATSWIgAEmf/CgITYCRITDgATXQwYADCb4WHCY4BBgATXWwy1BogTCogTabYgSB7vdCoIDBEwwTSG4YACB4QACogmICaQAFCgYSGCaYSHCgQlHCagZIWIISNCaQ5DmYTB/8zCbq0DogThbYgTDExwTQWIszmazKCagWFbQNEgATcHwpoBomZgAULCaYUFgA8SCZlE7q5DHIITdBQPda4ITDRpQTXMQoUJCbLhCCgUzCgwTWCgIJFMxATVCgQABBYoACCa4IEBQwAICZwA=")),
  },
  {
    width: 36,
    height: 60,
    buffer: require("heatshrink").decompress(atob("iIANzIPOCI+ZABWICKwTDxGZogDBAAIRaHAfdCQoRXKQdECLhWCBIQRBAgP/CQwRQB4YAFmf/CQQRUK4YRIgGIgARUdIoReCQgRGAAQRVCQtEogRCogRXBoLqEdYIAB7oRWCAczmYRCAAdEEQ4RNOIR4CCQoQECKJxBogQCCIJcCPYPdCKo1CCIwIBG4QRUSYZ8BGgszUoQRSFIQSBdQbGDQQIVBCKIQCGILJCCAYRBRIKuCCKf/xARIiIRYK4ZYExBYDCKjDBxGICQdEAYQQCCKjcBBQKjFGgayDCKYAGT4gRSCQYRICAgRVCRYRYcIIRdCQSZCG44YFCKArCEiARQAAYTCChwRKA==")),
  },
  {
    width: 34,
    height: 60,
    buffer: require("heatshrink").decompress(atob("iIADzIADBAgOECCALBxAABAYIUDxAQVCQQNBogVFCDAAB7oRFCCwPCogQcNoQQCBoP/CI4QPS4gACmf/CIQQTBwwQEgGIfoQQPfIg1ECC6XFCA4ACCCYRFolECAVECCq5C7oADCQLABCCgPBBwkACgogECBwJFCAoPDCCAPFJgJ5BKYJjECCBqBBwf/mYQBAoMzmYRCCCIpCBAIPCA4gQSB4RrBboY6CoggGCCC+DB4YQBOogQRXwYQGU4YQUSYRTEdQgQTWYQzDB4gQVKooABBwYQSRAIQECYgQCHoQQWHQIQDXYLdDCB4RELYQPDCCyOGXYIPKCCAPGCAIgOCBpBLCCKyDBxYQMA==")),
  },
  {
    width: 36,
    height: 60,
    buffer: require("heatshrink").decompress(atob("iIANzIPOCI+ZABWICKwTDxGZogDBAAIRaHAfdCQoRXKQdECLhWCBIQRBAgP/CQwRQB4YAFmf/CQQRUK4YRIgGIgARUdIoReCQgRGAAQRVCQtEogRCogRXBoLqEdYIAB7oRWCAczmYRCAAdEEQ4RNOIR4CCQoQECKJxBogQCCIJcCPYwRRGoQRGBAITCCKoACPgI0FUYQSGCJpNDdQbGDQQQRTJooQECIIMBCMMRCKhwDPIMALAoZBCLQADxAABCAQRXogOBUYgUBCLTIDAAQSB/4RYB4oAB/4QDWQYROYowADgDHCCLASGCIYJDCKI2MDQwRQCQgcGQwwRRBAIAGB44RPA==")),
  },
  {
    width: 34,
    height: 60,
    buffer: require("heatshrink").decompress(atob("iIADzIADBAgOECCALBxAABAYIUDxAQVCQQNBogVFCDAAB7oRFCCwPCogQcNoQQCBoP/CI4QPS4gACmf/CIQQTBwwQEgGIfoQQPfIg1ECC6XFCA4ACCCYRFolECAVECCq5CbobeBAAPdCCgPDmczCAQADoggGCBkAA4RPBCIoPDCCAPDCAZXCOgoQQJYgQEBwJbBCIQQUBAIxFCCgPDboi7DEA4QPXwYPDCAJ1GCDQJCA4YQPB4hTEdQYQXgCXDB4YQVawQDBxAFBBwYQVAAYQBGAoABCCCqBBAcAAAIQGXYQQPCIcAYApACCCgPFAAX/XoQ5FCCwPBGQIPFCCIREmYOCB44QRTAabHCCAA==")),
  },
];

const stoppingBuffers = [
  {
    width: 44,
    height: 60,
    buffer: require("heatshrink").decompress(atob("iIAEzIACA4gOFAAwVTCQVEzOIDIdECsAWC7oWCAAIVkogVFCwIVgNggAECsARCAQX//4VC/4WJCqg8FCgIWCAQIVdM43/gEACYICBCriVBAAQVmIg4VmIQdETAVEogZBogVhzNE7oTB7oACCoYbBCrCbECQgVFIoIVeCwcACg4VbN4xrGCrgCBBwMAC4QNBBwYVeM4IABIYYABBgIUGCqv/iK1CCQOINwdEAwIVDC4QVVmf/G4QNBCooFCCoRRBCqv//4WBCpJsECrb0DC4QVDYYgHBCq8zCohEDNAIGBCrgTBCob4DZAQGCCgYZBCqoICAAqUBdwQUCKYLaCCsACBCwP/IAP/IBQVVCgQECCgRrBmYVfAAhACe4QUOCqzwCCoKCLCrYWDCiIVWeQYVY")),
  },
  {
    width: 48,
    height: 60,
    buffer: require("heatshrink").decompress(atob("iIAEzIAFBIYQFAAwXXDAVEzOIxAaCogXlDAPdDAYZBC8wPBC4oYBC8h2FC84VBB4QCB///C4X/DBQXWIIwWBDAQCBC8AWGCQMAgAVBAQIXgOwR4DC9JLGC83/JIuIoimColEDYNEC7wYCHYIACondCoPdAAQXDDoIXYCoT7CC4gAFC4RLBC7IWHDAkACw4XZToY9CJI51EC7ZICAoIJBCAMADIQJCC8IADCAQXDbIJHBDgIWJC7AABCgOIPAdEAwIXDDJIXWCwQXFAoQXCcIIXnOwgXjDIQXDaogHBC8JKDOQIGBC8zaGAwQWDDYIXeDYkADAIPBUoX/IxAXeAQIYB/5GB/5GMC64WCAgQWCOoMzC8YAEIwVEapIXhDANEC4KONC7oYDCyYXYDAIABC7QA==")),
  },
];

const waitingBuffers = [
  {
    width: 36,
    height: 62,
    offset: -1,
    buffer: require("heatshrink").decompress(atob("iIADzIACA4gNECKYOComZxAVDogRXBQfdCQQABCLITCogRFCQIRYLAgAFCQwRQBoR7C/5aECKwwF/4ABBAQDBCK4TD/8AgH/HQYRUYYYRGzICCCKgUECIoDBCLA3DolEB4IDBAAQRb7oMB7vdHIIRWCAYRCAAoRWCoozDCBQRRBQI3FERIRPPIbGBPIQiICKAQCdQRZDAYIRXCQIJB/4RDEhQRQGYP//7FEGpARQCAYREgEzERQRNAAIRCLIKkBCLg4CYoIABB5IRWAQQRcBoIODCRYRQB4INECLkRgH/ZAMACRgRSmbGBCIIFBmYWCCLAAC7oCBdgNEAgIRWBQY2B7oTBAwMzCYoRUBIIQBCQQGBHIYRUABwRRA")),
  },
  {
    width: 38,
    height: 62,
    offset: 1,
    buffer: require("heatshrink").decompress(atob("iIADzIACA4gNECSoPComZxAWDogSZBYfdCYQABCTYUCogSFCYISaLogAFCY4SRBwSCC/5fECTAzF/4ABBAQDBCTIUD/8AgH/HoYSWZwYSGzICCCSwVECQoDBCTQ6DolECAIDBAAQSd7oNB7vdHgISYCIYSCAAoSYCwo2DCJYSSBYI6FEhQSQQAbRBQAQkJCSIRCe4ReDAYISZCYIKB/4SDExYSRGwP//7QEHBISRCIYSEgEzEhYSOAAISCLwKtBCTw7CaAIABCBQSXAQQSeBwIPDCZgSRCAIOECT0RgH/aYMACYUzAgQSambRBBoIFBmdEgAAECSwAC7oCBfINECgIABCSwLDHIPdCgIRDEYgSWBYIRBCYSFBQwwSTABKpICR4A=")),
  },
];

const bg = {
  width: 384,
  height: 153,
  bpp: 8,
  transparent: 254,
  buffer: require("heatshrink").decompress(atob("i4ASj0evF4pFIDKYA/AEp//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5/bx+PB5vX64RFC54v3P/4v/P/4v/P/4v/P/4v/P/4v7CY5/VHIKxZACYvvP/4v/P/4v/P4/GAAR/BAAJP/P/5P/P/5P/F8sjkYnBO4oAHP64vHGKJfdF7p//P/5//P/4dTP4dIpB//P/5//P/5//F+p/TIIpDXMIohLF95//P/5//P/4APj0eP/5//P/5//P/4vxB4Z/XAH4AfP/4A/P/4A/P/4A/P/4A/P/4A/AB5/JTIaXJWZobFDpovvP/5//P/5//P/5//P/5//P/5//AAIPFCpp/JEpoABIIZHBL7IvvR45//P/5//P/5//P/5//P/5//P/IbTP6IAbJIpLXF+Z//F/5//F/5//F/5//F/5//F/5/tAH5//AH5//AH5//AH5//AH5//AH5//AH5//AH5//AH4AP4wACP4IABI/5//I/5//I/5//I/5//I/5//I/6B7PoNIpBF/P/5F/P/5F/P/5F/P/5F/P/5F/AHMejx//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//P/5//AHfGAAR/BAAJH/P/5H/P/5H/P/5H/P/5H/P/5H/QPZ9BpFIIv5//Iv4Aj6XSP/4A/P/4A/P/4A96XSP/4A/ACcejx//P/5//AEplB6XSAYJ//AH5//AH5//AHJlB6XSAYJ//AH5//AH5//AGPSAARhBA4oABA4ILBA4p//AH5//AH5//AE/SAARhBA4oABA4ILBA4p//AH5//AH5//AE5dB6QACAofX64HFAoZ//AH5//AH5//AFJdB6QACAofX64HFAoZ//AH5//AH5//AFJdB6XS6/XAYIFLCYJ//AH5//AH5//AFJdB6XS6/XAYIFLCYJ//AH5//AH5//AFZfB6XS6/XhgAEA4ILBB4J//AH5//AH5//AFpfB6XS6/XhgAEA4ILBB4J//AH5//AH5//AE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")),
};

const topSpeed = 15;
const timeout = 200;
let currentSpeed = 0;
let currentSonic = -1;

let drawTimeout, drawInterval, waitTimeout;
let bgScroll = [0, null];

const fullReset = () => {
  if (drawTimeout) clearTimeout(drawTimeout);
  if (waitTimeout) clearTimeout(waitTimeout);
  if (drawInterval) clearInterval(drawInterval);
  currentSonic = -1;
  currentSpeed = 0;
};

const start = () => {
  fullReset();

  drawInterval = setInterval(() => {
    draw("start");
    bgScroll[0] += currentSpeed;
    if (bgScroll[1]) bgScroll[1] += currentSpeed;
    if (currentSpeed < topSpeed) currentSpeed++;
  }, timeout);
};

const stop = () => {
  if (drawTimeout) clearTimeout(drawTimeout);
  if (drawInterval) clearInterval(drawInterval);

  drawInterval = setInterval(() => {
    if (currentSpeed <= 0) {
      clearInterval(drawInterval);
      draw("reset");
    } else {
      draw("stop");
      bgScroll[0] += currentSpeed;
      if (bgScroll[1]) bgScroll[1] += currentSpeed;
      currentSpeed--;
    }
  }, timeout);
};

const wait = () => {
  currentSonic = -1;
  currentSpeed = 0;
  if (drawTimeout) clearTimeout(drawTimeout);
  if (drawInterval) clearInterval(drawInterval);

  drawInterval = setInterval(() => draw("wait"), timeout);

  waitTimeout = setTimeout(() => {
    clearInterval(drawInterval);
    currentSonic = -1;
    draw("reset");
  }, 7500);
};

const queueDraw = () => {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    draw("reset");
  }, 60000 - (Date.now() % 60000));
};

const drawSonic = (action) => {
  let target;

  if (action === "reset" || currentSonic === -1) {
    target = defaultSonic;
  } else if (action === "start") {
    target = startingBuffers[currentSonic];
  } else if (action === "stop") {
    if (currentSonic > 1) currentSonic = 0;
    target = stoppingBuffers[currentSonic];
  } else {
    target = waitingBuffers[currentSonic];
  }

  sonic.width = target.width;
  sonic.height = target.height;
  sonic.buffer = target.buffer;
  sonic.offset = target.offset;

  g.drawImage(
    sonic,
    vw / 2 - 30 + (50 - sonic.width) + (sonic.offset || 0),
    86 + (65 - sonic.height)
  );

  if (action === "start") {
    if (currentSonic === startingBuffers.length - 1) {
      currentSonic = 6;
    } else {
      currentSonic++;
    }
  } else if (action === "stop") {
    if (currentSpeed <= 2) {
      currentSonic = -1;
    } else if (currentSpeed <= 14) {
      currentSonic = 1;
    } else {
      currentSonic = 0;
    }
  } else {
    if (currentSonic === waitingBuffers.length - 1) {
      currentSonic = 0;
    } else {
      currentSonic++;
    }
  }
};

const drawTime = () => {
  const x = vw / 2;
  const y = 24 + 25;

  const date = new Date();
  const timeStr = require("locale").time(date, 1).trim();
  const dateStr = require("locale").date(date).toUpperCase();

  g.setColor("#000");
  g.setFontAlign(0, 0).setFont("6x8", 5);
  g.drawString(timeStr, x + 3, y + 2);

  g.setFont("6x8", 1.5);
  g.drawString(dateStr, x + 1, y + 29);

  g.setColor("#fff");
  g.setFontAlign(0, 0).setFont("6x8", 5);
  g.drawString(timeStr, x, y);

  g.setFont("6x8", 1.5);
  g.drawString(dateStr, x, y + 28);
};

const draw = (action) => {
  if (bgWidth - bgScroll[0] < 0) {
    bgScroll[0] = bgScroll[1];
    bgScroll[1] = null;
  }

  g.drawImage(bg, -bgScroll[0], 24);

  if (bgWidth - bgScroll[0] < vw) {
    bgScroll[1] = bgScroll[0] - bgWidth;
    g.drawImage(bg, -bgScroll[1], 24);
  }

  drawSonic(action);
  drawTime();
  if (action === "reset") queueDraw();
};

// Settings
const settings = require("Storage").readJSON("sonicclk-settings") || {
  activeMode: false,
  twistThreshold: 1600,
};
let isSettings = false;

const settingsMenu = {
  "": { title: "Settings" },
  "Active Mode": {
    value: settings.activeMode,
    onchange: (v) => (settings.activeMode = v),
  },
  "Twist Thresh": {
    value: settings.twistThreshold,
    min: 800,
    max: 4000,
    step: 200,
    onchange: (v) => (settings.twistThreshold = v),
  },
  Exit: () => {
    isSettings = false;

    require("Storage").writeJSON("sonicclk-settings", settings);
    Bangle.setOptions({
      lockTimeout: 10000,
      backlightTimeout: 12000,
      twistThreshold: settings.twistThreshold,
      wakeOnTwist: !settings.activeMode,
    });

    E.showMenu();
    Bangle.setUI("clock");
    draw("reset");
    start();
  },
};

g.setTheme({ bg: "#0099ff", fg: "#fff", dark: true }).clear();

Bangle.on("lock", (locked) => {
  if (!isSettings) {
    if (locked) {
      stop();
    } else {
      start();
    }
  }
});

Bangle.on("twist", () => {
  if (settings.activeMode) {
    fullReset();
    draw("reset");
  } else {
    wait();
  }
});

Bangle.on("tap", (d) => {
  if (d.double && d.dir === "top") {
    fullReset();
    isSettings = true;
    Bangle.setLocked(false);
    E.showMenu(settingsMenu);
  }
});

Bangle.setOptions({
  lockTimeout: 10000,
  backlightTimeout: 12000,
  twistThreshold: settings.twistThreshold,
  wakeOnTwist: !settings.activeMode,
});

Bangle.setUI("clock");

Bangle.loadWidgets();
Bangle.drawWidgets();

draw("reset");

if (Bangle.isLocked()) {
  stop();
} else {
  start();
}
