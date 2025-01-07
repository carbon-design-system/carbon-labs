/**
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs';
import chalk from 'chalk';
import { outputFileSync } from 'fs-extra/esm';
import { sync } from 'glob';
import { kebabCase, pascalCase, capitalCase } from 'change-case';
import path, { join, relative, resolve } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://www.npmjs.com/package/yargs#usage
const argv = yargs(hideBin(process.argv)).argv;

const name = argv._[0];

// If no component name is given in args throw an error
if (!name) {
  console.error(
    `${chalk.red(
      'Error:'
    )} No component name given. e.g. yarn generate TestComponent`
  );
  process.exit(1);
}

const substitutions = {
  DISPLAY_NAME: pascalCase(name),
  FULL_YEAR: new Date().getFullYear(),
  TITLE_NAME: capitalCase(name),
  STYLE_NAME: kebabCase(name),
};

/**
 * Takes template path and compiles
 *
 * @param {*} template template path
 */
const compile = (template) =>
  Object.entries(substitutions).reduce(
    (accumulator, [expression, input]) =>
      accumulator.replace(new RegExp(expression, 'g'), input),
    template
  );

const templatesPath = join(__dirname, 'templates');
sync(resolve(templatesPath, '**/*')).forEach((template) => {
  if (fs.lstatSync(template).isDirectory()) {
    return; // do nothing for a folder
  }

  let relativePath = relative(templatesPath, template);

  // needed to name the template package.json file to 'package-edit.json' otherwise
  // yarn tries to register the template as a package, so swapping back to package.json here
  if (relativePath.includes('package-edit.json')) {
    relativePath = relativePath.replace('package-edit.json', 'package.json');
  }

  const compiledPath = compile(relativePath);
  let path;

  if (relativePath.startsWith('example')) {
    path = join(
      '../../examples/react',
      substitutions.DISPLAY_NAME,
      compiledPath.substr('example/'.length)
    );
  } else {
    path = join('src', 'components', substitutions.DISPLAY_NAME, compiledPath);
  }

  const data = compile(fs.readFileSync(template, 'utf8'));

  outputFileSync(path, data);

  console.log(
    `${chalk.green('create')} ${path} (${
      new TextEncoder().encode(data).length
    } bytes)`
  );
});
