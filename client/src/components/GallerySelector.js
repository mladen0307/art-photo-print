import React, { Fragment, useState, useEffect } from 'react';
import RemovePhotoModal from './RemovePhotoModal';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const GallerySelector = ({ files, setFiles }) => {
  //const [displayedFiles, setDisplayedFiles] = useState(24);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxFileIndex, setLightboxFileIndex] = useState(null);

  const onKeyDown = e => {
    if (e.type === 'keydown' && isLightboxOpen) {
      if (e.key === 'ArrowUp') {
        incrementPhoto(e, files[lightboxFileIndex].name);
      }
      if (e.key === 'ArrowDown') {
        decrementPhoto(e, files[lightboxFileIndex].name);
      }
    }
  };

  const incrementPhoto = (e, name) => {
    e.preventDefault();
    const newFiles = files.map(file => {
      if (file.name === name) file.brojKomada++;
      return file;
    });
    setFiles(newFiles);
  };

  const decrementPhoto = (e, name) => {
    e.preventDefault();
    const newFiles = files.map(file => {
      if (file.name === name && file.brojKomada > 1) file.brojKomada--;
      return file;
    });
    setFiles(newFiles);
  };

  // Not needed since files are resized, also modal doesn't open sometimes with this
  // const handleScroll = e => {
  //   const bottom =
  //     e.target.scrollHeight - Math.ceil(e.target.scrollTop) <=
  //     e.target.clientHeight + 50;
  //   if (bottom) {
  //     setDisplayedFiles(value => value + 16);
  //   }
  // };

  const removePhoto = (e, index) => {
    e.preventDefault();
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    if (newFiles.length === 0) {
      setIsLightboxOpen(false);
    } else {
      setLightboxFileIndex(
        (lightboxFileIndex + newFiles.length - 1) % newFiles.length
      );
    }
  };

  return (
    <Fragment>
      <div className="row center-align" style={{ marginBottom: 5 }}>
        <p
          style={{
            color: '#787878',
            fontFamily: 'Mulish',
            fontSize: 16,
            margin: 0
          }}
        >
          Izaberite broj fotografija:
        </p>
      </div>
      {isLightboxOpen && (
        <Lightbox
          mainSrc={files[lightboxFileIndex].fullRes}
          nextSrc={files[(lightboxFileIndex + 1) % files.length].fullRes}
          prevSrc={
            files[(lightboxFileIndex + files.length - 1) % files.length].fullRes
          }
          onCloseRequest={() => setIsLightboxOpen(false)}
          onMovePrevRequest={() =>
            setLightboxFileIndex(
              (lightboxFileIndex + files.length - 1) % files.length
            )
          }
          onMoveNextRequest={() =>
            setLightboxFileIndex((lightboxFileIndex + 1) % files.length)
          }
          imageTitle={'        ' + files[lightboxFileIndex].name}
          enableZoom={false}
          onKeyEvent={e => onKeyDown(e)}
          imageCaption={
            <div>
              {files[lightboxFileIndex].brojKomada > 1 && (
                <button
                  className="btn-flat"
                  style={{ fontWeight: 'bold' }}
                  onClick={e =>
                    decrementPhoto(e, files[lightboxFileIndex].name)
                  }
                >
                  <i className="tiny material-icons white-text">remove</i>
                </button>
              )}
              {files[lightboxFileIndex].brojKomada === 1 && (
                <button
                  className="btn-flat modal-trigger"
                  style={{ fontWeight: 'bold' }}
                  data-target={`removePhotoModal${lightboxFileIndex}`}
                >
                  <i className="tiny material-icons white-text">remove</i>
                </button>
              )}

              {files[lightboxFileIndex].brojKomada}
              <button
                className="btn-flat tooltipped"
                data-position="top"
                data-tooltip="Prečice na tastaturi: 🡰 🡲 🡱 🡳  "
                style={{ fontWeight: 'bold' }}
                onClick={e => incrementPhoto(e, files[lightboxFileIndex].name)}
              >
                <i className="tiny material-icons white-text">add</i>
              </button>
            </div>
          }
        />
      )}
      <div
        className="row scroll1"
        style={{
          margin: 10,
          marginBottom: 30,
          display: 'flex',
          flexWrap: 'wrap',
          overflowY: 'auto',
          maxHeight: 450,
          justifyContent: 'flex-start',
          backgroundColor: '#f5f5f5'
        }}
        //onScroll={e => handleScroll(e)}
      >
        {files.map((file, index) => {
          //if (index < displayedFiles)
          return (
            <div key={file.name} style={{ padding: 8, margin: 0 }}>
              <RemovePhotoModal
                file={file}
                index={index}
                removePhoto={removePhoto}
              ></RemovePhotoModal>
              <div style={{ zIndex: -100 }}>
                <img
                  className="selectGalleryImage"
                  src={file.preview}
                  loading="lazy"
                  style={{
                    width: 150,
                    height: 150,
                    objectFit: 'cover',
                    zIndex: -100
                  }}
                  onClick={() => {
                    setIsLightboxOpen(true);
                    setLightboxFileIndex(index);
                  }}
                />
              </div>
              <div
                className="white-text"
                style={{
                  position: 'relative',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  marginTop: -42,
                  zIndex: 100
                }}
              >
                {file.brojKomada > 1 && (
                  <button
                    className="btn-flat "
                    style={{ fontWeight: 'bold', marginRight: 14 }}
                    onClick={e => decrementPhoto(e, file.name)}
                  >
                    <i className="tiny material-icons white-text">remove</i>
                  </button>
                )}
                {file.brojKomada === 1 && (
                  <button
                    className="btn-flat modal-trigger"
                    style={{ fontWeight: 'bold', marginRight: 14 }}
                    data-target={`removePhotoModal${index}`}
                  >
                    <i className="tiny material-icons white-text">remove</i>
                  </button>
                )}

                {file.brojKomada}
                <button
                  className="btn-flat"
                  style={{ fontWeight: 'bold', marginLeft: 14 }}
                  onClick={e => incrementPhoto(e, file.name)}
                >
                  <i className="tiny material-icons white-text">add</i>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};

export default GallerySelector;
