import React, { Fragment, useState } from 'react';

const GallerySelector = ({ files, setFiles }) => {
  const [displayedFiles, setDisplayedFiles] = useState(24);

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

  const handleScroll = e => {
    const bottom =
      e.target.scrollHeight - Math.ceil(e.target.scrollTop) <=
      e.target.clientHeight + 50;
    if (bottom) {
      setDisplayedFiles(value => value + 16);
    }
  };

  return (
    <Fragment>
      <div
        className="row scroll1"
        style={{
          margin: 50,
          marginRight: 90,
          marginLeft: 200,
          display: 'flex',
          flexWrap: 'wrap',
          overflowY: 'auto',
          maxHeight: 400,
          justifyContent: 'flex-start'
        }}
        onScroll={e => handleScroll(e)}
      >
        {files.map((file, index) => {
          if (index < displayedFiles)
            return (
              <div key={file.name} style={{ padding: 8, margin: 0 }}>
                <div style={{ zIndex: -100 }}>
                  <img
                    src={file.preview}
                    style={{
                      width: 160,
                      height: 160,
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
                  <button
                    className="btn-flat "
                    style={{ fontWeight: 'bold', marginRight: 14 }}
                    onClick={e => decrementPhoto(e, file.name)}
                  >
                    <i className="tiny material-icons white-text">remove</i>
                  </button>
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
