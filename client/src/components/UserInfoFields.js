import React, { Fragment } from 'react';
import cene from './../helpers/cene';

export default function UserInfoFields({
  userInfo,
  setUserInfo,
  uploadFinished,
  uploading
}) {
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
            defaultValue="radnja centar"
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
        <div className="chip">
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

      {!uploading && !uploadFinished && (
        <div className="row">
          <div className="input-field col s5 offset-s1">
            <select
              defaultValue="13x18"
              onChange={e =>
                setUserInfo({ ...userInfo, format: e.target.value })
              }
            >
              <option value="9x13">9x13</option>
              <option value="10x13,5">10x13,5</option>
              <option value="10x15">10x15</option>
              <option value="11x15">11x15</option>
              <option value="13x18">13x18</option>
              <option value="15x20">15x20</option>
              <option value="20x30">20x30</option>
              <option value="24x30">24x30</option>
              <option value="30x40">30x40</option>
              <option value="30x45">30x45</option>
            </select>
            <label>Format</label>
          </div>
          <div className="input-field col s5">
            <button
              data-target="modal2"
              className=" btn-flat indigo-text modal-trigger"
            >
              Cene formata
            </button>
          </div>
        </div>
      )}

      <div id="modal2" className="modal modal-fixed-footer">
        <div className="modal-content">
          <h6>Cene formata</h6>
          <table className="centered">
            <thead>
              <tr>
                <th>veličina formata</th>
                <th>cena u din.</th>
                <th> >100 fotografija</th>
                <th> >200 fotografija</th>
                <th> >400 fotografija</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(cene).map(format => (
                <tr key={format}>
                  <td>{format}</td>
                  <td>{cene[format][0]}</td>
                  <td>{cene[format][1]}</td>
                  <td>{cene[format][2]}</td>
                  <td>{cene[format][3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <a className="modal-close waves-effect  btn-flat">Ok</a>
        </div>
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
