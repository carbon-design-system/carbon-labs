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
import { camelCase, paramCase, pascalCase, headerCase } from 'change-case';
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
  CAMEL_NAME: camelCase(name),
  TITLE_NAME: headerCase(name),
  STYLE_NAME: paramCase(name),
};

// compiles the template
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

// // Update src/global/js/package-settings.js
// const settingsPath = join('src', 'global', 'js', 'package-settings.js');
// const settingsData = fs.readFileSync(settingsPath, 'utf-8');

// // locate place to add new components
// const newComponentsHereRegex = /(\s+)\/\* new component flags here /;
// const here = settingsData.match(newComponentsHereRegex);

// // add new component
// const newSettingsData = `${settingsData.substr(0, here.index)}${here[1]}${
//   substitutions.DISPLAY_NAME
// }: false,${settingsData.substr(here.index)}`;
// outputFileSync(settingsPath, newSettingsData);

// // add new component export to end of src/components/index.js
// const componentIndexPath = join('src', 'components', 'index.js');
// const componentIndexData = fs.readFileSync(componentIndexPath, 'utf-8');

// const componentIndexPathTS = join('src', 'components', 'index.ts');
// const componentIndexDataTS = fs.readFileSync(componentIndexPathTS, 'utf-8');

// outputFileSync(
//   componentIndexPath,
//   componentIndexData +
//     `export { ${substitutions.DISPLAY_NAME} } from './${substitutions.DISPLAY_NAME}';\n`
// );

// outputFileSync(
//   componentIndexPathTS,
//   componentIndexDataTS + `export * from './${substitutions.DISPLAY_NAME}';\n`
// );

// // NOTE: Styles except storybook are in a separate package @carbon/ibm-products-styles
// const stylePackagePath = '../ibm-products-styles';
// // add new component to end of src/components/_index.scss
// const componentSCSSIndexPath = join(
//   stylePackagePath,
//   'src',
//   'components',
//   '_index.scss'
// );
// const componentSCSSIndexData = fs.readFileSync(componentSCSSIndexPath, 'utf-8');
// outputFileSync(
//   componentSCSSIndexPath,
//   componentSCSSIndexData + `@use './${substitutions.DISPLAY_NAME}';\n`
// );

// // add new component to end of src/components/_index-with-carbon.scss
// const componentWithCarbonSCSSIndexPath = join(
//   stylePackagePath,
//   'src',
//   'components',
//   '_index-with-carbon.scss'
// );
// const componentWithCarbonSCSSIndexData = fs.readFileSync(
//   componentWithCarbonSCSSIndexPath,
//   'utf-8'
// );
// outputFileSync(
//   componentWithCarbonSCSSIndexPath,
//   componentWithCarbonSCSSIndexData +
//     `@use './${substitutions.DISPLAY_NAME}/index-with-carbon' as *;\n`
// );

// fs.mkdirSync(
//   join(`${stylePackagePath}`, `src/components/${substitutions.DISPLAY_NAME}`)
// );
// // move files to correct location
// [
//   '_carbon-imports.scss',
//   '_index.scss',
//   '_index-with-carbon.scss',
//   `_${substitutions.STYLE_NAME}.scss`,
// ].forEach((file) => {
//   const curPath = join(`src/components/${substitutions.DISPLAY_NAME}/${file}`);
//   const newPath = join(stylePackagePath, curPath);
//   fs.renameSync(curPath, newPath);
// });
