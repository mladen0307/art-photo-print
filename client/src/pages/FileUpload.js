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

import M from 'materialize-css';

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
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ count: 0, total: 0 });
  const [catalogFormats, setCatalogFormats] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [catalogRequestId, setCatalogRequestId] = useState(0);

  const [userInfo, setUserInfo] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    adresa: '',
    format: '',
    preuzimanje: 'radnja centar'
  });

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    setCatalogLoading(true);
    setCatalogError('');

    axios
      .get('/api/v1/catalog', { cancelToken: cancelToken.token })
      .then(response => {
        const formats = response.data.data.catalog.formats.filter(
          format => format.enabled
        );
        if (formats.length === 0) {
          setCatalogFormats([]);
          setCatalogError('Trenutno nema dostupnih formata za poručivanje.');
          return;
        }

        setCatalogFormats(formats);
        setUserInfo(current => ({
          ...current,
          format: formats.some(format => format.name === current.format)
            ? current.format
            : formats[0].name
        }));
      })
      .catch(error => {
        if (axios.isCancel(error)) return;
        setCatalogFormats([]);
        setCatalogError(
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'Cenovnik nije moguće učitati. Proverite internet vezu i pokušajte ponovo.'
        );
      })
      .finally(() => {
        if (!cancelToken.token.reason) setCatalogLoading(false);
      });

    return () => cancelToken.cancel();
  }, [catalogRequestId]);

  const selectedFormat = catalogFormats.find(
    format => format.name === userInfo.format
  );
  const ukupnoKomada = files.reduce(
    (total, file) => total + file.brojKomada,
    0
  );
  const selectedTier =
    selectedFormat &&
    selectedFormat.quantityTiers.find(
      tier =>
        ukupnoKomada >= tier.minPhotos &&
        (tier.maxPhotos === null || ukupnoKomada <= tier.maxPhotos)
    );
  const racun = selectedTier
    ? {
        tarifa: selectedTier.price,
        ukupno: selectedTier.price * ukupnoKomada
      }
    : { tarifa: '', ukupno: '' };
  const hasValidQuote =
    Number.isSafeInteger(racun.tarifa) &&
    Number.isSafeInteger(racun.ukupno);

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
      ) &&
      selectedFormat &&
      hasValidQuote
    )
      setUserFieldsValid(true);
    else setUserFieldsValid(false);
  }, [userInfo, files, selectedFormat, hasValidQuote]);

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
  const OnSubmit = async e => {
    e.preventDefault();
    if (catalogLoading || catalogError || !selectedFormat || !hasValidQuote) {
      setResultMessage({
        status: 'fail',
        message: 'Cenovnik nije dostupan. Pokušajte ponovo kasnije.'
      });
      return;
    }
    setUploading(true);
    setResultMessage({ status: '', message: '' });
    setUploadCount(`0/${files.length}`);
    setUploadProgress(0);

    const filesArr = Object.values(files);
    let uploadId;
    const photos = [];

    for (let i = 0; i < filesArr.length; i++) {
      try {
        const file = await resizeFile(filesArr[i]);
        if (!uploadId) {
          const sessionResponse = await axios.post('/api/v1/uploads/session');
          uploadId = sessionResponse.data.data.uploadId;
        }

        const signatureResponse = await axios.post(
          '/api/v1/uploads/signature',
          {
            uploadId,
            fileName: file.name,
            contentType: file.type,
            size: file.size
          }
        );
        const { key, url } = signatureResponse.data.data;

        await axios.put(url, file, {
          headers: {
            'Content-Type': file.type
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
        });

        photos.push({
          r2Key: key,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          brojKomada: filesArr[i].brojKomada
        });
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
      await axios.post('/api/v1/orders', {
        ...userInfo,
        uploadId,
        photos
      }, {
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
              <div className="input-field col s12 m3">
                <p
                  className="right"
                  style={{
                    color: '#505050',
                    fontFamily: 'Montserrat',
                    fontSize: 18
                  }}
                >
                  Izaberite format:
                </p>
              </div>
              <div className="input-field col s12 m3">
                <select
                  value={userInfo.format}
                  disabled={catalogLoading || !!catalogError || !catalogFormats.length}
                  onChange={e =>
                    setUserInfo({ ...userInfo, format: e.target.value })
                  }
                >
                  {catalogFormats.map(format => (
                    <option key={format.name} value={format.name}>
                      {format.name}
                    </option>
                  ))}
                </select>
                <label>Format</label>
                {catalogLoading && <p>Učitavanje formata i cena...</p>}
                {catalogError && (
                  <p className="red-text">
                    {catalogError}{' '}
                    <button
                      type="button"
                      className="btn-flat red-text"
                      onClick={() =>
                        setCatalogRequestId(requestId => requestId + 1)
                      }
                    >
                      Pokušaj ponovo
                    </button>
                  </p>
                )}
              </div>
              {selectedFormat && (
                <div
                  className="col s12 m6"
                  style={{ overflowX: 'auto', paddingTop: 8 }}
                >
                  <table
                    className="striped centered"
                    style={{ fontSize: 13, width: 'auto', margin: 0 }}
                  >
                    <thead>
                      <tr>
                        {selectedFormat.quantityTiers.map((tier, index) => (
                          <th
                            key={`${selectedFormat.name}-tier-heading-${index}`}
                            style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}
                          >
                            {tier.minPhotos}
                            {tier.maxPhotos === null
                              ? '+'
                              : `–${tier.maxPhotos}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {selectedFormat.quantityTiers.map((tier, index) => (
                          <td
                            key={`${selectedFormat.name}-tier-price-${index}`}
                            style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}
                          >
                            {tier.price} RSD / kom
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
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
            <div className="col s6 m4">
              {files[0] && (
                <div className="card grey lighten-3">
                  <div className="card-content">
                    <p style={{ marginBottom: 0, marginTop: 0 }}>
                      Broj fotografija: {ukupnoKomada}
                    </p>
                    <p style={{ marginBottom: 0, marginTop: 0 }}>
                      Cena po fotografiji:{' '}
                      {racun.tarifa === '' ? 'nije dostupna' : `${racun.tarifa} rsd`}
                    </p>
                    <p style={{ marginBottom: 0, marginTop: 0 }}>
                      Ukupno:{' '}
                      {racun.ukupno === '' ? 'nije dostupno' : `${racun.ukupno} rsd`}{' '}
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
                    !files[0] ||
                    catalogLoading ||
                    catalogError ||
                    !selectedFormat ||
                    !hasValidQuote
                      ? 'disabled'
                      : ''
                  }`}
                  disabled={
                    !files[0] ||
                    catalogLoading ||
                    !!catalogError ||
                    !selectedFormat ||
                    !hasValidQuote
                  }
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
                      Cena po fotografiji:{' '}
                      {racun.tarifa === '' ? 'nije dostupna' : `${racun.tarifa} rsd`}
                    </p>
                    <p style={{ marginBottom: 0, marginTop: 0 }}>
                      Ukupno:{' '}
                      {racun.ukupno === '' ? 'nije dostupno' : `${racun.ukupno} rsd`}{' '}
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
    </Fragment>
  );
};

export default FileUpload;
