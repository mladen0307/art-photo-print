import React from 'react';

import OrderSummary from './OrderSummary';
import './UploadNavigation.css';

const UploadNavigation = ({
  step,
  filesSelected,
  catalogLoading,
  catalogError,
  selectedFormat,
  hasValidQuote,
  userFieldsValid,
  uploading,
  uploadFinishedSuccessfully,
  photoCount,
  pricePerPhoto,
  total,
  courierDelivery,
  onPrevious,
  onNext
}) => {
  const nextDisabled =
    !filesSelected ||
    catalogLoading ||
    !!catalogError ||
    !selectedFormat ||
    !hasValidQuote;

  return (
    <div className="row upload-navigation">
      <div className="upload-navigation__summary">
        {filesSelected && (
          <OrderSummary
            format={selectedFormat && selectedFormat.name}
            photoCount={photoCount}
            pricePerPhoto={pricePerPhoto}
            total={total}
            courierDelivery={courierDelivery}
          />
        )}
      </div>
      <div className="upload-navigation__actions">
        {step !== 1 && !uploadFinishedSuccessfully && !uploading && (
          <button
            type="button"
            className="upload-navigation__button upload-navigation__button--back"
            onClick={onPrevious}
          >
            <i className="material-icons" aria-hidden="true">
              navigate_before
            </i>
            Nazad
          </button>
        )}
        {step !== 3 && (
          <button
            type="button"
            className="upload-navigation__button upload-navigation__button--next"
            disabled={nextDisabled}
            onClick={onNext}
          >
            Dalje
            <i className="material-icons" aria-hidden="true">
              navigate_next
            </i>
          </button>
        )}
        {step === 3 && !uploading && !uploadFinishedSuccessfully && (
          <button
            className="upload-navigation__button upload-navigation__button--next modal-trigger"
            data-target="modal1"
            disabled={!userFieldsValid}
          >
            Pošalji
            <i className="material-icons" aria-hidden="true">
              send
            </i>
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadNavigation;
