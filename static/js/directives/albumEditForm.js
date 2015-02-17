app.directive('albumEditForm', ['$timeout', function($timeout) {
	return {
		restrict: 'AE',
		replace: true,
		scope: {
			model: '=albumModel',
			fieldName: '@',
			maxlength: '@',
			required: '@',
			placeholder: '@message',
			type: '@'
		},
		templateUrl: 'static/partials/albumEditForm.html',
		link: function(scope, elem) {
			scope.inEdit = !scope.model[scope.fieldName];
			scope.submit = function() {
				scope.inEdit = !scope.model[scope.fieldName];
			};
			scope.blur = function() {
				scope.inEdit = !scope.model[scope.fieldName];
			};
			scope.edit = function() {
				scope.inEdit = true;
				$timeout(function() {
					document.getElementsByName('input')[0].focus();
				});
			};
		}
	}
}]);