import React, { Fragment } from 'react';

export const FilePicker = ({
  uploading,
  uploadFinished,
  setFilePreviews,
  setFiles,
  files,
  splashImage
}) => {
  return (
    <Fragment>
      <div className="row">
        <div className="col s8 offset-s2 center-align">
          {!uploading && !uploadFinished && (
            <Dropzone setFilePreviews={setFilePreviews} setFiles={setFiles} />
          )}
        </div>
      </div>

      <div className="row">
        {files[0] ? (
          <div className="center-align">
            <i style={{ color: 'grey' }}>ukupno fotografija: {files.length}</i>
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
    </Fragment>
  );
};
