app.directive('albumFormatChoice', function() {
	return {
		restrict: 'EA',
		scope: {
			width: '@',
			height: '@',
			formatTitle: '@title',
			createAlbum: '&'
		},
		replace: true,
		templateUrl: 'static/partials/albumFormatChoice.html',
	}
});
