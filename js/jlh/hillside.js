/****************************************
Scripts for Hillside
Jonathan Harrison
2018
****************************************/

/****************************************
Hello, CodePen! 
Thanks for checking out this demo, where I'm using GSAP to animate paths in an SVG.
****************************************/


/****************************************
CONTROLS: easy access for a few things
****************************************/
// control variables
var startingXPosition, startingYPosition, startingZoom, mainTimelineTimescale, starTimelineTimescale, textEase;

startingXPosition = 23.8; // edges: 0.0 to 100.0; <0 or >100 values will work; default: 23.8
startingYPosition = 34; // edges: 0.0 to 100.0; <0 or >100 values will work; default: 34
startingZoom = 6;  // from starting value to 1; default: 6
mainTimelineTimescale = 1; // speed up/slow down animation
starTimelineTimescale = 1; // speed up/slow down just the stars

// control how the text enters the screen
// for an interactive list of GSAP eases, see: https://greensock.com/ease-visualizer
textEase = "Power1.easeOut"; // "Power4.easeOut" "Bounce.easeOut" "Back.easeOut"

/****************************************
End Conrtols
****************************************/


// ready
$(document).ready(function() {
	// dimensions
	var width = $( window ).width();
	var height = $( window ).height();
	var animationContainer = $("#animationContainer");

	// setup and position animation container
	var containerHeight = height * 0.65;
	if (containerHeight > 1000) {
		containerHeight = 1000;
	}
	var containerWidth = 300 / (400/containerHeight);
	TweenLite.set(animationContainer, {
		height: containerHeight + "px",
		width: containerWidth + "px",
		force3D: false
	});
	centerElement(animationContainer);

	// setup apartment building
	var apartmentBuilding = $("#apartmentBuilding");
	centerElement(apartmentBuilding );

	// map starting position to X/YPercent values
	startingXPosition = Math.abs(startingXPosition - 100);
	startingXPosition = (startingXPosition * 4) - 250;
	startingYPosition = Math.abs(startingYPosition - 100);
	startingYPosition = (startingYPosition * 4) - 300;

	// set frame to starting position
	TweenLite.set(apartmentBuilding, { scale: startingZoom, xPercent: startingXPosition, yPercent: startingYPosition, force3D: false });

	/*
		setup main timeline:
			the numbers are the positions in the main timeline that each "label" will start at. "sunset" happens 1.2 seconds into the main timeline.

			this makes keeping track of subtle timing between many different timelines clean and simple. add the label here, then add the animation to the label later. 

			also, each animation isn't dependant on the positions of the others. change the sunset to later in the main timeline, and the stars will still come out at 4.5 seconds. that means you can tweak the timing of one effect without having to go and change where everything else happens.
	*/
	var tl = new TimelineMax();
	tl.add("pull away", 0.3);
	tl.add("sunset", 1.2);
	tl.add("nightfall", 2.8);
	tl.add("stars", 4.25);
	tl.add("text", 4.25);
	tl.add("curtains", 5.3);
	tl.add("monitor", 5.99);

	/*
		populate main timeline:
			use the returned timeline method to add child timelines with each individual effect at the time set for each "label" in the last codeblock
	*/

	// START: show the animation container
	tl.to(animationContainer, 0.1, { autoAlpha: 1 });

	// long, slow zoom out from window
	tl.add(pullAway(apartmentBuilding), "pull away");

	// draw shadows over roof and building
	var roofShadow = $("#roofShadow");
	var buildingShadow = $("#buildingShadow");
	tl.add(drawShadows(roofShadow, buildingShadow), "sunset");

	// day to night
	var dayToNightElements = $(".day-night");
	tl.add(dayToNight(dayToNightElements), "nightfall");

	// open the curtains
	var leftCurtain = $("#leftCurtain");
	var rightCurtain = $("#rightCurtain");
	tl.add(openCurtains(leftCurtain, rightCurtain), "curtains");

	// stars
	var stars = $(".star");
	tl.add(showStars(stars), "stars");
	tl.add(twinkleStars(stars, starTimelineTimescale), "stars+=0.5");

	// turn monitor on
	var monitor = $("#roomBackground");
	tl.add(turnOnMonitor(monitor), "monitor");

	// text element
	var textElement = $("#textElement");
	tl.add(showText(textElement, textEase), "text");

	// set main timeline timescale
	tl.timeScale(mainTimelineTimescale);

});
// end ready

