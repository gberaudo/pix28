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
		albumEl.style.height =  0.52*albumEl.offsetWidth + 'px';
		$scope.pheight = $scope.pwidth = Math.floor(0.3 * albumEl.offsetWidth);
		$scope.pageHeight = $scope.pheight + 'px';
		$scope.pageWidth = $scope.pwidth + 'px';
		$scope.pdfWidth = 595;
		$scope.pdfHeight = 595;
		$scope.pageRatio = $scope.pdfWidth/$scope.pwidth;
		
		$scope.layoutList = [
			'x1', 'x2', 'x3', 'x4', 'x5'
		];
	};
	
	function setUpdateAlbum() {
		var updateAlbum = $interval(function() {
			if ($scope.$parent.inAlbum) {
				DBServices.updateAlbumDB(
					$scope.album.content, $scope.current.albumId,
					$scope.album.title, $scope.album.description,
					$scope.album.date
				);
				console.log('update Album');
			} else {
				$interval.cancel(updateAlbum);
			}
		}, 10000);
	}
	/*------------Album control----------------------------*/
	$scope.createAlbum = function() {
		if (!!$scope.current.albumId) {
				$scope.currentAlbumSC.title = $scope.album.title || $scope.album.date;
				$scope.currentAlbumSC.description = $scope.album.description;
				$scope.currentAlbumSC.date = $scope.album.date;
		}
		DBServices.addAlbum().then(function(id) {
			var date = new Date();
			$scope.current.albumId = id;
			$scope.$parent.showHome = false;
 			$scope.album.title = '';
 			$scope.album.description = '';
			$scope.album.date = date.toDateString();
			makeRandomAlbum(20);
			$scope.$parent.inAlbum = true;
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
				document.getElementById('titleInput').focus();
			}, 200);
			setUpdateAlbum();
		});
	};
	
	function makeRandomAlbum(num) {
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
				var textbox = new TextBoxObject(layout.boxes[j]);
				page.textBoxes.push(textbox);
			}
			return page;
		}
			
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
		$scope.current.leftPage = new PageObject();
		$scope.current.rightPage = new PageObject();
		$scope.current.pageNum += 2;
		 //insert a new page to the album
		$scope.album.content.splice(
			$scope.current.pageNum +1 ,0, 
			$scope.current.leftPage, $scope.current.rightPage
		);
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
	
	
	$scope.previewHeight = Math.floor(0.4 * $scope.screenWidth);
	$scope.previewWidth = 2 * $scope.previewHeight + 1;
	
	$scope.previewPage = function(num) {
		document.addEventListener('keydown', handleKeyDown, true);
		$scope.viewPageNum = num;
		drawPage(num);
 		$scope.hideAlbum = true;
		$scope.previewMode = true;
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
			view.style.backgroundColor = page.background || '#FFFFFF';
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
					canvas.style.transform = 'rotate(' + frame.angle + 'deg)';
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
				div.innerHTML = textBox.text || null;
				div.style.width = textBox.box.width * pwidth / 100 + 'px';
				div.style.height = textBox.box.height * pheight / 100 + 'px';
				div.style.top = (textBox.box.top * pheight / 100 + 4) + 'px';
				div.style.left = textBox.box.left * pwidth / 100 + 'px';
				div.style.fontSize = textBox.font.size * pwidth/$scope.pdfWidth + 'px';
				div.style.fontStyle = textBox.font.style;
				div.style.fontFamily = textBox.font.family;
				div.style.color = textBox.font.color;
				div.style.fontWeight = textBox.font.weight;
				div.style.textAlign = textBox.align;
				div.style.position = 'absolute';
				div.style.transform = 'rotate(' + textBox.angle + 'deg)';
				view.appendChild(div);
			}
			
		}
	}
	
	
	$scope.removePreview = function() {
		document.removeEventListener('keydown', handleKeyDown, true);
		$scope.hideAlbum = false;
		$scope.previewMode = false;
	};

	function handleKeyDown(event) {
		switch (event.keyCode){
			case 27: //ESC
				$timeout(function() {
					$scope.hideAlbum = false;
					$scope.delAlbum = false;
					$scope.previewMode = false;
				});
				document.removeEventListener('keydown', handleKeyDown, true);
				break;
			case 39:
				if ($scope.viewPageNum != $scope.album.content.length) {
					$timeout(function(){
						$scope.previewPage($scope.viewPageNum + 2);
					});
				}
				break;
			case 37:
				if ($scope.viewPageNum != 0) {
					$timeout(function(){
						$scope.previewPage($scope.viewPageNum - 2);
					});
				}
				break;
		}
	}
	
	$scope.removePage = function() {
		if ($scope.current.pageNum == 0 || 
			$scope.current.pageNum == $scope.album.content.length) {
			var msg = gettextCatalog.getString('Cannot remove cover page!');
			var div = document.createElement('div');
			div.setAttribute('class', 'alert');
			div.innerHTML = msg;
			div.style.width = screen.width/4 + 'px';
			div.style.top = screen.width/12 + 'px';
			div.style.left = screen.width/4 + 'px';
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
	
	
	
	$scope.toAlbumList = function() {
		$scope.currentAlbumSC.title = $scope.album.title || $scope.album.date;
		$scope.currentAlbumSC.description = $scope.album.description;
		$scope.$parent.inAlbum = false;
		$scope.newAlbum = true;
		$scope.$parent.showAlbums = true;
 	};
	/*---------------- Mouse control-------------------------------*/


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
	
}]);

