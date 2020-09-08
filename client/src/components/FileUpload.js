import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';

import UserInfoFields from './UserInfoFields';
import splashImage from '../image_upload.png';
import paralaxImage from '../paralax-image.jpg';

import SmartGallery from 'react-smart-gallery';
import Spinner from './Spinner';
import Dropzone from './Dropzone';

import Gallery from 'react-photo-gallery';

import M from 'materialize-css';

import cene from './../helpers/cene';

export const FileUpload = () => {
  const [step, setStep] = useState(1);

  const [files, setFiles] = useState([]);
  const [fileUploadPercentage, setFileUploadPercentage] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [resultMessage, setResultMessage] = useState('');
  const [uploadFinished, setUploadFinished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userFieldsValid, setUserFieldsValid] = useState(false);
  const [userInfo, setUserInfo] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    adresa: '',
    format: '13x18',
    preuzimanje: 'radnja centar'
  });

  const [racun, setRacun] = useState({ tarifa: '', ukupno: '' });

  useEffect(() => {
    if (files && userInfo.format) {
      let category = 0;
      if (files.length > 100) category = 1;
      if (files.length > 200) category = 2;
      if (files.length > 400) category = 3;

      setRacun({
        tarifa: cene[userInfo.format][category],
        ukupno: cene[userInfo.format][category] * files.length
      });
    }
  }, [files, userInfo.format]);

  useEffect(() => {
    M.AutoInit();
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
    let newArray = [];
    files.forEach(file => newArray.push({ name: file.name, value: 0 }));
    setFileUploadPercentage(newArray);
  }, [files]);

  useEffect(() => {
    if (
      userInfo.ime !== '' &&
      userInfo.prezime !== '' &&
      userInfo.telefon !== '' &&
      files.length !== 0 &&
      /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
        userInfo.email
      )
    )
      setUserFieldsValid(true);
    else setUserFieldsValid(false);
  }, [userInfo, files]);

  const OnSubmit = async e => {
    e.preventDefault();
    setUploading(true);
    setResultMessage(null);
    const filesArr = Object.values(files);

    let resProm = [];

    filesArr.forEach((item, index) => {
      const formData = new FormData();
      formData.append('file', item);
      formData.append(
        'folder',
        `orders/${userInfo.ime}_${userInfo.prezime}_${userInfo.format}_${userInfo.telefon}_${userInfo.preuzimanje}`
      );
      formData.append('upload_preset', 'fotoart');

      resProm[index] = axios.post(
        'https://api.cloudinary.com/v1_1/mladen0307/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: progressEvent => {
            const newFileUploadPercentage = [...fileUploadPercentage];
            newFileUploadPercentage.forEach((element, index) => {
              if (element.name === item.name) {
                element.value = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
              }
            });

            setFileUploadPercentage(newFileUploadPercentage);
          },
          withCredentials: false
        }
      );
    });

    let res = [];

    (async function loop() {
      for (let i = 0; i < resProm.length; i++) {
        try {
          res[i] = await resProm[i];

          const newImage = {
            src: res[i].data.secure_url,
            width: res[i].data.width,
            height: res[i].data.height
          };
          setUploadedFiles(uploadedFiles => [...uploadedFiles, newImage]);
        } catch (err) {
          setUploadFinished(false);
          M.toast({ html: 'Došlo je do greške' });
          setResultMessage('Došlo je do greške, pokušajte ponovo');
          setUploading(false);
          console.log(err);
          return;
        }
      }
      try {
        let photos = res.map(res => ({
          secure_url: res.data.secure_url,
          public_id: res.data.public_id
        }));

        const formData = new FormData();
        formData.set('ime', userInfo.ime);
        formData.set('prezime', userInfo.prezime);
        formData.set('telefon', userInfo.telefon);
        formData.set('email', userInfo.email);
        formData.set('adresa', userInfo.adresa);
        formData.set('format', userInfo.format);
        formData.set('preuzimanje', userInfo.preuzimanje);
        formData.set('photos', JSON.stringify(photos));

        await axios.post('/api/v1/orders', formData);

        M.toast({ html: 'Fotografije su sačuvane' });
        setResultMessage('Vaša porudžbenica je uspešno sačuvana');
        setUploading(false);
        setUploadFinished(true);
      } catch (err) {
        setUploadFinished(false);
        M.toast({ html: 'Došlo je do greške' });
        setResultMessage('Došlo je do greške, pokušajte ponovo');
        setUploading(false);
        console.log(err);
      }
    })();
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
            <div className="col s6 offset-s3 center-align">
              {!uploading && !uploadFinished && (
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
                uploading={uploading}
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

          {files[0] && (
            <div className="row">
              <div className="col s4 offset-s5" style={{ color: 'grey' }}>
                {' '}
                <blockquote>
                  <p style={{ marginBottom: 0, marginTop: 0 }}>
                    Broj fotografija: {files.length}
                  </p>
                  <p style={{ marginBottom: 0, marginTop: 0 }}>
                    Cena po fotografiji: {racun.tarifa} rsd
                  </p>
                  <p style={{ marginBottom: 0, marginTop: 0 }}>
                    Ukupno: {racun.ukupno} rsd{' '}
                    {userInfo.preuzimanje === 'kurirska sluzba' && (
                      <i>+ poštarina</i>
                    )}
                  </p>
                </blockquote>
              </div>
            </div>
          )}
          {uploading && (
            <div className="progress">
              <div className="indeterminate"></div>
            </div>
          )}
          {uploading && (
            <div className="col s12 center-align" style={{ color: 'grey' }}>
              {' '}
              <i>Molimo vas sačekajte otpremanje fotografija</i>
            </div>
          )}

          {resultMessage && (
            <div className="col s12 center-align indigo-text">
              {' '}
              <i className="material-icons" style={{ verticalAlign: '-6px' }}>
                check
              </i>
              <i>{resultMessage}</i>
            </div>
          )}

          {!uploading && !uploadFinished && (
            <div className="row center-align">
              <button
                className={`btn-large modal-trigger ${
                  !userFieldsValid ? 'disabled' : ''
                }`}
                data-target="modal1"
              >
                Pošalji
                <i className="material-icons right">send</i>
              </button>
            </div>
          )}

          {files[0] && (
            <div className="row">
              <div
                className="col s12"
                style={{
                  paddingLeft: 80,
                  paddingRight: 80,
                  overflowY: 'auto',
                  height: 230
                }}
              >
                <ul className="collection">
                  {fileUploadPercentage.map(file => (
                    <li className="collection-item" key={file.name}>
                      {file.name}{' '}
                      <div className="progress">
                        <div
                          className="determinate"
                          style={{ width: `${file.value}%` }}
                        ></div>
                      </div>{' '}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div id="modal1" className="modal">
            <div className="modal-content">
              <h5>Podaci o porudžbenici</h5>
              <div className="row">
                <div className="col s6">
                  {' '}
                  <p>Ime: {userInfo.ime}</p>
                  <p>Prezime: {userInfo.prezime}</p>
                  <p>Način dostave: {userInfo.preuzimanje}</p>
                  {userInfo.preuzimanje === 'kurirska sluzba' && (
                    <p>Adresa: {userInfo.adresa}</p>
                  )}
                  <p>Kontakt telefon: {userInfo.telefon}</p>
                  <p>Email: {userInfo.email}</p>
                </div>
                <div className="col s6">
                  <blockquote>
                    <p>Format: {userInfo.format}</p>
                    <p style={{ marginBottom: 0, marginTop: 0 }}>
                      Broj fotografija: {files.length}
                    </p>
                    <p style={{ marginBottom: 0, marginTop: 0 }}>
                      Cena po fotografiji: {racun.tarifa} rsd
                    </p>
                    <p style={{ marginBottom: 0, marginTop: 0 }}>
                      Ukupno: {racun.ukupno} rsd{' '}
                      {userInfo.preuzimanje === 'kurirska sluzba' && (
                        <i>+ poštarina</i>
                      )}
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <a className="modal-close waves-effect  btn-flat">Odustani</a>
              <button
                action="submit"
                name="action"
                className="modal-close waves-effect  btn-flat indigo darken-2 white-text"
              >
                Potvrdi
              </button>
            </div>
          </div>
        </form>

        {uploading && (
          <div className=" col s12 center-align">
            <Spinner />
          </div>
        )}

        {uploadedFiles.length > 5 && (
          <div className="row">
            <div
              className="col s12"
              style={{ padding: 30, overflowY: 'auto', height: 700 }}
            >
              <Gallery photos={uploadedFiles} />
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default FileUpload;
