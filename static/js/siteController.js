var app = angular.module('albumApp', ['gettext']);                                                                                                                                                                                    
  
app.run(['$rootScope', 'gettextCatalog',
    function($rootScope, gettextCatalog) {

	
	
	initUserDB();
	
	function initUserDB() {
		var lang = window.navigator.userLanguage || window.navigator.language,
			availLangs = ['en', 'vn', 'fr'],
			langInList = false;
	
		for (i = 0; i < availLangs.length; i++) {
			if (lang == availLangs[i]) {
				langInList = true;
				break;
			}
		}
		
		if (!langInList) {
			lang = 'en';
		}
		
		var openRq = window.indexedDB.open('UserDB',1);
		openRq.onsuccess = function(event) {
			var db = openRq.result,
				trans = db.transaction(['userInfo']),
				store = trans.objectStore('userInfo')
				var getRq = store.get(1);
			getRq.onsuccess = function(event) {
				lang = this.result.lang;
				gettextCatalog.setCurrentLanguage(lang);
				gettextCatalog.loadRemote('static/build/locale/' + lang + '/album.json');
				$rootScope.loaded = true;
			};
			getRq.onerror = function() {
				gettextCatalog.setCurrentLanguage(lang);
				gettextCatalog.loadRemote('static/build/locale/' + lang + '/album.json');
				$rootScope.loaded = true;
				
			};
		};
		
		openRq.onerror = function() {
			gettextCatalog.setCurrentLanguage(lang);
			gettextCatalog.loadRemote('static/build/locale/' + lang + '/album.json');
			$rootScope.loaded = true;
		};

		openRq.onupgradeneeded = function(event) {
			console.log('created userDB');
			gettextCatalog.setCurrentLanguage(lang);
			gettextCatalog.loadRemote('static/build/locale/' + lang + '/album.json');
			$rootScope.loaded = true;
			var userInfStore = event.currentTarget.result.createObjectStore(
				'userInfo', {keyPath: 'id'});
			var addInfo = userInfStore.add({id: 1, lang: lang});
		};
	};
	
 
	gettextCatalog.debug = true; 
	
	var defaultFontSize = Math.floor(0.012*screen.width),
		banner = document.getElementById('banner');
	document.body.style.fontSize = defaultFontSize + 'px';
	document.body.style.width = 0.95*screen.width + 'px';
	document.body.style.height = 0.8*screen.height + 'px';
	banner.style.height = 0.04*screen.width + 'px';
	banner.style.fontSize = defaultFontSize + 'px';
	$rootScope.screenWidth = screen.width;
	$rootScope.screenHeight = screen.height;
}]);

app.controller('SiteController', ['$scope', 'gettextCatalog', 'DBServices', 
					'$rootScope',
	function($scope, gettextCatalog, DBServices, $rootScope) {
		
	DBServices.initAlbumDB($scope);
	
	$scope.changeLanguage = function(lang) {
		gettextCatalog.setCurrentLanguage(lang);
		gettextCatalog.loadRemote('static/build/locale/'+lang+'/album.json');
		updateUserDB(lang);
	};
	
	function updateUserDB(lang) {
		var openRq = window.indexedDB.open('UserDB',1);
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
		$scope.greeting = true;
		$scope.inAlbum = false;
		if ($scope.albumSCs.length > 0) {
			$scope.showAlbums = true;
		}
	};
}]);
