app.factory('DOMService', [function() {
	return {
		activate: activate,
		deactivate: deactivate
	}
	
	function activate(elem, className) {
		angular.element(elem).addClass(className);
	}
	
	function deactivate(className) {
		var actives = document.getElementsByClassName(className);
		if (!!actives) {
			[].forEach.call(actives, function(el) {
				angular.element(el).removeClass(className);
			});
		}
	}
	
}]);