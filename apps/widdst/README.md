# Daylight savings time widget

This widget will keep your watch up-to-date with daylight savings changes.

## Some notes

When enabled, this widget takes over your watch's timezone settings - hence changing your timezone in your `Settings -> System -> Locale` <u>will no longer have any effect</u>. You have to set your timezone in `Settings -> Apps -> Daylight Savings` instead.

You may find that the watch displays the wrong time for a minute or so after any changes to the time, to the DST settings, or to whether DST is in effect.

## Settings

You need to set your timezone, and your daylight savings rules, in `Settings -> Apps -> Daylight Savings`. The settings are

**Enabled** enables or disables the widget

**Icon** enables or disables the showing of a small "DST" icon when daylight savings is in effect

**Base TZ** is your "base" timezone - i.e. the timezone you keep when daylight savings is not in effect. It is positive east.

**Change** is the size of the daylight savings change, which is +1 hour almost everywhere.

**DST Start, DST End** set the rules for the start and end of daylight savings.

## Setting the daylight savings rules

The page for setting **DST Start** and **DST End** ask you to describe the rules for daylight savings changes. For instance, in the UK, the rules are

**DST Start** `The [last] [Sun] of [Mar] minus [0 days] at [01:00]`

**DST End** `The [last] [Sun] of [Oct] minus [0 days] at [02:00]`

In most of the US, the rules are

**DST Start** `The [2nd] [Sun] of [Mar] minus [0 days] at [02:00]`

**DST End** `The [1st] [Sun] of [Nov] minus [0 days] at [02:00]`




