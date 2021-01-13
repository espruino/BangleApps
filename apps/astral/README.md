Astral Clock
============
Clock that calculates and displays Alt Az positions of all planets, Sun as well as several galaxies and current Moon phase. Coordinates are calculated by GPS and onscreen compass assists orienting.

![screenshot](./Example.PNG)

Functions
---------
**BTN1**: Refreshes Alt/Az readings. The coordinates are NOT continually updated, this is to save resources and battery usage plus it avoids you having to wait for calculations to finish before you can do anything else on the watch - it doesn't take long but it could still be annoying.  
**BTN2**: Load side-menu as standard for clocks.  
**BTN3**: Changes between planet mode and extras/galactic targets (will still need to press button 1 after switching to update calcs).  
**BTN4**: This is the left touchscreen, and when the LCD is on you can use this to change the font between red/white. This will only work after the GPS location has been set initially.  

The text will turn blue during calculation and then back again once complete.

When you first install it, all positions will be estimated from UK as the default location and all the text will be white; from the moment you get your first GPS lock with the clock, it will save your location, recalculate accordingly and change the text to red – ideal for maintaining night vision, the calculations will also now be relevant to your location and time. If you haven’t used the GPS yet, I suggest using it outside briefly to get your first fix as the initial one can take a bit longer, although it should still just be a minute or 2 max normally.   
Lat and Lon are saved in a file called ‘astral_config’, which is generated when you first launch the app. You can review this file if you want to confirm current coordinates or even hard set different values – although be careful doing the latter as there’s no error handling to manage bad values here so you’d have to delete the file and have the app generate a new one if that happens, also the GPS functionality will overwrite anything you put in here once it picks up your location.

There can currently be a slight error mainly to the Az at times due to a firmware issue for acos (arccosine) that affect spherical calculations but I have used an estimator function that gives a good enough accuracy for general observation so shouldn’t noticeably be too far off. I’ll be implementing acos for better accuracy when the fix is in a standard release and the update will still include the current estimate function to support a level of backward compatibility.

The moon phases are split into the 8 phases with an image for each - new moon would show no image.

The compass is displayed above the minute digits, if you get strange values or dashes the compass needs calibration but you just need to move the watch around a bit for this each time - ideally 360 degrees around itself, which involves taking the watch off. If you don't want to do that you can also just wave your hand around for a few seconds like you're at a rave or doing Wing Chun Kuen.

Also the compass isn’t tilt compensated so try and keep the face parallel when taking a reading.

You can input different objects rather than those listed in the galaxies/extras mode by changing the astral_config file with the relevant details for: Object name, Right Ascension and Declination, below is an example. Again, there’s little in the way of error handling to streamline the app so be sure to input these in exactly the same format as you see in the file, namely signed 6 digit values with double quotes, example:

*{name: "Andromeda", ra: "004244", de: "411609", type: 3}*

The type property relates to whether the object is (in order): a cluster, nebula or galaxy.

Updates & Feedback
------------------
Put together, initially at least, by “Ben Jabituya”, https://jabituyaben.wixsite.com/majorinput, jabituyaben@gmail.com. Feel free to get in touch for any feature request. Also I’m not precious at all - if you know of efficiencies or improvements you could make, just put the changes in.

Credit to various sources from which I’veliterally taken source code and shoehorned to fit on the Bangle:

-Stephen R. Schmitt:
http://www.convertalot.com/celestial_horizon_co-ordinates_calculator.html

-(Not sure who put this one together initially):
http://www.voidware.com/moon_phase.htm
