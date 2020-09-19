import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import uploadIcon from '../download.png';

import generatePreviews from './../helpers/generatePreviews';

export default function Dropzone({
  //setFilePreviews,
  setFiles,
  loading,
  setLoading,
  setLoadProgress
}) {
  const [dragHover, setDragHover] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    noClick: loading,
    noDrag: loading,
    noKeyboard: loading,
    maxFiles: 3000,
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
      setLoading(true);
      const files = await generatePreviews(acceptedFiles, count =>
        setLoadProgress({ count: count, total: acceptedFiles.length })
      );
      setLoading(false);

      // setFilePreviews(
      //   files.map(file =>
      //     Object.assign(file, {

      //       preview: URL.createObjectURL(file.thumbnail)
      //     })
      //   )
      // );
      files.forEach(file => (file.brojKomada = 1));
      //console.log(files);
      setFiles(files);
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
