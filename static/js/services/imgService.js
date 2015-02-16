app.service('ImgService', ['gettextCatalog', '$q', 'Misc', '$timeout',
				function(gettextCatalog, $q, Misc, $timeout) {
	function showThumbnail(obj, id, goBottom, usedMap) {
		var title = gettextCatalog.getString('Drag and drop on a frame in album'),
			img = document.createElement('img'),
			usedCheck = document.createElement('div'),
			delImage = document.createElement('div'),
			div = document.createElement('div'),
			output = document.getElementById('output');
		img.src = obj.minSrc;
		img.draggable = 'true';
		img.setAttribute('class','thumb');
		img.setAttribute(
			'ondragstart',
			'angular.element(this).scope().dragImage(event)'
		);
		img.setAttribute('mWidth', obj.mWidth);
		img.setAttribute('mHeight', obj.mHeight);
		img.setAttribute('DbId', id);
		img.setAttribute('ratio', obj.ratio);
		img.setAttribute('onmouseover', 'angular.element(this).scope().mouseOver(event)');
		img.setAttribute('onmouseleave', 'angular.element(this).scope().mouseLeave(event)');
		img.setAttribute('title', title); 
		img.setAttribute('onfocus', 'angular.element(this).scope().thumbOnFocus(event)');
// 		img.setAttribute('onblur', 'angular.element(this).scope().thumbOnBlur(event)');
		img.setAttribute('tabIndex', 0);
		div.setAttribute('class', 'thumb');
		
		usedCheck.id = 'check' + id;
		if (!!usedMap) {
			obj.used = usedMap[id];
		}
		usedCheck.innerHTML = obj.used || '';
		if (!!obj.used){
			usedCheck.style.display = 'inline-block';
		}
		
		angular.element(delImage).addClass('delImage');
		delImage.id = 'image_' + id;
		var removeTitle = gettextCatalog.getString('Delete this image');
		delImage.setAttribute('title', removeTitle);
		delImage.innerHTML = '<span class = "fa fa-remove"\
			DbId = "' + id + '"></span>';
		angular.element(usedCheck).addClass('usedCheck');
		angular.element(usedCheck).addClass('circledNumber');
		div.appendChild(usedCheck);
		div.appendChild(img);
		div.appendChild(delImage);
		output.appendChild(div);
		if (goBottom) {
			output.scrollTop = output.scrollHeight;
		}
	}
	
	this.showThumbnail = showThumbnail;
	
	this.loadImages = function(id, usedMap) {
		var openRq = window.indexedDB.open('ImagesDB', 1);
		openRq.onsuccess = function() {
			var db = openRq.result,
				trans = db.transaction(['Images']),
				store = trans.objectStore('Images'),
				index = store.index('inAlbum'),
				keyRange = IDBKeyRange.only(id),
				openCursor = index.openCursor(keyRange);
			openCursor.onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					showThumbnail(cursor.value, cursor.value.id, false, usedMap);
					cursor.continue();
				}
			};
			openCursor.onerror = function(event) {
				console.log('openCursor error');
			};
		};
	};
	
	function drawAnchors(canvas) {
		var color = 'darkred',
			size = 6,
			ctx = canvas.getContext('2d');
		ctx.rect(0,0, size, size); //top left
		ctx.rect(canvas.width - size, 0 , size, size); //top right
		ctx.rect(canvas.width - size, canvas.height - size, size, size); //bottom right
		ctx.rect(0, canvas.height - size, size, size); //bottom left
		ctx.rect(canvas.width/2 - size/2, 0, size, size); //top
		ctx.rect(canvas.width - size, canvas.height/2 - size/2, size, size);//right
		ctx.rect(canvas.width/2 - size/2, canvas.height - size, size, size); //bottom
		ctx.rect(0, canvas.height/2 - size/2, size, size); //left
		ctx.rect(canvas.width/2 - size/2, canvas.height/2 - size/2, size, size); //center
		ctx.fillStyle = color;
		ctx.fill();
	}
	
	function drawImage(canvas, img, display, imgRatio, pageRatio) {
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, display.sx, display.sy, display.sw, display.sh,
							0, 0, canvas.width, canvas.height);
		canvas.style.border = 'none';
		if (display.sw * imgRatio < 5 * pageRatio * canvas.width) {
			bad = document.createElement('img');
			bad.onload = function() {
				ctx.drawImage(bad, 1, 1);
				ctx.fillStyle = 'red';
				var notification = gettextCatalog.getString('Low resolution!');
				ctx.fillText(notification, 1, 25);
			}
			bad.src = 'static/icons/face-sad.png';
		}
	};
	
	this.drawImage = drawImage;
	
	this.drawAnchors = drawAnchors;
	
	this.resetFrame  = function(canvas) {
		var ctx = canvas.getContext('2d');
		var msg = gettextCatalog.getString('Drop an image here');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#EFEFEF';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#666';
		ctx.fillText(msg, 5, 20);
	};
	
	this.delCanvas = function(el, $scope) {
		$scope.current[el.parentNode.parentNode.id].frames.splice($scope.$index,1);
	};

	this.computeZoomedDisplay = function(canvas, image, display, rate) {
		var realRate = Math.min(rate, image.mWidth / display.sw, image.mHeight / display.sh);
		var canvasProp = canvas.height/canvas.width;
		var totalChangeX = (realRate - 1) * display.sw;
		var totalChangeY =  totalChangeX * canvasProp;

                var wl = image.mWidth - display.sw - display.sx,
                        hl = image.mHeight - display.sh - display.sy;

                if (display.sx > totalChangeX / 2) {
                        display.sx = Math.max(display.sx - Math.max(totalChangeX / 2, totalChangeX - wl), 0);
                } else {
                        display.sx = 0;
                }

                if (display.sy > totalChangeY / 2) {
                        display.sy = Math.max(display.sy - Math.max(totalChangeY / 2, totalChangeY - hl), 0);
                } else {
                        display.sy = 0;
                }
                display.sw = Math.min(realRate * display.sw, image.mWidth - display.sx);
                display.sh = Math.min(display.sw * canvasProp, image.mHeight - display.sy);
	}

	this.zoomImage = function(canvas, scope, para) {
		var rate = 1.01,
		img = scope.img,
		image = scope.frame.image,
		display = scope.frame.display;

                if (para == 'in') {
                        this.computeZoomedDisplay(canvas, image, display, 1/rate);
                }
                if (para == 'out') {
                        this.computeZoomedDisplay(canvas, image, display, rate);
                }

		drawImage(canvas, img, display, image.ratio, scope.pageRatio);
                drawAnchors(canvas);
	};

	this.moveImage = function(canvas, scope, para) {
		var offset = 3,
			img = scope.img,
			image = scope.frame.image,
			display = scope.frame.display;
		
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
		drawImage(canvas, img, display, image.ratio, scope.pageRatio );
		drawAnchors(canvas);
	};

	function getRefLines(scope, pageId) {
		var boxes = document.getElementsByClassName(pageId + 'box');
				
		var refs = {
			horizontal: [], 
			vertical: []
		};
		for (var i = 0; i < boxes.length; i++) {
			var box = boxes[i];
			if (!isActive(box)) {
				var left = box.offsetLeft,
					right = box.offsetLeft + box.offsetWidth,
					top = box.offsetTop,
					bot = box.offsetTop + box.offsetHeight;
				refs.horizontal.push(left, right);
				refs.vertical.push(top, bot);
			}
			
		}
		refs.horizontal.sort();
		refs.vertical.sort();
		return refs;
		
		function isActive(el) {
			if (angular.element(el.firstChild).hasClass('tActive')||
				angular.element(el).hasClass('cActive')) {
				return true;
			} else {
				return false;
			}
		}
	}
	
	this.getRefLines = getRefLines;
	
	this.showRefLines = function(box, refs, $scope) {
		if (Misc.InList(box.offsetTop, refs.vertical)) {
			$scope.current.top = box.offsetTop;
			$scope.current.showTopLine = true;
			$timeout(function() {
				$scope.current.showTopLine = false;
			}, 1500);
		} else {
			$scope.current.showTopLine = false;
		}
		
		if (Misc.InList(box.offsetTop + box.offsetHeight, refs.vertical)) {
			$scope.current.bot = box.offsetTop + box.offsetHeight;
			$scope.current.showBotLine = true;
			$timeout(function() {
				$scope.current.showBotLine = false;
			}, 2000);
		} else {
			$scope.current.showBotLine = false;
		}
		
		if (Misc.InList(box.offsetLeft, refs.horizontal)) {
			$scope.current.left = box.offsetLeft;
			$scope.current.showLeftLine = true;
			$timeout(function() {
				$scope.current.showLeftLine = false;
			}, 1500);
		} else {
			$scope.current.showLeftLine = false;
		}
		
		if (Misc.InList(box.offsetLeft + box.offsetWidth, refs.horizontal)) {
			$scope.current.right = box.offsetLeft + box.offsetWidth;
			$scope.current.showRightLine = true;
			$timeout(function() {
				$scope.current.showRightLine = false;
			}, 1500);
		} else {
			$scope.current.showRightLine = false;
		}
	};
	this.updateOldThumb= function(DbId) {
		var usedCheck = document.getElementById('check' + DbId);
		var used = parseInt(usedCheck.innerHTML) - 1;
		usedCheck.innerHTML = used || ''; 
		if (!used) {
			usedCheck.style.display = 'none';
		}
	};
	
}]);

