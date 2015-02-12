app.directive('albumShowExportChoices', 
				  ['$http', '$templateCache', '$compile', '$timeout',
				  function($http, $templateCache, $compile, $timeout) {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, elem) {
			var popup;
			var anchor = angular.element(document.body);
			scope.showExportMenu = function() {
				$http.get('static/partials/exportWindow.html', {cache: $templateCache})
				.success(function(tpl){
					popup = angular.element(tpl);
					$compile(popup)(scope);
					anchor.append(popup);
					scope.current.hideAlbum = true;
					scope.showMenu = true;
					document.addEventListener('keydown', exportKeyDownHandle, true);
				});
			};
			
			scope.closeExportWindow = function() {
				scope.current.hideAlbum = false;
				popup.remove();
				document.removeEventListener('keydown', exportKeyDownHandle, true);
			};
			
			function exportKeyDownHandle(event) {
				if (event.keyCode == 27) {
					popup.remove();
					document.removeEventListener('keydown', exportKeyDownHandle, true);
					$timeout(function() {
						scope.current.hideAlbum = false;
					});
				} 
			};
		}
	}
}]);
