var app = angular.module('albumApp', ['gettext']);  

app.config(['$compileProvider', function($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
}]); 
 
app.run(['$rootScope', 'gettextCatalog', 'InitUserDB',
    function($rootScope, gettextCatalog, InitUserDB) {

	$rootScope.userInfo = {};
	InitUserDB($rootScope.userInfo)
	.then(function() {
		$rootScope.loaded = true;
	});
	
	gettextCatalog.debug = true; 
	$rootScope.screenWidth = window.innerWidth;
	var defaultFontSize = Math.floor(0.012*$rootScope.screenWidth);
	document.body.style.fontSize = defaultFontSize + 'px';
	
}]);

app.controller('SiteController', ['$scope', 'gettextCatalog', 'DBServices', 
					'$rootScope', '$element',
	function($scope, gettextCatalog, DBServices, $rootScope, $element) {
	$scope.current = {};
	$scope.current.showHome = true;
	DBServices.initAlbumDB()
	.then(function(albumSCs) {
		$scope.albumSCs = albumSCs || [];
	});

	$scope.goHome = function() {
		$scope.current.showHome = true;
		$scope.current.inAlbum = false;
		if ($scope.albumSCs.length > 0) {
			$scope.current.showAlbums = true;
		}
	};
}]);
