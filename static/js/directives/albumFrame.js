app.directive('albumFrame', ['$timeout', 'FrameObject',
	 'ImgService', 'Misc', 'DOMService',
	 function($timeout, FrameObject, ImgService, Misc, DOMService) {
	return {
		restrict: 'EA',
		replace: true,
// 		controller: canvasController,
		templateUrl: 'static/partials/albumFrame.html',
		link: function(scope, elem) {
			var display = scope.frame.display;
			var frame = scope.frame;
			var measure = scope.measure;
			var pwidth = measure.pwidth;
			var pheight = measure.pheight;
			var pageRatio = measure.pageRatio;
			var drawImage = ImgService.drawImage;
			var canvas = elem[0];
			var ctx = canvas.getContext('2d');
			initCanvas();

			setFocus();

			
			elem.on('dragover', function(evt) {
				evt.preventDefault();
			});
			elem.on('drop', dropInCanvas);
			elem.on('mousedown', mouseDownHandle);
			elem.on('mousemove', mouseMoveHandle);
			elem.on('keydown', keyDown);

			function mouseDownHandle(evt) {
				var drag = {center: false, TL: false, TR: false, BL: false,
					BR: false, L: false, R: false, T: false, B: false};
				var mouseRtCanvas = DOMService.getRelPos(evt);
				var refs = ImgService.getRefLines();
				var mousePosWatch;
				canvasFocus();
				scope.dragimage = true;
				for (anchor in drag) {
					if (Misc.inRect(mouseRtCanvas, scope.canvasZone[anchor])) {
						drag[anchor] = true;
						scope.dragimage = false;
						break;
					}
				}
				document.addEventListener('mousemove', mouseMoveHandle1, true);
				document.addEventListener('mouseup', mouseUpHandle, true);
				scope.$apply(function() {
					scope.mousePos = {X: evt.pageX, Y: evt.pageY};
				});
				mousePosWatch = scope.$watch('mousePos', function(newValue, oldValue) {
					var offset = {
						X: newValue.X - oldValue.X,
						Y: newValue.Y - oldValue.Y
					};
					for (anchor in drag) {
						if (drag[anchor]){
							var offsetCopy = angular.copy(offset);
							var anchorCopy = angular.copy(anchor);
							window.requestAnimationFrame(function() {
									scope.$apply(function() {
										redimension(scope.rcanvas, offsetCopy, anchorCopy, refs);
									});
									canvas.width = scope.rcanvas.width;
									canvas.height = scope.rcanvas.height;
									canvas.style.left = scope.rcanvas.left + 'px';
									canvas.style.top = scope.rcanvas.top + 'px';
									if (frame.angle % 180 == 0) {
										ImgService.showRefLines(canvas, refs, scope.refLines);
									}
									if (scope.img.src) {
										drawImage(canvas, scope.img, display,
													frame.image.ratio, pageRatio );
									} else {
										ImgService.resetFrame(canvas);
									}
									ImgService.drawAnchors(canvas);
									Misc.resetZone(scope.canvasZone, scope.rcanvas.width, scope.rcanvas.height);
									frame.canvas = Misc.abs2perCent(scope.rcanvas, pwidth, pheight);
								});
					
							
							break;
						}
					}
					if (scope.dragimage) {
						moveImageInCanvas(offset);
					}
				}, true);

				function mouseUpHandle(ev) {
					mousePosWatch();
					for (anchor in drag) {
						drag[anchor] = false;
					}
					scope.dragimage = false;
					document.removeEventListener('mouseup', mouseUpHandle, true);
					document.removeEventListener('mousemove', mouseMoveHandle1, true);
				}
				function mouseMoveHandle1(evt) {
					scope.$apply(function() {
						scope.mousePos = {X: evt.pageX, Y: evt.pageY};
					});
				}
				
			}

			function mouseMoveHandle(evt) {
				var mouseRtCanvas = DOMService.getRelPos(evt);
				scope.$apply(function(){
					Misc.setCursor(mouseRtCanvas, scope.canvasZone, scope.current);
				});
			}
			function setFocus() {
				if (scope.current.datumWithFocus === frame) {
					canvasFocus();
					scope.current.datumWithFocus = undefined;
				}
			}
			function canvasFocus() {
				var border = 'BD_' + frame.border.color;
				scope.$parent.activate();
				DOMService.deactivate('cActive');
				DOMService.deactivate('tActive');
				DOMService.activate(canvas, 'cActive');
				ImgService.drawAnchors(canvas);

				scope.current.onEditText = false;
				scope.current.onEditImage = true;

				document.addEventListener('mousedown', canvasBlurHandle, true);
				scope.current.borderColor = frame.border.color || '';
				scope.current.borderThickness = frame.border.thickness || 0;

				DOMService.markSelectedItem('border', border);
			};

			function initCanvas(){
				scope.rcanvas = Misc.perCent2Abs(frame.canvas, pwidth, pheight);
				var rcanvas = scope.rcanvas;
				canvas.width = rcanvas.width;
				canvas.height = rcanvas.height;
				canvas.style.left = rcanvas.left + 'px';
				canvas.style.top = rcanvas.top + 'px';
				frame.layer = frame.layer || 10;
				frame.angle = frame.angle || 0;
				if (frame.border && frame.border.color && frame.border.thickness) {
					canvas.style.outline = frame.border.thickness + 'px solid '+ frame.border.color;
				}

				scope.canvasZone = {};
				scope.img = new Image();
				Misc.resetZone(scope.canvasZone, canvas.width, canvas.height);
				if (frame.image.src) {
					if (display.sw) {
						scope.img.onload = function() {
							drawImage(canvas, scope.img, display,
										frame.image.ratio, pageRatio);
						};
						scope.img.src = frame.image.src;
					} else {
						scope.img.onload = function() {
							firstDrawImage();
						};
						scope.img.src = frame.image.src;
					}
				} else {
					$timeout(function() {
						ImgService.resetFrame(canvas);
					});
				}
			};
			function redrawImage() {
				drawImage(canvas, scope.img, display, frame.image.ratio, pageRatio);
				ImgService.drawAnchors(canvas);
			};

			function canvasBlurHandle(event) {
				var el = angular.element(event.target);
				if (Misc.ancestorHasClass(el, 8, 'controls') ||
					(el.scope() == scope)
					) {
					return;
				} else {
					DOMService.deactivate('cActive');
					scope.current.onEditImage = false;
					if (!!scope.img.src) {
						drawImage(canvas, scope.img, display, frame.image.ratio, pageRatio);
					} else {
						ImgService.resetFrame(canvas);
					}
					document.removeEventListener('mousedown', canvasBlurHandle, true);
				}
			}

			function redimension(rcanvas, offset, anchor, refs){
				var sChange = {},
					canvasProp = rcanvas.height/rcanvas.width,
					ctop = rcanvas.top,
					cleft = rcanvas.left,
					image = frame.image,
					off,
					minSize = pwidth / 6;
				var angle = frame.angle || 0;

				function getCloseRef(pos, list) {
					list.forEach(function(ref) {
						if (ref - 2 <= pos && pos <= ref + 2) {
							return ref;
						}
					});
					return false;
				}
				var left, right, top, bot;
				switch (anchor) {
					case 'center':
						if (offset.X < -cleft) {
							offset.X = -cleft;
						}
						if (offset.X + cleft + rcanvas.width > pwidth) {
							offset.X = pwidth - cleft - rcanvas.width;
						}
						if (offset.Y < -ctop) {
							offset.Y = -ctop;
						}
						if (offset.Y + ctop + rcanvas.height > pheight) {
							offset.Y = pheight - ctop - rcanvas.height;
						}
						left = getCloseRef(cleft + offset.X, refs.horizontal);
						top = getCloseRef(ctop + offset.Y, refs.vertical);
						right = getCloseRef(cleft + offset.X + rcanvas.width, refs.horizontal);
						bot = getCloseRef(ctop + offset.Y + rcanvas.height, refs.vertical);
						//stick border of canvas to a close border

						if (left) {
							rcanvas.left = left;
						} else if (right) {
							rcanvas.left = right - rcanvas.width;
						} else {
							rcanvas.left = cleft + offset.X;
						}

						if (top) {
							rcanvas.top = top;
						} else if (bot) {
							rcanvas.top = bot - rcanvas.height;
						} else {
							rcanvas.top = ctop + offset.Y;
						}
						break;

					case 'L':
						off = Math.floor(Math.cos(Math.PI * angle / 180) * offset.X
								+ Math.sin(Math.PI * angle / 180) * offset.Y);
						if (off > rcanvas.width - minSize) {
							off = rcanvas.width - minSize;
						}

						if (off < -cleft) {
							off = -cleft;
						}
						left = getCloseRef(cleft + off, refs.horizontal);
						if (left) {
							off = left - cleft;
						}
						sChange.X = off * display.sw / rcanvas.width;

						if (sChange.X < -display.sx) {
							if (display.sw - sChange.X > image.mWidth) {
								var sRes = display.sw - sChange.X - image.mWidth;
								var dr = sRes/image.mWidth;
								scaleRatio = image.mWidth / (rcanvas.width - off);
								display.sy = display.sy + display.sh * dr/2;
								display.sh -=  display.sh * dr;
								display.sx = 0;
								display.sw = image.mWidth;
							} else {
								display.sx = 0;
								display.sw = Math.min(display.sw - sChange.X, image.mWidth);
							}
						}
						else {
							display.sx += sChange.X;
							display.sw = Math.min(display.sw - sChange.X, image.mWidth - display.sx);
						}
						rcanvas.left = cleft + off;
						rcanvas.width -= off;
						break;

					case 'R':

						off = Math.floor(Math.cos(Math.PI * angle / 180) * offset.X
								+ Math.sin(Math.PI * angle / 180) * offset.Y);

						//enlarge image when limit attained
						if (off < -rcanvas.width + minSize) {
							off = -rcanvas.width + minSize;
						}
						if (off + rcanvas.width + cleft > pwidth) {
							off = pwidth - rcanvas.width - cleft;
						}
						right = getCloseRef(cleft + off + rcanvas.width, refs.horizontal);
						if(!!right) {
							off = right - cleft - rcanvas.width;
						}

						sChange.X = off * display.sw/rcanvas.width;

						if (display.sw + display.sx + sChange.X > image.mWidth) {
							sChange.X1 = image.mWidth - display.sw - display.sx;
							if (sChange.X - sChange.X1 > display.sx) {
								var sRes = sChange.X - sChange.X1 - display.sx;
								var dr = sRes/image.mWidth;
								display.sy = display.sy + display.sh * dr/2;
								display.sh -=  display.sh * dr;
								display.sx = 0;
								display.sw = image.mWidth;
							} else {
								sChange.X2 = sChange.X - sChange.X1;
								display.sx -= sChange.X2;
								display.sw += sChange.X;
							}
						}
						else {
							display.sw = Math.min(display.sw + sChange.X, image.mWidth - display.sx);
						}
						rcanvas.width += off;
						break;

					case 'T':
						off = Math.floor(-Math.sin(Math.PI * angle / 180) * offset.X
								+ Math.cos(Math.PI * angle / 180) * offset.Y);
						if (off > rcanvas.height - minSize) {
							off = rcanvas.height - minSize;
						}
						if (off < -ctop) {
							off = -ctop;
						}
						top = getCloseRef(ctop + off, refs.vertical);
						if (!!top) {
							off = top - ctop;
						}
						sChange.Y = off * display.sh / rcanvas.height;

						if (sChange.Y < -display.sy) {
							if (display.sh - sChange.Y > image.mHeight) {
								var sRes = display.sh - sChange.Y - image.mHeight;
								var dr = sRes/image.mHeight;
								display.sx = display.sx + display.sw * dr/2;
								display.sw -=  display.sw * dr;
								display.sy = 0;
								display.sh = image.mHeight;
							} else {
								display.sy = 0;
								display.sh = Math.min(display.sh - sChange.Y, image.mHeight);
							}
						}
						else {
							display.sy += sChange.Y;
							display.sh = Math.min(display.sh - sChange.Y, image.mHeight - display.sy);
						}
						rcanvas.top = ctop + off;
						rcanvas.height -= off;
						break;

					case 'B':
						off = Math.floor(-Math.sin(Math.PI * angle / 180) * offset.X
								+ Math.cos(Math.PI * angle / 180) * offset.Y);
						if (off < -rcanvas.height + minSize) {
							off = -rcanvas.height + minSize;
						}
						if (off + rcanvas.height + ctop > pheight) {
							off = pheight - rcanvas.height - ctop;
						}
						bot = getCloseRef(ctop + off + rcanvas.height, refs.vertical);
						if (!!bot) {
							off = bot - ctop - rcanvas.height;
						}
						sChange.Y = off * display.sh / rcanvas.height;

						if (display.sh + display.sy + sChange.Y > image.mHeight) {
							sChange.Y1 = image.mHeight - display.sh - display.sy;
							if (sChange.Y - sChange.Y1 > display.sy) {
								var sRes = sChange.Y - sChange.Y1 - display.sy;
								var dr = sRes/image.mHeight;
								display.sx = display.sx + display.sw * dr/2;
								display.sw -=  display.sw * dr;
								display.sy = 0;
								display.sh = image.mHeight;
							} else {
								sChange.Y2 = sChange.Y - sChange.Y1;
								display.sy -= sChange.Y2;
								display.sh += sChange.Y;
							}
						}
						else {
							display.sh = Math.min(display.sh + sChange.Y, image.mHeight - display.sy);
						}
						rcanvas.height += off;
						break;

					case 'TR':
						redimension(rcanvas, offset, 'T', refs);
						redimension(rcanvas, offset, 'R', refs);
						break;

					case 'TL':
						redimension(rcanvas, offset, 'T', refs);
						redimension(rcanvas, offset, 'L', refs);
						break;

					case 'BR':
						redimension(rcanvas, offset, 'B', refs);
						redimension(rcanvas, offset, 'R', refs);
						break;

					case 'BL':
						redimension(rcanvas, offset, 'B', refs);
						redimension(rcanvas, offset, 'L', refs);
						break;
				}
			};

			function moveImageInCanvas(offset) {
				if (frame.image.src) {
					var image = frame.image;
					var sChangeX = -offset.X * image.mWidth / canvas.width,
						sChangeY = -offset.Y * image.mHeight / canvas.height;
					if (sChangeX < -display.sx) {
						display.sx = 0;
					} else if (sChangeX + display.sx + display.sw > image.mWidth) {
						display.sx = image.mWidth - display.sw;
					} else {
						display.sx += sChangeX;
					}
					if (sChangeY < -display.sy) {
						display.sy = 0;
					} else if (sChangeY + display.sy + display.sh > image.mHeight) {
						display.sy = image.mHeight - display.sh;
					} else {
						display.sy += sChangeY;
					}
					drawImage(canvas, scope.img, display, image.ratio, pageRatio);
					ImgService.drawAnchors(canvas);
				}
			}

			function dropInCanvas(evt) {
				evt.preventDefault();
				var data = evt.dataTransfer;
				var name = data.getData('name');
				if (name == 'image') {
					if (frame.image.DbId) {
						var oldDbId = frame.image.DbId;
						ImgService.updateOldThumb(oldDbId);
					}
					scope.img.src = data.getData('URL');
					frame.image.src = data.getData('URL');
					frame.image.mHeight = parseInt(data.getData('mHeight'));
					frame.image.mWidth = parseInt(data.getData('mWidth'));
					var DbId = parseInt(data.getData('DbId'));
					frame.image.DbId = DbId;
					frame.image.ratio = parseFloat(data.getData('ratio'));
					firstDrawImage();
					canvasFocus();
					updateNewThumb(DbId);
				}
			};

			function updateNewThumb(DbId) {
				var usedCheck = document.getElementById('check' + DbId);
				usedCheck.innerHTML = parseInt(usedCheck.innerHTML||0) + 1;
				usedCheck.style.display = 'inline-block';
			}

			function firstDrawImage() {  // fill canvas with image
				if (scope.img.src) {
					var image = frame.image;
					if (image.mHeight / canvas.height > image.mWidth / canvas.width) {
						image.scaleRatio = image.mWidth / canvas.width;
						display.sw = image.mWidth;
						display.sh = canvas.height * image.scaleRatio;
						display.sx = 0;
						display.sy = Math.max((image.mHeight - display.sh) / 2, 0);
					} else if (image.mHeight / canvas.height <= image.mWidth / canvas.width) {
						image.scaleRatio =image.mHeight / canvas.height;
						display.sh = image.mHeight;
						display.sw = canvas.width * image.scaleRatio;
						display.sx = Math.max((image.mWidth - display.sw) / 2, 0);
						display.sy = 0;
					}
					drawImage(canvas, scope.img, display, frame.image.ratio, pageRatio);
				}
			};

			function keyDown(evt) {
				evt.preventDefault();
				switch (evt.keyCode) {
					case 61: // key +
					case 186:
					case 187:
						ImgService.zoomImage(canvas, scope.img, frame, 'in', pageRatio);
						break;
					case 173: // key -
					case 189:
						ImgService.zoomImage(canvas, scope.img, frame, 'out', pageRatio);
						break;
					case 37: //key left
						ImgService.moveImage(canvas, scope, 'left');
						break;
					case 38: //key up
						ImgService.moveImage(canvas, scope, 'up');
						break;
					case 39: //key right
						ImgService.moveImage(canvas, scope, 'right');
						break;
					case 40: //key down
						ImgService.moveImage(canvas, scope, 'down');
						break;
					case 46: //del
						if (frame.image.src) {
							ImgService.updateOldThumb(frame.image.DbId);
							scope.img = new Image();
							frame.image = {};
							ImgService.resetFrame(canvas);
						} else {
							ImgService.delCanvas(scope);
						}
						break;
				}
			};
		}
	}
}]);


