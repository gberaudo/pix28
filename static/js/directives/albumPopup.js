app.directive('albumPopup', [function() {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		scope: {},
		template: '<div ng-transclude></div>',
		link: function(scope, elem, attrs) {
			var hide;
			var close;
			if ('pageDeactivate' in attrs) {
				var hide = angular.element('<div class = "pageDeactivate"></div>');
				angular.element(document.body).append(hide);
				if ('blackenOut' in attrs) hide.addClass('blackenOut');
			}
			document.addEventListener('keydown', keyDownHandle, true);
			elem.on('$destroy', function(evt) {
				if (hide) hide.remove();
				document.removeEventListener('keydown', keyDownHandle, true);
			});
			if ('close' in attrs) {
				close = angular.element('<span class = "fa fa-remove"></span>');
				close.css({
					position: 'absolute',
					top: '5px',
					right: '5px',
					fontSize: '1.5em'
				});
				close.on('click', function() {
					elem.remove();
				});
				angular.element(elem.children()[0]).append(close);
			}

			function keyDownHandle(evt) {
				if (evt.keyCode == 27) {
					elem.remove();
				}
			}
		}
	}
}]);