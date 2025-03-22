# Crypto-Coin Info

Crypto-Coins Infos with the help of the Binance and CoinStats API

## Description

- Is a clock_info module and an app
- I use Pebble++ watch to show a bigger size of clock_info
- I use a wider, more readable font for Pebble++

![Screenshot01](screenshots/20250316_01.jpg)
![Screenshot02](screenshots/20250316_02.jpg)

## Creator

Martin Zwigl

## Parts Infos

### Clock-Info

- Updates prices with the free Binance API
- clkInfo updates after around 15 sec and then every x minutes (via settings) thereafter.
- The token you want to have tracked and compared to what currency have to be uploaded via app loader web-interface
- After that you can decide which token to display in settings

### App

- Using CoinStats for chart-data
- token-names on CoinStats are different to Binance; they also have to be uploaded via Interface
- You also need a CoinStats API access key which is good for a fair amount of calls
- I tried with gridy for the axis, but for this data - it is just not readable...
- Let me know when you have good suggestions for improvement.
- "..." button shows current details for current token
- Swipe L-R changes token you supplied via interface
- Not much guard-rails in the app -> you should have at least one token (each) present
- Also the API token

### Settings

- Choose which of the uploaded tokens to display in clock_info
- Choose update-time for clock_info HTTP requests to Binance