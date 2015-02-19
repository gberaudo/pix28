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
			scope.mousePos = {};
			initCanvas();

			setFocus();

			
			elem.on('dragover', function(e) {
				scope.allowDrop(e);
			});
			elem.on('drop', function(e) {
				scope.dropInCanvas(e);
			});
			elem.on('mousedown', mouseDownHandle);
			elem.on('mousemove', mouseMoveHandle);

			function mouseDownHandle(evt) {
						var drag = {center: false, TL: false, TR: false, BL: false,
					BR: false, L: false, R: false, T: false, B: false};
				var mouseRtCanvas = {
					X: evt.layerX,
					Y: evt.layerY
				};
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

// 				document.addEventListener('mousemove', mouseMoveHandle, true);
				document.addEventListener('mouseup', mouseUpHandle, true);
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
								redimension(scope.rcanvas, offsetCopy, anchorCopy, refs);
								canvas.width = scope.rcanvas.width;
								canvas.height = scope.rcanvas.height;
								canvas.style.left = scope.rcanvas.left + 'px';
								canvas.style.top = scope.rcanvas.top + 'px';
								if (frame.angle % 180 == 0) {
									ImgService.showRefLines(canvas, refs, scope.refLines);
								}
								if (scope.img.src) {
									drawImage(canvas, scope.img, display,
												frame.image.ratio, measure.pageRatio );
								} else {
									ImgService.resetFrame(canvas);
								}
								ImgService.drawAnchors(canvas);
								Misc.resetZone(scope.canvasZone, scope.rcanvas.width, scope.rcanvas.height);
								frame.canvas = Misc.abs2perCent(scope.rcanvas, measure.pwidth, measure.pheight);
							});
							break;
						}
					}

					console.log('mousePos watch');
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
// 					document.removeEventListener('mousemove', mouseMoveHandle, true);
				}
				
			}

			function mouseMoveHandle(evt) {
				scope.mousePos = {X: evt.layerX, Y: evt.layerY};
				var mouseRtCanvas = {
					X: evt.layerX,
					Y: evt.layerY
				};
				Misc.setCursor(mouseRtCanvas, scope.canvasZone, scope.current);
				console.log('mousemove, drag right');
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
					scope.img.onload = function() {
						drawImage(canvas, scope.img, display,
									frame.image.ratio, measure.pageRatio);
					};
					scope.img.src = frame.image.src;
				} else {
					$timeout(function() {
						ImgService.resetFrame(canvas);
					});
				}
			};
			function redrawImage() {
				drawImage(canvas, scope.img, display, frame.image.ratio, measure.pageRatio);
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
						drawImage(canvas, scope.img, display, frame.image.ratio, measure.pageRatio);
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
		}
	}
}]);


