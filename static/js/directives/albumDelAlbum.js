app.directive('albumDelAlbum', ['$http', '$templateCache', '$compile', '$timeout', 
				  function($http, $templateCache, $compile, $timeout) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, elem, attrs) {
			var popup;
			var anchor = angular.element(document.body);
			scope.delAlbumRq = function() {
				$http.get('static/partials/alertDelAlbum.html', {cache: $templateCache})
				.success(function(tpl){
					popup = angular.element(tpl);
					popup.on('keydown', alertKeydown);
					$compile(popup)(scope);
					anchor.append(popup);
				});
				$timeout(function() {
					document.getElementById('notDelAlbum').focus();
				}, 50);
			};

			function alertKeydown(event) {
				if (event.keyCode != 13) event.preventDefault();
				if (event.keyCode == 37) {
					document.getElementById('delAlbum').focus();
				}
				if  (event.keyCode == 39) {
					document.getElementById('notDelAlbum').focus();
				}
			};

			scope.notDelAlbum = function() {
				popup.remove();
			};

			scope.removeAlbum = function(id) {
				var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
				openRq.onsuccess = function(event) {
					var db = openRq.result;
					var removeRq = db.transaction(['Albums'], 'readwrite')
											.objectStore('Albums')
											.delete(id);
					removeRq.onsuccess = function() {
						for (i = 0; i < scope.albumSCs.length; i++) {
							if (scope.albumSCs[i].id == scope.current.albumId) {
								scope.albumSCs.splice(i,1);
								break;
							}
						}
						scope.$apply(function() {
							scope.current.albumId = null;
							scope.current.inAlbum = false;
							if (scope.albumSCs.length > 0) {
								scope.current.showAlbums = true;
							}
							scope.current.showHome = true;
							popup.remove();
						});
					};
					removeRq.onerror = function() {
						console.log('failed to remove album', id);
						popup.remove();
					};
						
				};
				openRq.onerror = function() {
					console.log('failed to open DB to removing album');
					popup.remove();
				};
			};
		}
	}
}]);
