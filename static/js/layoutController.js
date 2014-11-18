

app.controller('LayoutController', 
    ['$scope', 'FrameObject', 'Layouts', 'Colors',
    function($scope, FrameObject, Layouts, Colors) {
	$scope.colors = Colors;
	$scope.showLayouts = function(type) {
		$scope.layouts = Layouts[type];
	};

	
	$scope.showColors = function() {
		$scope.showColorMenu = true;
		$scope.mouseInMenu = false;
	};
	
	function hideColorMenu() {
		$scope.showColorMenu = false;
	};
	$scope.colorBlur = function() {
		if (!$scope.mouseInMenu) {
			hideColorMenu();
		}
	};
	$scope.cbBlur = function() {
		if (!$scope.mouseInMenu) {
			hideColorMenu();
		}
	};

	$scope.menuBlur = function() {
		if (!$scope.mouseInMenu) {
			hideColorMenu();
		}
	};
	
	$scope.mouseEnter = function() {
		$scope.mouseInMenu = true;
	};
	
	$scope.mouseLeave = function() {
		$scope.mouseInMenu = false;
	};
	
	$scope.changeBGColor = function(color) {
		var activePage = document.getElementsByClassName('pActive')[0];
		$scope.current[activePage.id].background = color;
	}
}]);

app.controller('minLayoutController',
    ['$scope', '$element', 'FrameObject', 'TextBoxObject',
					function($scope, $element, FrameObject, TextBoxObject) {
	var canvas = $element[0];
	var ctx = canvas.getContext('2d');
	var scale = 0.2;
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
		var rect = $scope.layout.boxes[i];
		ctx.beginPath();
		ctx.lineWidth = '.2';
		ctx.rect(scale * rect.left, scale * rect.top,
					scale * rect.width, scale * rect.height
				  );
		ctx.strokeStyle = 'blue';
		ctx.stroke();
	}
	
	
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
				var textbox = new TextBoxObject(layout.boxes[j]);
				$scope.current[activePage.id].textBoxes.push(textbox);
			}
		}
	};
}]);
