app.controller('CanvasController',
    ['$scope', '$element', '$timeout', 'FrameObject', 
	 'ImgService', 'Misc', 
    function($scope, $element, $timeout, FrameObject, ImgService, Misc) {
	var display = $scope.frame.display,
		canvas = $element[0].children[0],
		ctx = canvas.getContext('2d'),
		frame = $scope.frame,
		pwidth = $scope.pwidth,
		pheight = $scope.pheight,
		drawImage = ImgService.drawImage;
	var pageId = canvas.parentNode.parentNode.id;
	initCanvas();
	
	setFocus();
	function canvasFocus() {
		$scope.$parent.activate();
		if (document.getElementsByClassName('cActive').length > 0) {
			var activeCanvas = angular.element(document.getElementsByClassName('cActive')[0]);
			activeCanvas.removeClass('cActive');
		}
		if (document.getElementsByClassName('tActive').length > 0) {
			var activeText = angular.element(document.getElementsByClassName('tActive')[0]);
			activeText.removeClass('tActive');
		}
		
		angular.element(canvas).addClass('cActive');
		$scope.current.onEditText = false;
		$scope.current.onEditImage = true;
		ImgService.drawAnchors(canvas);
		document.addEventListener('mousedown', canvasBlurHandle, true);
		$scope.current.borderColor = $scope.frame.border.color || '';
		$scope.current.borderThickness = $scope.frame.border.thickness || 0;
		markSelectedBorder();
		function markSelectedBorder() {
			if (document.getElementsByClassName('border selected').length > 0) {
				angular.element(document.getElementsByClassName('border selected')[0])
				.removeClass('selected');
			}
			angular.element(document.getElementsByClassName(
				'border ' + 'BD_' + $scope.frame.border.color)).addClass('selected');
		}
	};
	
	function setFocus() {
		if ($scope.current.datumWithFocus === $scope.frame) {
			canvasFocus();
			ImgService.drawAnchors(canvas);
			$scope.current.datumWithFocus = undefined;
		}
	}
	function initCanvas(){
		canvas.width = Math.floor(frame.canvas.width * pwidth / 100);
		canvas.height = Math.floor(frame.canvas.height * pheight / 100);
		canvas.style.left = Math.floor(frame.canvas.left * pwidth / 100) + 'px';
		canvas.style.top = Math.floor(frame.canvas.top * pheight / 100) + 'px';
		frame.layer = frame.layer || 10;
		if (!!frame.border) {
			if (frame.border.color && frame.border.thickness) {
				canvas.style.outline = frame.border.thickness + 'px solid '+ frame.border.color;
			}
		}
		canvas.style.zIndex = frame.layer;
		if (!!frame.angle) {
			canvas.style.transform = 'rotate(' + frame.angle + 'deg)';
		} else {
			frame.angle = 0;
		}
		$scope.canvasZone = {};
		$scope.img = new Image();
		Misc.resetZone($scope.canvasZone, canvas.width, canvas.height);
		if (!!$scope.frame.image.src) {
			if (!!display.sw) { //verify if the image is already draw on this canvas before
				$scope.img.onload = function() {
					drawImage(canvas, $scope.img, display,
								$scope.frame.image.ratio, $scope.pageRatio);
				};
				$scope.img.src = $scope.frame.image.src;
			} else {
				$scope.img.onload = function() {
					firstDrawImage();
				};
				$scope.img.src = $scope.frame.image.src;
			}
			
		} else {
				ImgService.resetFrame(canvas);
		}
	};

	function firstDrawImage() {
		if (!!$scope.img.src) {
			var image = $scope.frame.image;
			/* When an image is dragged into the canvas, fill canvas with image*/
			if (image.mHeight / canvas.height > image.mWidth / canvas.width) {
				image.scaleRatio = image.mWidth / canvas.width;
				display.sw = image.mWidth;
				display.sh = canvas.height * image.scaleRatio;
				display.sx = 0;
				display.sy = Math.max((image.mHeight - display.sh) / 2, 0);
			} else if (image.mHeight / canvas.height <= image.mWidth / canvas.width) {
				image.scaleRatio =image.mHeight / canvas.height;
				display.sh = image.mHeight;
				display.sw = canvas.width * image.scaleRatio;
				display.sx = Math.max((image.mWidth - display.sw) / 2, 0);
				display.sy = 0;
			}
			drawImage(canvas, $scope.img, display, $scope.frame.image.ratio, $scope.pageRatio);
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

	var mousePosWatch = function() {};

	$scope.mouseDown = function(evt) {
		$scope.current.mouseIsUp = false;
		var mouseRtCanvas = {
			X: evt.layerX,
			Y: evt.layerY
		};
		var refs = ImgService.getRefLines($scope, pageId);
		
		
		Misc.setCursor(mouseRtCanvas, $scope.canvasZone, $scope.current);
		$scope.dragimage = true;
		for (anchor in drag) {
			if (Misc.inRect(mouseRtCanvas, $scope.canvasZone[anchor])) {
				drag[anchor] = true;
				$scope.dragimage = false;
				break;
			} 
			
		}
		
		mousePosWatch = $scope.$watch('current.mousePos', function(newValue, oldValue) {
			if (!$scope.current.mouseIsUp) {
				var offset = {
					X: newValue.X - oldValue.X,
					Y: newValue.Y - oldValue.Y
				};
				
				for (anchor in drag) {
					if (drag[anchor]){
						var offsetCopy = angular.copy(offset);
						var anchorCopy = angular.copy(anchor);
						
						window.requestAnimationFrame(function() {
							redimension(canvas, offsetCopy, anchorCopy, refs);
							if ($scope.frame.angle % 180 == 0) {
								ImgService.showRefLines(canvas, refs, $scope);
							}
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
						break;
					}
				}
				
				if ($scope.dragimage) {
 						moveImageInCanvas(offset);
				}
			}
		});
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
			mousePosWatch();
		} 
		
	});



	function moveImageInCanvas(offset) {
		if (!!$scope.frame.image.src) {
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
	}

	function redimension(cv, offset, anchor, refs){
		var sChange = {},
			canvasProp = cv.height/cv.width,
			ctop = parseFloat(cv.style.top),
			cleft = parseFloat(cv.style.left),
			pwidth = $scope.pwidth,
			pheight = $scope.pheight,
			image = $scope.frame.image,
			off,
			minSize = pwidth / 6;
		var angle = $scope.frame.angle || 0;
			
		function getCloseRef(pos, list) {
			var close = false;
			for (var i = 0; i < list.length; i++) {
				if (list[i] - 2 <= pos && pos <= list[i] + 2) {
					close = true;
					return list[i];
					break;
				}
			}
			if (!close) {
				return false;
			}
		}
		var left, right, top, bot;
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
				left = getCloseRef(cleft + offset.X, refs.horizontal);
				top = getCloseRef(ctop + offset.Y, refs.vertical);
				right = getCloseRef(cleft + offset.X + cv.width, refs.horizontal);
				bot = getCloseRef(ctop + offset.Y + cv.height, refs.vertical);
				//stick border of canvas to a close border
				
				if (!!left) {
					cv.style.left = left + 'px';
				} else if (!!right) {
					cv.style.left = (right - cv.width) + 'px';
				}
				else {
					cv.style.left = (cleft + offset.X) + 'px';
				}
				
				if (!!top) {
					cv.style.top = top + 'px';
				} else if (!!bot) {
					cv.style.top = (bot - cv.height) + 'px'; 
				}else {
					cv.style.top = (ctop + offset.Y) + 'px';
				}
				break;
				
			case 'L':
				
				off = Math.floor(Math.cos(Math.PI * angle / 180) * offset.X
						+ Math.sin(Math.PI * angle / 180) * offset.Y); 
				if (off > cv.width - minSize) {
					off = cv.width - minSize;
				}
				
				if (off < -cleft) {
					off = -cleft;
				}
				left = getCloseRef(cleft + off, refs.horizontal);
				if (!!left) {
					off = left - cleft;
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
				break;
				
			case 'R':
				
				off = Math.floor(Math.cos(Math.PI * angle / 180) * offset.X
						+ Math.sin(Math.PI * angle / 180) * offset.Y); 
// 				off = offset.X;
				
				//enlarge image when limit attained
				if (off < -cv.width + minSize) {
					off = -cv.width + minSize;
				}
				if (off + cv.width + cleft > pwidth) {
					off = pwidth - cv.width - cleft;
				}
				right = getCloseRef(cleft + off + cv.width, refs.horizontal);
				if(!!right) {
					off = right - cleft - cv.width;
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
				break;
			
			case 'T':
				off = Math.floor(-Math.sin(Math.PI * angle / 180) * offset.X
						+ Math.cos(Math.PI * angle / 180) * offset.Y); 
// 				off = offset.Y;
				if (off > cv.height - minSize) {
					off = cv.height - minSize;
				}
				if (off < -ctop) {
					off = -ctop;
				}
				top = getCloseRef(ctop + off, refs.vertical);
				if (!!top) {
					off = top - ctop;
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
				break;
			
			case 'B':
				off = Math.floor(-Math.sin(Math.PI * angle / 180) * offset.X
						+ Math.cos(Math.PI * angle / 180) * offset.Y); 
// 				off = offset.Y;
				if (off < -cv.height + minSize) {
					off = -cv.height + minSize;
				}
				if (off + cv.height + ctop > pheight) {
					off = pheight - cv.height - ctop;
				}
				bot = getCloseRef(ctop + off + cv.height, refs.vertical);
				if (!!bot) {
					off = bot - ctop - cv.height;
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
				break;

			case 'TR':
				redimension(cv, offset, 'T', refs);
				redimension(cv, offset, 'R', refs);
				break;
			
			case 'TL':
				redimension(cv, offset, 'T', refs);
				redimension(cv, offset, 'L', refs);
				break;
			
			case 'BR':
				redimension(cv, offset, 'B', refs);
				redimension(cv, offset, 'R', refs);
				break;

			case 'BL':
				redimension(cv, offset, 'B', refs);
				redimension(cv, offset, 'L', refs);
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
				if (!!$scope.frame.image.src) {
					ImgService.updateOldThumb($scope.frame.image.DbId);
					$scope.img = new Image();
					$scope.frame.image = {};
					ImgService.resetFrame(canvas);
				} else {
					ImgService.delCanvas(canvas, $scope);
				}
				break;
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
			if (!!$scope.frame.image.DbId) {
				var oldDbId = $scope.frame.image.DbId;
				ImgService.updateOldThumb(oldDbId);
			}
			$scope.img.src = data.getData('URL');
		//update information for image in storage
			$scope.frame.image.src = data.getData('URL');
			$scope.frame.image.mHeight = parseInt(data.getData('mHeight'));
			$scope.frame.image.mWidth = parseInt(data.getData('mWidth'));
			var DbId = parseInt(data.getData('DbId'));
			$scope.frame.image.DbId = DbId;
			$scope.frame.image.ratio = parseFloat(data.getData('ratio'));
		//then draw image
			firstDrawImage();
			canvasFocus();
			$scope.$parent.activate();
			updateNewThumb(DbId);
		}
		if (name == 'exchange') {
			console.log('exchanged');
		}
	};
	
	function updateNewThumb(DbId) {
		var usedCheck = document.getElementById('check' + DbId);
		usedCheck.innerHTML = parseInt(usedCheck.innerHTML||0) + 1; 
		usedCheck.style.display = 'inline-block';
	}
	
	
	
	$scope.canvasFocus = function() {
		canvasFocus();
	};
	
	function canvasBlurHandle(event) {
		var el = angular.element(event.target);
		if (Misc.ancestorHasClass(el, 8, 'controls') ||
			(el.scope() == $scope)
			) {
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
/*	
	$scope.dragCanvas = function(event) {
		
		event.dataTransfer.effectAllowed = "copy";
		event.dataTransfer.setData('name', 'exchange');
// 		var img = document.createElement('img');
// 		img.src = $scope.img.src;
// 		img.style.width = '100px';
// 		img.style.height = '100px';
		event.preventDefault();
	};
	*/
}]);

app.controller('ImageController',
    ['$scope', 'ImgService', '$interval', '$timeout', 'Misc',
    function($scope, ImgService, $interval, $timeout, Misc) {
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
		if (!!scope.frame.image.src) {
			ImgService.updateOldThumb(scope.frame.image.DbId);
			scope.img = new Image();
			scope.frame.image = {};
			ImgService.resetFrame(canvas);
		} else {
			ImgService.delCanvas(canvas, scope);
		}
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
				moveCanvas(canvas, scope, para);
			}
		}, 100);
	};
	
	function moveCanvas(canvas, scope, para) {
		var off = 1;
		var pwidth = $scope.pwidth;
		switch (para) {
			case 'left':
				if (off > canvas.offsetLeft) {
					off = canvas.offsetLeft;
				}
				scope.frame.canvas.left -=  off * 100 / pwidth;
				canvas.style.left = (canvas.offsetLeft - off) + 'px';
				break;
			
			case 'right':
				if (off > $scope.pwidth - canvas.offsetLeft - canvas.offsetWidth) {
					off = $scope.pwidth - canvas.offsetLeft -canvas.offsetWidth;
				}
				scope.frame.canvas.left +=  off * 100 / pwidth;
				canvas.style.left = (canvas.offsetLeft + off) + 'px';
				break;
			
			case 'up':
				if (off > canvas.offsetTop) {
					off = canvas.offsetTop;
				}
				scope.frame.canvas.top -= off * 100 / pwidth;
				canvas.style.top = (canvas.offsetTop - off) + 'px';
				break;
				
			case 'down':
				if (off > $scope.pheight - canvas.offsetTop - canvas.offsetHeight) {
					off = $scope.pheight - canvas.offsetTop -canvas.offsetHeight;
				}
				scope.frame.canvas.top +=  off * 100 / pwidth;
				canvas.style.top = (canvas.offsetTop + off) + 'px';
				break;
		}
		if (scope.frame.angle % 180 == 0) {
			var pageId = canvas.parentNode.parentNode.id;
			var refs = ImgService.getRefLines(scope, pageId);
			ImgService.showRefLines(canvas, refs, $scope);
		}
	}
	
	$scope.rotate = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0];
		var scope = angular.element(canvas).scope();
		$scope.mouseIsDown = true;
		$scope.mouseLeft = false;
		var intervalPromise = $interval(function() {
			if(!$scope.mouseIsDown || $scope.mouseLeft) {
				$interval.cancel(intervalPromise);
			} else {
				rotate(canvas, para, scope);
			}
		}, 100);
	};
	
	function rotate(canvas, para, scope) {
		var angle = 2;
		switch (para) {
			case 'right':
				scope.frame.angle += angle; 
				canvas.style.transform = 'rotate(' + scope.frame.angle + 'deg)';
				break;
			case 'left':
				scope.frame.angle -= angle; 
				canvas.style.transform = 'rotate(' + scope.frame.angle + 'deg)';
				break;
		}
	}
	
	$scope.level = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0];
		var scope = angular.element(canvas).scope();
		var index = parseInt(canvas.style.zIndex)
		switch (para) {
			case 'up':
				canvas.style.zIndex = index + 1;
				scope.frame.layer = index + 1;
				break;
			case 'down':
				if (index > 0) {
				canvas.style.zIndex = index - 1;
				scope.frame.layer = index - 1;
				}
				break;
		}
	};
	

	
}]);
