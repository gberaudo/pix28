app.controller('CanvasController',
    ['$scope', '$element', '$timeout', 'FrameObject', 
	 'ImgService', 'Misc', 
    function($scope, $element, $timeout, FrameObject, ImgService, Misc) {
	var display = $scope.frame.display,
		canvas = $element[0].children[0],
		ctx = canvas.getContext('2d');
	var drawImage = ImgService.drawImage;
	
	initCanvas();
	
	setFocus();
	
	function setFocus() {
		if ($scope.current.datumWithFocus === $scope.frame) {
			canvas.focus();
			ImgService.drawAnchors(canvas);
			$scope.current.onEditImage = false;
			$scope.current.onEditText = false;
			$scope.current.datumWithFocus = undefined;
			if (document.getElementsByClassName('tActive').length != 0) {
				//deactivate the current active element
				activeTextArea = angular.element(document.getElementsByClassName('tActive')[0]); 
				activeTextArea.removeClass('tActive');
			}
			if (document.getElementsByClassName('cActive').length > 0) {
				var activeCanvas = document.getElementsByClassName('cActive')[0];
				var ngActiveCanvas = angular.element(activeCanvas);
				ngActiveCanvas.removeClass('cActive');
				var activeScope = ngActiveCanvas.scope();
				//redraw this canvas to remove anchors
				drawImage(activeCanvas, activeScope.img, 
							 activeScope.frame.display,
							activeScope.frame.image.ratio, $scope.pageRatio);
			}
			angular.element(canvas).addClass('cActive');
		}
	}
	function initCanvas(){
		canvas.width = Math.floor($scope.frame.canvas.width * $scope.pwidth / 100);
		canvas.height = Math.floor($scope.frame.canvas.height * $scope.pheight / 100);
		canvas.style.left = Math.floor($scope.frame.canvas.left * $scope.pwidth / 100) + 'px';
		canvas.style.top = Math.floor($scope.frame.canvas.top * $scope.pheight / 100) + 'px';
		$scope.canvasZone = {};
		$scope.img = new Image();
		Misc.resetZone($scope.canvasZone, canvas.width, canvas.height);
		if (!!$scope.frame.image.src) {
			$scope.img.onload = function() {
				drawImage(canvas, $scope.img, display,
							 $scope.frame.image.ratio, $scope.pageRatio);
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
			drawImage(canvas, $scope.img, display, $scope.frame.image.ratio, $scope.pageRatio);
			ImgService.drawAnchors(canvas);
		}
	};

	function redrawImage() {
		drawImage(canvas, $scope.img, display, $scope.frame.image.ratio, $scope.pageRatio);
		ImgService.drawAnchors(canvas);
	};

	var drag = {
		center: false,
		TL: false,
		TR: false,
		BL: false,
		BR: false,
		L: false,
		R: false,
		T: false,
		B: false,
	};


	$scope.mouseDown = function(evt) {
		$scope.current.mouseIsUp = false;
		var mouseRtCanvas = {
			X: evt.layerX,
			Y: evt.layerY
		};
		Misc.setCursor(mouseRtCanvas, $scope.canvasZone, $scope.current);
		$scope.dragimage = true;
		for (anchor in drag) {
			if (Misc.inRect(mouseRtCanvas, $scope.canvasZone[anchor])) {
				drag[anchor] = true;
				$scope.dragimage = false;
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
			for (anchor in drag) {
				drag[anchor] = false;
			}
			$scope.dragimage = false;
		} 
		
	});

	$scope.$watch('current.mousePos', function(newValue, oldValue, scope) {
		var offset = {
			X: newValue.X - oldValue.X,
			Y: newValue.Y - oldValue.Y
		};

		for (anchor in drag) {
			if (drag[anchor]){
 				var offsetCopy = angular.copy(offset);
 				var anchorCopy = angular.copy(anchor);
				window.requestAnimationFrame(function() {
					redimension(canvas, offsetCopy, anchorCopy);
					if (!!$scope.img.src) {
						drawImage(canvas, $scope.img, display, 
									 $scope.frame.image.ratio, $scope.pageRatio );
						ImgService.drawAnchors(canvas);
					}
					else {
						ImgService.resetFrame(canvas);
						ImgService.drawAnchors(canvas);
					}
					Misc.resetZone($scope.canvasZone, canvas.width, canvas.height);
					updateFrame();
				});
			}
		}
		if ($scope.dragimage) {
				moveImageInCanvas(offset);
		}
	});

	function moveImageInCanvas(offset) {
		var image = $scope.frame.image;
		var sChangeX = -offset.X * image.mWidth / canvas.width,
			sChangeY = -offset.Y * image.mHeight / canvas.height;
		if (sChangeX < -display.sx) {
			display.sx = 0;
		} else if (sChangeX + display.sx + display.sw > image.mWidth) {
			display.sx = image.mWidth - display.sw;
		} else {
			display.sx += sChangeX;
		}
		if (sChangeY < -display.sy) {
			display.sy = 0;
		} else if (sChangeY + display.sy + display.sh > image.mHeight) {
			display.sy = image.mHeight - display.sh;
		} else {
			display.sy += sChangeY;
		}
		drawImage(canvas, $scope.img, display, image.ratio, $scope.pageRatio);
		ImgService.drawAnchors(canvas);
	}

	function redimension(cv, offset, anchor){
		var sChange = {},
			canvasProp = cv.height/cv.width,
			ctop = parseFloat(cv.style.top),
			cleft = parseFloat(cv.style.left),
			pwidth = $scope.pwidth,
			pheight = $scope.pheight,
			image = $scope.frame.image,
			off,
			minSize = pwidth / 6;

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
				if (off > cv.width - minSize) {
					off = cv.width - minSize;
				}
				
				if (off < -cleft) {
					off = -cleft;
				}
				sChange.X = off * display.sw / cv.width;
				
				if (sChange.X < -display.sx) {
					if (display.sw - sChange.X > image.mWidth) {
						var sRes = display.sw - sChange.X - image.mWidth;
						var dr = sRes/image.mWidth;
						scaleRatio = image.mWidth / (cv.width - off);
						display.sy = display.sy + display.sh * dr/2;
						display.sh -=  display.sh * dr;
						display.sx = 0;
						display.sw = image.mWidth;
					} else {
						display.sx = 0;
						display.sw = Math.min(display.sw - sChange.X, image.mWidth);
					}
				} 
				else {
					display.sx += sChange.X; 
					display.sw = Math.min(display.sw - sChange.X, image.mWidth - display.sx);
				}
				cv.style.left = (cleft + off) +'px';
				cv.width -= off;
				display.dw = cv.width;
				break;
				
			case 'R':
				off = offset.X;
				
				//enlarge image when limit attained
				if (off < -cv.width + minSize) {
					off = -cv.width + minSize;
				}
				if (off + cv.width + cleft > pwidth) {
					off = pwidth - cv.width - cleft;
				}
				
				sChange.X = off * display.sw/cv.width;
				
				if (display.sw + display.sx + sChange.X > image.mWidth) {
					sChange.X1 = image.mWidth - display.sw - display.sx;
					if (sChange.X - sChange.X1 > display.sx) {
						var sRes = sChange.X - sChange.X1 - display.sx;
						var dr = sRes/image.mWidth;
// 						scaleRatio = image.mWidth / (cv.width + off);
						display.sy = display.sy + display.sh * dr/2;
						display.sh -=  display.sh * dr;
						display.sx = 0;
						display.sw = image.mWidth;
					} else {
						sChange.X2 = sChange.X - sChange.X1;
						display.sx -= sChange.X2;
						display.sw += sChange.X;
					}
				} 
				else {
					display.sw = Math.min(display.sw + sChange.X, image.mWidth - display.sx);
				}
				cv.width += off;
				display.dw = cv.width;
				break;
			
			case 'T':
				off = offset.Y;
				if (off > cv.height - minSize) {
					off = cv.height - minSize;
				}
				if (off < -ctop) {
					off = -ctop;
				}
				
				sChange.Y = off * display.sh / cv.height;
				
				if (sChange.Y < -display.sy) {
					if (display.sh - sChange.Y > image.mHeight) {
						var sRes = display.sh - sChange.Y - image.mHeight;
						var dr = sRes/image.mHeight;
// 						scaleRatio = image.mHeight / (cv.height - off);
						display.sx = display.sx + display.sw * dr/2;
						display.sw -=  display.sw * dr;
						display.sy = 0;
						display.sh = image.mHeight;
					} else {
						display.sy = 0;
						display.sh = Math.min(display.sh - sChange.Y, image.mHeight);
					}
				} 
				else {
					display.sy += sChange.Y; 
					display.sh = Math.min(display.sh - sChange.Y, image.mHeight - display.sy);
				}
				cv.style.top = (ctop + off) +'px';
				cv.height -= off;
				display.dh = cv.height;
				break;
			
			case 'B':
				off = offset.Y;
				if (off < -cv.height + minSize) {
					off = -cv.height + minSize;
				}
				if (off + cv.height + ctop > pheight) {
					off = pheight - cv.height - ctop;
				}
				sChange.Y = off * display.sh / cv.height;
				
				if (display.sh + display.sy + sChange.Y > image.mHeight) {
					sChange.Y1 = image.mHeight - display.sh - display.sy;
					if (sChange.Y - sChange.Y1 > display.sy) {
						var sRes = sChange.Y - sChange.Y1 - display.sy;
						var dr = sRes/image.mHeight;
// 						scaleRatio = image.mHeight / (cv.height + off);
						display.sx = display.sx + display.sw * dr/2;
						display.sw -=  display.sw * dr;
						display.sy = 0;
						display.sh = image.mHeight;
					} else {
						sChange.Y2 = sChange.Y - sChange.Y1;
						display.sy -= sChange.Y2;
						display.sh += sChange.Y;
					}
				} 
				else {
					display.sh = Math.min(display.sh + sChange.Y, image.mHeight - display.sy);
				}
				cv.height += off;
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
		switch (evt.keyCode) {
			case 61: // key + 
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
			$scope.frame.image.ratio = parseFloat(data.getData('ratio'));
		//then draw image
			firstDrawImage();
		}
		//turn focus to and activate the frame and its page
		evt.target.focus();
		$scope.canvasFocus(evt);
		$scope.$parent.activate();
	};
	
	$scope.canvasFocus = function(event) {
		$scope.$parent.activate();
		if (document.getElementsByClassName('cActive').length > 0) {
			var activeCanvas = angular.element(document.getElementsByClassName('cActive')[0]);
			activeCanvas.removeClass('cActive');
		}
		if (document.getElementsByClassName('tActive').length > 0) {
			var activeText = angular.element(document.getElementsByClassName('tActive')[0]);
			activeText.removeClass('tActive');
		}
		
		angular.element(event.target).addClass('cActive');
		$scope.current.onEditText = false;
		if (!!$scope.img.src) {
			$scope.current.onEditImage = true;
		}
		redrawImage();
		document.addEventListener('mousedown', canvasBlurHandle, true);
	};
	
	function canvasBlurHandle(event) {
		var el = angular.element(event.target);
		if (Misc.ancestorHasClass(el, 5, 'controls') || (el.scope() == $scope)) {
			return;
		} else {
			angular.element(canvas).removeClass('cActive');
			$scope.current.onEditImage = false;
			if (!!$scope.img.src) {
				drawImage(canvas, $scope.img, display, $scope.frame.image.ratio, $scope.pageRatio);
			} else {
				ImgService.resetFrame(canvas);
			}
			document.removeEventListener('mousedown', canvasBlurHandle, true);
		}
	}
	
}]);

app.controller('ImageController',
    ['$scope', 'ImgService', '$interval', '$timeout',
    function($scope, ImgService, $interval, $timeout) {
	$scope.zoomImage = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0],
			scope = angular.element(canvas).scope();
 		$scope.mouseIsDown = true;
		$scope.mouseLeft = false;
		var intervalPromise = $interval(function() {
 			if (!$scope.mouseIsDown || $scope.mouseLeft) {
				$interval.cancel(intervalPromise);
 			} else {
				ImgService.zoomImage(canvas, scope, para);
			}
		}, 50);
	};
	
	$scope.mouseUp = function() {
		$scope.mouseIsDown = false;
	};
	
	$scope.mouseLeave = function() {
		$scope.mouseLeft = true;
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
		$scope.mouseIsDown = true;
		$scope.mouseLeft = false;
		var intervalPromise = $interval(function() {
			if(!$scope.mouseIsDown || $scope.mouseLeft) {
				$interval.cancel(intervalPromise);
			} else {
				ImgService.moveImage(canvas, scope, para);
			}
		}, 50);
	};
	
}]);
