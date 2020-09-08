import React from 'react';

export default function OrdersPagination({ page, setPage, hasNextPage }) {
  return (
    <ul className="pagination">
      {page === 1 && (
        <li className="disabled">
          <a>
            <i className="material-icons">chevron_left</i>
          </a>
        </li>
      )}
      {page !== 1 && (
        <li className="waves-effect">
          <a onClick={() => setPage(page - 1)}>
            <i className="material-icons">chevron_left</i>
          </a>
        </li>
      )}

      {page !== 1 && (
        <li className="waves-effect">
          <a onClick={() => setPage(1)}>1</a>
        </li>
      )}
      {page > 2 && (
        <li className="disabled">
          <i className="material-icons">more_horiz</i>
        </li>
      )}
      {page > 2 && (
        <li className="waves-effect">
          <a onClick={() => setPage(page - 1)}>{page - 1}</a>
        </li>
      )}
      <li className="active indigo darken-2 white-text">
        <a>{page}</a>
      </li>

      {hasNextPage && (
        <li className="waves-effect">
          <a onClick={() => setPage(page + 1)}>{page + 1}</a>
        </li>
      )}
      {hasNextPage && (
        <li className="waves-effect">
          <a onClick={() => setPage(page + 1)}>
            <i className="material-icons">chevron_right</i>
          </a>
        </li>
      )}
      {!hasNextPage && (
        <li className="disabled">
          <a>
            <i className="material-icons">chevron_right</i>
          </a>
        </li>
      )}
    </ul>
  );
}
