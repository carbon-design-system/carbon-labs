/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from '@open-wc/testing';

import { ReactWrapper } from '../ReactWrapper';

describe('ReactWrapper', () => {
  it('renders a HybridIpaasHeader component', async () => {
    const options = {
      productKey: 'my product'
    }
    render(<ReactWrapper {...options} />)
    await waitFor(() => {
      screen.getByText('Product: my product')
    })
    screen.debug()
    const text = screen.getAllByText('Product: my product')
    expect(text.length).to.equal(1)
  })

  it('calls ai callback', async () => {
    let callCount = 0
    const options = {
      productKey: 'my product',
      aiCallback: () => { callCount++ }
    };
    render(<ReactWrapper {...options} />)
    const aiButton = await screen.getByRole('button', { name: 'AI Callback' })
    await userEvent.click(aiButton)
    expect(callCount).to.equal(1)
  })

  it('calls notification callback', async () => {
    let callCount = 0
    const options = {
      productKey: 'my product',
      onNotificationOpenCallback: () => { callCount++ }
    };
    render(<ReactWrapper {...options} />)
    const notificationButton = await screen.getByRole('button', { name: 'Notification' })
    await userEvent.click(notificationButton)
    expect(callCount).to.equal(1)
  })

  it('calls logout callback', async () => {
    let callCount = 0
    const options = {
      productKey: 'my product',
      onLogoutCallback: () => { callCount++ }
    };
    render(<ReactWrapper {...options} />)
    const logoutButton = await screen.getByRole('button', { name: 'Logout' })
    await userEvent.click(logoutButton)
    expect(callCount).to.equal(1)
  })

  it('calls search callback', async () => {
    let callCount = 0
    const options = {
      productKey: 'my product',
      onSearchCallback: () => { callCount++ }
    };
    render(<ReactWrapper {...options} />)
    const searchButton = await screen.getByRole('button', { name: 'Search' })
    await userEvent.click(searchButton)
    expect(callCount).to.equal(1)
  })

  it('calls search submit callback', async () => {
    let callCount = 0
    const options = {
      productKey: 'my product',
      onSearchSubmitCallback: () => { callCount++ }
    };
    render(<ReactWrapper {...options} />)
    const submitButton = await screen.getByRole('button', { name: 'Submit' })
    await userEvent.click(submitButton)
    expect(callCount).to.equal(1)
  })
})