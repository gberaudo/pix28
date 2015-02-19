

app.controller('LayoutController', 
    ['$scope', 'FrameObject', 'Layouts', 'Colors', 'Misc', '$q', '$http',
    function($scope, FrameObject, Layouts, Colors, Misc, $q, $http) {
	$scope.colors = Colors;
	
	initPatterns();
	
	function initPatterns() {
		var userPatterns = getUserPatterns();
		function getUserPatterns() {
			//open DB
		}
		
		var patternNames = ['polka', 'night-sky', 'buggi-hearts', 
			'carreau-blue', 'carreau-red'];
		var patterns = [];
		var promises = [];
		for (i = 0; i < patternNames.length; i++) {
			function addPattern(i) {
				var deferred = $q.defer();
				var patternURL72 = 'static/patterns/' + patternNames[i] + '_72.png';
				var patternURL300 = 'static/patterns/' + patternNames[i] + '_300.png';
				var pattern = {};
				
				//convert pattern png file to dataURL
				$http.get(patternURL300, {responseType: "blob"})
				.success(function(blob) {
					var reader = new FileReader();
					reader.onload = function(evt) {
						pattern.URL300 = evt.target.result;
						$http.get(patternURL72, {responseType: "blob"})
						.success(function(blob) {
							var reader = new FileReader();
							reader.onload = function(evt) {
								pattern.URL72 = evt.target.result;
								var img = new Image();
								img.onload = function() {
									var width = img.naturalWidth;
									var height = img.naturalHeight;
									pattern.name = patternNames[i];
									pattern.width = width;
									pattern.height = height;
									patterns.push(pattern);
									deferred.resolve(null);
								};
								img.src = patternURL72;
							};
							reader.readAsDataURL(blob);
						});
					};
					reader.readAsDataURL(blob);
				});
				return deferred.promise;
			}
			promises.push(addPattern(i));
		}
		
		$q.all(promises).then(function() {
			$scope.patterns = patterns;
		});
	};
	
	
	initAllLayout();
	function initAllLayout() {
		$scope.layouts = [];
		$scope.favorites = [];
		for (type in Layouts) {
			$scope.layouts = $scope.layouts.concat(Layouts[type]);
		}
	}
	function activate(event, className) {
		var el = angular.element(event.target);
		var parent = angular.element(event.target.parentNode);
		if (!el.hasClass(className)) {
			if (document.getElementsByClassName(className).length > 0) {
				var active = angular.element(
					document.getElementsByClassName(className)[0]);
				active.removeClass(className);
			}
			if (parent.hasClass('li')) {
				parent.addClass(className);
			} else {
				el.addClass(className);
			}
		}
	}
	
	$scope.showLayouts = function(event, type) {
		activate(event, 'LSactive');
		$scope.layouts = Layouts[type];
		$scope.showDelete = false;
	};

	$scope.showAllLayouts = function(event) {
		activate(event, 'LSactive');
		$scope.layouts = [];
		for (type in Layouts) {
			$scope.layouts = $scope.layouts.concat(Layouts[type]);
		}
		$scope.showDelete = false;
	};
	
	$scope.showFavorites = function(event) {
		activate(event, 'LSactive');
		$scope.layouts = $scope.favorites;
		$scope.showDelete = true;
	};
	
	$scope.saveAsFavourite = function() {
		var pageId = document.getElementsByClassName('pActive')[0].id;
		var currentPage = $scope.current[pageId];
		var layout = angular.copy(currentPage);
		layout.frames.forEach(function(frame) {
			frame.image = {};
		});
		layout.textBoxes.forEach(function(textBox) {
			textBox.text = '';
		});
		layout.isCustom = true;
		$scope.favorites.unshift(layout);
		
	};
	
	
	$scope.removeFavorite = function(index) {
		$scope.layouts.splice(index, 1);
	};
	
	$scope.layoutsClick = function(event) {
		activate(event, 'LMactive');
		$scope.showLayoutSets = true;
		$scope.showBM = false;
		$scope.showImgOpt = false;
	};
	
	
	
	$scope.BGClick = function(event) {
		activate(event, 'LMactive');
		$scope.showLayoutSets = false;
		$scope.showImgOpt = false;
		$scope.showBM = true;
	};
	
	
	$scope.ImgClick = function(event) {
		activate(event, 'LMactive');
		$scope.showImgOpt = true;
		$scope.showLayoutSets = false;
		$scope.showBM = false;
		
	};
	
	$scope.showColors = function(event) {
		activate(event, 'BMactive');
		$scope.showColor = true;
		$scope.showFrame = false;
		$scope.showPattern = false;
	};
	
	/*---------------------Patterns --------------------------------*/
	$scope.showPatterns = function(event) {
		activate(event, 'BMactive');
		$scope.showPattern = true;
		$scope.showFrame = false;
		$scope.showColor = false;
	};
	
	
	
	
	/*-------------------------------------------------------------*/

	$scope.showFrames = function(event) {
		activate(event, 'BMactive');
		$scope.showFrame = true;
		$scope.showColor = false;
		$scope.showPattern = false;
	};
	
	$scope.changeBGColor = function(color) {
		if (document.getElementsByClassName('pActive').length > 0) {
			var activePage = document.getElementsByClassName('pActive')[0];
			$scope.current[activePage.id].background = color;
			$scope.current.BGcolor = color;
		} else {
			//notify user to choose page
		}
	};
	
	$scope.removeBGColor = function() {
		if (document.getElementsByClassName('pActive').length > 0) {
			var activePage = document.getElementsByClassName('pActive')[0];
			$scope.current[activePage.id].background = '';
			$scope.current.BGcolor = '';
		}
	};
	
	$scope.changeAlbumBGColor = function() {
		$scope.album.content.forEach(function(page) {
			page.background = $scope.current.BGcolor;
		});
	};
	
	
	
	$scope.showBorders = function(event) {
		activate(event, 'IOactive');
		$scope.showBorder = true;
		$scope.showFrame = false;
		$scope.showMask = false;
	};
	
	$scope.showFrames = function(event) {
		activate(event, 'IOactive');
		$scope.showBorder = false;
		$scope.showFrame = true;
		$scope.showMask = false;
	};
	
	$scope.showMasks = function(event) {
		activate(event, 'IOactive');
		$scope.showBorder = false;
		$scope.showFrame = false;
		$scope.showMask = true;
	};
	
	
	$scope.changeBorder = function(color) {
		if (document.getElementsByClassName('cActive').length > 0) {
			var canvas = document.getElementsByClassName('cActive')[0];
			var frame = angular.element(canvas).scope().frame;
			var thickness = frame.border.thickness || 
				$scope.current.borderThickness || 3;
			canvas.style.outline = thickness + 'px solid ' + color;
			frame.border.color = color;
			frame.border.thickness = thickness;
			$scope.current.borderColor = color;
			$scope.current.borderThickness = thickness;
		}
	};
	
	$scope.imgBordertoPage = function() {
		if (document.getElementsByClassName('pActive').length > 0) {
			var pageId = document.getElementsByClassName('pActive')[0].id;
			var goodCanvas = [];
			var allCanvas = document.getElementsByClassName('frame');
			for (var j = 0; j < allCanvas.length; j++) {
				var canvas = allCanvas[j];
				if (Misc.ancestorHasClass(angular.element(canvas), 3, pageId)) {
					goodCanvas.push(canvas);
				}
			}
			var frames = $scope.current[pageId].frames;
			for (var i = 0; i < frames.length; i++) {
				var frame = frames[i];
				frame.border.color = $scope.current.borderColor;
				frame.border.thickness = $scope.current.borderThickness;
				goodCanvas[i].style.outline = $scope.current.borderThickness +
					'px solid ' + $scope.current.borderColor;
			}
		}
	};
	
	$scope.imgBordertoAlbum = function() {
		for (var j = 0; j < $scope.album.content.length; j++) {
			var page = $scope.album.content[j];
			for (var i = 0; i < page.frames.length; i++) {
				var frame = page.frames[i];
				frame.border.color = $scope.current.borderColor;
				frame.border.thickness = $scope.current.borderThickness;
			}
		}
		var allCanvas = document.getElementsByClassName('frame');
		for (var k = 0; k < allCanvas.length; k++) {
			var canvas = allCanvas[k];
			canvas.style.outline = $scope.current.borderThickness +
					'px solid ' + $scope.current.borderColor;
		}
	};
	
	$scope.getUserBorderColor = function() {
		$scope.changeBorder($scope.userColor);
		$scope.current.borderColor = $scope.userColor;
	};
	
	$scope.increaseThickness = function() {
		if (document.getElementsByClassName('cActive').length > 0) {
			var canvas = document.getElementsByClassName('cActive')[0];
			var frame = angular.element(canvas).scope().frame;
			if (frame.border.color) {
				var thickness = frame.border.thickness + 1;
				var color = frame.border.color;
				canvas.style.outline = thickness + 'px solid ' + color;
				frame.border.thickness = thickness;
				$scope.current.borderColor = color;
				$scope.current.borderThickness = thickness;
			}
		}
	};
	
	$scope.removeBorder = function() {
		if (document.getElementsByClassName('cActive').length > 0) {
			var canvas = document.getElementsByClassName('cActive')[0];
			var frame = angular.element(canvas).scope().frame;
			frame.border = {};
			$scope.current.borderThickness = 0;
			canvas.style.outline = 'none';
		}
	};
	
	$scope.decreaseThickness = function() {
		if (document.getElementsByClassName('cActive').length > 0) {
			var canvas = document.getElementsByClassName('cActive')[0];
			var frame = angular.element(canvas).scope().frame;
			if (frame.border.thickness && frame.border.color
				&& frame.border.thickness > 0) {
				var thickness = frame.border.thickness - 1;
				var color = frame.border.color;
				canvas.style.outline = thickness + 'px solid ' + color;
				frame.border.thickness = thickness;
				$scope.current.borderColor = color;
				$scope.current.borderThickness = thickness;
			}
		}
	};
	$scope.getUserBGColor = function() {
		if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i
			.test($scope.userColor)){
			$scope.changeBGColor($scope.userColor);
		}
	};
	$scope.patterntoAlbum = function() {
		var pattern = $scope.current.pattern;
		for (var i = 0; i < $scope.album.content.length; i++) {
			var page = $scope.album.content[i];
			page.patternURL = pattern.URL72;
			page.patternURL300 = pattern.URL300;
			page.patternWidth = pattern.width;
			page.patternHeight = pattern.height;
			page.patternSize = Math.floor(pattern.width / $scope.pdfWidth * 100) + '%';
		}
	};
	
	$scope.removePattern = function() {
		if (document.getElementsByClassName('pActive').length > 0) {
			var activePage = document.getElementsByClassName('pActive')[0];
		}
		var page = $scope.current[activePage.id];
		page.patternName = '';
		page.patternURL = '';
		page.patternURL300 = '';
		page.patternWidth = '';
		page.patternHeight = '';
		page.patternSize = '';
		$scope.current.pattern = {};
	};
	
	var previewPattern = document.createElement('div');
	previewPattern.id = 'previewPattern';
	angular.element(previewPattern).addClass('preview');
	document.body.appendChild(previewPattern);
}]);

