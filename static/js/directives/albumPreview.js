app.directive('albumPreview', [function() {
	return {
		restrict: 'EA',
		replace: true,
		template: '<img class = "respond clickable"/>', 
		link: function(scope, elem, attrs) {
			elem.on('click', function() {
				var pscope = angular.element(document.getElementById('previewPage')).scope();
				pscope.previewPage(scope.current.pageNum);
			});
		}
	}
}]);