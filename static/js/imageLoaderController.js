app.controller('ImageLoaderController', 
    ['$scope', '$timeout', 'ImgService', '$q', '$element', 'gettextCatalog',
					function($scope, $timeout, ImgService, $q, $element, gettextCatalog) {
	ImgService.loadImages($scope.current.albumId);
	
	$scope.handleFileSelect = function(evt) {
		var files = evt.target.files;
		$timeout(function() {
			$scope.loading = true;
		});
		
		function readFile(file) {
			var deferred = $q.defer();
			if (file.type.match(/image.*/)){
				var msg = gettextCatalog.getString('loading file...');
				$timeout(function() {
					$scope.fileProcess = msg + file.name; 
				});
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

		var i = 0;
		putNextFile();
		
		function putNextFile() {
			readFile(files[i]).then(function(result) {
				if (!!result) {
					processImage(result);
				}
				else {
					i++;
					putNextFile();
				}
			});
 		}
		
		function processImage(imgURL) {
			resizeImg(imgURL)
				.then(function(result) {
					updateImg(result)
					.then(function(result) {
						showThumbnail(result);
					})
				});
		}
		
		function resizeImg(imgURL) {
			var deferred = $q.defer();
			var imgObj = new Image();
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var orientation = 1;
			var ratio;
			imgObj.onload = function() {
				EXIF.getData(imgObj, function() {
					orientation = EXIF.getTag(imgObj, 'Orientation')||1;
					console.log(orientation);
					switch (orientation) {
						case 3:
							canvas.width = 400;
							canvas.height = canvas.width * imgObj.height / imgObj.width;
							ctx.translate(canvas.width/2, canvas.height/2);
							ctx.rotate(Math.PI);
							ctx.drawImage(imgObj, 
										-canvas.width/2, -canvas.height/2,
										canvas.width, canvas.height);
							ratio = imgObj.width / canvas.width;
							break;
							
						case 6:
							canvas.height = 400;
							canvas.width = canvas.height * imgObj.height / imgObj.width;
							ctx.translate(canvas.width/2, canvas.height/2);
							ctx.rotate(Math.PI / 2);
							ctx.drawImage(imgObj, 
										-canvas.height/2, -canvas.width/2, 
										canvas.height, canvas.width);
							ratio = imgObj.height / canvas.width;
							break;
							
						case 8:
							canvas.height = 400;
							canvas.width = canvas.height * imgObj.height / imgObj.width;
							ctx.translate(canvas.width/2, canvas.height/2);
							ctx.rotate(-Math.PI / 2);
							ctx.drawImage(imgObj, 
										-canvas.height/2, -canvas.width/2, 
										canvas.height, canvas.width);
							ratio = imgObj.height / canvas.width;
							break;
						
						default:
							canvas.width = 400;
							canvas.height = canvas.width * imgObj.height / imgObj.width;
							ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
							ratio = imgObj.width / canvas.width;
							break;
					}
				});
				var result = {
					src: imgURL,
					minSrc: canvas.toDataURL(),
					mHeight: canvas.height,
					mWidth: canvas.width,
					rWidth: imgObj.width,
					rHeight: imgObj.height,
					orientation: orientation,
					ratio: ratio
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
			ImgService.showThumbnail(result[0], result[1]);
			i++;
			if (i < files.length) {
				putNextFile();
			}
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
		bigImg.style.bottom =  (document.body.offsetHeight - mouseY + 50) + 'px';
		bigImg.style.left = (mouseX - 100) + 'px';
		bigImg.style.display = 'block';
	};
	
	$scope.mouseLeave = function(event) {
		$scope.bigImg.style.display = 'none';
	};
}]);





