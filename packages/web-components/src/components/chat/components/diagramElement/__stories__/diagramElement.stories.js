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
  {
    title: 'Diagram test 4',
    thumbnail: false,
    definition: `sequenceDiagram
    participant web as Web Browser
    participant blog as Blog Service
    participant account as Account Service
    participant mail as Mail Service
    participant db as Storage

    Note over web,db: The user must be logged in to submit blog posts
    web->>+account: Logs in using credentials
    account->>db: Query stored accounts
    db->>account: Respond with query result

    alt Credentials not found
        account->>web: Invalid credentials
    else Credentials found
        account->>-web: Successfully logged in

        Note over web,db: When the user is authenticated, they can now submit new posts
        web->>+blog: Submit new post
        blog->>db: Store post data

        par Notifications
            blog--)mail: Send mail to blog subscribers
            blog--)db: Store in-site notifications
        and Response
            blog-->>-web: Successfully posted
        end
    end

    `,
  },

  {
    title: 'Diagram test 5',
    width: 512,
    height: 246,
    thumbnail: false,
    definition: `
architecture-beta
group vpc(virtual-private-cloud)[VPC]
group subnet(network)[Subnet]
group api(cloud)[API Gateway]

service loadBalancer(load-balancer)[Load Balancer] in vpc
service vm1(virtual-server)[Virtual Server 1] in vpc
service vm2(virtual-server)[Virtual Server 2] in vpc
service db(cloudant)[Cloudant DB] in api
service function1(cloud-function)[Function 1] in api
service function2(cloud-function)[Function 2] in api
service networkService(network-service)[Network Service] in subnet

loadBalancer:R -- L:vm1
loadBalancer:R -- L:vm2
vm1:B -- T:db
vm2:B -- T:db
function1:T --> B:db
function2:T --> B:db
vm1:R --> L:networkService
vm2:R --> L:networkService
`,
  },

  {
    title: 'Diagram test 7',
    thumbnail: false,
    definition: `
  architecture-beta
group vpc(virtual-private-cloud)[VPC]
group subnet1(network)[Subnet 1]
group subnet2(network)[Subnet 2]
group api(cloud)[API Gateway]
group security(security)[Security]

service loadBalancer(load-balancer)[Load Balancer] in vpc
service vm1(virtual-server)[Virtual Server 1] in subnet1
service vm2(virtual-server)[Virtual Server 2] in subnet1
service vm3(virtual-server)[Virtual Server 3] in subnet2
service vm4(virtual-server)[Virtual Server 4] in subnet2
service db(cloudant)[Cloudant DB] in api
service queue(mq)[Message Queue] in api
service auth(authentication)[IAM Authentication] in security
service firewall(firewall)[Firewall] in security

loadBalancer:R -- L:vm1
loadBalancer:R -- L:vm2
loadBalancer:R -- L:vm3
loadBalancer:R -- L:vm4
vm1:B -- T:db
vm2:B -- T:db
vm3:B -- T:db
vm4:B -- T:db
queue:T -- B:db
auth:R -- L:db
firewall:L --> R:auth

vm1:R --> L:vm3
vm2:R --> L:vm4
vm3:T --> B:vm1
vm4:T --> B:vm2
    `,
  },
  {
    title: 'Diagram test 6',
    thumbnail: false,
    definition: `
architecture-beta
group vpc(virtual-private-cloud)[VPC]
group subnet1(network)[Subnet 1]
group subnet2(network)[Subnet 2]
group api(cloud)[API Gateway]
group dbGroup(database)[Databases]
group security(security)[Security]
group storage(storage)[Storage]

service loadBalancer(load-balancer)[Load Balancer] in vpc
service vm1(virtual-server)[Virtual Server 1] in subnet1
service vm2(virtual-server)[Virtual Server 2] in subnet1
service vm3(virtual-server)[Virtual Server 3] in subnet2
service vm4(virtual-server)[Virtual Server 4] in subnet2
service db1(cloudant)[Cloudant DB] in dbGroup
service db2(postgres)[PostgreSQL] in dbGroup
service db3(mysql)[MySQL DB] in dbGroup
service db4(ibmdb2)[DB2] in dbGroup
service queue(mq)[Message Queue] in api
service auth(authentication)[IAM Authentication] in security
service firewall(firewall)[Firewall] in security
service disk1(block-storage)[Block Storage] in storage
service disk2(object-storage)[Object Storage] in storage
service encryption(key-protect)[Key Protect] in security

loadBalancer:R -- L:vm1
loadBalancer:R -- L:vm2
loadBalancer:R -- L:vm3
loadBalancer:R -- L:vm4
vm1:B -- T:db1
vm2:B -- T:db2
vm3:B -- T:db3
vm4:B -- T:db4
queue:T -- B:db1
queue:T -- B:db2
queue:T -- B:db3
queue:T -- B:db4
auth:R -- L:db1
auth:R -- L:db2
auth:R -- L:db3
auth:R -- L:db4
firewall:L --> R:auth
encryption:T -- B:disk1
encryption:T -- B:disk2

disk1:L -- R:db1
disk2:L -- R:db2
disk1:L -- R:db3
disk2:L -- R:db4
`,
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
          <div style="flex:1;">
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
