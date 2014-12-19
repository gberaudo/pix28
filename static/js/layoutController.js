

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
	};

	$scope.showAllLayouts = function(event) {
		activate(event, 'LSactive');
		$scope.layouts = [];
		for (type in Layouts) {
			$scope.layouts = $scope.layouts.concat(Layouts[type]);
		}
	};
	
	$scope.showFavorites = function(event) {
		activate(event, 'LSactive');
		$scope.layouts = [];
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
		for (var i = 0; i < $scope.album.content.length; i++) {
			$scope.album.content[i].background = $scope.current.BGcolor;
		}
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
			var thickness = frame.border.thickness || 3;
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
		page.patternURL = undefined;
		page.patternURL300 = undefined;
		page.patternWidth = undefined;
		page.patternHeight = undefined;
		page.patternSize = undefined;
		$scope.current.pattern = {};
	};
	
	var previewPattern = document.createElement('div');
	previewPattern.id = 'previewPattern';
	angular.element(previewPattern).addClass('preview');
	document.body.appendChild(previewPattern);
}]);

app.controller('minLayoutController',
    ['$scope', '$element', 'FrameObject', 'TextBoxObject',
					function($scope, $element, FrameObject, TextBoxObject) {
	
	var canvas = $element[0],
		scale = 0.2;
		
	drawLayout(canvas, scale);

	function drawLayout(canvas, scale) {
		var ctx = canvas.getContext('2d');
		canvas.width = scale * $scope.pwidth;
		canvas.height = scale * $scope.pheight;
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		for (i = 0; i < $scope.layout.frames.length; i++) {
			var rect = $scope.layout.frames[i];
			ctx.beginPath();
			ctx.lineWidth = '.2';
			var left = scale * rect.left* $scope.pwidth / 100,
				top = scale * rect.top * $scope.pheight / 100,
				width = scale * rect.width * $scope.pwidth / 100,
				height = scale * rect.height * $scope.pheight / 100;
			ctx.rect(left, top, width, height);
			ctx.stroke();
			ctx.fillStyle = '#EEEEEE';
			ctx.fillRect(left, top, width, height);
		}
		
		for (i = 0; i < $scope.layout.boxes.length; i++) {
			var rect = $scope.layout.boxes[i].box;
			ctx.beginPath();
			ctx.lineWidth = '.2';
			ctx.rect(scale * rect.left*$scope.pwidth/100, 
						scale * rect.top * $scope.pheight/100,
						scale * rect.width * $scope.pwidth/100,
						scale * rect.height * $scope.pheight/100
					);
			ctx.strokeStyle = 'blue';
			ctx.stroke();
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
		var canvas, frame, box;
		var activePage = document.getElementsByClassName('pActive')[0];

		if (!!activePage) {
			var images = [];
			var frames = $scope.current[activePage.id].frames;
			for (var j = 0; j < frames.length; j++) {
				if (!!frames[j].image.src) {
					images.push(frames[j].image);
				}
			}
			var rest = images.length;
			console.log(rest);
			var image;
			$scope.current[activePage.id].frames = [];
			$scope.current[activePage.id].textBoxes = [];//remove the current layout
			for (var i in layout.frames) {
				if (rest > 0) {
					image = images.shift();
				} else {
					image = {};
				}
				canvas = angular.copy(layout.frames[i]);
				frame = new FrameObject(canvas, image, {}); 
				$scope.current[activePage.id].frames.push(frame);
			}
			for (var j in layout.boxes) {
				var textbox = new TextBoxObject(layout.boxes[j].box, layout.boxes[j].font);
				$scope.current[activePage.id].textBoxes.push(textbox);
			}
		}
	};
}]);


app.controller('PatternController', ['$scope', 
					function($scope) {
	$scope.changePattern = function(pattern) {
		if (document.getElementsByClassName('pActive').length > 0) {
			var activePage = document.getElementsByClassName('pActive')[0];
		}
		var page = $scope.current[activePage.id];
		page.patternURL = $scope.pattern.URL72;
		page.patternURL300 = $scope.pattern.URL300;
		page.patternWidth = $scope.pattern.width;
		page.patternHeight = $scope.pattern.height;
		page.patternSize = Math.floor($scope.pattern.width / $scope.pdfWidth * 100) + '%';
		$scope.current.pattern = $scope.pattern;
	};
	
	var previewPattern = document.getElementById('previewPattern');
	
 	$scope.previewPattern = function(pattern, event) {
		var mouseX = event.pageX,
			mouseY = event.pageY;
		previewPattern.style.bottom = (document.body.offsetHeight - mouseY + 50) + 'px';
		previewPattern.style.left = (mouseX - 100) + 'px';
		previewPattern.style.display = 'block';
		previewPattern.style.width = 0.6 * $scope.pwidth + 'px';
		previewPattern.style.height = 0.6 * $scope.pheight + 'px';
		previewPattern.style.background = 'url("' + pattern.URL72 + '")';
		previewPattern.style.backgroundSize =  pattern.width / 4 + "px";
	};
	
	$scope.mouseLeave = function() {
		previewPattern.style.display = 'none';
	};
}]);