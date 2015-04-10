var Socket = require('./Socket.js');
var config = require('./../config.js');

var DistanceController = function() {
    var self = this;

    this.init = function(rangeSlider, orientationSlider, connect, reset) {
        this.rangeSlider = rangeSlider;
        this.orientationSlider = orientationSlider;
        this.connect = connect;
        this.reset = reset;

        this.rangeSlider.addEventListener('input', this.handleSliderChange);
        this.orientationSlider.addEventListener('input', this.handleOrientationSliderChange);

        this.connect.addEventListener('click', this.handleConnectClick);
        this.reset.addEventListener('click', this.handleResetClick);

        this.socket = new Socket(config.socketUrl);
    };

    this.handleOrientationSliderChange = function() {
        var orientation = self.orientationSlider.value;

        console.log(orientation);

        self.socket.sendMessage('new_orientation_input', {
            "orientation": orientation
        });
    };

    this.handleSliderChange = function(e) {
        var distance = self.rangeSlider.value;

        self.socket.sendMessage('new_distance_input', {
            "distance": distance
        });
    };

    this.handleConnectClick = function() {
        console.log("connect");
        self.socket.sendMessage('connect', {});
    };

    this.handleResetClick = function() {
        self.rangeSlider.value = 100;
        self.orientationSlider.value = 0;

        self.socket.sendMessage('reset', {});
    };
};

module.exports = DistanceController;
