/**
 * Copyright IBM Corp. 2025
 *
 * Global type declaration for CSS Modules.
 * Allows TypeScript to understand `import styles from '*.module.css'`.
 */
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
