Alpine Navigator
================
App that performs GPS monitoring to track and display position relative to a given origin in realtime.

Functions
---------
Note if you've not used GPS yet I suggest using one of the GPS apps to get your first fix and confirm as I've found that helps.  

The GPS and magnetometer will be turned on and after a few moments, when the watch buzzes and the dot turns from red to pink, that means the GPS is fixed. all your movements now will be displayed with a line drawn back to show your position relative to the start. New waypoints will be added based on checking every 10 seconds for at least 5 meters of movement. The map will scale to your distance travelled so the route will always remain within the window, the accelerometer/pedometer is not used - this is a purely GPS solution so can be used for driving/cycling etc. A log file will be recorded that tracks upto 1000 waypoints, this isn't a big file and you could remove the limit but I've kept it fairly conservative here as it's not intended as a main feature, there's already good GPS route recorders for the Bangle. The following other items are displayed in this mode:

1. altitude at origin, this is displayed left of the centre.  
2. current altitude, displayed centre right  
3. distance from origin, bottom left (meters)  
4. distance travelled, bottom right (meters)  
5. compass heading, at the top  

The buttons do the following:  
BTN1: this will display an 'X' in the bottom of the screen and lock all the buttons, this is to prevent you accidentally pressing any of the below. Remember to press this again to unlock it to access the other buttons!  
BTN2: this removes all waypoints aside from the origin and your current location; sometimes during smaller journeys and walks, the GPS can give sporadic differences in locations because of the error margins of GPS and this can add noise to your route.    
BTN3: this will pause the GPS and magnetometer, useful for saving power for situations where you don't necessarily need to track parts of your route e.g. you're going indoors/shelter for some time. You'll know it's paused because the compass won't update it's reading and all the metrics will be blacked out on the screen.
