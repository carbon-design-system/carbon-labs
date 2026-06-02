import{R as e}from"./iframe-DJFEBb6G.js";import{n as t,t as n}from"./CommonHeader-Denv42Xz.js";var r={brand:{company:`IBM`,product:`SaaS Console`},profile:{imageUrl:``,email:`user@test.com`,displayName:`Sample User`},enableLogs:!0,managementConsole:{href:`https://www.ibm.com`,text:`IBM SaaS Console`,newTab:!0,newTabIcon:!0},mainSectionItems:[{label:`Instance name`,text:`APIC-MB-DEV`},{label:`Region`,text:`us-east-1 (N Virginia)`},{label:`Instance owner`,text:`user@ibm.com`}],profileFooterLinks:[{text:`Log out`,href:`/logout`,carbonIcon:`Logout`,arialLabel:`Logout`,newTab:!1,newTabIcon:!1}],assistMeConfigs:{productId:`a22453643cdb9e22397c6eab9e9da97d`},trialConfigs:{trialCount:30,warning:!1,trialLabel:`Trial days left`,description:`Your trial ends on ${Date.now().toLocaleString(`default`)}`,links:[{type:t.contact,label:`Invite team member`,href:`#`},{type:t.invite,label:`Contact sales`,href:`https://www.ibm.com`}],actionText:`Buy`,actionLink:`#`},switcherConfigs:[{floatLeft:!0,items:[{label:`Designer`,href:`#`,carbonIcon:`Checkmark`,id:``,text:``},{label:`Dashboard`,href:`#`,carbonIcon:`Checkmark`,id:``,text:``}]}]},i={isCollapsible:!1,buttonLabel:`Open menu`,sidebarLabel:`Side navigation`,links:[{href:`#`,label:`Link 1`,iconName:`Settings`,isActive:!0,sideNavMenuItems:[]},{href:`#`,label:`Link 2`,iconName:`Launch`,sideNavMenuItems:[]},{href:`#`,label:`Link 3`,iconName:`Launch`,sideNavMenuItems:[]}],isRail:!1,isChildOfHeader:!1},a={isCollapsible:!0,autoCollapseOnLeave:!0,buttonLabel:`Open menu`,sidebarLabel:`Side navigation`,isRail:!1,links:[],isChildOfHeader:!1,groups:[{links:[{href:`#`,label:`Home`,iconName:`Home`,isActive:!0,sideNavMenuItems:[]},{href:`#`,label:`Access management`,iconName:`User`,isActive:!1,sideNavMenuItems:[]}]},{links:[{label:`APIs`,iconName:`Api`,isSideNavMenuItems:!0,sideNavMenuItems:[{href:`#`,label:`API Connect`,isActive:!1}],href:``},{label:`App Integration`,iconName:`FlowConnection`,isSideNavMenuItems:!0,sideNavMenuItems:[{href:`#`,label:`webMethods Integration`,isActive:!1},{href:`#`,label:`App Connect`,isActive:!1}],href:``},{href:`#`,label:`Event endpoint management`,iconName:`IbmEventAutomation`,sideNavMenuItems:[]}]},{links:[{href:`#`,label:`Metering`,iconName:`Meter`,sideNavMenuItems:[]},{href:`#`,label:`End-to-end monitoring`,iconName:`Analytics`,sideNavMenuItems:[]}]}]},o={theme:`g10`,isExpandable:!0,isCollapsible:!0,autoCollapseOnLeave:!0,sideNav:{isRail:!0,isPersistent:!0,isChildOfHeader:!0},links:[{label:`Subscriptions`,iconName:`Launch`,href:``,sideNavMenuItems:[]},{iconName:`Settings`,label:`Account settings`,isSideNavMenuItems:!0,href:``,sideNavMenuItems:[{label:`Details`,isActive:!1,href:``},{label:`Access management`,iconName:`UserMultiple`,isActive:!1,href:``}]}],buttonLabel:``,sidebarLabel:``,isRail:!1,isChildOfHeader:!1},s={title:`Components/Global Header/Subcomponents/Side Nav`,tags:[`autodocs`],render:()=>new n,args:{}},c={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas
                .headerProps="${{...r,sideNav:i}}"></common-header>
        </div>
    `},l={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas
                .headerProps="${{...r,sideNav:a}}"></common-header>
        </div>
    `},u={render:()=>e`
        <div role="main">
            <clabs-global-header-apaas
                .headerProps="${{...r,sideNavPropsV2:o}}"></common-header>
        </div>
    `};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas
                .headerProps="\${{
    ...headerProps,
    sideNav: sideNavBasic
  }}"></common-header>
        </div>
    \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas
                .headerProps="\${{
    ...headerProps,
    sideNav: sideNavGroups
  }}"></common-header>
        </div>
    \`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => html\`
        <div role="main">
            <clabs-global-header-apaas
                .headerProps="\${{
    ...headerProps,
    sideNavPropsV2: sideNavWithV2
  }}"></common-header>
        </div>
    \`
}`,...u.parameters?.docs?.source}}};var d=[`SideNavBasic`,`SideNavWithGroups`,`SideNavWithPropsV2`];export{c as SideNavBasic,l as SideNavWithGroups,u as SideNavWithPropsV2,d as __namedExportsOrder,s as default};