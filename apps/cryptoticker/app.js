const DEFAULT_SETTINGS = {
  fiat: "eur",
  coins: [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price: 0, change24h: 0, lastPrice: 0 },
    { id: "ethereum", symbol: "ETH", name: "Ethereum", price: 0, change24h: 0, lastPrice: 0 },
    { id: "monero", symbol: "XMR", name: "Monero", price: 0, change24h: 0, lastPrice: 0 }
  ]
};

var settings = require("Storage").readJSON("cryptoticker.settings.json", 1) || DEFAULT_SETTINGS;

var coins = settings.coins.map(function(c) {
  return {
    id: c.id,
    symbol: c.symbol,
    name: c.name || c.id.charAt(0).toUpperCase() + c.id.slice(1),
    price: 0,
    change24h: 0,
    lastPrice: 0
  };
});
var fiat = settings.fiat || "eur";

var lastUpdate = "";
var isLoading = false;
var hasData = false;
var errorMsg = "";
var refreshTimer = null;

function getCurrencySymbol() {
  var symbols = {
    eur: "\x80",
    usd: "$",
    gbp: "\x9C",
    jpy: "\xA5",
    chf: "Fr",
    aud: "A$",
    cad: "C$",
    cny: "\xA5"
  };
  return symbols[fiat] || fiat.toUpperCase();
}

function formatPrice(price) {
  var sym = getCurrencySymbol();
  if (price >= 1000) {
    return price.toFixed(0) + sym;
  } else if (price >= 1) {
    return price.toFixed(2) + sym;
  } else {
    return price.toFixed(5) + sym;
  }
}

function formatChange(change) {
  if (change === null || change === undefined) return "--";
  var sign = change >= 0 ? "+" : "";
  return sign + change.toFixed(1) + "%";
}

function getChangeColor(change) {
  if (change === null || change === undefined) return "#888";
  return change >= 0 ? "#0f0" : "#f00";
}

function checkAlarm(coin) {
  if (coin.lastPrice === 0 || coin.price === 0) return false;
  var changePercent = Math.abs((coin.price - coin.lastPrice) / coin.lastPrice * 100);
  return changePercent >= 5;
}

function drawScreen() {
  g.clear(1);
  g.setFont("Vector", 20);
  g.setFontAlign(0, -1);
  g.setColor(g.theme.fg);
  g.drawString("CRYPTO", g.getWidth() / 2, 2);

  var y = 28;
  var lineHeight = 38;

  coins.forEach(function(coin) {
    g.setColor(g.theme.fg);
    g.setFont("Vector", 16);
    g.setFontAlign(-1, -1);
    g.drawString(coin.symbol, 3, y);

    g.setFont("Vector", 16);
    g.setFontAlign(1, -1);
    var priceStr = coin.price > 0 ? formatPrice(coin.price) : (isLoading ? "..." : "---");
    g.drawString(priceStr, g.getWidth() - 3, y);

    g.setFont("Vector", 12);
    var changeStr = formatChange(coin.change24h);
    g.setColor(getChangeColor(coin.change24h));
    g.drawString(changeStr, g.getWidth() - 3, y + 18);

    y += lineHeight;
  });

  g.setFont("Vector", 10);
  g.setFontAlign(0, 1);
  
  if (errorMsg) {
    g.setColor("#f00");
    g.drawString(errorMsg, g.getWidth() / 2, g.getHeight() - 2);
    g.setColor(g.theme.fg);
    g.drawString("Tap to retry", g.getWidth() / 2, g.getHeight() - 14);
  } else if (isLoading) {
    g.setColor("#ff0");
    g.drawString("Loading...", g.getWidth() / 2, g.getHeight() - 2);
  } else if (hasData) {
    g.setColor(g.theme.fg);
    g.drawString("Updated: " + lastUpdate, g.getWidth() / 2, g.getHeight() - 2);
  } else {
    g.setColor(g.theme.fg);
    g.drawString("Tap to load prices", g.getWidth() / 2, g.getHeight() - 2);
  }
}

function buildApiUrl() {
  var ids = coins.map(function(c) { return c.id; }).join(",");
  return "https://api.coingecko.com/api/v3/simple/price?ids=" + ids + 
         "&vs_currencies=" + fiat + 
         "&include_24hr_change=true";
}

function fetchPrices() {
  if (isLoading) return;
  
  errorMsg = "";
  
  if (!Bangle.http) {
    errorMsg = "Connect Gadgetbridge";
    drawScreen();
    return;
  }

  isLoading = true;
  drawScreen();

  var apiUrl = buildApiUrl();
  Bangle.http(apiUrl, {timeout: 15000}).then(function(data) {
    var response;
    try {
      response = JSON.parse(data.resp);
    } catch (e) {
      isLoading = false;
      errorMsg = "API parse error";
      drawScreen();
      return;
    }

    var gotData = false;
    coins.forEach(function(coin) {
      if (response[coin.id]) {
        gotData = true;
        coin.lastPrice = coin.price;
        coin.price = response[coin.id][fiat] || 0;
        coin.change24h = response[coin.id][fiat + "_24h_change"] || 0;

        if (checkAlarm(coin)) {
          Bangle.buzz(200);
        }
      }
    });

    if (!gotData) {
      isLoading = false;
      errorMsg = "No data received";
      drawScreen();
      return;
    }

    lastUpdate = require("locale").time(new Date(), 1);
    hasData = true;
    isLoading = false;
    drawScreen();
  }).catch(function(err) {
    isLoading = false;
    var errStr = err.toString();
    if (errStr.indexOf("timeout") >= 0 || errStr.indexOf("Timeout") >= 0) {
      errorMsg = "Request timeout";
    } else if (errStr.indexOf("network") >= 0 || errStr.indexOf("Network") >= 0) {
      errorMsg = "Network error";
    } else {
      errorMsg = errStr.substring(0, 18);
    }
    drawScreen();
  });
}

Bangle.setUI({
  mode: "custom",
  touch: function() {
    fetchPrices();
  },
  btn: function() {
    Bangle.showClock();
  }
});

g.clear(1);
drawScreen();
fetchPrices();

if (refreshTimer) clearInterval(refreshTimer);
refreshTimer = setInterval(fetchPrices, 300000);