/*
	animation functions:
		return timelines to the parent timeline
*/
function pullAway(scene) {
	var tl = new TimelineMax({ id: "pull away" });
	var pullAwayDuration = 5.6;
	tl.to(scene, pullAwayDuration, { scale: 1, xPercent: "-50%", yPercent: "-50%", transformOrigin: "50% 50%", force3D: false, ease: Power2.easeOut }, 0);
	
	return tl;
}

function drawShadows(roofShadow, buildingShadow) {
	var tl = new TimelineMax({ id: "draw shadows" });
	var drawShadowDuration = 3.5;
	tl.from(roofShadow, drawShadowDuration, { scaleX: 0.05, scaleY: 0, transformOrigin: "44.5% 0%" }, 0);
	var offset = 0.8;
	tl.from(buildingShadow, drawShadowDuration - offset, { scaleY: 0, transformOrigin: "50% 0%" }, offset);

	return tl;
}

function dayToNight(elements) {
	var tl = new TimelineMax({ id: "day to night" });
	var duration = 2.3;

	// relative hsl tween
	tl.staggerTo(elements, duration, { fill: "hsl(+=0%, -=70%, -=5%)" }, 0.01, 0);
	tl.to("#sky", duration, { fill: "hsl(+=0%, -=60%, -=60%)" }, 0);
	tl.to("#hillLeft", duration, { fill: "hsl(+=0%, -=75%, -=7%)" }, 0);
	tl.to("#hillRight", duration, { fill: "hsl(+=0%, -=75%, -=10%)" }, 0);

	return tl;
}

function openCurtains(leftCurtain, rightCurtain) {
	var tl = new TimelineMax({ id: "room timeline" });
	var curtainDuration = 0.3;
	var scaleX = 0;
	tl.to(leftCurtain, curtainDuration, { scaleX: scaleX, transformOrigin: "2% 50%" }, 0);
	tl.to(rightCurtain, curtainDuration, { scaleX: scaleX, transformOrigin: "98% 50%" }, 0);

	// shrink as we near the edges
	var shrink = 0.16;
	var shrinkDuration = (curtainDuration - shrink) * 0.9;
	var scaleY = 0.75;
	tl.to(leftCurtain, shrinkDuration, { scaleY: scaleY }, shrink);
	tl.to(rightCurtain, shrinkDuration, { scaleY: scaleY }, shrink);

	return tl;
}

function showStars(stars) {
	var tl = new TimelineMax({id: "show stars"});
	var duration = 1;
	tl.staggerFrom(stars, duration, { scale: 0, transformOrigin: "50% 50%", ease: Back.easeOut }, 0.03);

	return tl;
}

function twinkleStars(stars, timeScale) {
    var tl = new TimelineMax();
    for (var i = 0; i < stars.length; i++) {
        var delay = randomInt(1, 3);
        var repeatDelay = randomInt(3, 4);
        var timelinePosition = (i + 1) * randomFloat(0.9, 1.5);
        var rotation = randomInt(10, 30);
        var tempTL = new TimelineMax({ repeat: -1, delay: delay, repeatDelay: repeatDelay });
        tempTL.to(stars[i], 0.4, { scale: 0.2, opacity: 0.4, transformOrigin: "50% 50%" });
        tempTL.set(stars[i], { rotation: "+=" + rotation });
        tempTL.to(stars[i], 0.6, { scale: 1, opacity: 1, transformOrigin: "50% 50%", ease: Back.easeIn });
        tl.add(tempTL, timelinePosition);
    }

    tl.timeScale(timeScale);
    return tl;
}

function turnOnMonitor(monitor) {
	var tl = new TimelineMax({ id: "turn on monitor" });
	tl.to(monitor, 0.01, { fill: "#eef" });

	return tl;
}

function showText(textElement, ease) {
	var tl = new TimelineMax({ id: "show text" });
	tl.from(textElement, 0.8, { yPercent: "-125%", ease: ease });

	return tl;
}


/*
	utility functions
*/
// place an element at the center of its parent
function centerElement(element, xAxisOnly) {
	if (xAxisOnly) {
		TweenLite.set(element, { left:'50%', xPercent:'-50' });
	}
	else {
		TweenLite.set(element, { left:'50%',top:'50%', xPercent:'-50',yPercent:'-50' });
	}
}
// return a random float between 2 given floats
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
// return a random integer between 2 given ints
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
