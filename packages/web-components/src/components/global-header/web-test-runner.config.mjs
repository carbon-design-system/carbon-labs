import {
  vitePlugin,
  removeViteLogging,
} from '@remcovaes/web-test-runner-vite-plugin';

export default {
  concurrency: 1,
  files: [
    'components/global-header/src/**/*.test.ts',
    'components/global-header/src/**/*.test.tsx',
    '__tests__/**/*.test.js',
  ],
  filterBrowserLogs: removeViteLogging,
  testRunnerHtml: (testFramework) =>
    `<!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Vite + Lit + TS</title>
            <script type="module" src="${testFramework}"></script>
            <script type="module">
                /* Hack to disable Lit dev mode warnings */
                const systemWarn = window.console.warn;
                window.console.warn = (...args) => {
                    if (args[0].indexOf('Lit is in dev mode.') === 0) {
                        return;
                    }
                    if (args[0].indexOf('Multiple versions of Lit loaded.') === 0) {
                        return;
                    }
                    systemWarn(...args);
                };
            </script>
          </head>
          <body>
            
          </body>
        </html>
        `,
  plugins: [
    vitePlugin({
      viteConfig: {
        optimizeDeps: {
          include: ['react', 'react-dom', '@lit/react'],
          esbuildOptions: {
            // Ensure React is bundled with proper default export interop
            mainFields: ['module', 'main'],
          },
        },
      },
    }),
  ],
  coverageConfig: {
    report: true,
    reportDir: 'test-coverage',
    threshold: {
      statements: 98,
      branches: 91,
      functions: 97,
      lines: 98,
    },
    include: ['components/**/*.ts', 'components/**/*.tsx'],
    exclude: ['**/node_modules/**'],
  },
};
