var DeviceOrientation = function(callback) {
    var self = this;
    this.callback = callback;

    this.init = function() {
        window.addEventListener('deviceorientation', self.handleOrientationUpdate);
    };

    this.handleOrientationUpdate = function(e) {
        var orientation = e.alpha || 0; 

        self.callback(orientation);
    };

    this.init();
}

module.exports = DeviceOrientation;
