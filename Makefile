CLOSURE_UTIL_PATH := closure-util
CLOSURE_LIBRARY_PATH := $(shell node -e 'process.stdout.write(require("$(CLOSURE_UTIL_PATH)").getLibraryPath())' 2> /dev/null)
CLOSURE_COMPILER_PATH := $(shell node -e 'process.stdout.write(require("$(CLOSURE_UTIL_PATH)").getCompilerPath())' 2> /dev/null)
#APP_JS_FILES = $(shell find static/js -type f -name '*.js')
APP_JS_FILES := static/js/siteController.js static/js/albumController.js static/js/imageLoaderController.js static/js/pageController.js static/js/canvasController.js static/js/layoutController.js static/js/services.js static/js/textController.js
APP_HTML_FILES := $(shell find templates -type f -name '*.html')

export closure_library_path = $(CLOSURE_LIBRARY_PATH)
export closure_compiler_path = $(CLOSURE_COMPILER_PATH)

.PHONY: help
help:
	@echo "Usage: make <target>"
	@echo
	@echo "Main targets:"
	@echo
	@echo "- check              Perform a number of checks on the code"
	@echo "- clean              Remove generated files"
	@echo "- cleanall           Remove all the build artefacts"
	@echo "- compile-catalog    Compile the translation catalog"
	@echo "- build              Build the project"
	@echo "- lint               Check the JavaScript code with linters"
	@echo "- serve              Run the development server"
	@echo

.PHONY: check
check: flake8 lint build

.PHONY: build
build: static/build/album.js compile-catalog .build/dev-requirements.timestamp

.PHONY: clean
clean:
	rm -f .build/node_modules.timestamp
	rm -f .build/dev-requirements.timestamp
	rm -f locale/*.pot
	rm -rf static/build
	rm -rf dist

.PHONY: cleanall
cleanall: clean
	rm -rf .build
	rm -rf node_modules

.PHONY: compile-catalog
compile-catalog: static/build/locale/fr/album.json static/build/locale/en/album.json static/build/locale/vn/album.json

.PHONY: dist
dist: build
	mkdir -p dist
	cp -R static templates dist/
	rm -rf dist/static/js/*
	sed 's/dev/prod/g' albumServer.py > dist/albumServer.py
	cp node_modules/angular/angular.min.js dist/static/js/
#	cp static/js/angular_13.js dist/static/js/angular.min.js
	cp node_modules/angular-gettext/dist/angular-gettext.min.js  dist/static/js/
	cp node_modules/exif-js/exif.js dist/static/js/
	cp static/js/blob-stream.js dist/static/js/
	cp node_modules/pdfkit/build/pdfkit.js dist/static/js/
	cp static/build/album.js dist/static/build/album.js


.PHONY: lint
lint: .build/venv/bin/gjslint .build/node_modules.timestamp .build/gjslint.timestamp .build/jshint.timestamp


locale/album-client.pot: $(APP_HTML_FILES) $(APP_JS_FILES)
	node tasks/extract-messages.js $^ > $@

locale/%/LC_MESSAGES/album-client.po: locale/album-client.pot
	msgmerge --backup=none --update $@ $<

static/build/album.js: $(APP_JS_FILES) .build/externs/angular-1.3.js .build/externs/angular-1.3-q.js .build/externs/angular-1.3-http-promise.js .build/node_modules.timestamp node_deps
	mkdir -p $(dir $@)
	java -jar $(CLOSURE_COMPILER_PATH)/compiler.jar \
		--angular_pass \
		--compilation_level SIMPLE \
		--language_in ECMASCRIPT5 \
		--js $(APP_JS_FILES) \
		--externs .build/externs/angular-1.3.js --externs .build/externs/angular-1.3-q.js --externs .build/externs/angular-1.3-http-promise.js \
		--js_output_file $@

static/build/locale/%/album.json: locale/%/LC_MESSAGES/album-client.po
	mkdir -p $(dir $@)
	node tasks/compile-catalog $< > $@

.build/externs/angular-1.3.js:
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/angular-1.3.js

.build/externs/angular-1.3-q.js:
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/angular-1.3-q.js

.build/externs/angular-1.3-http-promise.js:
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/angular-1.3-http-promise.js

.build/node_modules.timestamp: package.json
	mkdir -p $(dir $@)
	npm install
	touch $@

.build/gjslint.timestamp: $(APP_JS_FILES)
	.build/venv/bin/gjslint --jslint_error=all --strict --custom_jsdoc_tags=event,fires,function,classdesc,api,observable $?
	touch $@

.build/jshint.timestamp: $(APP_JS_FILES)
	./node_modules/.bin/jshint --verbose $?
	touch $@

.build/venv/bin/gjslint: .build/dev-requirements.timestamp

.build/dev-requirements.timestamp: .build/venv
	.build/venv/bin/pip install -r dev-requirements.txt > /dev/null 2>&1
	touch $@

.build/venv:
	mkdir -p $(dir $@)
	virtualenv --no-site-packages $@

.PHONY: serve-dev
serve-dev: 
	.build/venv/bin/python albumServer.py

.PHONY: serve-prod
serve-prod: 
	(cd dist; ../.build/venv/bin/python albumServer.py)


static/js/angular_13.js: .build/node_modules.timestamp
	cp node_modules/angular/angular.js static/js/angular_13.js

static/js/angular-gettext.js: .build/node_modules.timestamp
	cp node_modules/angular-gettext/dist/angular-gettext.js static/js/angular-gettext.js

static/js/blob-stream.js:
	wget https://github.com/devongovett/blob-stream/releases/download/v0.1.2/blob-stream-v0.1.2.js -O static/js/blob-stream.js

static/js/exif.js:.build/node_modules.timestamp
	cp node_modules/exif-js/exif.js static/js/exif.js

static/js/pdfkit.js:.build/node_modules.timestamp
	grep -v 'sourceMappingURL=pdfkit.js.map' node_modules/pdfkit/build/pdfkit.js > static/js/pdfkit.js

.PHONY: node_deps
node_deps: static/js/angular_13.js static/js/angular-gettext.js static/js/blob-stream.js static/js/exif.js static/js/pdfkit.js

