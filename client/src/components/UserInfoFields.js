import React, { Fragment, useEffect } from 'react';
import M from 'materialize-css';
import './UserInfoFields.css';

export default function UserInfoFields({
  userInfo,
  setUserInfo,
  uploadFinished,
  uploading
}) {
  useEffect(() => {
    M.updateTextFields();
  });

  const isHomeDelivery = userInfo.preuzimanje === 'kurirska sluzba';
  const updateDelivery = value =>
    setUserInfo({ ...userInfo, preuzimanje: value });

  return (
    <Fragment>
      <div className="input-field col s5 offset-s1">
        <input
          disabled={uploadFinished || uploading}
          id="ime"
          type="text"
          value={userInfo.ime}
          onChange={e => setUserInfo({ ...userInfo, ime: e.target.value })}
        />
        <label htmlFor="ime">Ime</label>
      </div>
      <div className="input-field col s5">
        <input
          disabled={uploadFinished || uploading}
          id="prezime"
          type="text"
          value={userInfo.prezime}
          onChange={e => setUserInfo({ ...userInfo, prezime: e.target.value })}
        />
        <label htmlFor="prezime">Prezime</label>
      </div>

      <div className="input-field col s10 offset-s1">
        <input
          disabled={uploadFinished || uploading}
          id="email"
          type="email"
          className="validate"
          value={userInfo.email}
          onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
        />
        <label htmlFor="email">Email</label>
        <span
          className="helper-text"
          data-error="Unesite validnu email adresu"
          data-success=""
        ></span>
      </div>

      <div className="input-field col s10 offset-s1">
        <i className="material-icons prefix">phone</i>
        <input
          disabled={uploadFinished || uploading}
          id="telefon"
          type="text"
          value={userInfo.telefon}
          onChange={e => setUserInfo({ ...userInfo, telefon: e.target.value })}
        />
        <label htmlFor="telefon">Kontakt telefon</label>
      </div>
      {!uploadFinished && !uploading && (
        <div className="delivery-choice col s10 offset-s1">
          <p className="delivery-choice__heading">Kako želite da preuzmete porudžbinu?</p>
          <div className="delivery-choice__options">
            <button
              type="button"
              className={`delivery-choice__button ${
                !isHomeDelivery ? 'delivery-choice__button--selected' : ''
              }`}
              aria-pressed={!isHomeDelivery}
              onClick={() =>
                updateDelivery(
                  isHomeDelivery ? 'radnja centar' : userInfo.preuzimanje
                )
              }
            >
              Preuzimanje u radnji
            </button>
            <button
              type="button"
              className={`delivery-choice__button ${
                isHomeDelivery ? 'delivery-choice__button--selected' : ''
              }`}
              aria-pressed={isHomeDelivery}
              onClick={() => updateDelivery('kurirska sluzba')}
            >
              Dostava na adresu
            </button>
          </div>
          {!isHomeDelivery && (
            <fieldset className="delivery-choice__stores">
              <legend>Izaberite radnju</legend>
              <label
                className={`delivery-choice__store-option ${
                  userInfo.preuzimanje === 'radnja centar'
                    ? 'delivery-choice__store--selected'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="pickup-location"
                  value="radnja centar"
                  checked={userInfo.preuzimanje === 'radnja centar'}
                  onChange={() => updateDelivery('radnja centar')}
                />
                <span>
                  <strong>Radnja u centru</strong>
                  <small> Karadžićeva 12, Niš</small>
                </span>
              </label>
              <label
                className={`delivery-choice__store-option ${
                  userInfo.preuzimanje === 'radnja trosarina'
                    ? 'delivery-choice__store--selected'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="pickup-location"
                  value="radnja trosarina"
                  checked={userInfo.preuzimanje === 'radnja trosarina'}
                  onChange={() => updateDelivery('radnja trosarina')}
                />
                <span>
                  <strong>Radnja na Trošarini</strong>
                  <small> Bul. Sv. cara Konstantina bb lokal 10, Niš
                  </small>
                </span>
              </label>
            </fieldset>
          )}
        </div>
      )}
      {(uploadFinished || uploading) && (
        <div className="chip" style={{ marginLeft: 55 }}>
          <i className="material-icons" style={{ verticalAlign: '-6px' }}>
            business
          </i>
          {userInfo.preuzimanje}
        </div>
      )}

      <div
        className={`input-field col s10 offset-s1 scale-transition scale-out ${
          userInfo.preuzimanje === 'kurirska sluzba' ? 'scale-in ' : 'hide'
        }`}
      >
        <i className="material-icons prefix">home</i>
        <input
          disabled={uploadFinished || uploading}
          id="adresa"
          type="text"
          className="validate"
          value={userInfo.adresa}
          onChange={e => setUserInfo({ ...userInfo, adresa: e.target.value })}
        />
        <label htmlFor="adresa">Vaša adresa</label>
      </div>

      {(uploadFinished || uploading) && (
        <div className="chip">
          <i className="material-icons" style={{ verticalAlign: '-6px' }}>
            insert_photo
          </i>
          {userInfo.format}
        </div>
      )}
    </Fragment>
  );
}
