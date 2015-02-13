app.controller('PageController',
    ['$scope', '$timeout', '$element', 'FrameObject', 'Misc', 'DOMService',
    function($scope, $timeout, $element, FrameObject, Misc, DOMService) {
	
	function initPage() {
		var page = $element[0];
		var color = $scope.current[$scope.page].background;
		page.style.width = $scope.pageWidth;
		page.style.height = $scope.pageHeight;
		page.style.backgroundColor = color;
	};
	
	initPage();
		
	$scope.activate = function() {
		var page = angular.element($element[0]);
		var color = 'BG_' + $scope.current[$scope.page].background;
		var pattern = 'Pattern_' + $scope.current[$scope.page].patternName;
		
		DOMService.deactivate('pActive');
		DOMService.activate(page, 'pActive');
		DOMService.markSelectedItem('BGColor', color);
		DOMService.markSelectedItem('pattern', pattern);
	};
	
	$scope.deactivate = function() {
		DOMService.deactivate(page, 'pActive');
	};
	
	$scope.pageFocus = function(event) {
		$scope.activate();
	};

	$scope.mouseMove = function(evt) {
		$scope.current.mousePos = {X: evt.pageX, Y: evt.pageY};
	};
	
	$scope.allowDropInPage = function(ev) {
		ev.preventDefault();
	};
	
	$scope.dropInPage = function(ev) {
		ev.preventDefault();
		dropInPage(ev);
	};
	
	function dropInPage(ev) {
		var page = $element[0];
		var data = ev.dataTransfer;
		var name = data.getData('name');
		var pagePos = DOMService.getAbsPos(page);
		var mouseX = ev.pageX - pagePos.left;
		var mouseY = ev.pageY - pagePos.top;
		
		switch (name) {
			case 'frame':
				var frames = $scope.current[page.id].frames
				var maxFrameLayer = Misc.getMaxProp(frames, 'layer');
				var canvas = {};
				canvas.width = $scope.pwidth / 3;
				canvas.height = $scope.pwidth / 3;
				
				//restrict frame into the page
				if (mouseY < canvas.height/2) {
					canvas.top = 0;
				} else if (mouseY + canvas.height/2 > $scope.pheight) {
					canvas.top = $scope.pheight - canvas.height;
				} else {
					canvas.top = Math.floor(mouseY - canvas.height/2);
				}
				
				if (mouseX < canvas.width/2) {
					canvas.left = 0;
				} else if (mouseX + canvas.width/2 > $scope.pwidth) {
					canvas.left = $scope.pwidth - canvas.width;
				} else {
					canvas.left = Math.floor(mouseX - canvas.width/2);
				}
				
				var DBCanvas = {
					width: 100*canvas.width/$scope.pwidth, 
					height: 100*canvas.height/$scope.pheight,
					top: 100*canvas.top/$scope.pheight,
					left: 100*canvas.left/$scope.pwidth
				};
				var frame = new FrameObject({canvas: DBCanvas});
				frame.layer = maxFrameLayer;
				$scope.$apply(function() {
					$scope.current.datumWithFocus = frame;
					$scope.current[page.id].frames.push(frame);
				});
				$scope.activate();
				break;
				
			case 'text':
				var textBoxes = $scope.current[page.id].textBoxes;
				var maxTextLayer = Misc.getMaxProp(textBoxes, 'layer');
				var box = {};
				box.width =  $scope.pwidth / 2;
				box.height = $scope.pheight / 12;
				if (mouseY < box.height/2) {
					box.top = 0;
				} else if (mouseY + box.height/2 > $scope.pheight) {
					box.top = $scope.pheight - box.height;
				} else {
					box.top = mouseY - box.height/2;
				}
				if (mouseX < box.width/2) {
					box.left = 0;
				} else if (mouseX + box.width/2 > $scope.pwidth) {
					box.left = $scope.pwidth - box.width;
				} else {
					box.left = mouseX - box.width/2;
				}
				var newTextBox = {
					box: {
						width: 100*box.width/$scope.pwidth,
						height: 100*box.height/$scope.pheight,
						left: 100*box.left/$scope.pwidth,
						top: 100*box.top/$scope.pheight
					},
					font: {
						color: $scope.current.font.color || '#000000',
						style: $scope.current.font.style || 'normal',
// 						weight: $scope.current.font.weight,
						family: $scope.current.font.family,
						size: $scope.current.font.size
					},
					align: 'left'
				};
				newTextBox.layer = Math.max(maxTextLayer, 15);
				$scope.$apply(function() {
					$scope.current.datumWithFocus = newTextBox;
					$scope.current[page.id].textBoxes.push(newTextBox);
				});
				$scope.activate();
				break;
		}
	};
}]);
