# Adv Casio Clock

<img src="https://user-images.githubusercontent.com/2981891/175355586-1dfc0d66-6555-4385-b124-1605fdb71a11.jpg" width="250" />


An over-engineered clock inspired by Casio watches.<br/>
It has a dedicated timer, a scratchpad and can display the weather condition 4 days ahead.<br/>
It uses a custom webapp to update its content.<br/>
Forked from the awesome Cassio Watch<br/>

## Functionalities

- Current time
- Current day and month
- Footsteps
- Battery
- Simple Timer embedded  
- Weather forecast (7 days)
- Scratchpad 

## Screenshots
Clock:

<img src="https://user-images.githubusercontent.com/2981891/175355586-1dfc0d66-6555-4385-b124-1605fdb71a11.jpg" width="250" />

Web interface to update weather & scratchpad <br/>
<a href="https://adv-casio-bangle-updater.herokuapp.com/">https://adv-casio-bangle-updater.herokuapp.com/</a> 

<img src="https://user-images.githubusercontent.com/2981891/175355578-444315e3-03d8-4d60-a1a9-e8ed7519d52b.jpg" width="250" />

## Usage
### How to update the tasks list / weather
- you will need a <a href="https://openweathermap.org/price#weather">free openweathermap.org api key</a>. 
- go to https://adv-casio-bangle-updater.herokuapp.com 
  - Alternatively you can install it on your own server/heroku/service/github pages, the web-app code is <a href="https://github.com/dotgreg/advCasioBangleClock/tree/master/web-app">here</a>
- fill the location and the api key (it will be saved on your browser, no need to do it each time)
- edit the scratchpad with what you want
- click on sync
- reload your clock!

### How to start/stop the timer
- swipe up : add time (+5min)
- swipe down : remove time (-5min)
- swipe right : start timer
- swipe left : stop timer

## Issues, suggestions and bugtracker
<a href="https://github.com/dotgreg/advCasioBangleClock/issues">https://github.com/dotgreg/advCasioBangleClock/issues</a>

## Code repository (bangle app and web app)
<a href="https://github.com/dotgreg/advCasioBangleClock">https://github.com/dotgreg/advCasioBangleClock</a>

## Creator 
<a href="https://github.com/dotgreg">https://github.com/dotgreg</a>



