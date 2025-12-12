import React from 'react'

const MockWrappedWebComponent = (props) => {
  const { 
    onaiCallback, 
    onNotificationOpenCallback,
    onLogoutCallback,
    onSearchCallback,
    onSearchSubmitCallback,
    productKey
  } = props;
  
  return (
    <div data-testid="mock-hybrid-ipaas-header" role="banner">
      <button onClick={() => onaiCallback?.()}>AI Callback</button>
      <button onClick={() => onNotificationOpenCallback?.()}>Notification</button>
      <button onClick={() => onLogoutCallback?.()}>Logout</button>
      <button onClick={() => onSearchCallback?.('test search')}>Search</button>
      <button onClick={() => onSearchSubmitCallback?.('test submit')}>Submit</button>
      <span>Product: {productKey}</span>
    </div>
  );
};

export const createComponent = () => MockWrappedWebComponent;