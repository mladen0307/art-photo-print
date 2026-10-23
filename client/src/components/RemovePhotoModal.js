import React from 'react';
import './file-upload/OrderModals.css';

const RemovePhotoModal = ({ file, index, removePhoto }) => {
  return (
    <div
      id={`removePhotoModal${index}`}
      className="modal remove-photo-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`remove-photo-title-${index}`}
    >
      <div className="modal-content remove-photo-modal__content">
        <div className="order-modal__heading">
          <span
            className="order-modal__icon order-modal__icon--remove"
            aria-hidden="true"
          >
            <i className="material-icons">delete_outline</i>
          </span>
          <div>
            <p className="order-modal__eyebrow">Izmena korpe</p>
            <h5 id={`remove-photo-title-${index}`}>Ukloniti fotografiju?</h5>
            <p className="order-modal__intro">
              Fotografija će biti uklonjena iz vaše porudžbine.
            </p>
          </div>
        </div>
        <div className="remove-photo-modal__preview">
          <img src={file.preview} alt={file.name} />
          <span className="remove-photo-modal__filename">{file.name}</span>
        </div>
      </div>
      <div className="modal-footer order-modal__footer">
        <button
          type="button"
          className="modal-close order-modal__button order-modal__button--secondary"
        >
          Zadrži fotografiju
        </button>
        <button
          type="button"
          onClick={e => removePhoto(e, index)}
          className="modal-close order-modal__button order-modal__button--danger"
        >
          Ukloni fotografiju
        </button>
      </div>
    </div>
  );
};

export default RemovePhotoModal;
