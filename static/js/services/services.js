
app.factory('FrameObject', function() {
	return function(data) {
		this.canvas = data.canvas;
		this.image = data.image || {};
		this.display = data.display || {};
		this.angle = data.angle || 0;
		this.border = data.border || {};
		this.layer = data.layer || 10;
	};
})

	.factory('PageObject', function() {
	return function(data) { 
		this.frames = data.frames || []; //list of FrameObject
		this.textBoxes = data.textBoxes || []; //list of textBoxOject
		this.background = data.background || '';
	};
})
	
	.factory('TextBoxObject', function() {
		return function(data) {
			this.box = data.box;
			this.text = '';
			this.font = {
				family: data.font.family || 'UVNTinTuc_R',
				size: data.font.size || 24,
				color: data.font.color || '#000000'
			};
			this.align = data.align || 'left';
			this.angle = data.angle || 0;
			this.layer = data.layer || 15;
		};
})

	.factory('Fonts', function() {
	return [
		'UVNTinTuc_R',
		'UVNKyThuat',
		'Calligraffiti',
		'UVNDoiMoi',
		'UVNKeChuyen3',
		'ArDaughter',
		'Belligerent',
		'Drawvetica',
		'Ubuntu_B',
		'Ubuntu_BI',
		'Ubuntu_L',
		'Ubuntu_LI',
		'Ubuntu_R',
		'Ubuntu_C',
		'Komtxt',
		'Komtxtb',
		'Komtxtbi',
		'Komtxti',
		'Komtxtk',
		'Komtxtkb',
		'SpecialElite',
		'WCSoldOutB',
		'Floralia'
	];
})


	.factory('Colors', function(){
	return  [
		'#000000', '#2A0A29', '#0A1B2A', '#0A2A1B',
		'#29220A', '#610B0B', '#5F4C0B', '#38610B',
		'#DF0101', '#DF7401', '#74DF00', '#01DFA5',
		'#0174DF', '#3A01DF', '#DF01D7', '#00FF80',
		'#0040FF', '#8000FF', '#FF0080', '#848484',
		'#D8D8D8', '#F781F3', '#819FF7', '#BEF781',
		'#F5DA81', '#FBEFF8', '#EFF5FB', '#FBEFEF',
		'#A4A4A4', '#BDBDBD'
	];
});
	
/*------------------------------------------------------*/

app.service('Init', ['gettextCatalog', function(gettextCatalog) {
	this.initTextArea = function(div, textArea, textBox, measure) {
		div.style.height = textArea.style.height = Math.floor(textBox.box.height * measure.pheight/100) + "px";
		div.style.width = textArea.style.width = Math.floor(textBox.box.width * measure.pwidth/100) + "px";
		div.style.top = Math.floor(textBox.box.top * measure.pheight/100) + "px";
		div.style.left = Math.floor(textBox.box.left * measure.pwidth/100) + "px";
		textBox.layer = textBox.layer || 15;
		div.style.zIndex = textBox.layer;
		textArea.style.color = textBox.font.color;
		textArea.style.fontFamily = textBox.font.family;
// 		textArea.style.fontWeight = textBox.font.weight;
// 		textArea.style.fontStyle = textBox.font.style;
		var size = textBox.font.size || 24;
		textArea.style.fontSize = (size * measure.pwidth/measure.pdfWidth) + 'px';
		textArea.style.textAlign = textBox.align;
		if (!!textBox.angle) {
			textArea.parentNode.style.transform = 'rotate(' + textBox.angle + 'deg)';
		} else {
			textBox.angle = 0;
		}
		
		if (textBox.text) {
			div.style.outline = '0';
		} else {
			div.style.outline = '#CEECF5 solid 1px';
		}
		textArea.style.resize = 'none';
	};
}]);




app.factory('getUserFonts', function() {
	return function() {
		var openRq = window.indexedDB.open('UserDB', 2);
		var newStyle = document.createElement('style');
		var userFonts = [];
		openRq.onsuccess = function(event) {
			var db = openRq.result;
			var trans = db.transaction(['userData']);
			var store = trans.objectStore('userData');
			var getRq = store.get(1);
			getRq.onsuccess = function(event) {
				var userData = this.result.userFonts;
				for (var i = 0; i < userData.length; i++) {
					var fontName = Object.keys(userData[i])[0];
					var fontURL = userData[i][fontName];
					newStyle.appendChild(document.createTextNode("\
						@font-face {\
							font-family: '" + fontName + "';\
							src: url('" + fontURL + "') format('truetype');\
						}\
					"));
					newStyle.appendChild(document.createTextNode("\
						." + fontName + "{\
							font-family: '" + fontName + "';\
						}\
					"));
					userFonts.push(fontName);
				}
				document.head.appendChild(newStyle);
			};
		};
		return userFonts;
	}
});

