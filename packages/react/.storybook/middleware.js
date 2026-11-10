/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The review app's short address, v12/review-app, on the dev server. A built
// Storybook serves src/v12/review/static/review-app/index.html there instead;
// the dev server doesn't open a folder's index page. The browser keeps a
// page's address (#/components/menu) through the redirect.
const REVIEW_APP = /^\/v12\/review-app\/?(\?.*)?$/;

export default function middleware(router) {
  if (process.env.STORYBOOK_INCLUDE_V12 !== 'true') return;
  router.use((req, res, next) => {
    if (!REVIEW_APP.test(req.url)) return next();
    res.statusCode = 302;
    res.setHeader('Location', '/iframe.html?id=v12-review--app&viewMode=story');
    res.end();
  });
}
