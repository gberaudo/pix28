 app.service('DBServices', ['$q','$timeout', function($q, $timeout) {
	
	this.initAlbumDB = function() {
		var deferred = $q.defer();
		var albumSCs = [];
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
		openRq.onsuccess = function(event) {
			var db = openRq.result,
				trans = db.transaction(['Albums']),
				store = trans.objectStore('Albums');
			store.openCursor().onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					var albumSC = {
						id: cursor.value.id, 
						description: cursor.value.description,
						title: cursor.value.title,
						date: cursor.value.date,
						width: cursor.value.width || undefined,
						height: cursor.value.height || undefined
					};
					albumSCs.push(albumSC);
					cursor.continue();
				}
				deferred.resolve(albumSCs);
			}
		};

		openRq.onerror = function(event) {
			console.log('open DB error');
			defered.resolve(albumSCs);
		};

		openRq.onupgradeneeded = function(event) {
			console.log('upgrade needed');
			var albumStore = event.currentTarget.result.createObjectStore(
				'Albums',
				{ keyPath: "id", autoIncrement: true }
			);
		};
		return deferred.promise;
	};
	
	
	this.initImageDB = function() {
		var openRq = window.indexedDB.open('ImagesDB',1);
		openRq.onsuccess = function() {
			console.log('init imagesDB');
		};
		openRq.onerror = function() {
			console.log('open imageDB failed');
		};
		openRq.onupgradeneeded = function(event) {
			console.log('ImagesDB, upgrade needed');
			var imageStore = event.currentTarget.result.createObjectStore(
				'Images',
				{keyPath: 'id', autoIncrement: true}
			);
			imageStore.createIndex('inAlbum', 'inAlbum', {unique: false});
		};
	};
	
	
	this.updateAlbumDB = function(content, id, title, description, date, width, height) {
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
		var deferred = $q.defer();
		openRq.onsuccess = function(event) {
			var db = openRq.result;
			var trans = db.transaction(['Albums'], 'readwrite');
			var store = trans.objectStore('Albums');
			var getRq = store.get(id); 
			getRq.onsuccess = function(event) {
				var album = this.result;
				album.content = content;
				album.title = title;
				album.description = description;
				album.date = date;
				album.width = width;
				album.height = height;
				
				var updateRq = store.put(album);
				updateRq.onsuccess = function(event){
					var el = document.getElementById('updateMsg');
					el.innerHTML = 'Album saved.';
					$timeout(function() {
						el.innerHTML = '';
					},2000);
					deferred.resolve();
				};
				updateRq.onerror = function(event){
					deferred.reject();
					console.log('update failed');
				};
			};
			getRq.onerror = function(event) {
				deferred.reject();
				console.log('access failed');
			};
		};
		openRq.onerror = function(event) {
			deferred.reject();
			console.log('error in open DB for update');
		};
		return deferred.promise;
	};
	
	this.addAlbum = function() {
		//add this new album to the database 
		var deferred = $q.defer();
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
		openRq.onsuccess = function(event) {
			console.log('opening DB for creating album');
			var db = openRq.result;
			var trans = db.transaction(['Albums'], 'readwrite');
			var albumStore = trans.objectStore('Albums');
			var addAlbumRq = albumStore.add({content: []});
			addAlbumRq.onsuccess = function() {
				deferred.resolve(addAlbumRq.result);
			};
			addAlbumRq.onerror = function() {
				console.log('Cannot add this new album to the database');
			};
		};
		openRq.onerror = function(event) {
			console.log('error in open DB for creating album');
		};
		return deferred.promise;
	};

	this.getAlbum = function(id) {
		var deferred = $q.defer();
		var openRq = window.indexedDB.open('PhotoAlbumsDB', 1);
		openRq.onsuccess = function(event) {
			var db = openRq.result;
			var trans = db.transaction(['Albums']);
			var store = trans.objectStore('Albums');
			var getRq = store.get(id);
			getRq.onsuccess = function(event) {
				deferred.resolve(event.target.result);
			};
			getRq.onerror = function() {
				console.log('Can not get this album from database');
			};
		};
		openRq.onerror = function(event) {
			console.log('error in open DB for opening album');
		};
		return deferred.promise;
	};
}]);