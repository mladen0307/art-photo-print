import React, { Fragment, useEffect } from 'react';
import M from 'materialize-css';
export default function UserInfoFields({
  userInfo,
  setUserInfo,
  uploadFinished,
  uploading
}) {
  useEffect(() => {
    M.updateTextFields();
  });

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
        <div className="input-field col s10 offset-s1">
          <select
            defaultValue={userInfo.preuzimanje}
            onChange={e =>
              setUserInfo({ ...userInfo, preuzimanje: e.target.value })
            }
          >
            <option value="radnja centar">preuzimanje u radnji u centru</option>
            <option value="radnja trosarina">
              preuzimanje u radnjni na trošarini
            </option>
            <option value="kurirska sluzba">dostava na adresu</option>
          </select>
          <label>Izaberite način dostave</label>
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
