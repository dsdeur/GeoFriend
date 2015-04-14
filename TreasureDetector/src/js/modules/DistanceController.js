var Socket = require('./Socket.js');
var config = require('./../config.js');

var DistanceController = function() {
    var self = this;

    this.init = function() {
        this.rangeSliders = document.querySelectorAll('.distanceSlider');
        this.calibrationSliders = document.querySelectorAll('.orientationSlider');
        this.connectButtons = document.querySelectorAll('.connectBttn');

        this.resetTreasureBttn = document.getElementById('resetTreasure');
        this.resetTreasureBttn.addEventListener('click', self.resetTreasure);

        forEach(this.rangeSliders, function(obj, index){
            obj.addEventListener('input', function(e){
                self.handleSliderChange(e, index);
            });
        });

        forEach(this.calibrationSliders, function(obj, index){
            obj.addEventListener('input', function(e){
                self.handleOrientationSliderChange(e, index);
            });
        });

        forEach(this.connectButtons, function(obj, index){
            obj.addEventListener('click', function(e){
                self.handleConnectClick(e, index);
            });
        });

        this.socket = new Socket(config.socketUrl);
    };

    this.handleOrientationSliderChange = function(e, i) {
        var orientation = self.calibrationSliders[i].value;

        console.log(orientation);

        self.socket.sendMessage('new_orientation_input', {
            "orientation": orientation,
            "deviceNr": i
        });
    };

    this.handleSliderChange = function(e, i) {
        var distance = self.rangeSliders[i].value;

        self.socket.sendMessage('new_distance_input', {
            "distance": distance,
            "deviceNr": i
        });
    };

    this.handleConnectClick = function(e, i) {
        console.log("connect");
        self.socket.sendMessage('connect', {
            "deviceNr": i
        });
    };

    this.resetTreasure = function() {
        self.socket.sendMessage('reset_treasure', {});
    };

};

var forEach = function (array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
        callback.call(scope, array[i], i); // passes back stuff we need
    }
};

module.exports = DistanceController;
