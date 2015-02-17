app.controller('ImageController',
    ['$scope', 'ImgService', '$interval', '$timeout', 'Misc',
    function($scope, ImgService, $interval, $timeout, Misc) {

	$scope.zoomImage = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0];
		var scope = angular.element(canvas).scope();
		var intervalPromise = $interval(function() {
			ImgService.zoomImage(canvas, scope, para);
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
		var intervalPromise = $interval(function() {
			moveCanvas(canvas, scope, para);
		}, 50);
		document.addEventListener('mouseup', handleMouseUp, true);
		function handleMouseUp() {
			$interval.cancel(intervalPromise);
			document.removeEventListener('mouseup', handleMouseUp, true);
		};
	};
	
	function moveCanvas(canvas, scope, para) {
		var off = 1;
		var pwidth = $scope.pwidth;
		switch (para) {
			case 'left':
				if (off > canvas.offsetLeft) {
					off = canvas.offsetLeft;
				}
				scope.frame.canvas.left -=  off * 100 / pwidth;
				canvas.style.left = (canvas.offsetLeft - off) + 'px';
				break;
			
			case 'right':
				if (off > $scope.pwidth - canvas.offsetLeft - canvas.offsetWidth) {
					off = $scope.pwidth - canvas.offsetLeft -canvas.offsetWidth;
				}
				scope.frame.canvas.left +=  off * 100 / pwidth;
				canvas.style.left = (canvas.offsetLeft + off) + 'px';
				break;
			
			case 'up':
				if (off > canvas.offsetTop) {
					off = canvas.offsetTop;
				}
				scope.frame.canvas.top -= off * 100 / pwidth;
				canvas.style.top = (canvas.offsetTop - off) + 'px';
				break;
				
			case 'down':
				if (off > $scope.pheight - canvas.offsetTop - canvas.offsetHeight) {
					off = $scope.pheight - canvas.offsetTop -canvas.offsetHeight;
				}
				scope.frame.canvas.top +=  off * 100 / pwidth;
				canvas.style.top = (canvas.offsetTop + off) + 'px';
				break;
		}
		if (scope.frame.angle % 180 == 0) {
			var pageId = canvas.parentNode.parentNode.id;
			var refs = ImgService.getRefLines(scope, pageId);
			ImgService.showRefLines(canvas, refs, $scope);
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