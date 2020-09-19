import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';

export default function Order({ order, setFetchAgainToggle }) {
  const [izdato, setIzdato] = useState(order.izdato);
  const [brojKesice, setBrojKesice] = useState('');

  useEffect(() => {
    axios({
      url: `http://localhost:5000/api/v1/orders/${order.id}`,
      method: 'PATCH',
      data: {
        izdato: izdato
      },
      withCredentials: true
    }).then(response => {});
  }, [izdato, order.id]);

  const downloadFilesOld = e => {
    e.preventDefault();
    axios({
      url: `http://localhost:5000/download/${order.id}`,
      method: 'GET',
      responseType: 'blob'
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${order.id}.zip`);
      document.body.appendChild(link);
      link.click();
    });
  };

  const downloadFiles = e => {
    e.preventDefault();
    axios({
      url: `http://localhost:5000/api/v1/orders/download/${order.id}`,
      method: 'GET',
      withCredentials: true
    }).then(response => {
      const link = document.createElement('a');
      link.href = response.data.data.downloadLink;
      link.setAttribute('download', `${order.id}.zip`);
      document.body.appendChild(link);
      link.click();
    });
  };

  const posaljiEmail = e => {
    axios({
      url: `http://localhost:5000/api/v1/orders/${order.id}/sendEmail`,
      method: 'GET',
      withCredentials: true
    }).then(response => {
      setFetchAgainToggle(prev => !prev);
    });
  };

  const postaviBrojKesice = e => {
    e.preventDefault();
    if (brojKesice.length < 4) return;
    axios({
      url: `http://localhost:5000/api/v1/orders/${order.id}`,
      method: 'PATCH',
      data: {
        brojKesice: brojKesice
      },
      withCredentials: true
    }).then(response => {
      setFetchAgainToggle(prev => !prev);
    });
  };

  const obrisiFotografije = e => {
    e.preventDefault();
    axios({
      url: `http://localhost:5000/api/v1/orders/${order.id}`,
      method: 'DELETE',
      withCredentials: true
    }).then(response => {
      setFetchAgainToggle(prev => !prev);
    });
  };

  return (
    <div className="col s12">
      <div className="card grey lighten-3">
        <div className="card-content" style={{ paddingBottom: 0 }}>
          <span className="card-title">
            {order.ime + ' ' + order.prezime} - {order.preuzimanje}
          </span>
          <div className="row">
            <div className="col s7">
              {new Date(order.createdAt).toLocaleString('en-GB')}
              <br />
              <br />
              format: {order.format}
              <br />
              broj fotografija: {order.ukupnoFotografija}
              <br />
              <br />
              <i className="material-icons" style={{ verticalAlign: '-6px' }}>
                contact_phone
              </i>
              {' ' + order.telefon}
              <br />
              <i className="material-icons" style={{ verticalAlign: '-6px' }}>
                email
              </i>
              {' ' + order.email}
              <br />
              {order.adresa && (
                <Fragment>
                  <i
                    className="material-icons"
                    style={{ verticalAlign: '-6px' }}
                  >
                    home
                  </i>
                  <span>{' ' + order.adresa}</span>
                </Fragment>
              )}
              <br />
              za naplatu: {order.racun} rsd {order.adresa && '+poštarina'}
            </div>
            <div className="col s5">
              {order.brojKesice ? (
                <h6 style={{ color: 'grey' }}>
                  Broj kesice: {order.brojKesice}
                </h6>
              ) : (
                <form onSubmit={postaviBrojKesice}>
                  <div className="input-field " style={{ marginBottom: 0 }}>
                    <input
                      id={`broj${order._id}`}
                      type="text"
                      value={order.brojKesice}
                      maxLength="4"
                      onChange={e => setBrojKesice(e.target.value)}
                    />
                    <label htmlFor={`broj${order._id}`}>Broj kesice</label>
                  </div>

                  {brojKesice.length === 4 && (
                    <button
                      className="waves-effect waves-light btn-small"
                      action="submit"
                      name="action"
                    >
                      dodeli broj
                    </button>
                  )}
                </form>
              )}
              <br />
              {!order.poslatEmail ? (
                order.brojKesice && (
                  <button
                    className="waves-effect waves-light btn-small"
                    onClick={e => posaljiEmail(e)}
                  >
                    pošalji email
                  </button>
                )
              ) : (
                <p style={{ color: 'grey' }}>Email obaveštenje je poslato</p>
              )}
              <br />
              <br />
              <p>
                <label>
                  <input
                    type="checkbox"
                    checked={izdato}
                    onChange={e => setIzdato(!izdato)}
                  />
                  <span>Izdato</span>
                </label>
              </p>
            </div>
          </div>
        </div>
        <div className="card-action">
          {!order.obrisano && (
            <button
              className="btn-flat indigo-text"
              onClick={e => downloadFiles(e)}
            >
              Download
            </button>
          )}
          {order.obrisano && (
            <i className="grey-text">fotografije su obrisane</i>
          )}{' '}
          {!order.obrisano && izdato && (
            <button
              data-target={`modal${order._id}`}
              className="btn-flat modal-trigger pink-text"
            >
              Obrisi fotografije
            </button>
          )}
          <div id={`modal${order._id}`} className="modal">
            <div className="modal-content">
              <h5>Potvrdi akciju</h5>
              <div className="row">
                <div className="col s6">
                  <h6> Podaci ce biti trajno obrisani</h6>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <a className="modal-close waves-effect btn-flat black-text">
                Odustani
              </a>
              <button
                onClick={e => obrisiFotografije(e)}
                className="modal-close waves-effect  btn-flat pink darken-2 white-text"
              >
                Obrisi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
