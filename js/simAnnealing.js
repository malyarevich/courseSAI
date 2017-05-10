
var path;
var pathLen;

var speed = 20;
var cities = 50;

var temp;


$(document).ready( function() {
	$('#city').change( function() {
		cities = parseInt($('#city').val(), 10);
		setup();
	});
	$('#calculations').change( function() {
		speed = parseInt($('#calculations').val(), 10);
		setup();
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
	stroke(255);
	frameRate(60);

	temp = 100.0;

	// initialize random path
	path = [];
	for (var i = 0; i < cities; i++) {
		path.push([Math.floor(Math.random() * width), Math.floor(Math.random() * height)]);
	}

	pathLen = getInitPathLength();		// initialize path length
	displayPath();
}

function draw() {
	for (var i = 0; i < speed; i++) {
		twoOpt();
		displayPath();
		$('#length').text("Path Distance: " + pathLen);

		if (temp > 0) {
			temp *= 0.999;					// decrement temperature by percentage, allowing much more time with lower temperatures
			if (temp < 0.001) {				// prevent temperature from wasting computational power after reaching 0
				temp = 0.0;
			}
			$('#temp').text("Temperature: " + temp.toFixed(3));
		}
	}
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

function displayPath() {
	background(30);
	// connect all nodes
	for (var i = 0; i < path.length - 1; i++) {
		line(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1])
	}
	// line from end to start
	line(path[path.length - 1][0], path[path.length - 1][1], path[0][0], path[0][1]);
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