app.controller('ExportController', 
					['$scope', '$timeout', 'Misc', '$q', '$http',
					function($scope, $timeout, Misc, $q, $http) {

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
		$scope.showExportWindow = true;
		$scope.showExportMenu = true;
		document.addEventListener('keydown', exportKeyDownHandle, true);
	};
	
		
		
	$scope.closeExportWindow = function() {
		$scope.$parent.hideAlbum = false;
		$scope.showExportWindow = false;
		$scope.showExportMenu = false;
		$scope.processingPdf = false;
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
			var pdfWidth = 720,
				pdfHeight = 720,
				pageRatio = pdfWidth/$scope.pwidth;
			var doc = new PDFDocument({
				size: [pdfWidth, pdfHeight],
				margin: 0
			});
			makeContent();
			

			function makeContent() {
				var i = 0; //page index
				putNextPage();
				
				function putTexts(page) {
					if (page.textBoxes.length > 0) {
						for (var t = 0; t < page.textBoxes.length; t++) {
							var tb = page.textBoxes[t];
							if (!tb.text) { 
								continue;
							}
// 							var color = Misc.RGBtoHex(tb.font.color);
// 							console.log('color', color);
// 							console.log(tb.font);
							var centerX = (tb.box.left + tb.box.width / 2) * pdfWidth /100;
							var centerY = (tb.box.top + tb.box.height / 2) * pdfHeight /100;
							doc.rotate(tb.angle, {origin : [centerX, centerY]});
							doc.fontSize(tb.font.size)
								.font(fontsData[tb.font.family])
								.fillColor(tb.font.color)
								.text(tb.text, 
										tb.box.left * pdfWidth/100, //to be calculated
										tb.box.top * pdfHeight/100 + 1.5*pageRatio, //to be calculated
									{
										width: tb.box.width * pdfWidth/100,
										align: tb.align,
										margin: 0,
										style: 'italic'
									});
							doc.rotate(-tb.angle, {origin : [centerX, centerY]});
						}
					}
				}
				
				function putNextPage() {
					$scope.processPage = i+1;
					var page = json[i];
					setBGColor(page);
					putImages(page)
						.then(function(result) {
							putTexts(page);
							i++;
							if (i < json.length) {
								doc.addPage();
								putNextPage();
							}
							else {
								doc.end();
								$scope.process = 'finished';
								outputPdf(doc);
							}
						});
				}
				
				function setBGColor(page) {
					if (!!page.background) {
						doc.rect(0, 0, pdfWidth, pdfHeight);
						doc.fill(page.background);
					}
				}
				
				function putImages(page) {
					var deferred = $q.defer(),
						promises = [];
					for (var i = 0; i < page.frames.length; i++) {
						promises.push(putImage(page.frames[i]));
					}
					$q.all(promises).then(function(result) {
						deferred.resolve(result);
					});
					return deferred.promise;
				}
				
				function putImage(frame) {
					var  deferred1 = $q.defer(),
						id = frame.image.DbId || null;
					if (!!id) {
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
									realWidth = pageRatio * display.dw;
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
								//	var outputImg = canvas.toDataURL('image/png');
									var centerX = (frame.canvas.left + frame.canvas.width / 2) * pdfWidth /100;
									var centerY = (frame.canvas.top + frame.canvas.height / 2) * pdfHeight /100;
									doc.rotate(frame.angle, {origin : [centerX, centerY]});
									doc.image(outputImg, frame.canvas.left * pdfWidth / 100, 
													frame.canvas.top * pdfHeight/100,
													{
														width: frame.canvas.width * pdfWidth / 100,
														height: frame.canvas.height * pdfHeight / 100
													});
									doc.rotate(-frame.angle, {origin : [centerX, centerY]});
									deferred1.resolve(null);
								}
								imgObj.src = img.src;
							};
							getRq.onerror = function() {
									console.log('get image error', id);
							};
						};
						rq.onerror = function() {
							console.log('cannot open DB');
						};
						return deferred1.promise;
					}
				}
			};
		};
	};
	
}]);


