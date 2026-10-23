import React from 'react';

import OrderSummary from './OrderSummary';
import './OrderModals.css';

const getDeliveryDescription = delivery => {
  if (delivery === 'kurirska sluzba') return 'Dostava na adresu';
  if (delivery === 'radnja trosarina') {
    return 'Radnja na Trošarini — Bul. Sv. cara Konstantina bb lokal 10, Niš';
  }
  return 'Radnja u centru — Karadžićeva 12, Niš';
};

const OrderConfirmationModal = ({
  userInfo,
  photoCount,
  pricePerPhoto,
  total
}) => (
  <div
    id="modal1"
    className="modal order-confirmation-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="order-confirmation-title"
  >
    <div className="modal-content order-confirmation-modal__content">
      <div className="order-modal__heading">
        <span className="order-modal__icon" aria-hidden="true">
          <i className="material-icons">fact_check</i>
        </span>
        <div>
          <p className="order-modal__eyebrow">Završni korak</p>
          <h5 id="order-confirmation-title">Proverite porudžbinu</h5>
          <p className="order-modal__intro">
            Proverite podatke pre nego što potvrdite porudžbinu.
          </p>
        </div>
      </div>

      <div className="order-confirmation-modal__body">
        <section
          className="order-modal__details"
          aria-label="Podaci za dostavu"
        >
          <h6>Podaci za dostavu</h6>
          <dl>
            <div>
              <dt>Ime i prezime</dt>
              <dd>
                {userInfo.ime} {userInfo.prezime}
              </dd>
            </div>
            <div>
              <dt>Način preuzimanja</dt>
              <dd>{getDeliveryDescription(userInfo.preuzimanje)}</dd>
            </div>
            {userInfo.preuzimanje === 'kurirska sluzba' && (
              <div>
                <dt>Adresa</dt>
                <dd>{userInfo.adresa}</dd>
              </div>
            )}
            <div>
              <dt>Telefon</dt>
              <dd>{userInfo.telefon}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{userInfo.email}</dd>
            </div>
          </dl>
        </section>
        <div className="order-confirmation-modal__summary">
          <OrderSummary
            confirmation
            format={userInfo.format}
            photoCount={photoCount}
            pricePerPhoto={pricePerPhoto}
            total={total}
            courierDelivery={userInfo.preuzimanje === 'kurirska sluzba'}
          />
        </div>
      </div>
    </div>
    <div className="modal-footer order-modal__footer">
      <button
        type="button"
        className="modal-close order-modal__button order-modal__button--secondary"
      >
        Nazad
      </button>
      <button
        type="submit"
        name="action"
        className="modal-close order-modal__button order-modal__button--primary"
      >
        Potvrdi porudžbinu
      </button>
    </div>
  </div>
);

export default OrderConfirmationModal;
