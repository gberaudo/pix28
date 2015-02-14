app.controller('ExportController', 
					['$scope', '$timeout', 'Misc', '$q', '$http', 'ImgService', 'exportService', 'drawService',
					function($scope, $timeout, Misc, $q, $http, ImgService, exportService, drawService) {

	$scope.communication = {};
	$scope.generatePdf = function(resolution) {
		$scope.showMenu = false;
		$scope.processingPdf = true;
		var albumJSON = angular.copy($scope.album.content);
		var ratio = $scope.pdfWidth / $scope.pwidth;
		exportService.exportPdf(albumJSON, $scope.pdfHeight, $scope.pdfWidth, 
										ratio, resolution, $scope.communication)
		.then(function(pdfLink) {
			$scope.pdfLink = pdfLink;
			$scope.showLink = true;
			$scope.processingPdf = false;
		});
	};

	$scope.generateJpg = function() {
		var album = angular.copy($scope.album.content);
		$scope.showMenu = false;
		$scope.processingJpg = true;
		makeJpg(album).then(function(res) {
			var content = zipFiles(res);
			saveAs(content, "AlbumJPEG.zip");
			$scope.processingJpg = false;
			$scope.showJpgLink = true;
			$scope.popupZip = function() {
				saveAs(content, 'AlbumJPEG.zip');
			};
		});
	};
	
	$scope.blurbHandle = function() {
		$scope.choosingCover = true;
	};
	
	$scope.editCover = function() {
		$scope.editingCover = true;
		$scope.backWidth = getBackWidth($scope.coverType, $scope.paperType, $scope.album.content.length);
		function getBackWidth(coverType, paperType, pageNum) {
			return Math.round(5*pageNum/20);
		}
	};

	function zipFiles(res) {
		var zip = new JSZip();
		var jpgZip = zip.folder('images');
		for (num in res) {
			var fileName = $scope.album.title + '_p' + (num + 1) + '.jpg ';
			var b64content = res[num].replace('data:image/jpeg;base64,', '');
			jpgZip.file(fileName, b64content, {base64: true});
		}
		return jpgZip.generate({type: 'blob'});
	}

	function makeJpg(album) {
		var deferred = $q.defer();
		var promises = [];
		album.forEach(function(page) {
			promises.push(drawPage(page));
		});
		$q.all(promises).then(function(res) {
			deferred.resolve(res);
		});
		return deferred.promise;
	}

	function drawPage(page) {
		var deferred = $q.defer();
		var pageCanvas = document.createElement('canvas');
		drawService.drawPage(page, pageCanvas, $scope).then(function() {
			var image = pageCanvas.toDataURL('image/jpeg');
			deferred.resolve(image);
		});
		return deferred.promise;
	}
}]);