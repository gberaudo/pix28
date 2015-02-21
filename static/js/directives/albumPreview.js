app.directive('albumPreview', ['$http', '$templateCache', '$compile',
				  function($http, $templateCache, $compile) {
	return {
		restrict: 'EA',
		replace: true,
		template: '<img class = "respond clickable"/>', 
		link: function(scope, elem, attrs) {
			elem.on('click', function() {
				var popup;
				var anchor = angular.element(document.body);
				$http.get('static/partials/previewPages.html', {cache: $templateCache})
				.success(function(tpl){
					popup = angular.element('<album-popup page-deactivate blacken-out></album-popup>');
					popup.html(tpl);
					$compile(popup)(scope);
					anchor.append(popup);
				});
			});
		}
	}
}]);