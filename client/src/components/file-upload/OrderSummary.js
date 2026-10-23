import React from 'react';

import './OrderSummary.css';

const OrderSummary = ({
  photoCount,
  pricePerPhoto,
  total,
  courierDelivery,
  format,
  confirmation = false
}) => (
  <section
    className={`order-summary${confirmation ? ' order-summary--confirmation' : ''}`}
    aria-label="Pregled porudžbine"
  >
    <header className="order-summary__header">
      <span
        className="order-summary__icon"
        aria-hidden="true"
        data-testid="order-summary-photo-icon"
      >
        <i className="material-icons">photo_library</i>
      </span>
      <div className="order-summary__title">
        <h5>{confirmation ? 'Vaša porudžbina' : 'Vaša korpa'}</h5>
        {format && (
          <span className="order-summary__format">
            Format <strong>{format}</strong>
          </span>
        )}
      </div>
      <span className="order-summary__count">
        {photoCount}{' '}
        {photoCount % 10 === 1 && photoCount % 100 !== 11
          ? 'fotografija'
          : photoCount % 10 >= 2 &&
            photoCount % 10 <= 4 &&
            (photoCount % 100 < 12 || photoCount % 100 > 14)
          ? 'fotografije'
          : 'fotografija'}
      </span>
    </header>

    <div className="order-summary__line">
      <span>Cena po fotografiji</span>
      <strong>
        {pricePerPhoto === '' ? 'nije dostupna' : `${pricePerPhoto} rsd`}
      </strong>
    </div>

    <footer className="order-summary__total">
      <div>
        <span>Ukupno</span>
        {courierDelivery && (
          <small>Poštarina se obračunava posebno</small>
        )}
      </div>
      <strong>{total === '' ? 'nije dostupno' : `${total} rsd`}</strong>
    </footer>
  </section>
);

export default OrderSummary;
