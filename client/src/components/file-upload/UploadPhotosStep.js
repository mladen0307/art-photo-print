import React from 'react';
import SmartGallery from 'react-smart-gallery';

import Dropzone from '../Dropzone';
import Spinner from '../../layout/Spinner';
import splashImage from '../../image_upload.png';
import formatiImage from '../../print-sizes-min.png';

const UploadPhotosStep = ({
  files,
  setFiles,
  loading,
  setLoading,
  loadProgress,
  setLoadProgress,
  uploading,
  uploadFinishedSuccessfully,
  catalogFormats,
  catalogLoading,
  catalogError,
  onRetryCatalog,
  userInfo,
  setUserInfo,
  selectedFormat
}) => (
  <>
    <div className="row center-align">
      <p style={{ color: '#505050', fontFamily: 'Montserrat', fontSize: 18 }}>
        Pošaljite fotografije i preuzmite ih u radnji ili izaberite opciju slanja
        na kućnu adresu.
      </p>
    </div>
    <div className="row center-align">
      <img
        className="responsive-img"
        src={formatiImage}
        width="520px"
        height="auto"
        alt="Dostupni formati fotografija"
      />
    </div>

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
          onChange={event =>
            setUserInfo({ ...userInfo, format: event.target.value })
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
              onClick={onRetryCatalog}
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
                    {tier.maxPhotos === null ? '+' : `–${tier.maxPhotos}`}
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
        <div className="col s12" style={{ marginBottom: 10 }}>
          <SmartGallery
            rootStyle={{ margin: 'auto' }}
            images={files.map((file, index) =>
              index > 4 ? file.preview : file.fullRes
            )}
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
            alt="Pošaljite fotografije"
            height="320"
          />
        </div>
      )}
      {loading && (
        <div className="col s4 offset-s4 center-align" style={{ height: 320 }}>
          <br />
          <br />
          <br />
          <br />
          <Spinner />
          <div className="progress" style={{ marginBottom: 0 }}>
            <div
              className="determinate"
              style={{
                width: `${
                  loadProgress.total
                    ? Math.floor(
                        (loadProgress.count * 100) / loadProgress.total
                      )
                    : 0
                }%`
              }}
            />
          </div>
          <p style={{ color: 'grey' }}>
            <i>Učitavanje fajlova: </i>
            {loadProgress.count}/{loadProgress.total}
          </p>
        </div>
      )}
    </div>
  </>
);

export default UploadPhotosStep;
