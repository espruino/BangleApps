# pooq Roman: a classic watch face with amusing dynamicity

This is a normal watch face for telling the time.
It is unusual in that it supports the 24 hour clock by dynamically updating the labels on the face
(so, if you enable 24 hour mode, you will get to see a hand pointing to XXIII o'clock each evening).

The date and day of the week can also be displayed, and they choose their own spelling depending on the available screen space. It's fun!

## Options

Because sometimes I don't want to burn what I'm cooking and other times I'm lazy and just want to know if it's afternoon yet,
you can alter the number of hands on the display. When the watch is unlocked, slide up to add minute and second hands, or down to remove the distraction.
There's also a setting that displays the second hand, but only if the watch is perfectly face-to-the-sky, in case you want
the ability to check the _exact_ time, hands free, without the impact on battery life this usually entails.

Although we generally obey the system-wide theming, you can long press on the display for a menu of additional options specific to the face.
You can also override the system 12/24 hour setting just for this face here, since it's, well, a rather different experience than with numeric displays.

In some previous versions of the Bangle.js firmware, the backlight doesn't come on automatically when you twist your wrist. There's currently a
workaround for this integrated into the watchface; you can disable it in the menu, if you prefer.

One other thing: there's some integration with system timers and alarms; they will show as small pips at the appropriate places
in the day around the display. When they come within an hour, the pips turn to crosses relating to the minute hand, and the minute
hand turns itself on. When timers are mere seconds away, the display changes again and the second hand activates itself, so you
can watch as your doom approaches.

## Limitations

Since this is intended as a design exercise, it does not and will probably never support the Bangle's standard widgets.
Sorry about that, but control of all the pixels was just too important to me.

There's also no support for internationalisation at present. This irks me, but... well, talk to me about it if there's a language you'd like.

## The future

The design is begging for integration with host-device calendars, and proper time zone/DST support. We'll see what the future holds.

## Feedback

[I'd be happy to hear your feedback](https://www.github.com/stephenPspackman) if you have comments or find any bugs, or (most especially)
if you find this work interesting.

## By

Made by [Stephen P Spackman](https://www.github.com/stephenPspackman).
