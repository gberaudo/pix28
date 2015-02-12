app.directive('albumLanguage', ['gettextCatalog', function(gettextCatalog) {
	return {
		restrict: 'EA',
		scope: {
			lang: '@',
			title: '@',
			src: '@'
		},
		template: '<img title = "{{title}}"\
			class = "clickable"\
			src = "{{src}}"\
			ng-click = "changeLanguage(lang)"/>',
		link: function(scope) {
			scope.changeLanguage = function(lang) {
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
		}
	}
}]);