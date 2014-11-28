app.controller('TextBoxController',
    ['$scope', '$element', '$timeout', 'Init', 'Misc',
    function($scope, $element, $timeout,Init, Misc) {
	$scope.textArea = $element[0].children[0]; //the current textarea DOM element
	Init.initTextArea($scope.textArea, $scope.textBox, $scope);
	if ($scope.current.datumWithFocus === $scope.textBox) {
 		$scope.textArea.focus();
		$scope.current.onEditImage = false;
		$scope.current.onEditText = true;
		$scope.current.datumWithFocus = undefined;
		if (document.getElementsByClassName('tActive').length != 0) {
			//deactivate the current active element
			 activeTextArea = angular.element(document.getElementsByClassName('tActive')[0]); 
			activeTextArea.removeClass('tActive');
		}
		if (document.getElementsByClassName('cActive').length > 0) {
			var activeCanvas = angular.element(document.getElementsByClassName('cActive')[0]);
			activeCanvas.removeClass('cActive');
		}
		angular.element($scope.textArea).addClass('tActive');
	}
	
	$scope.$watch('textArea.scrollHeight', function(newValue, oldValue) {
		if (newValue != oldValue && $scope.textBox.text) {
			$scope.textArea.style.height = $scope.textArea.scrollHeight + 'px';
			$scope.textBox.box.height = 100 * parseFloat($scope.textArea.style.height)/$scope.pheight;
			if ($scope.textBox.box.height + $scope.textBox.box.top > 100) {
				$scope.textBox.box.top = 100 - $scope.textBox.box.height;
				$scope.textArea.style.top = $scope.textBox.box.top * $scope.pheight /100 + 'px';
			}	
		}
	});
	
	//update textBox.font and textBox.align
	$scope.$watchGroup([
			'textArea.style.fontWeight', 
			'textArea.style.fontFamily', 
			'textArea.style.fontStyle',
			'textArea.style.fontSize',
			'textArea.style.color',
			'textArea.style.textAlign'
			],
			function(newValue, oldValue) {
				if (newValue != oldValue) {
					$scope.textBox.font.weight = $scope.textArea.style.fontWeight;
					$scope.textBox.font.size = $scope.textArea.style.fontSize;
					$scope.textBox.font.style = $scope.textArea.style.fontStyle;
					$scope.textBox.font.family = $scope.textArea.style.fontFamily;
					$scope.textBox.font.color = $scope.textArea.style.color;
					$scope.textBox.align = $scope.textArea.style.textAlign;
				}
	});
	/*----------------------------------------------------*/

	$scope.textFocus = function(event) {
		$scope.current.onEditImage = false;
		$scope.current.onEditText = true;
		$scope.textArea.style.resize = 'both';
		if (document.getElementsByClassName('tActive').length != 0) {
			//deactivate the current active element
			var activeTextArea = angular.element(document.getElementsByClassName('tActive')[0]); 
			activeTextArea.removeClass('tActive');
		};
		
		if (document.getElementsByClassName('cActive').length > 0) {
			var activeCanvas = angular.element(document.getElementsByClassName('cActive')[0]);
			activeCanvas.removeClass('cActive');
		}
		// activate the current focused element
		angular.element(event.target).addClass('tActive');
		
		$scope.current.font.color = $scope.textArea.style.color;
		$scope.current.font.weight = $scope.textArea.style.fontWeight;
		$scope.current.font.style = $scope.textArea.style.fontStyle;
		$scope.current.font.size = $scope.textArea.style.fontSize;
		$scope.current.font.family = $scope.textArea.style.fontFamily;
		$scope.$parent.activate();
		document.addEventListener('mousedown', textboxBlurHandle, true);
	};
	

	function textboxBlurHandle(event) {
		var el = angular.element(event.target);
		if (Misc.ancestorHasClass(el, 6, 'controls')||(el.scope() == $scope)) {
			return;
		} else {
			angular.element($scope.textArea).removeClass('tActive');
			if ($scope.textArea.value) {
				$scope.textArea.style.border =  '1px solid transparent';
			}
			$scope.textArea.style.resize = 'none';
			$scope.current.onEditText = false;
			document.removeEventListener('mousedown', textboxBlurHandle, true);
		}
	}

	$scope.TAZone = {};
	var drag = {all: false, BR: false};
	
	function resetZone() {
		$scope.TAZone.TL = {
			left: 0,
			right: 30,
			bot: 10,
			top: 0
		};
		
		$scope.TAZone.BR = {
			left: $scope.textArea.offsetWidth -20,
			right: $scope.textArea.offsetWidth,
			bot: $scope.textArea.offsetHeight,
			top: $scope.textArea.offsetHeight - 20
		};
	};
	resetZone();
	
	$scope.mouseDown = function(event) {
		$scope.current.mouseIsUp = false;
		var mouseRtTA = {X: event.layerX, Y: event.layerY};
		if (Misc.inRect(mouseRtTA, $scope.TAZone.TL)) {
			$scope.current.cursor = 'move';
			drag.all = true;
		} else if (Misc.inRect(mouseRtTA, $scope.TAZone.BR)) {
			$scope.current.cursor = 'se-resize';
			drag.BR = true;
			drag.all = false;
		} else {
			$scope.current.cursor = 'auto';
			drag.all = false;
			drag.BR = false;
		}
	};
	
	$scope.$watch('current.mousePos', function(newValue, oldValue) {
// 		if (newValue != oldValue) {
			offsetX = newValue.X - oldValue.X;
			offsetY = newValue.Y - oldValue.Y;
			if (!!drag.all & !$scope.current.mouseIsUp) {
				moveText('horizontal', offsetX);
				moveText('vertical', offsetY);
				resetZone();
			} else if (!!drag.BR & !$scope.current.mouseIsUp) {
				window.requestAnimationFrame(function() {
					resizeText('horizontal', offsetX);
					resizeText('vertical', offsetY);
					resetZone();
				});
			}
// 		}
	});
	
	function resizeText(para, offset) {
		 var pheight = $scope.pheight,
			pwidth= $scope.pwidth,
			DBbox = $scope.textBox.box,
			box = {
				left: DBbox.left * pwidth / 100,
				top: DBbox.top * pheight / 100,
				width: DBbox.width * pwidth / 100,
				height: DBbox.height * pheight /100
			};
		switch (para) {
			case 'horizontal':
				if (offset < -box.width + 50) {
					offset = -box.width + 50;
				}
				if (offset + box.width + box.left > pwidth) {
					offset = pwidth - box.width - box.left;
				}
				box.width += offset;
				$scope.textArea.style.width = box.width + 'px';
				break;
				
			case 'vertical':
				if (offset < -box.height + 30) {
					offset = -box.height + 30;
				}
				if (offset + box.height + box.top > pheight) {
					offset = pheight - box.height - box.top;
				}
				box.height += offset;
				$scope.textArea.style.height = box.height + 'px';
				break;
		}
		DBbox.left = 100 * box.left / pwidth;
		DBbox.top = 100 * box.top / pheight;
		DBbox.width = 100 * box.width /pwidth;
		DBbox.height = 100 * box.height / pheight;
	}
	$scope.$watch('current.mouseIsUp', function() {
		if ($scope.current.mouseIsUp) {
			drag.all = false;
			drag.BR = false;
		}
	});
	
	$scope.mouseMove = function(event) {
		var mouseRtTA = {X: event.layerX, Y: event.layerY};
		resetZone();
		if (Misc.inRect(mouseRtTA, $scope.TAZone.TL)) {
			$scope.current.cursor = 'move';
		} else if (Misc.inRect(mouseRtTA, $scope.TAZone.BR)) {
			$scope.current.cursor = 'se-resize';
		} else {
			$scope.current.cursor = 'default';
		}
	};
	

	$scope.keyDown = function(event) {
		var offset = 5;
		if (event.ctrlKey) {
			switch (event.keyCode) {
				case 37: //key left
					moveText('horizontal', -offset);
					break;
				case 38: //key up
					moveText('vertical', -offset);
					break;
				case 39: //key right
					moveText('horizontal', offset);
					break;
				case 40: //key down
					moveText('vertical', offset);
					break;
				case 46: //del
					removeTextArea(event.target);
					break;
			}
		}
	};
	
	function moveText(para, offset) {
		var pwidth = $scope.pwidth,
			pheight = $scope.pheight,
			DBbox = $scope.textBox.box,
			box = {
				left: DBbox.left * pwidth / 100,
				top: DBbox.top * pheight / 100,
				width: DBbox.width * pwidth / 100,
				height: DBbox.height * pheight /100
			};
		switch (para) {
			case 'horizontal':
				if (offset < -box.left) {
					offset = box.left;
				}
				if (offset + box.left + box.width > pwidth) {
					offset = pwidth - box.left - box.width;
				}
				box.left += offset;
				$scope.textArea.style.left = box.left + "px";
				break;

			case 'vertical':
				if (offset < -box.top) {
					offset = box.top;
				}
				if (offset + box.top + box.height > pheight) {
					offset = pheight - box.top - box.height;
				}
				box.top += offset;
				$scope.textArea.style.top = box.top + "px";
				break;	
		}
		DBbox.left = 100 * box.left / pwidth;
		DBbox.top = 100 * box.top / pheight;
		DBbox.width = 100 * box.width /pwidth;
		DBbox.height = 100 * box.height / pheight;
	};
	
	function removeTextArea(el) {
		var page = el.parentNode.parentNode.id;
		$scope.current[page].textBoxes.splice($scope.$index,1);
	};
	
	$scope.autoResize = function(event) {
		var el = event.target;
		if (el.scrollHeight > $scope.pheight) {
			el.style.height = $scope.pheight + 'px';
			$scope.textBox.box.height = 100;
		} else {
			el.style.height = (el.scrollHeight)  + "px";
			$scope.textBox.box.height = 100 * el.scrollHeight/$scope.pheight;
		}
		if (el.offsetHeight + el.offsetTop > $scope.pheight) {
			el.style.top = ($scope.pheight - el.offsetHeight) + "px";
			$scope.textBox.box.top = 100 * ($scope.pheight - el.offsetHeight)/$scope.pheight;
		}
	};
}]);

