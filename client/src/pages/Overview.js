import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import useFetchOrders from '../components/useFetchOrders';
import Order from '../components/Order';
import OrdersPagination from '../components/OrdersPagination';
import Spinner from '../layout/Spinner';
import { Link, useHistory } from 'react-router-dom';

import M from 'materialize-css';

const Overview = () => {
  const history = useHistory();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [fetchAgainToggle, setFetchAgainToggle] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckError, setAdminCheckError] = useState('');
  const { orders, loading, error, totalPages } = useFetchOrders(
    page,
    limit,
    fetchAgainToggle
  );

  useEffect(() => {
    M.AutoInit();
  });

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();

    axios
      .get('/api/v1/users/me', {
        cancelToken: cancelToken.token,
        withCredentials: true
      })
      .then(response => {
        setIsAdmin(response.data.data.user.role === 'admin');
      })
      .catch(requestError => {
        if (axios.isCancel(requestError)) return;
        if (requestError.response && requestError.response.status === 401) {
          history.push('/login');
          return;
        }
        setAdminCheckError('Administratorska prava nisu mogla biti proverena.');
      });

    return () => cancelToken.cancel();
  }, [history]);

  useEffect(() => {
    orders.sort((a, b) => a.createdAt - b.createdAt);
  }, [orders]);

  const refreshOrders = e => {
    setFetchAgainToggle(prev => !prev);
  };

  useEffect(() => {
    if (error) history.push('/login');
  }, [error, history]);
  return (
    <Fragment>
      <div className="container">
        <div className="right-align" style={{ margin: '16px 0' }}>
          <Link to="/catalog" className="btn-flat indigo-text">
            <i className="material-icons left">settings</i>
            Cene i formati
          </Link>
        </div>
        <OrdersPagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
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
        {adminCheckError && (
          <p role="alert" className="red-text center-align">
            {adminCheckError}
          </p>
        )}
        <div className="row">
          <div className="col s8 offset-s2">
            {orders.map(order => (
              <Order
                key={order.id}
                order={order}
                setFetchAgainToggle={setFetchAgainToggle}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
        <OrdersPagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
        <br></br>
        <br></br>
      </div>
    </Fragment>
  );
};
export default Overview;
