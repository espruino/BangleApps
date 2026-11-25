# EncStore

PIN-gated encrypted Storage for Bangle.js apps, shared across the app store. Seals any JSON-serialisable object into an app-named Storage file with hash-based authenticated encryption, using only the hash primitives the firmware exposes.

```
var ENC = require("encstore");
ENC.seal("myapp.data", "123456", {notes: ["hello"]});
var data = ENC.open("myapp.data", "123456"); // object, or null on wrong PIN
```

## Design

The firmware exposes SHA1/SHA256/SHA512 but no block cipher, so the cipher is hash-based:

- Key material: a PBKDF1-style SHA256 chain over `pin || salt` (default 400 rounds, ~2-4 s per unlock on a Bangle.js 2), split into an encryption key and a MAC key via domain separation ("enc"/"mac" labels).
- Cipher: a SHA-256 keystream - `ct = pt XOR SHA256(encKey || iv || be32(i))` over 32-byte blocks, with PKCS#7 padding.
- Integrity: encrypt-then-MAC, HMAC-SHA256 over `iv || ct` with the separately derived MAC key. A wrong PIN or a tampered file yields no data.
- IVs/salt: no hardware RNG is exposed to JS, so they mix a monotonic boot counter (file `encstore.nctr`, which makes IV reuse across reboots impossible) with wall time, the temperature sensor and `Math.random`, hashed through SHA256.

Strength is bounded by the PIN's entropy; see a Bangle.js 2 for per-unlock timing.

## API

All `iters` arguments default to 400 (the on-watch cost is roughly linear).

- `ENC.seal(file, pin, data[, iters])` - seal `data` (any JSON object) into Storage file `file` under `pin`. Returns the lock descriptor `{v, iters, salt, iv, ct, tag}`.
- `ENC.open(file, pin)` - open a sealed store; returns the parsed object, or `null` on a wrong PIN, tampering or a malformed file.
- `ENC.verify(file, pin)` - check a PIN against a sealed store without decrypting.
- `ENC.derive(pin, salt, iters)` - raw key derivation, returns `{encKey, macKey}` (both 32 bytes) - useful for keeping a session in RAM across multiple saves.
- `ENC.streamXor(encKey, iv, data)` - raw keystream helper, XORs `data` in place.
- `ENC.randomBytes(n)` - entropy-mixed pseudo-random bytes from the module's nonce chain.
- `ENC.setNonceFile(f)` - relocate the boot-counter file (defaults to `encstore.nctr`).

Apps keep their own store file name per data type, e.g. `myapp.notes`, `myapp.tokens`, so stores can be sealed and rotated independently. A stdlib-only Python mirror of the format is available in `apps/authentiwatch/tools/seal_lock.py` for off-watch sealing, rotation and audits.

## Notes

- Decrypted content lives in app RAM only; store files on flash are always ciphertext.
- Wrong-PIN handling is authenticated: the tag check reveals no byte of the plaintext.