/*-----------------------Text Control board -------------------*/

app.controller('TextController', 
					['$scope', '$timeout', 'Fonts', 'Colors', 'Misc', '$element',
    function($scope, $timeout, Fonts, Colors, Misc, $element) {
	$scope.current.font.color = 'black';
	$scope.current.font.style = 'normal';
	$scope.current.font.weight = 'normal';
	$scope.fonts = Fonts;
	$scope.colors = Colors;
	$scope.ctrlHeight = document.getElementById('controls').offsetHeight;
	console.log('ctrlHeight', $scope.ctrlHeight);

	
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
			activeTextArea.style.color = color;
		}
	};
	
	/*-----------------------------------------------------*/
	
	$scope.italicClick = function() {
		if ($scope.current.font.style != 'italic') {
			$scope.current.font.style = 'italic';
		}
		else {
			$scope.current.font.style = 'normal';
		}
		if (document.getElementsByClassName('tActive').length > 0) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			activeTextArea.style.fontStyle = $scope.current.font.style;
		}
	};
	
	
	$scope.boldClick = function() {
		if ($scope.current.font.weight != 'bold') {
			$scope.current.font.weight = 'bold';
		}
		else {
			$scope.current.font.weight = 'normal';
		}
		if (document.getElementsByClassName('tActive').length >0) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			activeTextArea.style.fontWeight = $scope.current.font.weight;
		}
	};
	
	$scope.changeFontSize = function(size) {
		if (document.getElementsByClassName('tActive').length > 0) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			activeTextArea.style.fontSize = size;
		}
	};
	
	$scope.changeFont = function(fontName) {
		if (document.getElementsByClassName('tActive').length > 0 && fontName) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			activeTextArea.style.fontFamily = fontName;
		}
	};
	
	$scope.align = function(para) {
		if (document.getElementsByClassName('tActive').length > 0) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			activeTextArea.style.textAlign = para;
		}
	};
	
	$scope.removeTextArea = function() {
		var el = document.getElementsByClassName('tActive')[0],
			scope = angular.element(el).scope(),
			page = el.parentNode.parentNode.id;
		scope.current[page].textBoxes.splice(scope.$index,1);
	};
}]);
