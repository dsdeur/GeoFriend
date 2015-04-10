var DistanceController = require('./modules/DistanceController.js');

var distanceController = new DistanceController();
var rangeSlider = document.getElementById('distanceSlider');
var orientationSlider = document.getElementById('orientationSlider');
var connect = document.getElementById('connect');
var reset = document.getElementById('reset');
distanceController.init(rangeSlider, orientationSlider, connect, reset);
