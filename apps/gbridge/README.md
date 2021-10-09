Gadgetbridge
=============

This widget allows your Bangle.js to communicate with the Gadgetbridge app on an Android phone.

Download the [latest Gadgetbridge for Android here](https://f-droid.org/packages/nodomain.freeyourgadget.gadgetbridge/).

This app supports:

* Displaying Notifications
* Song display and control
* Call answering 
* Find My Phone / Find My Bangle
* Activity reporting

You can also add [the weather widget](https://banglejs.com/apps/#weather)


Notifications
-------------

By default a notification at the top of the screen is displayed. If you'd like a fullscreen notification
(which will involve leaving the current app) then install [Fullscreen Notifications](https://banglejs.com/apps/#notifyfs)


Song display and control
------------------------

When the Song Display notification is showing on the screen and a song is playing, you 
can swipe left or right on the screen to go to the next or previous song.


Find My Phone
-------------

Go to `Settings`, `App/Widget Settings`, `Gadgetbridge`, `Find Phone`, `On`

If in range and connected your phone should start ringing.


Find My Bangle
-------------

Onyour phone `Settings`, `App/Widget Settings`, `Gadgetbridge`, `Find Phone`, `On`

If in range and connected your phone should start ringing.


Activity reporting
------------------

You'll need a Gadgetbridge release *after* version 0.50.0 for Actvity Reporting to be enabled.

By default heart rate isn't reported, but it can be enabled from `Settings`, `App/Widget Settings`, `Gadgetbridge`, `Record HRM`


## Troubleshooting

1. Switch to using one of the stock watch faces like s7clk or wave on a Bangle 2.

2. Check that the battery charge level is being seen by the Gadgetbridge App on the phone.  This proves that data is getting to your phone.

### You can test the notifications on the Bangle

First disconnect from Gadgetbridge on your phone. Then connect
through the IDE and enter the following code.  You should get a pop
up screen on your Bangle.  This proves that the watch is correctly
setup for notifications.


    GB({"t":"notify","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"})


NOTE: On a Bangle 2, this will fail if you have not installed 'Notifications Fullscreen'.

### Check that notifications are getting through to your Bangle

* Disconnect your Bangle from Gadgetbridge on your phone.
* Connect through the IDE
* Run the following bit of code

        var log = [];
        function GB(d) {
          log.push(JSON.stringify(d));
        }

* Disconnect from the IDE
* Connect your Bangle to Gadgetbridge
* Call your phone to get a missed call
* Disonnect your Bangle to Gadgetbridge
* Connect through the IDE
* Run the following bit of code

        log;

If notifications are getting through then you should see something like.


        >log
        =[
          "{\"t\":\"call\",\"cmd\"" ... "r\":\"0191xxxxxxx\"}",
          "{\"t\":\"call\",\"cmd\"" ... "r\":\"0191xxxxxxx\"}"
         ]


IMPORTANT: Now reset your Bangle using a BTN3 long press so that the GB() function is restored.

## References

[Bangle Gadgetbridge Page](https://www.espruino.com/Gadgetbridge)

[Gadgetbridge Project Home](https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Home)

