var app = angular.module('albumApp', ['gettext']);                                                                                                                                                                                    
  
app.run(['$rootScope', 'gettextCatalog',
    function($rootScope, gettextCatalog) {

	$rootScope.userInfo = {};
	var userInfo = $rootScope.userInfo;
	
	initUserDB();
	
	function initUserDB() {
		userInfo.lang = window.navigator.userLanguage || window.navigator.language,
			availLangs = ['en', 'vi', 'fr'],
			langInList = false;
	
		for (i = 0; i < availLangs.length; i++) {
			if (userInfo.lang == availLangs[i]) {
				langInList = true;
				break;
			}
		}
		
		if (!langInList) {
			userInfo.lang = 'en';
		}
		
		var openRq = window.indexedDB.open('UserDB',2);
		openRq.onsuccess = function(event) {
			var db = openRq.result,
				trans = db.transaction(['userInfo']),
				store = trans.objectStore('userInfo');
			var getRq = store.get(1);
			getRq.onsuccess = function(event) {
				userInfo.lang = this.result.lang;
				gettextCatalog.setCurrentLanguage(userInfo.lang);
				gettextCatalog.loadRemote('static/build/locale/' + userInfo.lang + '/album.json');
				$rootScope.loaded = true;
			};
			getRq.onerror = function() {
				gettextCatalog.setCurrentLanguage(userInfo.lang);
				gettextCatalog.loadRemote('static/build/locale/' + userInfo.lang + '/album.json');
				$rootScope.loaded = true;
				
			};
		};
		
		openRq.onerror = function() {
			gettextCatalog.setCurrentLanguage(userInfo.lang);
			gettextCatalog.loadRemote('static/build/locale/' + userInfo.lang + '/album.json');
			$rootScope.loaded = true;
		};

		openRq.onupgradeneeded = function(event) {
			gettextCatalog.setCurrentLanguage(userInfo.lang);
			gettextCatalog.loadRemote('static/build/locale/' + userInfo.lang + '/album.json');
			$rootScope.loaded = true;
			if (event.oldVersion < 1) {
				var userInfStore = event.currentTarget.result.createObjectStore(
					'userInfo', {keyPath: 'id'});
				var addInfo = userInfStore.add({id: 1, lang: userInfo.lang});
			}
			if (event.oldVersion < 2) {
				var userDataStore =  event.currentTarget.result.createObjectStore(
					'userData', {keyPath: 'id'});
				var addData = userDataStore.add({id: 1, userFonts: []});
			}
		};
	};
	
 
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
