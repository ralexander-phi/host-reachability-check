#!/bin/bash

docker run --rm -it -v $(pwd):/src -p 1313:1313 klakegg/hugo:ext-alpine --minify

