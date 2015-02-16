app.controller('PageController',
    ['$scope', '$element', 'DOMService',
    function($scope, $element, DOMService) {
	
	(function initPage() {
		var page = $element[0];
		var color = $scope.current[$scope.page].background;
		page.style.width = $scope.pageWidth;
		page.style.height = $scope.pageHeight;
		page.style.backgroundColor = color;
	})();
	
	$scope.activate = function() {
		var page = angular.element($element[0]);
		var color = 'BG_' + $scope.current[$scope.page].background;
		var pattern = 'Pattern_' + $scope.current[$scope.page].patternName;
		
		DOMService.deactivate('pActive');
		DOMService.activate(page, 'pActive');
		DOMService.markSelectedItem('BGColor', color);
		DOMService.markSelectedItem('pattern', pattern);
	};
	
	$scope.deactivate = function() {
		DOMService.deactivate(page, 'pActive');
	};
	
	$scope.pageFocus = function(event) {
		$scope.activate();
	};

	$scope.allowDropInPage = function(ev) {
		ev.preventDefault();
	};
	
	$scope.dropInPage = function(ev) {
		ev.preventDefault();
		var page = $element[0];
		var pageObj = $scope.current[page.id];
		var pwidth = $scope.pwidth;
		var pheight = $scope.pheight;
		var current = $scope.current;
		DOMService.dropInPage(ev, pageObj, page, pwidth, pheight, current, $scope);
		$scope.activate();
	};
	
}]);
