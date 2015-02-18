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
			var editing;
			scope.$watch(function() {return scope.model[scope.fieldName]},
				function() {
					if (!editing) scope.inEdit = !scope.model[scope.fieldName];
			});
			scope.submit = function() {
				editing = true;
				scope.inEdit = !scope.model[scope.fieldName];
			};
			scope.blur = function() {
				editing = false;
				scope.inEdit = !scope.model[scope.fieldName];
			};
			scope.edit = function() {
				editing = true;
				scope.inEdit = true;
				$timeout(function() {
					elem.find('input')[0].focus();
				});
			};
		}
	}
}]);