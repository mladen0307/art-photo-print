import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';

import UserInfoFields from './UserInfoFields';
import splashImage from '../image_upload.png';
import paralaxImage from '../paralax-image.jpg';

import SmartGallery from 'react-smart-gallery';
import Spinner from './Spinner';
import Dropzone from './Dropzone';

import GallerySelector from './GallerySelector';
import GalleryUploadProgress from './GalleryUploadProgress';
import CeneModal from './CeneModal';

import M from 'materialize-css';

import cene from './../helpers/cene';

export const FileUpload = () => {
  const [step, setStep] = useState(1);

  const [files, setFiles] = useState([]);
  const [fileUploadPercentage, setFileUploadPercentage] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadFinished, setUploadFinished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userFieldsValid, setUserFieldsValid] = useState(false);
  const [ukupnoKomada, setUkupnoKomada] = useState(0);
  const [resizing, setResizing] = useState(false);
  const [resizeProgress, setResizeProgress] = useState({ count: 0, total: 0 });

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
    if (files) {
      let ukupnoTemp = 0;
      files.forEach(file => {
        ukupnoTemp += file.brojKomada;
      });

      setUkupnoKomada(ukupnoTemp);

      let category = 0;
      if (ukupnoTemp >= 100) category = 1;
      if (ukupnoTemp >= 200) category = 2;
      if (ukupnoTemp >= 400) category = 3;

      setRacun({
        tarifa: cene[userInfo.format][category],
        ukupno: cene[userInfo.format][category] * ukupnoTemp
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

  const nextStep = e => {
    e.preventDefault();
    setStep(step => step + 1);
  };
  const prevStep = e => {
    e.preventDefault();
    if (step !== 1) setStep(step => step - 1);
  };
  const OnSubmit = async e => {
    e.preventDefault();
    setUploading(true);
    setSuccessMessage(null);

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

          res[i].data.brojKomada = filesArr[i].brojKomada;

          const newImage = {
            src: res[i].data.secure_url,
            width: res[i].data.width,
            height: res[i].data.height
          };
          setUploadedFiles(uploadedFiles => [...uploadedFiles, newImage]);
        } catch (err) {
          setUploadFinished(false);
          M.toast({ html: 'Došlo je do greške' });
          setSuccessMessage('Došlo je do greške, pokušajte ponovo');
          setUploading(false);
          console.log(err);
          return;
        }
      }
      try {
        let photos = res.map(res => ({
          secure_url: res.data.secure_url,
          public_id: res.data.public_id,
          brojKomada: res.data.brojKomada
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
        setSuccessMessage('Vaša porudžbenica je uspešno sačuvana');
        setUploading(false);
        setUploadFinished(true);
      } catch (err) {
        setUploadFinished(false);
        M.toast({ html: 'Došlo je do greške' });
        setSuccessMessage('Došlo je do greške, pokušajte ponovo');
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
          {step === 1 && (
            <Fragment>
              <div className="row">
                <div className="col s6 offset-s3 center-align">
                  {!uploading && !uploadFinished && (
                    <Dropzone
                      setFilePreviews={setFilePreviews}
                      setFiles={setFiles}
                      setResizing={setResizing}
                      setResizeProgress={setResizeProgress}
                    />
                  )}
                </div>
              </div>
              <div className="row" style={{ marginBottom: 0 }}>
                {files[0] && (
                  <div className="col s4 offset-s3">
                    <div className="center-align">
                      <SmartGallery
                        images={filePreviews.map(file => file.preview)}
                        width={320}
                        height={320}
                      />
                    </div>
                  </div>
                )}
                {!files[0] && !resizing && (
                  <div className="col s4 offset-s3">
                    <img
                      src={splashImage}
                      className="responsive-img"
                      alt="Splash image"
                    ></img>
                  </div>
                )}
                {resizing && (
                  <div className=" col s4 offset-s3 center-align">
                    <Spinner />
                    <div className="progress" style={{ marginBottom: 0 }}>
                      <div
                        className="determinate"
                        style={{
                          width: `${Math.floor(
                            (resizeProgress.count * 100) / resizeProgress.total
                          )}%`
                        }}
                      ></div>
                    </div>
                    <p style={{ color: 'grey' }}>
                      <i>Učitavanje fajlova: </i>
                      {resizeProgress.count}/{resizeProgress.total}
                    </p>
                  </div>
                )}
                <div className="col s2" style={{ marginTop: 10 }}>
                  <div className="input-field row">
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
                  <div className="input-field row">
                    <button
                      data-target="modal2"
                      className=" btn-flat indigo-text modal-trigger"
                    >
                      Cene formata
                    </button>
                  </div>
                </div>
              </div>
            </Fragment>
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
            <Fragment>
              <div className="row">
                <div className="col m6">
                  <UserInfoFields
                    userInfo={userInfo}
                    setUserInfo={setUserInfo}
                    uploadFinished={uploadFinished}
                    uploading={uploading}
                  />
                </div>

                <GalleryUploadProgress
                  fileUploadPercentage={fileUploadPercentage}
                  files={files}
                ></GalleryUploadProgress>
              </div>
            </Fragment>
          )}

          <div className="row">
            <div className="col s2 offset-s1" style={{ marginTop: 40 }}>
              {step !== 1 && !uploadFinished && !uploading && (
                <button className="btn-flat" onClick={e => prevStep(e)}>
                  <i class="material-icons left">arrow_back</i>Nazad
                </button>
              )}
            </div>
            <div className="col s4 offset-s2" style={{ color: 'grey' }}>
              {files[0] && (
                <blockquote>
                  <p style={{ marginBottom: 0, marginTop: 0 }}>
                    Broj fotografija: {ukupnoKomada}
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
              )}
            </div>

            <div className="col s3" style={{ marginTop: 35 }}>
              {step !== 3 && (
                <button
                  className={`btn btn-large ${!files[0] ? 'disabled' : ''}`}
                  onClick={e => nextStep(e)}
                >
                  <i className="material-icons right">arrow_forward</i>Dalje
                </button>
              )}
              {step === 3 && !uploading && !uploadFinished && (
                <button
                  className={`btn-large modal-trigger ${
                    !userFieldsValid ? 'disabled' : ''
                  }`}
                  data-target="modal1"
                >
                  Pošalji
                  <i className="material-icons right">send</i>
                </button>
              )}
            </div>
          </div>

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

          {successMessage && (
            <div className="col s12 center-align indigo-text">
              {' '}
              <i className="material-icons" style={{ verticalAlign: '-6px' }}>
                check
              </i>
              <i>{successMessage}</i>
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
                      Broj fotografija: {ukupnoKomada}
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
      </div>

      <CeneModal></CeneModal>
    </Fragment>
  );
};

export default FileUpload;
