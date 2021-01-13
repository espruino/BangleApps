Astral Clock
============
Clock that calculates and displays Alt Az positions of all planets, Sun as well as several other astronomy targets (customizable) and current Moon phase. Coordinates are calculated by GPS & time and onscreen compass assists orienting.

![screenshot](./Example.PNG)  
<sup>(The clock does have Pluto now - felt bad for leaving it out)</sup>

Functions
---------
**BTN1**: Refreshes Alt/Az readings. The coordinates are NOT continually updated, this is to save resources and battery usage plus it avoids you having to wait for calculations to finish before you can do anything else on the watch - it doesn't take long but it could still be annoying.  
**BTN2**: Load side-menu as standard for clocks.  
**BTN3**: Changes between planet mode and extra/other targets - discussed below (will still need to press button 1 after switching to update calcs).  
**BTN4**: This is the left touchscreen, and when the LCD is on you can use this to change the font between red/white. This will only work after the GPS location has been set initially.  

The text will turn blue during calculation and then back again once complete.

When you first install it, all positions will be estimated from UK as the default location and all the text will be white; from the moment you get your first GPS lock with the clock, it will save your location, recalculate accordingly and change the text to red, ideal for maintaining night vision, the calculations will also now be relevant to your location and time. If you have not used the GPS yet, I suggest using it outside briefly to get your first fix as the initial one can take a bit longer, although it should still just be a minute or 2 max normally.   
Lat and Lon are saved in a file called **astral.config**. You can review this file if you want to confirm current coordinates or even hard set different values \- although be careful doing the latter as there is no error handling to manage bad values here so you would have to delete the file and have the app generate a new one if that happens, also the GPS functionality will overwrite anything you put in here once it picks up your location.

There can currently be a slight error mainly to the Az at times due to a firmware issue for acos (arccosine) that affect spherical calculations but I have used an estimator function that gives a good enough accuracy for general observation so shouldn't noticeably be too far off. I\'ll be implementing acos for better accuracy when the fix is in a standard release and the update will still include the current estimate function to support a level of backward compatibility.

The moon phases are split into the 8 phases with an image for each - new moon would show no image.

The compass is displayed above the minute digits, if you get strange values or dashes the compass needs calibration but you just need to move the watch around a bit for this each time - ideally 360 degrees around itself, which involves taking the watch off. If you don't want to do that you can also just wave your hand around for a few seconds like you're at a rave or doing Wing Chun Kuen.

Also the compass isn\’t tilt compensated so try and keep the face parallel when taking a reading.

Additional Astronomy Targets
----------------------------
There are currently 12 extra targets as default in the config file, and these were selected based on well known named objects listed in various sources as good choices for both binoculars and telescopes. The objects are processed and then 9 are displayed and ordered descendingly by altitude on the basis those higher up will have better visibility.

You can input different objects rather than those listed in the galaxies/extras mode by changing the astral.config file with the relevant details for: Object name, Right Ascension and Declination, below is an example. Again, there is little in the way of error handling to streamline the app so be sure to input these in exactly the same format as you see in the file, namely signed 6 digit values with double quotes, example:

*{"name": "Andromeda", "ra": "004244", "de": "411609", "type": 3}*

The type property is not utilised as yet but relates to whether the object is (in order): a cluster, nebula or galaxy. If you try putting more than 12 or so, the clock will try processing all of them but I advise against doing that because you will get memory errors if you put in too many. A better approach is to put a limited set in seasonally based on what's best in your location.

Updates & Feedback
------------------
Put together, initially at least, by \"Ben Jabituya\", https://jabituyaben.wixsite.com/majorinput, jabituyaben@gmail.com. Feel free to get in touch for any feature request. Also I\'m not precious at all - if you know of efficiencies or improvements you could make, just put the changes in. One thing that would probably be ideal is to change some of the functions to inline C to make it faster.

Credit to various sources from which I have literally taken source code and shoehorned to fit on the Bangle:

-Stephen R. Schmitt:
https://codepen.io/lulunac27/full/NRoyxE

-(Not sure who put this one together initially):
http://www.voidware.com/moon_phase.htm
