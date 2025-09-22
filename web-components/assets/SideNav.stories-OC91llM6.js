import{C as b,T as r}from"./CommonHeader--880iOf4.js";import{x as s}from"./iframe-CbTyOyCw.js";import"./property-BGAdT5QC.js";import"./state-CSOMtuOC.js";import"./class-map-D0aAo4AP.js";import"./directive-CJw_OlP2.js";import"./shared-enums-Cve9M8Ar.js";import"./if-defined-771UyTsw.js";import"./16-B8z42sA9.js";import"./index-C3nV9oXV.js";import"./query-__j_ZMY6.js";import"./floating-ui.dom-CsHdpHNg.js";import"./constant-CsTv1dpG.js";import"./async-directive-a51eP5NP.js";import"./preload-helper-C1FmrZbK.js";/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const n={brand:{company:"IBM",product:"SaaS Console"},profile:{imageUrl:"",email:"user@test.com",displayName:"Sample User"},enableLogs:!0,managementConsole:{href:"https://www.ibm.com",text:"IBM SaaS Console",newTab:!0,newTabIcon:!0},mainSectionItems:[{label:"Instance name",text:"APIC-MB-DEV"},{label:"Region",text:"us-east-1 (N Virginia)"},{label:"Instance owner",text:"user@ibm.com"}],profileFooterLinks:[{text:"Logout",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout",newTab:!1,newTabIcon:!1}],assistMeConfigs:{productId:"a22453643cdb9e22397c6eab9e9da97d"},trialConfigs:{trialCount:30,warning:!1,trialLabel:"Trial days left",description:`Your trial ends on ${Date.now().toLocaleString("default")}`,links:[{type:r.contact,label:"Invite team member",href:"#"},{type:r.invite,label:"Contact sales",href:"https://www.ibm.com"}],actionText:"Buy",actionLink:"#"},switcherConfigs:[{floatLeft:!0,items:[{label:"Designer",href:"#",carbonIcon:"Checkmark",id:"",text:""},{label:"Dashboard",href:"#",carbonIcon:"Checkmark",id:"",text:""}]}]},v={isCollapsible:!1,buttonLabel:"Open menu",sidebarLabel:"Side navigation",links:[{href:"#",label:"Link 1",iconName:"Settings",isActive:!0,sideNavMenuItems:[]},{href:"#",label:"Link 2",iconName:"Launch",sideNavMenuItems:[]},{href:"#",label:"Link 3",iconName:"Launch",sideNavMenuItems:[]}],isRail:!1,isChildOfHeader:!1},f={isCollapsible:!0,autoCollapseOnLeave:!0,buttonLabel:"Open menu",sidebarLabel:"Side navigation",isRail:!1,links:[],isChildOfHeader:!1,groups:[{links:[{href:"#",label:"Home",iconName:"Home",isActive:!0,sideNavMenuItems:[]},{href:"#",label:"Access management",iconName:"User",isActive:!1,sideNavMenuItems:[]}]},{links:[{label:"APIs",iconName:"Api",isSideNavMenuItems:!0,sideNavMenuItems:[{href:"#",label:"API Connect",isActive:!1}],href:""},{label:"App Integration",iconName:"FlowConnection",isSideNavMenuItems:!0,sideNavMenuItems:[{href:"#",label:"webMethods Integration",isActive:!1},{href:"#",label:"App Connect",isActive:!1}],href:""},{href:"#",label:"Event endpoint management",iconName:"IbmEventAutomation",sideNavMenuItems:[]}]},{links:[{href:"#",label:"Metering",iconName:"Meter",sideNavMenuItems:[]},{href:"#",label:"End-to-end monitoring",iconName:"Analytics",sideNavMenuItems:[]}]}]},N={theme:"g10",isExpandable:!0,isCollapsible:!0,autoCollapseOnLeave:!0,sideNav:{isRail:!0,isPersistent:!0,isChildOfHeader:!0},links:[{label:"Subscriptions",iconName:"Launch",href:"",sideNavMenuItems:[]},{iconName:"Settings",label:"Account settings",isSideNavMenuItems:!0,href:"",sideNavMenuItems:[{label:"Details",isActive:!1,href:""},{label:"Access management",iconName:"UserMultiple",isActive:!1,href:""}]}],buttonLabel:"",sidebarLabel:"",isRail:!1,isChildOfHeader:!1},H={title:"Components/Global Header/Subcomponents/Side Nav",tags:["autodocs"],render:()=>new b,args:{}},e={render:()=>s`
        <div role="main">
            <apaas-common-header
                .headerProps="${{...n,sideNav:v}}"></common-header>
        </div>
    `},a={render:()=>s`
        <div role="main">
            <apaas-common-header
                .headerProps="${{...n,sideNav:f}}"></common-header>
        </div>
    `},i={render:()=>s`
        <div role="main">
            <apaas-common-header
                .headerProps="${{...n,sideNavPropsV2:N}}"></common-header>
        </div>
    `};var o,t,l;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header
                .headerProps="\${{
    ...headerProps,
    sideNav: sideNavBasic
  }}"></common-header>
        </div>
    \`
}`,...(l=(t=e.parameters)==null?void 0:t.docs)==null?void 0:l.source}}};var m,d,c;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header
                .headerProps="\${{
    ...headerProps,
    sideNav: sideNavGroups
  }}"></common-header>
        </div>
    \`
}`,...(c=(d=a.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var p,u,h;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header
                .headerProps="\${{
    ...headerProps,
    sideNavPropsV2: sideNavWithV2
  }}"></common-header>
        </div>
    \`
}`,...(h=(u=i.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};const V=["SideNavBasic","SideNavWithGroups","SideNavWithPropsV2"];export{e as SideNavBasic,a as SideNavWithGroups,i as SideNavWithPropsV2,V as __namedExportsOrder,H as default};
