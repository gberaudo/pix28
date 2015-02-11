var app = angular.module('albumApp', ['gettext']);                                                                                                                                                                                    
  
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
	$scope.showHome = true;
	DBServices.initAlbumDB($scope);
	
	$scope.changeLanguage = function(lang) {
		$rootScope.userInfo.lang = lang;
		gettextCatalog.setCurrentLanguage(lang);
		gettextCatalog.loadRemote('static/build/locale/'+lang+'/album.json');
		updateUserDB(lang);
	};
	
	function updateUserDB(lang) {
		var openRq = window.indexedDB.open('UserDB',2);
		openRq.onsuccess = function(event) {
			var db = openRq.result,
				trans = db.transaction(['userInfo'], 'readwrite'),
				store = trans.objectStore('userInfo')
				var getRq = store.get(1);
			getRq.onsuccess = function() {
				var info = getRq.result;
				info.lang = lang;
				store.put(info);
			};
		};
	};

	$scope.goHome = function() {
		$scope.showHome = true;
		$scope.inAlbum = false;
		if ($scope.albumSCs.length > 0) {
			$scope.showAlbums = true;
		}
	};
	
	$element[0].onselectstart = function() {
		return false;
	};
	

	$scope.mouseUp = function(evt) {
		$scope.current.mouseIsUp = true;
		$scope.current.cursor = 'auto';
	};
}]);
