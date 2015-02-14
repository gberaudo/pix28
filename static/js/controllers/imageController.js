app.controller('ImageController',
    ['$scope', 'ImgService', '$interval', '$timeout', 'Misc',
    function($scope, ImgService, $interval, $timeout, Misc) {

	$scope.zoomImage = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0],
			scope = angular.element(canvas).scope();
 		$scope.mouseIsDown = true;
		$scope.mouseLeft = false;
		var intervalPromise = $interval(function() {
 			if (!$scope.mouseIsDown || $scope.mouseLeft) {
				$interval.cancel(intervalPromise);
 			} else {
				ImgService.zoomImage(canvas, scope, para);
			}
		}, 50);
	};
	
	$scope.mouseUp = function() {
		$scope.mouseIsDown = false;
	};
	
	$scope.mouseLeave = function() {
		$scope.mouseLeft = true;
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
		$scope.mouseIsDown = true;
		$scope.mouseLeft = false;
		var intervalPromise = $interval(function() {
			if(!$scope.mouseIsDown || $scope.mouseLeft) {
				$interval.cancel(intervalPromise);
			} else {
				moveCanvas(canvas, scope, para);
			}
		}, 100);
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
		$scope.mouseIsDown = true;
		$scope.mouseLeft = false;
		var intervalPromise = $interval(function() {
			if(!$scope.mouseIsDown || $scope.mouseLeft) {
				$interval.cancel(intervalPromise);
			} else {
				rotate(canvas, para, scope);
			}
		}, 100);
	};
	
	function rotate(canvas, para, scope) {
		var angle = 2;
		switch (para) {
			case 'right':
				scope.frame.angle += angle; 
				canvas.style.transform = 'rotate(' + scope.frame.angle + 'deg)';
				break;
			case 'left':
				scope.frame.angle -= angle; 
				canvas.style.transform = 'rotate(' + scope.frame.angle + 'deg)';
				break;
		}
	}
	
	$scope.level = function(para) {
		var canvas = document.getElementsByClassName('cActive')[0];
		var scope = angular.element(canvas).scope();
		var index = parseInt(canvas.style.zIndex)
		switch (para) {
			case 'up':
				canvas.style.zIndex = index + 1;
				scope.frame.layer = index + 1;
				break;
			case 'down':
				if (index > 0) {
				canvas.style.zIndex = index - 1;
				scope.frame.layer = index - 1;
				}
				break;
		}
	};
}]);