app.directive('albumDelPage', ['gettextCatalog', '$timeout', '$compile', 
				  function(gettextCatalog, $timeout, $compile) {
	return {
		restrict: 'EA',
		replace: true,
		template: '<img src = "static/icons/delpage.svg" title="msg"/>'
		.replace("msg", "{{'Delete this double page'|translate}}"),
		link: function(scope, elem, attrs) {
			function removePageRq() {
				var num = scope.current.pageNum;
				var abContent = scope.album.content;
				var length = abContent.length;
				var anchor = angular.element(document.body);
				var popup = angular.element('<div></div>');
				
				scope.delCurrentPage = function() {
					abContent.splice(num - 1, 2);
					scope.current.pageNum -= 2;
					scope.current.rightPage = abContent[num];
					if (num > 0) {
						scope.current.leftPage = abContent[num - 1];
					}
					popup.remove();
					scope.updateView('next');
				};
				anchor.append(popup);
				popup.addClass('alert');
				scope.removePopup = function() {
					popup.remove();
				};
				
				if (num == 0 || num == length) {
					var msg = gettextCatalog.getString('Cannot remove cover page!');
					popup.text(msg);
					$timeout(function() {
						popup.remove();
					}, 2000);
				} else {
					var innerHTML = '<span translate>Do you really want to remove this double page?</span>\
						<br/><br/>\
						<button type = "button" class = "respond"\
							id = "delPage"\
							ng-click = "delCurrentPage()"\
							style = "float: left" translate>\
							Delete\
						</button>\
						<button type = "button" class = "respond"\
							id = "notDelPage"\
							ng-click = "removePopup()"\
							style = "float: right" translate>\
							Cancel\
						</button>'
					popup.html(innerHTML);
					$compile(popup)(scope);
					$timeout(function() {
						document.getElementById('notDelPage').focus();
					}, 50);
				}
			}
			elem.bind('click', removePageRq);
		}
	}
}]);