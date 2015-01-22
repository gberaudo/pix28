app.factory('FrameObject', function() {
	return function(data) {
		this.canvas = data.canvas;
		this.image = data.image || {};
		this.display = data.display || {};
		this.angle = data.angle || 0;
		this.border = data.border || {};
		this.layer = data.layer || 10;
	};
})

	.factory('PageObject', function() {
	return function(data) { 
		this.frames = data.frames || []; //list of FrameObject
		this.textBoxes = data.textBoxes || []; //list of textBoxOject
		this.background = data.background || '';
	};
})
	
	.factory('TextBoxObject', function() {
		return function(data) {
			this.box = data.box;
			this.text = '';
			this.font = {
				family: data.font.family || 'UVNTinTuc_R',
				size: data.font.size || 24,
				color: data.font.color || '#000000'
			};
			this.align = data.align || 'left';
			this.angle = data.angle || 0;
			this.layer = data.layer || 15;
		};
})

	.factory('Fonts', function() {
	return [
		'UVNTinTuc_R',
		'UVNKyThuat',
		'Calligraffiti',
		'UVNDoiMoi',
		'UVNKeChuyen3',
		'ArDaughter',
		'Belligerent',
		'Drawvetica',
		'Ubuntu_B',
		'Ubuntu_BI',
		'Ubuntu_L',
		'Ubuntu_LI',
		'Ubuntu_R',
		'Ubuntu_C',
		'Komtxt',
		'Komtxtb',
		'Komtxtbi',
		'Komtxti',
		'Komtxtk',
		'Komtxtkb',
		'SpecialElite',
		'WCSoldOutB',
		'Floralia'
	];
})


	.factory('Colors', function(){
	return  [
		'#000000', '#2A0A29', '#0A1B2A', '#0A2A1B',
		'#29220A', '#610B0B', '#5F4C0B', '#38610B',
		'#DF0101', '#DF7401', '#74DF00', '#01DFA5',
		'#0174DF', '#3A01DF', '#DF01D7', '#00FF80',
		'#0040FF', '#8000FF', '#FF0080', '#848484',
		'#D8D8D8', '#F781F3', '#819FF7', '#BEF781',
		'#F5DA81', '#FBEFF8', '#EFF5FB', '#FBEFEF',
		'#A4A4A4', '#BDBDBD'
	];
});
	
/*------------------------------------------------------*/

app.service('Init', function() {
	this.initTextArea = function(div, textArea, textBox, $scope) {
		div.style.height = textArea.style.height = Math.floor(textBox.box.height * $scope.pheight/100) + "px";
		div.style.width = textArea.style.width = Math.floor(textBox.box.width * $scope.pwidth/100) + "px";
		div.style.top = Math.floor(textBox.box.top * $scope.pheight/100) + "px";
		div.style.left = Math.floor(textBox.box.left * $scope.pwidth/100) + "px";
		textBox.layer = textBox.layer || 15;
		div.style.zIndex = textBox.layer;
		textArea.style.color = textBox.font.color;
		textArea.style.fontFamily = textBox.font.family;
// 		textArea.style.fontWeight = textBox.font.weight;
// 		textArea.style.fontStyle = textBox.font.style;
		var size = textBox.font.size || 24;
		console.log('size', size);
		console.log('layer', textBox.layer);
		textArea.style.fontSize = (size * $scope.pwidth/$scope.pdfWidth) + 'px';
		textArea.style.textAlign = textBox.align;
		if (!!textBox.angle) {
			textArea.parentNode.style.transform = 'rotate(' + textBox.angle + 'deg)';
		} else {
			textBox.angle = 0;
		}
		
		if (textBox.text) {
			div.style.outline = '0';
		} else {
			div.style.outline = '#CEECF5 solid 1px';
		}
		textArea.style.resize = 'none';
	};
});


