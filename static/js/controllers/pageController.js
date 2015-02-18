// app.controller('PageController',
//     ['$scope', '$element', 'DOMService',
function pageController($scope, $element, DOMService) {
	
	(function initPage() {
		var page = $element[0];
		$scope.refLines = {show: {}};
	})();
	
	$scope.activate = function() {
		var page = angular.element($element[0]);
		var color = 'BG_' + $scope.page.background;
		var pattern = 'Pattern_' + $scope.page.patternName;
		
		DOMService.deactivate('pActive');
		DOMService.activate(page, 'pActive');
		DOMService.markSelectedItem('BGColor', color);
		DOMService.markSelectedItem('pattern', pattern);
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
		var pageObj = $scope.page;
		var pwidth = $scope.measure.pwidth;
		var pheight = $scope.measure.pheight;
		var current = $scope.current;
		DOMService.dropInPage(ev, pageObj, page, pwidth, pheight, current, $scope);
		$scope.activate();
	};
}

pageController.$inject = ['$scope', '$element', 'DOMService'];
// }]);
