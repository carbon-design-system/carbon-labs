#!/bin/bash
#
# Copyright IBM Corp. 2026
#
# This source code is licensed under the Apache-2.0 license found in the
# LICENSE file in the root directory of this source tree.
#

set -e

yarn clean

# The Sass modules, published at `@carbon-labs/v12-styles/scss`
mkdir -p scss
cp src/styles/*.scss scss/

# The motion custom properties as plain CSS
node scripts/build-css.js
