app.factory('exportService', ['$q', 'fontService', 'Misc',
				function($q, fontService, Misc) {
	function exportPdf(albumJSON, pdfHeight, pdfWidth, ratio, resolution, communication) {
		var coeff = resolution/72.0;
		var deferred = $q.defer();
		getFonts(albumJSON)
		.then(function(fontData) {
			makePdf(fontData); 
		}, function(reason) {
			console.log(reason);
		});
		return deferred.promise;
		
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
		
		function getFonts() {
			var deferred = $q.defer(),
				fonts = getFontNames(),
				promises = [];
			
			for (var i = 0; i < fonts.length; i++) {
				promises.push(fontService.getFont(fonts[i]));
			}
			
			$q.all(promises).then(function(result) {
				var fontData = {};
				for (var i = 0; i < result.length; i++) {
					if (result[i]) {
						fontData[fonts[i]] = result[i];
					}
				}
				deferred.resolve(fontData);
			});
			return deferred.promise;
		}
		
		function outputPdf(doc) {
			var stream = doc.pipe(blobStream());
			stream.on('finish', function() {
				deferred.resolve(stream.toBlobURL('application/pdf'));
			});
		};
		
		function makePdf(fontData) {
			var doc = new PDFDocument({
				size: [pdfWidth, pdfHeight],
				margin: 0
			});
			makeContent();

			function makeContent() {
				var i = 0; //page index
				putNextPage();

				function putNextPage() {
					communication.page = i+1;
					var page = albumJSON[i];
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
								.font(fontData[tb.font.family])
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
												rsy = Math.max(img.rWidth - sw - sx, 0);
												rsw = Math.min(sh, img.rHeight -sy);
												rsh = Math.min(sw, img.rWidth - rsy);
												ctx.translate(canvas.width, 0);
												ctx.rotate(Math.PI/2);
												ctx.drawImage(imgObj, rsx, rsy, rsw, rsh, 
																	0, 0, canvas.height, canvas.width);
												break;
											case 8:
												rsx = Math.max(img.rHeight - sh -sy, 0);
												rsy = sx;
												rsw = Math.min(sh, img.rHeight - rsx);
												rsh = Math.min(sw, img.rWidth - sx);
												ctx.translate(0, canvas.height);
												ctx.rotate(-Math.PI/2);
												ctx.drawImage(imgObj, rsx, rsy, rsw, rsh,
																0, 0, canvas.height, canvas.width);
												break;
											case 3:
												rsx = Math.max(img.rWidth - sw -sx, 0);
												rsy = Math.max(img.rHeight - sh - sy, 0);
												rsw = Math.min(sw, img.rWidth - rsx);
												rsh = Math.min(sh, img.rHeight - rsy);
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
											var thickness = frame.border.thickness * ratio;
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
											if (i < albumJSON.length) {
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
										if (i < albumJSON.length) {
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
							if (i < albumJSON.length) {
									doc.addPage();
									putNextPage();
							} else {
								doc.end();
// 								$scope.process = 'finished';
								outputPdf(doc);
							}
						}
					}
				}
			}
		}
		
		
	}
	
	return {
		exportPdf: exportPdf
	}
}]);