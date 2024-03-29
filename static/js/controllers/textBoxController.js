function textBoxController($scope, $element, $timeout,Init, Misc, DOMService) {
 	$scope.textArea = $element[0].children[0];
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
		$scope.current.font.size = $scope.textBox.font.size;
		$scope.current.font.family = style.fontFamily;
		$scope.$parent.activate();
		$scope.active = true;
		TAcontainer.style.outline = '0';
		previewText.style.display = 'block';
		$scope.$watch('textArea.value', function(newValue, oldValue) {
				var innerHTML = $scope.textArea.value.replace(/\n\r?/g, '<br />');
				previewText.innerHTML = innerHTML;
		});
		document.addEventListener('mousedown', textboxBlurHandle, true);
	}
		
	var measure = $scope.measure;
	Init.initTextArea(TAcontainer, $scope.textArea, $scope.textBox, measure);
	$scope.mousePos = {};
	if ($scope.current.datumWithFocus === $scope.textBox) {
		$scope.textBox.font.size = $scope.current.font.size || 24;
		$scope.textArea.style.fontSize = $scope.textBox.font.size * measure.pwidth / measure.pdfWidth + 'px';
 		$scope.current.datumWithFocus = undefined;
		activateTA();
	}

	
	$scope.$watch('textArea.scrollHeight', function(newValue, oldValue) {
		if (newValue != oldValue && $scope.textBox.text) {
			var textArea = $scope.textArea,
				box = $scope.textBox.box,
				pheight = measure.pheight,
				marginY = Math.floor(0.02 * pheight);
				
			if (textArea.scrollHeight > pheight - 2 * marginY) {
				TAcontainer.style.height = textArea.style.height = (pheight - 2 * marginY) + 'px';
				TAcontainer.style.top = marginY + 'px';
			} else if (TAcontainer.offsetHeight + TAcontainer.offsetTop > pheight - marginY) {
				TAcontainer.style.top = (pheight - marginY - TAcontainer.offsetHeight) + 'px';
			} else {
				TAcontainer.style.height = textArea.style.height = textArea.scrollHeight + 'px';
			}
			
			box.height = 100 * TAcontainer.offsetHeight / pheight;
			box.top = 100 * TAcontainer.offsetTop / pheight;
		}
	});
	
	function textboxBlurHandle(event) {
		var el = angular.element(event.target);
		if (Misc.ancestorHasClass(el, 8, 'controls')
			|| Misc.ancestorHasClass(el, 8, 'previewText')
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
		activateTA();
		var mouseRtTA = {X: event.layerX, Y: event.layerY};
		$scope.mousePos = {X: event.pageX, Y: event.pageY};

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

		var mousePosWatch = $scope.$watch('mousePos', function(newValue, oldValue) {
			var offset = {
				X: newValue.X - oldValue.X,
				Y: newValue.Y - oldValue.Y
			};
			if (drag.all) {
				moveText('horizontal', offset.X);
				moveText('vertical', offset.Y);
				resetZone();
			} else if (drag.BR) {
				var angle = $scope.textBox.angle || 0;
				var offX = Math.cos(Math.PI * angle / 180) * offset.X
						+ Math.sin(Math.PI * angle / 180) * offset.Y; 
				var offY = -Math.sin(Math.PI * angle / 180) * offset.X
						+ Math.cos(Math.PI * angle / 180) * offset.Y; 
				window.requestAnimationFrame(function() {
					resizeText('horizontal', offX);
					resizeText('vertical', offY);
					resetZone();
				});
			}
		});
		document.addEventListener('mousemove', mouseMoveHandle, true);
		document.addEventListener('mouseup', mouseUpHandle, true);

		function mouseMoveHandle(evt) {
			$scope.mousePos= {X: evt.pageX, Y: evt.pageY};
		}

		function mouseUpHandle(ev) {
			mousePosWatch();
			for (anchor in drag) {
				drag[anchor] = false;
			}
			document.removeEventListener('mouseup', mouseUpHandle, true);
			document.removeEventListener('mousemove', mouseMoveHandle, true);
		}
	};

	function resizeText(para, offset) {
		 var pheight = measure.pheight,
			pwidth= measure.pwidth,
			DBbox = $scope.textBox.box,
			textArea = $scope.textArea,
			marginX = 0.02 * measure.pwidth,
			marginY = 0.02 * measure.pheight,
			minWidth = 50,
			minHeight = 30;
		
		var box = Misc.perCent2Abs(DBbox, pwidth, pheight);
		
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
		Misc.abs2perCent(box, pwidth, pheight, DBbox);
	}

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
		var pwidth = measure.pwidth,
			pheight = measure.pheight,
			DBbox = $scope.textBox.box,
			box =  Misc.perCent2Abs(DBbox, pwidth, pheight);
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
// 				if (offset < -box.top + marginY) {
// 					offset = -box.top + marginY;
// 				}
// 				if (offset + box.top + box.height > pheight - marginY) {
// 					offset = pheight - box.top - box.height - marginY;
// 				}
				box.top += offset;
				TAcontainer.style.top = box.top + "px";
				break;
		}
		Misc.abs2perCent(box, pwidth, pheight, DBbox);
		};
	
	function removeTextArea(el) {
		$scope.page.textBoxes.splice($scope.$index,1);
		previewText.style.display = 'none';
	};
}
textBoxController.$inject = ['$scope', '$element', '$timeout', 'Init', 'Misc', 'DOMService'];

