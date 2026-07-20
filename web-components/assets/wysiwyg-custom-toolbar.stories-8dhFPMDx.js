import{R as e}from"./iframe-Dk3OmjiN.js";import"./icon-button-DaQzZYuv.js";import{t}from"./icon-loader-BI33ALmp.js";import{i as n,n as r,r as i,s as a,t as o}from"./story-helpers-CbwY3ErU.js";import{n as s}from"./16-Dw8yrYej.js";var c={...o.find(e=>e.name===`tables`),toolbarRender:(n,r=`md`)=>(c.editor=n,e`
      <div class="${a}__toolbar-group">
        <cds-icon-button
          kind="secondary"
          .size=${r}
          ?disabled=${!n?.can().insertTable()}
          @click=${()=>n?.chain().focus().insertTable({rows:3,cols:3,withHeaderRow:!0}).run()}>
          ${t(s,{slot:`icon`})}
          <span slot="tooltip-content">Insert Table</span>
        </cds-icon-button>
      </div>
    `)},l=t=>e`
  <div class="context-menu">
    <button @click=${e=>t(e,`addRowBefore`)}>
      Add Row Before
    </button>
    <button @click=${e=>t(e,`addRowAfter`)}>Add Row After</button>
    <button data-delete @click=${e=>t(e,`deleteRow`)}>
      Delete Row
    </button>
    <hr />
    <button @click=${e=>t(e,`addColumnBefore`)}>
      Add Column Before
    </button>
    <button @click=${e=>t(e,`addColumnAfter`)}>
      Add Column After
    </button>
    <button data-delete @click=${e=>t(e,`deleteColumn`)}>
      Delete Column
    </button>
    <hr data-divider />
    <button data-action="merge" @click=${e=>t(e,`mergeCells`)}>
      Merge Cells
    </button>
    <button data-action="split" @click=${e=>t(e,`splitCell`)}>
      Split Cell
    </button>
    <hr data-divider />
    <button data-delete @click=${e=>t(e,`deleteTable`)}>
      Delete Table
    </button>
  </div>
`,u={title:`Components/Wysiwyg/Customizations`,tags:[`squad`,`incubating`],component:`clabs-wysiwyg`,argTypes:{toolbarSize:{control:`select`,options:[`sm`,`md`,`lg`],description:`Toolbar button size`},content:{control:`text`,description:`Initial content of the editor`}},args:{toolbarSize:`md`,content:n},decorators:[t=>e`
      <style>
        #main-content {
          block-size: 100dvh;
        }
        ${r}
      </style>
      ${t()}
    `]},d={render:t=>{let n=o.map(e=>e.name===`tables`?c:e);return requestAnimationFrame(()=>{let e=document.querySelector(`.context-menu`),t=document.querySelector(`clabs-wysiwyg`)?.shadowRoot?.querySelector(`.ProseMirror`);if(!t||!e||!c.editor||t.dataset.contextMenu)return;t.dataset.contextMenu=`initialized`;let n=i(c.editor,e);t.addEventListener(`contextmenu`,e=>{e.target.closest(`table`)&&(e.preventDefault(),n.showMenu(e.pageX,e.pageY))}),document.addEventListener(`click`,()=>e.classList.remove(`open`)),c.menuManager=n}),e`
      <clabs-wysiwyg
        .extensions=${n}
        .content=${t.content}
        @content-change=${e=>{console.log(`content-change`,e)}}
        toolbar-size=${t.toolbarSize}></clabs-wysiwyg>
      ${l((e,t)=>c.menuManager?.runAction(e,t))}
    `}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  /**
   * Render story
   * @param {object} args - Story args
   * @returns {TemplateResult} Template
   */
  render: args => {
    // Create extensions with custom table toolbar
    const extensions = allExtensions.map(ext => ext.name === 'tables' ? CustomTable : ext);

    // Setup context menu after render
    requestAnimationFrame(() => {
      const menu = document.querySelector('.context-menu');
      const wysiwyg = document.querySelector('clabs-wysiwyg');
      const editorEl = wysiwyg?.shadowRoot?.querySelector('.ProseMirror');
      if (!editorEl || !menu || !CustomTable.editor || editorEl.dataset.contextMenu) {
        return;
      }
      editorEl.dataset.contextMenu = 'initialized';
      const menuManager = createContextMenuManager(CustomTable.editor, menu);

      // Handle right-click on tables
      editorEl.addEventListener('contextmenu', evt => {
        if (!evt.target.closest('table')) {
          return;
        }
        evt.preventDefault();
        menuManager.showMenu(evt.pageX, evt.pageY);
      });

      // Close menu on click outside
      document.addEventListener('click', () => menu.classList.remove('open'));

      // Store for context menu buttons
      CustomTable.menuManager = menuManager;
    });
    return html\`
      <clabs-wysiwyg
        .extensions=\${extensions}
        .content=\${args.content}
        @content-change=\${e => {
      console.log('content-change', e);
    }}
        toolbar-size=\${args.toolbarSize}></clabs-wysiwyg>
      \${renderContextMenu((e, action) => CustomTable.menuManager?.runAction(e, action))}
    \`;
  }
}`,...d.parameters?.docs?.source}}};var f=[`CustomTableToolbar`];export{d as CustomTableToolbar,f as __namedExportsOrder,u as default};