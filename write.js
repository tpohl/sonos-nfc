"use strict";
const mfrc522 = require("mfrc522-rpi");
//# Init Chip
mfrc522.init();

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("scanning...");
console.log("Please put chip or keycard in the antenna inductive zone!");
console.log("Press Ctrl-C to stop.");

var payload = { value: 'JakobsLieblingslieder' };

setInterval(function () {

    //# Scan for cards
    let response = mfrc522.findCard();
    if (!response.status) {
        return;
    }
    console.log("Card detected - will write payload, CardType: " + response.bitSize);

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

    var payloadString = JSON.stringify(payload);
    var blocksNeeded = Math.ceil((payloadString.length+1) / 16)
    console.log('I will need', blocksNeeded, ' Blocks for ', payloadString);
    var buffer = new Buffer(blocksNeeded * 16)
    buffer.fill(' ', 0);
    buffer.write(payloadString);
    buffer[buffer.length-1]=0x04; // Write End of Transmission Char.
    const trailer = [];
    var i = 0;
    let block = 4;
    while (i < blocksNeeded) {
        //# Authenticate on Block  with key and uid
        if (mfrc522.authenticate(block, key, uid)) {
            if (block % 4 < 3) {
                console.log('Writing payload ', i, ' to block', block);
                var dataToWrite = [buffer[i * 16], buffer[i * 16 + 1], buffer[i * 16 + 2], buffer[i * 16 + 3], buffer[i * 16 + 4], buffer[i * 16 + 5], buffer[i * 16 + 6], buffer[i * 16 + 7], buffer[i * 16 + 8],
                buffer[i * 16 + 9], buffer[i * 16 + 10], buffer[i * 16 + 11], buffer[i * 16 + 12], buffer[i * 16 + 13], buffer[i * 16 + 14], buffer[i * 16 + 15]];
                mfrc522.writeDataToBlock(block, dataToWrite);
                console.log('WROTE BLOCK', block, dataToWrite);
                i = i + 1;
            } else {
                console.log('a trailer block : skipping');
            }
        } else {
            console.log('Auth Error');
            return;
        }
        block++;// NEXT BLOCK please
    }
    mfrc522.stopCrypto();

    console.log("finished successfully!");


}, 500);
