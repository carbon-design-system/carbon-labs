/* @web/test-runner snapshot v1 */
export const snapshots = {};

snapshots[
  'clabs-resizer-panel should render clabs-resizer-panel'
] = `<clabs-resizer-panel>
  Panel content
</clabs-resizer-panel>
`;
/* end snapshot clabs-resizer-panel should render clabs-resizer-panel */

snapshots[
  'clabs-resizer-handle should render clabs-resizer-handle'
] = `<clabs-resizer-handle
  aria-live="assertive"
  aria-orientation="horizontal"
  aria-valuemax="100"
  aria-valuemin="0"
  aria-valuenow="50"
  axis="y"
  role="separator"
  tabindex="0"
>
</clabs-resizer-handle>
`;
/* end snapshot clabs-resizer-handle should render clabs-resizer-handle */

snapshots[
  'clabs-resizer-handle-pivot should render clabs-resizer-handle-pivot'
] = `<clabs-resizer-handle-pivot
  position="undefined"
  slot="pivot"
>
</clabs-resizer-handle-pivot>
`;
/* end snapshot clabs-resizer-handle-pivot should render clabs-resizer-handle-pivot */

snapshots[
  'clabs-resizer-grid should render clabs-resizer-grid'
] = `<clabs-resizer-grid>
  <clabs-resizer-panel slot="left">
    Left panel
  </clabs-resizer-panel>
  <clabs-resizer-panel slot="right">
    Right panel
  </clabs-resizer-panel>
</clabs-resizer-grid>
`;
/* end snapshot clabs-resizer-grid should render clabs-resizer-grid */
