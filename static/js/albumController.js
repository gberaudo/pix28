app.controller('AlbumController',
    ['$scope', '$timeout', '$http', '$element', '$q', 'PageObject', 
	 'DBServices', 'Misc', 'gettextCatalog', 'Layouts', 'FrameObject', 
	 'ImgService', 'TextBoxObject', '$interval',
    function($scope, $timeout, $http, $element, $q, PageObject, 
		DBServices, Misc, gettextCatalog, Layouts, FrameObject, 
		ImgService, TextBoxObject, $interval
	) {
	
	init();
	
	DBServices.initImageDB();
	$scope.guideMode = true;
	
	function init() {
		$scope.album = {};
		$scope.current.mousePos = {};
		$scope.current.pageNum = -1;
		$scope.current.font = {size: '12px', family: 'UVNTinTuc_R'};
		$scope.current.imgLoad = false;
		$scope.show = {};

		var albumEl = document.getElementById('album');
		$scope.albumElHeight = 0.53*albumEl.offsetWidth
		albumEl.style.height =  $scope.albumElHeight + 'px';
		
		//set default page size (for compatibility with previous version)
		$scope.pheight = $scope.pwidth 
			=  $scope.maxSize = Math.floor(0.3 * albumEl.offsetWidth);
		$scope.pageHeight = $scope.pheight + 'px';
		$scope.pageWidth = $scope.pwidth + 'px';
		$scope.pdfWidth = 595;
		$scope.pdfHeight = 595;
		
		$scope.layoutList = [
			'x1', 'x2', 'x3', 'x4', 'x5'
		];
	};
	$scope.cancelUpdater = undefined;
	
	function setUpdateAlbum() {
		if ($scope.cancelUpdater) {
			$scope.cancelUpdater();
		}
		var updateAlbum = $interval(function() {
			if ($scope.$parent.inAlbum) {
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
			$scope.$parent.inAlbum = true;
			var date = new Date();
			var options = {year: 'numeric', month: 'short', day: 'numeric' };
			$scope.current.albumId = id;
			$scope.$parent.showHome = false;
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
			
			$scope.$parent.showAlbums = false;
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
		var layouts = Layouts[lset],
			layout = Misc.randomFromList(layouts),
			page = new PageObject();
		for (var k in layout.frames) {
			var image = {},
				canvas = angular.copy(layout.frames[k]),
				frame = new FrameObject(canvas, image, {}); 
			page.frames.push(frame);
		}
		for (var j in layout.boxes) {
			var textbox = new TextBoxObject(layout.boxes[j].box,layout.boxes[j].font );
			page.textBoxes.push(textbox);
		}
		return page;
	}
		
	function makeRandomAlbum(num) {
		var frontPage = makeRandomPage(
								[$scope.layoutList[0], $scope.layoutList[1]]),
			backPage = makeRandomPage(
								[$scope.layoutList[0], $scope.layoutList[1]]);
		$scope.album.content = [frontPage];
		for (var i = 1; i < num-1; i++) {
			var page = makeRandomPage($scope.layoutList);
			$scope.album.content.push(page);
		}
		$scope.album.content.push(backPage);
		$scope.current.rightPage = $scope.album.content[0];
		$scope.current.pageNum = 0;
		updateView('prev');
	}

	$scope.createCustomAlbum = function(customWidth, customHeight) {
		var width = Math.round(customWidth * 72 / 2.54);
		var height = Math.round(customHeight * 72 / 2.54);
		$scope.createAlbum(width, height);
	};
	$scope.delAlbumRq = function() {
		$scope.delAlbum = true;
		$scope.hideAlbum = true;
		$timeout(function() {
			document.getElementById('notDelAlbum').focus();
		}, 50);
		document.addEventListener('keydown', delAlbumKeyDownHandle, true);
	};
	
	function delAlbumKeyDownHandle(event) {
		if (event.keyCode == 27) {
			$timeout(function() {
				$scope.delAlbum = false;
				$scope.hideAlbum = false;
			});
			document.removeEventListener('keydown', delAlbumKeyDownHandle, true);
		}
	}
	
	$scope.removeAlbum = function(id) {
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
		openRq.onsuccess = function(event) {
			var db = openRq.result;
			var removeRq = db.transaction(['Albums'], 'readwrite')
									.objectStore('Albums')
									.delete(id);
			removeRq.onsuccess = function() {
				for (i = 0; i < $scope.albumSCs.length; i++) {
					if ($scope.albumSCs[i].id == $scope.current.albumId) {
						$scope.albumSCs.splice(i,1);
						break;
					}
				}
				$scope.$apply(function() {
					$scope.current.albumId = null;
					$scope.$parent.inAlbum = false;
					if ($scope.albumSCs.length > 0) {
						$scope.$parent.showAlbums = true;
					}
					$scope.$parent.showHome = true;
					$scope.delAlbum = false;
					$scope.hideAlbum = false;
				});
			};
			removeRq.onerror = function() {
				console.log('failed to remove album', id);
				$scope.delAlbum = false;
				$scope.hideAlbum = false;
			};
				
		};
		openRq.onerror = function() {
			console.log('failed to open DB to removing album');
			$scope.delAlbum = false;
		};
	};

	$scope.alertKeydown = function(event) {
		if (event.keyCode == 37) {
			document.getElementById('delAlbum').focus();
		}
		if  (event.keyCode == 39) {
			document.getElementById('notDelAlbum').focus();
		}
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
						$scope.$parent.inAlbum = true;
						$scope.$parent.showHome = false;
						$scope.$parent.showAlbums = false;
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

		color = modelPage.background || undefined;
		pattern.URL72 = modelPage.patternURL || undefined;
		pattern.URL300 = modelPage.patternURL300 || undefined;
		pattern.width = modelPage.patternWidth || undefined;
		pattern.width = modelPage.patternHeight || undefined;
		
		var page1 = makeRandomPage($scope.layoutList);
		page1.background = color
		page1.patternURL = pattern.URL72;
		page1.patternURL300 = pattern.URL300;
		page1.patternWidth = pattern.width;
		page1.patternHeight = pattern.height;
		page1.patternSize = Math.floor(pattern.width / $scope.pdfWidth * 100) + '%' || undefined;
// 		
		var page2 = makeRandomPage($scope.layoutList);
		page2.background = color;
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
	
	
	
	
	$scope.removePage = function() {
		if ($scope.current.pageNum == 0 || 
			$scope.current.pageNum == $scope.album.content.length) {
			var msg = gettextCatalog.getString('Cannot remove cover page!');
			var div = document.createElement('div');
			div.setAttribute('class', 'alert');
			div.innerHTML = msg;
// 			div.style.width = screen.width/4 + 'px';
// 			div.style.top = screen.width/12 + 'px';
// 			div.style.left = screen.width/4 + 'px';
			document.body.appendChild(div);
			$timeout(function() {
				document.body.removeChild(div);
			}, 2000);
		} else {
			$scope.album.content.splice($scope.current.pageNum -1, 2);
			$scope.current.pageNum -= 2;
			$scope.current.rightPage = $scope.album.content[$scope.current.pageNum];
			if ($scope.current.pageNum > 0) {
				$scope.current.leftPage = $scope.album.content[$scope.current.pageNum - 1];
			}
			updateView('next');
		}
	};
	
	function updateView(dir) {
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
			$timeout(function() {
				if (dir == 'next') {
					activate('leftPage');
				} else {
					activate('rightPage');
				}
			}, 50);
		}
		$scope.current.onEditText = false;
		$scope.current.onEditImage = false;
	};
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
			$scope.$parent.inAlbum = false;
			$scope.$parent.showHome = true;
			$scope.$parent.showAlbums = true;
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

app.controller('PreviewController', ['$scope', '$q', '$timeout', 'ImgService',
					function($scope, $q, $timeout, ImgService) {
	
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
 		$scope.$parent.hideAlbum = true;
		$scope.$parent.previewMode = true;
	};
	
	function drawPage(num) {
		document.getElementById('rightPreview').innerHTML = '';
		document.getElementById('leftPreview').innerHTML = '';
		var content = $scope.album.content;
		if (num != 0) {
			var leftPage = angular.copy(content[num - 1]),
				leftView = document.getElementById('leftPreview');
			showPage(leftPage, leftView);
		}	
		if (num != content.length) {
			var rightPage = angular.copy(content[num]),
				rightView = document.getElementById('rightPreview');
			showPage(rightPage, rightView);
		}
		
		function showPage(page, view) {
			$timeout(function() {
				view.style.backgroundColor = page.background || '#FFFFFF';
				view.style.backgroundImage = 'url("' + page.patternURL + '")';
				view.style.backgroundSize = page.patternSize;
			})
			
			var pwidth = $scope.previewWidth/2,
				pheight = $scope.previewHeight;
			//draw images
			for (var i = 0; i < page.frames.length; i++) {
				function draw(frame) {
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
		$scope.$parent.hideAlbum = false;
		$scope.$parent.previewMode = false;
	};

	function handleKeyDown(event) {
		switch (event.keyCode){
			case 27: //ESC
				$timeout(function() {
					$scope.$parent.hideAlbum = false;
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
			ImgService.drawPage(content[0], canvas, $scope)
			.then(function() {
				var image = canvas.toDataURL('image/jpeg');
				var blob = dataUrlToBlob(image);
				outputImage(blob, pageNum + 1);
			});
		} else if (pageNum == content.length) {
			var canvas = document.createElement('canvas');
			ImgService.drawPage(content[content.length-1], canvas, $scope)
			.then(function() {
				var image = canvas.toDataURL('image/jpeg');
				var blob = dataUrlToBlob(image);
				outputImage(blob, pageNum);
			});
		} else {
			var canvas1 = document.createElement('canvas'),
				canvas2 = document.createElement('canvas');
			
			ImgService.drawPage(content[pageNum-1], canvas1, $scope)
			.then(function() {
				ImgService.drawPage(content[pageNum], canvas2, $scope)
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

app.controller('ExportController', 
					['$scope', '$timeout', 'Misc', '$q', '$http', 'ImgService',
					function($scope, $timeout, Misc, $q, $http, ImgService) {

	var max = Math.max,
		min = Math.min;
	
	function exportKeyDownHandle(event) {
		if (event.keyCode == 27) {
			$timeout(function() {
				$scope.$parent.hideAlbum = false;
				$scope.showExportWindow = false;
				$scope.showExportMenu = false;
			});
			document.removeEventListener('keydown', exportKeyDownHandle, true);
		} 
	};
	
	$scope.exportAlbum = function() {
		$scope.$parent.hideAlbum = true;
		$scope.showLink = false;
		$scope.processingPdf = false;
		$scope.processingJpg = false;
		$scope.showExportWindow = true;
		$scope.showExportMenu = true;
		document.addEventListener('keydown', exportKeyDownHandle, true);
	};
	
		
		
	$scope.closeExportWindow = function() {
		$scope.$parent.hideAlbum = false;
		$scope.showExportWindow = false;
		$scope.showExportMenu = false;
		$scope.processingPdf = false;
		$scope.showJpgLink = false;
		$scope.processingJpg = false;
		document.removeEventListener('keydown', exportKeyDownHandle, true);
	};
	
	$scope.generatePdf = function(resolution) {
		$scope.showExportMenu = false;
		$scope.processingPdf = true;
		var coeff = resolution / 72;
		
		var albumJSON = angular.copy($scope.album.content);
		getFonts()
			.then(function(fontsData) {
				makePdfFromJSON(albumJSON, fontsData);
			}, function(reason) {
				console.log(reason);
			});
			function outputPdf(doc) {
				var stream = doc.pipe(blobStream());
				stream.on('finish', function() {
					var el = document.getElementById('pdfoutput');
					$scope.link = stream.toBlobURL('application/pdf');
					el.setAttribute('href', $scope.link);
					$scope.$apply(function() {
						$scope.processingPdf = false;
						$scope.showLink = true;
					});
				});
			};
	

		
		function getFontNames() {
			var fonts = [];
			for (var i = 0; i < albumJSON.length; i++) {
				var page = albumJSON[i];
				for (var j = 0; j < page.textBoxes.length; j++) {
					var font = page.textBoxes[j].font.family;
					if (!Misc.InList(font, fonts)) {
						fonts.push(font);
					}
				}
			}
			return fonts;
		}
		
		function getFont(font) {
			var deferred = $q.defer();
			var fontSrc = 'static/fonts/' + font + '.ttf';
			$http.get(fontSrc, {responseType: "arraybuffer"})
				.success(function(data) {
					deferred.resolve(data);
				})
				.error(function(data, status) {
					deferred.resolve(null);
					console.log('Failed to retrieve font', status, fontSrc);
				});
			return deferred.promise;
		}
		
		function getFonts() {
			var deferred = $q.defer(),
				fonts = getFontNames(),
				promises = [];
			
			for (var i = 0; i < fonts.length; i++) {
				promises.push(getFont(fonts[i]));
			}
			
			$q.all(promises).then(function(result) {
				var fontsData = {};
				for (var i = 0; i < result.length; i++) {
					if (result[i]) {
						fontsData[fonts[i]] = result[i];
					}
				}
				deferred.resolve(fontsData);
			});
			return deferred.promise;
		}
		
		function makePdfFromJSON(json, fontsData) {
			var pdfWidth = $scope.pdfWidth,
				pdfHeight = $scope.pdfHeight,
				pageRatio = pdfWidth/$scope.pwidth;
			var doc = new PDFDocument({
				size: [pdfWidth, pdfHeight],
				margin: 0
			});
			makeContent();

			function makeContent() {
				var i = 0; //page index
				putNextPage();

				function putNextPage() {
					$scope.processPage = i+1;
					var page = json[i];
					setBGColor(page);
					if (!!page.patternURL) {
						drawPattern(page);
					}
					putObjects();
				
					
					function setBGColor(page) {
						if (!!page.background) {
							doc.rect(0, 0, pdfWidth, pdfHeight);
							doc.fill(page.background);
						}
					}

					function drawPattern(page) {
						var width = page.patternWidth;
						var height = page.patternHeight;
						var repeatX = Math.ceil(pdfWidth / width);
						var repeatY = Math.ceil(pdfHeight / height);
						for (var i = 0; i < repeatX; i++) {
							for (var j = 0; j < repeatY; j++) {
								doc.image(page.patternURL300, i * width, j * height,
											{width: width, height: height});
							}
						}
					}

					function putText(tb) {
						if (!!tb.text) { 
						
							doc.save();
							var centerX = (tb.box.left + tb.box.width / 2) * pdfWidth /100;
							var centerY = (tb.box.top + tb.box.height / 2) * pdfHeight /100;
							doc.rotate(tb.angle, {origin : [centerX, centerY]});
							doc.fontSize(tb.font.size)
								.font(fontsData[tb.font.family])
								.fillColor(tb.font.color);
							var  lineHeight = doc.currentLineHeight();
							var coeff = tb.lineHeight || 1.2;
							var lineGap = coeff * tb.font.size - lineHeight;
							doc.text(tb.text, 
										tb.box.left * pdfWidth/100, 
										tb.box.top * pdfHeight/100, 
									{
										width: tb.box.width * pdfWidth/100,
										height: tb.box.height * pdfHeight/100,
										align: tb.align,
										margin: 0,
										lineGap: lineGap
									});
							
							doc.restore();
						}
					}

					function putImage(frame) {
						var  deferred1 = $q.defer();
						if (!!frame.image.DbId) {
							console.log('frame.image.DbId', frame.image.DbId);
							var id = frame.image.DbId;
							var rq = indexedDB.open('ImagesDB',1);
						
							rq.onsuccess = function() {
								var db = rq.result;
								var trans = db.transaction(['Images']);
								var imageStore = trans.objectStore('Images');
									getRq = imageStore.get(id);
									
								getRq.onsuccess = function(event) {
									var img = event.target.result;
									var display = frame.display,
										r = img.ratio,
										sx = r * display.sx,
										sy = r * display.sy,
										sw = r * display.sw,
										sh = r * display.sh;
									
									//crop image on phantom canvas
									var canvas = document.createElement('canvas'),
										ctx = canvas.getContext('2d'),
										realWidth = pdfWidth * frame.canvas.width / 100;
									if (sw < coeff * realWidth) {
										scale = 1;
									} else {
										scale = coeff * realWidth / sw;
									}
									var imgObj = new Image();
									imgObj.onload = function() {
										canvas.width = scale * sw;
										canvas.height = scale * sh;
										var rsx, rsy, rsw, rsh;
										switch (img.orientation) {
											case 6:
												rsx = sy;
												rsy = max(img.rWidth - sw - sx, 0);
												rsw = min(sh, img.rHeight -sy);
												rsh = min(sw, img.rWidth - rsy);
												ctx.translate(canvas.width, 0);
												ctx.rotate(Math.PI/2);
												ctx.drawImage(imgObj, rsx, rsy, rsw, rsh, 
																	0, 0, canvas.height, canvas.width);
												break;
											case 8:
												rsx = max(img.rHeight - sh -sy, 0);
												rsy = sx;
												rsw = min(sh, img.rHeight - rsx);
												rsh = min(sw, img.rWidth - sx);
												ctx.translate(0, canvas.height);
												ctx.rotate(-Math.PI/2);
												ctx.drawImage(imgObj, rsx, rsy, rsw, rsh,
																0, 0, canvas.height, canvas.width);
												break;
											case 3:
												rsx = max(img.rWidth - sw -sx, 0);
												rsy = max(img.rHeight - sh - sy, 0);
												rsw = min(sw, img.rWidth - rsx);
												rsh = min(sh, img.rHeight - rsy);
												ctx.translate(canvas.width, canvas.height);
												ctx.rotate(Math.PI);
												ctx.drawImage(imgObj, rsx, rsy, rsw, rsh,
																0, 0, canvas.width, canvas.height);
												break;
											default:
												ctx.drawImage(imgObj, sx, sy, sw, sh, 
															0, 0, canvas.width, canvas.height);
												break;
										}
										var outputImg = canvas.toDataURL('image/jpeg', 1.0);
										var width = frame.canvas.width * pdfWidth / 100,
											height = frame.canvas.height * pdfHeight / 100,
											left = frame.canvas.left * pdfWidth /100,
											top = frame.canvas.top * pdfHeight /100
										var centerX = left + width / 2;
										var centerY =  top + height / 2;
										doc.save();
										doc.rotate(frame.angle, {origin : [centerX, centerY]});
										
										if (frame.border.color && frame.border.thickness) {
											var thickness = frame.border.thickness * pdfWidth / $scope.pwidth;
											doc.rect( left - thickness/2, top - thickness/2,
														width + thickness, height + thickness)
												.lineWidth(thickness)
												.stroke(frame.border.color);
										}
										doc.image(outputImg, left, top,
														{
															width: width,
															height: height
														});
 										doc.restore();
										deferred1.resolve(null);
									}
									imgObj.src = img.src;
								};
								getRq.onerror = function() {
										console.log('get image error', id);
										deferred1.resolve(null);
								};
							};
							rq.onerror = function() {
								console.log('cannot open DB');
								deferred1.resolve(null);
							};
						}
						else {
							deferred1.resolve(null);
						}
						return deferred1.promise;
					}
					

					function  putObjects() {
						var objList = angular.copy(page.frames);
						objList = objList.concat(angular.copy(page.textBoxes));
						if (objList.length > 0) {
							Misc.sortObjList(objList, 'layer');
							var n = 0;
							function putNextObject() {
								var obj = objList[n];
 
								if ('image' in obj) {
									putImage(obj).then(function() {
										n++;
										if (n < objList.length) {
											putNextObject();
										} else {
											i++;
											if (i < json.length) {
												doc.addPage();
												putNextPage();
											} else {
												doc.end();
												outputPdf(doc);
											}
										}
									});
								}
								if ('box' in obj) {
									putText(obj);
									n++;
									if (n < objList.length) {
										putNextObject();
									} else {
										i++;
										if (i < json.length) {
											doc.addPage();
											putNextPage();
										} else {
											doc.end();
											outputPdf(doc);
										}
									}
								}
							
							};
							putNextObject();
						}
						else {
							i++;
							if (i < json.length) {
									doc.addPage();
									putNextPage();
							} else {
								doc.end();
								$scope.process = 'finished';
								outputPdf(doc);
							}
						}
					}
				}
			}
		}
	};

	$scope.generateJpg = function() {
		$scope.showExportMenu = false;
		$scope.processingJpg = true;
		var result = {};
		makeJpg().then(function(res) {
			var output = document.createElement('div');
			var zip = new JSZip();
			var jpgZip = zip.folder('images');
			for (num in result) {
				var fileName = $scope.album.title + '_p' + (parseInt(num) + 1) + '.jpg ';
				var b64content = result[num].replace('data:image/jpeg;base64,', '');
				jpgZip.file(fileName, b64content, {base64: true});
			}
			var content = jpgZip.generate({type: 'blob'});
			saveAs(content, "example.zip");
			$scope.processingJpg = false;
			$scope.showJpgLink = true;
			document.getElementById('exportJpgAlbum').appendChild(output);
		});
		
		function makeJpg() {
			var deferred = $q.defer(),
					promises = [];
			var album = angular.copy($scope.album.content);
			for (var i = 0; i < album.length; i++) {
				promises.push(drawPage(album[i], i));
			}
			$q.all(promises).then(function(res) {
				deferred.resolve(res);
			});
			return deferred.promise;
		}
		
		function drawPage(page, num) {
			var deferred = $q.defer();
			var pageCanvas = document.createElement('canvas');
			
			ImgService.drawPage(page, pageCanvas, $scope).then(function() {
				var image = pageCanvas.toDataURL('image/jpeg');
				result[num] = image;
				deferred.resolve();
			});
			return deferred.promise;
		}
	};
	
	
}]);


