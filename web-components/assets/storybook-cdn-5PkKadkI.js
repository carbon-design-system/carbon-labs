function e(e,t){let n=``;return e.forEach(e=>{n+=`<script type="module" src="https://1.www.s81c.com/common/carbon/labs/${e}/${t}/index.min.js"><\/script>\n`}),n}var t=({components:t},n)=>`
### JS (via CDN)

 > NOTE: Only one version of artifacts should be used. Mixing versions will cause rendering issues.

 \`\`\`html
 // SPECIFIC VERSION (available starting v2.0.0)
 ${e(t,`v${n.version}`)}
 \`\`\`
   `,n=()=>`
### Carbon CDN style helpers (optional)

There are optional CDN artifacts available that can assist with global Carbon
styles in lieu of including into your specific application bundle.

[Click here to learn more](https://github.com/carbon-design-system/carbon-for-ibm-dotcom/blob/main/packages/web-components/docs/carbon-cdn-style-helpers.md)


  `;export{t as n,n as t};