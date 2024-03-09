# Home Assistant API Interface

This app provides two features:

- Sending health, compass, accelerator, and battery information to [Home Assistant](https://www.home-assistant.io/)
- Displaying [Home Assistant](https://www.home-assistant.io/) templates

This is done through rest api calls to your [Home Assistant](https://www.home-assistant.io/) server. This means the app requires using the [Android Integration](/?id=android) and for your server to be accessible from your phone.

A restart may be required after loading the app to start the background sensor process.

## Configuration

Configuration is done through modifying the settings json.

```json
{
  "templates": [
    {
      "name":"Test Template",
      "temp":"Test"
    }
  ],
  "interval": 180000,
  "api_key":"api_key",
  "host":"https://homeassistant:8123",
  "id":"banglejs",
  "friendly_name":"Banglejs Sensors"
}
```

- `api_key`: A [Home Assistant](https://www.home-assistant.io/) [api key](https://developers.home-assistant.io/docs/api/rest/).
- `host`: The url of your [Home Assistant](https://www.home-assistant.io/) server. The url must be https or it will not work. This is a limitation of the permissions given to the Banglejs GadgetBridge app. You can compile a custom version if you wish to modify this.
- `interval`: The sensor update interval.
- `id`: An id to be used for identifying your banglejs in [Home Assistant](https://www.home-assistant.io/).
- `friendly_name`: The name [Home Assistant](https://www.home-assistant.io/) will use to refer to your banglejs.
- `templates`: A list of templates to display in the gui. They are given in this format `{"name":"Template Name", "temp":"A template"}`. More information about creating templates can be found [here](https://www.home-assistant.io/docs/configuration/templating/).

## The GUI

The GUI will display templates one at a time. Tap to go to the next template. Long press to reload the current template.
