import web
import json
import pickle
render = web.template.render('templates/')
import base64

urls = (
	'/', 'index',
)

class index:
	def GET(self):
		return render.index('dev')
	

if __name__ == "__main__":
	app = web.application(urls, globals())
	app.run()
