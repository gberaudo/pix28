app.directive('albumMovePage', function(){
	return {
		restrict: 'EA',
		replace: true,
		scope: true,
		template: "<img class = 'respond clickable' ng-click = 'movePage()'/>",
		link: function(scope, elem, attrs) {
			scope.movePage = function(){
				var direction = attrs.direction;
				var pageId = document.getElementsByClassName('pActive')[0].id;
				var movedPage = scope.current[pageId];
				var content = scope.album.content;
				var index = content.indexOf(movedPage);
				
				if (attrs.type == 'single') {
					switch (direction) {
						case 'forward': 
							if (index < content.length - 1) {
								content.splice(index, 1);
								content.splice(index + 1, 0, movedPage);
								if (pageId == 'leftPage') {
									scope.current.leftPage = scope.current.rightPage;
									scope.current.rightPage = movedPage;
								}
								if (pageId == 'rightPage') {
									scope.current.pageNum += 2;
									scope.current.leftPage = movedPage;
									if (index < content.length - 2) {
										scope.current.rightPage = content[index + 2];
									}
									scope.updateView('next');
								}
							} 
							break;
						case 'backward': 
							if (index > 0) {
								content.splice(index, 1);
								content.splice(index - 1, 0, movedPage);
								if (pageId == 'rightPage') {
									scope.current.rightPage = scope.current.leftPage;
									scope.current.leftPage = movedPage;
								}
								if (pageId == 'leftPage') {
									scope.current.pageNum -= 2;
									scope.current.rightPage = movedPage;
									if (index > 1) {
										scope.current.leftPage = content[index - 2]
									}
									scope.updateView('prev');
								}
							}
							break;
					}
				}
				if (attrs.type == 'double') {
					switch (direction) {
						case 'forward':
							if (index < content.length - 3 && index > 0) {
								var spliceIndex = (pageId == 'leftPage')? index : (index -1);  
								var movedDoublePage = content.splice(spliceIndex, 2);
								content.splice(spliceIndex + 2, 0, movedDoublePage[0], movedDoublePage[1]);
								scope.current.pageNum += 2;
								scope.updateView('next');
							}
							break;
						case 'backward':
							if (index < content.length - 1 && index > 2) {
								var spliceIndex = (pageId == 'leftPage')? index : (index -1);  
								var movedDoublePage = content.splice(spliceIndex, 2);
								content.splice(spliceIndex - 2, 0, movedDoublePage[0], movedDoublePage[1]);
								scope.current.pageNum -= 2;
								scope.updateView('prev');
							}
							break;
					}
				}
			}
		}
	}
});