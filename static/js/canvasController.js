app.controller('CanvasController',
    ['$scope', '$element', '$timeout', 'FrameObject', 
	 'ImgService', 'Misc', 
    function($scope, $element, $timeout, FrameObject, ImgService, Misc) {
	var display = $scope.frame.display,
		canvas = $element[0].children[0],
		ctx = canvas.getContext('2d');
	var drawImage = ImgService.drawImage;
	
	initCanvas();
	
	function initCanvas(){
		canvas.width = $scope.frame.canvas.width * $scope.pwidth / 100;
		canvas.height = $scope.frame.canvas.height * $scope.pheight / 100;
		canvas.style.left = ($scope.frame.canvas.left * $scope.pwidth / 100) + 'px';
		canvas.style.top = ($scope.frame.canvas.top * $scope.pheight / 100) + 'px';
		$scope.canvasZone = {};
		$scope.img = new Image();
		Misc.resetZone($scope.canvasZone, canvas.width, canvas.height);
		if (!!$scope.frame.image.src) {
			$scope.img.onload = function() {
				drawImage(canvas, $scope.img, display);
			};
			$scope.img.src = $scope.frame.image.src;
		} else {
				ImgService.resetFrame(canvas);
		}
	};

	function firstDrawImage() {
		if (!!$scope.img.src) {
			var image = $scope.frame.image;
			//Negative case to be checked
			/* When an image is dragged into the canvas, fill canvas with image*/
			if (image.mHeight / canvas.height > image.mWidth / canvas.width) {
				image.scaleRatio = image.mWidth / canvas.width;
				display.sw = image.mWidth;
				display.sh = canvas.height * image.scaleRatio;
				display.sx = 0;
				display.sy = Math.max((image.mHeight - display.sh) / 2, 0);
				display.dx = 0;
				display.dy = 0;
				display.dw = canvas.width;
				display.dh = canvas.height;
			} else if (image.mHeight / canvas.height <= image.mWidth / canvas.width) {
				image.scaleRatio =image.mHeight / canvas.height;
				display.sh = image.mHeight;
				display.sw = canvas.width * image.scaleRatio;
				display.sx = Math.max((image.mWidth - display.sw) / 2, 0);
				display.sy = 0;
				display.dx = 0;
				display.dy = 0;
				display.dw = canvas.width;
				display.dh = canvas.height;
			}
			drawImage(canvas, $scope.img, display);
		}
	};

	function redrawImage() {
		drawImage(canvas, $scope.img, display);
	};

		//Define dragable zones with respect to the canvas
// 	var topLeftCorner, topRightCorner, botLeftCorner, botRightCorner,
// 			topEdge, leftEdge, rightEdge, botEdge, centerZone;

	var drag = {
		center: false,
		TL: false,
		TR: false,
		BL: false,
		BR: false,
		L: false,
		R: false,
		T: false,
		B: false
	};


	$scope.mouseDown = function(evt) {
		$scope.current.mouseIsUp = false;
		var mouseRtCanvas = {
			X: evt.layerX,
			Y: evt.layerY
		};
		Misc.setCursor(mouseRtCanvas, $scope.canvasZone, $scope.current);
		for (anchor in drag) {
			if (Misc.inRect(mouseRtCanvas, $scope.canvasZone[anchor])) {
				drag[anchor] = true;
				break;
			}
		}
	};
	
	$scope.mouseMove = function(evt) {
		var mouseRtCanvas = {
			X: evt.layerX,
			Y: evt.layerY
		};
		Misc.setCursor(mouseRtCanvas, $scope.canvasZone, $scope.current);
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
					if (!!$scope.img.src) {
						drawImage(canvas, $scope.img, display);
					}
					else {
						ImgService.resetFrame(canvas);
					}
					Misc.resetZone($scope.canvasZone, canvas.width, canvas.height);
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
			image = $scope.frame.image,
			off;

		switch (anchor){
			case 'center': 
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
				if (off > cv.width - 30) {
					off = cv.width - 30;
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
				display.sw = Math.min(display.sw - sChange.X, image.mWidth);
				display.dw = cv.width;
				break;
				
			case 'R':
				off = offset.X;
				if (off < -cv.width + 30) {
					off = -cv.width + 30;
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
				display.sw = Math.min(display.sw + sChange.X, image.mWidth);
				display.dw = cv.width;
				break;
			
			case 'T':
				off = offset.Y;
				if (off > cv.height - 30) {
					off = cv.height - 30;
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
				display.sy += sChange.Y;
				display.sh = Math.min(display.sh - sChange.Y, image.mHeight);
				display.dh = cv.height;
				break;
			
			case 'B':
				off = offset.Y;
				if (off < -cv.height + 30) {
					off = -cv.height + 30;
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
				display.sh = Math.min(display.sh + sChange.Y, image.mHeight);
				display.dh = cv.height;
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
	};
	
	$scope.keyDown = function(evt) {
		console.log(evt.keyCode);
		switch (evt.keyCode) {
			case 61: // if key + is pressed then zoom out 
			case 187:
				ImgService.zoomImage(canvas, $scope, 'in');
				break;
			case 173: // key -
			case 189:
				ImgService.zoomImage(canvas, $scope, 'out');
				break;
			case 37: //key left
				ImgService.moveImage(canvas, $scope, 'left');
				break;
			case 38: //key up
				ImgService.moveImage(canvas, $scope, 'up');
				break;
			case 39: //key right
				ImgService.moveImage(canvas, $scope, 'right');
				break;
			case 40: //key down
				ImgService.moveImage(canvas, $scope, 'down');
				break;
			case 46: //del
				if (!evt.ctrlKey) {
					ImgService.delCanvas(canvas, $scope);
				}
				break;
		}
		if (evt.ctrlKey && (evt.keyCode == 46)) {
			$scope.img = new Image();
			$scope.frame.image = {};
			ImgService.resetFrame(canvas);
		}
	};


	$scope.allowDrop = function(ev) {
		ev.preventDefault();
	};

	$scope.dropInCanvas = function(evt) {
		evt.preventDefault();
		var data = evt.dataTransfer;
		var name = data.getData('name');
		if (name == 'image') {
			$scope.img.src = data.getData('URL');
		//update information for image in storage
			$scope.frame.image.src = data.getData('URL');
			$scope.frame.image.mHeight = parseInt(data.getData('mHeight'));
			$scope.frame.image.mWidth = parseInt(data.getData('mWidth'));
			$scope.frame.image.DbId = parseInt(data.getData('DbId'));
		//then draw image
			firstDrawImage();
		}
		//turn focus to and activate the frame and its page
		evt.target.focus();
		$scope.$parent.activate();
		if (document.getElementsByClassName('cActive').length > 0) {
			var activeCanvas = angular.element(document.getElementsByClassName('cActive')[0]);
			activeCanvas.removeClass('cActive');
		}
		angular.element(evt.target).addClass('cActive');
		$scope.current.onEditText = false;
		$scope.current.onEditImage = true;
	};
	
	$scope.canvasFocus = function(event) {
		$scope.$parent.activate();
		if (document.getElementsByClassName('cActive').length > 0) {
			var activeCanvas = angular.element(document.getElementsByClassName('cActive')[0]);
			activeCanvas.removeClass('cActive');
		}
		angular.element(event.target).addClass('cActive');
		if (!!$scope.img.src) {
			$scope.current.onEditText = false;
			$scope.current.onEditImage = true;
		}
	};

}]);

app.controller('ImageController',
    ['$scope', 'ImgService', '$interval', '$timeout',
    function($scope, ImgService, $interval, $timeout) {
	$scope.zoomImage = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0],
			scope = angular.element(canvas).scope();
 		$scope.mouseDown = true;
		var intervalPromise = $interval(function() {
 			if (!$scope.mouseDown) {
				$interval.cancel(intervalPromise);
 			} else {
				ImgService.zoomImage(canvas, scope, para);
			}
		}, 50);
	};
	
	$scope.mouseUp = function() {
		$scope.mouseDown = false;
	};
	
	$scope.removeImage = function() {
		var canvas = document.getElementsByClassName('cActive')[0],
			scope = angular.element(canvas).scope();
		scope.img = new Image();
		scope.frame.image = {};
		ImgService.resetFrame(canvas);
	};
	
	$scope.go = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0],
			scope = angular.element(canvas).scope();
		$scope.mouseDown = true;
		var intervalPromise = $interval(function() {
			if(!$scope.mouseDown) {
				$interval.cancel(intervalPromise);
			} else {
				ImgService.moveImage(canvas, scope, para);
			}
		}, 50);
	};
	
}]);
