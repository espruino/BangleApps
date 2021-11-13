# Authentiwatch - 2FA Authenticator

Supports Google Authenticator compatible 2-factor authentication.

Supports:

* All RFC6238 hashes: SHA1 (default), SHA256, SHA512
* Timed (TOTP) (default) and Counter (HOTP) modes
* Custom periods (default 30s)
* Between 6 (default) and 10 digits
* Phone/PC configuration web page:
 * Add/edit/delete/arrange tokens
 * Scan QR codes
 * Produce scannable QR codes

## Usage

Use the Phone/PC web page interface to manage the tokens stored on the watch.

Tokens are stored *ONLY* on the watch.

Swipe right to exit to the app launcher.

Swipe left on selected counter token to advance the counter to the next value.

## Creator

Andrew Gregory
