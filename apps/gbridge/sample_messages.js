/**
 * Some sample messages to test Gadgetbridge notifications
 */
// send both of these to trigger music notification
GB({"t":"musicinfo","artist":"Some Artist Name","album":"The Album Name","track":"The Track Title Goes Here","dur":241,"c":2,"n":2})
GB({"t":"musicstate","state":"play","position":0,"shuffle":1,"repeat":1})

// WhatsApp group
GB({"t":"notify","id":1592721712,"src":"WhatsApp","title":"Sample Group: Sam","body":"This is a test WhatsApp message"})
GB({"t":"notify","id":1592721714,"src":"WhatsApp","title":"Sample Group (2 messages): Robin","body":"This is another test WhatsApp message"})
GB({"t":"notify","id":1592721719,"src":"WhatsApp","title":"Sample Group (3 messages): Kim","body":"This is yet another test WhatsApp message, but it is really really really really really really long.  Almost as if somebody wanted to test how much characters you could stuff into a notification before all of the body text just wouldn't fit anymore."})

// Alarm clock + dismissal
GB({"t":"notify","id":1592721714,"src":"ALARMCLOCKRECEIVER"})
GB({"t":"notify-","id":1592721714})

// Weather update (doesn't show a notification, not handled by gbridge app: see weather app)
GB({"t":"weather","temp":288,"hum":94,"txt":"Light rain","wind":0,"wdir":120,"loc":"Test City"})

// Nextcloud updated a file
GB({"t":"notify","id":1594184421,"src":"Nextcloud","title":"Downloaded","body":"test.file downloaded"})
