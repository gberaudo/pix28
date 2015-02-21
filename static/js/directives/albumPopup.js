app.directive('albumPopup', [function() {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		scope: {},
		template: '<div ng-transclude></div>',
		link: function(scope, elem, attrs) {
			var hide;
			if ('pageDeactivate' in attrs) {
				var hide = angular.element('<div class = "pageDeactivate"></div>');
				angular.element(document.body).append(hide);
				if ('blackenOut' in attrs) hide.addClass('blackenOut');
			}
			document.addEventListener('keydown', keyDownHandle, true);
			elem.on('$destroy', function(evt) {
				if (hide) hide.remove();
			});
			function keyDownHandle(evt) {
				if (evt.keyCode == 27) {
					elem.remove();
					document.removeEventListener('keydown', keyDownHandle, true);
				}
			}
		}
	}
}]);