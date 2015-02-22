app.directive('albumAddFonts', ['$http', '$templateCache', '$compile', '$q',
				  function($http, $templateCache, $compile, $q) {
	return {
		restrict: 'EA',
		scope: true,
		template: '<span> more font</span>',
		link: function(scope, elem) {
			elem.bind('click', showPopup);
			function showPopup() {
				$http.get('static/partials/addFonts.html', {cache: $templateCache})
				.success(function(tpl){
					var popup;
					var anchor = angular.element(document.body);
					popup = angular.element('<album-popup page-deactivate close></album-popup>');
					popup.html(tpl);
					$compile(popup)(scope);
					anchor.append(popup);
					var fileInput = angular.element(popup.find('input')[0]);
					fileInput.bind('change', handleFontSelect);

					function handleFontSelect(event) {
						var files = event.target.files;
						event.preventDefault();
						var newStyle = document.createElement('style');
						for (var i = 0; i < files.length; i++) {
							var file = files[i];
							if (file.type.match(/x-font-ttf/)) { 
								handleFont(file);
							}
						}
						function saveUserFonts(fontURL, name) {
							var deferred = $q.defer();
							var openRq = window.indexedDB.open('UserDB');
							openRq.onsuccess = function(event) {
								var db = openRq.result,
									trans = db.transaction(['userData'], 'readwrite'),
									store = trans.objectStore('userData');
								var getRq = store.get(1);
								getRq.onsuccess = function(event) {
									var userFonts = this.result.userFonts;
									var item = {};
									var num = userFonts.length + 1;
									var customName = 'Custom' + num + '_' + name; 
									item[customName] = fontURL;
									userFonts.push(item);
									store.put(this.result);
									deferred.resolve(num);
								};
							}
							return deferred.promise;
						}
						function handleFont(file) {
							var reader = new FileReader();
							reader.onload = function(ev) {
								var fontURL = ev.target.result;
								var name = file.name.replace('.ttf', '');
								saveUserFonts(fontURL, name)
								.then(function(num) {
									var customName = 'Custom' + num + '_' + name;
									newStyle.appendChild(document.createTextNode("\
										@font-face {\
											font-family: '" + customName + "';\
											src: url('" + fontURL + "') format('truetype');\
										}\
									"));
									newStyle.appendChild(document.createTextNode("\
										." + customName + "{\
											font-family: '" + customName + "';\
										}\
									"));
									scope.userFonts.push(customName);
								});
							};
							reader.readAsDataURL(file);
						}
						document.head.appendChild(newStyle);
					};
				});
			}
			
		}
	}
}]);
