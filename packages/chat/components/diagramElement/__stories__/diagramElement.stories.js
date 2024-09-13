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
  title: 'Components/Chat/Diagram',
  tags: ['autodocs'],
};

const examples = [
  {
    title: 'Diagram test',
    width: 126,
    height: 126,
    thumbnail: true,
    definition: `%% Basic example
      graph TD;
      A[start] --> B[End];
      `,
  },
  {
    title: 'Diagram test 3',
    width: 512,
    height: 246,
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
          <clabs-chat-diagram
            title="${example.title}"
            width="${example.width}"
            height="${example.height}"
            ?thumbnail-mode=${example.thumbnail}
            definition="${example.definition}">
          </clabs-chat-diagram>
        `
    )}`,
};
