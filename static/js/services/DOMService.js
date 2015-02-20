app.factory('DOMService', ['Misc', 'FrameObject', function(Misc, FrameObject) {
	return {
		activate: activate,
		deactivate: deactivate,
		markSelectedItem: markSelectedItem,
		getAbsPos: getAbsPos,
		getRelPos: getRelPos,
		dropInPage: dropInPage
	}
	
	function activate(elem, className) {
		angular.element(elem).addClass(className);
	}
	
	function deactivate(className) {
		var actives = document.getElementsByClassName(className);
		[].forEach.call(actives, function(el) {
			angular.element(el).removeClass(className);
		});
	}
	
	function markSelectedItem(className, name) {
		var selected = document.getElementsByClassName(className+ ' selected');
		[].forEach.call(selected, function(el) {
			angular.element(el).removeClass('selected');
		});
		var newSelected = document.getElementsByName(name)[0];
		if (!!newSelected) {
			angular.element(newSelected).addClass('selected');
		}
	}
	
	function getAbsPos(el) {
		var rect = el.getBoundingClientRect();
		var docEl = document.documentElement;
		var rectTop = rect.top + window.pageYOffset - docEl.clientTop;
		var rectLeft = rect.left + window.pageXOffset - docEl.clientLeft;
		return {
			top: rectTop,
			left: rectLeft
		}
	}
	
	function dropInPage(ev, pageObj, page, pwidth, pheight, current, scope) {
		var data = ev.dataTransfer;
		var name = data.getData('name');
		var pagePos = getAbsPos(page);
		var mouseX = ev.pageX - pagePos.left;
		var mouseY = ev.pageY - pagePos.top;
		
		switch (name) {
			case 'frame':
				var frames = pageObj.frames
				var maxFrameLayer = Misc.getMaxProp(frames, 'layer');
				var rect = setRect(3,3, pwidth, pheight);
				var canvas = Misc.abs2perCent(rect, pwidth, pheight);
				var frame = new FrameObject({canvas: canvas});
				frame.layer = maxFrameLayer;
				scope.$apply(function() {
					current.datumWithFocus = frame;
					frames.push(frame);
				});
				break;
				
			case 'text':
				var textBoxes = pageObj.textBoxes;
				var maxTextLayer = Misc.getMaxProp(textBoxes, 'layer');
				var rect = setRect(2, 12, pwidth, pheight);
				var box = Misc.abs2perCent(rect, pwidth, pheight);
				var newTextBox = {
					box: box,
					font: {
						color: current.font.color || '#000000',
						family: current.font.family,
						size: current.font.size
					},
					align: 'left',
					layer: Math.max(maxTextLayer, 15)
				};
				scope.$apply(function() {
					current.datumWithFocus = newTextBox;
					textBoxes.push(newTextBox);
				});
				break;
		}
		
		function setRect(wRate, hRate, pwidth, pheight){
			var rect = {};
			rect.width =  Math.floor(pwidth / wRate);
			rect.height = Math.floor(pheight / hRate);
			
			if (mouseY < rect.height/2) {
				rect.top = 0;
			} else if (mouseY + rect.height/2 > pheight) {
				rect.top = pheight - rect.height;
			} else {
				rect.top = Math.floor(mouseY - rect.height/2);
			}

			if (mouseX < rect.width/2) {
				rect.left = 0;
			} else if (mouseX + rect.width/2 > pwidth) {
				rect.left = pwidth - rect.width;
			} else {
				rect.left = Math.floor(mouseX - rect.width/2);
			}
			return rect;
		}
	}
	function getRelPos(evt) {
		if (evt.offsetX === undefined){
			console.log('this case');
			return {X: evt.layerX, Y: evt.layerY};
		} else {
			return {X: evt.offsetX, Y: evt.offsetY};
		}
	}
	
}]);