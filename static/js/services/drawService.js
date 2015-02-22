app.service('drawService', ['$q', 'Misc',
				function($q, Misc) {
	this.drawPage = function(page, canvas, scope) {
		var ctx = canvas.getContext('2d');
		setCanvasDim();
		drawBackground();
		return drawPattern()
		.then(function() {
			return drawObjects();
		});

		function setCanvasDim() {
			if (scope.measure.pwidth > scope.measure.pheight) {
				canvas.width = 800;
				canvas.height = canvas.width * scope.measure.pheight/scope.measure.pwidth;
			} else {
				canvas.height = 800;
				canvas.width = canvas.height * scope.measure.pwidth/scope.measure.pheight;
			}
		}

		function drawBackground() {
			ctx.fillStyle = page.background || '#FFFFFF';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		function drawPattern() {
			var deferred1 = $q.defer();
			if (!!page.patternURL) {
				var tempCanvas = document.createElement('canvas');
				tempCtx = tempCanvas.getContext('2d');
				var img = new Image();
				var patternSize = parseFloat(page.patternSize) * canvas.width /100;
				img.src = page.patternURL;
				img.onload = function() {
					tempCanvas.width = patternSize;
					tempCanvas.height = img.naturalHeight/img.naturalWidth * patternSize;
					tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
					var patImg = new Image();
					patImg.src = tempCanvas.toDataURL();
					patImg.onload = function() {
						var pat = ctx.createPattern(patImg,"repeat");
						ctx.rect(0,0,canvas.width, canvas.height);
						ctx.fillStyle = pat;
						ctx.fill();
						deferred1.resolve(null);
					};
				};
			} else {
				deferred1.resolve(null);
			}
			return deferred1.promise;
		}


		function drawObjects() {
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


		function drawImage(frame) {
			var deferred2 = $q.defer();
			if (!!frame.image.src) {
				var img = new Image();
				var display = frame.display;
				var top = frame.canvas.top * canvas.height / 100,
					left = frame.canvas.left * canvas.width / 100,
					width = frame.canvas.width * canvas.width / 100,
					height = frame.canvas.height * canvas.height /100;
				var centerX = left + width / 2,
						centerY = top + height / 2;


				img.onload = function() {
					ctx.save();
					ctx.translate(centerX, centerY);
					ctx.rotate(frame.angle * Math.PI / 180);
					if (frame.border.thickness && frame.border.color) {
						var thickness = frame.border.thickness * canvas.width / scope.measure.pwidth;
						ctx.lineWidth = thickness;
						ctx.strokeStyle = frame.border.color;
						ctx.strokeRect(-(width + thickness)/2, -(height + thickness) / 2,
							width + thickness, height + thickness);
					}
					ctx.drawImage(img, display.sx, display.sy, display.sw, display.sh,
									-width/2, -height/2, width, height);
					ctx.restore();
					deferred2.resolve(null);
				};
				img.src = frame.image.src;

			}
			else {
				deferred2.resolve(null);
			}
			return deferred2.promise;
		}

		function drawText(textBox) {
			if (!!textBox.text) {
				var left = textBox.box.left * canvas.width / 100,
					top = textBox.box.top * canvas.height / 100,
					width = textBox.box.width * canvas.width / 100,
					height = textBox.box.height * canvas.height / 100;

				var fontSize = textBox.font.size * canvas.width / scope.measure.pdfWidth,
					color = textBox.font.color,
					fontName = textBox.font.family,
					lineHeight = 1.2 * fontSize;
				ctx.save();

				var centerX = left + width / 2,
					centerY = top + height / 2;

				ctx.translate(centerX, centerY);
				ctx.rotate(textBox.angle * Math.PI / 180);
				ctx.translate(-width/2, -height/2);
				ctx.font = fontSize + 'px ' + fontName;
				ctx.fillStyle = color;
				wrapText(ctx, textBox.text, 0, 1.2 * fontSize,
							width, lineHeight, textBox.align);
				ctx.restore();
			}

			function wrapText(context, text, x, y, maxWidth, lineHeight) {
				var paragraphs = text.split('\n');
				for (var j = 0; j< paragraphs.length; j++) {
					var paragraph = paragraphs[j];

					var words = paragraph.split(' ');
					var line = '';
					var lineWidth;

					for(var n = 0; n < words.length; n++) {
						var testLine = line + ' ' + words[n];
						var metrics = context.measureText(testLine);
						var testWidth = metrics.width;

						if (testWidth > maxWidth && n > 0) {
							lineWidth = context.measureText(line).width;
							fillTextAlign(line, lineWidth, x, y, textBox.align);
							line = words[n];
							y += lineHeight;
						}
						else {
							line = testLine;
						}
					}
					lineWidth = context.measureText(line).width;
					fillTextAlign(line, lineWidth, x, y, textBox.align);
					y += lineHeight;
				}

				function fillTextAlign(line, lineWidth, x, y, align) {
					var startX;
					switch (align) {
						case 'right':
							startX = maxWidth - lineWidth;
							break;
						case 'left':
							startX = x;
							break;
						case 'center':
							startX = (maxWidth - lineWidth) / 2;
							break;
					}
					context.fillText(line, startX, y);
				}
			}
		}

		function drawWatermark() {
			ctx.save();
			ctx.globalAlpha=.20;
			ctx.translate(50, 100);
			ctx.rotate(-Math.PI / 6);
			ctx.font = '40px Times';
			ctx.fillStyle = '#FFFFFF';
			ctx.fillText('LibreAlbum', 30, 50);
			ctx.fillStyle = '#000000';
			ctx.fillText('LibreAlbum', 33, 53);
			ctx.restore();
		};
	};

}]);