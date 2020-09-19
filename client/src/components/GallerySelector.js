import React, { Fragment, useState } from 'react';
import RemovePhotoModal from './RemovePhotoModal';

const GallerySelector = ({ files, setFiles }) => {
  //const [displayedFiles, setDisplayedFiles] = useState(24);

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
      <div
        className="row scroll1"
        style={{
          margin: 10,
          marginBottom: 30,
          display: 'flex',
          flexWrap: 'wrap',
          overflowY: 'auto',
          maxHeight: 450,
          justifyContent: 'flex-start'
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
                  src={file.preview}
                  loading="lazy"
                  style={{
                    width: 150,
                    height: 150,
                    objectFit: 'cover',
                    zIndex: -100
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
