app.controller('PageController',
    ['$scope', '$timeout', '$element', 'FrameObject', 'Misc',
    function($scope, $timeout, $element, FrameObject, Mics) {
	
	function initPage() {
		var page = $element[0];
		var color = $scope.current[$scope.page].background;
		page.style.width = $scope.pageWidth;
		page.style.height = $scope.pageHeight;
		page.style.backgroundColor = color;
	};
	
	initPage();
	
	$scope.activate = function() {
		var active = angular.element(document.getElementsByClassName('pActive')[0]);
		active.removeClass('pActive');
		var page = angular.element($element[0]);
		page.addClass('pActive');
		
		markSelectedBGColor();
		markSelectedPattern();
		function markSelectedBGColor() {
			if (document.getElementsByClassName('BGColor selected').length > 0) {
				angular.element(document.getElementsByClassName('BGColor selected')[0])
				.removeClass('selected');
			}
			angular.element(document.getElementsByClassName(
				'BGColor ' + 'BG_' + $scope.current[$scope.page].background)).addClass('selected');
		}
		
		function markSelectedPattern() {
			if (document.getElementsByClassName('pattern selected').length > 0) {
				angular.element(document.getElementsByClassName('pattern selected')[0])
				.removeClass('selected');
			}
			angular.element(document.getElementsByClassName(
				'pattern ' + 'Pattern_' + $scope.current[$scope.page].patternName)).addClass('selected');
		}
	};
	
	$scope.deactivate = function() {
		angular.element($element[0]).removeClass('pActive');
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
		var data = ev.dataTransfer;
		var name = data.getData('name'),
			page = $element[0],
			mouseX = ev.pageX - page.offsetLeft - 
						page.parentNode.offsetLeft - page.parentNode.parentNode.offsetLeft,
			mouseY = ev.pageY - page.offsetTop - 
						page.parentNode.offsetTop - page.parentNode.parentNode.offsetTop;
		
		
		switch (name) {
			case 'frame':
				var maxFrameLayer = getMaxFrameLayer(page.id);
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
				var maxTextLayer = getMaxTextLayer(page.id);
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
		function getMaxFrameLayer(pageId) {
			var max = 10;
			var frames = $scope.current[pageId].frames;
			
			for (var i = 0; i < frames.length; i++) {
				var index = parseInt(frames[i].layer);
				if (max < index) {
					max = index;
				}
			}
			
			return max;
		}
		
		function getMaxTextLayer(pageId) {
			var max = 0;
			var textBoxes = $scope.current[pageId].textBoxes;
			for (var i = 0; i < textBoxes.length; i++) {
				var index = parseInt(textBoxes[i].layer);
				if (max < index) {
					max = index;
				}
			}
		}
		
	};
}]);
