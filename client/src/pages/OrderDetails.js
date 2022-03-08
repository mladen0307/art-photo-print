import React from 'react';

const OrderDetails = ({ match }) => {
  return <div>{match.params.id}</div>;
};

export default OrderDetails;
