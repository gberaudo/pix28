app.directive('albumFrame', ['$timeout', 'FrameObject',
	 'ImgService', 'Misc', 'DOMService',
	 function($timeout, FrameObject, ImgService, Misc, DOMService) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			frame: '=',
			current: '=',
			pwidth: '=',
			pheight: '='
		},
		controller: canvasController,
		templateUrl: 'static/partials/albumFrame.html',
		link: function(scope, elem) {
			elem.on('dragover', function(e) {
				scope.allowDrop(e);
			});
			elem.on('drop', function(e) {
				scope.dropInCanvas(e);
			});
		}
	}
}]);


