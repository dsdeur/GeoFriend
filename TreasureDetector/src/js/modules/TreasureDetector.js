var Socket = require('./Socket.js');
var DeviceOrientation = require('./DeviceOrientation.js');
var TimelineMax = require('gsap');
var $ = require('jquery');
var config = require('./../config.js');


var TreasureDetector = function() {
    var self = this;
    this.orientation = 0;
    this.orientationOffset = 0;
    this.distance = 100;
    this.scale = 1;
    this.toScale = .2;
    this.duration = 0.3;
    this.vibrationDuration = 20;
    this.connectIndex = 0;

    this.foundTreasure = false;

    this.init = function(compass) {
        this.compass = compass;

        console.log(TimelineMax);

        // Get deviceNr
        this.deviceNr = getURLParameter('i');
        console.log(this.deviceNr);

        // Connect socket
        this.socket = new Socket(config.socketUrl, {
            'new_distance': self.handleUpdateDistance,
            'new_orientation': self.handleUpdateOrientationOffset,
            'connect': self.handleConnect,
            'reset': self.handleReset,
            'treasure_position': self.handleTreasurePosition
        });

        // Register orientation detection
        this.deviceOrientation = new DeviceOrientation(this.updateOrientation);

        // Register button click event
        $("#placeTreasureBttn").click(function(){
            self.handleTreasurePlace();
        });

        this.animate();
        this.handleConnect();
    };

    this.handleTreasurePlace = function() {
        var data = {
            "deviceNr": self.deviceNr,
            "orientation": self.orientation
        };

        this.socket.sendMessage("placed_treasure", data);
    };

    this.handleTreasurePosition = function(data) {
        if(data.deviceNr == self.deviceNr) {
            self.handleUpdateOrientationOffset(data);
        }
    };

    this.handleUpdateOrientationOffset = function(data) {
        if(data.deviceNr != self.deviceNr) {
            return;
        }

        self.orientationOffset = data.orientation * 1;

        self.rotate();
    };

    this.handleReset = function() {
        self.reset();
    };

    this.reset = function() {
        self.makeArrow();
        $(self.compass).css({
            background:"url('../img/arrow.svg') no-repeat center center",
            backgroundPosition: "70%"
        });

        self.orientation = 0;
        self.orientationOffset = 0;
        self.distance = 100;
        self.scale = 1;
        self.toScale = .2;
        self.duration = 0.3;
        self.vibrationDuration = 20;
        self.connectIndex = 0;
        self.foundTreasure = false;
        document.getElementById("iframe").src = '';
    };

    this.handleConnect = function() {
        var person = $("#peoples .person").eq(self.connectIndex);
        person.addClass('checked');

        TweenMax.to(person, 0.3, {scale: 2, ease:Linear.easeNone});
        TweenMax.to(person, 0.5, {scale: 1, delay: 0.3, ease:Back.easeOut});

        TweenMax.to(person.find(".checkmark"), 0.3, {scale: 1.5, rotation: -60, ease:Linear.easeNone});
        TweenMax.to(person.find(".checkmark"), 0.5, {scale: 1, rotation: 0, delay: 0.3, opacity:1, ease:Back.easeOut});

        self.connectIndex++;

        if(self.connectIndex > 4) {
            var iframe = document.getElementById("iframe");
            iframe.src = "winAnimation/index.html";

            var audio = document.getElementById("win");
            audio.play();
            self.scale = 7;
            this.foundTreasure = false;

            window.navigator.vibrate([800, 100, 800]);

            $("#peoples").css({opacity:0});
            $("#gem").css({opacity:0});
        }
    };

    this.handleUpdateDistance = function(data) {
        if(data.deviceNr != self.deviceNr) {
            return;
        }

        self.distance = data.distance;

        if(self.distance < 75) {
            self.makeCircle();
            self.duration = (self.distance * 0.2 / 75) + 0.1;
            self.scale = ((75 - self.distance) * 2.38 / 75) + 1;
            self.toScale = ((75 - self.distance) * .5 / 75) + 0.3;
            self.vibrationDuration = ((75 - self.distance) * 80 / 75) + 20;
        } else {
            this.scale = 1;
            this.toScale = .2;
            this.duration = 0.3;
            this.vibrationDuration = 40;
            self.makeArrow();
        }

        if(self.distance == 0) {
            $("#gem").css({opacity:1});
            $(self.compass).css({background:"#94e7a2"});
            self.scale = 1;
            self.toScale = 0.05;
            self.duration = 0.5;
            self.vibrationDuration = 0;
            window.navigator.vibrate([800]);

            $("#peoples").animate({bottom: "70px"}, 300);
            TweenMax.to("#peoples", 0.3, {scale: 1.4, ease:Linear.easeNone});
            TweenMax.to("#peoples", 0.2, {scale: 1, delay: 0.3, ease:Linear.easeNone});

            TweenMax.to("#gem", 0.5, {scale: 3, ease:Linear.easeNone});
            TweenMax.to("#gem", 0.5, {scale: 1, delay: 0.5, ease:Back.easeOut});

            self.foundTreasure = true;
        } else {
            $("#gem").css({opacity:0});
        }
    };

    this.updateOrientation = function(orientation) {
        self.orientation = orientation;
        self.rotate();
    };

    this.rotate = function() {
        var rotation = self.orientation + self.orientationOffset;
        TweenMax.to(self.compass, 0.01, {rotation: rotation});
    };

    this.makeCircle = function(){
        $(self.compass).stop().animate({ backgroundSize: '500%' }, 700);
    };

    this.makeArrow = function() {
        $(self.compass).stop().animate({ backgroundSize: '70%' }, 700);
    };

    this.animate = function() {
        var scaleTo = self.scale + self.toScale;

        TweenMax.to(self.compass, self.duration, {scale: scaleTo, ease:Linear.easeNone, onComplete:function() {
            window.navigator.vibrate([self.vibrationDuration]);
        }});
        TweenMax.to(self.compass, self.duration, {scale: self.scale, delay: self.duration, ease:Back.easeOut, onComplete:self.animate});


        if(self.foundTreasure) {
            TweenMax.to("#gem", 0.5, {scale: 1.05, ease:Linear.easeNone});
            TweenMax.to("#gem", 0.5, {scale: 1, delay: 0.5, ease:Back.easeOut});

            var person = $("#peoples .person").eq(self.connectIndex);
            TweenMax.to(person, 0.3, {scale: 1.2, ease:Linear.easeNone});
            TweenMax.to(person, 0.5, {scale: 1, delay: 0.3, ease:Back.easeOut});
        }
    };
}


function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

module.exports = TreasureDetector;
