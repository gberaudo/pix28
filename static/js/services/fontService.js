app.factory('fontService', ['$http', '$q',
				function($http, $q) {
	return {
		getFont: function(fontName) {
			var deferred = $q.defer();
			if (isCustom(fontName)) {
				var fontURL;
				var openRq = window.indexedDB.open('UserDB');
				openRq.onsuccess = function(event) {
					var db = openRq.result,
						trans = db.transaction(['userData']),
						store = trans.objectStore('userData');
					var getRq = store.get(1);
					getRq.onsuccess = function(event) {
						var userData = this.result.userFonts;
						for (var i = 0; i < userData.length; i++) {
							if (Object.keys(userData[i])[0] == fontName) {
								fontURL = userData[i][fontName];
								deferred.resolve(Misc.dataUrlToArrayBuffer(fontURL));
							}
						}
					};
				};
			} 
			else {
				var fontSrc = 'static/fonts/' + fontName + '.ttf';
				$http.get(fontSrc, {responseType: "arraybuffer"})
					.success(function(data) {
						deferred.resolve(data);
					})
					.error(function(data, status) {
						deferred.resolve(null);
						console.log('Failed to retrieve font', status, fontSrc);
					});
			
			}
			return deferred.promise;
			
			function isCustom(fontName) {
				return fontName.match(/Custom/);
			}
		}
	}
}]);