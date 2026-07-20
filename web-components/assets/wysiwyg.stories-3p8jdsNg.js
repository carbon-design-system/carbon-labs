import{R as e}from"./iframe-Dk3OmjiN.js";import"./button-Bk1f15PH.js";import{a as t,t as n}from"./story-helpers-CbwY3ErU.js";var r={title:`Components/Wysiwyg`,tags:[`squad`,`incubating`],component:`clabs-wysiwyg`,argTypes:{toolbarSize:{control:`select`,options:[`sm`,`md`,`lg`],description:`Toolbar button size`},content:{control:`text`,description:`Initial content of the editor`}},args:{toolbarSize:`md`,content:t},decorators:[t=>e`
      <style>
        #main-content {
          block-size: 100dvh;
        }
      </style>
      ${t()}
    `],parameters:{docs:{description:{component:`WYSIWYG Editor component built with TipTap`}}}},i={render:t=>e`
      <clabs-wysiwyg
        .extensions=${n}
        .content=${t.content}
        @content-change=${e=>{console.log(`content-change`,e)}}
        toolbar-size=${t.toolbarSize}>
      </clabs-wysiwyg>
    `},a={render:t=>e`
      <clabs-wysiwyg
        .extensions=${n.map(({toolbarRender:e,...t})=>t)}
        .content=${t.content}
        @content-change=${e=>{console.log(`content-change`,e)}}
        toolbar-size=${t.toolbarSize}>
      </clabs-wysiwyg>
    `};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  /**
   * Render the WYSIWYG editor with all extensions
   * @param {object} args - Story arguments
   * @returns {TemplateResult} Template result
   */
  render: args => {
    return html\`
      <clabs-wysiwyg
        .extensions=\${allExtensions}
        .content=\${args.content}
        @content-change=\${e => {
      console.log('content-change', e);
    }}
        toolbar-size=\${args.toolbarSize}>
      </clabs-wysiwyg>
    \`;
  }
}`,...i.parameters?.docs?.source},description:{story:`Default story with all extensions enabled and comprehensive demo content`,...i.parameters?.docs?.description}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  /**
   * Render the WYSIWYG editor without toolbar
   * @param {object} args - Story arguments
   * @returns {TemplateResult} Template result
   */
  render: args => {
    // Strip toolbarRender from extensions to hide toolbar
    const extensionsForEditor = allExtensions.map(({
      toolbarRender: _toolbarRender,
      ...extension
    }) => extension);
    return html\`
      <clabs-wysiwyg
        .extensions=\${extensionsForEditor}
        .content=\${args.content}
        @content-change=\${e => {
      console.log('content-change', e);
    }}
        toolbar-size=\${args.toolbarSize}>
      </clabs-wysiwyg>
    \`;
  }
}`,...a.parameters?.docs?.source},description:{story:`Editor without toolbar - extensions are used but toolbar is hidden`,...a.parameters?.docs?.description}}};var o=[`Default`,`NoToolbar`];export{i as Default,a as NoToolbar,o as __namedExportsOrder,r as default};