app.controller('PageController', function($scope, $element, FrameObject) {
	$scope.pageFocus = function(event) {
		$scope.activate();
	};
	
	$scope.activate = function() {
		//deactivate the current active page
		var active = angular.element(document.getElementsByClassName('pActive')[0]);
		active.removeClass('pActive');
		//activate this page
		var page = angular.element($element[0]);
		page.addClass('pActive');
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
				var canvas = {};
				canvas.width = 100;
				canvas.height = 100;
				
				//restrict frame into the page
				if (mouseY < canvas.height/2) {
					canvas.top = 0;
				} else if (mouseY + canvas.height/2 > $scope.pheight) {
					canvas.top = $scope.pheight - canvas.height;
				} else {
					canvas.top = mouseY - canvas.height/2;
				}
				
				if (mouseX < canvas.width/2) {
					canvas.left = 0;
				} else if (mouseX + canvas.width/2 > $scope.pwidth) {
					canvas.left = $scope.pwidth - canvas.width;
				} else {
					canvas.left = mouseX - canvas.width/2;
				}
				
				var frame = new FrameObject(canvas, {}, {});
				$scope.$apply(function() {
					$scope.current[page.id].frames.push(frame);
				});

				break;
			case 'text':
				var box = {};
				box.width = 150;
				box.height = 20;
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
					box: box,
					font: {
						color: $scope.current.font.color,
						style: $scope.current.font.style,
						weight: $scope.current.font.weight,
						family: $scope.current.font.family,
						size: $scope.current.font.size
					}
				};
				$scope.$apply(function() {
					$scope.current.datumWithFocus = newTextBox;
					$scope.current[page.id].textBoxes.push(newTextBox);
				});
				
				break;
		}
	};
});