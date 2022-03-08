import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';

import UserInfoFields from '../components/UserInfoFields';
import splashImage from '../image_upload.png';
import successImage from '../saved_success.png';
import banner from '../photoprintbanner.png';
import formatiImage from '../print-sizes-min.png';

import SmartGallery from 'react-smart-gallery';
import Spinner from '../layout/Spinner';
import Dropzone from '../components/Dropzone';
import resizeFile from '../helpers/resizeFile';

import GallerySelector from '../components/GallerySelector';
import GalleryUploadProgress from '../components/GalleryUploadProgress';
import CeneModal from '../components/CeneModal';

import M from 'materialize-css';

import cene from '../helpers/cene';

export const FileUpload = () => {
  const [step, setStep] = useState(1);

  const [files, setFiles] = useState([]);
  const [fileUploadPercentage, setFileUploadPercentage] = useState([]);
  const [resultMessage, setResultMessage] = useState({
    status: '',
    message: ''
  });
  const [uploadFinishedSuccessfully, setUploadFinishedSuccessfully] = useState(
    false
  );
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [userFieldsValid, setUserFieldsValid] = useState(false);
  const [ukupnoKomada, setUkupnoKomada] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ count: 0, total: 0 });

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

  //Might leak without this idk
  // const [filePreviews, setFilePreviews] = useState([]);
  // useEffect(
  //   () => () => {
  //     // Make sure to revoke the data uris to avoid memory leaks
  //     filePreviews.forEach(file => URL.revokeObjectURL(file.preview));
  //   },
  //   [filePreviews]
  // );

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
    setResultMessage({ status: '', message: '' });
    setUploadCount(`0/${files.length}`);
    setUploadProgress(0);

    const filesArr = Object.values(files);
    const timestamp = Date.now();
    const date = new Date()
      .toLocaleString('en-GB', { dateStyle: 'short' })
      .replaceAll('/', '.');
    const folder = `orders/${date}/${userInfo.ime}_${userInfo.prezime}_${userInfo.format}_${userInfo.telefon}_${userInfo.preuzimanje}_${timestamp}`;
    let resProm = [];
    let res = [];

    
    for (let i = 0; i < filesArr.length; i++) {
      try {
        const file = await resizeFile(filesArr[i]);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', `${folder}/x${file.brojKomada}`);
        formData.append('upload_preset', 'fotoart');

        resProm[i] = axios.post(
          'https://api.cloudinary.com/v1_1/mladen0307/image/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
              const newFileUploadPercentage = [...fileUploadPercentage];
              newFileUploadPercentage.forEach(element => {
                if (element.name === file.name) {
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
        res[i] = await resProm[i];        
        res[i].data.brojKomada = filesArr[i].brojKomada;
        setUploadCount(`${i + 1}/${filesArr.length}`);
        setUploadProgress(Math.round(((i + 1) * 100) / filesArr.length));
      } catch (err) {
        setUploadFinishedSuccessfully(false);
        M.toast({ html: 'Došlo je do greške' });
        setResultMessage({
          status: 'fail',
          message: 'Došlo je do greške, pokušajte ponovo'
        });
        setUploading(false);
        //console.log(err);
        return;
      }
    }
    try {
      let photos = res.map(res => ({
        url: res.data.url,
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
      formData.set('folder', folder);
      await axios.post('/api/v1/orders', formData, {
        withCredentials: true
      });

      M.toast({ html: 'Fotografije su sačuvane' });
      setResultMessage({
        status: 'success',
        message: `Vaša porudžbenica je uspešno sačuvana, dobićete email obaveštenje na adresi ${userInfo.email}`
      });
      setUploading(false);
      setUploadFinishedSuccessfully(true);
    } catch (err) {
      setUploadFinishedSuccessfully(false);
      M.toast({ html: 'Došlo je do greške' });
      setResultMessage({
        status: 'fail',
        message: 'Došlo je do greške, pokušajte ponovo'
      });
      setUploading(false);
      //console.log(err);
    }
    
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
      {step === 1 && (
        <div className="row center-align">
          <p
            style={{ color: '#505050', fontFamily: 'Montserrat', fontSize: 18 }}
          >
            Pošaljite fotografije I stižu Vam u roku od par dana na kućnu adresu.
          </p>
        </div>)}
        {step === 1 && (
        <div className="row center-align">
       
          {' '}
          <img
            className="responsive-img"
            src={formatiImage}
            width="520px"
            height="auto"
          />
        
        </div>)}

        <form onSubmit={OnSubmit}>
          {step === 1 && (
            <Fragment>              
            <div className="row" style={{ marginTop: 10 }}>
              <div className="input-field col s6">
              <p className="right"
            style={{ color: '#505050', fontFamily: 'Montserrat', fontSize: 18 }}
          >
            Izaberite format:
          </p>
              </div>
              <div className="input-field col s5 m3 l2">
                <select
                  defaultValue={userInfo.format}
                  onChange={e =>
                    setUserInfo({ ...userInfo, format: e.target.value })
                  }
                >
                  <option value="9x13">9x13</option>
                  {/* <option value="10x13,5">10x13,5</option> */}
                  <option value="10x15">10x15</option>
                  {/* <option value="11x15">11x15</option> */}
                  <option value="13x18">13x18</option>
                  {/* <option value="15x20">15x20</option> */}
                  <option value="15x21">15x21</option>
                  <option value="20x30">20x30</option>
                  {/* <option value="24x30">24x30</option> */}
                  {/* <option value="30x40">30x40</option> */}
                  {/* <option value="30x45">30x45</option> */}
                </select>
                <label>Format</label>
              </div>
                  {/* <div className="input-field col s6">
                    <button
                      data-target="modal2"
                      className=" btn-flat indigo-text modal-trigger"
                    >
                      Cene formata
                    </button>
                  </div> */}
            </div>

            <div className="row center-align">
              <div className="col s12 m10 l8 offset-m1 offset-l2">
                {!uploading && !uploadFinishedSuccessfully && (
                  <Dropzone
                    //setFilePreviews={setFilePreviews}
                    files={files}
                    setFiles={setFiles}
                    loading={loading}
                    setLoading={setLoading}
                    setLoadProgress={setLoadProgress}
                  />
                )}
              </div>
            </div>
              <div className="row" style={{ marginBottom: 0 }}>
                {files[0] && (
                  <div className="col s12" style={{marginBottom: 10}}>
                    <SmartGallery
                      rootStyle={{ margin: 'auto' }}
                      images={files.map((file, index) => {
                        if (index > 4) return file.preview;
                        else return file.fullRes;
                      })}
                      width={320}
                      height={320}
                    />
                  </div>
                )}
                {!files[0] && !loading && (
                  <div className="col m4 offset-m4 s8 offset-s2 center-align">
                    <img
                      src={splashImage}
                      className="responsive-img"
                      alt="Splash image"
                      height="320"
                    ></img>
                  </div>
                )}
                {loading && (
                  <div
                    className=" col s4 offset-s4 center-align"
                    style={{ height: 320 }}
                  >
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <Spinner />
                    <div className="progress" style={{ marginBottom: 0 }}>
                      <div
                        className="determinate"
                        style={{
                          width: `${Math.floor(
                            (loadProgress.count * 100) / loadProgress.total
                          )}%`
                        }}
                      ></div>
                    </div>
                    <p style={{ color: 'grey' }}>
                      <i>Učitavanje fajlova: </i>
                      {loadProgress.count}/{loadProgress.total}
                    </p>
                  </div>
                )}
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
                <div className="col l6 m12">
                  <UserInfoFields
                    userInfo={userInfo}
                    setUserInfo={setUserInfo}
                    uploadFinished={uploadFinishedSuccessfully}
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
            <div className="col s3 m4">
              {step !== 1 && !uploadFinishedSuccessfully && !uploading && (
                <button
                  className="btn btn-flat right"
                  style={{ marginTop: 44 }}               
                  onClick={e => prevStep(e)}
                >
                  <i className="material-icons left hide-on-med-and-down">
                    navigate_before
                  </i>
                 Nazad
                </button>
              )}
            </div>
            <div className="col s6 m4" style={{ color: 'grey' }}>
              {files[0] && (
                <div class="card indigo darken-2">
                  <div class="card-content white-text">
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
                    </div>
                </div>
              )}
            </div>

            <div className="col s3">
              {step !== 3 && (
                <button
                  className={`btn btn-large ${
                    !files[0] ? 'disabled' : ''
                  }`}
                  style={{ marginTop: 35 }}  
                  onClick={e => nextStep(e)}
                >
                   <i className="material-icons right hide-on-med-and-down">
                    navigate_next
                  </i>       
                Dalje
                </button>
              )}
              {step === 3 && !uploading && !uploadFinishedSuccessfully && (
                <button
                  className={`btn-large modal-trigger ${
                    !userFieldsValid ? 'disabled' : ''
                  }`}
                  data-target="modal1"
                  style={{ marginTop: 35 }}
                >
                  Pošalji
                  <i className="material-icons right hide-on-med-and-down">
                    send
                  </i>
                </button>
              )}
            </div>
          </div>

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

      <br></br>
      <br></br>
      <br></br>
      <CeneModal></CeneModal>
    </Fragment>
  );
};

export default FileUpload;
