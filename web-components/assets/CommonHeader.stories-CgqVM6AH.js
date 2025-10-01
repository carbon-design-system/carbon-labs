import{C as A,T as d}from"./CommonHeader-Bj3TQ5w7.js";import{x as e}from"./iframe-BtC9pI3Y.js";import"./property-BJTUfCDx.js";import"./state-O4dlII1o.js";import"./class-map-BoSdL4Ox.js";import"./directive-CJw_OlP2.js";import"./shared-enums-BNjkCyqv.js";import"./if-defined-DzPZjxmn.js";import"./16-B8z42sA9.js";import"./index-C3nV9oXV.js";import"./query-__j_ZMY6.js";import"./floating-ui.dom-CsHdpHNg.js";import"./constant-CsTv1dpG.js";import"./async-directive-BFTvDiUd.js";import"./preload-helper-C1FmrZbK.js";/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const l=new Date;l.setDate(l.getDate()+30);const D={onClick:a=>{a.preventDefault(),console.log("chatbot onclick triggered.")}},E={openNotifications:!1,onClick:()=>{console.log("notification onclick triggered.")},isActive:!0},m={brand:{company:"IBM",product:"SaaS Console"},profile:{imageUrl:"",email:"user@test.com",displayName:"Sample User"},enableLogs:!0,managementConsole:{href:"https://www.ibm.com",text:"IBM SaaS Console",newTab:!0,newTabIcon:!0},mainSectionItems:[{label:"Instance name",text:"APIC-MB-DEV"},{label:"Region",text:"us-east-1 (N Virginia)"},{label:"Instance owner",text:"user@ibm.com"}],profileFooterLinks:[{text:"Logout",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout",newTab:!1,newTabIcon:!1}],sideNav:{isCollapsible:!1,buttonLabel:"Open menu",sidebarLabel:"Side navigation",links:[{href:"#",label:"Link 1",iconName:"Settings",isActive:!0,sideNavMenuItems:[]},{href:"#",label:"Link 2",iconName:"Launch",sideNavMenuItems:[]},{href:"#",label:"Link 3",iconName:"Launch",sideNavMenuItems:[]}],isRail:!1,isChildOfHeader:!1},assistMeConfigs:{productId:"a22453643cdb9e22397c6eab9e9da97d"},trialConfigs:{trialCount:30,warning:!1,trialLabel:"Trial days left",description:`Your trial ends on ${l.toLocaleString("default",{month:"long",day:"numeric",year:"numeric"})}`,links:[{type:d.contact,label:"Invite team member",href:"#"},{type:d.invite,label:"Contact sales",href:"https://www.ibm.com"}],actionText:"Buy",actionLink:"#"},switcherConfigs:[{iconsLeft:!0,initialSelectedIndex:1,items:[{label:"Development",isHeading:!0,id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 1",id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 2",id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Production",isHeading:!0,id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 3",href:"#",id:"",text:"",carbonIcon:"Checkmark",isLastInList:!0},{label:"Manage environments",href:"#",id:"",text:"",carbonIcon:"Settings",isLinkItem:!0}]}]},T={brand:{company:"IBM",product:"SaaS Console"},noAuthHeaderLinks:[{text:"Docs",href:"/docs",carbonIcon:"Document",arialLabel:"Docs"},{href:"/login",text:"Log in",carbonIcon:"Login",arialLabel:"Log in"}]},U={isHybridIpaas:!0,brand:{company:"IBM",product:"Mock Product"},capabilityName:{label:"Capability"},profile:{imageUrl:null,email:"user@test.com",displayName:"Sample User"},managementConsoleHref:"#",mainSectionItems:[{label:"Instance name",text:"APIC-MB-DEV"},{label:"Region",text:"us-east-1 (N Virginia)"},{label:"Instance owner",text:"user@ibm.com"}],profileFooterLinks:[{text:"Logout",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout"}],assistMeConfigs:{productId:"a22453643cdb9e22397c6eab9e9da97d"},switcherConfigs:[{floatLeft:!0,iconsLeft:!0,items:[{label:"Development",isHeading:!0},{label:"Environment 5992719015825413407182805",href:"#",carbonIcon:"Checkmark"},{label:"Environment 2",href:"#",carbonIcon:"Checkmark"},{label:"Production",isHeading:!0},{label:"Environment 3",href:"#",carbonIcon:"Checkmark",isLastInList:!0}]}],sideNav:{isCollapsible:!0,autoCollapseOnLeave:!0,buttonLabel:"Open menu",sidebarLabel:"Side navigation",groups:[{links:[{href:"#",label:"Home",iconName:"Home",isActive:!1},{href:"#",label:"Access management",iconName:"User",isActive:!1}]},{links:[{label:"APIs",iconName:"Document",isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:"#",label:"Connect"}]},{label:"App Integration",iconName:"Email",isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:"#",label:"Integration"},{href:"#",label:"Apps"}]},{href:"#",label:"Events",iconName:"RequestQuote"}]},{links:[{href:"#",label:"Metering",iconName:"Checkmark"},{href:"#",label:"Monitoring",iconName:"Share"}]}]},notificationConfigs:{notifications:[],openNotifications:!1,onClick:()=>{console.log("notification onclick triggered.")},hasNewNotifications:!0},chatBotConfigs:{onClick:()=>{}}},O={brand:{company:"IBM",product:"SaaS Console"},profile:{imageUrl:"",email:"user@test.com",displayName:"Sample User"},enableLogs:!0,profileFooterLinks:[{text:"Logout",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout",newTab:!1,newTabIcon:!1}],helperLinks:[{link:"https://ibm.biz/automation-explorer",label:"Automation Explorer documentation",onclick:()=>{window.open("https://ibm.biz/automation-explorer")}},{label:"Connector Development Kit documentation",onclick:()=>{window.open("https://ibm.biz/connector-development-kit")}},{link:"https://ibm.biz/automationexplorer",label:"Automation Explorer Community",target:"_blank"}]},z={placeholder:"Search...",callback:a=>{console.log(a)},submitCallback:a=>{console.log(`Search triggered with: '${a}'`)}},ae={title:"Components/Global Header/Subcomponents/Common Header",tags:["autodocs"],render:()=>new A,args:{}},o={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${m}"></common-header>
        </div>
    `},n={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${T}"></common-header>
        </div>
    `},r={name:"IBM Mock Product",render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${U}"></common-header>
        </div>
    `},t={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${O}"></common-header>
        </div>
    `},i={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${{...m,chatBotConfigs:D}}"></common-header>
        </div>
    `},s={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${{...m,notificationConfigs:E}}"></common-header>
        </div>
    `},c={render:()=>e`
        <div role="main">
            <apaas-common-header .headerProps="${{...m,searchConfigs:z}}"></common-header>
        </div>
    `};var p,h,u;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${headerProps}"></common-header>
        </div>
    \`
}`,...(u=(h=o.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};var b,f,g;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${headerPropsUnauthenticated}"></common-header>
        </div>
    \`
}`,...(g=(f=n.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var v,k,I;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'IBM Mock Product',
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${hybridIPaasHeaderProps}"></common-header>
        </div>
    \`
}`,...(I=(k=r.parameters)==null?void 0:k.docs)==null?void 0:I.source}}};var C,L,P;t.parameters={...t.parameters,docs:{...(C=t.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${headerPropsWithHelpLinks}"></common-header>
        </div>
    \`
}`,...(P=(L=t.parameters)==null?void 0:L.docs)==null?void 0:P.source}}};var S,N,x;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${{
    ...headerProps,
    chatBotConfigs
  }}"></common-header>
        </div>
    \`
}`,...(x=(N=i.parameters)==null?void 0:N.docs)==null?void 0:x.source}}};var M,w,y;s.parameters={...s.parameters,docs:{...(M=s.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${{
    ...headerProps,
    notificationConfigs
  }}"></common-header>
        </div>
    \`
}`,...(y=(w=s.parameters)==null?void 0:w.docs)==null?void 0:y.source}}};var H,B,$;c.parameters={...c.parameters,docs:{...(H=c.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <apaas-common-header .headerProps="\${{
    ...headerProps,
    searchConfigs
  }}"></common-header>
        </div>
    \`
}`,...($=(B=c.parameters)==null?void 0:B.docs)==null?void 0:$.source}}};const oe=["Basic","UnauthenticatedContext","IbmMockProduct","HelpLinks","ChatBot","Notifications","Search"];export{o as Basic,i as ChatBot,t as HelpLinks,r as IbmMockProduct,s as Notifications,c as Search,n as UnauthenticatedContext,oe as __namedExportsOrder,ae as default};
