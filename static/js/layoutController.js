

app.controller('LayoutController', 
    ['$scope', 'FrameObject', 'Layouts', 'Colors', 'Misc',
    function($scope, FrameObject, Layouts, Colors, Misc) {
	$scope.colors = Colors;
	
	$scope.showLayouts = function(type) {
		$scope.layouts = Layouts[type];
	};

	
	$scope.showColors = function() {
		$scope.showColorMenu = true;
		document.addEventListener('mousedown', BGMenuMouseDownHandle, true);
	};
	
	function BGMenuMouseDownHandle(event) {
		var el = angular.element(event.target);
		if (Misc.ancestorHasClass(el, 4, 'BGcolorMenu')) {
			return;
		} else {
			$scope.showColorMenu = false;
			document.removeEventListener('mousedown', BGMenuMouseDownHandle, true);
		}
	}

	
	$scope.changeBGColor = function(color) {
		if (document.getElementsByClassName('pActive').length > 0) {
			var activePage = document.getElementsByClassName('pActive')[0];
			$scope.current[activePage.id].background = color;
			$scope.current.BGcolor = color;
		} else {
			//notify user to choose page
		}
	};
	
	$scope.changeAlbumBGColor = function() {
		for (i = 0; i < $scope.album.content.length; i++) {
			$scope.album.content[i].background = $scope.current.BGcolor;
			if (!!$scope.current.leftPage) {
				$scope.current.leftPage.background = $scope.current.BGcolor;
			}
			if (!!$scope.current.rightPage) {
				$scope.current.rightPage.background = $scope.current.BGcolor;
				
			}
		}
	};
	
	
	$scope.getUserColor = function() {
		if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i
			.test($scope.userColor)){
			$scope.changeBGColor($scope.userColor);
		}
	};
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
		previewLayout.style.border = '1px solid #CCC';
	};
	
	$scope.mouseLeave = function() {
		previewLayout.style.display = 'none';
	};
	
	$scope.loadPageLayout = function(layout) {
		var canvas, frame, box;
		var activePage = document.getElementsByClassName('pActive')[0];

		if (!!activePage) {
			$scope.current[activePage.id].frames = [];
			$scope.current[activePage.id].textBoxes = [];//remove the current layout
			for (var i in layout.frames) {
				var image = {};
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
