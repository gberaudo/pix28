app.factory('exportService', ['$q', 'fontService', 'Misc',
				function($q, fontService, Misc) {
	function exportPdf(albumJSON, pdfHeight, pdfWidth, ratio, resolution, communication) {
		var coeff = resolution/72.0;
		var deferred = $q.defer();
		var doc = new PDFDocument(
			{
				size: [pdfWidth, pdfHeight],
				margin: 0
			}
		);
		var fontData = {};
		
		getFonts(fontData)
		.then(function() {
			makePdf();
		}).then(function() {
			outputPdf(doc);
		});
		return deferred.promise;
		
		function getFontNames() {
			var fontNames = [];
			albumJSON.forEach(function(page) {
				page.textBoxes.forEach(function(textBox){
					var font = textBox.font.family;
					if (!Misc.InList(font, fontNames)) {
						fontNames.push(font);
					}
				});
			});
			return fontNames;
		}
		
		function getFonts(fontData) { //stock font data in this object fontData
			var promises = [];
			getFontNames().forEach( function(name) {
				if (!(name in fontData)) { //check if the font is already in Fontdata
					promises.push(fontService.getFont(name)
						.then(function(result) {
							fontData[name] = result;
						})
					);
				}
			});
			return $q.all(promises);
		}
		
		function outputPdf(doc) {
			var stream = doc.pipe(blobStream());
			stream.on('finish', function() {
				deferred.resolve(stream.toBlobURL('application/pdf'));
			});
		};

		function makePdf(fontData) {
			var tasks = [];
			albumJSON.forEach(function(page) {
				var task = (function(thePage) {
					return function() {
						return makePage(thePage);
					}
				})(page);
				tasks.push(task);
			});
			tasks.push(function() {
				doc.end();
			});
			return Misc.syncTask(tasks);
		}

		function makePage(page) {
			doc.addPage();
			drawBackground(page);
			return $q.when(drawPattern(page))
			.then(function() {
				return drawObjects(page);
			});
		}
		function drawObjects(page) {
			var objList = angular.copy(page.frames);
			objList = objList.concat(angular.copy(page.textBoxes));
			Misc.sortObjList(objList, 'layer');
			var tasks = [];
			var task;
			objList.forEach(function(obj) {
				if ('text' in obj) {
					task = (function(theObj) {
						return function() {
							return drawText(theObj);
						};
					})(obj);
					tasks.push(task);
				}
				if ('image' in obj) {
					task = (function(theObj) {
						return function() {
							return drawImage(theObj);
						};
					})(obj);
					tasks.push(task);
				}
			});
			
			return Misc.syncTask(tasks);
		}

		function drawBackground(page) {
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

		function drawText(tb) {
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

		function drawImage(frame) {
			var  deferred1 = $q.defer();
			if (!!frame.image.DbId) {
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
	
	}
	
	return {
		exportPdf: exportPdf
	}
}]);