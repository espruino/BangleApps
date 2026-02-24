const CONFIG = {
  refreshInterval: 300000,
  alarmThreshold: 5,
  apiUrl: "https://api.coingecko.com/api/v3/simple/price?ids=monero,minotari,bitcoin&vs_currencies=eur&include_24hr_change=true"
};

const coins = [
  { id: "monero", symbol: "XMR", icon: "M", price: 0, change24h: 0, lastPrice: 0 },
  { id: "minotari", symbol: "XTM", icon: "T", price: 0, change24h: 0, lastPrice: 0 },
  { id: "bitcoin", symbol: "BTC", icon: "B", price: 0, change24h: 0, lastPrice: 0 }
];

var lastUpdate = "";
var isLoading = false;
var refreshTimer = null;

function formatPrice(price) {
  if (price >= 1000) {
    return price.toFixed(0) + "\x80";
  } else if (price >= 1) {
    return price.toFixed(2) + "\x80";
  } else {
    return price.toFixed(5) + "\x80";
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
  return changePercent >= CONFIG.alarmThreshold;
}

function drawScreen() {
  g.clear(1);
  g.setFont("6x8:2");
  g.setFontAlign(0, -1);
  g.setColor("#fff");
  g.drawString("CRYPTO TICKER", g.getWidth() / 2, 5);

  g.setFont("6x8:2");
  g.setFontAlign(-1, -1);

  var y = 35;
  var lineHeight = 40;

  coins.forEach(function(coin) {
    g.setColor("#fff");
    var iconStr = "[" + coin.icon + "]";
    g.drawString(iconStr, 5, y);

    g.drawString(coin.symbol, 35, y);

    g.setFontAlign(1, -1);
    var priceStr = coin.price > 0 ? formatPrice(coin.price) : "---";
    g.drawString(priceStr, g.getWidth() - 5, y);

    g.setFont("6x8");
    var changeStr = formatChange(coin.change24h);
    g.setColor(getChangeColor(coin.change24h));
    g.drawString(changeStr, g.getWidth() - 5, y + 20);

    g.setFont("6x8:2");
    g.setFontAlign(-1, -1);

    y += lineHeight;
  });

  g.setFont("6x8");
  g.setColor("#888");
  g.setFontAlign(0, 1);
  g.drawString(lastUpdate || "Tap to refresh", g.getWidth() / 2, g.getHeight() - 15);

  if (isLoading) {
    g.setColor("#ff0");
    g.drawString("Loading...", g.getWidth() / 2, g.getHeight() - 30);
  }
}

function drawLoading() {
  g.clear(1);
  g.setFont("Vector", 20);
  g.setFontAlign(0, 0);
  g.setColor("#fff");
  g.drawString("Loading...", g.getWidth() / 2, g.getHeight() / 2);
  g.setFont("6x8");
  g.drawString("Fetching prices", g.getWidth() / 2, g.getHeight() / 2 + 25);
}

function fetchPrices() {
  if (isLoading) return;

  isLoading = true;
  drawScreen();

  Bangle.http(CONFIG.apiUrl).then(function(data) {
    var response;
    try {
      response = JSON.parse(data.resp);
    } catch (e) {
      showError("Parse error");
      return;
    }

    coins.forEach(function(coin) {
      if (response[coin.id]) {
        coin.lastPrice = coin.price;
        coin.price = response[coin.id].eur || 0;
        coin.change24h = response[coin.id].eur_24h_change || 0;

        if (checkAlarm(coin)) {
          Bangle.buzz(200);
        }
      }
    });

    lastUpdate = require("locale").time(new Date(), 1);
    isLoading = false;
    drawScreen();
  }).catch(function(err) {
    isLoading = false;
    showError(err.toString().substring(0, 20));
  });
}

function showError(msg) {
  g.clear(1);
  g.setFont("Vector", 16);
  g.setFontAlign(0, 0);
  g.setColor("#f00");
  g.drawString("ERROR", g.getWidth() / 2, g.getHeight() / 2 - 15);
  g.setColor("#fff");
  g.setFont("6x8");
  g.drawString(msg, g.getWidth() / 2, g.getHeight() / 2 + 10);
  g.drawString("Tap to retry", g.getWidth() / 2, g.getHeight() / 2 + 30);
}

Bangle.setUI({
  mode: "custom",
  touch: function() {
    fetchPrices();
  },
  btn: function() {
    fetchPrices();
  }
});

g.clear(1);
drawLoading();
fetchPrices();

if (refreshTimer) clearInterval(refreshTimer);
refreshTimer = setInterval(fetchPrices, CONFIG.refreshInterval);