app.controller('minLayoutController',
    ['$scope', '$element', 'FrameObject', 'TextBoxObject', '$q',
					function($scope, $element, FrameObject, TextBoxObject, $q) {
	
	var canvas = $element[0].children[1],
		scale = 0.2;
		
	drawLayout(canvas, scale);

	function drawLayout(canvas, scale) {
		var ctx = canvas.getContext('2d');
		canvas.width = scale * $scope.measure.pwidth;
		canvas.height = scale * $scope.measure.pheight;
		
		function drawPattern() {
			var deferred1 = $q.defer();
			if (!!$scope.layout.patternURL) {
				var tempCanvas = document.createElement('canvas');
				tempCtx = tempCanvas.getContext('2d');
				var img = new Image();
				var patternSize = parseFloat($scope.layout.patternSize) * canvas.width /100; 
				img.src = $scope.layout.patternURL;
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
		
		function drawFrames() {
			
			for (i = 0; i < $scope.layout.frames.length; i++) {
				var frame = $scope.layout.frames[i];
				var rect = frame.canvas;
				ctx.beginPath();
				ctx.lineWidth = '.2';
				var left = scale * rect.left* $scope.measure.pwidth / 100,
					top = scale * rect.top * $scope.measure.pheight / 100,
					width = scale * rect.width * $scope.measure.pwidth / 100,
					height = scale * rect.height * $scope.measure.pheight / 100;
				if (!!frame.angle) {
					ctx.save();
					var centerX = left + width / 2,
						centerY = top + height / 2;
					ctx.translate(centerX, centerY);
					ctx.rotate(Math.PI * frame.angle / 180);
					ctx.rect(-width / 2, -height / 2, width, height);
					ctx.stroke();
					ctx.fillStyle = '#EEEEEE';
					ctx.fillRect(-width/2, -height/2, width, height);
					ctx.restore();
				} else {
					ctx.rect(left, top, width, height);
					ctx.stroke();
					ctx.fillStyle = '#EEEEEE';
					ctx.fillRect(left, top, width, height);
				}
			}
			
			for (i = 0; i < $scope.layout.textBoxes.length; i++) {
				var textBox = $scope.layout.textBoxes[i];
				var rect = textBox.box;
				var left = scale * rect.left*$scope.measure.pwidth/100,
					top = scale * rect.top * $scope.measure.pheight/100,
					width = scale * rect.width * $scope.measure.pwidth/100,
					height = scale * rect.height * $scope.measure.pheight/100;
				ctx.beginPath();
				ctx.lineWidth = '.2';
				if (!!textBox.angle) {
					ctx.save();
					var centerX = left + width / 2,
						centerY = top + height / 2;
					ctx.translate(centerX, centerY);
					ctx.rotate(Math.PI * textBox.angle / 180);
					ctx.rect(-width / 2, -height / 2, width, height);
					ctx.strokeStyle = 'blue';
					ctx.stroke();
					ctx.restore();
				} else {
					ctx.rect(left, top, width, height);
					ctx.strokeStyle = 'blue';
					ctx.stroke();
				}
			}
		}
		var BGcolor =  $scope.layout.background || '#FFFFFF';
		ctx.fillStyle = BGcolor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		if (!!$scope.layout.patternURL) {
			drawPattern()
			.then(function() {
				drawFrames();
			});
		} else {
			drawFrames();
		}
	}
	
	var previewLayout = document.createElement('canvas');
	angular.element(previewLayout).addClass('preview');
	document.body.appendChild(previewLayout);
	
 	$scope.previewLayout = function(layout, event) {
		drawLayout(previewLayout, .6);
		var mouseX = event.pageX,
			mouseY = event.pageY;
		previewLayout.style.bottom = (document.body.offsetHeight - mouseY + 50) + 'px';
		previewLayout.style.left = (mouseX - 100) + 'px';
		previewLayout.style.display = 'block';
	};
	
	$scope.mouseLeave = function() {
		previewLayout.style.display = 'none';
	};
	
	$scope.loadPageLayout = function(layout) {
		var activePage = document.getElementsByClassName('pActive')[0];

		if (activePage) {
			var oldPageCopy = angular.copy($scope.current[activePage.id]);
			var currentPage = $scope.current[activePage.id];

			function saveImages() {
				var images = [];
				var frames = currentPage.frames;
				for (var j = 0; j < frames.length; j++) {
					if (!!frames[j].image.src) {
						images.push(frames[j].image);
					}
				}
				return images;
			}
			
			var images = saveImages();
			currentPage.frames = [];
			currentPage.textBoxes = [];
			
			for (var i = 0; i < layout.frames.length; i++) {
				currentPage.frames[i] = new FrameObject(angular.copy(layout.frames[i]));
			}
			
			for (var j = 0; j< layout.textBoxes.length; j++) {
				currentPage.textBoxes[j] = new TextBoxObject(angular.copy(layout.textBoxes[j]));
			}
			
			if (!!layout.isCustom) {
				currentPage.background = layout.background || '';
				currentPage.patternName = layout.patternName || '';
				currentPage.patternURL = layout.patternURL || '';
				currentPage.patternURL300 = layout.patternURL300 || '';
				currentPage.patternWidth = layout.patternWidth || '';
				currentPage.patternHeight = layout.patternHeight || '';
				currentPage.patternSize = layout.patternSize || '';
			} else {
				currentPage.background = oldPageCopy.background || '';
				currentPage.patternName = oldPageCopy.patternName || '';
				currentPage.patternURL = oldPageCopy.patternURL || '';
				currentPage.patternURL300 = oldPageCopy.patternURL300 || '';
				currentPage.patternWidth = oldPageCopy.patternWidth || '';
				currentPage.patternHeight = oldPageCopy.patternHeight || '';
				currentPage.patternSize = oldPageCopy.patternSize || '';
			}
			currentPage.frames.forEach(function(frame) {
				if (images.length > 0) {
					frame.image = images.shift();
				} else {
					frame.image = {};
				}
			});
		}
	};

	
	$scope.onDelete = function() {
		var div = $element[0];
		div.style.outline = '1px solid #CCC';
	};
	
	$scope.leaveDelete = function() {
		var div = $element[0];
		div.style.outline = 'none';
	};
}]);


app.controller('PatternController', ['$scope', 
					function($scope) {
	$scope.changePattern = function(pattern) {
		if (document.getElementsByClassName('pActive').length > 0) {
			var activePage = document.getElementsByClassName('pActive')[0];
		}
		var page = $scope.current[activePage.id];
		page.patternName = $scope.pattern.name;
		page.patternURL = $scope.pattern.URL72;
		page.patternURL300 = $scope.pattern.URL300;
		page.patternWidth = $scope.pattern.width;
		page.patternHeight = $scope.pattern.height;
		page.patternSize = Math.floor($scope.pattern.width / $scope.measure.pdfWidth * 100) + '%';
		$scope.current.pattern = $scope.pattern;
	};
	
	var previewPattern = document.getElementById('previewPattern');
	
 	$scope.previewPattern = function(pattern, event) {
		var mouseX = event.pageX,
			mouseY = event.pageY;
		previewPattern.style.bottom = (document.body.offsetHeight - mouseY + 50) + 'px';
		previewPattern.style.left = (mouseX - 100) + 'px';
		previewPattern.style.display = 'block';
		previewPattern.style.width = 0.6 * $scope.measure.pwidth + 'px';
		previewPattern.style.height = 0.6 * $scope.measure.pheight + 'px';
		previewPattern.style.background = 'url("' + pattern.URL72 + '")';
		previewPattern.style.backgroundSize =  pattern.width / 4 + "px";
	};
	
	$scope.mouseLeave = function() {
		previewPattern.style.display = 'none';
	};
}]);