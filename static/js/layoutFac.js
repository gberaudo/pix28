app.factory('Layouts', function() {
	var layouts = {};
	layouts.x1 = [
		{
			frames:
				[
					{left: 15, top:10, width: 70, height: 60}
				],
			boxes: 
				[
					{left: 15, top: 80, width: 70, height: 10}
				]
		},
			
		{ 
			frames: 
				[
					{left: 15, top: 30, width: 70, height: 60}
				],
			boxes: 
				[
					{left: 15, top: 10, width: 70, height:10}
				]
		},
			
		{
			frames:
				[
					{left: 0, top: 0, width: 100, height: 100}
				],
			boxes: []
		},

		{
			frames: 
				[
					{left: 10, top: 10, width: 80, height: 80}
				],
			boxes: []
		},

		{
			frames: 
				[
					{left: 5, top: 5, width: 90, height: 90}
				],
			boxes: []
		},

		{
			frames: 
				[
					{left: 20, top: 5, width: 75, height: 90}
				],
			boxes: []
		}
	];
/*	-------------------Layouts x2----------------------------------*/

	layouts.x2 = [
		{
			frames:
				[
					{left: 10, top: 10, width: 80, height: 35},
					{left: 10, top: 50, width: 80, height: 40}
				],
			boxes: []
		},
		
		{
			frames: 
				[
					{left: 20, top: 10, width: 70, height: 50},
					{left: 20, top: 65, width: 70, height: 30}
				],
			boxes: []
		},

		{
			frames: 
				[
					{left: 20, top: 5, width: 75, height: 40}, 
					{left: 20, top: 55, width: 75, height: 40}
				],
			boxes: []
		},
		
		{
			frames: 
				[
					{left: 0, top: 0, width: 100, height: 45},
					{left: 0, top: 55, width: 100, height: 45}
				],
				
			boxes: 
				[
					{left: 20, top: 45, width: 60, height: 10}
				]
		},
		
		{		
			frames: 
				[
					{left: 10, top: 0, width: 90, height: 47.5}, 
					{left: 10, top: 52.5, width: 90, height: 47.5}
				],
			boxes: []
		},

		{ 
			frames: 
				[
					{left: 0, top: 0, width: 90, height: 47.5}, 
					{left: 0, top: 52.5, width: 90, height: 47.5}
				],
			boxes: []
		},
	];

	/*---------------------Layout x3------------------*/
	layouts.x3 = [
		{
			frames: 
				[
					{left: 10, top: 5, width: 40, height: 42.5}, 
					{left: 55, top: 5, width: 40, height: 42.5}, 
					{left: 10, top: 52.5, width: 85, height: 42.5}
				],
			boxes: []
		},
		
		{
			frames: 
				[
					{left: 10, top: 5, width: 85, height: 42.5},
					{left: 10, top: 52.5, width: 40, height: 42.5},
					{left: 55.5, top: 52.5, width: 40, height: 42.5}
				],
			boxes: []
		}
	];
	
	/*--------------------------Layout x4----------------------*/
	
	layouts.x4 = [
		{ 
			frames:
				[
					{left: 5, top: 5, width: 42.5, height: 42.5}, 
					{left: 52.5, top: 5, width: 42.5, height: 42.5},
					{left: 5, top: 52.5, width: 42.5, height: 42.5},
					{left: 52.5, top: 52.5, width: 42.5, height: 42.5}
				],
			boxes: []
		},
		
		{
			frames: 
				[
					{left: 5, top: 5, width: 60, height: 42.5},
					{left: 70, top: 5, width: 25, height: 42.5},
					{left: 5, top: 52.5, width: 25, height: 42.5}, 
					{left: 35, top: 52.5, width: 60, height: 42.5}
				],
			boxes: []
		}
	];
	
	/*------------------------Layout x5------------------------*/
	layouts.x5 = [
		{
			frames: 
				[
					{left: 5, top: 5, width: 45, height: 42.5},
					{left: 5, top: 52.5, width: 45, height: 42.5},
					{left: 55, top: 5, width: 40, height: 25},
					{left: 55, top: 35, width: 40, height: 25},
					{left: 55, top: 70, width: 40, height: 25}
				],
			boxes: []
		},
	
		{
			frames:  
				[
					{left: 5, top: 5, width: 40, height: 25},
					{left: 5, top: 35, width: 40, height: 25},
					{left: 5, top: 70, width: 40, height: 25},
					{left: 50, top: 5, width: 45, height: 42.5},
					{left: 50, top: 52.5, width: 45, height: 42.5}
				],
			boxes: []
		}
	];
	
 	return layouts;
})
