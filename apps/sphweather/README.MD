# SPH Weather

Simple weather forecast app with graphs for temperature and prob. of rain

**Motivation**

I wanted to click on the forecast at the clock and see the full weather forecast, so there it is. The visual style is based on my clock design.

The data comes from a json locates on the clock, that is sent regularly to my phone via BLE. The data can be retrieved with the following command:

```
curl wttr.in/sorocaba?format=j1 | jq "[.weather[] | {hourly:[.hourly[] | {tempC: .tempC|tonumber, chanceofrain: .chanceofrain|tonumber, weatherDesc: .weatherDesc[0].value, weatherCode: .weatherCode | tonumber}], date, mintempC: .mintempC | tonumber, maxtempC: .maxtempC|tonumber, avgtempC: .avgtempC | tonumber}]"
```

**Features**

- Graph for forecast temperature, with highlight for the min/max temp and a line for the avg
- Graph for forecast chance of rain
- Icons for the next 
