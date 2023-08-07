# Sixth Sense ![](app.png)

Clock displaying just the right information at the right time.

Experimental clock face. It aims to display just the right importation
at the right time, with focus on various sensors. Normally, digital
clock, date and step count in kilometers is displayed.

It saves a lot of logs for debugging and future use. In particular, it
saves battery and step counters all the time, and GPS positions
whenever it is enabled. You may not want to use it if you are secret
agent or journalist in Iran.

Application can be controled by gestures, making control possible in
challenging conditions such as on horseback. Gestures are based on
morse code, left half of screen is for ".", right half of screen is
for "-". Gesture should always start in the upper half of screen. If
next symbol is same, drag vertically, else drag horizontally.

Power saving GPS mode is available, suitable for hiking. GPS fix is
acquired once every few minutes, and written into the log. Approximate
distance travelled is displayed. Due to only taking fix every few
minutes, real distance will be usually higher than approximation.

Useful gestures:

F -- disable GPS.
G -- enable GPS for 4 hours.
N -- take a note and write it to the log.

When application detects watch is being worn, it will use vibrations
to communicate back to the user.

E -- acknowledge, gesture understood.
T -- start of new hour.

Written by: [Pavel Machek](https://github.com/pavelmachek)

## Future Development

I'd like to expand GPS development more, allowing marking of waypoints
and navigating back to them. I'd also like to make power-saving
optional.

I'd also like to utilize the altimeter more, likely remembering
altitude of home location, automatically correcting for pressure every
night.

I'd like to make display nicer, and likely more dynamic, displaying
whatever application believes is most important at the time (and
possibly allowing scrolling).