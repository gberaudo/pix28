app.directive('albumAddPage', [function() {
	return {
		restrict: 'AE',
		replace: true,
		template: '<img class = "respond clickable">',
		link: function(scope, elem, attrs) {
			elem.on('click', function() {
				scope.addNewPage();
			});
		}
	}
}]);