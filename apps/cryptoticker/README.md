# Crypto Ticker

Displays real-time cryptocurrency prices with configurable coins and fiat currency.

## Features

- **Configurable Coins**: Choose up to 3 cryptocurrencies
- **Configurable Fiat**: EUR, USD, GBP, JPY, CHF, AUD, CAD, CNY
- **24h Change**: Shows percentage change (green = up, red = down)
- **Auto-Refresh**: Updates every 5 minutes
- **Manual Refresh**: Tap screen or press button
- **Price Alarms**: Vibrates when price changes >5%

## Requirements

- **Bangle.js 2** smartwatch
- **Android phone** with Bangle.js Gadgetbridge app
- **Gadgetbridge**: "Allow Internet Access" must be enabled

## Configuration

### Via App Loader

1. Open the [Bangle.js App Loader](https://banglejs.com/apps/)
2. Connect your Bangle.js
3. Find "Crypto Ticker" and click the settings icon
4. Configure your coins:
   - **CoinGecko ID**: The coin's API identifier (e.g., `bitcoin`, `monero`, `ethereum`)
   - **Symbol**: Display symbol (e.g., `BTC`, `XMR`, `ETH`)
5. Select your preferred fiat currency
6. Click "Save & Upload"

### Finding CoinGecko IDs

Visit [coingecko.com/en/coins](https://www.coingecko.com/en/coins) to find the correct ID for your cryptocurrency.

### Default Configuration

If no settings are saved, the app uses:
- Monero (XMR)
- Minotari (XTM)
- Bitcoin (BTC)
- Fiat: EUR

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
