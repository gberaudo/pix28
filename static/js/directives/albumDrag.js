app.directive('albumDrag', [function() {
	return {
		restrict: 'EA',
		replace: true,
		template: '<img class = "respond draggable" draggable = "true"/>',
		link: function(scope, elem, attrs) {
			elem.on('dragstart', function(evt) {
				evt.dataTransfer.setData('name', attrs.dragType);
			});
		}
	}
}]);