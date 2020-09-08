import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';

import UserInfoFields from './UserInfoFields';
import splashImage from '../image_upload.png';
import paralaxImage from '../paralax-image.jpg';

import M from 'materialize-css';
import SmartGallery from 'react-smart-gallery';
import Spinner from './Spinner';
import Dropzone from './Dropzone';

export const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [resultMessage, setResultMessage] = useState('');
  const [uploadFinished, setUploadFinished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userFieldsValid, setUserFieldsValid] = useState(false);
  const [userInfo, setUserInfo] = useState({
    ime: '',
    prezime: '',
    telefon: '',
    adresa: '',
    format: '13x18',
    preuzimanje: 'radnja centar'
  });

  const [filePreviews, setFilePreviews] = useState([]);
  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      filePreviews.forEach(file => URL.revokeObjectURL(file.preview));
    },
    [filePreviews]
  );

  useEffect(() => {
    M.AutoInit();
  });

  useEffect(() => {
    if (
      userInfo.ime !== '' &&
      userInfo.prezime !== '' &&
      userInfo.telefon !== '' &&
      files.length !== 0
    )
      setUserFieldsValid(true);
    else setUserFieldsValid(false);
  }, [userInfo, files]);

  const OnSubmit = async e => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    Object.values(files).forEach((item, index) => {
      formData.append(`file${index}`, item);
    });

    formData.set('ime', userInfo.ime);
    formData.set('prezime', userInfo.prezime);
    formData.set('telefon', userInfo.telefon);
    formData.set('adresa', userInfo.adresa);
    formData.set('format', userInfo.format);
    formData.set('preuzimanje', userInfo.preuzimanje);

    try {
      setUploadFinished(true);
      const res = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );
        }
      });

      setUploadedFiles(res.data.data.files);
      M.toast({ html: 'Fotografije su sačuvane' });
      setResultMessage('Vaša porudžbina je sačuvana');
      setUploading(false);
    } catch (err) {
      setUploadFinished(false);
      M.toast({ html: 'Došlo je do greške' });
      setResultMessage('Došlo je do greške, pokušajte ponovo');
      setUploading(false);
      console.log(err);
    }
  };

  return (
    <Fragment>
      <div className="container" style={{ fontFamily: 'Mulish' }}>
        <br />
        <br />
        <div className="row center-align">
          <h6 style={{ color: '#707070', fontFamily: 'Mulish' }}>
            Pošaljite fotografije i preuzmite ih u jednoj od naših radnji ili na
            kućnoj adresi
          </h6>
        </div>

        <form onSubmit={OnSubmit}>
          <div className="row">
            <div className="col s8 offset-s2 center-align">
              {!uploadFinished && (
                <Dropzone
                  setFilePreviews={setFilePreviews}
                  setFiles={setFiles}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col s6">
              <UserInfoFields
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                uploadFinished={uploadFinished}
              />
            </div>
            <div className="col s6">
              {files[0] ? (
                <div className="center-align">
                  <i style={{ color: 'grey' }}>
                    ukupno fotografija: {files.length}
                  </i>
                  <SmartGallery images={files.map(file => file.preview)} />
                </div>
              ) : (
                <img
                  src={splashImage}
                  className="responsive-img"
                  alt="Splash image"
                ></img>
              )}
            </div>
          </div>
          <div className="row center-align">
            <button
              className={`btn-large ${
                uploadFinished || !userFieldsValid ? 'disabled' : ''
              }`}
              action="submit"
              name="action"
            >
              Submit
              <i className="material-icons right">send</i>
            </button>
          </div>
        </form>

        <div className="row">
          <div className="col s12">
            {uploadPercentage > 0 ? (
              <div className="progress">
                <div
                  className="determinate"
                  style={{ width: `${uploadPercentage}%` }}
                ></div>
              </div>
            ) : null}
          </div>

          {uploading && (
            <div className=" col s12 center-align">
              <Spinner />
            </div>
          )}

          {resultMessage && (
            <div className="col s12 center-align" style={{ color: 'grey' }}>
              {' '}
              <i>{resultMessage}</i>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default FileUpload;
