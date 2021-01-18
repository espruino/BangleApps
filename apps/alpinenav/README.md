Alpine Navigator Clock
======================
Clock that includes GPS monitoring that tracks and displays position relative to a given origin in realtime. Also includes ambient temperature estimate, moonphase and local sunrise and sunset times.

Functions
---------
There are 2 main modes of the clock, the first is the timekeeping mode, which includes the following features other than time and date:

1. ambient temperature estimate - right now this is literally just 5 degrees offset from the CPU temperature sensor so not the most accurate but can be useful for seeing relative changes. It's closer to reality when you're not wearing it, skin temperatures can fluctuate wildly even for one person so I didn't attempt to factor this in.
2. sunrise & sunset times - these will only be displayed after the first time your location is recorded and saved to a config file, and you'll need to use Navigation mode to do this. After using Navigation mode once, these will always be updated.  
3. moonphase icon - 8 phases.

In this mode the buttons work as follows:  
BTN1: puts the clock into navigation mode   
BTN2: loads the sidemenu/app launcher  

Navigation mode  
Note if you've not used GPS yet I suggest using one of the GPS apps to get your first fix and confirm as I've found that helps.  

When you press BTN1 to enter navigation mode, the display will move the clock to the top and put a waypoint marker in the centre of the screen for your current location. The GPS and magnetometer will be turned on and after a few moments, when the watch buzzes and the dot turns from red to pink, that means the GPS is fixed. all your movements now will be displayed with a line drawn back to show your position relative to the start. New waypoints will be added based on checking every 10 seconds for at least 5 meters of movement. The map will scale to your distance travelled so the route will always remain within the window, the accelerometer/pedometer is not used - this is a purely GPS solution so can be used for driving/cycling etc. A log file will be recorded that tracks upto 1000 waypoints, this isn't a big file and you could remove the limit but I've kept it fairly conservative here as it's not intended as a main feature, there's already good GPS route recorders for the Bangle. The following other items are displayed in this mode:

1. altitude at origin, this is displayed left of the centre.  
2. current altitude, displayed centre right  
3. distance from origin, bottom left (meters)  
4. distance travelled, bottom right (meters)  
5. compass heading, at the top  

The buttons do the following:  
BTN1: will clear all route details from the app (route log will remain) and turns the watch back to timekeeping mode  
BTN2: this removes all waypoints aside from the origin and your current location; sometimes during smaller journeys and walks, the GPS can give sporadic differences in locations because of the error margins of GPS and this can add noise to your route.  
BTN3: this will pause the GPS and magnetometer, useful for saving power for situations where you don't necessarily need to track parts of your route e.g. you're going indoors/shelter for some time. You'll know it's paused because the compass won't display a reading and all the metrics will be blacked out on the screen.  
BTN4: this will display an 'X' in the bottom of the screen and lock all the buttons, this is to prevent you accidentally pressing any of the above. Remember to press this again to unlock it to access the other buttons!  
To access the app launcher from here, you just need to go back to the timekeeping mode with BTN1 and the you can press button 2 as normal.  

Updates & Feedback
------------------
Put together, initially by “Ben Jabituya”, https://jabituyaben.wixsite.com/majorinput, jabituyaben@gmail.com although ripped off a lot of other great open source code. Feel free to get in touch for any feature requests/feedback.
