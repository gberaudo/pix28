CLOSURE_UTIL_PATH := closure-util
CLOSURE_LIBRARY_PATH := $(shell node -e 'process.stdout.write(require("$(CLOSURE_UTIL_PATH)").getLibraryPath())' 2> /dev/null)
CLOSURE_COMPILER_PATH := $(shell node -e 'process.stdout.write(require("$(CLOSURE_UTIL_PATH)").getCompilerPath())' 2> /dev/null)
APP_JS_FILES = $(shell sed '/$$else/,/html/d' templates/index.html | grep js\' | grep -v lib | cut -d"'" -f2)
APP_HTML_FILES := $(shell find templates -type f -name '*.html')
LIB_DIR := static/lib

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
	@echo "- deploy             Deploy to cowaddict.org"
	@echo "- lint               Check the JavaScript code with linters"
	@echo "- serve              Run the development server"
	@echo "- test               Run the unit tests"
	@echo "- protractor         Run the e2e tests"
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
	rm -rf $(LIB_DIR)/*

.PHONY: compile-catalog
compile-catalog: static/build/locale/fr/album.json static/build/locale/en/album.json static/build/locale/vi/album.json

.PHONY: dist
dist: build
	mkdir -p dist/lib
	cp -R static templates dist/
	sed 's/dev/prod/g' albumServer.py > dist/albumServer.py
	cp node_modules/angular/angular.min.js dist/$(LIB_DIR)/
	cp node_modules/angular-gettext/dist/angular-gettext.min.js  dist/$(LIB_DIR)/
	cp node_modules/exif-js/exif.js dist/$(LIB_DIR)/
	cp node_modules/pdfkit/build/pdfkit.js dist/$(LIB_DIR)/
	cp $(LIB_DIR)/blob-stream.js dist/$(LIB_DIR)/
	cp $(LIB_DIR)/jszip.min.js dist/$(LIB_DIR)/
	cp $(LIB_DIR)/FileSaver.min.js dist/$(LIB_DIR)/
	sed '/$$if/,/$$else/d' dist/templates/index.html | tail -n +2 | sed 's/\\\$$/\$$/g' > dist/index.html
	sed -i 's/^.*ourceMappingUR.*$$//g' dist/$(LIB_DIR)/angular.min.js
	sed -i 's/^.*ourceMappingUR.*$$//g' dist/$(LIB_DIR)/angular-gettext.min.js
	sed -i 's/^.*ourceMappingUR.*$$//g' dist/$(LIB_DIR)/pdfkit.js


.PHONY: test
test: .build/node_modules.timestamp
	./node_modules/karma/bin/karma start karma-conf.js --single-run

.PHONY: protractor
protractor: .build/node_modules.timestamp
	echo 'LAUNCH MANUALLY ./node_modules/protractor/bin/protractor start'
	echo 'LAUNCH MANUALLY make serve-dev or make serve-prod'
	./node_modules/protractor/bin/webdriver-manager update
	./node_modules/protractor/bin/protractor test/protractor/conf.js

PHONY: lint
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
	.build/venv/bin/gjslint --disable 0005,0130,0131 --max_line_length 130 $?
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


$(LIB_DIR)/angular_13.js: .build/node_modules.timestamp
	cp node_modules/angular/angular.js $@

$(LIB_DIR)/angular-gettext.js: .build/node_modules.timestamp
	cp node_modules/angular-gettext/dist/angular-gettext.js $@

$(LIB_DIR)/exif.js:.build/node_modules.timestamp
	cp node_modules/exif-js/exif.js $@

$(LIB_DIR)/pdfkit.js:.build/node_modules.timestamp
	grep -v 'sourceMappingURL=pdfkit.js.map' node_modules/pdfkit/build/pdfkit.js > $@

$(LIB_DIR)/blob-stream.js:
	wget https://github.com/devongovett/blob-stream/releases/download/v0.1.2/blob-stream-v0.1.2.js -O $@

$(LIB_DIR)/jszip.min.js:
	wget https://github.com/Stuk/jszip/raw/64b33125ef8970a4bb1725042804995bc1535958/dist/jszip.min.js -O $@

$(LIB_DIR)/FileSaver.min.js:
	wget https://github.com/eligrey/FileSaver.js/raw/d593c0b9114ac14a648fbaee822f181117b2b5fa/FileSaver.min.js -O $@

.PHONY: node_deps
node_deps: $(LIB_DIR)/angular_13.js $(LIB_DIR)/angular-gettext.js $(LIB_DIR)/jszip.min.js $(LIB_DIR)/blob-stream.js $(LIB_DIR)/exif.js $(LIB_DIR)/pdfkit.js

.PHONY: deploy
deploy: dist
	rsync -a dist/ guiber@cowaddict.org:public_html/Album && echo 'transfer done'

.PHONY: cowtest
cowtest: dist
	rsync -a dist/ guiber@cowaddict.org:public_html/Testing && echo 'transfer done'

