#!/usr/bin/env bash

cd node_modules/
PACKAGES=$(echo @citation-js/*)
cd ..

npm update $PACKAGES
