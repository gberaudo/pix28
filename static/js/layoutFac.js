app.factory('Layouts', function() {
	var layouts = {};
	layouts.x1 = [
		{
			frames:
				[ 
					{canvas: {left: 15, top:10, width: 70, height: 60}}
				],
			textBoxes: 
				[
					{
						box: {left: 15, top: 80, width: 70, height: 10},
						font: {size: 30}
					}
				]
		},
			
		{ 
			frames: 
				[
					{canvas: {left: 15, top: 30, width: 70, height: 60}}
				],
			textBoxes: 
				[
					{
						box: {left: 15, top: 10, width: 70, height:10},
						font: {size: 30}
					}
				]
		},
			
		{
			frames:
				[
					{canvas: {left: 0, top: 0, width: 100, height: 100}}
				],
			textBoxes: []
		},

		{
			frames: 
				[
					{canvas: {left: 10, top: 10, width: 80, height: 80}}
				],
			textBoxes: []
		},

		{
			frames: 
				[
					{canvas: {left: 5, top: 5, width: 90, height: 90}}
				],
			textBoxes: []
		},

		{
			frames: 
				[
					{canvas: {left: 20, top: 5, width: 75, height: 90}}
				],
			textBoxes: []
		}
	];
/*	-------------------Layouts x2----------------------------------*/

	layouts.x2 = [
		{
			frames:
				[
					{canvas: {left: 10, top: 10, width: 80, height: 35}},
					{canvas: {left: 10, top: 50, width: 80, height: 40}}
				],
			textBoxes: []
		},
		
		{
			frames: 
				[
					{canvas: {left: 20, top: 10, width: 70, height: 50}},
					{canvas: {left: 20, top: 62, width: 70, height: 30}}
				],
			textBoxes: []
		},

		{
			frames: 
				[
					{canvas: {left: 20, top: 5, width: 75, height: 40}}, 
					{canvas: {left: 20, top: 55, width: 75, height: 40}}
				],
			textBoxes: []
		},
		
		{
			frames: 
				[
					{canvas: {left: 0, top: 0, width: 100, height: 45}},
					{canvas: {left: 0, top: 55, width: 100, height: 45}}
				],
				
			textBoxes: 
				[
					{
						box: {left: 20, top: 45, width: 60, height: 10},
						font: {size: 24}
					}
				]
		},
		
		{		
			frames: 
				[
					{canvas: {left: 10, top: 0, width: 90, height: 47.5}}, 
					{canvas: {left: 10, top: 52.5, width: 90, height: 47.5}}
				],
			textBoxes: []
		},

		{ 
			frames: 
				[
					{canvas: {left: 0, top: 0, width: 90, height: 47.5}}, 
				{canvas: {left: 0, top: 52.5, width: 90, height: 47.5}}
				],
			textBoxes: []
		},
	];

	/*---------------------Layout x3------------------*/
	layouts.x3 = [
		{
			frames: 
				[
					{canvas: {left: 10, top: 5, width: 40, height: 42.5}}, 
					{canvas: {left: 55, top: 5, width: 40, height: 42.5}}, 
					{canvas: {left: 10, top: 52.5, width: 85, height: 42.5}}
				],
			textBoxes: []
		},
		
		{
			frames: 
				[
					{canvas: {left: 10, top: 5, width: 85, height: 42.5}},
					{canvas: {left: 10, top: 52.5, width: 40, height: 42.5}},
					{canvas: {left: 55.5, top: 52.5, width: 40, height: 42.5}}
				],
			textBoxes: []
		}
	];
	
	/*--------------------------Layout x4----------------------*/
	
	layouts.x4 = [
		{ 
			frames:
				[
					{canvas: {left: 5, top: 5, width: 42.5, height: 42.5}}, 
					{canvas: {left: 52.5, top: 5, width: 42.5, height: 42.5}},
					{canvas: {left: 5, top: 52.5, width: 42.5, height: 42.5}},
					{canvas: {left: 52.5, top: 52.5, width: 42.5, height: 42.5}}
				],
			textBoxes: []
		},
		
		{
			frames: 
				[
					{canvas: {left: 5, top: 5, width: 60, height: 42.5}},
					{canvas: {left: 70, top: 5, width: 25, height: 42.5}},
					{canvas: {left: 5, top: 52.5, width: 25, height: 42.5}}, 
					{canvas: {left: 35, top: 52.5, width: 60, height: 42.5}}
				],
			textBoxes: []
		}
	];
	
	/*------------------------Layout x5------------------------*/
	layouts.x5 = [
		{
			frames: 
				[
					{canvas: {left: 5, top: 5, width: 45, height: 42.5}},
					{canvas: {left: 5, top: 52.5, width: 45, height: 42.5}},
					{canvas: {left: 55, top: 5, width: 40, height: 25}},
					{canvas: {left: 55, top: 35, width: 40, height: 25}},
					{canvas: {left: 55, top: 70, width: 40, height: 25}}
				],
			textBoxes: []
		},
	
		{
			frames:  
				[
					{canvas: {left: 5, top: 5, width: 40, height: 25}},
					{canvas: {left: 5, top: 35, width: 40, height: 25}},
					{canvas: {left: 5, top: 70, width: 40, height: 25}},
					{canvas: {left: 50, top: 5, width: 45, height: 42.5}},
					{canvas: {left: 50, top: 52.5, width: 45, height: 42.5}}
				],
			textBoxes: []
		}
	];
	
 	return layouts;
})