/*--------------------------------------------------------*/
app.service('DBServices', ['$q','$timeout',  function($q, $timeout) {
	this.initAlbumDB = function(scope) {
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
		openRq.onsuccess = function(event) {
			var db = openRq.result,
				trans = db.transaction(['Albums']),
				store = trans.objectStore('Albums');
			scope.albumSCs = [];
			store.openCursor().onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					var albumSC = {
						id: cursor.value.id, 
						description: cursor.value.description,
						title: cursor.value.title,
						date: cursor.value.date,
						width: cursor.value.width || undefined,
						height: cursor.value.height || undefined
					};
					scope.albumSCs.push(albumSC);
					cursor.continue();
				}
			};
			trans.oncomplete = function() {
				if (scope.albumSCs.length > 0) {
					scope.$apply( function() {
						scope.showAlbums = true;
					});
				}
				scope.$apply(function() {
					scope.newAlbum = true;
				});
			};
		};

		openRq.onerror = function(event) {
			console.log('open DB error');
		};

		openRq.onupgradeneeded = function(event) {
			console.log('upgrade needed');
			var albumStore = event.currentTarget.result.createObjectStore(
				'Albums',
				{ keyPath: "id", autoIncrement: true }
			);
		};
	};
	
	
	this.initImageDB = function() {
		var openRq = window.indexedDB.open('ImagesDB',1);
		openRq.onsuccess = function() {
			console.log('init imagesDB');
		};
		openRq.onerror = function() {
			console.log('open imageDB failed');
		};
		openRq.onupgradeneeded = function(event) {
			console.log('ImagesDB, upgrade needed');
			var imageStore = event.currentTarget.result.createObjectStore(
				'Images',
				{keyPath: 'id', autoIncrement: true}
			);
			imageStore.createIndex('inAlbum', 'inAlbum', {unique: false});
		};
	};
	
	
	this.updateAlbumDB = function(content, id, title, description, date, width, height) {
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
		var deferred = $q.defer();
		openRq.onsuccess = function(event) {
			var db = openRq.result;
			var trans = db.transaction(['Albums'], 'readwrite');
			var store = trans.objectStore('Albums');
			var getRq = store.get(id); 
			getRq.onsuccess = function(event) {
				var album = this.result;
				album.content = content;
				album.title = title;
				album.description = description;
				album.date = date;
				album.width = width;
				album.height = height;
				
				var updateRq = store.put(album);
				updateRq.onsuccess = function(event){
					var el = document.getElementById('updateMsg');
					el.innerHTML = 'Album saved.';
					$timeout(function() {
						el.innerHTML = '';
					},2000);
					deferred.resolve();
				};
				updateRq.onerror = function(event){
					deferred.reject();
					console.log('update failed');
				};
			};
			getRq.onerror = function(event) {
				deferred.reject();
				console.log('access failed');
			};
		};
		openRq.onerror = function(event) {
			deferred.reject();
			console.log('error in open DB for update');
		};
		return deferred.promise;
	};
	
	this.addAlbum = function() {
		//add this new album to the database 
		var deferred = $q.defer();
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
		openRq.onsuccess = function(event) {
			console.log('opening DB for creating album');
			var db = openRq.result;
			var trans = db.transaction(['Albums'], 'readwrite');
			var albumStore = trans.objectStore('Albums');
			var addAlbumRq = albumStore.add({content: []});
			addAlbumRq.onsuccess = function() {
				deferred.resolve(addAlbumRq.result);
			};
			addAlbumRq.onerror = function() {
				console.log('Cannot add this new album to the database');
			};
		};
		openRq.onerror = function(event) {
			console.log('error in open DB for creating album');
		};
		return deferred.promise;
	};
}]);

