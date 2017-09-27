"use strict";
require('dotenv').config();
console.log('Hello World');

var request = require('request');

var SONOS_API_URL = process.env.SONOS_API_URL;
var ROOM = process.env.SONOS_ROOM;

function playSonos(itemName, type){
  var url = SONOS_API_URL+ROOM+'/'+type+'/'+itemName;
  request(url, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
  });
}



const mfrc522 = require("mfrc522-rpi");
//# Init Chip
mfrc522.init();

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("scanning...");
console.log("Please put chip or keycard in the antenna inductive zone!");
console.log("Press Ctrl-C to stop.");

setInterval(function(){

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
for (let i = 4; i < 7; i++) {
        if (mfrc522.authenticate(i, key, uid)) {
            buffers.push(new Buffer(mfrc522.getDataForBlock(i)));
            console.log("Block: "+i+" Data: ", buffers.length);
        } else {
            console.log("Authentication Error");
//            break;
        }
    }

    var totalBuffer = Buffer.concat(buffers);
    var payload = totalBuffer.toString();
    console.log('payload', payload);

    var object =  JSON.parse(payload);
    console.log('Object', object);
    //# Stop
    mfrc522.stopCrypto();

}, 500);

//playSonos('Giraffenaffen');
