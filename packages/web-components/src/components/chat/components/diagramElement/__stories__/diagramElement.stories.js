/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../diagramElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Generative A.I. Components/Diagram',
};

const examples = [
  {
    title: 'Gantt Chart',
    width: '100%',
    height: 512,
    definition: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d`,
  },
  {
    title: 'Architecture Diagram',
    thumbnail: false,
    width: '512px',
    definition: `%%{init: {
"theme": "base",
"themeVariables": {
"primaryColor": "#ffffff",
"primaryTextColor": "#161616",
"lineColor":"#1B1B1B",
"fontFamily": "IBM Plex Sans, sans-serif",
"nodeBorderWidth": "5px",
"clusterBorderWidth": "5px",
"edgeLabelBackground":"#ffffff",
"clusterBkg": "#ffffff",
"clusterBorder": "#0f62fe",
"primaryBorderColor": "#0f62fe"
},
"flowchart": {
"curve":"stepBefore",
"htmlLabels": true
}
}}%%

flowchart LR
subgraph IBM_Cloud
direction 
subgraph Cloud_Services
style Cloud_Services stroke:#1192e8
ActivityTracker["<div style='text-align:left;padding:10px;border-left:5px solid #1192e8;'>Activity Tracker</div><img width='40' src='https://img.icons8.com/color/48/activity-history.png'>"]
KeyManagement["<div style='text-align:left;padding:10px;border-left:5px solid #da1e28;'>Key Management</div><img width='40' src='https://img.icons8.com/color/48/private-lock.png'>"]
TransitGateway["<div style='text-align:left;padding:10px;border-left:5px solid #1192e8;'>Transit Gateway</div><img width='40' src='https://img.icons8.com/color/48/router.png'>"]
ObjectStorage["<div style='text-align:left;padding:10px;border-left:5px solid #1192e8;'>Object Storage</div><img width='40' src='https://img.icons8.com/color/48/cloud-storage.png'>"]
end

subgraph Management_Resource_Group
style Management_Resource_Group stroke:#da1e28
subgraph Management_VPC
style Management_VPC stroke:#8d8d8d
subgraph Zone_1
style Zone_1 stroke:#8d8d8d
ACL1["<div style='text-align:left;padding:10px;border-left:5px solid #da1e28;'>Management ACL</div>"]
subgraph Security_Group
style Security_Group stroke:#8d8d8d
VSI1["<div style='text-align:left;padding:10px;border-left:5px solid #24a148;'>10.10.10.0/24 : VSI</div><img width='40' src='https://img.icons8.com/color/48/cloud-server.png'>"]
end
VPE1["<div style='text-align:left;padding:10px;border-left:5px solid #24a148;'>10.10.20.0/24 : VPE</div><img width='40' src='https://img.icons8.com/color/48/server.png'>"]
VPN1["<div style='text-align:left;padding:10px;border-left:5px solid #fa4d56;'>10.10.30.0/24 : VPN</div><img width='40' src='https://img.icons8.com/color/48/vpn.png'>"]
end
subgraph Zone_2
style Zone_2 stroke:#8d8d8d
VSI2["<div style='text-align:left;padding:10px;border-left:5px solid #24a148;'>10.20.10.0/24 : VSI</div><img width='40' src='https://img.icons8.com/color/48/cloud-server.png'>"]
VPE2["<div style='text-align:left;padding:10px;border-left:5px solid #24a148;'>10.20.20.0/24 : VPE</div><img width='40' src='https://img.icons8.com/color/48/server.png'>"]
end
end
end

subgraph Workload_Resource_Group
style Workload_Resource_Group stroke:#da1e28
subgraph Workload_VPC
style Workload_VPC stroke:#8d8d8d
subgraph Zone_1_WL
style Zone_1_WL stroke:#8d8d8d
ACL2["<div style='text-align:left;padding:10px;border-left:5px solid #da1e28;'>Workload ACL</div>"]
subgraph Security_Group_WL
style Security_Group_WL stroke:#8d8d8d
VSI4["<div style='text-align:left;padding:10px;border-left:5px solid #24a148;'>10.40.10.0/24 : VSI</div><img width='40' src='https://img.icons8.com/color/48/cloud-server.png'>"]
subgraph Timestamp_Node
style Timestamp_Node stroke:#24a148
Date1["<div style='text-align:left;padding:10px;border-left:5px solid #24a148;'>2025-07-25 14:00</div>"]
end
end
VPE4["<div style='text-align:left;padding:10px;border-left:5px solid #24a148;'>10.40.20.0/24 : VPE</div><img width='40' src='https://img.icons8.com/color/48/server.png'>"]
end
subgraph Zone_2_WL
style Zone_2_WL stroke:#8d8d8d
VSI5["<div style='text-align:left;padding:10px;border-left:5px solid #24a148;'>10.50.10.0/24 : VSI</div><img width='40' src='https://img.icons8.com/color/48/cloud-server.png'>"]
VPE5["<div style='text-align:left;padding:10px;border-left:5px solid #24a148;'>10.50.20.0/24 : VPE</div><img width='40' src='https://img.icons8.com/color/48/server.png'>"]
end
end
end

%% Connections
TransitGateway-->VPN1
TransitGateway-->ACL1
TransitGateway-->ACL2
end`,
  },
  {
    title: 'Architecture Diagram 2',
    thumbnail: false,
    width: '100%',
    height: 512,
    definition: `%%{init: {
"theme":"base",
"themeVariables":{
"primaryColor":"#ffffff",
"primaryTextColor":"#161616",
"fontFamily":"IBM Plex Sans, sans-serif",
"nodeBorderWidth":"5px",
"clusterBorderWidth":"5px",
"edgeLabelBackground":"#ffffff"
},
"flowchart":{
"curve":"stepBefore",
"htmlLabels":true,
"useMaxWidth":false
}
}}%%

graph LR

%% Depth 0
subgraph IBM_Cloud
style IBM_Cloud stroke:#0f62fe,fill:#ffffff

%% Depth 1 (blue)
subgraph Cloud_Services
style Cloud_Services stroke:#1192e8,fill:#e5f6ff

ActivityTracker["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #1192e8;'>Activity Tracker</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Observability/Activity_Tracker.svg'>"]
KeyManagement["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #da1e28;'>Key Management</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Security/Key_Management.svg'>"]
TransitGateway["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #1192e8;'>Transit Gateway</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Network/Transit_Gateway.svg'>"]
ObjectStorage["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #1192e8;'>Object Storage</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Storage/Object_Storage.svg'>"]
end

%% Depth 1 (blue)
subgraph Management_Resource_Group
style Management_Resource_Group stroke:#da1e28,fill:#e5f6ff

%% Depth 2 (grey)
subgraph Management_VPC
style Management_VPC stroke:#8d8d8d,fill:#f4f4f4

%% Depth 3 (red)
subgraph Zone_1
style Zone_1 stroke:#8d8d8d,fill:#fde7e9

ACL1["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #da1e28;'>Management ACL</div>"]

%% Depth 4 (green)
subgraph Security_Group
style Security_Group stroke:#8d8d8d,fill:#dafbe4
VSI1["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #24a148;'>10.10.10.0/24 : VSI</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Cloud_Server.svg'>"]
end

VPE1["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #24a148;'>10.10.20.0/24 : VPE</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Server.svg'>"]
VPN1["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #fa4d56;'>10.10.30.0/24 : VPN</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Security/VPN.svg'>"]
end

%% Depth 3 (red)
subgraph Zone_2
style Zone_2 stroke:#8d8d8d,fill:#fde7e9
VSI2["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #24a148;'>10.20.10.0/24 : VSI</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Cloud_Server.svg'>"]
VPE2["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #24a148;'>10.20.20.0/24 : VPE</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Server.svg'>"]
end
end
end

%% Depth 1 (blue)
subgraph Workload_Resource_Group
style Workload_Resource_Group stroke:#da1e28,fill:#e5f6ff

%% Depth 2 (grey)
subgraph Workload_VPC
style Workload_VPC stroke:#8d8d8d,fill:#f4f4f4

%% Depth 3 (red)
subgraph Zone_1_WL
style Zone_1_WL stroke:#8d8d8d,fill:#fde7e9

ACL2["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #da1e28;'>Workload ACL</div>"]

%% Depth 4 (green)
subgraph Security_Group_WL
style Security_Group_WL stroke:#8d8d8d,fill:#dafbe4
VSI4["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #24a148;'>10.40.10.0/24 : VSI</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Cloud_Server.svg'>"]

%% Depth 5 (green)
subgraph Timestamp_Node
style Timestamp_Node stroke:#24a148,fill:#dafbe4
Date1["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #24a148;'>2025-07-25 14:00</div>"]
end
end

VPE4["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #24a148;'>10.40.20.0/24 : VPE</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Server.svg'>"]
end

%% Depth 3 (red)
subgraph Zone_2_WL
style Zone_2_WL stroke:#8d8d8d,fill:#fde7e9
VSI5["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #24a148;'>10.50.10.0/24 : VSI</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Cloud_Server.svg'>"]
VPE5["<div style='text-align:left;padding:8px 12px;margin:2px;border-left:6px solid #24a148;'>10.50.20.0/24 : VPE</div><img width='20' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Server.svg'>"]
end
end
end

%% Connections
TransitGateway --> VPN1
TransitGateway --> ACL1
TransitGateway --> ACL2
end`,
  },
  {
    title: 'Flow Chart',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `
  flowchart LR
    A[Start] --> B{Is it?}
    B -- Yes --> C[OK]
    C --> D[Rethink]
    D --> B
    B -- No ----> E[End]`,
  },
  {
    title: 'Sankey Diagram',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `---
config:
  sankey:
    showValues: false
---
sankey-beta

Agricultural 'waste',Bio-conversion,124.729
Bio-conversion,Liquid,0.597
Bio-conversion,Losses,26.862
Bio-conversion,Solid,280.322
Bio-conversion,Gas,81.144
Biofuel imports,Liquid,35
Biomass imports,Solid,35
Coal imports,Coal,11.606
Coal reserves,Coal,63.965
Coal,Solid,75.571
District heating,Industry,10.639
District heating,Heating and cooling - commercial,22.505
District heating,Heating and cooling - homes,46.184
Electricity grid,Over generation / exports,104.453
Electricity grid,Heating and cooling - homes,113.726
Electricity grid,H2 conversion,27.14
Electricity grid,Industry,342.165
Electricity grid,Road transport,37.797
Electricity grid,Agriculture,4.412
Electricity grid,Heating and cooling - commercial,40.858
Electricity grid,Losses,56.691
Electricity grid,Rail transport,7.863
Electricity grid,Lighting & appliances - commercial,90.008
Electricity grid,Lighting & appliances - homes,93.494
Gas imports,Ngas,40.719
Gas reserves,Ngas,82.233
Gas,Heating and cooling - commercial,0.129
Gas,Losses,1.401
Gas,Thermal generation,151.891
Gas,Agriculture,2.096
Gas,Industry,48.58
Geothermal,Electricity grid,7.013
H2 conversion,H2,20.897
H2 conversion,Losses,6.242
H2,Road transport,20.897
Hydro,Electricity grid,6.995
Liquid,Industry,121.066
Liquid,International shipping,128.69
Liquid,Road transport,135.835
Liquid,Domestic aviation,14.458
Liquid,International aviation,206.267
Liquid,Agriculture,3.64
Liquid,National navigation,33.218
Liquid,Rail transport,4.413
Marine algae,Bio-conversion,4.375
Ngas,Gas,122.952
Nuclear,Thermal generation,839.978
Oil imports,Oil,504.287
Oil reserves,Oil,107.703
Oil,Liquid,611.99
Other waste,Solid,56.587
Other waste,Bio-conversion,77.81
Pumped heat,Heating and cooling - homes,193.026
Pumped heat,Heating and cooling - commercial,70.672
Solar PV,Electricity grid,59.901
Solar Thermal,Heating and cooling - homes,19.263
Solar,Solar Thermal,19.263
Solar,Solar PV,59.901
Solid,Agriculture,0.882
Solid,Thermal generation,400.12
Solid,Industry,46.477
Thermal generation,Electricity grid,525.531
Thermal generation,Losses,787.129
Thermal generation,District heating,79.329
Tidal,Electricity grid,9.452
UK land based bioenergy,Bio-conversion,182.01
Wave,Electricity grid,19.013
Wind,Electricity grid,289.366
`,
  },
  {
    title: 'Kanban Chart',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `---
config:
  kanban:
    ticketBaseUrl: 'https://mermaidchart.atlassian.net/browse/#TICKET#'
---
kanban
  Todo
    [Create Documentation]
    docs[Create Blog about the new diagram]
  [In progress]
    id6[Create renderer so that it works in all cases. We also add some extra text here for testing purposes. And some more just for the extra flare.]
  id9[Ready for deploy]
    id8[Design grammar]@{ assigned: 'knsv' }
  id10[Ready for test]
    id4[Create parsing tests]@{ ticket: MC-2038, assigned: 'K.Sveidqvist', priority: 'High' }
    id66[last item]@{ priority: 'Very Low', assigned: 'knsv' }
  id11[Done]
    id5[define getData]
    id2[Title of diagram is more than 100 chars when user duplicates diagram with 100 char]@{ ticket: MC-2036, priority: 'Very High'}
    id3[Update DB function]@{ ticket: MC-2037, assigned: knsv, priority: 'High' }

  id12[Can't reproduce]
    id3[Weird flickering in Firefox]
`,
  },
  {
    title: 'Radar Plot',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `%%{init:{
  "theme":"base",
  "themeVariables":
    "primaryColor":"#ffffff",
    "primaryTextColor":"#161616",
    "fontFamily":"IBM Plex Sans, sans-serif"
  },
  "radar":{
    "graticule":"polygon",
    "ticks":2
  }
}}%%
radar-beta
  axis N["north"], NE["North-East"], E["East"], SE["South-East"], S["South"], SW["South-West"], W["West"], NW["North-West"]
  curve AvgSpeed["Average Wind Speed (m/s)"]{5, 7, 6, 4, 3, 4, 6, 9}]
  max 100
  min 0
  graticule polygon
  ticks 2
`,
  },
  {
    title: 'Treemap',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `treemap-beta
  "Budget"
  "Operations"
    "Salaries": 700000
    "Equipment": 200000
    "Supplies": 100000
  "Marketing"
    "Advertising": 400000
    "Events": 100000
`,
  },
  {
    title: 'Treemap 2',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `treemap-beta
"Annual Budget"
  "Operations"
    "Salaries": 700000
    "Equipment": 200000
    "Supplies": 100000
  "Marketing"
    "Advertising": 400000
    "Events": 100000
  "R&D"
    "Research": 300000
    "Development": 250000`,
  },
  {
    title: 'Git Graph',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `
    gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    commit
    `,
  },
  {
    title: 'ER Diagram',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `erDiagram
    CUSTOMER }|..|{ DELIVERY-ADDRESS : has
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER ||--o{ INVOICE : "liable for"
    DELIVERY-ADDRESS ||--o{ ORDER : receives
    INVOICE ||--|{ ORDER : covers
    ORDER ||--|{ ORDER-ITEM : includes
    PRODUCT-CATEGORY ||--|{ PRODUCT : contains
    PRODUCT ||--o{ ORDER-ITEM : "ordered in"
    `,
  },

  {
    title: 'Cloud Architecture diagram',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `flowchart LR
%%=== Node definitions and nesting ===%%
subgraph VDI_Domain["VDI Domain"]
UIPath_users["UIPath users"]
UIPath_administrator["UIPath administrator"]
subgraph P_VDI_Service["P.VDI Service"]
subgraph P_VDI_Desktop["P.VDI Desktop"]
LN00_VDI_Desktop["LN00 VDI Desktop"]
end
end
VLAN_VDI["VLAN VDI"]
end

subgraph ESR_Data_Center["ESR Data Center"]
Urban_code_deploy["Urban code deploy"]
VLAN38_SysMngmt_Warwick["VLAN38 SysMngmt Warwick"]
subgraph P_ESX_Production_cluster["P.ESX Production cluster"]
subgraph PN_UiPath_Orchestrator["PN_UiPath Orchestrator"]
LN_01_UiPath_Orchestrator["LN_01_UiPath_Orchestrator"]
end
LN_06_Webhook_service["LN_06_Webhook_service"]
end
subgraph V_SQL_Server_existing["V.SQL Server (existing)"]
LN_02_UiPath_DB["LN_02_UiPath_DB"]
end
subgraph V_UiPath_uRobot["V_UiPath uRobot"]
LN_03_UiPath_Robot["LN_03_UiPath_Robot"]
end
end

ESR_Environments["ESR Environments"]

%%=== Links ===%%
UIPath_users -->|LC10| LN00_VDI_Desktop
UIPath_administrator -->|LC09| LN00_VDI_Desktop
UIPath_users -->|PC10| VLAN_VDI
UIPath_administrator -->|PC09| VLAN_VDI
LN00_VDI_Desktop -->|PC20| VLAN_VDI
VLAN_VDI -->|PC11| ESR_Environments
LN00_VDI_Desktop -->|LC11| ESR_Environments

ESR_Data_Center -->|LC06| Urban_code_deploy
Urban_code_deploy -->|PC25| VLAN38_SysMngmt_Warwick
ESR_Data_Center -->|LC01| VLAN38_SysMngmt_Warwick
LN_06_Webhook_service -->|PC21| VLAN38_SysMngmt_Warwick
VLAN38_SysMngmt_Warwick -->|PC23| LN_02_UiPath_DB
VLAN38_SysMngmt_Warwick -->|PC26| ESR_Environments

P_ESX_Production_cluster -->|LC13| PN_UiPath_Orchestrator
LN_01_UiPath_Orchestrator -->|LC02| LN_02_UiPath_DB
LN_01_UiPath_Orchestrator -->|LC03| LN_06_Webhook_service
LN_01_UiPath_Orchestrator -->|LC04| LN_03_UiPath_Robot
LN_03_UiPath_Robot -->|LC12| ESR_Environments

%%=== Class assignments (single-space) ===%%
class VDI_Domain G50
class P_VDI_Service P50
class P_VDI_Desktop P50
class LN00_VDI_Desktop P50
class VLAN_VDI G50

class ESR_Data_Center B60
class VLAN38_SysMngmt_Warwick G50
class P_ESX_Production_cluster B60
class PN_UiPath_Orchestrator P50
class LN_01_UiPath_Orchestrator P50
class LN_06_Webhook_service P50
class V_SQL_Server_existing B60
class LN_02_UiPath_DB B60
class V_UiPath_uRobot P50
class LN_03_UiPath_Robot P50

class ESR_Environments CG60`,
  },
  {
    title: 'Mind Map',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `
mindmap
  root((mindmap))
    Origins
    Long history
::icon(fa fa-book)
Popularisation
British popular psychology author Tony Buzan
Research
On effectiveness<br/>and features
On Automatic creation
Uses
Creative techniques
Strategic planning
Argument mapping
Tools
Pen and paper
Mermaid
`,
  },
  {
    title: 'Quadrant Chart',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `
    quadrantChart
    title Reach and engagement of campaigns
    x-axis Low Reach --> High Reach
    y-axis Low Engagement --> High Engagement
    quadrant-1 We should expand
    quadrant-2 Need to promote
    quadrant-3 Re-evaluate
    quadrant-4 May be improved
    Campaign A: [0.3, 0.6]
    Campaign B: [0.45, 0.23]
    Campaign C: [0.57, 0.69]
    Campaign D: [0.78, 0.34]
    Campaign E: [0.40, 0.34]
    Campaign F: [0.35, 0.78]
    `,
  },
  {
    title: 'Mindmap 3',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `mindmap
  root((mindmap))
    Planning((📋 Planning))
    Requirements((Requirements))
    Stakeholders((Stakeholders))
    Goals((Goals))
    Schedule((Schedule))
    Milestones((Milestones))
    Deadlines((Deadlines))
    Design((🎨 Design))
    UX((User Experience))
    Wireframes((Wireframes))
    Prototypes((Prototypes))
    UI((User Interface))
    StyleGuide((Style Guide))
    Branding((Branding))
    Development((💻 Development))
    Frontend((Frontend))
    Components((Components))
    StateMgmt((State Management))
    Backend((Backend))
    API((API))
    REST((REST))
    GraphQL((GraphQL))
    Database((Database))
    Schema((Schema Design))
    Migrations((Migrations))
    Testing((🧪 Testing))
    UnitTests((Unit Tests))
    Integration((Integration Tests))
    E2E((End-to-End Tests))
    Deployment((🚀 Deployment))
    CI_CD((CI/CD Pipeline))
    Infra((Infrastructure))
    Docker((Docker))
    K8s((Kubernetes))
    Maintenance((🔧 Maintenance))
    Monitoring((Monitoring))
    Logs((Logs))
    Metrics((Metrics))
    Updates((Updates))
    Patches((Patches))
    Features((Feature Requests))
Mermaid`,
  },

  {
    title: 'Mind Map 4',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `mindmap
root(("🌐<br>IBM"))
History(("🏛️<br>History"))
Founding(("1911:<br>CTR"))
Renamed(("1924:<br>IBM"))
Milestones(("Key<br>Milestones"))
Products_and_Services(("💼<br>Products<br>and<br>Services"))
Hardware(("Hardware"))
Mainframes(("Z<br>Series"))
Servers(("Power<br>Systems"))
Software(("Software"))
Middleware(("WebSphere"))
Analytics(("Cognos"))
AI(("Watson"))
Cloud(("Cloud<br>and<br>Infrastructure"))
IaaS(("IBM<br>Cloud"))
PaaS(("Cloud<br>Paks"))
Services(("Services"))
Consulting(("IBM<br>Consulting"))
Support(("Technical<br>Support"))
Research_and_Innovation(("🔬<br>Research<br>and<br>Innovation"))
IBM_Research(("IBM<br>Research"))
Quantum(("Quantum<br>Computing"))
AI_Labs(("AI<br>Labs"))
Blockchain(("Blockchain<br>Solutions"))
Industries(("🏭<br>Industries"))
Finance(("Financial<br>Services"))
Healthcare(("Healthcare"))
Manufacturing(("Manufacturing"))
Retail(("Retail"))
Government(("Government"))
Corporate(("🏢<br>Corporate"))
Leadership(("Leadership"))
Culture(("Values<br>and<br>Culture"))
CSR(("Social<br>Responsibility"))
Global_Presence(("🌍<br>Global<br>Presence"))
Americas(("Americas"))
EMEA(("EMEA"))
APAC(("APAC"))
Partnerships(("🤝<br>Partnerships"))
Red_Hat(("Red<br>Hat"))
Open_Source(("Open<br>Source"))
Academia(("Academic<br>Collaborations"))
Sustainability(("♻️<br>Sustainability"))
Green_Computing(("Green<br>Computing"))
Climate_Pledge(("Climate<br>Pledge"))
    `,
  },

  {
    title: 'Relationship Graph',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `flowchart LR
  DukeLeto["Duke Leto Atreides"] --> Paul["Paul Atreides"]
  LadyJessica["Lady Jessica"] --> Paul
LadyJessica --> Alia["Alia Atreides"]
DukeLeto --> Gurney["Gurney Halleck"]
DukeLeto --> Duncan["Duncan Idaho"]
Thufir["Thufir Hawat"] --> DukeLeto
DrYueh["Dr. Wellington Yueh"] --> DukeLeto
Thufir --- Baron["Baron Vladimir Harkonnen"]
DrYueh --- Baron
Baron --> Feyd["Feyd-Rautha Harkonnen"]
Shaddam["Emperor Shaddam IV"] --- DukeLeto
Shaddam --- Baron
%% Fremen & alliances
Paul --- Stilgar["Stilgar"]
Paul --- Chani["Chani"]
Stilgar --> Chani
Gurney --- Paul
Duncan --> Paul

%% Styles
classDef atreides fill:#4f83cc,stroke:#ffffff,stroke-width:2px,color:#ffffff;
classDef hark fill:#cc4f4f,stroke:#ffffff,stroke-width:2px,color:#ffffff;
classDef fremen fill:#4fcc6e,stroke:#ffffff,stroke-width:2px,color:#ffffff;
classDef bene fill:#cc9f4f,stroke:#ffffff,stroke-width:2px,color:#ffffff;
classDef emperor fill:#9b4fcc,stroke:#ffffff,stroke-width:2px,color:#ffffff;
classDef advisor fill:#6e6e6e,stroke:#ffffff,stroke-width:2px,color:#ffffff;
classDef retainer fill:#888888,stroke:#ffffff,stroke-width:1px,color:#ffffff;

%% Apply styles
class DukeLeto,Paul,LadyJessica,Alia atreides;
class Baron,Feyd hark;
class Stilgar,Chani fremen;
class LadyJessica bene;
class Shaddam emperor;
class Thufir,DrYueh advisor;
class Gurney,Duncan retainer;
    `,
  },
  {
    title: 'Mind Map 2',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `
    mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
    `,
  },
  {
    title: 'UML Chart',
    width: 512,
    height: 512,
    thumbnail: false,
    definition: `
    zenuml
    title Order Service
    @Actor Client #FFEBE6
    @Boundary OrderController #0747A6
    @EC2 <<BFF>> OrderService #E3FCEF
    group BusinessService {
      @Lambda PurchaseService
      @AzureFunction InvoiceService
    }

    @Starter(Client)
    OrderController.post(payload) {
      OrderService.create(payload) {
        order = new Order(payload)
        if(order != null) {
          par {
            PurchaseService.createPO(order)
            InvoiceService.createInvoice(order)      
          }      
        }
      }
    }`,
  },
];

export const Showcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` ${examples.map(
      (example) =>
        html`
          <h3>${example.title}</h3>
          <br />
          <div style="display:inline-flex; min-width:100%;">
          <div style="flex: 0 0 70%">
          <clabs-chat-diagram
            title="${example.title}"
            width="${example.width}"
            height="${example.height}"
            ?thumbnail-mode=${example.thumbnail}
            definition="${example.definition}">
          </clabs-chat-diagram>
          </div>
          <div style="flex: 0 0 30%">
          <clabs-chat-code
            max-width="100%"
            max-height="512px"
            content="${example.definition}">
          <clabs-chat-code/>
          </div>
          </div>
          <br/>
          <br/>
          <br/>
        `
    )}`,
};

const Cloudexamples = [
  {
    title: 'Cloud architecture diagram test',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `%%{init: {
"theme": "base",
"themeVariables": {
"primaryColor": "#dafbe4",
"primaryBorderColor": "#0f62fe",
"lineColor":"#1B1B1B",
"primaryTextColor": "#161616",
"clusterBkg": "#ffffff",
"clusterBorder": "#0f62fe",
"lineColor":"#414141",
"nodeBorder": "#24a148",
"fontFamily": "IBM Plex Sans, sans-serif",
"edgeLabelBackground": "#ffffff",
"tertiaryColor": "#ffffff",
"clusterPadding": "12px",
"nodeTextAlign": "left",
"nodePadding": "10px",
"labelBoxWidth": "10px"
},
"flowchart": {
"curve": "stepBefore",
"htmlLabels": true
}
}}%%

flowchart TD
subgraph IBM_Cloud
direction LR
subgraph Cloud_Services
direction TB
Activity_Tracker[Activity Tracker]
Key_Management[Key Management]
Transit_Gateway[Transit Gateway]
Object_Storage[Object Storage]
end

subgraph Management_Resource_Group
subgraph Management_VPC
direction TB
Zone1_ManagementACL[<div style="text-align:left;border-left:3px solid #0f62fe;padding-left:6px;">Zone 1<br/>Management ACL</div>]
Zone1_VSI[<div style="text-align:left;border-left:3px solid #24a148;padding-left:6px;">10.10.10.0/24 : VSI</div>]
Zone1_ManagementACL --> Zone1_VSI
end
end

subgraph Workload_Resource_Group
subgraph Workload_VPC
direction TB
Zone1_WorkloadACL[<div style="text-align:left;border-left:3px solid #0f62fe;padding-left:6px;">Zone 1<br/>Workload ACL</div>]
Zone1_Workload_VSI[<div style="text-align:left;border-left:3px solid #24a148;padding-left:6px;">10.40.10.0/24 : VSI</div>]
Zone1_WorkloadACL --> Zone1_Workload_VSI
end
end

%% Connections
Transit_Gateway --> Zone1_ManagementACL
Transit_Gateway --> Zone1_WorkloadACL
end

%% Apply styles
classDef greenNode fill:#dafbe4,stroke:#24a148,stroke-width:1px,color:#161616;
class Activity_Tracker,Key_Management,Transit_Gateway,Object_Storage,Zone1_VSI,Zone1_Workload_VSI greenNode;

classDef aclNode fill:#ffffff,stroke:#da1e28,stroke-width:1px,color:#161616;
class Zone1_ManagementACL,Zone1_WorkloadACL aclNode;`,
  },
  {
    title: 'Cloud architecture diagram 2',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `
%%{init: {
"theme": "base",
"themeVariables": {
"primaryColor": "#dafbe4",
"primaryBorderColor": "#0f62fe",
"lineColor":"#1B1B1B",
"primaryTextColor": "#161616",
"clusterBkg": "#ffffff",
"clusterBorder": "#0f62fe",
"lineColor":"#414141",
"nodeBorder": "#24a148",
"fontFamily": "IBM Plex Sans, sans-serif",
"edgeLabelBackground": "#ffffff",
"tertiaryColor": "#ffffff",
"clusterPadding": "12px",
"nodeTextAlign": "left",
"nodePadding": "10px",
"labelBoxWidth": "10px"
},
"flowchart": {
"curve": "stepBefore",
"htmlLabels": true
}
}}%%

flowchart LR
subgraph Vehicles
subgraph Onboard
DP["Driver/passenger"]:::B
RD["Realtime decision"]:::P50
HMI["HMI"]:::P50
IVA["In vehicle API"]:::M50
SS["Security services"]:::R50
AIS["AI services"]:::B60
end
Sensor["Sensor"]:::G50
CC["Connected car"]:::P50
GW["Gateway"]:::G50
end

subgraph Connected_Car_Platform
subgraph Access_Network
NS["Network services"]:::G50
ES["Edge services"]:::B60
end
DAIP["Data & AI platform"]:::B60
PS["Peer services"]:::M50
LC["Live conversation"]:::P50
IoT["IoT transformation and connectivity"]:::M50
HMIApp["HMI mobile application"]:::P50
VS["Vehicle services"]:::P50
CVI["Connected vehicle insight"]:::B60
MSV["Mobility services"]:::P50
DS["Data services"]:::B60
TC["Transformation and connectivity"]:::M50
User["User"]:::B
end

subgraph Enterprise
CCR["CC registry"]:::B60
DSto["Data store"]:::B60
TPA["3rd party applications"]:::M50
EA["Enterprise applications"]:::P50
MH["Management hub"]:::T50
end

subgraph Core_Services
EG["Edge governance"]:::T50
SEC["Security"]:::R50
MCM["Multicloud manager"]:::T50
end

%% links
Sensor --> DP
DP --> RD
RD --> HMI
HMI --> IVA
HMI --> SS
HMI --> AIS
IVA --> GW
SS --> IoT
AIS --> IoT
GW --> NS
GW --> ES
NS --> DAIP
ES --> IoT
DAIP --> PS
PS --> LC
LC --> PS
PS --> DS
DS --> TC
TC --> CCR
TC --> DSto
TC --> TPA
TC --> EA
TC --> MH
IoT --> HMIApp
HMIApp --> VS
VS --> IoT
IoT --> DAIP
IoT --> PS
CVI --> PS
CVI --> TC
MSV --> TC
User --> VS
DP --> LC
HMI --> LC
NS --> LC
Sensor --> HMIApp`,
  },

  {
    title: 'Cloud architecture diagram 1',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `%%{init:{
  "theme":"base",
  "themeVariables":{
    "clusterBkg":"#ffffff",
    "clusterBorder":"#6f6f6f",
    "primaryBorderColor":"#0f62fe",
    "clusterBorderWidth":"3px",
    "lineColor":"#1B1B1B"
  },
  "flowchart":{
    "htmlLabels":true,
    "curve":"stepBefore",
    "padding":20,
    "nodeSpacing":50,
    "gutter":50
  }
}}%%
flowchart LR

  %%—— Vehicles —————————————————————————————————————————————————————
  subgraph Vehicles["Vehicles"]
    direction TB
    subgraph Onboard["Onboard"]
      direction TB
      Sensor["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Analytics/Sensor.svg'/> Sensor"]
      Driver["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Driver/Passenger"]
      RTDec["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg'/> Realtime decision"]
      HMI["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg'/> HMI"]
      InAPI["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg'/> In-vehicle API"]
      SecSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Security/Network%20ACL.svg'/> Security services"]
      AISvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/AI/AIOps.svg'/> AI services"]
      ConnCar["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg'/> Connected car"]
    end
  end

  %%—— Access network ———————————————————————————————————————————————
  subgraph AccessNet["Access network"]
    direction TB
    NetSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg'/> Network services"]
    EdgeSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg'/> Edge services"]
  end

  %%—— Connected car platform —————————————————————————————————————————
  subgraph ConnectedPlatform["Connected car platform"]
    direction LR
      DataAI["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg'/> Data AI platform"]
      IoTTrans["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg'/> IoT transformation connectivity"]
      LiveChat["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg'/> Live conversation"]
      PeerSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg'/> Peer services"]
      DataSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg'/> Data services"]
      VehInsight["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg'/> Connected vehicle insight"]
      MobSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg'/> Mobility services"]
      MobileApp["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/mobile.svg'/> HMI mobile application"]
      VehSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg'/> Vehicle services"]
      UserNode["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> User"]
    end

  %%—— Enterprise —————————————————————————————————————————————————————
  subgraph EnterpriseNet["Enterprise"]
    direction TB
    CCReg["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg'/> CC registry"]
    DataSto["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg'/> Data store"]
    ThirdApp["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg'/> 3rd party applications"]
    EntApp["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg'/> Enterprise applications"]
  end

  %%—— Governance & Security —————————————————————————————————————————
  subgraph Governance["Governance & Security"]
    direction LR
    EdgeGov["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg'/> Edge governance"]
    SecMgr["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Security/Network%20ACL.svg'/> Security"]
    MultiMgr["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg'/> Multicloud manager"]
  end

  %%—— Connections —————————————————————————————————————————————————————
  Sensor       --> RTDec
  Driver       --> RTDec
  RTDec        --> HMI
  HMI          --> InAPI
  InAPI        --> SecSvc
  SecSvc       --> AISvc
  AISvc        --> ConnCar
  ConnCar      --> NetSvc
  NetSvc       --> DataAI
  EdgeSvc      -.-> IoTTrans
  NetSvc       --> IoTTrans
  IoTTrans     --> DataAI
  IoTTrans     --> PeerSvc
  PeerSvc      <--> LiveChat
  PeerSvc      --> DataSvc
  DataSvc      --> IoTTrans
  DataAI       --> LiveChat
  DataAI       --> VehInsight
  VehInsight   --> MobileApp
  MobileApp    --> VehSvc
  VehSvc       --> IoTTrans
  UserNode     --> VehInsight
  CCReg        --> PeerSvc
  DataSto      --> PeerSvc
  ThirdApp     --> PeerSvc
  EntApp       --> PeerSvc

  %% Governance connections
  EdgeGov      --> NetSvc
  SecMgr       --> SecSvc
  MultiMgr     --> IoTTrans`,
  },
  {
    title: 'Cloud architecture diagram 2',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `%%{init:{
"theme":"base",
"themeVariables":{
"clusterBkg":"#edf5ff",
"clusterBorder":"#0f62fe",
"primaryBorderColor":"#0f62fe",
"lineColor":"#1B1B1B"
},
"flowchart":{
"htmlLabels":true,
"curve":"stepBefore",
"padding":10,
"nodeSpacing":20,
"gutter":50
}
}}%%
flowchart TD

%%—— Public network cluster ———————————————————————————————————————————
subgraph PublicNet["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #0f62fe;padding:6px 8px;'>Public network&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
User((" <img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> User"))
Internet((" <img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg'/> Internet"))
VPN((" <img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VPN"))
end

%%—— IBM Cloud cluster —————————————————————————————————————————————————
subgraph IBMCloud["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #0f62fe;padding:6px 8px;'>IBM Cloud&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB

subgraph Account["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #161616;padding:6px 8px;'>Account&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB

subgraph RegionA["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #161616;padding:6px 8px;'>Region A&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR

%% VPC 1
subgraph VPC1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #0f62fe;padding:6px 8px;'>VPC 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR

%% Zone 1 (public)
subgraph Zone1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>Zone 1<br/>10.10.0.0/18&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR
PG1["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Public Gateway"]
subgraph Subnet1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #42be65;padding:6px 8px;'>Subnet<br/>10.10.10.0/24: ACL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
subgraph SG1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #fa4d56;padding:6px 8px;'>Security Group 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
subgraph RG1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>RG 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
VSI1["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VSI"]
end
end
end
end

%% Zone 1 (VPN)
subgraph Zone1VPN["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>Zone 1 (VPN)<br/>10.10.0.0/18&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR
VG1["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VPN Gateway"]
subgraph Subnet2["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #42be65;padding:6px 8px;'>Subnet<br/>10.10.10.0/24: ACL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
subgraph SG2["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #fa4d56;padding:6px 8px;'>Security Group 2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
subgraph IG1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>Instance Group 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
VSI2["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VSI"]
end
end
end
end

%% Load balancers
PLB["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Public Load Balancer"]
PVTLB["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Private Load Balancer"]
end

%% Zone 2
subgraph Zone2["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>Zone 2<br/>10.20.0.0/18&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR
subgraph Subnet3["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #42be65;padding:6px 8px;'>Subnet<br/>10.20.10.0/24: ACL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
VSI3["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VSI"]
end
subgraph Subnet4["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #42be65;padding:6px 8px;'>Subnet<br/>10.20.10.0/24: ACL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
VSI4["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VSI"]
end
end

end
end
end

%%—— Enterprise network cluster —————————————————————————————————————————
subgraph EnterpriseNet["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #0f62fe;padding:6px 8px;'>Enterprise network&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
EUD["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Enterprise user directory"]
EUSR["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Enterprise User"]
EAPP["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Enterprise application"]
EDATA["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Enterprise data"]
end

%%—— Connections —————————————————————————————————————————————————————————
User --> Internet
Internet --> PG1
VPN --> VG1

PG1 --> VSI1
VG1 --> VSI2

VSI1 --> PLB
VSI2 --> PVTLB

PLB --> VSI3
PVTLB --> VSI4

PG1 --> EAPP
VG1 --> EDATA
EUD --> EUSR --> EAPP --> EDATA

%%—— Styles —————————————————————————————————————————————————————————————
%% clusters
style PublicNet fill:#edf5ff,stroke:#0f62fe,stroke-width:3px
style IBMCloud fill:#edf5ff,stroke:#0f62fe,stroke-width:3px
style Account fill:#ffffff,stroke:#161616,stroke-width:3px
style RegionA fill:#ffffff,stroke:#161616,stroke-width:3px
style VPC1 fill:#edf5ff,stroke:#0f62fe,stroke-width:3px
style Zone1 fill:#f4f4f4,stroke:#6f6f6f,stroke-width:3px
style Zone1VPN fill:#f4f4f4,stroke:#6f6f6f,stroke-width:3px
style Zone2 fill:#f4f4f4,stroke:#6f6f6f,stroke-width:3px
style Subnet1 fill:#dafbe1,stroke:#42be65,stroke-width:3px
style Subnet2 fill:#dafbe1,stroke:#42be65,stroke-width:3px
style Subnet3 fill:#dafbe1,stroke:#42be65,stroke-width:3px
style Subnet4 fill:#dafbe1,stroke:#42be65,stroke-width:3px
style SG1 fill:transparent,stroke:#fa4d56,stroke-width:3px,stroke-dasharray:5,5
style SG2 fill:transparent,stroke:#fa4d56,stroke-width:3px,stroke-dasharray:5,5
style RG1 fill:transparent,stroke:#6f6f6f,stroke-width:3px
style IG1 fill:transparent,stroke:#6f6f6f,stroke-width:3px
style EnterpriseNet fill:#edf5ff,stroke:#0f62fe,stroke-width:3px

%% image-nodes (transparent background)
style User fill:transparent,stroke:none
style Internet fill:transparent,stroke:none
style VPN fill:transparent,stroke:none
style PG1 fill:transparent,stroke:none
style VG1 fill:transparent,stroke:none
style VSI1 fill:transparent,stroke:none
style VSI2 fill:transparent,stroke:none
style VSI3 fill:transparent,stroke:none
style VSI4 fill:transparent,stroke:none
style PLB fill:transparent,stroke:none
style PVTLB fill:transparent,stroke:none
style EUD fill:transparent,stroke:none
style EUSR fill:transparent,stroke:none
style EAPP fill:transparent,stroke:none
style EDATA fill:transparent,stroke:none`,
  },
  {
    title: 'Cloud architecture diagram 3',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `%%{init:{
"theme":"base",
"themeVariables":{
"clusterBkg":"#f4f4f4",
"clusterBorder":"#0f62fe",
"primaryBorderColor":"#0f62fe",
"lineColor":"#1B1B1B"
},
"flowchart":{
"htmlLabels":true,
"curve":"stepBefore",
"padding":10,
"nodeSpacing":20,
"gutter":50
}
}}%%

flowchart TB
subgraph Chart["Chart"]
direction LR

subgraph Vehicles["Vehicles"]
subgraph Onboard["Onboard"]
Sensor["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Analytics/Sensor.svg' width='48px' height='48px'/> Sensor"]
Driver["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg' width='48px' height='48px'/> Driver/Passenger"]
RTDec["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg' width='48px' height='48px'/> Realtime decision"]
HMI["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg' width='48px' height='48px'/> HMI"]
InAPI["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg' width='48px' height='48px'/> In-vehicle API"]
SecSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Security/Network%20ACL.svg' width='48px' height='48px'/> Security services"]
AISvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/AI/AIOps.svg' width='48px' height='48px'/> AI services"]
ConnCar["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg' width='48px' height='48px'/> Connected car"]
end
end

subgraph AccessNet["Access network"]
NetSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg' width='48px' height='48px'/> Network services"]
EdgeSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg' width='48px' height='48px'/> Edge services"]
end

subgraph ConnectedPlatform["Connected car platform"]
DataAI["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg' width='48px' height='48px'/> Data & AI platform"]
IoTTrans["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg' width='48px' height='48px'/> IoT transformation"]
LiveChat["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg' width='48px' height='48px'/> Live conversation"]
PeerSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg' width='48px' height='48px'/> Peer services"]
DataSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg' width='48px' height='48px'/> Data services"]
VehInsight["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg' width='48px' height='48px'/> Vehicle insight"]
MobSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg' width='48px' height='48px'/> Mobility services"]
MobileApp["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/mobile.svg' width='48px' height='48px'/> HMI mobile app"]
VehSvc["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg' width='48px' height='48px'/> Vehicle services"]
UserNode["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg' width='48px' height='48px'/> User"]
end

subgraph EnterpriseNet["Enterprise"]
CCReg["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Transform%20Services/API.svg' width='48px' height='48px'/> CC registry"]
DataSto["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Compute/Bare%20Metal%20Server.svg' width='48px' height='48px'/> Data store"]
ThirdApp["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg' width='48px' height='48px'/> 3rd-party apps"]
EntApp["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Applications/Application.svg' width='48px' height='48px'/> Enterprise apps"]
end

subgraph Governance["Governance & Security"]
EdgeGov["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg' width='48px' height='48px'/> Edge governance"]
SecMgr["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Security/Network%20ACL.svg' width='48px' height='48px'/> Security"]
MultiMgr["<img src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg' width='48px' height='48px'/> Multicloud manager"]
end

%% Links
Sensor-->RTDec; Driver-->RTDec; RTDec-->HMI; HMI-->InAPI; InAPI-->SecSvc
SecSvc-->AISvc; AISvc-->ConnCar; ConnCar-->NetSvc; NetSvc-->DataAI
EdgeSvc-.->IoTTrans; NetSvc-->IoTTrans; IoTTrans-->DataAI; IoTTrans-->PeerSvc
PeerSvc<-->LiveChat; PeerSvc-->DataSvc; DataSvc-->IoTTrans; DataAI-->LiveChat
DataAI-->VehInsight; VehInsight-->MobileApp; MobileApp-->VehSvc
VehSvc-->IoTTrans; UserNode-->VehInsight; CCReg-->PeerSvc
DataSto-->PeerSvc; ThirdApp-->PeerSvc; EntApp-->PeerSvc
EdgeGov-->NetSvc; SecMgr-->SecSvc; MultiMgr-->IoTTrans

end

style Onboard fill:#f4f4f4
style AccessNet fill:#f4f4f4`,
  },
  {
    title: 'Cloud architecture diagram 4',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `%%{init:{
"theme":"default",
"themeVariables":{
"clusterBkg":"#f4f4f4",
"clusterBorder":"#0f62fe",
"primaryBorderColor":"#0f62fe",
"lineColor":"#1B1B1B"
},
"flowchart":{
"htmlLabels":true,
"curve":"stepBefore",
"padding":10,
"nodeSpacing":20,
"gutter":50
}
}}%%
flowchart LR
%%—— Public network cluster ———————————————————————————————————————————
subgraph PublicNet["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #0f62fe;padding:6px 8px;'>Public network&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
User((" <img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> User"))
Internet((" <img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Networking/Internet.svg'/> Internet"))
VPN((" <img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VPN"))
end

%%—— IBM Cloud cluster —————————————————————————————————————————————————
subgraph IBMCloud["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #0f62fe;padding:6px 8px;'>IBM Cloud&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB

subgraph Account["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #161616;padding:6px 8px;'>Account&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB

subgraph RegionA["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #161616;padding:6px 8px;'>Region A&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR

%% VPC 1
subgraph VPC1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #0f62fe;padding:6px 8px;'>VPC 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR

%% Zone 1 (public)
subgraph Zone1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>Zone 1<br/>10.10.0.0/18&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR
PG1["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Public Gateway"]
subgraph Subnet1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #42be65;padding:6px 8px;'>Subnet<br/>10.10.10.0/24: ACL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
subgraph SG1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #fa4d56;padding:6px 8px;'>Security Group 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
subgraph RG1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>RG 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
VSI1["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VSI"]
end
end
end
end

%% Zone 1 (VPN)
subgraph Zone1VPN["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>Zone 1 (VPN)<br/>10.10.0.0/18&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR
VG1["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VPN Gateway"]
subgraph Subnet2["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #42be65;padding:6px 8px;'>Subnet<br/>10.10.10.0/24: ACL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
subgraph SG2["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #fa4d56;padding:6px 8px;'>Security Group 2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
subgraph IG1["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>Instance Group 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
VSI2["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VSI"]
end
end
end
end

%% Load balancers
PLB["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Public Load Balancer"]
PVTLB["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Private Load Balancer"]
end

%% Zone 2
subgraph Zone2["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #6f6f6f;padding:6px 8px;'>Zone 2<br/>10.20.0.0/18&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction LR
subgraph Subnet3["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #42be65;padding:6px 8px;'>Subnet<br/>10.20.10.0/24: ACL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
VSI3["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VSI"]
end
subgraph Subnet4["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #42be65;padding:6px 8px;'>Subnet<br/>10.20.10.0/24: ACL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
VSI4["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> VSI"]
end
end

end
end
end

%%—— Enterprise network cluster —————————————————————————————————————————
subgraph EnterpriseNet["<div style='width:100%;text-align:left;font-weight:bold;border-left:5px solid #0f62fe;padding:6px 8px;'>Enterprise network&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>"]
direction TB
EUD["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Enterprise user directory"]
EUSR["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Enterprise User"]
EAPP["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Enterprise application"]
EDATA["<img style='width:48px;height:48px;' src='https://raw.githubusercontent.com/IBM-Cloud/architecture-icons/main/svg/Actors/User.svg'/> Enterprise data"]
end

%%—— Connections —————————————————————————————————————————————————————————
User --> Internet
Internet --> PG1
VPN --> VG1

PG1 --> VSI1
VG1 --> VSI2

VSI1 --> PLB
VSI2 --> PVTLB

PLB --> VSI3
PVTLB --> VSI4

PG1 --> EAPP
VG1 --> EDATA
EUD --> EUSR --> EAPP --> EDATA

%%—— Styles —————————————————————————————————————————————————————————————
%% clusters
style PublicNet fill:#edf5ff,stroke:#0f62fe,stroke-width:3px
style IBMCloud fill:#edf5ff,stroke:#0f62fe,stroke-width:3px
style Account fill:#ffffff,stroke:#161616,stroke-width:3px
style RegionA fill:#ffffff,stroke:#161616,stroke-width:3px
style VPC1 fill:#edf5ff,stroke:#0f62fe,stroke-width:3px
style Zone1 fill:#f4f4f4,stroke:#6f6f6f,stroke-width:3px
style Zone1VPN fill:#f4f4f4,stroke:#6f6f6f,stroke-width:3px
style Zone2 fill:#f4f4f4,stroke:#6f6f6f,stroke-width:3px
style Subnet1 fill:#dafbe1,stroke:#42be65,stroke-width:3px
style Subnet2 fill:#dafbe1,stroke:#42be65,stroke-width:3px
style Subnet3 fill:#dafbe1,stroke:#42be65,stroke-width:3px
style Subnet4 fill:#dafbe1,stroke:#42be65,stroke-width:3px
style SG1 fill:transparent,stroke:#fa4d56,stroke-width:3px,stroke-dasharray:5,5
style SG2 fill:transparent,stroke:#fa4d56,stroke-width:3px,stroke-dasharray:5,5
style RG1 fill:transparent,stroke:#6f6f6f,stroke-width:3px
style IG1 fill:transparent,stroke:#6f6f6f,stroke-width:3px
style EnterpriseNet fill:#edf5ff,stroke:#0f62fe,stroke-width:3px

%% image-nodes (transparent background)
style User fill:transparent,stroke:none
style Internet fill:transparent,stroke:none
style VPN fill:transparent,stroke:none
style PG1 fill:transparent,stroke:none
style VG1 fill:transparent,stroke:none
style VSI1 fill:transparent,stroke:none
style VSI2 fill:transparent,stroke:none
style VSI3 fill:transparent,stroke:none
style VSI4 fill:transparent,stroke:none
style PLB fill:transparent,stroke:none
style PVTLB fill:transparent,stroke:none
style EUD fill:transparent,stroke:none
style EUSR fill:transparent,stroke:none
style EAPP fill:transparent,stroke:none
style EDATA fill:transparent,stroke:none`,
  },
];

export const CloudShowcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` ${Cloudexamples.map(
      (example) =>
        html`
          <h3>${example.title}</h3>
          <br />
          <div style="min-width:100%;">
          <div>
          <clabs-chat-diagram
            architecture-diagram-mode
            title="${example.title}"
            width="${example.width}"
            height="${example.height}"
            ?thumbnail-mode=${example.thumbnail}
            definition="${example.definition}">
          </clabs-chat-diagram>
          </div>
          <div >
          <clabs-chat-code
            max-width="100%"
            max-height="400px"
            enable-block-collapse
            content="${example.definition}">
          <clabs-chat-code/>
          </div>
          </div>
          <br/>
          <br/>
          <br/>
        `
    )}`,
};
