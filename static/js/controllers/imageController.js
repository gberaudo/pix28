app.controller('ImageController',
    ['$scope', 'ImgService', '$interval', '$timeout', 'Misc',
    function($scope, ImgService, $interval, $timeout, Misc) {

	$scope.zoomImage = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0];
		var scope = angular.element(canvas).scope();
		var intervalPromise = $interval(function() {
			ImgService.zoomImage(canvas, scope.img, scope.frame, para);
		}, 20);
		document.addEventListener('mouseup', handleMouseUp, true);
		function handleMouseUp() {
			$interval.cancel(intervalPromise);
			document.removeEventListener('mouseup', handleMouseUp, true);
		};
	};

	$scope.removeImage = function() {
		var canvas = document.getElementsByClassName('cActive')[0],
			scope = angular.element(canvas).scope();
		if (!!scope.frame.image.src) {
			ImgService.updateOldThumb(scope.frame.image.DbId);
			scope.img = new Image();
			scope.frame.image = {};
			ImgService.resetFrame(canvas);
		} else {
			ImgService.delCanvas(canvas, scope);
		}
	};
	
	$scope.go = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0],
			scope = angular.element(canvas).scope();
		var rcanvas = Misc.perCent2Abs(scope.frame.canvas, $scope.pwidth, scope.pheight);
		var intervalPromise = $interval(function() {
			moveCanvas(canvas, rcanvas, scope, para);
		}, 50);
		document.addEventListener('mouseup', handleMouseUp, true);
		function handleMouseUp() {
			$interval.cancel(intervalPromise);
			Misc.abs2perCent(rcanvas, $scope.pwidth, $scope.pheight, scope.frame.canvas);
			document.removeEventListener('mouseup', handleMouseUp, true);
		};
	};
	
	function moveCanvas(canvas, rcanvas, scope, para) {
		var off = 1;
		var pwidth = $scope.pwidth;
		var pheight = $scope.pheight;
		switch (para) {
			case 'left':
				if (off > rcanvas.left) {
					off = rcanvas.left;
				}
				rcanvas.left -= off;
				break;
			
			case 'right':
				if (off > pwidth - rcanvas.left - rcanvas.width) {
					off = pwidth - rcanvas.left - rcanvas.width;
				}
				rcanvas.left += off;
				break;
			
			case 'up':
				if (off > rcanvas.top) {
					off = rcanvas.top;
				}
				rcanvas.top -= off;
				break;
				
			case 'down':
				if (off > pheight - rcanvas.top - rcanvas.height) {
					off = pheight - rcanvas.top - rcanvas.height;
				}
				rcanvas.top += off;
				break;
		}
		canvas.style.left = rcanvas.left + 'px';
		canvas.style.top = rcanvas.top + 'px';
		if (scope.frame.angle % 180 == 0) {
			var refs = ImgService.getRefLines();
			ImgService.showRefLines(canvas, refs, $scope.current);
		}
	}
	
	$scope.rotate = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0];
		var scope = angular.element(canvas).scope();
		var intervalPromise = $interval(function() {
			rotate(canvas, para, scope);
		}, 50);
		document.addEventListener('mouseup', handleMouseUp, true);
		function handleMouseUp() {
			$interval.cancel(intervalPromise);
			document.removeEventListener('mouseup', handleMouseUp, true);
		};
	};
	
	function rotate(canvas, para, scope) {
		var angle = 2;
		switch (para) {
			case 'right':
				scope.frame.angle += angle; 
				break;
			case 'left':
				scope.frame.angle -= angle; 
				break;
		}
	}
	
	$scope.level = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0];
		var scope = angular.element(canvas).scope();
		switch (para) {
			case 'up':
				scope.frame.layer += 1;
				break;
			case 'down':
				if (scope.frame.layer > 0) {
				scope.frame.layer -= 1;
				}
				break;
		}
	};
}]);