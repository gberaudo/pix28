app.controller('TextBoxController',
    ['$scope', '$element', '$timeout', 'Init', 'Misc', 'DOMService',
    function($scope, $element, $timeout,Init, Misc, DOMService) {
 	$scope.textArea = $element[0].children[0]; //the current textarea DOM element
	var TAcontainer = $element[0];
 	var previewText = document.getElementById('previewText');
	
	function activateTA() {
		var style = $scope.textArea.style;
		$scope.textArea.focus();
		$scope.current.onEditImage = false;
		$scope.current.onEditText = true;
		
		DOMService.deactivate('tActive');
		DOMService.deactivate('cActive');
		DOMService.activate($scope.textArea, 'tActive');
	
		$scope.current.font.color = $scope.textArea.style.color;
// 		$scope.current.font.weight = style.fontWeight;
// 		$scope.current.font.style = style.fontStyle;
		$scope.current.font.size = $scope.textBox.font.size;
		$scope.current.font.family = style.fontFamily;
		$scope.$parent.activate();
		$scope.active = true;
		TAcontainer.style.outline = '0';
		previewText.style.display = 'block';
		$scope.$watch('textArea.value', function(newValue, oldValue) {
				var innerHTML = $scope.textArea.value.replace(/\n\r?/g, '<br />');
				previewText.innerHTML = innerHTML;
				previewText.style.fontFamily = $scope.current.font.family;
				previewText.style.fontSize = $scope.current.font.size + 'px';
				previewText.style.color = $scope.current.font.color;
		});
		document.addEventListener('mousedown', textboxBlurHandle, true);
	}
		
	
	Init.initTextArea(TAcontainer, $scope.textArea, $scope.textBox, $scope);
	if ($scope.current.datumWithFocus === $scope.textBox) {
		$scope.textBox.font.size = $scope.current.font.size ||24;
		$scope.textArea.style.fontSize = $scope.textBox.font.size * $scope.pwidth / $scope.pdfWidth + 'px';
 		$scope.current.datumWithFocus = undefined;
		activateTA();
	}

	

	
	$scope.$watch('textArea.scrollHeight', function(newValue, oldValue) {
		if (newValue != oldValue && $scope.textBox.text) {
			var textArea = $scope.textArea,
				box = $scope.textBox.box,
				pheight = $scope.pheight,
				marginY = Math.floor(0.02 * pheight);
				
			if (textArea.scrollHeight > pheight - 2 * marginY) {
				TAcontainer.style.height = textArea.style.height = (pheight - 2 * marginY) + 'px';
				TAcontainer.style.top = marginY + 'px';
			} else if (TAcontainer.offsetHeight + TAcontainer.offsetTop > pheight - marginY) {
				TAcontainer.style.top = (pheight - marginY - TAcontainer.offsetHeight) + 'px';
			} else	{
				TAcontainer.style.height = textArea.style.height = textArea.scrollHeight + 'px';
			}
			
			box.height = 100 * TAcontainer.offsetHeight / pheight;
			box.top = 100 * TAcontainer.offsetTop / pheight;
		}
	});
	

	$scope.textFocus = function(event) {
		activateTA();
	};
	

	function textboxBlurHandle(event) {
		var el = angular.element(event.target);
		if (Misc.ancestorHasClass(el, 6, 'controls')
			|| Misc.ancestorHasClass(el, 6, 'previewText')
			||(el.scope() == $scope)) {
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
				var angle = $scope.textBox.angle || 0;
				var offX = Math.cos(Math.PI * angle / 180) * offsetX
						+ Math.sin(Math.PI * angle / 180) * offsetY; 
				var offY = -Math.sin(Math.PI * angle / 180) * offsetX
						+ Math.cos(Math.PI * angle / 180) * offsetY; 
				window.requestAnimationFrame(function() {
					resizeText('horizontal', offX);
					resizeText('vertical', offY);
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
			marginX = 0.02 * $scope.pwidth,
			marginY = 0.02 * $scope.pheight,
			minWidth = 50,
			minHeight = 30,
			box = {
				left: DBbox.left * pwidth / 100,
				top: DBbox.top * pheight / 100,
				width: DBbox.width * pwidth / 100,
				height: DBbox.height * pheight /100
			};
		switch (para) {
			case 'horizontal':
				if (offset < -box.width + minWidth) {
					offset = -box.width + minWidth;
				}
				if (offset + box.width + box.left > pwidth - marginX) {
					offset = pwidth - box.width - box.left - marginX;
				}
				box.width += offset;
				TAcontainer.style.width = textArea.style.width = box.width + 'px';
				break;
				
			case 'vertical':
				if (offset < -box.height + minHeight) {
					offset = -box.height + minHeight;
				}
				if (offset + box.height + box.top > pheight - marginY) {
					offset = pheight - box.height - box.top - marginY;
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
		var marginX = pwidth / 50,
			marginY = pheight / 50;
		
		switch (para) {
			case 'horizontal':
// 				if (offset < -box.left + marginX) {
// 					offset = -box.left + marginX;
// 				}
// 				if (offset + box.left + box.width > pwidth - marginX) {
// 					offset = pwidth - box.left - box.width - marginX;
// 				}
				box.left += offset;
				TAcontainer.style.left = box.left + "px";
				break;

			case 'vertical':
				if (offset < -box.top + marginY) {
					offset = -box.top + marginY;
				}
				if (offset + box.top + box.height > pheight - marginY) {
					offset = pheight - box.top - box.height - marginY;
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
		var page = el.parentNode.parentNode.id;
		$scope.current[page].textBoxes.splice($scope.$index,1);
		previewText.style.display = 'none';
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

app.controller('UserFontController',
	['$scope', '$q', function($scope, $q) {
	$scope.handleFontSelect = function(event) {
		var files = event.target.files;
		event.preventDefault();
		var newStyle = document.createElement('style');
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			if (file.type.match(/x-font-ttf/)) { 
				handleFont(file);
			}
		}
		function saveUserFonts(fontURL, name) {
			var deferred = $q.defer();
			var openRq = window.indexedDB.open('UserDB');
			openRq.onsuccess = function(event) {
				var db = openRq.result,
					trans = db.transaction(['userData'], 'readwrite'),
					store = trans.objectStore('userData');
				var getRq = store.get(1);
				getRq.onsuccess = function(event) {
					var userFonts = this.result.userFonts;
					var item = {};
					var num = userFonts.length + 1;
					var customName = 'Custom' + num + '_' + name; 
					item[customName] = fontURL;
					userFonts.push(item);
					store.put(this.result);
					deferred.resolve(num);
				};
			}
			return deferred.promise;
		}
		function handleFont(file) {
			var reader = new FileReader();
			reader.onload = function(ev) {
				var fontURL = ev.target.result;
				var name = file.name.replace('.ttf', '');
				saveUserFonts(fontURL, name)
				.then(function(num) {
					var customName = 'Custom' + num + '_' + name;
					newStyle.appendChild(document.createTextNode("\
						@font-face {\
							font-family: '" + customName + "';\
							src: url('" + fontURL + "') format('truetype');\
						}\
					"));
					newStyle.appendChild(document.createTextNode("\
						." + customName + "{\
							font-family: '" + customName + "';\
						}\
					"));
					$scope.userFonts.push(customName);
				});
			};
			reader.readAsDataURL(file);
		}
		
		document.head.appendChild(newStyle);
	};
}]);
