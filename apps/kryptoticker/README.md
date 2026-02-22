# Krypto Ticker for Bangle.js 2

Displays real-time cryptocurrency prices for Monero (XMR), Minotari (XTM), and Bitcoin (BTC) in EUR.

## Features

- **3 Cryptocurrencies**: XMR, XTM, BTC prices in EUR
- **24h Change**: Shows percentage change (green = up, red = down)
- **Auto-Refresh**: Updates every 5 minutes
- **Manual Refresh**: Tap screen or press button
- **Price Alarms**: Vibrates when price changes >5%

## Requirements

- **Bangle.js 2** smartwatch
- **Android phone** with Bangle.js Gadgetbridge app
- **Gadgetbridge**: "Allow Internet Access" must be enabled

## Setup

### 1. Install Gadgetbridge
Download the Bangle.js version of Gadgetbridge:
- [Google Play Store](https://play.google.com/store/apps/details?id=com.espruino.gadgetbridge.banglejs)
- [F-Droid](https://f-droid.org/en/packages/com.espruino.gadgetbridge.banglejs/)

### 2. Enable Internet Access
1. Open Gadgetbridge
2. Tap your Bangle.js device
3. Tap the gear icon (settings)
4. Enable "Allow Internet Access"

### 3. Install Android Integration
On your Bangle.js, install the "Android Integration" app from the App Loader.

### 4. Upload Krypto Ticker
1. Open [Web IDE](https://www.espruino.com/ide/)
2. Connect to your Bangle.js
3. Upload `kryptoticker.app.js` as a new file named `kryptoticker.app.js`
4. Upload the info file by running in the IDE console:
```javascript
require("Storage").write("kryptoticker.info",{
  "id":"kryptoticker",
  "name":"Krypto Ticker",
  "src":"kryptoticker.app.js",
  "icon":"kryptoticker.img"
});
```

## Usage

- **Refresh prices**: Tap screen or press button
- **Auto-refresh**: Every 5 minutes when connected to phone

## API

Uses the free CoinGecko API:
```
https://api.coingecko.com/api/v3/simple/price
```

## License

MIT