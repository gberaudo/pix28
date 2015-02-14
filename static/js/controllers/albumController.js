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
		getAlbum(albumSC.id);
		$scope.currentAlbumSC = albumSC;
		function getAlbum(id) {
			var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
			openRq.onsuccess = function(event) {
				var db = openRq.result;
				var trans = db.transaction(['Albums']);
				db.close();
				var store = trans.objectStore('Albums');		
				
				var getRq = store.get(id);
				getRq.onsuccess = function(event) {
					$scope.album.content = angular.copy(getRq.result.content);
					$scope.album.description = getRq.result.description;
					$scope.album.title = getRq.result.title || getRq.result.date;
					if (!!getRq.result.width) {
						var width = getRq.result.width;
						var height = getRq.result.height;
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
					} else {
						$scope.pheight = $scope.pwidth =  $scope.maxSize;
						$scope.pageHeight = $scope.pheight + 'px';
						$scope.pageWidth = $scope.pwidth + 'px';
						$scope.album.width = $scope.pdfWidth = 595;
						$scope.album.height = $scope.pdfHeight = 595;
					}
					$scope.pageRatio = $scope.pdfWidth/$scope.pwidth;
					$scope.albumFormat = Math.round(25.4 * $scope.pdfHeight / 72)/10
						+ 'cm x ' + Math.round(25.4 * $scope.pdfWidth / 72)/10 + 'cm';
					$scope.current.rightPage = $scope.album.content[0];
					$scope.$apply(function() {
						makeTitle();
						$scope.current.inAlbum = true;
						$scope.current.showHome = false;
						$scope.current.showAlbums = false;
						$scope.current.pageNum = 0;
						$scope.current.albumId = id;
						$scope.imgLoad = false;
						$timeout(function() {
							var doublePage = document.getElementById('doublepage');
							$scope.pageTop = (doublePage.offsetHeight - $scope.pheight) / 2 + 'px';
							$scope.imgLoad = true;
						}, 20);
						updateView('prev');
					});
					setUpdateAlbum();
				};
				getRq.onerror = function() {
					console.log('Can not get this album from database');
				};
			};
			openRq.onerror = function(event) {
				console.log('error in open DB for opening album');
			};
		}
		
	};
	
	/* -------------show title, description--------------*/

	function makeTitle() {
		if (!!$scope.album.title) {
			$scope.hasTitle = true;
			$scope.enterTitle = false;
		} 
		else {
			$scope.hasTitle = false;
			$scope.enterTitle = true;
		}
		
		if (!!$scope.album.description) {
			$scope.hasDescription = true;
			$scope.enterDescription = false;
		}
		else {
			$scope.hasDescription = false;
			$scope.enterDescription = true;
		}
	}
	
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
	

	/*------------------title, description control-------------------*/
 
	$scope.showTitle = function() {
		$scope.hasTitle = true;
		$scope.enterTitle = false;
	};
	
	$scope.showDescription = function() {
		$scope.hasDescription = true;
		$scope.enterDescription = false;
	};
	
	$scope.editTitle = function() {
		$scope.hasTitle = false;
		$scope.enterTitle = true;
		$timeout(function() {
			document.getElementById('titleInput').focus();
		});
	};

	$scope.editDescription = function() {
		$scope.hasDescription = false;
		$scope.enterDescription = true;
		$timeout(function() {
			document.getElementById('inputDescription').focus();
		});
	};
	
	$scope.saveAlbum = function() {
		DBServices.updateAlbumDB(
					$scope.album.content, $scope.current.albumId,
					$scope.album.title, $scope.album.description,
					$scope.album.date
				)
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


	$scope.descriptionBlur = function() {
		if (!!$scope.album.description) {
			$scope.enterDescription = false;
			$scope.hasDescription = true;
		}
	};
	
	$scope.titleBlur = function() {
		if (!!$scope.album.title) {
			$scope.enterTitle = false;
			$scope.hasTitle = true;
		}
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

app.controller('PreviewController', ['$scope', '$q', '$timeout', 'ImgService', 'drawService',
					function($scope, $q, $timeout, ImgService, drawService) {
	
	$scope.previewPage = function(num) {
		var maxHeight = Math.floor(0.9 * window.innerHeight);
		var maxWidth = Math.floor(0.9 * window.innerWidth);
		var prop = 0.5 * $scope.pheight / $scope.pwidth;
		if (prop < maxHeight / maxWidth) {
			previewWidth = maxWidth;
			previewHeight = Math.round(prop * previewWidth);
		} else {
			previewHeight = maxHeight;
			previewWidth = Math.round(previewHeight / prop);
		}
		$scope.previewHeight = previewHeight;
		$scope.previewWidth = previewWidth;
		document.addEventListener('keydown', handleKeyDown, true);
		$scope.viewPageNum = num;
		drawPage(num);
 		$scope.current.hideAlbum = true;
		$scope.$parent.previewMode = true;
	};
	
	function drawPage(num) {
		var pwidth = $scope.previewWidth/2,
			pheight = $scope.previewHeight;

		document.getElementById('rightPreview').innerHTML = '';
		document.getElementById('leftPreview').innerHTML = '';
		var content = $scope.album.content;
		if (num != 0) {
			var leftPage = angular.copy(content[num - 1]),
				leftView = document.getElementById('leftPreview');
			showPage(leftPage, leftView, pwidth, pheight);
		}	
		if (num != content.length) {
			var rightPage = angular.copy(content[num]),
				rightView = document.getElementById('rightPreview');
			showPage(rightPage, rightView, pwidth, pheight);
		}
		
		function showPage(page, view, pwidth, pheight) {
// 			var pwidth = parseInt(view.style.width);
// 			var pheight = parseInt(view.style.height);
			
			$timeout(function() {
				view.style.width = pwidth + 'px';
				view.style.height = pheight + 'px';
				view.style.backgroundColor = page.background || '#FFFFFF';
				view.style.backgroundImage = 'url("' + page.patternURL + '")';
				view.style.backgroundSize = page.patternSize;
			});
			console.log('preview', pwidth, pheight);
// 			var pwidth = $scope.previewWidth/2,
// 				pheight = $scope.previewHeight;
			//draw images
			for (var i = 0; i < page.frames.length; i++) {
				function draw(frame) {
					if (!!frame.image.src) {
						var canvas = document.createElement('canvas'),
							display = angular.copy(frame.display),
							img = new Image();
						canvas.width = frame.canvas.width * pwidth / 100;
						canvas.height = frame.canvas.height * pheight / 100;
						canvas.style.top = Math.ceil(frame.canvas.top * pheight / 100) + 'px';
						canvas.style.left = Math.ceil(frame.canvas.left * pwidth / 100) + 'px';
						canvas.style.position = 'absolute';
						canvas.style.zIndex = frame.layer;
						canvas.style.transform = 'rotate(' + frame.angle + 'deg)';
						if (frame.border.thickness && frame.border.color) {
							var thickness = frame.border.thickness * pwidth/ $scope.pwidth;
							canvas.style.outline = thickness + 'px solid ' + frame.border.color;
						}
						
						display.dw = canvas.width;
						display.dh = canvas.height;
						img.onload = function() {
							ImgService.drawImage(canvas, img, display); 
						};
						img.src = frame.image.src;
						view.appendChild(canvas);
					}
				}
				draw(page.frames[i]);
			}
			//draw text
			for (var i = 0 ; i < page.textBoxes.length; i++) {
				var div = document.createElement('div'),
					textBox = page.textBoxes[i];
					
				if (!!textBox.text) {
					var innerHTML = textBox.text.replace(/\n\r?/g, '<br />');
					div.innerHTML =  innerHTML || null;
					div.style.whiteSpace = 'pre-wrap';
					div.style.width = textBox.box.width * pwidth / 100 + 'px';
					div.style.height = textBox.box.height * pheight / 100 + 'px';
					div.style.top = (textBox.box.top * pheight / 100 + 2 * pheight/$scope.pheight) + 'px';
					div.style.left = textBox.box.left * pwidth / 100 + 'px';
					div.style.fontSize = textBox.font.size * pwidth/$scope.pdfWidth + 'px';
					div.style.fontStyle = textBox.font.style;
					div.style.fontFamily = textBox.font.family;
					div.style.color = textBox.font.color;
					div.style.fontWeight = textBox.font.weight;
					div.style.textAlign = textBox.align;
					div.style.lineHeight = textBox.lineHeight || 1.2;
					div.style.position = 'absolute';
					div.style.zIndex = textBox.layer;
					div.style.transform = 'rotate(' + textBox.angle + 'deg)';
					view.appendChild(div);
				}
			}
		}
	}
	
	
	$scope.removePreview = function() {
		document.removeEventListener('keydown', handleKeyDown, true);
		$scope.current.hideAlbum = false;
		$scope.$parent.previewMode = false;
	};

	function handleKeyDown(event) {
		switch (event.keyCode){
			case 27: //ESC
				$timeout(function() {
					$scope.current.hideAlbum = false;
					$scope.$parent.previewMode = false;
				});
				document.removeEventListener('keydown', handleKeyDown, true);
				break;
			case 39:
				event.preventDefault();
				if ($scope.viewPageNum != $scope.album.content.length) {
					$timeout(function(){
						$scope.previewPage($scope.viewPageNum + 2);
					});
				}
				break;
			case 37:
				event.preventDefault();
				if ($scope.viewPageNum != 0) {
					$timeout(function(){
						$scope.previewPage($scope.viewPageNum - 2);
					});
				}
				break;
		}
	}
	
	var dataUrlToBlob = function(dataurl) {
		var matched = dataurl.match(new RegExp('data:(.*);base64,(.*)'));
		var binary = atob(matched[2]);
		var len = binary.length;
		var buffer = new ArrayBuffer(len);
		var view = new Uint8Array(buffer);
		for (var i = 0; i < len; i++) {
			view[i] = binary.charCodeAt(i);
		}
		var blob = new Blob( [view], { type: matched[1] });
		return blob;
	};

	$scope.toJPEG = function(pageNum) {
		var content = $scope.album.content;
		if (pageNum == 0) {
			var canvas = document.createElement('canvas');
			drawService.drawPage(content[0], canvas, $scope)
			.then(function() {
				var image = canvas.toDataURL('image/jpeg');
				var blob = dataUrlToBlob(image);
				outputImage(blob, pageNum + 1);
			});
		} else if (pageNum == content.length) {
			var canvas = document.createElement('canvas');
			drawService.drawPage(content[content.length-1], canvas, $scope)
			.then(function() {
				var image = canvas.toDataURL('image/jpeg');
				var blob = dataUrlToBlob(image);
				outputImage(blob, pageNum);
			});
		} else {
			var canvas1 = document.createElement('canvas'),
				canvas2 = document.createElement('canvas');
			
			drawService.drawPage(content[pageNum-1], canvas1, $scope)
			.then(function() {
				drawService.drawPage(content[pageNum], canvas2, $scope)
				.then(function() {
					var canvas = document.createElement('canvas'),
						ctx = canvas.getContext('2d');
					canvas.width = 2 * canvas1.width;
					canvas.height = canvas1.height;
					ctx.drawImage(canvas1, 0, 0);
					ctx.drawImage(canvas2, canvas1.width, 0);
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(canvas1.width, 0);
					ctx.lineTo(canvas1.width, canvas1.height);
					ctx.strokeStyle = '#CCC';
					ctx.stroke(); 
					ctx.restore();
					var image = canvas.toDataURL('image/jpeg');
					var blob = dataUrlToBlob(image);
					outputImage(blob, pageNum + '-' + (pageNum + 1));
				});
			});
			
		}
		function outputImage(image, pageNum) {
 			saveAs(image, $scope.album.title + '_p' + pageNum + '.jpg');
		}
	};
}]);

/*-----------------------------------------------------------------------------*/