/*-----------------------------------------------------------*/
app.service('Misc', ['$q', function($q) {
	this.toHex = function(n) {
		return "0123456789ABCDEF".charAt((n-n%16)/16)
				+ "0123456789ABCDEF".charAt(n%16);
	};
	
	this.RGBtoHex = function(str) { 
		var rgb = str.substring(4, str.length-1)
         .replace(/ /g, '')
         .split(',');
		var result = '#';
 		for (var i = 0; i < rgb.length; i++) {
 			result = result + this.toHex(parseInt(rgb[i]));
 		}
		return result;
	};
	
	this.InList = function(el, list) {
		var result = false;
		for (i = 0; i < list.length; i++) {
			if (list[i] == el) {
				result = true;
				break;
			}
		}
		return result;
	};
	
	function inRect(mouse, rect) {
		return (
			(mouse.X > rect.left) &&
			(mouse.X < rect.right) &&
			(mouse.Y > rect.top) &&
			(mouse.Y < rect.bot)
		);
	};
	
	this.inRect = inRect;
	
	this.setCursor = function(mouse, zone, current) {
		if (inRect(mouse, zone.center)) {
			current.cursor = 'crosshair';
		}
		else if (inRect(mouse, zone.TL)) {
			current.cursor = 'nw-resize';
		}
		else if (inRect(mouse, zone.TR)) {
			current.cursor = 'ne-resize';
		}
		else if (inRect(mouse, zone.BR)) {
			current.cursor = 'se-resize';
		}
		else if (inRect(mouse, zone.BL)) {
			current.cursor = 'sw-resize';
		}
		else if (inRect(mouse, zone.T)) {
			current.cursor = 'n-resize';
		}
		else if (inRect(mouse, zone.R)) {
			current.cursor = 'e-resize';
		}
		else if (inRect(mouse, zone.B)) {
			current.cursor = 's-resize';
		}
		else if (inRect(mouse, zone.L)) {
			current.cursor = 'w-resize';
		}
		else {
			current.cursor = 'move';
		}
	};
	
	this.resetZone = function(zone, width, height) {
		var size = 10;
		zone.TL = {
			left: 0,
			right: size,
			bot: size,
			top: 0
		};

		zone.TR = {
			left: width - size,
			right: width,
			bot:  size,
			top: 0
		};

		zone.BR = {
			left: width -size,
			right: width,
			bot: height,
			top: height - size
		};

		zone.BL = {
			left: 0,
			right: size,
			bot: height,
			top: height - size
		};

		zone.T = {
			left: width / 2 - size / 2,
			right: width / 2  + size / 2,
			bot: size,
			top: 0
		};

		zone.L = {
			left: 0,
			right: size,
			bot: height / 2 + size / 2,
			top: height / 2 - size / 2
		};

		zone.R = {
			left: width - size,
			right: width,
			bot: height / 2 + size / 2,
			top: height / 2 - size / 2
		};

		zone.B = {
			left: width / 2 - size / 2,
			right: width / 2 + size / 2,
			bot: height,
			top: height - size
		};

		zone.center = {
			left: width / 2 - size,
			right: width / 2 + size,
			bot: height / 2 + size,
			top: height / 2 - size
		};
	};
	
	this.randomFromList = function(list) {
		var rand = Math.floor(Math.random()*list.length);
		return list[rand];
	};
	
	this.ancestorHasClass = function(el, num, cl) {
		var result = false,
			ancestor = el;
		for (i = 0; i < num; i++) {
			if (ancestor.hasClass(cl)) {
				result = true;
				break;
			} else { 
				ancestor = ancestor.parent();
			}
		}
		return result;
	};
	
	this.sortObjList = function(list, key) {
		function compare(a, b) {
			return a[key] -b[key];
		}
		list.sort(compare);
	}
	
	this.dataUrlToArrayBuffer = function(dataurl) {
		var matched = dataurl.match(new RegExp('data:(.*);base64,(.*)'));
		var binary = atob(matched[2]);
		var len = binary.length;
		var buffer = new ArrayBuffer(len);
		var view = new Uint8Array(buffer);
		for (var i = 0; i < len; i++) {
			view[i] = binary.charCodeAt(i);
		}
		return buffer;
	};
	
	this.getMaxProp = function (objList, prop) {
		var max = 0;
		objList.forEach(function(obj) {
			max = Math.max(max, parseInt(obj[prop])||0); //set prop to 0 if obj[prop] is undefined
		});
		return max;
	};
	
	this.abs2perCent = function(rect, pwidth, pheight, target) {
		var width = 100 * rect.width / pwidth;
		var height = 100 * rect.height / pheight;
		var left = 100 * rect.left / pwidth;
		var top = 100 * rect.top / pheight;

		if (!!target) {
			target.width = width;
			target.height = height;
			target.left = left;
			target.top = top;
		}
		else return {
			width: 100 * rect.width / pwidth,
			height: 100 * rect.height / pheight,
			left: 100 * rect.left / pwidth,
			top: 100 * rect.top / pheight
		};
	};
	
	
	this.perCent2Abs = function(rect, pwidth, pheight, target) {
		var width = Math.round(rect.width * pwidth / 100);
		var height = Math.round(rect.height * pheight / 100);
		var left = Math.round(rect.left * pwidth / 100);
		var top = Math.round(rect.top * pheight / 100);

		if (!!target) {
			target.width = width;
			target.height = height;
			target.left = left;
			target.top = top;
		}
		else return {
			width: Math.round(rect.width * pwidth / 100),
			height: Math.round(rect.height * pheight / 100),
			left: Math.round(rect.left * pwidth / 100),
			top: Math.round(rect.top * pheight / 100)
		};
	};

	var syncTask = function(tasks) { //a function to chain promises
		var deferred = $q.defer();
		if (tasks.length == 0) {
			deferred.resolve(null);
		} else if (tasks.length == 1) {
			$q.when(tasks[0]()).then(function() {
				deferred.resolve(null);
			});
		} else {
			var lastTask = tasks.pop();
			syncTask(tasks).then(function(){
				$q.when(lastTask()).then(function() {
					deferred.resolve(null)
				});
			});
		}
		return deferred.promise;
	};

	this.syncTask = syncTask;
}]);