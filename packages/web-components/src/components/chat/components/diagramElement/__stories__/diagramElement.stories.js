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
"lineColor":"#414141",
"fontFamily": "IBM Plex Sans, sans-serif",
"nodeBorderWidth": "5px",
"clusterBorderWidth": "5px",
"edgeLabelBackground":"#ffffff",
"clusterBkg": "#ffffff",
"clusterBorder": "#0f62fe",
"primaryBorderColor": "#0f62fe"
},
"flowchart": {
"curve": "step",
"htmlLabels": true
}
}}%%

graph LR
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
    title: 'Architecture Diagram 3',
    thumbnail: false,
    definition: `%%{init: {
"theme": "base",
"themeVariables": {
"primaryColor": "#dafbe4",
"primaryBorderColor": "#0f62fe",
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

graph TD
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
    title: 'Mind Map',
    width: '100%',
    height: 512,
    thumbnail: false,
    definition: `mindmap
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
    definition: `graph LR
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
    definition: `mindmap
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
