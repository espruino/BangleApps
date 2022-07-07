# A-GPS Data

Load assisted GPS data directly to the watch using the new http requests on Android GadgetBridge.

Make sure:
* your GadgetBridge version supports http requests
* turn on internet access in GadgetBridge settings

The widget loads the data in the background every 12 hours. It retries every 10min if the http request fails. It is only visible during a request or on error. 

## Creator
[@pidajo](https://github.com/pidajo)
