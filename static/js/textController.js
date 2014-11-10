app.controller('TextBoxController', function($scope, $element, $timeout, $http, Init) {
	$scope.textArea = $element[0].children[0]; //the current textarea DOM element
	Init.initTextArea($scope.textArea, $scope.textBox);
	if ($scope.current.datumWithFocus === $scope.textBox) {
		$scope.textArea.focus();
		$scope.current.datumWithFocus = undefined;
	}
	
	//update textBox.box
	$scope.$watch('textArea.offsetHeight', 
		function(newValue, oldValue) {
			if (newValue != oldValue) {
				var pheight = parseInt($scope.pageHeight);
				if (parseInt(newValue) + parseInt($scope.textArea.style.top) > pheight) {
					var h = pheight - parseInt($scope.textArea.style.top);
					$scope.textArea.style.height= h + "px";
				}
				$scope.textBox.box.height = parseInt($scope.textArea.offsetHeight);
			}
		}
	);
	
	$scope.$watch('textArea.offsetWidth', function(newValue, oldValue) {
		if  (newValue != oldValue) {
			var pwidth = parseInt($scope.pageWidth);
			if (parseInt(newValue) + parseInt($scope.textArea.style.left) > pwidth) {
				var w = pwidth - parseInt($scope.textArea.style.left);
				$scope.textArea.style.width= w + "px";
			}
			$scope.textBox.box.width = parseInt($scope.textArea.style.width);
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
		var activeTextArea;
		$scope.textArea.style.resize = 'both';
		$scope.textArea.style.border =  "1px solid #77F";
		if (document.getElementsByClassName('tActive').length != 0) {
			//deactivate the current active element
			 activeTextArea = document.getElementsByClassName('tActive')[0]; 
			activeTextArea.setAttribute('class', 'tInactive');
		};
		// activate the current focused element
		$scope.textArea.setAttribute('class','tActive');
		
		$scope.current.font.color = $scope.textArea.style.color;
		$scope.current.font.weight = $scope.textArea.style.fontWeight;
		$scope.current.font.style = $scope.textArea.style.fontStyle;
		$scope.current.font.size = $scope.textArea.style.fontSize;
		$scope.current.font.family = $scope.textArea.style.fontFamily;

		$scope.$parent.activate();
	
	};
	
	$scope.click = function(event) {
		$scope.current.msg = 'Ctrl+Del to delete. Ctrl + arrow to move it around. Redimension by drawing the bottom-right corner.'
		$scope.showGuide(event);
	};
	
	$scope.blur = function($event) {
		if ($scope.textArea.value) {
			$scope.textArea.style.border =  '1px solid transparent';
		} 
		else {
			$scope.textArea.style.border =  '1px solid #CEECF5';
		}
		$scope.textArea.style.resize = 'none';
	};
	

	
	$scope.keyDown = function(event) {
		if (event.ctrlKey) {
			switch (event.keyCode) {
				case 37: //key left
					moveText('left');
					break;
				case 38: //key up
					moveText('up');
					break;
				case 39: //key right
					moveText('right');
					break;
				case 40: //key down
					moveText('down');
					break;
				case 46: //del
					removeTextArea(event.target);
					break;
			}
		}
	};
	
	function moveText(para) {
		var offset = 5;
		var pwidth = parseInt($scope.pageWidth),
			pheight = parseInt($scope.pageHeight),
			box = $scope.textBox.box;
		switch (para) {
			case 'left':
				if (offset > box.left) {
					offset = box.left;
				}
				box.left -= offset;
				$scope.textArea.style.left = box.left + "px";
				break;
			case 'right':
				if (offset + box.left + box.width > pwidth) {
					offset = pwidth - box.left - box.width;
				}
				box.left += offset;
				$scope.textArea.style.left = box.left + "px";
				break;
			case 'up':
				if (offset > box.top) {
					offset = box.top;
				}
				box.top -= offset;
				$scope.textArea.style.top = box.top + "px";
				break;	
			case 'down':
				if (offset + box.top + box.height > pheight) {
					offset = pheight - box.top - box.height;
				}
				box.top += offset;
				$scope.textArea.style.top = box.top + "px";
				break;
		}
	};
	
	function removeTextArea(el) {
		if (el.parentNode.parentNode.id == 'rightPage') {
			$scope.current.rightPage.textBoxes.splice($scope.$index,1);
		}
		if (el.parentNode.parentNode.id == 'leftPage') {
			$scope.current.leftPage.textBoxes.splice($scope.$index,1);
		}
	};
	
	$scope.autoResize = function(event) {
		var el = event.target;
		var offset = el.offsetHeight - el.clientHeight;
		
		if (el.scrollHeight + offset > $scope.pheight) {
			el.style.height = ($scope.pheight) + px;
			$scope.textBox.box.height = $scope.pheight;
		} else {
			el.style.height = (el.scrollHeight + offset) + "px";
			$scope.textBox.box.height = (el.scrollHeight + offset)
		}
		if (parseInt(el.style.height) + parseInt(el.style.top) > $scope.pheight) {
			el.style.top = ($scope.pheight - parseInt(el.style.height)) + "px";
			$scope.textBox.box.top = $scope.pheight - parseInt(el.style.height);
		}
	};
});


app.controller('TextController', function($scope, $timeout, $http, Fonts, Colors) {
	$scope.current.font.color = 'black';
	$scope.current.font.style = 'normal';
	$scope.current.font.weight = 'normal';
	$scope.fonts = Fonts;
	$scope.colors = Colors;
	
	
	$scope.dragText = function(ev) {
		ev.dataTransfer.setData("name", ev.target.getAttribute('name'));
	};
	
	/*---------Color menu ------------*/
	$scope.showColors = function() {
		$scope.showColorMenu = true;
		$scope.mouseInMenu = false;
	};
	
	$scope.changeColor = function(color) {
		$scope.current.font.color = color;
		if (document.getElementsByClassName('tActive').length >0) {
			var activeTextArea = document.getElementsByClassName('tActive')[0];
			activeTextArea.style.color = color;
		}
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
	
	$scope.menuClick = function() {
		$scope.menuClicked = true;
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
	
	$scope.dragFrame = function(event) {
		event.dataTransfer.setData("name", event.target.getAttribute('name'));
	};
});
