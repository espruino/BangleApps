const storage = require('Storage');

require("Font6x12").add(Graphics);
require("Font8x12").add(Graphics);
require("Font7x11Numeric7Seg").add(Graphics);

// Load settings from storage
function loadSettings() {
  return storage.readJSON("doomguy.settings.json", true) || {
    faceMetric: "battery",
    tempUnit: "C"
  };
}

// Reset hit counter
function resetHitCounter() {
  hitCount = 0;
  saveHitCounter();
}

function bigThenSmall(big, small, x, y) {
  g.setFont("7x11Numeric7Seg", 2);
  g.drawString(big, x, y);
  x += g.stringWidth(big);
  g.setFont("8x12");
  g.drawString(small, x, y);
}


// schedule a draw for the next minute
var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function clearIntervals() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  stopFaceAnimation();
}

function drawClock() {
  g.setFont("7x11Numeric7Seg", 3);
  g.setColor(1, 0, 0);
  g.drawString(require("locale").time(new Date(), 1), 70, 10);
  g.setFont("8x12", 2);
  // Yellow color for date
  g.setColor(1, 1, 0);
  g.drawString(require("locale").dow(new Date(), 2).toUpperCase(), 8, 8);
  g.setFont("8x12");
  const time = new Date().getDate();
  g.drawString(time < 10 ? "0" + time : time, 50, 8);
  g.setFont("8x12", 1);
  g.drawString(require("locale").month(new Date(), 2).toUpperCase(), 8, 30);
  g.setFont("8x12", 2);
}

function drawBattery() {
  // Draw "Batt" label in white
  g.setFont("6x8", 2);
  g.setColor(1, 1, 1);
  g.drawString("BATT", 5, 95);
  
  // Draw battery percentage in red
  g.setColor(1, 0, 0);
  g.setFont("8x12", 3);
  bigThenSmall(E.getBattery(), "%", 8, 120);
  
  // Draw lightning bolt (two yellow triangles) for charging indicator
  if (Bangle.isCharging()) {
    g.setColor(1, 1, 0); // Yellow
    // First triangle (left bolt)
    g.fillPoly([
      20, 155,  // Top vertex
      5, 155,   // Bottom left vertex
      20, 165   // Bottom right vertex
    ]);
    // Second triangle (right bolt)
    g.fillPoly([
      20, 148,  // Top vertex
      20, 160,  // Bottom left vertex
      35, 160   // Bottom right vertex
    ]);
  }
}


function getTemperature(){
  try {
    var temperature = E.getTemperature();
    var settings = require("Storage").readJSON("doomguy.settings.json", 1) || {};
    var useFahrenheit = settings.tempUnit === "F";
    
    if (useFahrenheit) {
      temperature = (temperature * 9/5) + 32;
      return Math.round(temperature) + "F";
    } else {
      var formatted = require("locale").temp(temperature).replace(/[^\d-]/g, '');
      return formatted || "--";
    }
  } catch(ex) {
    print(ex)
    return "--"
  }
}

function getSteps() {
  var steps = Bangle.getHealthStatus("day").steps;
  steps = Math.round(steps/1000);
  return steps + "k";
}


