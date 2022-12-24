# Agenda

Basic agenda reading the events synchronised from GadgetBridge.

### Functionalities

* List all events in the next week (or whatever is synchronized)
* Optionally view past events (until GB removes them)
* Show start time and location of the events in the list
* Show the colour of the calendar in the list
* Display description, location and calendar name after tapping on events

### Troubleshooting

For the events sync to work, GadgetBridge needs to have the calendar permission and calendar sync should be enabled in the devices settings (gear sign in GB, also check the blacklisted calendars there, if events are missing).  
Keep in mind that GadgetBridge won't synchronize all events on your calendar, just the ones in a time window of 7 days (you don't want your watch to explode), ideally every day old events get deleted since they appear out of such window.

#### Force Sync

If for any reason events still cannot sync or some are missing, you can try any of the following (just one, you normally don't need to do this):
1. from GB open the burger menu (side), tap debug and set time.
2. from the bangle, open settings > apps > agenda > Force calendar sync, then select not to delete the local events (this is equivalent to option 1).
3. do like option 2 but delete events, GB will synchronize a fresh database instead of patching the old one (good in case you somehow cannot get rid of older events)

After any of the options, you may need to disconnect/force close Gadgetbridge before reconnecting and let it sync (give it some time for that too), restart the agenda app on the bangle after a while to see the changes.

### Report a bug

You can easily open an issue in the espruino repo, but I won't be notified and it might take time.  
If you want a (hopefully) quicker response, just report [on my fork](https://github.com/glemco/BangleApps).
