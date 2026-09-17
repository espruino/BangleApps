Local-only tests for the CoreTemp module.

Run:

```sh
git submodule update --init core webtools
node apps/coretemp/tests/run.js
```

This directory is committed with the app but is not listed in `metadata.json`,
so it is not pushed to Bangle storage.

Installation tests use the pinned App Loader packaging code with fake storage.
All tests run locally without connecting to a watch or other BLE devices.
