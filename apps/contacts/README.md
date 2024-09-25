# Contacts

This app provides a common way to set up the `contacts.json` file.

## Contacts JSON file

When the app is loaded from the app loader, a file named
`contacts.json` is loaded along with the javascript etc. The file
has the following contents:

```
[
  {
  "name":"NONE"
  },
  {
  "name":"First Last",
  "number":"123456789",
  }
]
```

## Contacts Editor

Clicking on the download icon of `Contents` in the app loader invokes
the contact editor.  The editor downloads and displays the current
`contacts.json` file. Clicking the `Edit` button beside an entry
causes the entry to be deleted from the list and displayed in the edit
boxes. It can be restored - by clicking the `Add` button.