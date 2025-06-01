#!/bin/bash -eufx

npm run build
npm publish --provenance --access public
