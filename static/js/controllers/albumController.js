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
		$scope.measure = {};
		$scope.current.font = {size: 24, family: 'UVNTinTuc_R'};
		$scope.show = {};

		$scope.albumElHeight = 0.4*$scope.screenWidth;
		$scope.maxSize = Math.floor(0.225*$scope.screenWidth);
		$scope.current.borderThickness = 0;
		$scope.layoutList = [
			'x1', 'x2', 'x3', 'x4', 'x5'
		];
		$scope.fonts = Fonts;
		$scope.userFonts = getUserFonts();
	};
	var cancelUpdater;
	
	function setUpdateAlbum() {
		if (cancelUpdater) {
			cancelUpdater();
		}
		var updateAlbum = $interval(function() {
			if ($scope.current.inAlbum) {
				DBServices.updateAlbumDB($scope.album, $scope.current.albumId);
			} else {
				$interval.cancel(updateAlbum);
				cancelUpdater = undefined;
			}
		}, 10000);

		cancelUpdater = function() {
			$interval.cancel(updateAlbum);
		};
	}
	/*------------Album control----------------------------*/
	$scope.createAlbum = function(width, height) {
	
		DBServices.addAlbum().then(function(id) {
			var measure = $scope.measure;
			var album = $scope.album;
			var date = new Date();
			var options = {year: 'numeric', month: 'short', day: 'numeric' };
			$scope.current.inAlbum = true;
			$scope.current.albumId = id;
			$scope.current.showHome = false;
			album.date = date.toLocaleString($scope.userInfo.lang, options);
			if (width > height) {
				measure.pwidth = $scope.maxSize;
				measure.pheight = height * measure.pwidth / width;
			} else {
				measure.pheight = $scope.maxSize;
				measure.pwidth = width * measure.pheight / height;
			}
			album.width = measure.pdfWidth = width;
			album.height = measure.pdfHeight = height;
			measure.pageRatio = measure.pdfWidth/measure.pwidth;
			$scope.albumFormat = Math.round(25.4 * measure.pdfHeight / 72) / 10
				+ 'cm x ' + Math.round(25.4 * measure.pdfWidth / 72) / 10 + 'cm';
			
			makeRandomAlbum(album, 20);
			
			$scope.current.showAlbums = false;
			$scope.currentAlbumSC = {
				id: id, 
				date: $scope.album.date
			};
			$scope.albumSCs.push($scope.currentAlbumSC);
			$timeout(function() {
				var doublePage = document.getElementById('doublepage');
				$scope.pageTop = (doublePage.offsetHeight - measure.pheight) / 2 + 'px';
				document.getElementById('titleInput').focus();
			}, 20);
			setUpdateAlbum();
		});
	};
	
	function makeRandomPage(layoutList) {
		var lset = Misc.randomFromList(layoutList);
		var layouts = Layouts[lset];
		var layout = Misc.randomFromList(layouts);
		var page = new PageObject({});
		layout.frames.forEach(function(frame) {
			var newframe = new FrameObject(angular.copy(frame));
			page.frames.push(newframe);
		});
		layout.textBoxes.forEach(function(textbox) {
			var newtextbox = new TextBoxObject(textbox);
			page.textBoxes.push(newtextbox);
		});
		return page;
	}
		
	function makeRandomAlbum(album, num) {
		var frontPage = makeRandomPage([$scope.layoutList[0]]),
			innerFrontPage = new PageObject({}),
			innerBackPage = new PageObject({}),
			backPage = makeRandomPage(
								[$scope.layoutList[0]]);
		album.content = [frontPage, innerFrontPage];
		for (var i = 1; i < num-1; i++) {
			var page = makeRandomPage($scope.layoutList);
			$scope.album.content.push(page);
		}
		album.content.push(innerFrontPage);
		album.content.push(backPage);
		$scope.current.rightPage = album.content[0];
		$scope.current.pageNum = 0;
		updateView('prev');
	}

	this.createCustomAlbum = function(customWidth, customHeight) {
		var width = Math.round(customWidth * 72 / 2.54);
		var height = Math.round(customHeight * 72 / 2.54);
		$scope.createAlbum(width, height);
	};
	
	$scope.openAlbum = function(albumSC) {
		var measure = $scope.measure;
		$scope.currentAlbumSC = albumSC;
		DBServices.getAlbum(albumSC.id).then(function(result) {
			var width, height;
			$scope.album = result;
			width = $scope.album.width;
			height = $scope.album.height;
			measure.pdfWidth = width;
			measure.pdfHeight = height;
			if (width > height) {
				measure.pwidth = $scope.maxSize;
				measure.pheight = height * measure.pwidth / width;
			} else {
				measure.pheight = $scope.maxSize;
				measure.pwidth = width * measure.pheight / height;
			}
			measure.pageRatio = measure.pdfWidth/measure.pwidth;
			$scope.albumFormat = Math.round(25.4 * measure.pdfHeight / 72)/10
				+ 'cm x ' + Math.round(25.4 * measure.pdfWidth / 72)/10 + 'cm';
			$scope.current.rightPage = $scope.album.content[0];
			$scope.current.showHome = false;
			$scope.current.showAlbums = false;
			$scope.current.pageNum = 0;
			$scope.current.albumId = albumSC.id;
			$scope.current.inAlbum = true;
			$timeout(function() {
				var doublePage = document.getElementById('doublepage');
				$scope.pageTop = (doublePage.offsetHeight - measure.pheight) / 2 + 'px';
			}, 20);
			updateView('prev');
			setUpdateAlbum();
		});
	};
	
	
	$scope.addNewPage = function (){
		var measure = $scope.measure;
		var color, modelPage;
		var content = $scope.album.content;
		if ($scope.current.pageNum < content.length) {
			modelPage = $scope.current.rightPage;
		} else {
			modelPage = $scope.current.leftPage;
		}
		var page1 = makeRandomPage($scope.layoutList);
		var page2 = makeRandomPage($scope.layoutList);
		setPageDefault(page1, modelPage);
		setPageDefault(page2, modelPage);
		page1.patternSize = Math.floor(page1.patternWidth / measure.pdfWidth * 100) + '%';
		page2.patternSize = Math.floor(page2.patternWidth / measure.pdfWidth * 100) + '%';
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

	function setPageDefault(page, modelPage) {
		var props = ['background', 'patternName', 'patternURL',
			'patternURL300', 'patternWidth', 'patternHeight'];
		props.forEach(function(prop) {
			page[prop] = modelPage[prop];
		});
	}

	function activate(id) {
		var actives = document.getElementsByClassName('pActive');
		[].forEach.call(actives, function(el) {
			angular.element(el).removeClass('pActive');
		});
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
		DBServices.updateAlbumDB($scope.album, $scope.current.albumId)
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