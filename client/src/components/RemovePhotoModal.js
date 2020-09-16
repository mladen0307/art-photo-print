import React from 'react';

const RemovePhotoModal = ({ file, index, removePhoto }) => {
  return (
    <div id={`removePhotoModal${index}`} className="modal">
      <div className="modal-content" style={{ paddingBottom: 0 }}>
        <h5>Ukloni fotografiju</h5>
        <div className="row" style={{ marginTop: 20 }}>
          <div className="col s3">
            <img src={file.preview} className="responsive-img" />
          </div>
          <div className="col s4">
            <h6> Da li želite da uklonite fotografiju iz porudžbenice</h6>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <a className="modal-close waves-effect btn-flat black-text">Odustani</a>
        <button
          onClick={e => removePhoto(e, index)}
          className="modal-close waves-effect  btn-flat pink darken-2 white-text"
        >
          Ukloni
        </button>
      </div>
    </div>
  );
};

export default RemovePhotoModal;
