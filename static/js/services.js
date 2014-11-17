app.factory('FrameObject', function() {
	return function(canvas, image, display) {
		this.canvas = canvas || {};
		this.image = image || {};
		this.display = display || {};
	};
})

	.factory('PageObject', function() {
	return function(frames, textBoxes,background) { 
		this.frames = frames || []; //list of FrameObject
		this.textBoxes = textBoxes || []; //list of textBoxOject
		this.background = background || undefined;
	};
})
	
	.factory('Layouts', function() {
	var layouts = {};
	layouts.x2 = [
		{
			frames:
				[
					{left: 10, top: 10, height: 35, width: 80},
					{left: 10, top: 50, height: 40, width: 80}
				],
			boxes: []
		},
		{
			frames: 
				[
					{left: 20, top: 10, width: 70, height: 50},
					{left: 20, top: 65, width: 70, height: 30}
				],
			boxes: []
		}
	];
	
	
	return layouts;
})
	
	.factory('TextBoxObject', function() {
		return function(box) {
			this.box = box;
			this.text = '';
			this.font = {
				style: 'normal',
				family: 'UVNTinTuc_R',
				weight: 'normal',
				color: '#000000',
				size: '8px'
			};
			this.align = 'left';
		};
})

	.factory('Fonts', function() {
	return [
		'UVNTinTuc_R',
		'UVNKyThuat',
		'Calligraffiti',
		'UVNDoiMoi',
		'UVNKeChuyen3'
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
	this.initTextArea = function(textArea, textBox, $scope) {
		textArea.style.height = (textBox.box.height * $scope.pheight/100) + "px";
		textArea.style.width = (textBox.box.width * $scope.pwidth/100) + "px";
		textArea.style.top = (textBox.box.top * $scope.pheight/100) + "px";
		textArea.style.left = (textBox.box.left * $scope.pwidth/100) + "px";
		textArea.style.color = textBox.font.color;
		textArea.style.fontFamily = textBox.font.family;
		textArea.style.fontWeight = textBox.font.weight;
		textArea.style.fontStyle = textBox.font.style;
		textArea.style.fontSize = textBox.font.size;
		textArea.style.textAlign = textBox.align;
		if (textBox.text) {
			textArea.style.border =  '1px solid transparent';
		}
		else {
			textArea.style.border =  '1px solid #CEECF5	';
		}
		textArea.style.resize = 'none';
	};
});


/*--------------------------------------------------------*/
app.service('DBServices', ['$q',  function($q) {
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
						date: cursor.value.date
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
	
	
	this.updateAlbumDB = function(content, id, title, description, date) {
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
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
				
				var updateRq = store.put(album);
				updateRq.onsuccess = function(event){
				};
				updateRq.onerror = function(event){
					console.log('update failed');
				};
			};
			getRq.onerror = function(event) {
				console.log('access failed');
			};
		};
		openRq.onerror = function(event) {
			console.log('error in open DB for update');
		};
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

app.service('ImgService', function() {
	this.loadImages = function(id) {
		var openRq = window.indexedDB.open('ImagesDB', 1);
		openRq.onsuccess = function() {
			var db = openRq.result,
				trans = db.transaction(['Images']),
				store = trans.objectStore('Images'),
				index = store.index('inAlbum'),
				keyRange = IDBKeyRange.only(id),
				openCursor = index.openCursor(keyRange);
			openCursor.onsuccess = function(event) {
				var output = document.getElementById('output'),
					cursor = event.target.result;
				if (cursor) {
					var img = document.createElement('img');
					img.src = cursor.value.minSrc,
					img.draggable = 'true';
					img.setAttribute('class','thumb');
					img.setAttribute(
						'ondragstart',
						'angular.element(this).scope().dragImage(event)'
					);
					img.setAttribute('mWidth', cursor.value.mWidth);
					img.setAttribute('mHeight',cursor.value.mHeight);
					img.setAttribute('DbId', cursor.value.id);
					img.setAttribute('onmouseover', 'angular.element(this).scope().mouseOver(event)');
					img.setAttribute('onmouseleave', 'angular.element(this).scope().mouseLeave(event)');
					img.setAttribute('title', 'drag and drop on a frame in album'); 
					var div = document.createElement('div');
					div.setAttribute('class', 'thumb');
					div.appendChild(img);
					output.appendChild(div);
					cursor.continue();
				}
			};
			openCursor.onerror = function(event) {
				console.log('openCursor error');
			};
		};
	};
	
	function drawImage(canvas, img, display) {
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, display.sx, display.sy, display.sw, display.sh,
							display.dx, display.dy, display.dw, display.dh);
		canvas.style.border = 'none';
	};
	
	this.drawImage = drawImage;
	
	this.resetFrame  = function(canvas) {
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#EFEFEF';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#777';
		ctx.fillText('Drop an image here', 5, 20);
		canvas.style.border = '1px solid #CCC';
	};
	
	this.delCanvas = function(el, $scope) {
		$scope.current[el.parentNode.parentNode.id].frames.splice($scope.$index,1);
	};
	
	this.zoomImage = function(canvas, scope, para) {
		var rate = 1.1,
		img = scope.img,
		image = scope.frame.image,
		display = scope.frame.display;
		
		if (para == 'out') {
			zoom(1/rate);
		}
		if (para == 'in') {
			zoom(rate);
		}
		
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
			display.sw = Math.min(display.sw * realRate, image.mWidth - display.sx);
			display.sh = Math.min(display.sh * realRate, image.mHeight - display.sy);
			image.scaleRatio = realRate * image.scaleRatio; //update scale
			
			drawImage(canvas, img, display);
		};
	};

	this.moveImage = function(canvas, scope, para) {
		var offset = 10,
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
		drawImage(canvas, img, display);
	};
});

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
	
});

