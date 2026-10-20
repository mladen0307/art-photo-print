import React from 'react';

export default function OrdersPagination({ page, setPage, totalPages }) {
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return (
    <ul className="pagination">
      {!hasPreviousPage && (
        <li className="disabled">
          <a>
            <i className="material-icons">chevron_left</i>
          </a>
        </li>
      )}
      {hasPreviousPage && (
        <li style={{ cursor: 'pointer' }}>
          <a onClick={() => setPage(page - 1)}>
            <i className="material-icons">chevron_left</i>
          </a>
        </li>
      )}

      {page !== 1 && (
        <li style={{ cursor: 'pointer' }}>
          <a onClick={() => setPage(1)}>1</a>
        </li>
      )}
      {page > 2 && (
        <li className="disabled" style={{ cursor: 'default' }}>
          <i className="material-icons">more_horiz</i>
        </li>
      )}
      {page > 2 && (
        <li style={{ cursor: 'pointer' }}>
          <a onClick={() => setPage(page - 1)}>{page - 1}</a>
        </li>
      )}
      <li className="active indigo darken-2 white-text" style={{ cursor: 'default' }}>
        <a>{page}</a>
      </li>

      {hasNextPage && (
        <li style={{ cursor: 'pointer' }}>
          <a onClick={() => setPage(page + 1)}>{page + 1}</a>
        </li>
      )}
      {totalPages - page > 2 && (
        <li className="disabled" style={{ cursor: 'default' }}>
          <i className="material-icons">more_horiz</i>
        </li>
      )}
      {page < totalPages - 1 && (
        <li style={{ cursor: 'pointer' }}>
          <a onClick={() => setPage(totalPages)}>{totalPages}</a>
        </li>
      )}
      {hasNextPage && (
        <li style={{ cursor: 'pointer' }}>
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
