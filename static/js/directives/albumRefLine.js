app.directive('albumRefLine', [function() {
	return {
		restrict: 'AE',
		replace: true,
		scope: true,
		template: '<div class = "refLine"></div>',
		link: function(scope, elem, attrs) {
			var ref = attrs.ref;
			scope.$watch(function() {return scope.refLines}, function() {
				if (scope.refLines.show[ref]) {
					if (ref == 'top' || ref == 'bot') {
						elem.css('top', scope.refLines[ref] + 'px');
					}
					if (ref == 'left' || ref == 'right') {
						elem.css('left', scope.refLines[ref] + 'px');
					}
					elem.removeClass('ng-hide');
				} else {
					elem.addClass('ng-hide');
				}
			}, true);
		}
	}
}]);