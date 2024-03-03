# OpenHaystack (AirTag)

Copy a base64 key from https://github.com/seemoo-lab/openhaystack and make your Bangle.js trackable as if it's an AirTag

Based on https://github.com/seemoo-lab/openhaystack/issues/59

## Usage

* Follow the steps on https://github.com/seemoo-lab/openhaystack#how-to-use-openhaystack to install OpenHaystack and get a unique base64 code
* Click the ≡ icon next to `OpenHaystack (AirTag)`
* Paste in the base64 code
* Click `Upload`

## Note

This code changes your Bangle's MAC address, so while it still advertises with
the same `Bangle.js abcd` name, devices that were previously paired with it
won't automatically reconnect it until you re-pair.
