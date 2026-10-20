import { useReducer, useEffect } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;

const ACTIONS = {
  MAKE_REQUEST: 'make-request',
  GET_DATA: 'get-data',
  ERROR: 'error'
};
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.MAKE_REQUEST:
      return { loading: true, orders: [] };
    case ACTIONS.GET_DATA:
      return {
        ...state,
        loading: false,
        orders: action.payload.orders,
        totalPages: action.payload.totalPages
      };
    case ACTIONS.ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        orders: []
      };
    default:
      return state;
  }
}

export default function useFetchOrders(page, limit, fetchAgainToggle) {
  const [state, dispatch] = useReducer(reducer, { orders: [], loading: true });

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    dispatch({ type: ACTIONS.MAKE_REQUEST });

    axios
      .get(
        '/api/v1/orders',
        {
          cancelToken: cancelToken.token,
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
          payload: {
            orders: res.data.data.orders,
            totalPages: res.data.data.totalPages
          }
        });
      })
      .catch(e => {
        if (axios.isCancel(e)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: e } });
      });

    return () => {
      cancelToken.cancel();
    };
  }, [page, limit, fetchAgainToggle]);

  return state;
}
