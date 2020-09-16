import React, { useState } from 'react';

const GalleryUploadProgress = ({ fileUploadPercentage, files }) => {
  const [displayedFiles, setDisplayedFiles] = useState(25);

  const handleScroll = e => {
    const bottom =
      e.target.scrollHeight - Math.ceil(e.target.scrollTop) <=
      e.target.clientHeight + 50;
    if (bottom) {
      setDisplayedFiles(value => value + 20);
    }
  };
  return (
    <div
      className="col l6 m12 scroll1"
      style={{
        margin: 0,
        display: 'flex',
        flexWrap: 'wrap',
        overflowY: 'auto',
        maxHeight: 398,
        justifyContent: 'flex-start'
      }}
      onScroll={e => handleScroll(e)}
    >
      {fileUploadPercentage.map((file, index) => {
        if (index < displayedFiles)
          return (
            <div key={file.name} style={{ padding: 2, margin: 0 }}>
              <div style={{ zIndex: -100 }}>
                <img
                  src={files.find(item => item.name === file.name).preview}
                  style={{
                    width: 90,
                    height: 90,
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
                  marginTop: -30,
                  marginBottom: 3,
                  zIndex: 100
                }}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    paddingLeft: 5,
                    paddingRight: 5,
                    float: 'right'
                  }}
                >
                  {files.find(item => item.name === file.name).brojKomada}
                </span>
                <div
                  className="progress"
                  style={{ marginBottom: 0, marginTop: 0 }}
                >
                  <div
                    className="determinate"
                    style={{ width: `${file.value}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
      })}
    </div>
  );
};

export default GalleryUploadProgress;
