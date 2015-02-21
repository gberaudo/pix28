app.directive('albumPopup', [function() {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		scope: {},
		template: '<div ng-transclude></div>',
		link: function(scope, elem, attrs) {
			document.addEventListener('keydown', keyDownHandle, true);
			function keyDownHandle(evt) {
				if (evt.keyCode == 27) {
					elem.remove();
					document.removeEventListener('keydown', keyDownHandle, true);
				}
			}
		}
	}
}]);