"use strict";
require('dotenv').config();

var request = require('request');
const mfrc522 = require("mfrc522-rpi");

var SONOS_API_URL = process.env.SONOS_API_URL;
var ROOM = process.env.SONOS_ROOM;
var SONOS_ENABLED = 'true' != process.env.SONOS_DISABLED;

function playSonos(itemName, type) {
    if (!type) type = 'playlist';
    var url = SONOS_API_URL + ROOM + '/' + type + '/' + itemName;
    console.log('Calling SONOS', url);
    if (SONOS_ENABLED) {
      request(url, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
      });
    } else {
      console.log('Not calling your SONOS');
    }
}




//# Init Chip
mfrc522.init();

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("scanning...");
console.log("Please put chip or keycard in the antenna inductive zone!");
console.log("Press Ctrl-C to stop.");

setInterval(function () {

    //# Scan for cards
    let response = mfrc522.findCard();
    if (!response.status) {
        return;
    }
    console.log("Card detected, CardType: " + response.bitSize);

    //# Get the UID of the card
    response = mfrc522.getUid();
    if (!response.status) {
        console.log("UID Scan Error");
        return;
    }
    //# If we have the UID, continue
    const uid = response.data;
    console.log("Card read UID: %s %s %s %s", uid[0].toString(16), uid[1].toString(16), uid[2].toString(16), uid[3].toString(16));

    //# Select the scanned card
    const memoryCapacity = mfrc522.selectCard(uid);
    console.log("Card Memory Capacity: " + memoryCapacity);

    //# This is the default key for authentication
    const key = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];

    var buffers = [];
    for (let i = 4; i < 32; i++) {
     if (i % 4 < 3) {
        if (mfrc522.authenticate(i, key, uid)) {
            var buffer = new Buffer(mfrc522.getDataForBlock(i));
            buffers.push(buffer);
            console.log("Read Block: ", i );
            if (buffer[buffer.length-1] === 0x04) {
                console.log('EOT');
                buffer.fill(' ',buffer.length-1);//REMOVE EOT
                break;
            }
        } else {
            console.log("Authentication Error");
        }
      } else {
         console.log('a trailer block : skipping');
      }
    }
    mfrc522.stopCrypto();
    // READ TAG contents
    var totalBuffer = Buffer.concat(buffers);
    var payload = totalBuffer.toString();
    console.log('payload', payload);

    var object = JSON.parse(payload);
    console.log('Object', object);

    if (object && object.value) {
        playSonos(object.value, object.type);
    }

}, 500);

