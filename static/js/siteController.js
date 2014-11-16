var app = angular.module('albumApp', []);

app.run(function($rootScope) {
	var defaultFontSize = 0.012*screen.width;
	var banner = document.getElementById('banner');
	document.body.style.fontSize = defaultFontSize + 'px';
	document.body.style.width = 0.95*screen.width + 'px';
	document.body.style.height = 0.8*screen.height + 'px';
	banner.style.height = 0.04*screen.width + 'px';
	banner.style.fontSize = defaultFontSize + 'px';
	$rootScope.screenWidth = screen.width;
});
app.controller('SiteController', function($scope) {

});