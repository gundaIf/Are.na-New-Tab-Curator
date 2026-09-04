# Are.na New Tab Curator

Chrome extension (Manifest V3) that replaces the new tab page with a masonry of blocks from public Are.na channels.

Version **2.0.0** — works unpacked. No account required for public channels.

## What is new in 2.0

- Valid Manifest V3 JSON (1.0 could not load)
- `host_permissions` for the Are.na API (fixes blocked fetches)
- Public channel presets out of the box
- Images, text, and link blocks
- Fullscreen viewer with arrow keys
- Optional personal access token for private channels

## Install (unpacked)

1. Clone this repo
2. Chrome → `chrome://extensions` → Developer mode → **Load unpacked**
3. Select this folder
4. Open a new tab

Optional: extension **Details → Extension options**. One channel slug per line. Token from [are.na/settings/oauth](https://www.are.na/settings/oauth) only if you need private channels.

## Notes

The token is stored in `chrome.storage.sync` and sent only to `api.are.na`.
