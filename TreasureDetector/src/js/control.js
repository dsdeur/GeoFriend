var DistanceController = require('./modules/DistanceController.js');

var distanceController = new DistanceController();
var rangeSlider = document.getElementById('distanceSlider');
var orientationSlider = document.getElementById('orientationSlider');
var connect = document.getElementById('connect');
distanceController.init(rangeSlider, orientationSlider, connect);
