#!/usr/bin/env python3
"""Python mirror of authentiwatch 0.08's encrypted store (authentiwatch.lock).

Byte-for-byte compatible with the on-watch implementation, stdlib-only.

Modes:
  seal    write a new authentiwatch.lock from a JSON tokens file + PIN
  verify  check the EtM tag of an existing lock file and report the parsed
          token labels without writing anything

Usage:
  seal_lock.py seal   --tokens tokens.json --pin 123456 --out authentiwatch.lock
  seal_lock.py verify --lock  authentiwatch.lock  --pin 123456

Tokens file format (same as the app's RAM model):
  {"tokens":[{"algorithm":"SHA1","digits":6,"period":30,"issuer":"","account":"",
              "secret":"BASE32","label":"Name"}], "misc":{}}
"""
import argparse, base64, hashlib, hmac, json


def derive(pin: str, salt: bytes, iters: int):
    k = hashlib.sha256(salt + pin.encode()).digest()
    for _ in range(iters):
        k = hashlib.sha256(k + salt).digest()
    return hashlib.sha256(k + b"enc").digest(), hashlib.sha256(k + b"mac").digest()


def xor_stream(enc_key: bytes, iv: bytes, data: bytes) -> bytes:
    out = bytearray(data)
    bi = 0
    for off in range(0, len(out), 32):
        blk = hashlib.sha256(enc_key + iv + bi.to_bytes(4, "big")).digest()
        for j in range(min(32, len(out) - off)):
            out[off + j] ^= blk[j]
        bi += 1
    return bytes(out)


def pkcs7(bs: bytes) -> bytes:
    pad = 32 - (len(bs) % 32)
    return bs + bytes([pad]) * pad


def seal(tokens: list, pin: str, misc: dict, iters: int = 400) -> dict:
    salt, iv = __import__("os").urandom(16), __import__("os").urandom(16)
    enc_key, mac_key = derive(pin, salt, iters)
    pt = xor_stream(enc_key, iv, pkcs7(json.dumps({"tokens": tokens, "misc": misc},
                                                  separators=(",", ":")).encode()))
    tag = hmac.new(mac_key, iv + pt, hashlib.sha256).digest()
    return {"v": 1, "iters": iters,
            "salt": base64.b64encode(salt).decode(), "iv": base64.b64encode(iv).decode(),
            "ct": base64.b64encode(pt).decode(), "tag": base64.b64encode(tag).decode()}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = ap.add_subparsers(dest="mode", required=True)
    s = sub.add_parser("seal")
    s.add_argument("--tokens", required=True, help="JSON file with a tokens list")
    s.add_argument("--pin", required=True)
    s.add_argument("--out", default="authentiwatch.lock")
    s.add_argument("--iters", type=int, default=400)
    v = sub.add_parser("verify")
    v.add_argument("--lock", required=True, help="authentiwatch.lock file")
    v.add_argument("--pin", required=True)
    args = ap.parse_args()

    if args.mode == "seal":
        data = json.load(open(args.tokens))
        blob = seal(data["tokens"], args.pin, data.get("misc", {}), args.iters)
        json.dump(blob, open(args.out, "w"))
        print("wrote", args.out)
        return 0

    blob = json.load(open(args.lock))
    try:
        salt, iv = base64.b64decode(blob["salt"]), base64.b64decode(blob["iv"])
        ct, tag = base64.b64decode(blob["ct"]), base64.b64decode(blob["tag"])
    except KeyError:
        print("missing fields in lock file")
        return 1
    enc_key, mac_key = derive(args.pin, salt, blob.get("iters", 400))
    if hmac.new(mac_key, iv + ct, hashlib.sha256).digest() != tag:
        print("TAG MISMATCH: wrong PIN or tampered file - no content revealed")
        return 1
    pt = xor_stream(enc_key, iv, bytearray(ct))
    pad = pt[-1]
    if not 1 <= pad <= 32:
        print("bad padding after tag match")
        return 1
    parsed = json.loads(pt[:-pad])
    print(f"tag OK - {len(parsed['tokens'])} token(s):")
    for t in parsed["tokens"]:
        print(f"  {t['label']:<12} {t['secret'][:4]}...{t['secret'][-4:]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
