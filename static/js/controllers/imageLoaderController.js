app.controller('ImageLoaderController', 
    ['$scope', '$timeout', 'ImgService', '$q', '$element', 'gettextCatalog', 'Misc',
					function($scope, $timeout, ImgService, $q, $element, gettextCatalog, Misc) {
	var usedMap = getUsedMap();
	function getUsedMap() {
		var result = {};
		var content = $scope.album.content;
		for (var j = 0; j < content.length; j++) {
			var page = content[j];
			for (var i = 0; i < page.frames.length; i++) {
				var frame = page.frames[i];
				if (!!frame.image.DbId) {
					var DbId = frame.image.DbId;
					if (DbId in result) {
						result[DbId]++;
					} else {
						result[DbId] = 1;
					}
				}
			}
		}
		return result;
	}
	
	ImgService.loadImages($scope.current.albumId, usedMap);
	
	
	$scope.handleFileSelect = function(evt) {
		var files = evt.target.files || evt.dataTransfer.files;
		var tasks = [];
		evt.preventDefault();
		$scope.loadingImg = true;
		
		for (var i = 0; i < files.length; i++) {
			var task = {
				function: handleFile,
				args: [files[i]]
			}
			tasks.push(task);
		}
		
		Misc.syncTask(tasks).then(function(){
			$scope.loadingImg = false;
		});
		
		function readFile(file) {
			var deferred = $q.defer();
			if (file.type.match(/image.*/)){
				var reader = new FileReader();
				reader.onload = function(e) {
					deferred.resolve(e.target.result);
				};
				reader.readAsDataURL(file);
			} else {
				deferred.resolve(null);
			}
			return deferred.promise;
		};

		function handleFile(file) {
			var deferred = $q.defer();
			readFile(file).then(function(dataURL) {
				if (!!dataURL) {
					resizeImg(dataURL).then(function(result) {
						updateImg(result).then(function(result) {
							showThumbnail(result);
							deferred.resolve(null);
						});
					});
				}
				else deferred.resolve(null);
			});
			return deferred.promise;
		}
		

		function resizeImg(imgURL) {
			var deferred = $q.defer();
			var imgObj = new Image();
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var orientation = 1;
			var ratio, rWidth, rHeight;
			imgObj.onload = function() {
				EXIF.getData(imgObj, function() {
					orientation = EXIF.getTag(imgObj, 'Orientation')||1;
					console.log(orientation);
					switch (orientation) {
						case 3:
							canvas.width = 800;
							canvas.height = canvas.width * imgObj.height / imgObj.width;
							ctx.translate(canvas.width/2, canvas.height/2);
							ctx.rotate(Math.PI);
							ctx.drawImage(imgObj, 
										-canvas.width/2, -canvas.height/2,
										canvas.width, canvas.height);
							rWidth = imgObj.width;
							rHeight = imgObj.height;
							break;
							
						case 6:
							canvas.height = 800;
							canvas.width = canvas.height * imgObj.height / imgObj.width;
							ctx.translate(canvas.width/2, canvas.height/2);
							ctx.rotate(Math.PI / 2);
							ctx.drawImage(imgObj, 
										-canvas.height/2, -canvas.width/2, 
										canvas.height, canvas.width);
							rHeight = imgObj.width;
							rWidth = imgObj.height;
							break;
							
						case 8:
							canvas.height = 400;
							canvas.width = canvas.height * imgObj.height / imgObj.width;
							ctx.translate(canvas.width/2, canvas.height/2);
							ctx.rotate(-Math.PI / 2);
							ctx.drawImage(imgObj, 
										-canvas.height/2, -canvas.width/2, 
										canvas.height, canvas.width);
							rHeight = imgObj.width;
							rWidth = imgObj.height;
							break;
						
						default:
							canvas.width = 800;
							canvas.height = canvas.width * imgObj.height / imgObj.width;
							ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
							rWidth = imgObj.width;
							rHeight = imgObj.height;
							break;
					}
				});
				var result = {
					src: imgURL,
					minSrc: canvas.toDataURL('image/jpeg'),
					mHeight: canvas.height,
					mWidth: canvas.width,
					rWidth: rWidth,
					rHeight: rHeight,
					orientation: orientation,
					ratio: rWidth/canvas.width,
					used: 0
				};
				deferred.resolve(result);
			};
			imgObj.src = imgURL;
			return deferred.promise;
		}
	
		
		function updateImg(item) {
			var deferred = $q.defer();
			var openRq = window.indexedDB.open('ImagesDB', 1);
			openRq.onsuccess = function() {
				var db = openRq.result;
				var trans = db.transaction(['Images'], 'readwrite');
				var imgStore = trans.objectStore('Images');
				item.inAlbum = $scope.current.albumId;
				var addRq = imgStore.put(item);
				
				addRq.onsuccess = function() {
					deferred.resolve([item, addRq.result]);
				};
				addRq.onerror = function() {
					console.log('add image failed');
					deferred.reject();
				};
			};
			openRq.onerror = function() {
				console.log('error in opening ImgDB');
				deferred.reject();
			};
			return deferred.promise;
		};
		
		function showThumbnail(result) {
			ImgService.showThumbnail(result[0], result[1], true);
		};
	};
	
	
	$scope.dragImage = function(ev) {
		ev.dataTransfer.setData('URL', ev.target.src);
		ev.dataTransfer.setData(
			'mHeight', ev.target.getAttribute('mHeight')
		);
		ev.dataTransfer.setData(
			'mWidth', ev.target.getAttribute('mWidth')
		);
		ev.dataTransfer.setData('ratio', ev.target.getAttribute('ratio'));
		ev.dataTransfer.setData('DbId', ev.target.getAttribute('DbId'));
		ev.dataTransfer.setData('name', 'image');
		
	};
	
	$scope.bigImg = document.createElement('img');
	$scope.bigImg.setAttribute('class', 'bigImg');
	document.body.appendChild($scope.bigImg);

	$scope.mouseOver = function(event) {
		var bigImg = $scope.bigImg;
		bigImg.src = event.target.src;
		var mouseX = event.pageX,
			mouseY = event.pageY;
		bigImg.style.bottom =  (document.body.offsetHeight - mouseY + 10) + 'px';
		bigImg.style.left = (mouseX - 100) + 'px';
		bigImg.style.display = 'block';
	};
	
	$scope.mouseLeave = function(event) {
		$scope.bigImg.style.display = 'none';
	};
	
	$scope.thumbOnFocus = function(event) {
		var id = event.target.getAttribute('DbId');
		var usedCheck = document.getElementById('check' + id);
		if (!usedCheck.innerHTML) {
			var delImage = document.getElementById('image_' + id);
			delImage.style.display = 'inline-block';
			angular.element(delImage).addClass('respond link');
			document.addEventListener('mousedown', handleThumbMouseDown, true);
		}
		$scope.imageId = id;
	};
	

	function handleThumbMouseDown(event) {
		var delImage = event.target.parentNode;
		if (angular.element(delImage).hasClass('delImage')) {
			var DbId = parseInt(event.target.getAttribute('DbId'));
			function removeDBImage(DbId) {
				console.log('removing');
				var openRq = window.indexedDB.open('ImagesDB');
				openRq.onsuccess = function(event) {
					var db = event.target.result;
					var store = db.transaction(['Images'], 'readwrite')
										.objectStore('Images');
										
					var rq = store.delete(DbId);
					rq.onsuccess = function() {
						console.log('remove');
						delImage.parentNode.style.display = 'none';
					};
				};
			}
			removeDBImage(DbId);
			document.removeEventListener('mousedown',  handleThumbMouseDown, true);
		} else {
			var delImage = document.getElementById('image_' + $scope.imageId);
			delImage.style.display = 'none';
			document.removeEventListener('mousedown',  handleThumbMouseDown, true);
		}
	}
}]);





