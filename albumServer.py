import web
import json
import pickle
render = web.template.render('templates/')
import base64

urls = (
	'/', 'index',
	'/templates/banner.html', 'banner',
	'/templates/userZone.html', 'userZone',
	'/templates/chooseFormats.html', 'chooseFormats',
	'/templates/albumHeader.html', 'albumHeader',
	'/templates/albumSideMenu.html', 'albumSideMenu',
	'/templates/editAlbum.html', 'editAlbum',
	'/templates/previewPages.html', 'previewPages',
	'/templates/albumTopMenu.html', 'albumTopMenu',
	'/templates/imageLoader.html', 'imageLoader',
	'/templates/imageCtrl.html', 'imageCtrl',
	'/templates/layoutCtrl.html', 'layoutCtrl',
	'/templates/textCtrl.html', 'textCtrl',
	'/templates/albumPage.html', 'albumPage',
)

class index:
	def GET(self):
		return render.index('dev')
	
class banner:
	def GET(self):
		return render.banner()

class userZone:
	def GET(self):
		return render.userZone()

class chooseFormats:
	def GET(self):
		return render.chooseFormats()

class albumHeader:
	def GET(self):
		return render.albumHeader()

class albumSideMenu:
	def GET(self):
		return render.albumSideMenu()

class editAlbum:
	def GET(self):
		return render.editAlbum()

class previewPages:
	def GET(self):
		return render.previewPages()

class albumTopMenu:
	def GET(self):
		return render.albumTopMenu()

class imageLoader:
	def GET(self):
		return render.imageLoader()

class albumPage:
	def GET(self):
		return render.albumPage()

class imageCtrl:
	def GET(self):
		return render.imageCtrl()

class textCtrl:
	def GET(self):
		return render.textCtrl()

class layoutCtrl:
	def GET(self):
		return render.layoutCtrl()



if __name__ == "__main__":
	app = web.application(urls, globals())
	app.run()
