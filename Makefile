
SHELL:=/bin/bash
ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

.PHONY: build build_android build_ios clean clean_android clean_ios clean_dependencies run_android run_ios

all: install

refresh: clean install

install:
	yes "" | tns install

build: build_android build_ios

build_android:
	tns build add android

build_ios:
	tns build add ios

run_android:
	tns run android

run_ios:
	tns run ios

clean: clean_dependencies clean_platforms

clean_platforms:
	if [ -d $(ROOT_DIR)/platforms ]; then \
		rm -rf $(ROOT_DIR)/platforms; \
	fi;

clean_android:
	tns platform remove android || true
	tns platform add android

clean_ios:
	tns platform remove ios || true
	tns platform add ios

clean_dependencies:
	if [ -d $(ROOT_DIR)/node_modules ]; then \
		rm -rf $(ROOT_DIR)/node_modules; \
	fi;
