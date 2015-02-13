
/*-----------------------Text Control board -------------------*/

app.controller('TextController', 
					['$scope', '$timeout', 'Fonts', 'Colors', 
					'Misc', '$element', '$interval',
    function($scope, $timeout, Fonts, Colors, Misc, $element, $interval) {
	$scope.current.font.color = 'black';
	$scope.current.font.style = 'normal';
	$scope.current.font.weight = 'normal';
	$scope.colors = Colors;
	var pageRatio = $scope.pdfWidth / $scope.pwidth;
// 	$scope.ctrlHeight = document.getElementById('controls').offsetHeight;

	
	/*---------Color menu ------------*/
	$scope.showColors = function() {
		$scope.showColorMenu = true;
		$scope.mouseInMenu = false;
		document.addEventListener('mousedown', cmMouseDownHandle, true); 
	};
	
	function cmMouseDownHandle(event) {
		var ancestorHasClass = Misc.ancestorHasClass,
			el = angular.element(event.target);
		if (ancestorHasClass(el, 6, 'textColorMenu')) {
			return;
		} else {
			$scope.showColorMenu = false;
			document.removeEventListener('mousedown', cmMouseDownHandle, true);
		}
	}
	
	$scope.changeColor = function(color) {
		$scope.current.font.color = color;
		if (document.getElementsByClassName('tActive').length >0) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			var textBox = angular.element(activeTextArea).scope().textBox;
			activeTextArea.style.color = color;
			textBox.font.color = color;
// 			previewText.style.color = color;
		}
	};
	
	/*-----------------------------------------------------*/
	
// 	$scope.italicClick = function() {
// 		if ($scope.current.font.style != 'italic') {
// 			$scope.current.font.style = 'italic';
// 		}
// 		else {
// 			$scope.current.font.style = 'normal';
// 		}
// 		if (document.getElementsByClassName('tActive').length > 0) {
// 			var activeTextArea = document.getElementsByClassName('tActive')[0];
// 			var textBox = angular.element(activeTextArea).scope().textBox;
// 			activeTextArea.style.fontStyle = $scope.current.font.style;
// 			textBox.font.style = $scope.current.font.style;
// 		}
// 	};
// 	
// 	
// 	$scope.boldClick = function() {
// 		if ($scope.current.font.weight != 'bold') {
// 			$scope.current.font.weight = 'bold';
// 		}
// 		else {
// 			$scope.current.font.weight = 'normal';
// 		}
// 		if (document.getElementsByClassName('tActive').length >0) {
// 			var activeTextArea = document.getElementsByClassName('tActive')[0];
// 			var textBox = angular.element(activeTextArea).scope().textBox;
// 			activeTextArea.style.fontWeight = $scope.current.font.weight;
// 			textBox.font.weight = $scope.current.font.weight
// 		}
// 	};
	
	$scope.changeFontSize = function(size) {
		if (document.getElementsByClassName('tActive').length > 0) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			angular.element(activeTextArea).scope().textBox.font.size = size;
			activeTextArea.style.fontSize = (size/pageRatio) + 'px';
// 			textBox.font.size = size;
// 			previewText.style.fontSize = size + 'px';
		}
	};
	
	$scope.changeFont = function(fontName) {
		if (document.getElementsByClassName('tActive').length > 0 && fontName) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			activeTextArea.style.fontFamily = fontName;
			angular.element(activeTextArea).scope().textBox.font.family = fontName;
// 			previewText.style.fontFamily = fontName;
		}
	};
	
	$scope.align = function(para) {
		if (document.getElementsByClassName('tActive').length > 0) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			var textBox = angular.element(activeTextArea).scope().textBox;
			activeTextArea.style.textAlign = para;
			textBox.align = para;
		}
	};
	
	$scope.removeTextArea = function() {
		var el = document.getElementsByClassName('tActive')[0],
			scope = angular.element(el).scope(),
			page = el.parentNode.parentNode.id;
		scope.current[page].textBoxes.splice(scope.$index,1);
		previewText.style.display = 'none';
	};
	
	$scope.mouseUp = function() {
		$scope.mouseIsDown = false;
	};
	
	$scope.mouseLeave = function() {
		$scope.mouseLeft = true;
	};
	
	$scope.rotate = function(para) {
		var textArea = document.getElementsByClassName('tActive')[0];
		var scope = angular.element(textArea).scope();
		$scope.mouseIsDown = true;
		$scope.mouseLeft = false;
		var intervalPromise = $interval(function() {
			if(!$scope.mouseIsDown || $scope.mouseLeft) {
				$interval.cancel(intervalPromise);
			} else {
				rotate(textArea, para, scope);
			}
		}, 100);
	};
	
	function rotate(textArea, para, scope) {
		var angle = 2;
		switch (para) {
			case 'right':
				scope.textBox.angle += angle; 
				break;
			case 'left':
				scope.textBox.angle -= angle; 
				break;
		}
		textArea.parentNode.style.transform = 'rotate(' + scope.textBox.angle + 'deg)';
	}
	
	$scope.level = function(para) {
		var activeNode = document.getElementsByClassName('tActive')[0].parentNode;
		var scope = angular.element(activeNode).scope();
		var index = parseInt(activeNode.style.zIndex)
		switch (para) {
			case 'up':
				activeNode.style.zIndex = index + 1;
				scope.textBox.layer = index + 1;
				break;
			case 'down':
				if (index > 0) {
				activeNode.style.zIndex = index - 1;
				scope.textBox.layer = index - 1;
				}
				break;
		}
	};
	
	$scope.addFonts = function() {
		$scope.current.addingFonts = true;
	};
}]);

