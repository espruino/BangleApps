## Nixie clock

This clock displays the time in nixie-inspired numerals and works on both Bangle versions (1 and 2). It uses a generic
coordinate system (0 <= width < 1) and has helper functions to use inline.

The app makes use of a module called "m_vatch" which manages all the timers, and makes calls to functions in the 'main' file 
to manage drawing the background, time, and any data like sensor info, step counters, battery, etc. The idea is that it is
reusable if you write many watch apps... you just need to implement functions to draw the background (called on start, and every
time the 'mode' changes (regular and night mode), the time (which gets a call every second), and the data (also every second, 
except not in night mode)). 

Night mode is a mode that can be set manually or automatically, allowing the watch code to adjust colors and detail. Mainly, 
used as a night clock, you can draw no background, and use dim colors for your digits. If set to auto, the accelerometer is used so 
when the watch is placed on its side, it switches to night mode (your watch may need a tweak... and Bangle 2 is a different story!)

It also handles step counting so that it's stored on a daily
basis - survives a system reset, zeroes when the date changes and keeps a record in a history file by day.
