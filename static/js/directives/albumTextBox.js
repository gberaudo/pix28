app.directive('albumTextBox', [function() {
	return {
		restrict: 'AE',
		replace: true,
		templateUrl: 'static/partials/albumTextBox.html',
		controller: textBoxController,
		link: function(scope, elem) {
			elem.on('drop', function(ev) {
				ev.preventDefault();
			});
		}
	}
}]);