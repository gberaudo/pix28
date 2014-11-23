app.controller('AlbumController',
    ['$scope', '$timeout', '$http', '$element', '$q', 'PageObject', 
	 'DBServices', 'Misc', 'gettextCatalog', 'Layouts', 'FrameObject', 'TextBoxObject',
    function($scope, $timeout, $http, $element, $q, PageObject, 
		DBServices, Misc, gettextCatalog, Layouts, FrameObject, TextBoxObject
	) {
	
	init();
	
	DBServices.initImageDB();
	setInterval(function() {
			var id = $scope.current.albumId;
			if (id) {
				DBServices.updateAlbumDB(
					$scope.album.content, id,
					$scope.album.title, $scope.album.description,
					$scope.album.date
				);
			}
	}, 10000);
	$scope.guideMode = true;
	
	function init() {
		$scope.album = {};
		$scope.current = {//store the current status
			mouseIsUp: true, 
			mousePos: {}, 
			pageNum: -1,
			font: {size: '12px', family: 'UVNTinTuc_R'},
			imgLoad: false
		}; 
		$scope.show = {};

		var albumEl = document.getElementById('album');
		albumEl.style.height =  0.52*albumEl.offsetWidth + 'px';
		albumEl.style.top = 0.085*$scope.screenWidth + 'px';
		$scope.pheight = $scope.pwidth = 0.3 * albumEl.offsetWidth;
		$scope.pageHeight = $scope.pheight + 'px';
		$scope.pageWidth = $scope.pwidth + 'px';
		
		$scope.layoutList = [
			'x1', 'x2', 'x3', 'x4', 'x5'
		];
		
	};
	
	
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
			$scope.$parent.greeting = false;
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
		$timeout(function() {
			document.getElementById('notDelAlbum').focus();
		}, 200);
	};
	
	$scope.removeAlbum = function(id) {
		console.log('remove album');
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
					$scope.$parent.showAlbums = true;
					$scope.delAlbum = false;
				});
			};
			removeRq.onerror = function() {
				console.log('failed to remove album', id);
				$scope.delAlbum = false;
			};
				
		};
		openRq.onerror = function() {
			console.log('failed to open DB to removing album');
			$scope.delAlbum = false;
		};
	};

	$scope.alertKeydown = function(event) {
		console.log('key down');
		if (event.keyCode == 27) {
			$scope.delAlbum = false;
		}
		if (event.keyCode == 37) {
			document.getElementById('delAlbum').focus();
		}
		if  (event.keyCode == 39) {
			document.getElementById('notDelAlbum').focus();
		}
	}
		
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
						$scope.$parent.greeting = false;
						$scope.$parent.showAlbums = false;
						$scope.current.pageNum = 0;
						$scope.current.albumId = id;
						$scope.imgLoad = false;
						$timeout(function() {
							$scope.imgLoad = true;
						}, 20);
						updateView('prev');
					});
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
			$scope.current.pageNum,0, 
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
	
// 	$scope.goFirstPage = function() {
// 		$scope.current.pageNum = 0;
// 		$scope.current.rightPage = $scope.album.content[0];
// 		updateView();
// 	};
// 	
// 	$scope.goLastPage = function() {
// 		$scope.current.leftPage = $scope.album.content[$scope.album.content.length];
// 		$scope.current.pageNum = $scope.album.content.length;
// 		updateView();
// 	};
	
	
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


	$scope.mouseUp = function(evt) {
		$scope.current.mouseIsUp = true;
		$scope.current.cursor = 'auto';
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
	
	function max(a, b) {
		return a > b ? a : b;
	};

	function min(a, b) {
		return a > b ? b : a;
	};
	/*----------------Generate Pdf--------------------------------*/

	$scope.generatePdf = function() {
		$scope.processing = true;
		$scope.showLink = false;
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
				for (j = 0; j < page.textBoxes.length; j++) {
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
			
			for (i = 0; i < fonts.length; i++) {
				promises.push(getFont(fonts[i]));
			}
			
			$q.all(promises).then(function(result) {
				var fontsData = {};
				for (i = 0; i < result.length; i++) {
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
				ratio = pdfWidth/$scope.pwidth;
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
						for (t = 0; t < page.textBoxes.length; t++) {
							var tb = page.textBoxes[t];
							if (!tb.text) { 
								continue;
							}
							console.log('ratio',ratio);
							var color = Misc.RGBtoHex(tb.font.color);
							doc.fontSize(parseFloat(tb.font.size)*ratio)
								.font(fontsData[tb.font.family])
								.fillColor(color)
								.text(tb.text, 
										ratio * tb.box.left * $scope.pwidth/100, //to be calculated
										ratio * tb.box.top * $scope.pheight/100, //to be calculated
									{
										width: ratio * tb.box.width * $scope.pwidth/100,
										align: tb.align,
										margin: 0,
// 										lineGap: 20
// 										0.5*ratio*parseFloat(tb.font.size)
									});
						}
					}
				}
				
				function putNextPage() {
					$timeout(function() {
						$scope.processPage = i+1;
					},2);
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
									scale = 0.2; //to be calculated
								var imgObj = new Image();
								imgObj.onload = function() {
									canvas.width = scale * sw;
									canvas.height = scale * sh;
									var rsx, rsy, rsw, rsh;
									switch (img.orientation) {
										case 6:
											rsx = sy;
											rsy = max(img.rHeight - sw - sx, 0);
											rsw = min(sh, img.rWidth -rsx);
											rsh = min(sw, img.rHeight-rsy);
											ctx.translate(canvas.width, 0);
											ctx.rotate(Math.PI/2);
											ctx.drawImage(imgObj, rsx, rsy, rsw, rsh, 
																0, 0, canvas.height, canvas.width);
											break;
										case 8:
											rsx = max(img.rWidth - sh -sy, 0);
											rsy = sx;
											rsw = min(sh, img.rWidth - rsx);
											rsh = min(sw, img.rHeight - rsy);
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
									var outputImg = canvas.toDataURL();
									doc.image(outputImg, ratio*frame.canvas.left*$scope.pwidth/100, 
													ratio*frame.canvas.top*$scope.pheight/100,
													{width: display.dw*ratio});
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


