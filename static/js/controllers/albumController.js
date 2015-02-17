app.controller('AlbumController',
    ['$scope', '$timeout', '$http', '$element', '$q', 'PageObject', 
	 'DBServices', 'Misc', 'gettextCatalog', 'Layouts', 'FrameObject', 
	 'ImgService', 'TextBoxObject', '$interval', 'Fonts', 'getUserFonts',
    function($scope, $timeout, $http, $element, $q, PageObject, 
		DBServices, Misc, gettextCatalog, Layouts, FrameObject, 
		ImgService, TextBoxObject, $interval, Fonts, getUserFonts
	) {
	
	init();
	
	DBServices.initImageDB();
	$scope.guideMode = true;
	
	function init() {
		$scope.album = {};
		$scope.current.mousePos = {};
		$scope.current.pageNum = -1;
		$scope.current.font = {size: 24, family: 'UVNTinTuc_R'};
		$scope.current.imgLoad = false;
		$scope.show = {};

		$scope.albumElHeight = 0.4*$scope.screenWidth;
		
		//set default page size (for compatibility with previous version)
		$scope.pheight = $scope.pwidth 
			=  $scope.maxSize = Math.floor(0.225*$scope.screenWidth);
		$scope.pageHeight = $scope.pheight + 'px';
		$scope.pageWidth = $scope.pwidth + 'px';
		$scope.pdfWidth = 595;
		$scope.pdfHeight = 595;
		
		$scope.current.borderThickness = 0;
		$scope.layoutList = [
			'x1', 'x2', 'x3', 'x4', 'x5'
		];
		$scope.fonts = Fonts;
		$scope.userFonts = getUserFonts();
	};
	$scope.cancelUpdater = undefined;
	
	function setUpdateAlbum() {
		if ($scope.cancelUpdater) {
			$scope.cancelUpdater();
		}
		var updateAlbum = $interval(function() {
			if ($scope.current.inAlbum) {
				DBServices.updateAlbumDB(
					$scope.album.content, $scope.current.albumId,
					$scope.album.title, $scope.album.description,
					$scope.album.date, $scope.album.width, $scope.album.height
				);
				
			} else {
				$interval.cancel(updateAlbum);
				$scope.cancelUpdater = undefined;
			}
		}, 10000);

		$scope.cancelUpdater = function() {
			$interval.cancel(updateAlbum);
		};
	}
	/*------------Album control----------------------------*/
	$scope.createAlbum = function(width, height) {
	
		DBServices.addAlbum().then(function(id) {
			$scope.current.inAlbum = true;
			var date = new Date();
			var options = {year: 'numeric', month: 'short', day: 'numeric' };
			$scope.current.albumId = id;
			$scope.current.showHome = false;
 			$scope.album.title = '';
 			$scope.album.description = '';
			$scope.album.date = date.toLocaleString($scope.userInfo.lang, options);
			if (width > height) {
				$scope.pwidth = $scope.maxSize;
				$scope.pheight = height * $scope.pwidth / width;
			} else {
				$scope.pheight = $scope.maxSize;
				$scope.pwidth = width * $scope.pheight / height;
			}
			$scope.pageHeight = $scope.pheight + 'px';
			$scope.pageWidth = $scope.pwidth + 'px';
			$scope.album.width = width;
			$scope.album.height = height;
			$scope.pdfWidth = width;
			$scope.pdfHeight = height;
			$scope.pageRatio = $scope.pdfWidth/$scope.pwidth;
			$scope.albumFormat = Math.round(25.4 * $scope.pdfHeight / 72) / 10
				+ 'cm x ' + Math.round(25.4 * $scope.pdfWidth / 72) / 10 + 'cm';
			
			makeRandomAlbum(20);
			
			$scope.current.showAlbums = false;
			$scope.imgLoad = false;
			$timeout(function() {
				$scope.imgLoad = true;
			},20);
			$scope.hasTitle = false;
			$scope.hasDescription = false;
			$scope.enterDescription = true;
			$scope.enterTitle = true;
			$scope.currentAlbumSC = {
				id: id, 
				title: '', 
				description: '',
				date: $scope.album.date
			};
			$scope.albumSCs.push($scope.currentAlbumSC);
			$timeout(function() {
				var doublePage = document.getElementById('doublepage');
				$scope.pageTop = (doublePage.offsetHeight - $scope.pheight) / 2 + 'px';
				document.getElementById('titleInput').focus();
			}, 200);
			setUpdateAlbum();
		});
	};
	
	function makeRandomPage(layoutList) {
		var lset = Misc.randomFromList(layoutList);
		var layouts = Layouts[lset];
		var layout = Misc.randomFromList(layouts);
		var page = new PageObject({});
		for (var k in layout.frames) {
			var frame = new FrameObject(angular.copy(layout.frames[k])); 
			page.frames.push(frame);
		}
		for (var j in layout.textBoxes) {
			var textbox = new TextBoxObject(layout.textBoxes[j]);
			page.textBoxes.push(textbox);
		}
		return page;
	}
		
	function makeRandomAlbum(num) {
		var frontPage = makeRandomPage([$scope.layoutList[0]]),
			innerFrontPage = new PageObject({}),
			innerBackPage = new PageObject({}),
			backPage = makeRandomPage(
								[$scope.layoutList[0]]);
		$scope.album.content = [frontPage, innerFrontPage];
		for (var i = 1; i < num-1; i++) {
			var page = makeRandomPage($scope.layoutList);
			$scope.album.content.push(page);
		}
		$scope.album.content.push(innerFrontPage);
		$scope.album.content.push(backPage);
		$scope.current.rightPage = $scope.album.content[0];
		$scope.current.pageNum = 0;
		updateView('prev');
	}

	this.createCustomAlbum = function(customWidth, customHeight) {
		var width = Math.round(customWidth * 72 / 2.54);
		var height = Math.round(customHeight * 72 / 2.54);
		$scope.createAlbum(width, height);
	};
	
	$scope.openAlbum = function(albumSC) {
		$scope.currentAlbumSC = albumSC;
		DBServices.getAlbum(albumSC.id).then(function(result) {
			var width, height;
			$scope.album = result;
			width = $scope.album.width;
			height = $scope.album.height;
			$scope.pdfWidth = width;
			$scope.pdfHeight = height;
			if (width > height) {
				$scope.pwidth = $scope.maxSize;
				$scope.pheight = height * $scope.pwidth / width;
			} else {
				$scope.pheight = $scope.maxSize;
				$scope.pwidth = width * $scope.pheight / height;
			}
			$scope.pageRatio = $scope.pdfWidth/$scope.pwidth;
			$scope.albumFormat = Math.round(25.4 * $scope.pdfHeight / 72)/10
				+ 'cm x ' + Math.round(25.4 * $scope.pdfWidth / 72)/10 + 'cm';
			$scope.current.rightPage = $scope.album.content[0];
			$scope.current.showHome = false;
			$scope.current.showAlbums = false;
			$scope.current.pageNum = 0;
			$scope.current.albumId = albumSC.id;
			$scope.current.inAlbum = true;
			$timeout(function() {
				var doublePage = document.getElementById('doublepage');
				$scope.pageTop = (doublePage.offsetHeight - $scope.pheight) / 2 + 'px';
			}, 20);
			updateView('prev');
			setUpdateAlbum();
		});
	};
	
	
	$scope.addNewPage = function (){
		var pattern = {};
		var color, modelPage;
		var content = $scope.album.content;
		if ($scope.current.pageNum < content.length) {
			modelPage = $scope.current.rightPage;
		} else {
			modelPage = $scope.current.leftPage;
		}

		color = modelPage.background || '';
		pattern.name = modelPage.patternName || '';
		pattern.URL72 = modelPage.patternURL || '';
		pattern.URL300 = modelPage.patternURL300 || '';
		pattern.width = modelPage.patternWidth || '';
		pattern.height = modelPage.patternHeight || '';
		
		var page1 = makeRandomPage($scope.layoutList);
		page1.background = color
		page1.patternName = pattern.name;
		page1.patternURL = pattern.URL72;
		page1.patternURL300 = pattern.URL300;
		page1.patternWidth = pattern.width;
		page1.patternHeight = pattern.height;
		page1.patternSize = Math.floor(pattern.width / $scope.pdfWidth * 100) + '%' || undefined;
// 		
		var page2 = makeRandomPage($scope.layoutList);
		page2.background = color;
		page2.patternName = pattern.name;
		page2.patternURL = pattern.URL72;
		page2.patternURL300 = pattern.URL300;
		page2.patternWidth = pattern.width;
		page2.patternHeight = pattern.height;
		page2.patternSize = Math.floor(pattern.width / $scope.pdfWidth * 100) + '%' || undefined;
// 		
		
		 //insert a new page to the album
		if ($scope.current.pageNum < content.length) {
			content.splice($scope.current.pageNum + 1, 0, page1, page2);
			$scope.current.leftPage = page1;
			$scope.current.rightPage = page2;
			$scope.current.pageNum += 2;
		} else {
			content.push(page1);
			content.push(page2);
			$scope.current.rightPage = page1;
		}
		updateView('next');
	};

	function activate(id) {
		var active = angular.element(document.getElementsByClassName('pActive')[0])||null;
		if (!!active) {
			active.removeClass('pActive');
		}
		angular.element(document.getElementById(id)).addClass('pActive');
	}
	$scope.prevPage = function() { //show previous page
		$scope.current.pageNum -= 2;
		if ($scope.current.pageNum > 0) {
			$scope.current.leftPage = $scope.album.content[$scope.current.pageNum - 1];
		}
		$scope.current.rightPage = $scope.album.content[$scope.current.pageNum];
		updateView('prev');
	};

	$scope.nextPage = function() { //show next page and update pageNum
		$scope.current.pageNum += 2;
		if ($scope.current.pageNum <= $scope.album.content.length - 1) {
			$scope.current.rightPage = $scope.album.content[$scope.current.pageNum];
		}
		$scope.current.leftPage =  $scope.album.content[$scope.current.pageNum - 1];
		updateView('next');
	};
	
	
	function updateView(dir) {
		$scope.pageMessage =  {
			leftPage: '',
			rightPage: ''
		};
		var message = gettextCatalog.getString('This page should be left blank');
		if ($scope.current.pageNum == 0) {
			$scope.show.leftPage = false;
			$scope.show.rightPage = true;
			$timeout(function() {
				activate('rightPage');
			}, 50); //wait the page to load before focusing
		} else if ($scope.current.pageNum == $scope.album.content.length) {
			$scope.show.rightPage = false;
			$scope.show.leftPage = true;
			$timeout(function() {
				activate('leftPage');
			}, 50);
		} else {
			$scope.show.leftPage = $scope.show.rightPage = true;
			if ($scope.current.pageNum == 2 && 
				$scope.current.leftPage.frames.length == 0 &&
				$scope.current.leftPage.textBoxes.length == 0) {
				$scope.pageMessage.leftPage = message;
				activate('rightPage');
			} else if ($scope.current.pageNum == $scope.album.content.length - 2 && 
				$scope.current.rightPage.frames.length == 0 &&
				$scope.current.rightPage.textBoxes.length == 0) {
				$scope.pageMessage.rightPage = message;
				activate('leftPage');
			} else {
				$timeout(function() {
					if (dir == 'next') {
						activate('leftPage');
					} else {
						activate('rightPage');
					}
				}, 50);
			}
		}
		$scope.current.onEditText = false;
		$scope.current.onEditImage = false;
	};
 
	$scope.updateView = updateView;
	

	
	$scope.saveAlbum = function() {
		DBServices.updateAlbumDB($scope.album, $scope.current.albumId)
		.then(function() {}, 
				function() {
					var el = document.getElementById('updateMsg');
					var msg = 'Failed to save this album. Please try again.'
					el.innerHTML = msg;
					$timeout(function() {
						el.innerHTML = '';
					}, 3000);
				});
	};
	
	$scope.toAlbumList = function() {
		DBServices.updateAlbumDB(
					$scope.album.content, $scope.current.albumId,
					$scope.album.title, $scope.album.description,
					$scope.album.date, $scope.album.width, $scope.album.height
				)
		.then(function() {
			$scope.currentAlbumSC.title = $scope.album.title || $scope.album.date;
			$scope.currentAlbumSC.description = $scope.album.description;
			$scope.currentAlbumSC.width = $scope.album.width;
			$scope.currentAlbumSC.height = $scope.album.height;
			$scope.current.inAlbum = false;
			$scope.current.showHome = true;
			$scope.current.showAlbums = true;
		}, function() {
			var el = document.getElementById('updateMsg');
			var msg = 'Failed to save this album. Please try again.'
			el.innerHTML = msg;
			$timeout(function() {
				el.innerHTML = '';
			},3000);
		});
 	};

	$scope.dragText = function(ev) {
		ev.dataTransfer.setData('name', 'text');
	};
	
	$scope.dragFrame = function(event) {
		event.dataTransfer.setData('name','frame');
	};
	
	$scope.previewPage = function(num) {
		var scope = angular.element(document.getElementById('previewPage')).scope();
		scope.previewPage(num);
	};

}]);