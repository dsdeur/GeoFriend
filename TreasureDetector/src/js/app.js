var TreasureDetector = require('./modules/TreasureDetector.js');
var $ = require('jquery');


var treasureDetector = new TreasureDetector();

var compass = document.getElementById('compass');

treasureDetector.init(compass);


360, 567
