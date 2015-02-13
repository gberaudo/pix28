app.factory('InitUserDB', ['gettextCatalog', '$q', function(gettextCatalog, $q) {
	return function(userInfo) {
		var deferred = $q.defer();
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
				deferred.resolve(null);				
			};
			getRq.onerror = function() {
				gettextCatalog.setCurrentLanguage(userInfo.lang);
				gettextCatalog.loadRemote('static/build/locale/' + userInfo.lang + '/album.json');
				deferred.resolve(null);
			};
		};
		
		openRq.onerror = function() {
			gettextCatalog.setCurrentLanguage(userInfo.lang);
			gettextCatalog.loadRemote('static/build/locale/' + userInfo.lang + '/album.json');
			deferred.resolve(null);
		};

		openRq.onupgradeneeded = function(event) {
			gettextCatalog.setCurrentLanguage(userInfo.lang);
			gettextCatalog.loadRemote('static/build/locale/' + userInfo.lang + '/album.json');
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
		return deferred.promise;
	};
}]);
	