// Doomguy face sprites - stored as base64 strings (NOT decompressed yet!)
// We'll decompress ONE at a time when drawing to save memory
var doomguySprites = {
    normal_center: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AG91ioABoNFAIVRqNXDqNxqlEAAtUisXDZ9yGINBDAMtnstklEHgVRDp0RqI1CDYYACotFisSDptRK4VNDgtBHgUCDpsEig8BDYNNDwUUBINRgodNOwNUoo2CDgR1DqEWPBsBCYSwEiJzBAAMBgsAahlQDocUAIVVDgRYBiEVg47OorRBoNVoMUqhaBHwMFeRtQGIIaCAINUXQRBBJAQ7PHII2BLIIAEHwNQO5w0BZQNEAgNCDoaZCHZxSDAANCpYeEHgNnDpZYBqlC6XSd4O0olNkmyBIJ3OgtkilDDoPS6gcConT6fUT4IdMiCUBpsz6Y8BHoND6c9nohBaJrgBoktmYWBmgeB6Q6BAwKWBHZtUik9mfjDAIZBIIMzmZDBO5lyqg7BAAJ5BLwIBBloDBWYVSm4dJuhKBoruBppYBkhyBkb4BYAIBBo4dKFgNEotRiNVIIImBqrdCSoMUDpYNBJoMBiK5CC4IFBiRABiNEHZgWBkQdCisj6gbBgMiMINBLJd1KQIvBnapBonUmhjCDgNCBQNXHZRSCok9EAIDBnoDBpYIBpaZBi4dKilC2fSZ4LOBdwIFCoj2BoizMHYI1Bnstmcz6YeBAwQdCiqzMpoTDAAXjAgZfCHZd3cINC6g2CAQIjBAoRbBoJ2KAAKzBOYR0CGwMtMQSeCWRQABWYU0GwPUAgLLB6c+EIMkoIdMu8UVAU9mqvCoK3EoQcMu9EklDGYIaBDwVEPAM0Dp9UOQPTAQIbCoXT7sz6lLogdNig7BDwNDPQNDewQ7SO4KsCeYT2D6ktiQdNudEltDolUWgNNLgTRCDht3uVEoYaBAAPU6geC6SzBDp9UppvBAIK3BmgFBOwNFDp13uhQBKINCHAIkDkgcPLQZRBLgS7C6SxOAAZPBWoI3BAQQ6Bo4dRu61CZ4LQBSQIcTu8VOYLwBHgVEi4dTeYTuDoIbUAAk3DTIA/AH4AKA="))
    },
    normal_left: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AHFRAANUigBBAwVXDaFykNUogAB6QDColRqUnDp91HANEoXTofTD4NBHgNQDh8RDgfS6g7DokVisXDptwqlBC4ckAYUUio7BPJ1xqIVBDYlBqlULIMBg6wPoodBHAdFiIKBgsFsoeNgprBLYglCBIMBso8OiAWBN4KOBSAUVBQMFgNRDpocBqlFDQLMBLodFAwKWOLINBR4IBBDgZgBIAQ7NB4KPBK4TWED4I7BeBo7BC4lE2lCLYg7PZ4ND6VElskoXU2gEBkiFBaJwdB6QABGoICC6fT6lBLJztBoU9mYeCklD6c9nskLJ8BR4JZB6YeB6lNEgM9mieBDptVitQgtEGoIABmZYBmZZBO5osBO4NFgtDG4QDBltViLcCDptBosRgFEmndHQQLBDYNRqg7PqNQgEEaANQDYILCAQIdLNANEoMAkURgsViIiBgMiktEigdMBwJ2BqMioMBqhxBEIMikgqBO5hnBojRCIANEltBOgM9olCFQIdLosUDYPSDYIYBmYECoVCBQJ3NHIPTpskofUWQQZBpr1BoKzMHYPS6YTBnv9mYeBAoLVDDpl0SoM9HoIWCAQI+EosXDpdySoQVBAAQbCHgMtWgIdPodDDINEPQJ1Bmc9DgI7Nu9xCoMj6fUWASxBn09mlEo4cMPALpBGYR9BGoJhBmYlBDp11lstN4Q0BMAPS6g7B6dXDp1CoSqBVoS4BbARZQuNNpoWCLgLyBAwU9WRoACkkkVQVNSwaBBBAIcODoNNCgQeBD4a7CDp8loVDRwM9ZoKbEoIdPu43BNwIAEDwMkDiDxCGwJbCXQK4BoQdRu8UC4IABLAQjBdpw8Fig3BmczHINEqYcSu9ykXSHgctkUnDqaYCAAdHDaoA/AH4A/AEoA="))
    },
    normal_right: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AHFRAANUigBCisVi4dSitBogADoNFoNXDaF1isUDQUtlskAgI8BisnDhtyDgdD6fSHoY8BqMSDptwqNFCwPS6g6DokUqNVqAdNuNUCgNCO4o5BqNQiAdNkpZBD4KUFitFiEQqwdNiBZBSoYcBojYCgsBgsCDpkFU4MUDIIBBV4QABHQNRgIdMGISqBDYMUIINUDoI9CiIdMgNRqgBBDgZeDHwRZNFwKUBipzBTIp7DO5yRDAAW0W4kQLJpLBGgjyBkkkAQIeBqqzPoVC6QbBHIPS6ktlskosRLJqQBonT6fUHgM9HAO0ns9HaAdBCgIABDYIGDAoI7PqNEmcz6fSAARCBMAKWBHZsBolNnszHoYABmlFQgLRNolVipMBptDHoMz6U0oD1BHYMVo4dLiNEqNVig+BofTpodBQYQgBDph2BojyBisBqlNisAgAaBSoQdMiqJBkUhiBwBoNRgIHBQgNEigdLoNUVAMimkQgNRDoVCkRIDDpYVBCAND6VUKQNNklUij1DLJlFigbB6QTBki1BAgImB6gBBHZhZBV4MtGQPSWYPUmhFDO4MXHZdEls9dQMzd4XTnoADmhZMuSVB6YAE8YkBAoRkCDhQdBigPBLYIYCAQhIBLIIdLu6tBHgIWB6lCoYkBLYT8BqQdMkI7BPAQiBSQR9BLAUnDpl0GYMzc4L1CKYPdn0tEgIcMu91oaWC6XUDoR0BMINNkodNuNNoTGBZIRfBAAb5BHZ1CWQM9OQIDBAQQjCoIdNPARYC7qtBnpzBofS6SUNDoR3BOgdNoh7BEwNEm4dOuIYBNwJzE6VNklFDhwABVYMtPAPUXAPToZEBo4dQigVBaIoGCi4dQu9UDwJ7BoYcBHSaXCaYQAEoixPS4o3B78zWATsPAA0kkiYBmkkK6YdESgZXUAH4A/AFY"))
    },
    damaged1_center: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AG91ioABoNFAIVRqMnDiEUiNEAAVD6gDBosVqNBDp44Cok9AAMkmgeBisUiocOqNUCoNNlskAgI8CqgpBg4dNgsUilEoXSppcCBAIcBgNXLBwxBDwIADilUSoNRqFnDhlwCIJ2BDwIDBG4MRBQMFgMFLRlxCQNVip6BR4LPBA4JYBssQi47MqDtCDQVRZwIACHYNQPBg7CogBBagMFgjQCqMViFRLJh3BqhXBHYKRCAwI/BIYR3Pc4VFSwNRgK2CLwTwNGYUkC4QBB6LWDLgJZNSQLtEAAIjCDoUQSpl1ioSBloYED4hgBSp9C6c9kgfDls9ndEPAKVOolDnoABHAVL6YlBmg7RpszmYXBnYbC+YdBolQO5g7CkgYCHYM0EgPdDgNFiIdLuhoBoLSBLYMkpofBIIL4BihKBDpbDBU4MVqtRqNBoNVqrsBFALgBDpY5CoMRiMQqo6BiERgMSXQIsBLJkUkkSiEhiEBls0qESgMjPAItBShoADAoPT6RFCAAZZMJIMtWAQABeQYABoXTUoIdLGoKvBlpuBDgMz6QcD2S2BSplE2buBdQIDB8czEwIjBntBLJdyDoIYBHAQBCA4IJCltEq4dKu91NoQVCHQXTEAJ7CoMXDpdxCANDDgM0PYM0ps9nzQBWQI7MukUV4Y0BkiZBEoPT6g7Bo4dLu47CKgNFL4XBohaBmlCDht3qkkWIIyBAAVS6g7DDp0U6kj6ZTBdgXCWAMzPgKUMHYh3CLgPSAwfUkgcNPAQ5B6g8C6W0oXS6ZBBDqA0BOwdMAYSVBDqEUGYNCSAPdKwMtlsk6lBDp7oBCwM0OYU0K4KbBk4dPLQLJDolUEgMzDoIcQu90N4JVBkQCBno6Tu9yWoQACWINNkk3DqJ5CHoR4CokXDiR6DZgVCOiQdHAAVFDq4A/AH4A/AAo"))
    },
    damaged1_left: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AHFRqNUigBCitBqNXDqUVokUogADotBDqN1isVDgdD6QDBihFBHKA6BAAM9mlNkgGCDwI9Pgo6DHAQACPANFi47QHgQ4DoNBotFiodOgsBWQQfBqKUCEwMQqMFg46OLQVBDoNUiIlBAAUBPBo7BspbCoNQiFFWIQ6BqBaNiFQHQNFKwIgBgNULQUVsJZNgo6BqiPBOga6BBIJ5BLJsQCwdFkgDBKwLvCEgI7OKILqDAgIfBBAbSOOwVEoQfDAAodOgMFDRMkegQdNNwVC6cz6QbCoW0mc9kh3PLANEls9ns0LoQFBnstoKzORYNBHwPT6m9mm+mcz6fSLJtyZAYfBKwIZBolNA4IoBgQdLulFLIIBBHoc9WAUVqkVgodMcoVRgMRC4NE6gjCEgICBDpo5BisDmcRghUBiNQgMSHwQdLuNBSoUSDoNRotEqsQqNCkg/BDpd1DgMtkk7EANUoXSAYNLmh7BLJsRokj6RyBeYYEEmlFDpg7B6fToVEofS6czAYIKC6h3MuiUBok9AAMzAAIFCno7BkhZMu6NBloTBAAfzHAJXBIoMXDpjRCoQXCHoICC6aBCq4dMiqMCkczOQNEV4J6BLANBDpo8BZYI7BWwgeBPANHDht3ilNkgzCDYVRTwU0Dp9UklNVgRXBolblsjBAKUNaYTuBLIJyB6bzB6fdHYIcODoMtCwIACns7obwDDqFEprwBO4NFqiVCIAIdPDwJZBofUH4I3BofS6U3DqI8CHoPzXAIfBnocQeIUkRoJZBLAK7BkgdSu54CHoNNdwM064dTogdBnpYCEQMnDqZ5BeQTxB6VHDiY9DHIR7BDiwdBHoPS6gdYAH4A/AH4AiA"))
    },
    damaged1_right: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AH4AWqIABotBAIUVisXDaF1CgNEAAtBEwVHDp1xqNUigaCoQCBoo9SqFFDYo7CLgUQDhtygNBLA46CAAJYQDwMkHgVBqgaBHYU3LBqUCO4dESQQABgsVgIdMiASBio9BqMEohWDgNRgNQdhouBqMUKIMBqg8Eq1VSxsFKwIBBdIYGBSoQ6BDpp2Cog3BK4YjBHwUFgo7PSoY3BAgL4BilRHZ7rED4YHDaINWSptUdQIAGeoJaDDpg1CoYbEEgO0PwazOoktns9GoKRB2k9mfTHgQ7NZIIVBmYeB2kkps9IIdFHZsEonTAAIdBH4M9mhXBfIQ7MqNBqgTColNmfSKgI7DoNRo7QLWYKJBaoNC6fUokRAwI7CogdLqNFiguBGoNUoklisRoERIoQdMG4UiiEAgIkBokAiczkAkBAAMXHZdUilCklFPQcViUybAMkoNFHZcUC4U7LYNEoaUD2b0BEgI7LqsUoaQCpstZ4NNHIL6BaoKzNdwQ4B6dDmfTmfUXAPTa4JZMqNSofSCgIACnofBAgU9a4IdLu6mCDAIVB+c9DQQbBoQNBDhaWBOgIWCkczmgjCmlCQQIdNHYMkCwMk6iTCPIPSDgK+BDplyqnSVIQADps+EoIjBDhgdBoVNGYNEL4NFoktIYNEBIIdOrskO4QzBpkjWYQhBoIdOigbBlqRB6UkdYIdC6UnDpt3RoIACdgPbd4ZYBm4dOujvBSIKsBotNPYIICHZ9xZgSvB6nTEAIIDDp91OIJZCZoIAClskoNHDpxaBCwTvDoZ2CDiA8BoQWBpocBXAM0olCDiB4CHgSxBaAJ5BqYdRu6sBKgMzEIKTBoIcSPIQ9CK4R0RDoskoXSAIIdXAH4A/AH4AGA="))
    },
    damaged2_center: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AH4AWusVitBooBCqNRq4dSuNUogAEqkVi4cRGQNEilEoQcBoI8CqI5QDgIABns9lskHoZbQOoIVBpocBDwg9Bg4dOuFUK4Mk6fT6XSDgVFiodOuFRDgJZCohZEilRqCYNuMFgiyCSgQcFHh1wq0VHgVND4JZBDgIABgIdNusBgodBoI7DDYQ7BqC0NuEQCYNUoNEgLXBSQIABgNWHZ4dBVYIaCoNUAYJ3CSptwGIRxBDYIjBO4ZIBHZ0FSoQ7BigeBXQJDBeB47CDYLMCEIJ8BAAIMBHZw6BDIMkDAQcDAgJZOuBRCAAokBpacCDpsgSYNEkfT2g9D2k0mlBqEDDplFHYXTns9loeB2XT6fUPAMEDphpBHQMzmfj6Q5BnwGBmlEFYI7NdQNVonUmdNkfSmfUopGBUYIdMoAdCqtD6ZdBps9mlRAAYdMcIMViIwBog1BoICBDgZZOilQqkAgtQiNRqoEBgtAQgJZNoNFZQMRilVHAIfBoJCBih6BHZocBoUkXAIYBTwUiBYIhBDplxokiZoNEltDmfSAwc9olXDpl1iisBCgMz6YABAgIgBoVBDpo7BAAMzDgICBEIb4BosXDpl3kgdBnpUBDwIaBoc9BYIcOu8lNoMzEANNn0tqlNmfUklHDpwvBofT6lEkY6B4hDBmlEDqdCVYNNpcUTgM0ppZQoSNB6h2CoS7BAANCWRoACHYXS2jVBldC6QHBok3DqDmBplVokUqnEkizCDh93iiNBkm0d4Q+BofUoIdQujsB6VC7ocBki6CDiF3uTwBGwJTBoidBoYdSHgQ3BTIL2DWKC1FVwLSBTgNCDiaXC6c9SoUkHShbD6XUdaQA/AH4A/AFQA="))
    },
    damaged2_left: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AG91isVoNFAIVRqNXDqVxCwNUqlEAAIfBDqVQHQMUqlBDoQ+BBIMnHKNFDQQAFqNQDp1wGAIVBoVEls0AYNEigLBSaFRGgVNmlNnpcDHZ1wiFWWII7B6fUkhACLINRg46NgsBqkUCwMtknSHQUUilQWxo7BiEVZQIZCHYIcBqg7RssBoLQEDIIADDpo7Bd4NUHoKPBa4KwBAAMFi47NgMVgIxBiNEisQAoNVDoMQHZwcBgsUoo9Ba4NRL4JZCSpo7BgoZBK4J1BdQK6BLQQ7PsrvCSoY9BqlEXoI7PJoIaCZoIhEEQI7PLAVCDAYAEHZ52BGgNNlskDYkrDoI7NoDJBNwMj6fS6QbBoW0ns0orwNVgKtBqlNns9HgW0n0z6VBgJaMJYNUosQilDHgWy8cz6c9osVHZkUSgNBopcBmYfCnvSosBawI7MqhZBF4MVHgPUodEmk0qNVqI7NaAUViFQCwLvBotE6IpBHZx2BolAgEEoofCisAgFEqsBDptFGgIABiklLYNEIYMRoSCBoI7NKAIABkKbBLIQDBawR3NulEkk9mgUBpstmdE6QGBlskHRgdBilNknSc4LqBdgUyegPRo4dMuqVBHoUzmYCBEIU9LQJYMAANxKwUz6lMoYbBA4RcBDhp4CNoIdBolD8fS4lDQINFDp11DoMjGwIdBAYVE6YlBDp13ok06ZQBnstVwPEokzmlBDqHUG4PUKYM92lCnoHBk4dQkgdB7dLSAM03oHB6U3Dp4eBcwNEqlFotMO4JfBHaF3qQVBkm0oY4BoXSHYIdRilNSQUzmc9AAIGBDqLTBSYLKBAAVDMIIcQAAN0LQXUD4IcBXoIdSutNkfSkczawUko4dSPIc9O4VEoQcTagVC6avBOqg8ESgckoIdWAH4A/AH4AFA"))
    },
    damaged2_right: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AHEikkiAQskDqdVitFotEAQNBA4IbRusVitBogADqIACq4cOuURDQgADoI+BqMnHR45CoVD6QcFqMHDp0UDgXS6ktlskD4cVi4dNiNVDwU9DYNCDgkVgQdNJgJxC6XSpo6CogcBiFQDpsEilUig3CAAUUitRqFRgodNCQNFijtBG4bRDgsBDpsBCQNUiskoKuCAAVQLJ9Rqo1Bio5BgoFCAAVRiAdNCwJYCCoIYBqixBHoVWO5wdBoLLBqlRgNULgLRCO5w7BqgcBV4NEbIcVEAJ3OOgQACEIIfBXAkVHZ0RojuFAAdFoI7OiA2BAA8kMQJZOZQVC6c9mgYBIIO0AwJaCojuMVYND6cz6XUkgcB6XT6SbDHZgOBnvz6YXBpdNn0koEEHYKcBHZgABHoUzH4NDKwL4CqNUWhjDCqsUps9ofUAYKSBqoCBqNFHZxrCoK4BoNAgsAFQRaBHZrSBoEAXAMUiEFokAgC5BSptUqg5CGIVFTwNLiJ3BoNFLJikCokhNwJZCqkRegQGBHZl3ilCcoIABWoIECbYMtEAIcMLQITBkXTnoABls9mi5B6Y7BDppZC789mffmYAC6XUBYNVDpt1KoM9CgMznzwBppdDo4dNukUK4JtB6YZCEoM0AgMXDpx3BCgVNEIPESgQ7QuNUSIY9B6kUEIM0oQ7PO4PT6SrBEIMrpazBmlNoQcNHYNEkfT7ZyBHoKVBAgNCLBx4C6XSovFosU4m0ki7CDh4dBOoNEoVDoR5B6RiBDqVC6VLlczmfT6dNXYNBDqLSC6hTBAALQCDiAABWgTvBDgLWCSaAACqg1CLAJ1B6dEDqd3igeBO4JeBolXDiZ6CG4IAB6gbVTAZ4BaIIdXAH4A/AH4AGA="))
    },
    damaged3_center: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AEdyCidRqNUoICBokVAAIbRuoUBilBolFogACEYNXDp8hGwQADkgiBqlFiMnDp0FiocF6Q6BokUHiBXBDYVD6QcBHQNRPYMHLCVC6XT6YeCop4BqSUPK4ctmYdB6lBTgUQDptwqITBoVNnoACkgbBaiFxqh3BD4NDLIjZBHZ5ZBNoIXBHgMtHQIABqo7QVAQ9Bmi0CHgMUiJ3RAAI7CHINC6jSBHYMFHZ9RqsUpZVCEAURBYNQHZ1QiDTEHYZ1BgMBHZ0FspZCPYchoJkCHZ11sISBqjTBoIDBoruBiALBSp9QG4LTBAgYcDHZw5CDANRHQJ8BHQIKCiFCDhd0F4NEEAVFEANUAQIDBX4IdNCoQ0Bio7CSwKxBH4MRDpoZBWAQABOoNUpdD6XSHYNEDplQilC6SsCqjOBok9AAIFBiTuMLINDCYKxCokEonTAAJGBqhZNC4JaEAoQACHYKVPoq0BqFVisRooZBqT3BXgIdLuQdBoOyqsAZgIfBLwNbIoUiDpd3FwIAB2lLqqzBrkcpckLQQcMu52BloSBCoPTmfSogKBoRZBDpoZB6ckGYMjV4QeBoVNkg7PqVN+c9mY6BmYEE6kVDpt3GIIVB6fULIQCBnphBq4dOqlEoZVBAQM+klNns9MQMXHZ4dBns8TQIZBpYHBBYNHDpypBGgNEqo8BotU7s0XoJZPukUoStBqI1BqtUkfUQYM3Dp11oI7BknFqkUqtLpstkh2PHgVC2m0qNVqPB4lLoVFDiA8BKoJWBPoMcim0OwIdRuNEpYACldEDgMkHaTxCnpYBqtVoVE6KTPeQvTplCoScBkjsPDo0k4Wynu02XUDqqXBqlNmlFokTDijUCrkU6jRBDiy2BqPCoNciIdXAH4A/AH4AFA"))
    },
    damaged3_left: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/ADV1isUqkVoNFoNRqIcSqNUolEoICDosVisXDqEUDQQADHgIBBq5XQDYs9ktEEwNVHh91igaCoVElpaCotEisQk4dNuJ1CoXTAAIjCoKbBiA7PKAIXBoYeDPwMUqNVgIdNio0Cls9AARbBoq0BgNQDpsEO4dNmY6B6SVCqNQiDtOKAIBBknT6XSoYkBd4MQqI7ORQI9B2dNlpYB6VUoNQqMFHZxsBWYPUaQNC6VLaQI7BO50BqNRqlNklNKwMkolVLAVhHZwABDAQAC6jQCqEVLJ0FgAdBAANBihbBSgTQBWZ0QCYIdCTIVBZ4QeBqqzOqx3BDAVVDoNUDgLSCO6EUHAIECWAIABPIMFm4cMgsUio4BG4JeBdgMVgghCoQdLCII3CdAI0BTYJeBMQICBDplRDoKSBDQMEHoLVDAoQ7NKQMkoAEBjslitLls0DoNEmlSShtFF4NFiCXBSIM9noeBBQI7PC4NBqodBAAVC6RbCHZo5BZAgdDPAY7OUwMAgtVgsQiIGBplFW4JACDpd3HYMFpbmBLINR4JiCSwQcMHgNEqvCDoIjBilMpdR4g7CDprnCiJOB6cz6kkE4MjSwMVDpsRoUznsjDgPTAAQIBklFoIdNolNmYaDAYM9A4IdBoIdOulDC4IABmfj6hdB7skolFk4dNuNEDQPTogiBPwM9+XUWYNHHZwVBKAIdCSAJeBWQQ7OuoVC6lVps9agNC6Q7Bi4cNLIUtmjyBa4MVrdLIYMUq4dQonS2nBqMVrkUA4NEqI7PPANC2g7BgsVivEpYnBigcPHge0qm0AAMbMQMlDiC0Cog1BoVCpgFDDqN3ZwXF4NUqtTaAJ1QDwg9Cmg5BltHDid3kh4BoTNBDwMnDql1olU3stpkUoIcUAAVVqlCqNXDi93kQABoRXVAH4A/AH4AJA"))
    },
    damaged3_right: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AHNRqNUoNUogCBi4aRuQbBqNEilEAAVBolRDqFxioaBHAIABkgCBIIIdQisVoo4DonT6VFHgNXDp8FKoktmg7CPINBDx8VOoJWCoQ6B6R5DTB1wSYtNns9loHBqNFo6UOgsVLAc9mY8BAwNFilAHaBPBDwc9kk9aQQdOusBZwRaBoY6BptCA4MVHZ7RBCYNEpaTBpq0B2g7BqI7PRQKXBkgaBoR3CDgIdOHYNlHoKyBPQQ8CBIMQHaEFikUOQLzCWQVRqA7OiFQHYQABAYdBFAI7PLAI9BDoa3BitFLAJ3QDgNVZQI2BbANRisFO51yF4IABiNUigGCbANRiAGBiQdLuinCoNVilUOwIBBH4IIBIQIdNcQIWCqNBqhaCTwUQiIdLuIaBCoNEWwNRoVRilLTgVAHZl1oKRBok0HgVNitUoXT6QrBig7MHINUlszKYMQC4MVofTns0opZMuiTBJ4VEZQMReYaCBSp4ACH4MBqFQA4VVFQNFLJgdBHYJxB4MAgJ5BqFVqEAbIIdMHgbnCpjtDqPCooFBDhgdBWQMtkpvBokkmlEKoJHBoodNuoYBnskGYOzV4M9MQKYCDptxG4PTmcz2fkmc9AIUz2hZOu4vBd4I3Bls+mfdmYmB6lHDpx3BoQVCoZZBmgGB6dEDp7nCkYVBPgKVBlohBokXDpyvCHANFqlD6iaBMAMkq5ZQilNnodBps0ovEEoQ7PuVUqlC6VEqsUqtRoW9lsVDp48BitLpdMitRitcQISUPAAMVoIVBoNVitFoO02ktHSF3uKXBHgNbpcrpg7CDqI8BZYKSBolFqOyPwIcRu8iZwXEiJcBlskoQdSHgRbCnu06Y6TPIlULgIiBq4dUuUiolboXUqsyk4dUAANRqqVBqobWAH4A/AH4AG"))
    },
    critical_center: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/AHFRqNUoICCosViobRuoUBilBolFolEAgIjBq4dPuI2BDIIACkghCisXK6I1CAAXSDgMULgMHDp0FigaCoXSoZaCD4JaQOoIdC6YAB6gFBqNBoNSSh46DoYdB6RgCqlRqAdNuFRVwVNnszDwgLBiKyOqhZBoJ2BDYVNSoJZBHZxZBCQJaCDoKXDqNViruPNoI9BnstAAJ/CFIJ3QAANUKgI+Com0ioABgI7PAANEkQdCpskolFDoMQHZ1QCQMUHYYcBLAIcBLJ1xgtgHYIABoJ7BaAQACWZ1hVANUZYI/BDgJYBqFRHZxLBgsRc4QiBolAWAJ3PugQBoI7Big2BiNUA4IiBHYNCDplQiNEgMVqIdBgpABgsFqo7BoYdMiFUqgxBDoT0Bio7CLgNEDpjtCqsFLwMFgIdBgtUpgIBLJo7BcwLICEAMUqPBqlKIYMUaBgOBoXBqsQLYUEitFqVLFIMSLJqwBWYI7CogABBQLzBM4LRNVYNMiNQVgK6BEoVBHYJ3NGAISBqEAHgNQioFBrY5BoodMu4bBoSUCKgQDBaIJdBoIcMu8UokkovBCoMkmXUbINUoQdPHYRsBolD6cz6dE4PBBQNFHZ1UnsrkfTnocBAQOzoc9kkVDpt3KoO+2c9HYPz6XT6W9mlEo4dOPAU9nstmc+mhaBoR7Bq47QppQBAYQHB2nCAYMXDp10olLofUqhaBoscDYIdTltNpi1BnsVqnB4XSoR3PuIwBpcVdQNRqtRDoJ2QHgdUpdVqtcqvB2gnBDiA8C4W0qPKokcXgPCqIdRutEC4PE2my2gDBigdSu8V4mzoNEplUawPBDiV3uUUWgNLa4VEWB4AFGwNLoQeBptLWKJ5FqPEHYNCDioABktcjdbqjOSag1R4LuBWCYA/AH4A/ABQ"))
    },
    critical_left: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/ADN1isVoNFilUilRAAIcRCYNUolEoICBooEBqsVi4dPisUDQQADilFIQIdPK4IbFmgeDMYMnDptxK4VEklC6XUDgJ6BisQDp11HAfTAAJaDqlRqBaNuBYBig6Bls9AAMkS4I7BgNQHRsUDgNEps9mfT6XSSgRZBio7NOwlDDgVNA4KUBqMAShrtCHoJ2B6VEobYBoNRgo7PoJ5BWINNPINEpdUHYMQsA7OHgMUpdElrTBMIUVqC0BWZwABDYMtTIUk6QoBWYMFWZsBHYQbBOYNC6kkilVgNViA7ORAJTCDoICCHYNQiDvOgNlDoTpBH4LtEAQI7NiAxBDALKBAgIcCqoCBqw7NC4J4CDIJABEIIcBioMBm4dLJgIVBijzBEQVBSINVqgCBoQdLcINFAQNRoFVgsUbQUVigpBDpgQBolVLgVQDAQ5BotBqjZBDpYTBolQDQLWBLIJzB4NMikdmlSHZsVoo8BD4R/B4NLmjbBoo7NJYKqCWQSzBrhkBokUoJ3NC4NcWwUBDANEFAQABio7NB4MAiu0gpaBiEAqu0oI7BSpt1HAKOBokReIdVLIQABDhd3uIPBZIMVqgYBEoNVDwcUDpl1HANFPQMtmc9nskrkbofSPgI7Ooc7oez6fTmYCB2VDEINFoodMukUCYM9n09mfjDoPS2YdBoNBDpgeBCwIACHQPUklE7s0olUk4dNLQJXBRgPTGwNE2lC6lEoIdOuh4B6fbSwIdCpdEAYNFHZ9D6k9oNUVoNFrlFog7BiodOuozCdINUAYNR4PCMINHDhp3COAPBqsViodC2h2QAANElgeBDQIbB4m0IANCDh93ihvBokbLoO1oIkBokSDqCnB2m04lCDIIFBqlBi4dQu8Vok0oPEqnEoi6BqIcReIVE5dC2VLpsk4KTQAAVyDoNElZYBkiTSagu1D4KbBoNXDql3otV4nE4PBDapbCkQADDq4A/AH4A/AAw="))
    },
    critical_right: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A/ADVxoNBokkilCokUigdTksRqkUD4IABikVDiVRqIcBqgcColFokVi4cRCoIADlskH4VRk4dOgNRDQR0BDgPSolBqkVDp9Rqo5DpodBklEPwQdOuEQiqOBK4Uz6fULAQBBDpt1godBLAU9AAJ4DqkQHZ0VcwJYCno7B6YGBoKhBHZyVBGQNBoQeBSwTSCLJw7BO4UUps06fSO4O0ilRoA7QoqMBoXSpskPgIABFQI7Pso9CdYJ7CaQJYBqA7PWgMUqgYBAAIDBSgIABO6BbBDYSaBAANFilQaJ11g0BqFUOIcUpcUHYILBHZ5NBDINBooDBolRqsQqqVOupZBD4NUGwVVWAQABLJt0RIQCBqlUHYK4BqMFHYUXDpgxColQisRoAXBii8BipbBq4dNGQNEqpWBoNQIAJhBBANRDplxRgIBBqFQiNQqsBqkBrkV4IdNujrDoo0BKgJ9BotFiIEBDpo5BAAPBKgMQaIVEqlV2qVOopZCjkUgJYBEoVViKjBWZ1BDwNLosAgKPBqG0iEAqhZNWgYwBDQJ+Be4VVqgrBDhh4ESoIiCkgkBqsUoNFDpt1C4M7SwIEBmc9loGB4ghBDptxG4PTmdDnoABmYGB2kzkhZOu60BlobCDgIDClsz6lDDpyzBolD6YCCHYPSpYCBk4dOqiWB2k9SQI5BolLIoMkDp8UYwNNkfEqnT6hEBpkjogcOu7NCnlNoNUls0qvE4lNaBwABirrCpdV4NRqtViscklHDp4eCWwNBqodBjkcpXSDqcsjdMiFRovB4W1ogdRuMVHYOx4my2lEjksoQcQDwVF2jRBAAO12QDBDqVyqtD6XE2tMijxBHad3iK2Dkm06VMDiZaBqtE5dEO4KTSAAtEawXBm4cWaoNV4PB4ocXAH4A/AH4AjA="))
    },
    godMode: {
      width : 60, height : 60, bpp : 4,
      transparent : 7,
      buffer : require("heatshrink").decompress(atob("u4A/AH4A8qIABqkUAIUVAAIbQuVCisUogABloDCosVkUXDp1wio5CoXT6VCDoI8CDp11io0Cps9AYUkAYNBqoeOuEUAAJWBkg5CDYIcCgIdNutRolUogbDoiWBToNWiAdNgJ1CDYYcBXQVRgFVgLOQDgdBaAcQqMBqAdMgoTBigZCijNBAAVQiABBDpguBNwJbBAIJeCoqWBJANVHZw6CoMVoqcBAASXCsAdMJwNBoggBDYiYBBIMVqI7ODAgABpabEqMFHZwbEoVLeYMkewS2BHZ8tnsklstolNknS7c9olRaJpzBDoU9HAUkogGBlskJQI7Pnsz6fULgXTAAI7BLJw7CmYdBGwIACA4JiBopZNgodB78+KYQBBEYPfDoL5BDhbDBqkUitUN4JZCps9otBotFNAIdLLITPCeYzRCDptRqgUDAoVBignDoNRDpgSCp//OgNEndE6nv/80BgIPBDpQrColDn8+OgJ6Bp0j+bRBQ4QdKDgVEp3eG4NCeQXepoLBaQMRDpVFilDofSCYLsCAQMkoXSofUiJZMqlL6bMDnvj6YkBogGBmlFSptD6fTHIQcBAYYAB6lBDpd3ZQMtDghZBLYS7BklBDhd3aIQ9B8ez6ffEYRcDoodMHYKuBKoIEBXYRhCklEWRYABuIVGkixBIQKgCo4dMug2BKQPSIIIABqhhBIYIdOutC6hvBOAadCBANEmkXLKIYBLQK6CoY7B6g7OLISuCGwLQDEgMlHZp4BptD6gyB6XULoVNDoI6NDoSrBOoYADoYjBDp54CGQJVDpstlp9BLBwABKAKQBZgPeAQJDB6VCDh4dBHIMtH4NBLAXTLCAeDGwYBCDgNEDiN3kirBlsjZ4kiDqV3iiXBeIM9mhdBDid3uq2CDgSwRAAlwiruEoIdVAH4A/AH4AkA"))
    }
  }

