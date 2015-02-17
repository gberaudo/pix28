app.directive('albumEditForm', ['$timeout', function($timeout) {
	return {
		restrict: 'AE',
		replace: true,
		scope: {
			model: '=albumModel',
			fieldName: '@',
			title: '@',
			maxlength: '@',
			required: '@',
			placeholder: '@message',
			type: '@'
		},
		templateUrl: 'static/partials/albumEditForm.html',
		link: function(scope, elem) {
			scope.$watch(function() {return scope.model[scope.fieldName]}, function() {
				scope.inEdit = !scope.model[scope.fieldName];
			});
			scope.submit = function() {
				scope.inEdit = !scope.model[scope.fieldName];
			};
			scope.blur = function() {
				scope.inEdit = !scope.model[scope.fieldName];
			};
			scope.edit = function() {
				scope.inEdit = true;
				$timeout(function() {
					elem.find('input')[0].focus();
				});
			};
		}
	}
}]);