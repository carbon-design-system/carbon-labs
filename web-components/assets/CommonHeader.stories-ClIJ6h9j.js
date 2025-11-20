import{C as T,T as p,s as _}from"./CommonHeader-pKVPDiKy.js";import{x as e}from"./iframe-D19RUB12.js";import"./property-CQcqZ1ef.js";import"./state-BgfPPhqa.js";import"./settings-BQP9c3yA.js";import"./class-map-DjFSKllw.js";import"./directive-CJw_OlP2.js";import"./shared-enums-DfKFS5yf.js";import"./if-defined-U3Yb-QgV.js";import"./16-0wsGWJU-.js";import"./16-Dc1ce3EM.js";import"./16-Chi-4lpJ.js";import"./16-Cr2pWCY7.js";import"./index-C3nV9oXV.js";import"./query-BApjzB0v.js";import"./floating-ui.dom-Wp8I_6Nc.js";import"./constant-DbOwpvYQ.js";import"./async-directive-BUdYNUpY.js";import"./preload-helper-C1FmrZbK.js";/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const d=new Date;d.setDate(d.getDate()+30);const O={onClick:a=>{a.preventDefault(),console.log("chatbot onclick triggered.")}},z={openNotifications:!1,onClick:()=>{console.log("notification onclick triggered.")},isActive:!0},o={brand:{company:"IBM",product:"SaaS Console"},profile:{imageUrl:"",email:"user@test.com",displayName:"Sample User"},enableLogs:!0,managementConsole:{href:"https://www.ibm.com",text:"IBM SaaS Console",newTab:!0,newTabIcon:!0},mainSectionItems:[{label:"Instance name",text:"APIC-MB-DEV"},{label:"Region",text:"us-east-1 (N Virginia)"},{label:"Instance owner",text:"user@ibm.com"}],profileFooterLinks:[{text:"Log out",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout",newTab:!1,newTabIcon:!1}],sideNav:{isCollapsible:!1,buttonLabel:"Open menu",sidebarLabel:"Side navigation",links:[{href:"#",label:"Link 1",iconName:"Settings",isActive:!0,sideNavMenuItems:[]},{href:"#",label:"Link 2",iconName:"Launch",sideNavMenuItems:[]},{href:"#",label:"Link 3",iconName:"Launch",sideNavMenuItems:[]}],isRail:!1,isChildOfHeader:!1},assistMeConfigs:{productId:"a22453643cdb9e22397c6eab9e9da97d"},trialConfigs:{trialCount:30,warning:!1,trialLabel:"Trial days left",description:`Your trial ends on ${d.toLocaleString("default",{month:"long",day:"numeric",year:"numeric"})}`,links:[{type:p.contact,label:"Invite team member",href:"#"},{type:p.invite,label:"Contact sales",href:"https://www.ibm.com"}],actionText:"Buy",actionLink:"#"},switcherConfigs:[{iconsLeft:!0,initialSelectedIndex:1,items:[{label:"Development",isHeading:!0,id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 1",id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 2",id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Production",isHeading:!0,id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 3",href:"#",id:"",text:"",carbonIcon:"Checkmark",isLastInList:!0},{label:"Manage environments",href:"#",id:"",text:"",carbonIcon:"Settings",isLinkItem:!0}]}]},R={brand:{company:"IBM",product:"SaaS Console"},noAuthHeaderLinks:[{text:"Docs",href:"/docs",carbonIcon:"Document",arialLabel:"Docs"},{href:"/login",text:"Log in",carbonIcon:"Login",arialLabel:"Log in"}]},V={isHybridIpaas:!0,brand:{company:"IBM",product:"Mock Product"},capabilityName:{label:"Capability"},profile:{imageUrl:null,email:"user@test.com",displayName:"Sample User"},managementConsoleHref:"#",mainSectionItems:[{label:"Instance name",text:"APIC-MB-DEV"},{label:"Region",text:"us-east-1 (N Virginia)"},{label:"Instance owner",text:"user@ibm.com"}],profileFooterLinks:[{text:"Log out",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout"}],assistMeConfigs:{productId:"a22453643cdb9e22397c6eab9e9da97d"},switcherConfigs:[{floatLeft:!0,iconsLeft:!0,items:[{label:"Development",isHeading:!0},{label:"Environment 5992719015825413407182805",href:"#",carbonIcon:"Checkmark"},{label:"Environment 2",href:"#",carbonIcon:"Checkmark"},{label:"Production",isHeading:!0},{label:"Environment 3",href:"#",carbonIcon:"Checkmark",isLastInList:!0}]}],sideNav:{isCollapsible:!0,autoCollapseOnLeave:!0,buttonLabel:"Open menu",sidebarLabel:"Side navigation",groups:[{links:[{href:"#",label:"Home",iconName:"Home",isActive:!1},{href:"#",label:"Access management",iconName:"User",isActive:!1}]},{links:[{label:"APIs",iconName:"Document",isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:"#",label:"Connect"}]},{label:"App Integration",iconName:"Email",isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:"#",label:"Integration"},{href:"#",label:"Apps"}]},{href:"#",label:"Events",iconName:"RequestQuote"}]},{links:[{href:"#",label:"Metering",iconName:"Checkmark"},{href:"#",label:"Monitoring",iconName:"Share"}]}]},notificationConfigs:{notifications:[],openNotifications:!1,onClick:()=>{console.log("notification onclick triggered.")},hasNewNotifications:!0},chatBotConfigs:{onClick:()=>{}}},F={brand:{company:"IBM",product:"SaaS Console"},profile:{imageUrl:"",email:"user@test.com",displayName:"Sample User"},enableLogs:!0,profileFooterLinks:[{text:"Log out",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout",newTab:!1,newTabIcon:!1}],helperLinks:[{link:"https://ibm.biz/automation-explorer",label:"Automation Explorer documentation",onclick:()=>{window.open("https://ibm.biz/automation-explorer")}},{label:"Connector Development Kit documentation",onclick:()=>{window.open("https://ibm.biz/connector-development-kit")}},{link:"https://ibm.biz/automationexplorer",label:"Automation Explorer Community",target:"_blank"}]},W={placeholder:"Search...",callback:a=>{console.log(a)},submitCallback:a=>{console.log(`Search triggered with: '${a}'`)}},de={title:"Components/Global Header/Subcomponents/Common Header",tags:["autodocs"],render:()=>new T,args:{}},r={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${o}"></common-header>
        </div>
    `},n={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${R}"></common-header>
        </div>
    `},t={name:"IBM Mock Product",render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${V}"></common-header>
        </div>
    `},i={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${F}"></common-header>
        </div>
    `},s={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${{...o,chatBotConfigs:O}}"></common-header>
        </div>
    `},j={isEnabled:!0,scriptUrl:"https://cdn.dev.saas.ibm.com/solis_ui/v1/switcher/solis-switcher.es.js",is_prod:!1,cdn_hostname:"https://cdn.dev.saas.ibm.com/solis_ui/v1",deployment_environment:_.local},l={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${{...o,solisConfig:j}}"></common-header>
        </div>
    `},c={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${{...o,notificationConfigs:z}}"></common-header>
        </div>
    `},m={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${{...o,searchConfigs:W}}"></common-header>
        </div>
    `};var b,h,u;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${headerProps}"></common-header>
        </div>
    \`
}`,...(u=(h=r.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};var g,f,v;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${headerPropsUnauthenticated}"></common-header>
        </div>
    \`
}`,...(v=(f=n.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var k,C,I;t.parameters={...t.parameters,docs:{...(k=t.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: 'IBM Mock Product',
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${hybridIPaasHeaderProps}"></common-header>
        </div>
    \`
}`,...(I=(C=t.parameters)==null?void 0:C.docs)==null?void 0:I.source}}};var L,P,S;i.parameters={...i.parameters,docs:{...(L=i.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${headerPropsWithHelpLinks}"></common-header>
        </div>
    \`
}`,...(S=(P=i.parameters)==null?void 0:P.docs)==null?void 0:S.source}}};var N,x,w;s.parameters={...s.parameters,docs:{...(N=s.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${{
    ...headerProps,
    chatBotConfigs
  }}"></common-header>
        </div>
    \`
}`,...(w=(x=s.parameters)==null?void 0:x.docs)==null?void 0:w.source}}};var M,y,H;l.parameters={...l.parameters,docs:{...(M=l.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${{
    ...headerProps,
    solisConfig: solisConfig
  }}"></common-header>
        </div>
    \`
}`,...(H=(y=l.parameters)==null?void 0:y.docs)==null?void 0:H.source}}};var $,B,E;c.parameters={...c.parameters,docs:{...($=c.parameters)==null?void 0:$.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${{
    ...headerProps,
    notificationConfigs
  }}"></common-header>
        </div>
    \`
}`,...(E=(B=c.parameters)==null?void 0:B.docs)==null?void 0:E.source}}};var A,D,U;m.parameters={...m.parameters,docs:{...(A=m.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${{
    ...headerProps,
    searchConfigs
  }}"></common-header>
        </div>
    \`
}`,...(U=(D=m.parameters)==null?void 0:D.docs)==null?void 0:U.source}}};const pe=["Basic","UnauthenticatedContext","IbmMockProduct","HelpLinks","ChatBot","SolisEnabled","Notifications","Search"];export{r as Basic,s as ChatBot,i as HelpLinks,t as IbmMockProduct,c as Notifications,m as Search,l as SolisEnabled,n as UnauthenticatedContext,pe as __namedExportsOrder,de as default};
