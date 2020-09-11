import React from 'react';
import { useDropzone } from 'react-dropzone';
import uploadIcon from '../download.png';

export default function Dropzone({ setFilePreviews, setFiles }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    maxSize: 10485760,
    onDrop: acceptedFiles => {
      setFilePreviews(
        acceptedFiles.map(file =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
      acceptedFiles.forEach(file => (file.brojKomada = 1));
      setFiles(acceptedFiles);
    }
  });

  return (
    <section>
      <div className="dropzone" {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <img
          src={uploadIcon}
          alt="upload icon"
          style={{
            opacity: '0.3',
            height: '40px',
            width: '40px',
            marginTop: '14px'
          }}
        />
        <h6 style={{ color: '#bdbdbd', margin: 3 }}>
          Izaberite ili privucite fajlove
        </h6>
        <p
          style={{
            color: '#bdbdbd',
            fontFamily: 'Mulish',
            marginTop: 0
          }}
        >
          (maksimalna veličina fajla je 10MB)
        </p>
      </div>
    </section>
  );
}
