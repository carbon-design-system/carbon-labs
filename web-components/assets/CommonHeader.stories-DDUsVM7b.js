import{C as B,T as d}from"./CommonHeader-Dx15vzq3.js";import{x as e}from"./iframe-DlJF4vW_.js";import"./property-CRREONOV.js";import"./state-B0_tIRD0.js";import"./class-map-km3jP9Hl.js";import"./directive-CJw_OlP2.js";import"./shared-enums-CiWMnk7E.js";import"./if-defined-lQInSd2J.js";import"./16-B8z42sA9.js";import"./index-C3nV9oXV.js";import"./query-__j_ZMY6.js";import"./floating-ui.dom-CsHdpHNg.js";import"./constant-CsTv1dpG.js";import"./async-directive-B1JbLT71.js";import"./preload-helper-C1FmrZbK.js";/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const l=new Date;l.setDate(l.getDate()+30);const E={onClick:o=>{o.preventDefault(),console.log("chatbot onclick triggered.")}},D={openNotifications:!1,onClick:()=>{console.log("notification onclick triggered.")},isActive:!0},m={brand:{company:"IBM",product:"SaaS Console"},profile:{imageUrl:"",email:"user@test.com",displayName:"Sample User"},enableLogs:!0,managementConsole:{href:"https://www.ibm.com",text:"IBM SaaS Console",newTab:!0,newTabIcon:!0},mainSectionItems:[{label:"Instance name",text:"APIC-MB-DEV"},{label:"Region",text:"us-east-1 (N Virginia)"},{label:"Instance owner",text:"user@ibm.com"}],profileFooterLinks:[{text:"Logout",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout",newTab:!1,newTabIcon:!1}],sideNav:{isCollapsible:!1,buttonLabel:"Open menu",sidebarLabel:"Side navigation",links:[{href:"#",label:"Link 1",iconName:"Settings",isActive:!0,sideNavMenuItems:[]},{href:"#",label:"Link 2",iconName:"Launch",sideNavMenuItems:[]},{href:"#",label:"Link 3",iconName:"Launch",sideNavMenuItems:[]}],isRail:!1,isChildOfHeader:!1},assistMeConfigs:{productId:"a22453643cdb9e22397c6eab9e9da97d"},trialConfigs:{trialCount:30,warning:!1,trialLabel:"Trial days left",description:`Your trial ends on ${l.toLocaleString("default",{month:"long",day:"numeric",year:"numeric"})}`,links:[{type:d.contact,label:"Invite team member",href:"#"},{type:d.invite,label:"Contact sales",href:"https://www.ibm.com"}],actionText:"Buy",actionLink:"#"},switcherConfigs:[{iconsLeft:!0,initialSelectedIndex:1,items:[{label:"Development",isHeading:!0,id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 1",id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 2",id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Production",isHeading:!0,id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 3",href:"#",id:"",text:"",carbonIcon:"Checkmark",isLastInList:!0},{label:"Manage environments",href:"#",id:"",text:"",carbonIcon:"Settings",isLinkItem:!0}]}]},T={brand:{company:"IBM",product:"SaaS Console"},noAuthHeaderLinks:[{text:"Docs",href:"/docs",carbonIcon:"Document",arialLabel:"Docs"},{href:"/login",text:"Log in",carbonIcon:"Login",arialLabel:"Log in"}]},U={isHybridIpaas:!0,brand:{company:"IBM",product:"webMethods Hybrid Integration"},capabilityName:{label:"App Connect"},profile:{imageUrl:null,email:"user@test.com",displayName:"Sample User"},managementConsoleHref:"#",mainSectionItems:[{label:"Instance name",text:"APIC-MB-DEV"},{label:"Region",text:"us-east-1 (N Virginia)"},{label:"Instance owner",text:"user@ibm.com"}],profileFooterLinks:[{text:"Logout",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout"}],assistMeConfigs:{productId:"a22453643cdb9e22397c6eab9e9da97d"},switcherConfigs:[{floatLeft:!0,iconsLeft:!0,items:[{label:"Development",isHeading:!0},{label:"Environment 5992719015825413407182805",href:"#",carbonIcon:"Checkmark"},{label:"Environment 2",href:"#",carbonIcon:"Checkmark"},{label:"Production",isHeading:!0},{label:"Environment 3",href:"#",carbonIcon:"Checkmark",isLastInList:!0}]}],sideNav:{isCollapsible:!0,autoCollapseOnLeave:!0,buttonLabel:"Open menu",sidebarLabel:"Side navigation",groups:[{links:[{href:"https://ibm.com",label:"Home",iconName:"Home",isActive:!1},{href:"http://google.com",label:"Access management",iconName:"User",isActive:!1}]},{links:[{label:"APIs",iconName:"Api",isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:"#",label:"API Connect"}]},{label:"App Integration",iconName:"FlowConnection",isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:"#",label:"webMethods Integration"},{href:"https://ibm.com",label:"App Connect"}]},{href:"#",label:"Event endpoint management",iconName:"IbmEventAutomation"}]},{links:[{href:"#",label:"Metering",iconName:"Meter"},{href:"#",label:"End-to-end monitoring",iconName:"Analytics"}]}]},notificationConfigs:{notifications:[],openNotifications:!1,onClick:()=>{console.log("notification onclick triggered.")},hasNewNotifications:!0},chatBotConfigs:{onClick:()=>{}}},O={brand:{company:"IBM",product:"SaaS Console"},profile:{imageUrl:"",email:"user@test.com",displayName:"Sample User"},enableLogs:!0,profileFooterLinks:[{text:"Logout",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout",newTab:!1,newTabIcon:!1}],helperLinks:[{link:"https://ibm.biz/automation-explorer",label:"Automation Explorer documentation",onclick:()=>{window.open("https://ibm.biz/automation-explorer")}},{label:"Connector Development Kit documentation",onclick:()=>{window.open("https://ibm.biz/connector-development-kit")}},{link:"https://ibm.biz/automationexplorer",label:"Automation Explorer Community",target:"_blank"}]},z={placeholder:"Search...",callback:o=>{console.log(o)},submitCallback:o=>{console.log(`Search triggered with: '${o}'`)}},oe={title:"Components/Global Header/Subcomponents/Common Header",tags:["autodocs"],render:()=>new B,args:{}},a={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${m}"></common-header>
        </div>
    `},n={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${T}"></common-header>
        </div>
    `},r={name:"webMethods Hybrid Integration",render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${U}"></common-header>
        </div>
    `},t={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${O}"></common-header>
        </div>
    `},i={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${{...m,chatBotConfigs:E}}"></common-header>
        </div>
    `},s={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${{...m,notificationConfigs:D}}"></common-header>
        </div>
    `},c={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${{...m,searchConfigs:z}}"></common-header>
        </div>
    `};var p,h,b;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${headerProps}"></common-header>
        </div>
    \`
}`,...(b=(h=a.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var u,g,f;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${headerPropsUnauthenticated}"></common-header>
        </div>
    \`
}`,...(f=(g=n.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var v,I,C;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'webMethods Hybrid Integration',
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${hybridIPaasHeaderProps}"></common-header>
        </div>
    \`
}`,...(C=(I=r.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};var k,L,P;t.parameters={...t.parameters,docs:{...(k=t.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${headerPropsWithHelpLinks}"></common-header>
        </div>
    \`
}`,...(P=(L=t.parameters)==null?void 0:L.docs)==null?void 0:P.source}}};var S,N,w;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${{
    ...headerProps,
    chatBotConfigs
  }}"></common-header>
        </div>
    \`
}`,...(w=(N=i.parameters)==null?void 0:N.docs)==null?void 0:w.source}}};var x,y,M;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${{
    ...headerProps,
    notificationConfigs
  }}"></common-header>
        </div>
    \`
}`,...(M=(y=s.parameters)==null?void 0:y.docs)==null?void 0:M.source}}};var H,A,$;c.parameters={...c.parameters,docs:{...(H=c.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${{
    ...headerProps,
    searchConfigs
  }}"></common-header>
        </div>
    \`
}`,...($=(A=c.parameters)==null?void 0:A.docs)==null?void 0:$.source}}};const ae=["Basic","UnauthenticatedContext","WebMethodsHybridIntegration","HelpLinks","ChatBot","Notifications","Search"];export{a as Basic,i as ChatBot,t as HelpLinks,s as Notifications,c as Search,n as UnauthenticatedContext,r as WebMethodsHybridIntegration,ae as __namedExportsOrder,oe as default};
