# Keyring

PIN-gated encrypted secrets on the wrist, and the proof-of-concept consumer of the `encstore` module (see `modules/EncStore.md`).

- First run: choose a 4-8 digit PIN; the app seals an empty store file.
- Tap an entry to reveal its secret; BTN1 re-locks (RAM is wiped, the PIN is asked again).
- Wrong PIN: buzz + "WRONG PIN"; re-enter.

Entries are provisioned off-watch so secrets never have to be typed letter-by-letter on a 176px screen:

```
python apps/authentiwatch/tools/seal_lock.py seal --tokens mytokens.json --pin 123456 --out keyring.lock
# push keyring.lock to the watch over the App Loader / Gadgetbridge
```

`mytokens.json` format:

```json
{"tokens":[{"label":"NAS login","secret":"hunter2","comment":"admin account"}],
 "misc":{}}
```

The same seal tool verifies (`verify --lock keyring.lock --pin ...`) without printing contents.
