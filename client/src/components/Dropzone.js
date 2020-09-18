import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import uploadIcon from '../download.png';

import resizeFiles from './../helpers/resizeFiles';

export default function Dropzone({
  setFilePreviews,
  setFiles,
  resizing,
  setResizing,
  setResizeProgress
}) {
  const [dragHover, setDragHover] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    noClick: resizing,
    noDrag: resizing,
    onDragEnter: () => {
      setDragHover(true);
    },
    onDragLeave: () => {
      setDragHover(false);
    },
    //maxSize: 10485760,
    onDrop: async acceptedFiles => {
      setDragHover(false);
      setFiles([]);
      setResizing(true);
      const resized = await resizeFiles(acceptedFiles, count =>
        setResizeProgress({ count: count, total: acceptedFiles.length })
      );
      setResizing(false);
      setFilePreviews(
        resized.map(file =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
      resized.forEach(file => (file.brojKomada = 1));
      setFiles(resized);
      //console.log(resized);
    }
  });

  return (
    <section>
      <div
        className="dropzone"
        style={{ borderColor: dragHover ? '#303030' : '#999999' }}
        {...getRootProps({ className: 'dropzone' })}
      >
        <input {...getInputProps()} />
        <img
          src={uploadIcon}
          alt="upload icon"
          style={{
            opacity: '0.3',
            height: '40px',
            width: '40px',
            marginTop: '24px'
          }}
        />
        {!dragHover ? (
          <h6 style={{ color: '#bdbdbd', margin: 3 }}>
            Izaberite ili privucite fajlove
          </h6>
        ) : (
          <h6 style={{ color: '#303030', margin: 3 }}>
            Izaberite ili privucite fajlove
          </h6>
        )}
      </div>
    </section>
  );
}
