# Contacts

View, edit and call contacts on your bangle.js. Calling is done via the bluetooth connection to your android phone.
Requires allowing "intents" in GadgetBridge device settings.

## Contacts JSON file

When the app is loaded from the app loader, a file named
`contacts.json` is loaded along with the javascript etc. The file
has the following contents:

```
[
  {
    "name":"First Last",
    "number":"123456789",
  },
  {
    "name": "James Bond",
    "number":"555-007",
  },
  ...
]
```

## Contacts Editor

Clicking on the download icon of `Contents` in the app loader invokes
the contact editor.  The editor downloads and displays the current
`contacts.json` file. Clicking the `Edit` button beside an entry
causes the entry to be deleted from the list and displayed in the edit
boxes. It can be restored - by clicking the `Add` button.

# Icons

<a target="_blank" href="https://icons8.com/icon/85059/phone">Phone</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>

<a target="_blank" href="https://icons8.com/icon/362/trash-can">Delete Button</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>

<a target="_blank" href="https://icons8.com/icon/iwE4yCawoyKM/call-list">Call List</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