/*---------------------------------------------------------*/

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
	
	this.drawPage = function(page, canvas, scope) {
		var ctx = canvas.getContext('2d');
		var deferred = $q.defer();
		if (scope.pwidth > scope.pheight) {
			canvas.width = 800;
			canvas.height = canvas.width * scope.pheight/scope.pwidth;
		} else {
			canvas.height = 800;
			canvas.width = canvas.height * scope.pwidth/scope.pheight;
		}
		ctx.fillStyle = page.background || '#FFFFFF';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		function drawPattern() {
			var deferred1 = $q.defer();
			if (!!page.patternURL) {
				var tempCanvas = document.createElement('canvas');
				tempCtx = tempCanvas.getContext('2d');
				var img = new Image();
				var patternSize = parseFloat(page.patternSize) * canvas.width /100; 
				img.src = page.patternURL;
				img.onload = function() {
					tempCanvas.width = patternSize;
					tempCanvas.height = img.naturalHeight/img.naturalWidth * patternSize;
					tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
					var patImg = new Image();
					patImg.src = tempCanvas.toDataURL();
					patImg.onload = function() {
						var pat = ctx.createPattern(patImg,"repeat");
						ctx.rect(0,0,canvas.width, canvas.height);
						ctx.fillStyle = pat;
						ctx.fill();
						deferred1.resolve(null);
					};
				};
			} else {
				deferred1.resolve(null);
			}
			return deferred1.promise;
		}
		
		drawPattern().then(function() {
			drawObjects() ;
		});
		
		function drawObjects() {
			var objList = angular.copy(page.frames);
			objList = objList.concat(angular.copy(page.textBoxes));
			Misc.sortObjList(objList, 'layer');	
			if (objList.length > 0) {
				var n = 0;
				
				function drawNext() {
					var obj = objList[n];
					
					function checkEnd(m) {
						if (m < objList.length) {
							drawNext();
						} else {
							drawWatermark();
							deferred.resolve(null);
						}
					}
					n++;
					if ('text' in obj) {
						drawText(obj);
						checkEnd(n);
					} else if ('image' in obj) {
						drawImage(obj).then(function() {
							checkEnd(n);
						});
					} else {
						checkEnd(n);
					}
				}
				drawNext();
			} else {
				drawWatermark();
				deferred.resolve(null);
			}
			
		}
		
		return deferred.promise;
		
		function drawImage(frame) {
			var deferred2 = $q.defer();
			if (!!frame.image.src) {
				var img = new Image();
				var display = frame.display;
				var top = frame.canvas.top * canvas.height / 100,
					left = frame.canvas.left * canvas.width / 100,
					width = frame.canvas.width * canvas.width / 100,
					height = frame.canvas.height * canvas.height /100;
				var centerX = left + width / 2,
						centerY = top + height / 2;
				
				
				img.onload = function() {
					ctx.save();
					ctx.translate(centerX, centerY);
					ctx.rotate(frame.angle * Math.PI / 180);
					if (frame.border.thickness && frame.border.color) {
						var thickness = frame.border.thickness * canvas.width / scope.pwidth;
						ctx.lineWidth = thickness;
						ctx.strokeStyle = frame.border.color;
						ctx.strokeRect(-(width + thickness)/2, -(height + thickness) / 2,
							width + thickness, height + thickness);
					}
					ctx.drawImage(img, display.sx, display.sy, display.sw, display.sh,
									-width/2, -height/2, width, height);
					ctx.restore();
					deferred2.resolve(null);
				};
				img.src = frame.image.src;
				
			} 
			else {
				deferred2.resolve(null);
			}
			return deferred2.promise;
		}
	
		function drawText(textBox) {
			if (!!textBox.text) {
				var left = textBox.box.left * canvas.width / 100,
					top = textBox.box.top * canvas.height / 100,
					width = textBox.box.width * canvas.width / 100, 
					height = textBox.box.height * canvas.height / 100;
					
				var fontSize = textBox.font.size * canvas.width / scope.pdfWidth,
					color = textBox.font.color,
					fontName = textBox.font.family,
					lineHeight = 1.2 * fontSize;
				ctx.save();
				
				var centerX = left + width / 2,
					centerY = top + height / 2;
				
				ctx.translate(centerX, centerY);
				ctx.rotate(textBox.angle * Math.PI / 180);
				ctx.translate(-width/2, -height/2);
				ctx.font = fontSize + 'px ' + fontName;
				ctx.fillStyle = color;
				wrapText(ctx, textBox.text, 0, 1.2 * fontSize,
							width, lineHeight, textBox.align);
				ctx.restore();
			}
			
			
			function wrapText(context, text, x, y, maxWidth, lineHeight) {
				var paragraphs = text.split('\n');
				for (var j = 0; j< paragraphs.length; j++) {
					var paragraph = paragraphs[j];
					
					var words = paragraph.split(' ');
					var line = '';
					var lineWidth;
					
					for(var n = 0; n < words.length; n++) {
						var testLine = line + ' ' + words[n];
						var metrics = context.measureText(testLine);
						var testWidth = metrics.width;
						
						if (testWidth > maxWidth && n > 0) {
							lineWidth = context.measureText(line).width;
							fillTextAlign(line, lineWidth, x, y, textBox.align);
							line = words[n];
							y += lineHeight;
						}
						else {
							line = testLine;
						}
					}
					lineWidth = context.measureText(line).width;
					fillTextAlign(line, lineWidth, x, y, textBox.align);
					y += lineHeight;
				}
				
				function fillTextAlign(line, lineWidth, x, y, align) {
					var startX;
					switch (align) {
						case 'right':
							startX = maxWidth - lineWidth;
							break;
						case 'left':
							startX = x;
							break;
						case 'center':
							startX = (maxWidth - lineWidth) / 2;
							break;
					}
					context.fillText(line, startX, y);
				}
			}
		}
		
		function drawWatermark() {
			ctx.save();
			ctx.globalAlpha=.20;
			ctx.translate(50, 100);
			ctx.rotate(-Math.PI / 6);
			ctx.font = '40px Times';
			ctx.fillStyle = '#FFFFFF';
			ctx.fillText('LibreAlbum', 30, 50);
			ctx.fillStyle = '#000000';
			ctx.fillText('LibreAlbum', 33, 53);
			ctx.restore();
		};
		
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
app.service('Misc', function() {
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
});

