import{R as e}from"./iframe-8iJoaOdx.js";import{n as t,r as n,t as r}from"./CommonHeader-CSv2TdRd.js";var i=new Date;i.setDate(i.getDate()+30);var a={onClick:e=>{e.preventDefault(),console.log(`chatbot onclick triggered.`)}},o={openNotifications:!1,onClick:()=>{console.log(`notification onclick triggered.`)},isActive:!0},s={brand:{company:`IBM`,product:`SaaS Console`},profile:{imageUrl:``,email:`user@test.com`,displayName:`Sample User`},enableLogs:!0,managementConsole:{href:`https://www.ibm.com`,text:`IBM SaaS Console`,newTab:!0,newTabIcon:!0},mainSectionItems:[{label:`Instance name`,text:`APIC-MB-DEV`},{label:`Region`,text:`us-east-1 (N Virginia)`},{label:`Instance owner`,text:`user@ibm.com`}],profileFooterLinks:[{text:`Log out`,href:`/logout`,carbonIcon:`Logout`,arialLabel:`Logout`,newTab:!1,newTabIcon:!1}],sideNav:{isCollapsible:!0,buttonLabel:`Open menu`,sidebarLabel:`Side navigation`,links:[{href:`#`,label:`Link 1`,iconName:`Settings`,isActive:!0,sideNavMenuItems:[]},{href:`#`,label:`Link 2`,iconName:`Launch`,sideNavMenuItems:[]},{href:`#`,label:`Link 3`,iconName:`Launch`,sideNavMenuItems:[]}],isRail:!1,isChildOfHeader:!1},assistMeConfigs:{productId:`a22453643cdb9e22397c6eab9e9da97d`},trialConfigs:{trialCount:30,warning:!1,trialLabel:`Trial days left`,description:`Your trial ends on ${i.toLocaleString(`default`,{month:`long`,day:`numeric`,year:`numeric`})}`,links:[{type:t.contact,label:`Invite team member`,href:`#`},{type:t.invite,label:`Contact sales`,href:`https://www.ibm.com`}],actionText:`Buy`,actionLink:`#`},switcherConfigs:[{iconsLeft:!0,initialSelectedIndex:1,items:[{label:`Development`,isHeading:!0,id:``,text:``,href:`#`,carbonIcon:`Checkmark`},{label:`Environment 1`,id:``,text:``,href:`#`,carbonIcon:`Checkmark`},{label:`Environment 2`,id:``,text:``,href:`#`,carbonIcon:`Checkmark`},{label:`Production`,isHeading:!0,id:``,text:``,href:`#`,carbonIcon:`Checkmark`},{label:`Environment 3`,href:`#`,id:``,text:``,carbonIcon:`Checkmark`,isLastInList:!0},{label:`Manage environments`,href:`#`,id:``,text:``,carbonIcon:`Settings`,isLinkItem:!0}]}]},c={brand:{company:`IBM`,product:`SaaS Console`},noAuthHeaderLinks:[{text:`Docs`,href:`/docs`,carbonIcon:`Document`,arialLabel:`Docs`},{href:`/login`,text:`Log in`,carbonIcon:`Login`,arialLabel:`Log in`}],helperLinks:[{link:`https://carbondesignsystem.com/`,label:`Carbon Design System`,target:`_blank`}]},l={isHybridIpaas:!0,brand:{company:`IBM`,product:`Mock Product`},capabilityName:{label:`Capability`},profile:{imageUrl:null,email:`user@test.com`,displayName:`Sample User`},managementConsoleHref:`#`,mainSectionItems:[{label:`Instance name`,text:`APIC-MB-DEV`},{label:`Region`,text:`us-east-1 (N Virginia)`},{label:`Instance owner`,text:`user@ibm.com`}],profileFooterLinks:[{text:`Log out`,href:`/logout`,carbonIcon:`Logout`,arialLabel:`Logout`}],assistMeConfigs:{productId:`a22453643cdb9e22397c6eab9e9da97d`},switcherConfigs:[{floatLeft:!0,iconsLeft:!0,items:[{label:`Development`,isHeading:!0},{label:`Environment 5992719015825413407182805`,href:`#`,carbonIcon:`Checkmark`},{label:`Environment 2`,href:`#`,carbonIcon:`Checkmark`},{label:`Production`,isHeading:!0},{label:`Environment 3`,href:`#`,carbonIcon:`Checkmark`,isLastInList:!0}]}],sideNav:{isCollapsible:!0,autoCollapseOnLeave:!0,buttonLabel:`Open menu`,sidebarLabel:`Side navigation`,groups:[{links:[{href:`#`,label:`Home`,iconName:`Home`,isActive:!1},{href:`#`,label:`Access management`,iconName:`User`,isActive:!1}]},{links:[{label:`APIs`,iconName:`Document`,isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:`#`,label:`Connect`}]},{label:`App Integration`,iconName:`Email`,isSideNavMenuItems:!0,isActive:!0,sideNavMenuItems:[{href:`#`,label:`Integration`},{href:`#`,label:`Apps`}]},{href:`#`,label:`Events`,iconName:`RequestQuote`}]},{links:[{href:`#`,label:`Metering`,iconName:`Checkmark`},{href:`#`,label:`Monitoring`,iconName:`Share`}]}]},notificationConfigs:{notifications:[],openNotifications:!1,onClick:()=>{console.log(`notification onclick triggered.`)}},chatBotConfigs:{onClick:()=>{}}},u={brand:{company:`IBM`,product:`SaaS Console`},profile:{imageUrl:``,email:`user@test.com`,displayName:`Sample User`},enableLogs:!0,profileFooterLinks:[{text:`Log out`,href:`/logout`,carbonIcon:`Logout`,arialLabel:`Logout`,newTab:!1,newTabIcon:!1}],helperLinks:[{link:`https://ibm.biz/automation-explorer`,label:`Automation Explorer documentation`,onclick:()=>{window.open(`https://ibm.biz/automation-explorer`)}},{label:`Connector Development Kit documentation`,onclick:()=>{window.open(`https://ibm.biz/connector-development-kit`)}},{link:`https://ibm.biz/automationexplorer`,label:`Automation Explorer Community`,target:`_blank`}]},d={placeholder:`Search...`,callback:e=>{console.log(e)},submitCallback:e=>{console.log(`Search triggered with: '${e}'`)}},f={title:`Components/Global Header/Subcomponents/Common Header`,tags:[`autodocs`],render:()=>new r,args:{}},p={render:()=>e`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${s}"></clabs-global-header-apaas>
    </div>
  `},m={render:()=>e`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${c}"></clabs-global-header-apaas>
    </div>
  `},h={name:`IBM Mock Product`,render:()=>e`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${l}"></clabs-global-header-apaas>
    </div>
  `},g={render:()=>e`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${u}"></clabs-global-header-apaas>
    </div>
  `},_={render:()=>e`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${{...s,chatBotConfigs:a}}"></clabs-global-header-apaas>
    </div>
  `},v={isEnabled:!0,scriptUrl:`https://cdn.dev.saas.ibm.com/solis_ui/v1/sidekick/solis-sidekick.es.js`,correlationId:`someid`,title:`sometitle`,product:`someproduct`,context:`application`,insights_enabled:!0,chat_enabled:!0,overview_enabled:!0,tell_me_more_enabled:!0},y={isEnabled:!0,scriptUrl:`https://cdn.dev.saas.ibm.com/solis_ui/v1/switcher/solis-switcher.es.js`,is_prod:!1,cdn_hostname:`https://cdn.dev.saas.ibm.com/solis_ui/v1`,deployment_environment:n.local,product_id:`my_product`},b={render:()=>e`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${{...s,sidekickConfig:v,solisConfig:y}}"></clabs-global-header-apaas>
    </div>
  `},x={render:()=>e`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${{...s,notificationConfigs:o}}"></clabs-global-header-apaas>
    </div>
  `},S={render:()=>e`
    <div role="main">
      <clabs-global-header-apaas
        hasNewNotifications
        .headerProps="${{...s,notificationConfigs:o}}"></clabs-global-header-apaas>
    </div>
  `},C={render:()=>e`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${{...s,searchConfigs:d}}"></clabs-global-header-apaas>
    </div>
  `},w={render:()=>e`
    <div role="main">
      <clabs-global-header-apaas .headerProps="${s}">
        <div slot="header-logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32">
            <path
              fill="cyan"
              d="M13.5,30.8149a1.0011,1.0011,0,0,1-.4927-.13l-8.5-4.815A1,1,0,0,1,4,25V15a1,1,0,0,1,.5073-.87l8.5-4.815a1.0013,1.0013,0,0,1,.9854,0l8.5,4.815A1,1,0,0,1,23,15V25a1,1,0,0,1-.5073.87l-8.5,4.815A1.0011,1.0011,0,0,1,13.5,30.8149ZM6,24.417l7.5,4.2485L21,24.417V15.583l-7.5-4.2485L6,15.583Z" />
            <path
              fill="lightcyan"
              d="M28,17H26V7.583L18.5,3.3345,10.4927,7.87,9.5073,6.13l8.5-4.815a1.0013,1.0013,0,0,1,.9854,0l8.5,4.815A1,1,0,0,1,28,7Z" />
          </svg>
        </div>
      </clabs-global-header-apaas>
    </div>
  `};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="\${headerProps}"></clabs-global-header-apaas>
    </div>
  \`
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="\${headerPropsUnauthenticated}"></clabs-global-header-apaas>
    </div>
  \`
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'IBM Mock Product',
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="\${hybridIPaasHeaderProps}"></clabs-global-header-apaas>
    </div>
  \`
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="\${headerPropsWithHelpLinks}"></clabs-global-header-apaas>
    </div>
  \`
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="\${{
    ...headerProps,
    chatBotConfigs
  }}"></clabs-global-header-apaas>
    </div>
  \`
}`,..._.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="\${{
    ...headerProps,
    sidekickConfig: sidekickConfig,
    solisConfig: solisConfig
  }}"></clabs-global-header-apaas>
    </div>
  \`
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="\${{
    ...headerProps,
    notificationConfigs
  }}"></clabs-global-header-apaas>
    </div>
  \`
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas
        hasNewNotifications
        .headerProps="\${{
    ...headerProps,
    notificationConfigs
  }}"></clabs-global-header-apaas>
    </div>
  \`
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="\${{
    ...headerProps,
    searchConfigs
  }}"></clabs-global-header-apaas>
    </div>
  \`
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div role="main">
      <clabs-global-header-apaas .headerProps="\${headerProps}">
        <div slot="header-logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32">
            <path
              fill="cyan"
              d="M13.5,30.8149a1.0011,1.0011,0,0,1-.4927-.13l-8.5-4.815A1,1,0,0,1,4,25V15a1,1,0,0,1,.5073-.87l8.5-4.815a1.0013,1.0013,0,0,1,.9854,0l8.5,4.815A1,1,0,0,1,23,15V25a1,1,0,0,1-.5073.87l-8.5,4.815A1.0011,1.0011,0,0,1,13.5,30.8149ZM6,24.417l7.5,4.2485L21,24.417V15.583l-7.5-4.2485L6,15.583Z" />
            <path
              fill="lightcyan"
              d="M28,17H26V7.583L18.5,3.3345,10.4927,7.87,9.5073,6.13l8.5-4.815a1.0013,1.0013,0,0,1,.9854,0l8.5,4.815A1,1,0,0,1,28,7Z" />
          </svg>
        </div>
      </clabs-global-header-apaas>
    </div>
  \`
}`,...w.parameters?.docs?.source}}};var T=[`Basic`,`UnauthenticatedContext`,`IbmMockProduct`,`HelpLinks`,`ChatBot`,`WithSolis`,`Notifications`,`NotificationsNew`,`Search`,`Logo`];export{p as Basic,_ as ChatBot,g as HelpLinks,h as IbmMockProduct,w as Logo,x as Notifications,S as NotificationsNew,C as Search,m as UnauthenticatedContext,b as WithSolis,T as __namedExportsOrder,f as default};