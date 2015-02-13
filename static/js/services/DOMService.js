app.factory('DOMService', [function() {
	return {
		activate: activate,
		deactivate: deactivate,
		markSelectedItem: markSelectedItem,
		getAbsPos: getAbsPos
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
	
}]);