
var path = new Array();
var pathLen;
var pathLen2;
var path2 = new Array();
var initPath = new Array();

var speed = 20;
var cities = 15;

var temp;

var isSecond = false;
var isFirstIn = true;


Array.prototype.copyPath = function(secondPath) {
	$.each(this, function(index, value) {
		secondPath[index] = value;
	}); 
}

$(document).ready( function() {
	$('#city').change( function() {
		cities = parseInt($('#city').val(), 10);
		setup();
	});
	$('#calculations').change( function() {
		speed = parseInt($('#calculations').val(), 10);
		setup();
	});
	$('#reset-alg').click( function() {
		setupReset();
	});
	$('#reset-points').click( function() {
		setup();
	});
	$('#second-alg').change( function() {
		if ($('#second-alg')[0].checked) {
			isSecond = true;
		} else {
			isSecond = false;
		}
		setupReset();
	});
	$("#nav-trigger").click(function(event) {
		/* Act on the event */
		if(this.checked) {
			$("#container").css("left", "0")
		} else {
			$("#container").css("left", "-200px")
		}
	});
});

// swap two given indices of an array
Array.prototype.swap = function(ind1, ind2) {
	var temp = this[ind1];
	this[ind1] = this[ind2];
	this[ind2] = temp;
}

// reverses section of array between ind1 and ind2
Array.prototype.reverse = function(ind1, ind2) {
	if (ind1 < ind2) {
		// while lower index has not surpassed higher index
		while (ind1 < ind2) {
			this.swap(ind1, ind2);
			ind1++;
			ind2--;
		}
	} else {
		// while indices are not equal and they have not passed each other
		while (ind1 != ind2 && !((ind2 < ind1 || (ind1 == 0 && ind2 == this.length - 1)) && ind2 + 1 > ind1 - 1)) {
			this.swap(ind1, ind2);
			ind1 = ind1 + 1 == this.length ? 0 : ind1 + 1;		// increment until reaching length - 1, then send to 0th index
			ind2 = ind2 - 1 < 0 ? this.length - 1 : ind2 - 1;	// decrement until reaching 0, then send to length - 1
		}
	}
}

function setup() {
	var canvas = createCanvas(windowWidth, windowHeight);
	canvas.position(0, 0);
	canvas.style('z-index', '2');
	stroke(255, 150, 100);
	frameRate(60);

	temp = 100.0;
	
	// initialize random path
	path = new Array();
	for (var i = 0; i < cities; i++) {
		path.push([Math.floor(Math.random() * width), Math.floor(Math.random() * height)]);
	}
	path.copyPath(initPath);
	initPath.copyPath(path2);
	pathLen = getInitPathLength();		// initialize path length
	pathLen2 = getInitPathLength2();		// initialize path length
	isFirstIn = true;
	displayPath();
	displayPath2();
}

function setupReset() {
	var canvas = createCanvas(windowWidth, windowHeight);
	canvas.position(0, 0);
	canvas.style('z-index', '2');
	stroke(255, 150, 100);
	frameRate(60);

	temp = 100.0;
	
	initPath.copyPath(path);
	initPath.copyPath(path2);
	pathLen = getInitPathLength();		// initialize path length
	pathLen2 = getInitPathLength2();		// initialize path length
	isFirstIn = true;
	displayPath();
	displayPath2();
}

function draw() {
	//prepere second path by radius
	if (isSecond && isFirstIn) {
		isFirstIn = false;
		preperTwo();
	}
	for (var i = 0; i < speed; i++) {
		twoOpt();
		displayPath();
		if (isSecond) {
			twoOpt2();
			displayPath2();
		}
		$('#length').text("Path Distance: " + pathLen);
		$('#length2').text("Path Distance 2: " + pathLen2);

		if (temp > 0) {
			temp *= 0.999;					// decrement temperature by percentage, allowing much more time with lower temperatures
			if (temp < 0.001) {				// prevent temperature from wasting computational power after reaching 0
				temp = 0.0;
			}
			$('#temp').text("Temperature: " + temp.toFixed(3));
		}
	}
}

// reBoundingPath
function preperTwo() {
	let sumX = 0;
	let sumY = 0;
	
	let pathValues = new Array;
	
	$.each(path2, function(index, value) {
		sumX += value[0];
		sumY += value[1];
	});
	let averX = sumX / path2.length;
	let averY = sumY / path2.length;
	//averX; averY+10
	
	$.each(path2, function(index, value) {
		pathValues[index] = new Array;
		let ab = value[0]*averX + value[1]*averY+10;
		let ma = Math.sqrt(Math.pow(value[0], 2) + Math.pow(value[1], 2));
		let mb = Math.sqrt(Math.pow(averX, 2) + Math.pow(averY+10, 2));
		let znam = ma * mb;
		let cosA = ab / znam;
		pathValues[index][0] = Math.acos(cosA);
		pathValues[index][1] = index;
		if (pathValues[index][0] < 0) {
			pathValues[index][0] = 360 - pathValues[index][0];
		}
	});
	
	pathValues.sort();
	
	$.each(pathValues, function(index, value) {
		path2.swap(index, value[1]);
	});
}

