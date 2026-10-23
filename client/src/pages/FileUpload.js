import React, { Fragment, useState, useEffect } from 'react';

import successImage from '../saved_success.png';
import banner from '../photoprintbanner.png';

import Spinner from '../layout/Spinner';

import GallerySelector from '../components/GallerySelector';
import UploadPhotosStep from '../components/file-upload/UploadPhotosStep';
import CustomerDetailsStep from '../components/file-upload/CustomerDetailsStep';
import UploadNavigation from '../components/file-upload/UploadNavigation';
import OrderConfirmationModal from '../components/file-upload/OrderConfirmationModal';
import useCatalog from '../components/file-upload/useCatalog';
import useOrderUpload from '../components/file-upload/useOrderUpload';
import {
  calculateOrderQuote,
  isOrderDetailsValid
} from '../components/file-upload/orderCalculations';

import M from 'materialize-css';

export const FileUpload = () => {
  const [step, setStep] = useState(1);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ count: 0, total: 0 });

  const [userInfo, setUserInfo] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    adresa: '',
    format: '',
    preuzimanje: 'radnja centar'
  });

  const {
    catalogFormats,
    catalogLoading,
    catalogError,
    retryCatalog
  } = useCatalog(setUserInfo);

  const selectedFormat = catalogFormats.find(
    format => format.name === userInfo.format
  );
  const {
    photoCount,
    pricePerPhoto,
    total,
    hasValidQuote
  } = calculateOrderQuote(files, selectedFormat);
  const userFieldsValid = isOrderDetailsValid({
    userInfo,
    files,
    selectedFormat,
    hasValidQuote
  });
  const {
    fileUploadPercentage,
    resultMessage,
    uploadFinishedSuccessfully,
    uploading,
    uploadProgress,
    submitOrder
  } = useOrderUpload({
    files,
    userInfo,
    canSubmit:
      !catalogLoading &&
      !catalogError &&
      Boolean(selectedFormat) &&
      hasValidQuote
  });

  useEffect(() => {
    M.AutoInit();
  });

  //Might leak without this idk
  // const [filePreviews, setFilePreviews] = useState([]);
  // useEffect(
  //   () => () => {
  //     // Make sure to revoke the data uris to avoid memory leaks
  //     filePreviews.forEach(file => URL.revokeObjectURL(file.preview));
  //   },
  //   [filePreviews]
  // );

  const nextStep = e => {
    e.preventDefault();
    if (catalogLoading || catalogError || !selectedFormat || !hasValidQuote) {
      return;
    }
    setStep(step => step + 1);
  };
  const prevStep = e => {
    e.preventDefault();
    if (step !== 1) setStep(step => step - 1);
  };

  return (
    <Fragment>
      <div className="row center-align" style={{ marginTop: 20 }}>
        {' '}
        <div className="col s12">
          {' '}
          <img
            className="responsive-img"
            src={banner}
            width="600px"
            height="auto"
          />
        </div>
      </div>

      <div className="container" style={{ fontFamily: 'Mulish' }}>
        <form onSubmit={submitOrder}>
          {step === 1 && (
            <UploadPhotosStep
              files={files}
              setFiles={setFiles}
              loading={loading}
              setLoading={setLoading}
              loadProgress={loadProgress}
              setLoadProgress={setLoadProgress}
              uploading={uploading}
              uploadFinishedSuccessfully={uploadFinishedSuccessfully}
              catalogFormats={catalogFormats}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              onRetryCatalog={retryCatalog}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              selectedFormat={selectedFormat}
            />
          )}

          {step === 2 && (
            <Fragment>
              <GallerySelector
                files={files}
                setFiles={setFiles}
              ></GallerySelector>
            </Fragment>
          )}

          {step === 3 && (
            <CustomerDetailsStep
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              uploadFinishedSuccessfully={uploadFinishedSuccessfully}
              uploading={uploading}
              fileUploadPercentage={fileUploadPercentage}
              files={files}
            />
          )}

          <UploadNavigation
            step={step}
            filesSelected={Boolean(files[0])}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
            selectedFormat={selectedFormat}
            hasValidQuote={hasValidQuote}
            userFieldsValid={userFieldsValid}
            uploading={uploading}
            uploadFinishedSuccessfully={uploadFinishedSuccessfully}
            photoCount={photoCount}
            pricePerPhoto={pricePerPhoto}
            total={total}
            courierDelivery={userInfo.preuzimanje === 'kurirska sluzba'}
            onPrevious={prevStep}
            onNext={nextStep}
          />

          {uploading && (
            <Fragment>
              <div className="col s12 center-align">
                <p style={{ color: 'grey', marginBottom: 0 }}>
                  {uploadProgress}%
                </p>
              </div>
              <div className="progress" style={{ marginBottom: 10 }}>
                <div
                  className="determinate"
                  style={{
                    width: `${uploadProgress}%`
                  }}
                ></div>
              </div>
              {/* <div className="col s12 center-align">
                <p style={{ color: 'grey' }}>{uploadCount}</p>
              </div> */}
            </Fragment>
          )}
          {uploading && (
            <div className="col s12 center-align" style={{ color: 'grey' }}>
              {' '}
              <i>Molimo vas sačekajte otpremanje fotografija</i>
            </div>
          )}

          {resultMessage.status === 'success' && (
            <div className="row">
              <div className="col s6 m4 l3 offset-m2 offset-l3">
                {' '}
                <img
                  src={successImage}
                  className="responsive-img"
                  alt="Success image"
                  height="230"
                ></img>
              </div>
              <div className="col s6 m4 l4 indigo-text" style={{ marginTop: 20 }}>
                <p className="left"><i>{resultMessage.message}</i></p>
              </div>
            </div>
          )}

          {resultMessage.status === 'fail' && (
            <div className="row">
              <div className="col s8 offset-s2 center-align pink-text">
                <i style={{ marginTop: 30 }}>{resultMessage.message}</i>
              </div>
            </div>
          )}

          <OrderConfirmationModal
            userInfo={userInfo}
            photoCount={photoCount}
            pricePerPhoto={pricePerPhoto}
            total={total}
          />
        </form>

        {uploading && (
          <div className=" col s12 center-align">
            <Spinner />
          </div>
        )}
      </div>

      <br></br>
      <br></br>
      <br></br>
    </Fragment>
  );
};

export default FileUpload;