// Animation state
var faceDirection = "center"; // current direction: "center", "left", or "right"
var faceAnimationTimer;

// Hit counter state
var hitCount = 0;
var hitCountDate = "";

// Get today's date as a simple string (YYYY-MM-DD)
function getTodayString() {
  var d = new Date();
  return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

// Load hit counter from storage
function loadHitCounter() {
  var today = getTodayString();
  var stored = storage.readJSON("doomguy.hits.json", true) || {};
  
  if (stored.date === today) {
    // Same day, restore the count
    hitCount = stored.count || 0;
  } else {
    // New day, reset counter
    hitCount = 0;
    saveHitCounter();
  }
  hitCountDate = today;
}

// Save hit counter to storage
function saveHitCounter() {
  var today = getTodayString();
  storage.writeJSON("doomguy.hits.json", {
    date: today,
    count: hitCount
  });
}

function animateFace() {
  // Randomly look left or right occasionally
  var rand = Math.random();
  if (rand < 0.1) {
    faceDirection = "left";
  } else if (rand < 0.2) {
    faceDirection = "right";
  } else {
    faceDirection = "center";
  }
}

// Helper functions for different metrics
function getBatteryLevel() {
  return E.getBattery();
}

function getHeartRateLevel() {
  var hr = Bangle.getHealthStatus().bpm || Bangle.getHealthStatus("last").bpm;
  if (!hr || !isFinite(hr)) return 0;
  // Normalize heart rate to 0-100 scale (inverted - lower HR = more damage)
  // Assuming normal range is 60-180 bpm
  var normalized = Math.max(0, Math.min(100, ((hr - 60) / 120) * 100));
  return 100 - normalized; // Invert the scale
}

function getTemperatureLevel() {
  try {
    var temp = E.getTemperature();
    var settings = loadSettings();
    var useFahrenheit = settings.tempUnit === "F";
    
    if (useFahrenheit) {
      temp = (temp * 9/5) + 32;
    }
    
    // Normalize temperature to 0-100 scale (inverted - extreme temps = more damage)
    // Assuming normal range is 20-40°C (68-104°F)
    var minTemp = useFahrenheit ? 68 : 20;
    var maxTemp = useFahrenheit ? 104 : 40;
    var normalized = Math.max(0, Math.min(100, ((temp - minTemp) / (maxTemp - minTemp)) * 100));
    
    // Invert so that extreme temperatures (both high and low) cause more damage
    // Normal temp (around 50% of range) = healthy, extremes = damaged
    var distanceFromCenter = Math.abs(normalized - 50);
    return distanceFromCenter * 2; // Scale to 0-100
  } catch(ex) {
    return 50; // Default middle value
  }
}

function getStepsLevel() {
  var steps = Bangle.getHealthStatus("day").steps;
  var stepGoal = 10000; // Default step goal
  return Math.min(100, (steps / stepGoal) * 100);
}

function getHitsLevel() {
  // Normalize hit count to 0-100 scale
  // More hits = more damage (inverted scale)
  return Math.max(0, 100 - Math.min(100, hitCount * 2));
}

function getMetricValue() {
  var settings = loadSettings();
  switch(settings.faceMetric) {
    case "battery": return getBatteryLevel();
    case "heartrate": return getHeartRateLevel();
    case "temperature": return getTemperatureLevel();
    case "steps": return getStepsLevel();
    case "hits": return getHitsLevel();
    default: return getBatteryLevel();
  }
}

function drawDoomguyFace() {
  var isCharging = Bangle.isCharging();
  var faceImage;
  
  // God mode when charging
  if (isCharging) {
    faceImage = doomguySprites.godMode;
  } else {
    // Select face based on selected metric
    var metricValue = getMetricValue();
    var spriteKey;
    
    if (metricValue > 80) spriteKey = "normal";
    else if (metricValue > 60) spriteKey = "damaged1";
    else if (metricValue > 40) spriteKey = "damaged2";
    else if (metricValue > 20) spriteKey = "damaged3";
    else spriteKey = "critical";
    
    faceImage = doomguySprites[spriteKey + "_" + faceDirection];
  }
  // Draw the face in the middle section (between the HUD panels)
  // Adjust x, y coordinates to center the face
  g.drawImage(faceImage, 60, 105);
}

function startFaceAnimation() {
  if (faceAnimationTimer) clearInterval(faceAnimationTimer);
  // Animate face every 2-3 seconds
  faceAnimationTimer = setInterval(function() {
    animateFace();
    draw();
  }, 2500);
}

function stopFaceAnimation() {
  if (faceAnimationTimer) clearInterval(faceAnimationTimer);
  faceAnimationTimer = undefined;
}

function flashYellow() {
  // Flash between two background colors twice
  var flashCount = 0;
  var flashInterval = setInterval(function() {
    if (flashCount % 2 === 0) {
      // First color flash - red background
      g.setBgColor(1, 0, 0); // Red background
      g.clear();
      // Draw damaged2_center face during flash
      g.drawImage(doomguySprites.damaged2_center, 60, 105);
    } else {
      // Second color flash - yellow background
      g.setBgColor(1, 1, 0); // Yellow background
      g.clear();
      // Draw damaged2_center face during flash
      g.drawImage(doomguySprites.damaged2_center, 60, 105);
    }
    flashCount++;
    if (flashCount >= 4) { // 2 flashes = 4 toggles
      clearInterval(flashInterval);
      draw(); // Ensure we end on normal display
    }
  }, 100); // Flash every 100ms
}

function onFaceTap() {
  // Check if we've moved to a new day
  var today = getTodayString();
  if (hitCountDate !== today) {
    hitCount = 0;
    hitCountDate = today;
  }
  
  hitCount++;
  saveHitCounter();
  flashYellow();
}

function drawHeart(x, y, size) {
  // Draw a heart using filled circles and triangle
  g.setColor(1, 0, 0); // Red
  
  // Left circle (top-left lobe)
  g.fillCircle(x - 5, y, 5);
  
  // Right circle (top-right lobe)
  g.fillCircle(x + 5, y, 5);
  
  // Bottom triangle (point of heart)
  g.fillPoly([
    x - 8, y,      // Left top corner
    x + 8, y,      // Right top corner
    x, y + 16      // Bottom point
  ]);
}

function drawHUD() {
  // Left section - Battery area
  g.setColor(0.4, 0.4, 0.4); // Solid gray for battery section
  g.fillRect(0, 95, 50, 176);
  
  // Right section - Heart rate area  
  g.setColor(0.4, 0.4, 0.4); // Solid gray for BPM section
  g.fillRect(180, 95, 130, 176);  
  // Connecting line across the top
  g.setColor(0.3, 0.3, 0.3);
  g.fillRect(0, 95, g.getWidth(), 93);
  
  // Draw heart in lower right corner
  drawHeart(150, 155, 16);
  
  // Draw hit counter
  g.setFont("8x12", 1);
  g.setColor(1, 1, 1); // White
  g.drawString("Hit:" + hitCount, 60, 98);
}

function draw() {
  queueDraw();

  g.clear(1);
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, g.getWidth(), g.getHeight());

  // Draw HUD panel first
  drawHUD();
  
  // Draw Doomguy face
  drawDoomguyFace();

  g.setFontAlign(1,1);
  g.setFont("8x12", 2);
  g.setColor(1, 0, 0);
  var hr = Bangle.getHealthStatus().bpm || Bangle.getHealthStatus("last").bpm;
  var hrStr = (hr && isFinite(hr)) ? String(Math.round(hr)) : "--";
  g.drawString(hrStr, 165, 140);
  g.drawString(getSteps(), 170, 85);
  g.drawString(getTemperature(), 35, 85);

  g.setFontAlign(-1,-1);
  drawClock();
  drawBattery();

  // Hide widgets
  for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
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
    startFaceAnimation();
  }
});

Bangle.setUI("clock");

// Set up touch handler for double-tap on Doomguy face
Bangle.on('touch', function(button, xy) {
  // Check if tap is within Doomguy face area (60x60 sprite at position 60, 105)
  if (xy && xy.x >= 60 && xy.x <= 120 && xy.y >= 105 && xy.y <= 165) {
    onFaceTap();
  }
});

// Load hit counter from storage
loadHitCounter();

// Load widgets, but don't show them
Bangle.loadWidgets();
require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
g.clear(1);
draw();
startFaceAnimation(); // Start the face animation
