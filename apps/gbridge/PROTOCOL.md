# Watch -> Phone

## show toast

```
{ "t": "info", "msg": "message" }
```

t can be one of "info", "warn", "error"

## report battery level

```
{ "t": "status", "bat": 30, "volt": 30, "chg": 0 }
```

* bat is in range 0 to 100
* volt is optional and should be greater than 0
* chg is optional and should be either 0 or 1 to indicate the watch is charging

## find phone

```
{ "t": "findPhone", "n": true }
```

n is an boolean and toggles the find phone function

## control music player

```
{ "t": "music", "n": "play" }
```

n can be one of "play", "pause", "playpause", "next", "previous", "volumeup", "volumedown", "forward", "rewind"

## control phone call

```
{ "t": "call", "n": "accept"}
```

n can be one of "accept", "end", "incoming", "outcoming", "reject", "start", "ignore"

## react to notifications

Send a response to a notification from phone
 
```
{ 
  "t": "notify", 
  "n": "dismiss", 
  "id": 2,
  "tel": "+491234", 
  "msg": "message",
}
```

* n can be one of "dismiss", "dismiss all", "open", "mute", "reply"
* id, tel and message are optional

# Phone -> Watch

## show notification

```
{
  "t": "notify",
  "id": 2,
  "src": "app",
  "title": "titel",
  "subject": "subject",
  "body": "message body",
  "sender": "sender",
  "tel": "+491234"
 }
```

## notification deleted

This event is send when the user skipped a notification

```
{ "t": "notify-", "id": 2 }
```

## set alarm

```
{ 
  "t": "alarm", 
  "d": [
    { "h": 13, "m": 37 },
    { "h": 8, "m": 0 }
  ]
}
```

## call state changed

```
{
  "t": "call",
  "cmd": "accept",
  "name": "name",
  "number": "+491234"
}
```

cmd can be one of "", "undefined", "accept", "incoming", "outgoing", "reject", "start", "end"

## music state changed

```
{
  "t": "musicstate",
  "state": "play",
  "position": 40,
  "shuffle": 0,
  "repeat": 1
}
```

## set music info

```
{
  "t": "musicinfo",
  "artist": "artist",
  "album": "album",
  "track": "track",
  "dur": 1,
  "c": 2,
  "n" 3
}
```

* dur is the duration of the track
* c is the track count
* n is the track number

## find device

```
{
  "t": "find",
  "n": true
}
```

n toggles find device functionality

## set constant vibration

```
{
  "t": "vibrate",
  "n": 2
}
```

n is the intensity

## send weather

```
{
  "t": "weather",
  "temp": 10,
  "hum": 71,
  "txt": "condition",
  "wind": 13,
  "loc": "location"
}
```

* hum is the humidity
* txt is the weather condition
* loc is the location
