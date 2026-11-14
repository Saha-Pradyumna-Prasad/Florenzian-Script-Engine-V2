#!/usr/bin/env bash
# Compiles the C engine to WebAssembly (needs Emscripten: https://emscripten.org)
# Output: engine/engine.js  (wasm embedded, single file). Commit it, then push to Vercel.
set -e
emcc florenzian.c -O2 -o engine/engine.js \
  -s MODULARIZE=1 -s EXPORT_NAME=FlorenzianModule -s SINGLE_FILE=1 -s ENVIRONMENT=web \
  -s EXPORTED_FUNCTIONS=_fl_call,_fl_run,_fl_lex -s EXPORTED_RUNTIME_METHODS=ccall
echo "Done -> engine/engine.js"