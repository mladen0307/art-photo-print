import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SmartGallery from 'react-smart-gallery';

import './Order.css';

const getDeliveryPresentation = delivery => {
  if (delivery === 'kurirska sluzba') {
    return {
      label: 'Dostava',
      className: 'order-card__delivery--courier',
      icon: 'local_shipping'
    };
  }
  if (delivery === 'radnja trosarina') {
    return {
      label: 'Radnja na Trošarini',
      className: 'order-card__delivery--trosarina'
    };
  }
  if (delivery === 'radnja centar') {
    return {
      label: 'Radnja u centru',
      className: 'order-card__delivery--centar'
    };
  }
  return {
    label: delivery,
    className: 'order-card__delivery--default'
  };
};

export default function Order({ order, setFetchAgainToggle }) {
  const [izdato, setIzdato] = useState(order.izdato);
  const photos = order.photos.map(photo => photo.url).filter(Boolean);

  useEffect(() => {
    axios({
      url: `/api/v1/orders/${order.id}`,
      method: 'PATCH',
      data: {
        izdato: izdato
      },
      withCredentials: true
    }).then(response => {});
  }, [izdato, order.id]);

  const posaljiEmail = () => {
    axios({
      url: `/api/v1/orders/${order.id}/sendEmail`,
      method: 'GET',
      withCredentials: true
    }).then(response => {
      setFetchAgainToggle(prev => !prev);
    });
  };

  const obrisiFotografije = e => {
    e.preventDefault();
    axios({
      url: `/api/v1/orders/${order.id}`,
      method: 'DELETE',
      withCredentials: true
    }).then(response => {
      setFetchAgainToggle(prev => !prev);
    });
  };

  const pricePerPhoto =
    order.ukupnoFotografija > 0
      ? order.racun / order.ukupnoFotografija
      : null;
  const delivery = getDeliveryPresentation(order.preuzimanje);

  return (
    <div className="col s12 order-card-column">
      <article className={`order-card${izdato ? ' order-card--issued' : ''}`}>
        <div className="order-card__main">
          <div className="order-card__content">
            <header className="order-card__header">
              <div className="order-card__identity">
                <h2 className="order-card__customer">
                  {order.ime} {order.prezime}
                </h2>
                <span className="order-card__date">
                  {new Date(order.createdAt).toLocaleString('en-GB')}
                </span>
              </div>
              <span
                className={`order-card__status${
                  izdato ? ' order-card__status--issued' : ''
                }`}
              >
                {izdato ? 'Izdato' : 'U obradi'}
              </span>
            </header>

            <div className="order-card__details">
              <div className="order-card__detail order-card__detail--delivery">
                <span className="order-card__label">Preuzimanje</span>
                <span
                  className={`order-card__delivery ${delivery.className}`}
                  aria-label={`Način preuzimanja: ${delivery.label}`}
                >
                  {delivery.icon && (
                    <i className="material-icons" aria-hidden="true">
                      {delivery.icon}
                    </i>
                  )}
                  {delivery.label}
                </span>
              </div>
              <div className="order-card__detail">
                <span className="order-card__label">Format</span>
                <strong>{order.format}</strong>
              </div>
              <div className="order-card__detail">
                <span className="order-card__label">Fajlovi / fotografije</span>
                <strong>
                  {order.photos.length} fajlova / {order.ukupnoFotografija}{' '}
                  fotografija
                </strong>
              </div>
              <div className="order-card__detail">
                <span className="order-card__label">Cena po fotografiji</span>
                <strong>
                  {pricePerPhoto === null ? '—' : `${pricePerPhoto} rsd`}
                </strong>
              </div>
              <div className="order-card__detail order-card__detail--contact">
                <span className="order-card__label">Kontakt</span>
                <strong>
                  <a href={`tel:${order.telefon}`}>{order.telefon}</a>
                  <a href={`mailto:${order.email}`}>{order.email}</a>
                </strong>
              </div>
              {order.adresa && (
                <div className="order-card__detail order-card__detail--address">
                  <span className="order-card__label">Adresa</span>
                  <strong>{order.adresa}</strong>
                </div>
              )}
              <div className="order-card__total">
                <span>
                  Za naplatu
                  {order.adresa && (
                    <small>Poštarina se obračunava posebno</small>
                  )}
                </span>
                <strong>{order.racun} rsd</strong>
              </div>
            </div>
          </div>

          {!order.obrisano && photos.length > 0 && (
            <div
              className="order-card__gallery"
              aria-label="Pregled fotografija"
            >
              <SmartGallery
                rootStyle={{ margin: '0 auto' }}
                images={photos}
                width={160}
                height={160}
              />
            </div>
          )}
        </div>

        <footer className="order-card__actions">
          <label className="order-card__issued-control">
            <input
              type="checkbox"
              checked={izdato}
              onChange={() => setIzdato(!izdato)}
            />
            <span>Označi kao izdato</span>
          </label>

          <div className="order-card__action-buttons">
            {!order.poslatEmail ? (
              <button
                type="button"
                className="order-card__button order-card__button--secondary"
                onClick={posaljiEmail}
              >
                <i className="material-icons" aria-hidden="true">
                  mail_outline
                </i>
                Pošalji obaveštenje
              </button>
            ) : (
              <span className="order-card__email-sent">
                <i className="material-icons" aria-hidden="true">
                  check_circle
                </i>
                Email poslat
              </span>
            )}

            {!order.obrisano ? (
              <a
                className="order-card__button order-card__button--primary"
                href={`/api/v1/orders/download/${order.id}`}
              >
                <i className="material-icons" aria-hidden="true">
                  download
                </i>
                Preuzmi ZIP
              </a>
            ) : (
              <span className="order-card__deleted">
                Fotografije su obrisane
              </span>
            )}

            {!order.obrisano && izdato && (
              <button
                type="button"
                data-target={`modal${order._id}`}
                className="order-card__button order-card__button--danger modal-trigger"
              >
                <i className="material-icons" aria-hidden="true">
                  delete_outline
                </i>
                Obriši fotografije
              </button>
            )}
          </div>
        </footer>

        <div
          id={`modal${order._id}`}
          className="modal order-card__delete-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-order-title-${order._id}`}
        >
          <div className="modal-content">
            <h5 id={`delete-order-title-${order._id}`}>Obriši fotografije?</h5>
            <p>Fotografije iz ove porudžbine biće trajno obrisane.</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-close waves-effect btn-flat"
            >
              Odustani
            </button>
            <button
              type="button"
              onClick={obrisiFotografije}
              className="modal-close waves-effect btn-flat pink darken-2 white-text"
            >
              Obriši
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
