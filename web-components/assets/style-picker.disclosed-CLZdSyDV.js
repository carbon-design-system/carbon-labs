import{D as e}from"./components-CyogJj3v.js";import{n as t,o as n,s as r}from"./blocks-BP-IZAWd.js";import{n as i}from"./lib-0Neh4XdI.js";import{n as a,t as o}from"./storybook-cdn-NiLDO3l0.js";import{t as s}from"./style-picker.disclosed.stories-CRhGsIMR.js";import{t as c}from"./package-DpCBmFH6.js";var l=e();function u(e){let u={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,h4:`h4`,img:`img`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...i(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(r,{of:s}),`
`,(0,l.jsx)(u.h1,{id:`style-picker`,children:`Style Picker`}),`
`,(0,l.jsxs)(u.ul,{children:[`
`,(0,l.jsxs)(u.li,{children:[(0,l.jsx)(u.strong,{children:`Initiative owner(s):`}),` Carbon for IBM Products`]}),`
`,(0,l.jsxs)(u.li,{children:[(0,l.jsx)(u.strong,{children:`Status:`}),` Draft`]}),`
`,(0,l.jsxs)(u.li,{children:[(0,l.jsx)(u.strong,{children:`Target library:`}),` Carbon for IBM Products`]}),`
`,(0,l.jsxs)(u.li,{children:[(0,l.jsx)(u.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` N/A`]}),`
`,(0,l.jsxs)(u.li,{children:[(0,l.jsx)(u.strong,{children:`Support channel:`}),` `,(0,l.jsx)(u.code,{children:`#carbon-labs`})]}),`
`]}),`
`,(0,l.jsxs)(u.blockquote,{children:[`
`,(0,l.jsxs)(u.p,{children:[`💡 Check our
`,(0,l.jsx)(u.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/style-picker`,rel:`nofollow`,children:`Stackblitz`}),`
example implementation.`]}),`
`]}),`
`,(0,l.jsx)(u.p,{children:(0,l.jsx)(u.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/style-picker`,rel:`nofollow`,children:(0,l.jsx)(u.img,{src:`https://developer.stackblitz.com/img/open_in_stackblitz.svg`,alt:`Edit carbon-labs`})})}),`
`,(0,l.jsx)(u.h2,{id:`overview`,children:`Overview`}),`
`,(0,l.jsx)(u.p,{children:`The style picker allows users to customize icons, colors, or shapes in their UI,
based on their preferences or requirements.`}),`
`,(0,l.jsx)(u.h2,{id:`getting-started`,children:`Getting started`}),`
`,(0,l.jsx)(u.p,{children:`Here's a quick example to get you started.`}),`
`,(0,l.jsx)(u.h3,{id:`js-via-import`,children:`JS (via import)`}),`
`,(0,l.jsx)(u.pre,{children:(0,l.jsx)(u.code,{className:`language-javascript`,children:`import '@carbon-labs/wc-style-picker/es/index.js';
`})}),`
`,(0,l.jsx)(u.h3,{id:`styles`,children:`Styles`}),`
`,(0,l.jsxs)(u.p,{children:[`You'll also need to import the theming tokens from `,(0,l.jsx)(u.code,{children:`@carbon/styles`}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,(0,l.jsx)(n,{children:`${a({components:[`style-picker`]},c)}`}),`
`,(0,l.jsx)(n,{children:`${o()}`}),`
`,(0,l.jsx)(u.h3,{id:`html`,children:`HTML`}),`
`,(0,l.jsx)(u.h4,{id:`disclosed-variant-with-color-and-icon-options`,children:`Disclosed variant with color and icon options`}),`
`,(0,l.jsx)(u.pre,{children:(0,l.jsx)(u.code,{className:`language-html`,children:`<clabs-style-picker
  align="right"
  ?open=\${true}
  heading="Choose color and icon"
  kind="disclosed">
  <cds-icon-button
    slot="trigger"
    kind=\${BUTTON_KIND.GHOST}
    @click=\${toggleButton}>
    \${ColorPalette16({ slot: "icon" })}
    <span slot="tooltip-content">Color palette</span>
  </cds-icon-button>
  <clabs-style-picker-sections>
    <clabs-style-picker-section heading="Icons">
      \${icons.map(
        (item) =>
          html\`
            <clabs-style-picker-option
              value=\${item.value}
              label=\${item.label}
              ?selected=\${item.value === 'apple'}
              @clabs-style-picker-option-select=\${(ev) =>
                changeIcon(ev)}>
              <clabs-style-picker-icon>
                \${item.renderIcon()}
              </clabs-style-picker-icon>
            </clabs-style-picker-option>
          \`
      )}
    </clabs-style-picker-section>
    <clabs-style-picker-section heading="Colors">
      \${colors.map(
        (group) =>
          html\`<clabs-style-picker-group heading=\${group.label}>
            \${group.items.map(
              (item) => html\`
                <clabs-style-picker-option
                  value=\${item.color}
                  label=\${item.label}
                  ?selected=\${item.label === 'Blue 60'}
                  @clabs-style-picker-option-select=\${(ev) =>
                    changeColor(ev)}>
                  <clabs-style-picker-color
                    color=\${item.color}
                    label=\${item.label}></clabs-style-picker-color>
                </clabs-style-picker-option>
              \`
            )}
          </clabs-style-picker-group> \`
      )}
    </clabs-style-picker-section>
  </clabs-style-picker-sections>
</clabs-style-picker>
`})}),`
`,(0,l.jsx)(u.h4,{id:`disclosed-variant-with-color-and-pictogram-options`,children:`Disclosed variant with color and pictogram options`}),`
`,(0,l.jsx)(u.pre,{children:(0,l.jsx)(u.code,{className:`language-html`,children:`<clabs-style-picker
  align="right"
  ?open=\${false}
  heading="Choose color and pictogram"
  kind="disclosed"
  >
  <cds-icon-button
    slot="trigger"
    kind="ghost"
    @click=\${toggleButton}>
    \${ColorPalette16({ slot: 'icon' })}
    <span slot="tooltip-content">Pictogram list</span>
  </cds-icon-button>
  <clabs-style-picker-sections>
    <clabs-style-picker-section heading="Icons">
      \${icons.map(
        (item) =>
          html\`
            <clabs-style-picker-option
              value=\${item.value}
              label=\${item.label}
              ?selected=\${item.value === 'apple'}
              @clabs-style-picker-option-select=\${(ev) =>
                changeIcon(ev)}>
              <clabs-style-picker-icon>
                \${item.renderIcon()}
              </clabs-style-picker-icon>
            </clabs-style-picker-option>
          \`
      )}
    </clabs-style-picker-section>
    <clabs-style-picker-section heading="Colors">
      \${colors.map(
        (group) =>
          html\`<clabs-style-picker-group heading=\${group.label}>
            \${group.items.map(
              (item) => html\`
                <clabs-style-picker-option
                  value=\${item.color}
                  label=\${item.label}
                  ?selected=\${item.label === 'Blue 60'}
                  @clabs-style-picker-option-select=\${(ev) =>
                    changeColor(ev)}>
                  <clabs-style-picker-color
                    color=\${item.color}
                    label=\${item.label}></clabs-style-picker-color>
                </clabs-style-picker-option>
              \`
            )}
          </clabs-style-picker-group> \`
      )}
    </clabs-style-picker-section>
    <clabs-style-picker-section heading="Pictograms" size="lg">
      \${pictograms.map(
        (group) =>
          html\`<clabs-style-picker-group heading=\${group.label}>
            \${group.items.map(
              (item) => html\`
                <clabs-style-picker-option
                  value=\${item.value}
                  label=\${item.label}
                  ?selected=\${item.label === 'Amsterdam'}
                  @clabs-style-picker-option-select=\${(ev) =>
                    changePictogram(ev, true)}>
                  \${renderCarbonPictogram({
                    ...item.pictogram,
                    attrs: {
                      ...item.pictogram.attrs,
                      width: '3rem',
                      height: '3rem',
                      'aria-label': item.label,
                    },
                  })}
                </clabs-style-picker-option>
              \`
            )}
          </clabs-style-picker-group> \`
      )}
    </clabs-style-picker-section>
  </clabs-style-picker-sections>
</clabs-style-picker>
`})}),`
`,(0,l.jsx)(u.h3,{id:`clabs-style-picker-attributes-and-properties`,children:`<clabs-style-picker> attributes and properties`}),`
`,(0,l.jsx)(t,{of:`clabs-style-picker`})]})}function d(e={}){let{wrapper:t}={...i(),...e.components};return t?(0,l.jsx)(t,{...e,children:(0,l.jsx)(u,{...e})}):u(e)}export{d as default};