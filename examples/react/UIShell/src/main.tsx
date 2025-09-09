/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router';
import { routes } from './config/routes';

import './index.scss';
import { HeaderExample } from './components/HeaderExample';

// Relying on React to render - non outlet version
// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <Theme theme="g100">
//       <BrowserRouter>
//         <Routes>
//           {routes.map(({ element: Page, ...rest }) => (
//             <Route {...rest} element={<Page />} />
//           ))}
//         </Routes>
//       </BrowserRouter>
//     </Theme>
//   </React.StrictMode>
// );

// With outlet
const Layout = () => (
  <HeaderExample>
    <Outlet />
  </HeaderExample>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {routes.map(({ element: Page, ...rest }) => (
            <Route
              key={rest.path}
              {...rest}
              element={Page && <Page usingOutlet />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