// get initial path length
function getInitPathLength() {
	var total = 0;
	for (var i = 0; i < path.length - 1; i++) {
		total += Math.floor(dist(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]));
	}
	total += Math.floor(dist(path[path.length - 1][0], path[path.length -1][1], path[0][0], path[0][1]));
	return total;
}

// get initial path2 length
function getInitPathLength2() {
	var total = 0;
	for (var i = 0; i < path2.length - 1; i++) {
		total += Math.floor(dist(path2[i][0], path2[i][1], path2[i + 1][0], path2[i + 1][1]));
	}
	total += Math.floor(dist(path2[path2.length - 1][0], path2[path2.length -1][1], path2[0][0], path2[0][1]));
	return total;
}

function displayPath() {
	background(30);
	
	stroke(100, 150, 255);
	// connect all nodes
	for (var i = 0; i < path.length - 1; i++) {
		line(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1])
	}
	stroke(255, 150, 100);
	// line from end to start
	line(path[path.length - 1][0], path[path.length - 1][1], path[0][0], path[0][1]);
}

function displayPath2() {
	
	stroke(100, 255, 150);
	// connect all nodes
	for (var i = 0; i < path2.length - 1; i++) {
		line(path2[i][0], path2[i][1], path2[i + 1][0], path2[i + 1][1])
	}
	stroke(150, 255, 100);
	// line from end to start
	line(path2[path2.length - 1][0], path2[path2.length - 1][1], path2[0][0], path2[0][1]);
}

// two opt solution with simulated annealing
function twoOpt() {
	// get random segment to check for swap (segment between nodes A and B)
	var nodeA = path[Math.floor(random(0, path.length))];										// random node, from any position in array
	var nodeB = path[path.indexOf(nodeA) + 1 == path.length ? 0 : path.indexOf(nodeA) + 1];		// child of that node

	// another random segment; if B is in last position in array, choose C from 0 to A's index; otherwise, choose position
	var nodeC = path[Math.floor(path.indexOf(nodeB) == path.length - 1 ? random(0, path.indexOf(nodeA)) : random(path.indexOf(nodeB), path.length - 1))];		// random node after B
	var nodeD = path[path.indexOf(nodeC) + 1 == path.length ? 0 : path.indexOf(nodeC) + 1];

	// the sum of the distances between A-B and C-D (the current configuration)
	currentDist = Math.floor(dist(nodeA[0], nodeA[1], nodeB[0], nodeB[1]) + dist(nodeC[0], nodeC[1], nodeD[0], nodeD[1]));

	// sum of distances between A-C and B-D	(the new configuration)
	tentativeDist = Math.floor(dist(nodeA[0], nodeA[1], nodeC[0], nodeC[1]) + dist(nodeB[0], nodeB[1], nodeD[0], nodeD[1]));

	// if better path found OR random number under temperature, make swap
	if (tentativeDist < currentDist || Math.random() * 100 < temp) {
		path.reverse(path.indexOf(nodeB), path.indexOf(nodeC));		// reverse all nodes between A and D
		pathLen = (pathLen - currentDist) + tentativeDist;			// update path length without having to recalculate distance for values that have not changed
	}
}

// two opt solution with simulated annealing
function twoOpt2() {
	// get random segment to check for swap (segment between nodes A and B)
	var nodeA2 = path2[Math.floor(random(0, path2.length))];										// random node, from any position in array
	var nodeB2 = path2[path2.indexOf(nodeA2) + 1 == path2.length ? 0 : path2.indexOf(nodeA2) + 1];		// child of that node

	// another random segment; if B is in last position in array, choose C from 0 to A's index; otherwise, choose position
	var nodeC2 = path2[Math.floor(path2.indexOf(nodeB2) == path2.length - 1 ? random(0, path2.indexOf(nodeA2)) : random(path2.indexOf(nodeB2), path2.length - 1))];		// random node after B
	var nodeD2 = path2[path2.indexOf(nodeC2) + 1 == path2.length ? 0 : path2.indexOf(nodeC2) + 1];

	// the sum of the distances between A-B and C-D (the current configuration)
	currentDist2 = Math.floor(dist(nodeA2[0], nodeA2[1], nodeB2[0], nodeB2[1]) + dist(nodeC2[0], nodeC2[1], nodeD2[0], nodeD2[1]));

	// sum of distances between A-C and B-D	(the new configuration)
	tentativeDist2 = Math.floor(dist(nodeA2[0], nodeA2[1], nodeC2[0], nodeC2[1]) + dist(nodeB2[0], nodeB2[1], nodeD2[0], nodeD2[1]));

	// if better path found OR random number under temperature, make swap
	if (tentativeDist2 < currentDist2 || Math.random() * 100 < temp) {
		path2.reverse(path2.indexOf(nodeB2), path2.indexOf(nodeC2));		// reverse all nodes between A and D
		pathLen2 = (pathLen2 - currentDist2) + tentativeDist2;			// update path length without having to recalculate distance for values that have not changed
	}
}
