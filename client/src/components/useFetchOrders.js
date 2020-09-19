import { useReducer, useEffect } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;

const ACTIONS = {
  MAKE_REQUEST: 'make-request',
  GET_DATA: 'get-data',
  ERROR: 'error',
  HAS_NEXT_PAGE: 'has-next-page'
};
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.MAKE_REQUEST:
      return { loading: true, orders: [] };
    case ACTIONS.GET_DATA:
      return { ...state, loading: false, orders: action.payload.orders };
    case ACTIONS.ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        orders: []
      };
    case ACTIONS.HAS_NEXT_PAGE:
      return { ...state, hasNextPage: action.payload.hasNextPage };
    default:
      return state;
  }
}

export default function useFetchOrders(page, limit, fetchAgainToggle) {
  const [state, dispatch] = useReducer(reducer, { orders: [], loading: true });

  useEffect(() => {
    const cancelToken1 = axios.CancelToken.source();
    dispatch({ type: ACTIONS.MAKE_REQUEST });

    axios
      .get(
        '/api/v1/orders',
        {
          cancelToken: cancelToken1.token,
          params: {
            page,
            limit
          }
        },
        { withCredentials: true }
      )
      .then(res => {
        dispatch({
          type: ACTIONS.GET_DATA,
          payload: { orders: res.data.data.orders }
        });
      })
      .catch(e => {
        if (axios.isCancel(e)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: e } });
      });

    const cancelToken2 = axios.CancelToken.source();
    axios
      .get(
        '/api/v1/orders',
        {
          cancelToken: cancelToken2.token,
          params: {
            page: page + 1,
            limit
          }
        },
        { withCredentials: true }
      )
      .then(res => {
        dispatch({
          type: ACTIONS.HAS_NEXT_PAGE,
          payload: { hasNextPage: res.data.data.orders.length > 0 }
        });
      })
      .catch(e => {
        if (axios.isCancel(e)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: e } });
      });
    return () => {
      cancelToken1.cancel();
      cancelToken2.cancel();
    };
  }, [page, limit, fetchAgainToggle]);

  return state;
}
