app.controller('CanvasController', function($scope, $element, $timeout, FrameObject) {
	var display = $scope.frame.display,
		image = $scope.frame.image,
		canvas = $element[0].children[0],
		ctx = canvas.getContext('2d'),
		img = new Image();
		
	
	initCanvas();
	
	function initCanvas(){
		canvas.width = $scope.frame.canvas.width * $scope.pwidth / 100;
		canvas.height = $scope.frame.canvas.height * $scope.pheight / 100;
		canvas.style.left = ($scope.frame.canvas.left * $scope.pwidth / 100) + 'px';
		canvas.style.top = ($scope.frame.canvas.top * $scope.pheight / 100) + 'px';
// 		canvas.width = $scope.frame.canvas.width;
// 		canvas.height = $scope.frame.canvas.height;
// 		canvas.style.left = $scope.frame.canvas.left + 'px';
// 		canvas.style.top = $scope.frame.canvas.top + 'px';
		if (!!image.src) {
			img.onload = function() {
				drawImage(img, display);
				canvas.style.border = 'none';
			};
			img.src = image.src;
		} else {
				canvas.style.border ='1px solid #CCC';
		}
	};

	function firstDrawImage() {
		if (!!img.src) {
			//Negative case to be checked
			/* When an image is dragged into the canvas, fill canvas with image*/
			if (image.mHeight / canvas.height > image.mWidth / canvas.width) {
				image.scaleRatio = image.mWidth / canvas.width;
				display.sw = image.mWidth;
				display.sh = Math.floor(canvas.height * image.scaleRatio);
				display.sx = 0;
				display.sy = max((image.mHeight - display.sh) / 2, 0);
				display.dx = 0;
				display.dy = 0;
				display.dw = canvas.width;
				display.dh = canvas.height;
			} else if (image.mHeight / canvas.height <= image.mWidth / canvas.width) {
				image.scaleRatio = image.mHeight / canvas.height;
				display.sh = image.mHeight;
				display.sw = Math.floor(canvas.width * image.scaleRatio);
				display.sx = max((image.mWidth - display.sw) / 2,0);
				display.sy = 0;
				display.dx = 0;
				display.dy = 0;
				display.dw = canvas.width;
				display.dh = canvas.height;
			}
			drawImage(img, display);
		}
	};

	function drawImage(img, display) {
		if (!!img.src) {
			ctx.drawImage(img, display.sx, display.sy, display.sw, display.sh,
							display.dx, display.dy, display.dw, display.dh);
		}
	};

	function redrawImage() {
		drawImage(img, display);
	};

	function max(a, b) {
		return a > b ? a : b;
	};

	function min(a, b) {
		return a > b ? b : a;
	};

	//Define dragable zones with respect to the canvas
	var topLeftCorner, topRightCorner, botLeftCorner, botRightCorner,
			topEdge, leftEdge, rightEdge, botEdge, centerZone;

	function resetZone() {
		topLeftCorner = {
			left: 0,
			right: canvas.width / 5,
			bot: canvas.height / 5,
			top: 0
		};

		topRightCorner = {
			left: 4 * canvas.width / 5,
			right: canvas.width,
			bot: canvas.height / 5,
			top: 0
		};

		botRightCorner = {
			left: 4 * canvas.width / 5,
			right: canvas.width,
			bot: canvas.height,
			top: 4 * canvas.height / 5
		};

		botLeftCorner = {
			left: 0,
			right: canvas.width / 5,
			bot: canvas.height,
			top: 4 * canvas.height / 5
		};

		topEdge = {
			left: 2 * canvas.width / 5,
			right: 3 * canvas.width / 5,
			bot: canvas.height / 5,
			top: 0
		};

		leftEdge = {
			left: 0,
			right: canvas.width / 5,
			bot: 3 * canvas.height / 5,
			top: 2 * canvas.height / 5
		};

		rightEdge = {
			left: 4 * canvas.width / 5,
			right: canvas.width,
			bot: 3 * canvas.height / 5,
			top: 2 * canvas.height / 5
		};

		botEdge = {
			left: 2 * canvas.width / 5,
			right: 3 * canvas.width / 5,
			bot: canvas.height,
			top: 4 * canvas.height / 5
		};

		centerZone = {
			left: canvas.width / 4,
			right: 3 * canvas.width / 4,
			bot: 3 * canvas.height / 4,
			top: canvas.height / 4
		};
	};

	resetZone();

	var drag = {
		all: false,
		TL: false,
		TR: false,
		BL: false,
		BR: false,
		L: false,
		R: false,
		T: false,
		B: false
	};

	/*when mouse is pressed, 
	check mouse's position and set the corresponding anchor to true*/
	$scope.mouseDown = function(evt) {
		$scope.current.mouseIsUp = false;

		var mouseRespectToCanvas = {
			X: evt.layerX,
			Y: evt.layerY
		};

		if ($scope.mouseIsInRect(mouseRespectToCanvas, centerZone)) {
			drag.all = true;
			$scope.current.cursor = 'move';
		}

		if ($scope.mouseIsInRect(mouseRespectToCanvas, topLeftCorner)) {
			drag.TL = true;
			$scope.current.cursor = 'nw-resize';
		}

		if ($scope.mouseIsInRect(mouseRespectToCanvas, topRightCorner)) {
			drag.TR = true;
			$scope.current.cursor = 'ne-resize';
		}

		if ($scope.mouseIsInRect(mouseRespectToCanvas, botRightCorner)) {
			drag.BR = true;
			$scope.current.cursor = 'se-resize';
		}

		if ($scope.mouseIsInRect(mouseRespectToCanvas, botLeftCorner)) {
			drag.BL = true;
			$scope.current.cursor = 'sw-resize';
		}

		if ($scope.mouseIsInRect(mouseRespectToCanvas, topEdge)) {
			drag.T = true;
			$scope.current.cursor = 'n-resize';
		}

		if ($scope.mouseIsInRect(mouseRespectToCanvas, rightEdge)) {
			drag.R = true;
			$scope.current.cursor = 'e-resize';
		}

		if ($scope.mouseIsInRect(mouseRespectToCanvas, botEdge)) {
			drag.B = true;
			$scope.current.cursor = 's-resize';
		}

		if ($scope.mouseIsInRect(mouseRespectToCanvas, leftEdge)) {
			drag.L = true;
			$scope.current.cursor = 'w-resize';
		}
	};

	$scope.$watch('current.mouseIsUp', function() {
		if ($scope.current.mouseIsUp) {
			for (anchor in drag) {drag[anchor] = false;}
		}
	});

	$scope.$watch('current.mousePos', function(newValue, oldValue, scope) {
		var offset = {
			X: newValue.X - oldValue.X,
			Y: newValue.Y - oldValue.Y
		};

		for (anchor in drag){
			if (drag[anchor]){
				var offsetCopy = angular.copy(offset);
				var anchorCopy = angular.copy(anchor);
				window.requestAnimationFrame(function() {
					redimension(canvas, offsetCopy, anchorCopy);
					redrawImage();
					resetZone();
					updateFrame();
				});
			}
		};
	});


	function redimension(cv, offset, anchor){
		var sChange = {},
			canvasProp = cv.height/cv.width,
			ctop = parseFloat(cv.style.top),
			cleft = parseFloat(cv.style.left),
			pwidth = $scope.pwidth,
			pheight = $scope.pheight,
			off;

		switch (anchor){
			case 'all': 
				if (offset.X < -cleft) {
					offset.X = -cleft;
				}
				if (offset.X + cleft + cv.width > pwidth) {
					offset.X = pwidth - cleft - cv.width;
				}
				if (offset.Y < -ctop) {
					offset.Y = -ctop;
				}
				if (offset.Y + ctop + cv.height > pheight) {
					offset.Y = $scope.height - ctop - cv.height;
				}
				cv.style.left = (cleft + offset.X) + 'px';
				cv.style.top = (ctop + offset.Y) + 'px';
				break;
				
			case 'L':
				off = offset.X; 
				if (off > cv.width) {
					off = cv.width;
				}
				if (off < -cleft) {
					off = -cleft;
				}
				sChange.X = off * image.scaleRatio;
				if (sChange.X < -display.sx){
					sChange.X = -display.sx;
					off = sChange.X / image.scaleRatio;
				}
				cv.style.left = (cleft + off) + 'px';
				cv.width -= off;
				display.sx += sChange.X;
				display.sw -= sChange.X;
				display.dw -= off;
				break;
				
			case 'R':
				off = offset.X;
				if (off < -cv.width) {
					off = -cv.width;
				}
				if (off + cv.width + cleft > pwidth) {
					off = pwidth - cv.width - cleft;
				}
				sChange.X = off * image.scaleRatio;
				if (sChange.X + display.sw + display.sx > image.mWidth){
					sChange.X = image.mWidth - display.sw - display.sx;
					off = sChange.X / image.scaleRatio;
				}
				cv.width += off;
				display.sw += sChange.X;
				display.dw += off;
				break;
			
			case 'T':
				off = offset.Y;
				if (off > cv.height) {
					off = cv.height;
				}
				if (off < -ctop) {
					off = -ctop;
				};
				sChange.Y = off * image.scaleRatio;
				if (sChange.Y < -display.sy){
					sChange.Y = -display.sy;
					off = sChange.Y / image.scaleRatio;
				}
				cv.style.top = (ctop + off) + 'px';
				cv.height -= off;
				display.sh -= sChange.Y;
				display.sy += sChange.Y;
				display.dh -= off;
				break;
			
			case 'B':
				off = offset.Y;
				if (off < -cv.height) {
					off = -cv.height;
				}
				if (off + cv.height + ctop > pheight) {
					off = pheight - cv.height - ctop;
				}
				sChange.Y = off * image.scaleRatio;
				if (sChange.Y + display.sy + display.sh > image.mHeight){
					sChange.Y = image.mHeight - display.sy - display.sh;
					off = sChange.Y / image.scaleRatio;
				}
				cv.height += off;
				display.sh += sChange.Y;
				display.dh += off;
				break;

			case 'TR':
				redimension(cv, offset, 'T');
				redimension(cv, offset, 'R');
				break;
			
			case 'TL':
				redimension(cv, offset, 'T');
				redimension(cv, offset, 'L');
				break;
			
			case 'BR':
				redimension(cv, offset, 'B');
				redimension(cv, offset, 'R');
				break;

			case 'BL':
				redimension(cv, offset, 'B');
				redimension(cv, offset, 'L');
				break;
		}
	};
	
	function updateFrame() {
		$scope.frame.canvas.width = 100 * canvas.width / $scope.pwidth;
		$scope.frame.canvas.height = 100 * canvas.height / $scope.pheight;
		$scope.frame.canvas.top = 100 * canvas.offsetTop / $scope.pheight;
		$scope.frame.canvas.left = 100 * canvas.offsetLeft / $scope.pwidth;
		
// 		$scope.frame.canvas.width = canvas.width;
// 		$scope.frame.canvas.height = canvas.height;
// 		$scope.frame.canvas.top = canvas.offsetTop;
// 		$scope.frame.canvas.left = canvas.offsetLeft;
	};
	
	$scope.keyDown = function(evt) {
		console.log(evt.keyCode);
		switch (evt.keyCode) {
			case 61: // if key + is pressed then zoom out 
			case 187:
				zoomImage('out');
				break;
			case 173: // key -
			case 189:
				zoomImage('in');
				break;
			case 37: //key left
				moveImage('left');
				break;
			case 38: //key up
				moveImage('up');
				break;
			case 39: //key right
				moveImage('right');
				break;
			case 40: //key down
				moveImage('down');
				break;
			case 46: //del
				delImage();
				break;
		}
		if (evt.ctrlKey && (evt.keyCode == 46)) {
			delCanvas(evt.target);
		}
	};

	function zoomImage(para) {
		var rate = 1.1;
		if (para == 'out') {
			zoom(1/rate);
		}
		if (para == 'in') {
			zoom(rate);
		}
	};
	
	function zoom(rate) {
		var sChange = {};
		var canvasProp = canvas.height/canvas.width;
		var realRate = rate;
		sChange.X = -0.5 * (1 - 1 / realRate) * display.dw * realRate * image.scaleRatio;
		sChange.Y = sChange.X * canvasProp;

		if (sChange.X < -display.sx) {
			sChange.X = -display.sx;
			sChange.Y =  sChange.X * canvasProp;
			realRate = 1 + 2* sChange.X / (display.dw * image.scaleRatio);
		}
		
		if (sChange.Y < -display.sy) {
			sChange.Y = -display.sy;
			sChange.X = sChange.Y / canvasProp;
			realRate = 1 + 2* sChange.X / (display.dw * image.scaleRatio);
		}
		
		display.sx += sChange.X;
		display.sy += sChange.Y; 
		display.sw = display.sw * realRate;
		display.sh = display.sh * realRate;
		image.scaleRatio = realRate * image.scaleRatio; //update scale
		redrawImage();
	};
	
	function moveImage(para) {
		var offset = 10;
		switch (para){
			case 'left':
				if (offset > display.sx) {
					offset = display.sx;
				}
				display.sx -= offset;
				break;
			case 'right':
				if (offset + display.sx + display.sw > image.mWidth) {
					offset = image.mWidth - display.sx - display.sw;
				}
				display.sx += offset;
				break;
			case 'up':
				if (offset > display.sy) {
					offset = display.sy;
				}
				display.sy -= offset;
				break;
			case 'down':
				if (offset + display.sy + display.sh > image.mHeight) {
					offset = image.mHeight - display.sy - display.sh;
				}
				display.sy += offset;
				break;
		}
		redrawImage();
	};
	
	function delImage() {
		$scope.frame.image = {};
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	};
	
	function delCanvas(el) {
		$scope.current[el.parentNode.parentNode.id].frames.splice($scope.$index,1);
		

	};
	$scope.allowDrop = function(ev) {
		ev.preventDefault();
	};

	$scope.dropInCanvas = function(evt) {
		evt.preventDefault();
		var data = evt.dataTransfer;
		var name = data.getData('name');
		if (name == 'image') {
			img.src = data.getData('URL');
		//update information for image in storage
			image.src = data.getData('URL');
			image.mHeight = parseInt(data.getData('mHeight'));
			image.mWidth = parseInt(data.getData('mWidth'));
			image.DbId = parseInt(data.getData('DbId'));
		//then draw image
			firstDrawImage();
		}
	};
	
	$scope.canvasFocus = function(event) {
		$scope.$parent.activate();
	};

});