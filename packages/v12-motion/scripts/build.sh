#!/bin/bash
#
# Copyright IBM Corp. 2026
#
# This source code is licensed under the Apache-2.0 license found in the
# LICENSE file in the root directory of this source tree.
#

set -e

yarn clean

# The seam's JavaScript and types, type-checked (carbon-motion supports React 18 and 19)
tsc

# The Sass modules, published at `@carbon-labs/v12-motion/scss`
mkdir -p scss
cp src/styles/*.scss scss/

# carbon-motion's runtime token layer (every --cds-motion-* property), at
# `@carbon-labs/v12-motion/tokens.css`: stylesheets that read the tokens need
# it on the page
cp "$(node -p "require.resolve('@carbon-labs/motion-core/tokens.css')")" es/tokens.css
