app.controller('TextBoxController',
    ['$scope', '$element', '$timeout', 'Init', 'Misc',
    function($scope, $element, $timeout,Init, Misc) {
 	$scope.textArea = $element[0].children[0].children[0];; //the current textarea DOM element
	var TAcontainer = $element[0].children[0];
 	var previewText = document.getElementById('previewText');
	
	function activateTA() {
		var style = $scope.textArea.style;
		$scope.textArea.focus();
		$scope.current.onEditImage = false;
		$scope.current.onEditText = true;
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
		$scope.current.font.color = style.color;
		$scope.current.font.weight = style.fontWeight;
		$scope.current.font.style = style.fontStyle;
		$scope.current.font.size = $scope.textBox.font.size;
		$scope.current.font.family = style.fontFamily;
		$scope.$parent.activate();
		$scope.active = true;
		TAcontainer.style.outline = '0';
		previewText.style.display = 'block';
		$scope.$watch('textArea.value', function(newValue, oldValue) {
				previewText.innerHTML = $scope.textArea.value;
				previewText.style.fontFamily = $scope.textArea.style.fontFamily;
		});
		document.addEventListener('mousedown', textboxBlurHandle, true);
	}
		
	
	Init.initTextArea(TAcontainer, $scope.textArea, $scope.textBox, $scope);
	if ($scope.current.datumWithFocus === $scope.textBox) {
		$scope.textBox.font.size = 24;
		$scope.textArea.style.fontSize = $scope.textBox.font.size * $scope.pwidth / $scope.pdfWidth + 'px';
 		$scope.current.datumWithFocus = undefined;
		activateTA();
	}

	

	
	$scope.$watch('textArea.scrollHeight', function(newValue, oldValue) {
		if (newValue != oldValue && $scope.textBox.text) {
			var textArea = $scope.textArea,
				box = $scope.textBox.box;
			TAcontainer.style.height = textArea.style.height = textArea.scrollHeight + 'px';
			
			box.height = 100 * parseFloat(textArea.style.height)/$scope.pheight;
			if (box.height + box.top > 100) {
				box.top = 100 - box.height;
				TAcontainer.style.top = box.top * $scope.pheight /100 + 'px';
			}	
		}
	});
	

	$scope.textFocus = function(event) {
		activateTA();
	};
	

	function textboxBlurHandle(event) {
		var el = angular.element(event.target);
		if (Misc.ancestorHasClass(el, 6, 'controls')||(el.scope() == $scope)) {
			return;
		} else {
			angular.element($scope.textArea).removeClass('tActive');
			if ($scope.textArea.value) {
				TAcontainer.style.outline =  '0';
			} else {
				TAcontainer.style.outline = '#CEECF5 solid 1px';
			}
			$scope.active = false;
			previewText.style.display = 'none';
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
			textArea = $scope.textArea,
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
				TAcontainer.style.width = textArea.style.width = box.width + 'px';
				break;
				
			case 'vertical':
				if (offset < -box.height + 30) {
					offset = -box.height + 30;
				}
				if (offset + box.height + box.top > pheight) {
					offset = pheight - box.height - box.top;
				}
				box.height += offset;
				TAcontainer.style.height = textArea.style.height = box.height + 'px';
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
				TAcontainer.style.left = box.left + "px";
				break;

			case 'vertical':
				if (offset < -box.top) {
					offset = box.top;
				}
				if (offset + box.top + box.height > pheight) {
					offset = pheight - box.top - box.height;
				}
				box.top += offset;
				TAcontainer.style.top = box.top + "px";
				break;	
		}
		DBbox.left = 100 * box.left / pwidth;
		DBbox.top = 100 * box.top / pheight;
		DBbox.width = 100 * box.width /pwidth;
		DBbox.height = 100 * box.height / pheight;
	};
	
	function removeTextArea(el) {
		var page = el.parentNode.parentNode.parentNode.id;
		$scope.current[page].textBoxes.splice($scope.$index,1);
	};
	
	$scope.autoResize = function(event) {
		var pheight = $scope.pheight,
			pwidth = $scope.pwidth,
			box = $scope.textBox.box;
		var el = event.target;
		if (el.scrollHeight > pheight) {
			el.style.height = pheight + 'px';
			box.height = 100;
		} else {
			el.style.height = (el.scrollHeight)  + "px";
			box.height = 100 * el.scrollHeight/pheight;
		}
		if (el.offsetHeight + el.offsetTop > pheight) {
			el.style.top = (pheight - el.offsetHeight) + "px";
			box.top = 100 * (pheight - el.offsetHeight)/pheight;
		}
	};
	
	$scope.dropInTA = function(event) {
		event.preventDefault();
		activateTA();
	};
}]);

/*-----------------------Text Control board -------------------*/

app.controller('TextController', 
					['$scope', '$timeout', 'Fonts', 'Colors', 
					'Misc', '$element', '$interval',
    function($scope, $timeout, Fonts, Colors, Misc, $element, $interval) {
	$scope.current.font.color = 'black';
	$scope.current.font.style = 'normal';
	$scope.current.font.weight = 'normal';
	$scope.fonts = Fonts;
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
			var textBox = angular.element(activeTextArea).scope().textBox;
			activeTextArea.style.fontStyle = $scope.current.font.style;
			textBox.font.style = $scope.current.font.style;
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
			var textBox = angular.element(activeTextArea).scope().textBox;
			activeTextArea.style.fontWeight = $scope.current.font.weight;
			textBox.font.weight = $scope.current.font.weight
		}
	};
	
	$scope.changeFontSize = function(size) {
		if (document.getElementsByClassName('tActive').length > 0) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			var textBox = angular.element(activeTextArea).scope().textBox;
			activeTextArea.style.fontSize = (size/pageRatio) + 'px';
			textBox.font.size = size;
		}
	};
	
	$scope.changeFont = function(fontName) {
		if (document.getElementsByClassName('tActive').length > 0 && fontName) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			activeTextArea.style.fontFamily = fontName;
			angular.element(activeTextArea).scope().textBox.font.family = fontName;
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
			page = el.parentNode.parentNode.parentNode.id;
		scope.current[page].textBoxes.splice(scope.$index,1);
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
}]);
