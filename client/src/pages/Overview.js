import React, { useState, useEffect, Fragment } from 'react';
import useFetchOrders from '../components/useFetchOrders';
import Order from '../components/Order';
import OrdersPagination from '../components/OrdersPagination';
import Spinner from '../layout/Spinner';
import { useHistory } from 'react-router-dom';

import M from 'materialize-css';

const Overview = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [fetchAgainToggle, setFetchAgainToggle] = useState(false);
  const { orders, loading, error, hasNextPage } = useFetchOrders(
    page,
    limit,
    fetchAgainToggle
  );

  useEffect(() => {
    M.AutoInit();
  });

  useEffect(() => {
    orders.sort((a, b) => a.createdAt - b.createdAt);
  }, [orders]);

  const refreshOrders = e => {
    setFetchAgainToggle(prev => !prev);
  };

  let history = useHistory();
  useEffect(() => {
    if (error) history.push('/login');
  }, [error]);
  return (
    <Fragment>
      <div className="container">
        <OrdersPagination
          page={page}
          setPage={setPage}
          hasNextPage={hasNextPage}
        />
        <a className="btn-floating" onClick={e => refreshOrders(e)}>
          <i className="material-icons">refresh</i>
        </a>
        {loading && (
          <div className=" row center-align">
            <Spinner />
          </div>
        )}
        {error && <h2>Error</h2>}
        <div className="row">
          <div className="col s8 offset-s2">
            {orders.map(order => (
              <Order
                key={order.id}
                order={order}
                setFetchAgainToggle={setFetchAgainToggle}
              />
            ))}
          </div>
        </div>
        <OrdersPagination
          page={page}
          setPage={setPage}
          hasNextPage={hasNextPage}
        />
        <br></br>
        <br></br>
      </div>
    </Fragment>
  );
};
export default Overview;
