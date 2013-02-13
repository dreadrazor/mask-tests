//test vars
var animsToTest = [
                 {css:{opacity:0}, ease:Power0.easeIn, repeat:-1, yoyo:true},
                 {css:{rotation:-360}, ease:Power0.easeIn, repeat:-1, yoyo:true},
                 {css:{skewX:30}, ease:Power0.easeIn, repeat:-1, yoyo:true},
                 {css:{skewY:30}, ease:Power0.easeIn, repeat:-1, yoyo:true},
                 {css:{scaleX:0.5}, ease:Power0.easeIn, repeat:-1, yoyo:true},
                 {css:{scaleY:0.5}, ease:Power0.easeIn, repeat:-1, yoyo:true},
                 {css:{x:-20}, ease:Power0.easeIn, repeat:-1, yoyo:true},
                 {css:{y:-20}, ease:Power0.easeIn, repeat:-1, yoyo:true}
                ];


var number = 20;
var resultsFps = [];
var resultsPeaks = [];
var timeToRun = 30000; //for each animation in ms

//some state vars
var currentAnim = -1;
var savedAlready = false;

//function that records and moves top next test
function recordAndContinue(){
	
	//record peaks
	resultsPeaks.push(window.perfMon.peak);
	resultsFps.push(window.stats.fpsPeak);
	
	//reset stat gathering
	window.perfMon.peak = 0; //reset peak
	window.stats.fpsPeak = 60; //reset peak to 60 fps
	window.stats.fpsSkipSamples = 10; //reset sample skip
	
	//cler old interval
	clearInterval(interval);
	
	//change animation
	currentAnim++;

	if(currentAnim < animsToTest.length){
		
		window.stresser.anim = animsToTest[currentAnim];
		window.stresser.redoAnims(number);
		//window.stresser.consoleUpdate(); //do it manually?
		
		//new interval
		interval = setInterval(recordAndContinue,timeToRun);
	}
	else
	{
		//remove first element since it is bogus
		resultsPeaks.shift();
		resultsFps.shift();
		
		//check if already saved
		if(!savedAlready){
			saveResults(); //and save
			savedAlready = true;
		}
	}
}

function saveResults(){
	
	$.post("save.php", { 
						data: JSON.stringify({
								userAgent:window.navigator.userAgent, 
								animsTested:animsToTest, 
								duration:timeToRun, 
								instances:number, 
								renderPeaks:resultsPeaks, 
								renderFps:resultsFps })
						}, 
						function(data){
							var result = $.parseJSON(data);
							alert(result.message); 
						});
	
}

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

//need some place to store peak(lowest fps)
stats.fpsPeak = 60; //assume high value
stats.fpsSkipSamples = 10; //how many samples to skip to avoid bias due to anim inits

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.display = 'none';
stats.domElement.style.right = '100px';
stats.domElement.style.top = '25px';

document.body.appendChild( stats.domElement );

setInterval( function () {

    stats.begin();

    // your code goes here

    stats.end();

}, 1000 / 60 );

//initial interval
var interval;
$(document).ready(function(){
	
	recordAndContinue();
	
});

	