app.controller('PreviewController', ['$scope', '$q', '$timeout', 'ImgService', 'drawService',
					function($scope, $q, $timeout, ImgService, drawService) {

	$timeout(function() {
		var maxHeight = Math.floor(0.9 * window.innerHeight);
		var maxWidth = Math.floor(0.9 * window.innerWidth);
		var prop = 0.5 * $scope.measure.pheight / $scope.measure.pwidth;
		var num = $scope.current.pageNum;
		if (prop < maxHeight / maxWidth) {
			previewWidth = maxWidth;
			previewHeight = Math.round(prop * previewWidth);
		} else {
			previewHeight = maxHeight;
			previewWidth = Math.round(previewHeight / prop);
		}
		$scope.previewHeight = previewHeight;
		$scope.previewWidth = previewWidth;
		document.addEventListener('keydown', handleKeyDown, true);
		$scope.viewPageNum = num;
		drawPage(num, $scope.album.content);
	});

	$scope.previewPage = function(num) {
		$scope.viewPageNum = num;
		drawPage(num, $scope.album.content);
	};

	function drawPage(num, content) {
		var pwidth, pheight;
		pwidth = $scope.previewWidth/2;
		pheight = $scope.previewHeight;

		document.getElementById('rightPreview').innerHTML = '';
		document.getElementById('leftPreview').innerHTML = '';
		if (num != 0) {
			var leftPage = angular.copy(content[num - 1]);
			var leftView = document.getElementById('leftPreview');
			showPage(leftPage, leftView, pwidth, pheight);
		}
		if (num != content.length) {
			var rightPage = angular.copy(content[num]);
			var rightView = document.getElementById('rightPreview');
			showPage(rightPage, rightView, pwidth, pheight);
		}

		function showPage(page, view, pwidth, pheight) {
			$timeout(function() {
				view.style.width = pwidth + 'px';
				view.style.height = pheight + 'px';
				view.style.backgroundColor = page.background || '#FFFFFF';
				view.style.backgroundImage = 'url("' + page.patternURL + '")';
				view.style.backgroundSize = page.patternSize;
			});

			page.frames.forEach( function(frame) {
				drawFrame(frame);
			});
			page.textBoxes.forEach(function(textBox) {
				drawText(textBox);
			});

			function drawFrame(frame) {
				if (!!frame.image.src) {
					var canvas = document.createElement('canvas'),
						display = angular.copy(frame.display),
						img = new Image();
					canvas.width = frame.canvas.width * pwidth / 100;
					canvas.height = frame.canvas.height * pheight / 100;
					canvas.style.top = Math.ceil(frame.canvas.top * pheight / 100) + 'px';
					canvas.style.left = Math.ceil(frame.canvas.left * pwidth / 100) + 'px';
					canvas.style.position = 'absolute';
					canvas.style.zIndex = frame.layer;
					canvas.style.transform = 'rotate(' + frame.angle + 'deg)';
					if (frame.border.thickness && frame.border.color) {
						var thickness = frame.border.thickness * pwidth/ $scope.measure.pwidth;
						canvas.style.outline = thickness + 'px solid ' + frame.border.color;
					}
					display.dw = canvas.width;
					display.dh = canvas.height;
					img.onload = function() {
						ImgService.drawImage(canvas, img, display);
					};
					img.src = frame.image.src;
					view.appendChild(canvas);
				}
			}

			function drawText(textBox) {
				if (!!textBox.text) {
					var div = document.createElement('div');
					var innerHTML = textBox.text.replace(/\n\r?/g, '<br />');
					div.innerHTML =  innerHTML || null;
					div.style.whiteSpace = 'pre-wrap';
					div.style.width = textBox.box.width * pwidth / 100 + 'px';
					div.style.height = textBox.box.height * pheight / 100 + 'px';
					div.style.top = (textBox.box.top * pheight / 100 + 2 * pheight/$scope.measure.pheight) + 'px';
					div.style.left = textBox.box.left * pwidth / 100 + 'px';
					div.style.fontSize = textBox.font.size * pwidth/$scope.measure.pdfWidth + 'px';
					div.style.fontStyle = textBox.font.style;
					div.style.fontFamily = textBox.font.family;
					div.style.color = textBox.font.color;
					div.style.fontWeight = textBox.font.weight;
					div.style.textAlign = textBox.align;
					div.style.lineHeight = textBox.lineHeight || 1.2;
					div.style.position = 'absolute';
					div.style.zIndex = textBox.layer;
					div.style.transform = 'rotate(' + textBox.angle + 'deg)';
					view.appendChild(div);
				}
			}
		
		}
	}

	function handleKeyDown(event) {
		var content = $scope.album.content;
		var viewPageNum = $scope.viewPageNum;
		switch (event.keyCode){
			case 39:
				event.preventDefault();
				if (viewPageNum != content.length) {
						$scope.previewPage(viewPageNum + 2, content);
				}
				break;
			case 37:
				event.preventDefault();
				if (viewPageNum != 0) {
					$scope.previewPage(viewPageNum - 2, content);
				}
				break;
		}
	}

	var dataUrlToBlob = function(dataurl) {
		var matched = dataurl.match(new RegExp('data:(.*);base64,(.*)'));
		var binary = atob(matched[2]);
		var len = binary.length;
		var buffer = new ArrayBuffer(len);
		var view = new Uint8Array(buffer);
		for (var i = 0; i < len; i++) {
			view[i] = binary.charCodeAt(i);
		}
		var blob = new Blob( [view], { type: matched[1] });
		return blob;
	};

	$scope.toJPEG = function(pageNum) {
		var content = $scope.album.content;
		if (pageNum == 0) {
			var canvas = document.createElement('canvas');
			drawService.drawPage(content[0], canvas, $scope)
			.then(function() {
				var image = canvas.toDataURL('image/jpeg');
				var blob = dataUrlToBlob(image);
				outputImage(blob, pageNum + 1);
			});
		} else if (pageNum == content.length) {
			var canvas = document.createElement('canvas');
			drawService.drawPage(content[content.length-1], canvas, $scope)
			.then(function() {
				var image = canvas.toDataURL('image/jpeg');
				var blob = dataUrlToBlob(image);
				outputImage(blob, pageNum);
			});
		} else {
			var canvas1 = document.createElement('canvas'),
				canvas2 = document.createElement('canvas');

			drawService.drawPage(content[pageNum-1], canvas1, $scope)
			.then(function() {
				drawService.drawPage(content[pageNum], canvas2, $scope)
				.then(function() {
					var canvas = document.createElement('canvas'),
						ctx = canvas.getContext('2d');
					canvas.width = 2 * canvas1.width;
					canvas.height = canvas1.height;
					ctx.drawImage(canvas1, 0, 0);
					ctx.drawImage(canvas2, canvas1.width, 0);
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(canvas1.width, 0);
					ctx.lineTo(canvas1.width, canvas1.height);
					ctx.strokeStyle = '#CCC';
					ctx.stroke();
					ctx.restore();
					var image = canvas.toDataURL('image/jpeg');
					var blob = dataUrlToBlob(image);
					outputImage(blob, pageNum + '-' + (pageNum + 1));
				});
			});

		}
		function outputImage(image, pageNum) {
 			saveAs(image, $scope.album.title + '_p' + pageNum + '.jpg');
		}
	};
}]);
