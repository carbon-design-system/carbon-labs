import{C as V,T as h,s as W}from"./CommonHeader-BbSgmZap.js";import{x as e}from"./iframe-ClXo_xvh.js";import"./property-CzrLTE60.js";import"./state-D55fdd7s.js";import"./class-map-CMay1Mxo.js";import"./directive-CJw_OlP2.js";import"./shared-enums-B3QzlYTL.js";import"./index-CXiAHtml.js";import"./unsafe-html-D4N6Jav0.js";import"./16-BpKA4nzT.js";import"./16-C2f9e6nj.js";import"./16-Dmu1QWqc.js";import"./16-Cr2pWCY7.js";import"./index-C3nV9oXV.js";import"./if-defined-B-8MbNPl.js";import"./query-BApjzB0v.js";import"./16-D0aIqdwb.js";import"./16-aE1DZ_SZ.js";import"./16-D5maUdCH.js";import"./floating-ui.dom-Wp8I_6Nc.js";import"./constant-zRHrWNcn.js";import"./settings-BQP9c3yA.js";import"./async-directive-BXAgyGGK.js";import"./16-B4-6OwK9.js";import"./16-DeKHrdu0.js";import"./16-Cj2zF8KO.js";import"./preload-helper-C1FmrZbK.js";/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const p=new Date;p.setDate(p.getDate()+30);const F={onClick:o=>{o.preventDefault(),console.log("chatbot onclick triggered.")}},R={openNotifications:!1,onClick:()=>{console.log("notification onclick triggered.")},isActive:!0},a={brand:{company:"IBM",product:"SaaS Console"},profile:{imageUrl:"",email:"user@test.com",displayName:"Sample User"},enableLogs:!0,managementConsole:{href:"https://www.ibm.com",text:"IBM SaaS Console",newTab:!0,newTabIcon:!0},mainSectionItems:[{label:"Instance name",text:"APIC-MB-DEV"},{label:"Region",text:"us-east-1 (N Virginia)"},{label:"Instance owner",text:"user@ibm.com"}],profileFooterLinks:[{text:"Log out",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout",newTab:!1,newTabIcon:!1}],sideNav:{isCollapsible:!1,buttonLabel:"Open menu",sidebarLabel:"Side navigation",links:[{href:"#",label:"Link 1",iconName:"Settings",isActive:!0,sideNavMenuItems:[]},{href:"#",label:"Link 2",iconName:"Launch",sideNavMenuItems:[]},{href:"#",label:"Link 3",iconName:"Launch",sideNavMenuItems:[]}],isRail:!1,isChildOfHeader:!1},assistMeConfigs:{productId:"a22453643cdb9e22397c6eab9e9da97d"},trialConfigs:{trialCount:30,warning:!1,trialLabel:"Trial days left",description:`Your trial ends on ${p.toLocaleString("default",{month:"long",day:"numeric",year:"numeric"})}`,links:[{type:h.contact,label:"Invite team member",href:"#"},{type:h.invite,label:"Contact sales",href:"https://www.ibm.com"}],actionText:"Buy",actionLink:"#"},switcherConfigs:[{iconsLeft:!0,initialSelectedIndex:1,items:[{label:"Development",isHeading:!0,id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 1",id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 2",id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Production",isHeading:!0,id:"",text:"",href:"#",carbonIcon:"Checkmark"},{label:"Environment 3",href:"#",id:"",text:"",carbonIcon:"Checkmark",isLastInList:!0},{label:"Manage environments",href:"#",id:"",text:"",carbonIcon:"Settings",isLinkItem:!0}]}]},j={brand:{company:"IBM",product:"SaaS Console"},noAuthHeaderLinks:[{text:"Docs",href:"/docs",carbonIcon:"Document",arialLabel:"Docs"},{href:"/login",text:"Log in",carbonIcon:"Login",arialLabel:"Log in"}]},q={isHybridIpaas:!0,brand:{company:"IBM",product:"Mock Product"},capabilityName:{label:"Capability"},profile:{imageUrl:null,email:"user@test.com",displayName:"Sample User"},managementConsoleHref:"#",mainSectionItems:[{label:"Instance name",text:"APIC-MB-DEV"},{label:"Region",text:"us-east-1 (N Virginia)"},{label:"Instance owner",text:"user@ibm.com"}],profileFooterLinks:[{text:"Log out",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout"}],assistMeConfigs:{productId:"a22453643cdb9e22397c6eab9e9da97d"},switcherConfigs:[{floatLeft:!0,iconsLeft:!0,items:[{label:"Development",isHeading:!0},{label:"Environment 5992719015825413407182805",href:"#",carbonIcon:"Checkmark"},{label:"Environment 2",href:"#",carbonIcon:"Checkmark"},{label:"Production",isHeading:!0},{label:"Environment 3",href:"#",carbonIcon:"Checkmark",isLastInList:!0}]}],sideNav:{isCollapsible:!0,autoCollapseOnLeave:!0,buttonLabel:"Open menu",sidebarLabel:"Side navigation",groups:[{links:[{href:"#",label:"Home",iconName:"Home",isActive:!1},{href:"#",label:"Access management",iconName:"User",isActive:!1}]},{links:[{label:"APIs",iconName:"Document",isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:"#",label:"Connect"}]},{label:"App Integration",iconName:"Email",isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:"#",label:"Integration"},{href:"#",label:"Apps"}]},{href:"#",label:"Events",iconName:"RequestQuote"}]},{links:[{href:"#",label:"Metering",iconName:"Checkmark"},{href:"#",label:"Monitoring",iconName:"Share"}]}]},notificationConfigs:{notifications:[],openNotifications:!1,onClick:()=>{console.log("notification onclick triggered.")}},chatBotConfigs:{onClick:()=>{}}},G={brand:{company:"IBM",product:"SaaS Console"},profile:{imageUrl:"",email:"user@test.com",displayName:"Sample User"},enableLogs:!0,profileFooterLinks:[{text:"Log out",href:"/logout",carbonIcon:"Logout",arialLabel:"Logout",newTab:!1,newTabIcon:!1}],helperLinks:[{link:"https://ibm.biz/automation-explorer",label:"Automation Explorer documentation",onclick:()=>{window.open("https://ibm.biz/automation-explorer")}},{label:"Connector Development Kit documentation",onclick:()=>{window.open("https://ibm.biz/connector-development-kit")}},{link:"https://ibm.biz/automationexplorer",label:"Automation Explorer Community",target:"_blank"}]},K={placeholder:"Search...",callback:o=>{console.log(o)},submitCallback:o=>{console.log(`Search triggered with: '${o}'`)}},Se={title:"Components/Global Header/Subcomponents/Common Header",tags:["autodocs"],render:()=>new V,args:{}},r={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${a}"></common-header>
        </div>
    `},n={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${j}"></common-header>
        </div>
    `},t={name:"IBM Mock Product",render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${q}"></common-header>
        </div>
    `},i={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${G}"></common-header>
        </div>
    `},s={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${{...a,chatBotConfigs:F}}"></common-header>
        </div>
    `},Q={isEnabled:!0,scriptUrl:"https://cdn.dev.saas.ibm.com/solis_ui/v1/sidekick/solis-sidekick.es.js",correlationId:"someid",title:"sometitle",product:"someproduct",context:"application",insights_enabled:!0,chat_enabled:!0,overview_enabled:!0,tell_me_more_enabled:!0},Y={isEnabled:!0,scriptUrl:"https://cdn.dev.saas.ibm.com/solis_ui/v1/switcher/solis-switcher.es.js",is_prod:!1,cdn_hostname:"https://cdn.dev.saas.ibm.com/solis_ui/v1",deployment_environment:W.local,product_id:"my_product"},l={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${{...a,sidekickConfig:Q,solisConfig:Y}}"></common-header>
        </div>
    `},c={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${{...a,notificationConfigs:R}}"></common-header>
        </div>
    `},m={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas hasNewNotifications .headerProps="${{...a,notificationConfigs:R}}"></common-header>
        </div>
    `},d={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas .headerProps="${{...a,searchConfigs:K}}"></common-header>
        </div>
    `};var b,u,g;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${headerProps}"></common-header>
        </div>
    \`
}`,...(g=(u=r.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var f,v,k;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${headerPropsUnauthenticated}"></common-header>
        </div>
    \`
}`,...(k=(v=n.parameters)==null?void 0:v.docs)==null?void 0:k.source}}};var C,I,L;t.parameters={...t.parameters,docs:{...(C=t.parameters)==null?void 0:C.docs,source:{originalSource:`{
  name: 'IBM Mock Product',
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${hybridIPaasHeaderProps}"></common-header>
        </div>
    \`
}`,...(L=(I=t.parameters)==null?void 0:I.docs)==null?void 0:L.source}}};var P,S,N;i.parameters={...i.parameters,docs:{...(P=i.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${headerPropsWithHelpLinks}"></common-header>
        </div>
    \`
}`,...(N=(S=i.parameters)==null?void 0:S.docs)==null?void 0:N.source}}};var w,x,M;s.parameters={...s.parameters,docs:{...(w=s.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${{
    ...headerProps,
    chatBotConfigs
  }}"></common-header>
        </div>
    \`
}`,...(M=(x=s.parameters)==null?void 0:x.docs)==null?void 0:M.source}}};var y,$,H;l.parameters={...l.parameters,docs:{...(y=l.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${{
    ...headerProps,
    sidekickConfig: sidekickConfig,
    solisConfig: solisConfig
  }}"></common-header>
        </div>
    \`
}`,...(H=($=l.parameters)==null?void 0:$.docs)==null?void 0:H.source}}};var B,_,E;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${{
    ...headerProps,
    notificationConfigs
  }}"></common-header>
        </div>
    \`
}`,...(E=(_=c.parameters)==null?void 0:_.docs)==null?void 0:E.source}}};var A,D,U;m.parameters={...m.parameters,docs:{...(A=m.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas hasNewNotifications .headerProps="\${{
    ...headerProps,
    notificationConfigs
  }}"></common-header>
        </div>
    \`
}`,...(U=(D=m.parameters)==null?void 0:D.docs)==null?void 0:U.source}}};var T,O,z;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas .headerProps="\${{
    ...headerProps,
    searchConfigs
  }}"></common-header>
        </div>
    \`
}`,...(z=(O=d.parameters)==null?void 0:O.docs)==null?void 0:z.source}}};const Ne=["Basic","UnauthenticatedContext","IbmMockProduct","HelpLinks","ChatBot","WithSolis","Notifications","NotificationsNew","Search"];export{r as Basic,s as ChatBot,i as HelpLinks,t as IbmMockProduct,c as Notifications,m as NotificationsNew,d as Search,n as UnauthenticatedContext,l as WithSolis,Ne as __namedExportsOrder,Se as default};
