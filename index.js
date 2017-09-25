require('dotenv').config();
console.log('Hello World');

var request = require('request');

var SONOS_API_URL = process.env.SONOS_API_URL;
var ROOM = process.env.SONOS_ROOM;

function playSonos(itemName, type = 'playlist){
  var url = SONOS_API_URL+ROOM+'/'+type+'/'+itemName;
  request(url, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
  }
}

playSonos('Giraffenaffen');
