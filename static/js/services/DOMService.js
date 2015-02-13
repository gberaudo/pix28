app.factory('DOMService', [function() {
	return {
		activate: activate,
		deactivate: deactivate,
		markSelectedItem: markSelectedItem
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
	
}]);