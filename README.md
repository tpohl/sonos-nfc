# sonos-nfc

Use NFC Tags to play your music on a sonos system.

## Prerequisites

* a running SONOS-API
* An mfrc522 NFC Chip wired to
* a Raspberry PI

## Setup

Set Environment Vars or .env

* SONOS_API_URL = Base URL of the Sonos API 
* SONOS_ROOM = Name of the Room or Player to control

## Run

```bash
npm start # run in foreground
npm run forever # run in background
# ------------
npm run stop # stop the running forever
```

## Write your Cards

Currently there is no easy way to write the tags
```bash
node write.js # Write something on a card you present
```
