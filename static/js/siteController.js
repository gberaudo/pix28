var app = angular.module('albumApp', ['gettext']);                                                                                                                                                                                    
  
app.run(
    ['$rootScope', 'gettextCatalog',
    function($rootScope, gettextCatalog) {
	var defaultFontSize = 0.012*screen.width;
	var banner = document.getElementById('banner');
	document.body.style.fontSize = defaultFontSize + 'px';
	document.body.style.width = 0.95*screen.width + 'px';
	document.body.style.height = 0.8*screen.height + 'px';
	banner.style.height = 0.04*screen.width + 'px';
	banner.style.fontSize = defaultFontSize + 'px';
	$rootScope.screenWidth = screen.width;

  gettextCatalog.setCurrentLanguage('vn');
  gettextCatalog.loadRemote('static/build/locale/vn/album.json');
  gettextCatalog.debug = true; 
}]);
app.controller('SiteController', ['$scope', 'gettextCatalog', 
	function($scope, gettextCatalog) {
	$scope.changeLanguage = function(lang) {
		gettextCatalog.setCurrentLanguage(lang);
		gettextCatalog.loadRemote('static/build/locale/'+lang+'/album.json');
	};
}]);
