import { create } from '@storybook/theming';
import packageJson from '../package.json';

export default create({
  base: 'light',
  brandTitle: `@carbon/ai v${packageJson.version}`,
  brandUrl: 'https://github.com/carbon-design-system/carbon-for-ai',
  fontBase: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
  fontCode:
    '"IBM Plex Mono", Menlo, "DejaVu Sans Mono", "Bitstream Vera Sans Mono", Courier, monospace',
});
