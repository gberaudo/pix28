var app = angular.module('albumApp',[]);

app.controller('AlbumController', function(
	$scope, $timeout, $http, $element, $q, PageObject, DBServices, Misc
) {
	
	init();
	DBServices.initAlbumDB($scope);
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
	}, 5000);
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
		$scope.albumSCs = [];
		$scope.show = {};
		$scope.pageWidth = '300px';
		$scope.pwidth = 300;
		$scope.pageHeight = '300px';
		$scope.pheight = 300;
		$scope.usedFonts = [];
		

	};
	
	
	/*------------Album control----------------------------*/
	$scope.createAlbum = function() {
		if (!!$scope.current.albumId) {
				$scope.currentAlbumSC.title = $scope.album.title || $scope.album.date;
				$scope.currentAlbumSC.description = $scope.album.description;
				$scope.currentAlbumSC.date = $scope.album.date;
		}
		DBServices.addAlbum().then(function(id) {
			$scope.current.albumId = id;
			$scope.$parent.greeting = false;
			$scope.album.content = []; 
 			$scope.album.title = '';
 			$scope.album.description = '';
			var date = new Date();
			$scope.album.date = date.toDateString();
			$scope.inAlbum = true;
			$scope.showAlbums = false;
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
			addCoverPages();
			$timeout(function() {
				document.getElementById('titleInput').focus();
			}, 200);
		});
	};
	

		
// 	$scope.showAlbumList = function() {
// 		$scope.currentAlbumSC.title = $scope.album.title || $scope.album.date;
// 		console.log($scope.album.title);
// 		$scope.currentAlbumSC.description = $scope.album.description;
// 		$timeout(function() {
// 			console.log('show albums');
// 			$scope.$parent.greeting = false;
// 			$scope.showAlbums = true;
// 		}, 20);
// 	};
	
	
	$scope.removeAlbum = function(id, index) {
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
		openRq.onsuccess = function(event) {
			var db = openRq.result;
			var removeRq = db.transaction(['Albums'], 'readwrite')
									.objectStore('Albums')
									.delete(id);
			removeRq.onsuccess = function() {
				$scope.$apply(function() {
					$scope.albumSCs.splice(index,1);
				});
			};
			removeRq.onerror = function() {
				console.log('failed to remove album', id);
			};
		};
		openRq.onerror = function() {
			console.log('failed to open DB to removing album');
		};
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
						$scope.inAlbum = true;
						$scope.$parent.greeting = false;
						$scope.showAlbums = false;
						$scope.current.pageNum = 0;
						$scope.current.albumId = id;
						$scope.imgLoad = true;
						updateView();
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
	
	function addCoverPages() {
		$scope.current.rightPage = new PageObject();
		var backPage = new PageObject();
		$scope.current.pageNum = 0;
		$scope.album.content = [$scope.current.rightPage, backPage];
		updateView();
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
		updateView();
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
		updateView();
	};

	$scope.nextPage = function() { //show next page and update pageNum
		$scope.current.pageNum += 2;
		if ($scope.current.pageNum <= $scope.album.content.length - 1) {
			$scope.current.rightPage = $scope.album.content[$scope.current.pageNum];
		}
		$scope.current.leftPage =  $scope.album.content[$scope.current.pageNum - 1];
		updateView();
	};

	$scope.removePage = function() {
		if ($scope.current.pageNum == 0) {
			alert('Cannot remove cover page. Clear all images instead.');
		} else {
			$scope.album.content.splice($scope.current.pageNum -1, 2);
			$scope.current.pageNum -= 2;
			$scope.current.rightPage = $scope.album.content[$scope.current.pageNum];
			if ($scope.current.pageNum > 0) {
				$scope.current.leftPage = $scope.album.content[$scope.current.pageNum - 1];
			}
			updateView();
		}
	};
	
	$scope.goFirstPage = function() {
		$scope.current.pageNum = 0;
		$scope.current.rightPage = $scope.album.content[0];
		updateView();
	};
	
	$scope.goLastPage = function() {
		$scope.current.leftPage = $scope.album.content[$scope.album.content.length];
		$scope.current.pageNum = $scope.album.content.length;
		updateView();
	};
	
	
	function updateView() {
		if ($scope.current.pageNum == 0) {
			$scope.show.leftPage = false;
			$scope.show.rightPage = true;
			$timeout(function() {
				activate('rightPage');
			}, 200); //wait the page to load before focusing
		} else if ($scope.current.pageNum == $scope.album.content.length) {
			$scope.show.rightPage = false;
			$scope.show.leftPage = true;
			$timeout(function() {
				activate('leftPage');
			}, 200);
		} else {
			$scope.show.leftPage = $scope.show.rightPage = true;
			$timeout(function() {
				activate('leftPage');
			}, 200);
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
		$scope.inAlbum = false;
		$scope.newAlbum = true;
		$scope.showAlbums = true;
 	};
	/*---------------- Mouse control-------------------------------*/


	$scope.mouseUp = function(evt) {
		$scope.current.mouseIsUp = true;
		$scope.current.cursor = 'auto';
	};
	
	$scope.mouseIsInRect = function(mouse, rect) {
		return (
			(mouse.X > rect.left) &&
			(mouse.X < rect.right) &&
			(mouse.Y > rect.top) &&
			(mouse.Y < rect.bot)
		);
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
		console.log('generating pdf');
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
					console.log('pdf ouput');
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
			var doc = new PDFDocument({
				size: [600, 600],
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
							var color = Misc.RGBtoHex(tb.font.color);
							doc.fontSize(parseInt(tb.font.size)*2)
								.font(fontsData[tb.font.family])
								.fillColor(color)
								.text(tb.text, 
										tb.box.left*2, //to be calculated
										tb.box.top*2, //to be calculated
									{
										width: tb.box.width*2,
										align: tb.align,
										margin: 0
									});
						}
					}
				}
				
				function putNextPage() {
					$timeout(function() {
						$scope.exportProcess = 'processing page ' + (i+1);
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
						doc.rect(0, 0, 600, 600);
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
											ctx.translate(canvas.with, canvas.height);
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
									doc.image(outputImg, frame.canvas.left*2, 
													frame.canvas.top*2,
													{width: display.dw*2});
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
	
});


