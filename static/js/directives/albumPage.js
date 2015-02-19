app.directive('albumPage', [function() {
	return {
		restrict: 'E',
		scope: {
			pageId: '@pageId',
			measure: '=',
			page: '=albumModel',
			current: '=',
			show: '='
		},
		replace: true,
		controller: pageController,
		templateUrl: 'static/partials/albumPage_c.html',
		link: function(scope, elem, attrs) {
			elem.on('drop', scope.dropInPage);
			elem.on('dragover', scope.allowDropInPage);
		}
	}
}]);