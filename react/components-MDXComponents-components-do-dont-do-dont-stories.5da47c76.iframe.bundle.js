"use strict";(self.webpackChunk_carbon_labs_react=self.webpackChunk_carbon_labs_react||[]).push([[2322],{"./src/components/MDXComponents/components/do-dont/do-dont.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>do_dont_stories});var react=__webpack_require__("../../node_modules/react/index.js"),do_dont=__webpack_require__("./src/components/MDXComponents/components/do-dont/do-dont.tsx"),do_dont_row=__webpack_require__("./src/components/MDXComponents/components/do-dont/do-dont-row.tsx");const light_theme_namespaceObject=__webpack_require__.p+"static/media/light-theme.ec0fc6c5.jpg";function _extends(){return _extends=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var r in t)({}).hasOwnProperty.call(t,r)&&(n[r]=t[r])}return n},_extends.apply(null,arguments)}const do_dont_stories={title:"MDX Components/DoDont",component:do_dont_row.v,subcomponents:{DoDont:do_dont.l},argTypes:{children:{control:!1},className:{control:!1}}},Default=(args=>react.createElement(do_dont_row.v,null,react.createElement(do_dont.l,_extends({aspectRatio:"1:1",text:"DoDont example",captionTitle:"Caption title",caption:"This is a caption.",type:"do"},args)),react.createElement(do_dont.l,_extends({aspectRatio:"1:1",type:"dont"},args),react.createElement("img",{alt:"Use markdown in mdx files. ![](dodont.png)",src:light_theme_namespaceObject})))).bind({});Default.args={};const __namedExportsOrder=["Default"];Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:'args => <DoDontRow>\n    <DoDont aspectRatio="1:1" text="DoDont example" captionTitle="Caption title" caption="This is a caption." type="do" {...args}></DoDont>\n    <DoDont aspectRatio="1:1" type="dont" {...args}>\n      <img alt="Use markdown in mdx files. ![](dodont.png)" src={lightTheme} />\n    </DoDont>\n  </DoDontRow>',...Default.parameters?.docs?.source}}}}}]);