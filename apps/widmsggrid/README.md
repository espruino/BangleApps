# Messages Grid Widget

Widget that displays multiple notification icons in a grid.
The widget has a fixed size: if there are multiple notifications it uses smaller
icons.
It shows a single icon per application, so if you have two SMS messages, the
grid only has one SMS icon.
If there are multiple messages waiting, the total number is shown in the 
bottom-right corner.

Example: one SMS, one Signal, and two WhatsApp messages:
![screenshot](screenshot.png)

## Installation
This widget needs the [`messages`](/?id=messages) app to handle notifications.

You probably want to disable the default widget, to do so:
1. Open `Settings`
2. Navigate to `Apps`>`Messages`
3. Scroll down to the `Widget messages` entry, and change it to `Hide`

## Settings
You can change settings by going to the global `Settings` app, then `App Settings`
and `Messages`:

* `Flash icon` Toggle flashing of the widget icons.
<!-- * `Show read` - Also show the widget when there are only old messages. -->
* `Widget messages` Not used by this widget.